import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Sparkles, Loader2 } from "lucide-react";
import { generateMealPlan } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/meal-planner")({
  component: MealPlanner,
});

type Meal = {
  meal_type: string;
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  calories: number;
  nutrition: { protein_g: number; carbs_g: number; fat_g: number; highlights: string };
};

const GOALS = ["stay healthy", "lose weight", "gain weight", "build muscle", "more energy"];
const DIETS = ["balanced", "vegetarian", "vegan", "keto", "low carb", "mediterranean"];

function MealPlanner() {
  const { user } = useAuth();
  const [goal, setGoal] = useState("stay healthy");
  const [diet, setDiet] = useState("balanced");
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [tip, setTip] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("dietary_goal,diet_preference").eq("id", user.id).single()
      .then(({ data }) => {
        if (data?.dietary_goal) setGoal(data.dietary_goal);
        if (data?.diet_preference) setDiet(data.diet_preference);
      });
  }, [user]);

  async function generate() {
    setLoading(true);
    try {
      const res = await generateMealPlan({
        data: {
          goal,
          diet,
          availableIngredients: ingredients ? ingredients.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        },
      });
      setMeals(res.meals);
      setTip(res.tip);
      if (user) {
        const today = new Date().toISOString().slice(0, 10);
        await supabase.from("meal_plans").delete().eq("user_id", user.id).eq("plan_date", today);
        await supabase.from("meal_plans").insert(
          res.meals.map((m) => ({
            user_id: user.id,
            plan_date: today,
            meal_type: m.meal_type,
            name: m.name,
            description: m.description,
            ingredients: m.ingredients as never,
            steps: m.steps as never,
            calories: m.calories,
            nutrition: m.nutrition as never,
          })),
        );
      }
      toast.success("Meal plan generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate meal plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 pt-3 pb-6 max-w-md mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Utensils className="size-5 text-primary" /> Meal Planner
        </h1>
        <p className="text-sm text-muted-foreground mt-1">AI nutritionist for your day.</p>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div>
          <Label className="text-xs">Goal</Label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{GOALS.map((g) => <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Diet preference</Label>
          <Select value={diet} onValueChange={setDiet}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{DIETS.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Available ingredients (optional)</Label>
          <Input placeholder="e.g. eggs, spinach, oats" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
        </div>
        <Button onClick={generate} disabled={loading} className="w-full hero-gradient text-primary-foreground font-semibold">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <><Sparkles className="size-4 mr-2" /> Generate today's plan</>}
        </Button>
      </div>

      {tip && (
        <div className="glass-card p-4 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-1 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" /> Nutritionist's tip
          </div>
          <p className="text-sm">{tip}</p>
        </div>
      )}

      {loading && !meals && (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      )}

      {meals?.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-primary font-semibold">{m.meal_type}</div>
              <h3 className="text-lg font-bold leading-tight mt-0.5">{m.name}</h3>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold">{m.calories}</div>
              <div className="text-[10px] text-muted-foreground">kcal</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{m.description}</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-muted p-2"><div className="font-bold">{m.nutrition?.protein_g ?? 0}g</div><div className="text-muted-foreground">protein</div></div>
            <div className="rounded-lg bg-muted p-2"><div className="font-bold">{m.nutrition?.carbs_g ?? 0}g</div><div className="text-muted-foreground">carbs</div></div>
            <div className="rounded-lg bg-muted p-2"><div className="font-bold">{m.nutrition?.fat_g ?? 0}g</div><div className="text-muted-foreground">fat</div></div>
          </div>
          {m.ingredients?.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1">Ingredients</div>
              <div className="flex flex-wrap gap-1.5">
                {m.ingredients.map((ing, j) => (
                  <span key={j} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{ing}</span>
                ))}
              </div>
            </div>
          )}
          {m.steps?.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1">Preparation</div>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                {m.steps.map((s, j) => <li key={j}>{s}</li>)}
              </ol>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
