import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Camera,
  Save,
  User as UserIcon,
  Mail,
  MapPin,
  Calendar,
  ScanLine,
  Heart,
  Star,
  Award,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AutoCarousel } from "@/components/AutoCarousel";
import { awardPoints, todayKey } from "@/lib/points";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

const INTERESTS = [
  "Artificial Intelligence",
  "Programming",
  "Business",
  "Marketing",
  "English",
  "Productivity",
  "Graphic Design",
  "Cybersecurity",
  "Finance",
  "Photography",
  "Cooking",
  "Fitness",
  "Travel",
  "Science",
];

type Achievement = {
  key: string;
  label: string;
  desc: string;
  unlocked: boolean;
};

function buildAchievements(stats: {
  scans: number;
  favorites: number;
  points: number;
}): Achievement[] {
  return [
    { key: "starter", label: "Starter", desc: "Joined Nova Vision AI", unlocked: true },
    {
      key: "first_scan",
      label: "First Scan",
      desc: "Completed 1 scan",
      unlocked: stats.scans >= 1,
    },
    { key: "scan_10", label: "Explorer", desc: "Completed 10 scans", unlocked: stats.scans >= 10 },
    {
      key: "scan_50",
      label: "Scanner Pro",
      desc: "Completed 50 scans",
      unlocked: stats.scans >= 50,
    },
    { key: "fav_5", label: "Curator", desc: "Saved 5 favorites", unlocked: stats.favorites >= 5 },
    {
      key: "pt_500",
      label: "Rising Star",
      desc: "Earned 500 AI Points",
      unlocked: stats.points >= 500,
    },
    {
      key: "pt_1000",
      label: "AI Master",
      desc: "Earned 1,000 AI Points",
      unlocked: stats.points >= 1000,
    },
  ];
}

function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    username: "",
    country: "",
    avatar_url: "" as string | null,
    ai_interests: [] as string[],
  });
  const [stats, setStats] = useState({ scans: 0, favorites: 0, points: 0 });
  const [joined, setJoined] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Award daily login (idempotent via dedupe key)
      const newTotal = await awardPoints("daily_login", 5, todayKey(`login:${user.id}`));

      const { data } = await supabase
        .from("profiles")
        .select("display_name, username, country, avatar_url, ai_points, ai_interests, created_at")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          display_name: data.display_name ?? "",
          username: data.username ?? "",
          country: data.country ?? "",
          avatar_url: data.avatar_url,
          ai_interests: (data.ai_interests as string[] | null) ?? [],
        });
        setJoined(data.created_at);
      }

      const [{ count: total }, { count: favorites }] = await Promise.all([
        supabase.from("scans").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase
          .from("scans")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_favorite", true),
      ]);

      const points = newTotal ?? data?.ai_points ?? 100;

      setStats({ scans: total ?? 0, favorites: favorites ?? 0, points });
      setLoading(false);
    })();
  }, [user]);

  const achievements = useMemo(() => buildAchievements(stats), [stats]);

  function toggleInterest(name: string) {
    setProfile((p) => {
      const has = p.ai_interests.includes(name);
      return {
        ...p,
        ai_interests: has ? p.ai_interests.filter((x) => x !== name) : [...p.ai_interests, name],
      };
    });
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        username: profile.username,
        country: profile.country,
        ai_interests: profile.ai_interests,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("profile.saved"));
  }

  async function uploadAvatar(file: File) {
    if (!user) return;
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("scan-images").upload(path, file);
    if (error) return toast.error(error.message);
    const { data } = await supabase.storage
      .from("scan-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) {
      setProfile((p) => ({ ...p, avatar_url: data.signedUrl }));
      await supabase.from("profiles").update({ avatar_url: data.signedUrl }).eq("id", user.id);
      toast.success(t("profile.photoUpdated"));
    }
  }

  if (loading)
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );

  return (
    <div className="px-4 pt-3 pb-6 max-w-md mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 text-center"
      >
        <div className="relative w-24 h-24 mx-auto">
          <div className="w-24 h-24 rounded-full hero-gradient grid place-items-center overflow-hidden glow">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="User profile avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="size-10 text-primary-foreground" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 size-8 rounded-full bg-background border border-border grid place-items-center cursor-pointer hover:bg-accent">
            <Camera className="size-4" />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
            />
          </label>
        </div>
        <h2 className="mt-3 text-lg font-bold">{profile.display_name || t("profile.addName")}</h2>
        <p className="text-xs text-muted-foreground">
          @{profile.username || user?.email?.split("@")[0]}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-xl bg-muted p-3">
            <ScanLine className="size-4 text-primary mx-auto" />
            <div className="text-lg font-bold mt-1">{stats.scans}</div>
            <div className="text-[10px] text-muted-foreground">Total Scans</div>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <Heart className="size-4 text-primary mx-auto" />
            <div className="text-lg font-bold mt-1">{stats.favorites}</div>
            <div className="text-[10px] text-muted-foreground">Favorites</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 p-3 border border-amber-500/30">
            <Star className="size-4 text-amber-500 mx-auto fill-amber-500" />
            <div className="text-lg font-bold mt-1">{stats.points.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">AI Points</div>
          </div>
        </div>
      </motion.div>

      <div className="glass-card p-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="size-4" /> {user?.email}
        </div>
        {joined && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" /> {t("profile.joined")}{" "}
            {new Date(joined).toLocaleDateString()}
          </div>
        )}
        {profile.country && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" /> {profile.country}
          </div>
        )}
      </div>

      {/* AI Interests */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Interests</h3>
          {profile.ai_interests.length > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">
              {profile.ai_interests.length} selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((name) => {
            const on = profile.ai_interests.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleInterest(name)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  on
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {on && <Check className="size-3 inline mr-1" />}
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Achievements</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {achievements.filter((a) => a.unlocked).length}/{achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a) => (
            <div
              key={a.key}
              className={`rounded-xl p-3 text-center border ${
                a.unlocked
                  ? "bg-gradient-to-br from-amber-400/15 to-orange-500/15 border-amber-500/40"
                  : "bg-muted/50 border-border opacity-50"
              }`}
              title={a.desc}
            >
              <Award
                className={`size-6 mx-auto ${a.unlocked ? "text-amber-500" : "text-muted-foreground"}`}
              />
              <div className="text-[11px] font-semibold mt-1 leading-tight">{a.label}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">{t("profile.edit")}</h3>
        <div>
          <Label className="text-xs">{t("profile.displayName")}</Label>
          <Input
            value={profile.display_name}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">{t("profile.username")}</Label>
          <Input
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">{t("profile.country")}</Label>
          <Input
            value={profile.country}
            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
          />
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="w-full hero-gradient text-primary-foreground font-semibold"
        >
          <Save className="size-4 mr-2" /> {saving ? t("profile.saving") : t("profile.save")}
        </Button>
      </div>

      <section className="pt-2">
        <AutoCarousel />
      </section>
    </div>
  );
}
