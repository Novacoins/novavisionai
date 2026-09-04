import { createFileRoute } from "@tanstack/react-router";
import {
  Image,
  Wand2,
  Eraser,
  ImagePlus,
  ArrowUpRight,
  Smile,
  Brush,
  Wallpaper,
  Palette,
  FolderHeart,
} from "lucide-react";
import { HubGrid } from "@/components/HubGrid";

export const Route = createFileRoute("/_authenticated/image-studio")({ component: Page });

function Page() {
  return (
    <HubGrid
      title="AI Image Studio"
      subtitle="Generate, enhance and transform images"
      icon={<Image className="size-5 text-[color:var(--sky)]" />}
      tiles={[
        {
          label: "Image Generator",
          desc: "Text → image",
          icon: Wand2,
          color: "from-fuchsia-400 to-purple-500",
          soon: true,
        },
        { label: "Photo Enhancer", icon: Wand2, color: "from-sky-400 to-blue-500", soon: true },
        {
          label: "Background Remover",
          icon: Eraser,
          color: "from-rose-400 to-pink-500",
          soon: true,
        },
        {
          label: "Background Changer",
          icon: ImagePlus,
          color: "from-amber-400 to-orange-500",
          soon: true,
        },
        {
          label: "AI Upscaler",
          icon: ArrowUpRight,
          color: "from-emerald-400 to-green-500",
          soon: true,
        },
        { label: "Face Restoration", icon: Smile, color: "from-cyan-400 to-teal-500", soon: true },
        { label: "AI Art Styles", icon: Brush, color: "from-indigo-400 to-violet-500", soon: true },
        {
          label: "Wallpaper Generator",
          icon: Wallpaper,
          color: "from-pink-400 to-rose-500",
          soon: true,
        },
        { label: "Logo Creator", icon: Palette, color: "from-orange-400 to-red-500", soon: true },
        {
          to: "/favorites",
          label: "Saved to Gallery",
          icon: FolderHeart,
          color: "from-yellow-400 to-amber-500",
        },
      ]}
    />
  );
}
