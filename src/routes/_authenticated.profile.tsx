import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Camera, Save, User as UserIcon, Mail, MapPin, Calendar, ScanLine, Heart, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AutoCarousel } from "@/components/AutoCarousel";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    username: "",
    country: "",
    dietary_goal: "",
    diet_preference: "",
    avatar_url: "" as string | null,
  });
  const [stats, setStats] = useState({ total: 0, favorites: 0, collections: 0 });
  const [joined, setJoined] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile({
          display_name: data.display_name ?? "",
          username: data.username ?? "",
          country: data.country ?? "",
          dietary_goal: data.dietary_goal ?? "stay healthy",
          diet_preference: data.diet_preference ?? "balanced",
          avatar_url: data.avatar_url,
        });
        setJoined(data.created_at);
      }
      const [{ count: total }, { count: favorites }] = await Promise.all([
        supabase.from("scans").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("scans").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_favorite", true),
      ]);
      setStats({ total: total ?? 0, favorites: favorites ?? 0, collections: 0 });
      setLoading(false);
    })();
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("profile.saved"));
  }

  async function uploadAvatar(file: File) {
    if (!user) return;
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("scan-images").upload(path, file);
    if (error) return toast.error(error.message);
    const { data } = await supabase.storage.from("scan-images").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) {
      setProfile((p) => ({ ...p, avatar_url: data.signedUrl }));
      await supabase.from("profiles").update({ avatar_url: data.signedUrl }).eq("id", user.id);
      toast.success("Photo updated");
    }
  }

  if (loading) return <div className="p-4 space-y-3"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;

  return (
    <div className="px-4 pt-3 pb-6 max-w-md mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 text-center">
        <div className="relative w-24 h-24 mx-auto">
          <div className="w-24 h-24 rounded-full hero-gradient grid place-items-center overflow-hidden glow">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="size-10 text-primary-foreground" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 size-8 rounded-full bg-background border border-border grid place-items-center cursor-pointer hover:bg-accent">
            <Camera className="size-4" />
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          </label>
        </div>
        <h2 className="mt-3 text-lg font-bold">{profile.display_name || "Add your name"}</h2>
        <p className="text-xs text-muted-foreground">@{profile.username || user?.email?.split("@")[0]}</p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { icon: ScanLine, label: "Scans", value: stats.total },
            { icon: Heart, label: "Favorites", value: stats.favorites },
            { icon: Folder, label: "Collections", value: stats.collections },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-muted p-3">
              <s.icon className="size-4 text-primary mx-auto" />
              <div className="text-lg font-bold mt-1">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="glass-card p-4 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" /> {user?.email}</div>
        {joined && <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="size-4" /> Joined {new Date(joined).toLocaleDateString()}</div>}
        {profile.country && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4" /> {profile.country}</div>}
      </div>

      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Edit profile</h3>
        <div><Label className="text-xs">Display name</Label><Input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} /></div>
        <div><Label className="text-xs">Username</Label><Input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} /></div>
        <div><Label className="text-xs">Country</Label><Input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} /></div>
        <div>
          <Label className="text-xs">Dietary goal</Label>
          <Select value={profile.dietary_goal} onValueChange={(v) => setProfile({ ...profile, dietary_goal: v })}>
            <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
            <SelectContent>
              {["stay healthy", "lose weight", "gain weight", "build muscle", "more energy"].map((g) => (
                <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Diet preference</Label>
          <Select value={profile.diet_preference} onValueChange={(v) => setProfile({ ...profile, diet_preference: v })}>
            <SelectTrigger><SelectValue placeholder="Select diet" /></SelectTrigger>
            <SelectContent>
              {["balanced", "vegetarian", "vegan", "keto", "low carb", "mediterranean"].map((d) => (
                <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={save} disabled={saving} className="w-full hero-gradient text-primary-foreground font-semibold">
          <Save className="size-4 mr-2" /> {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
