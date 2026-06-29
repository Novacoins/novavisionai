import { ChevronLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else router.navigate({ to: "/" });
  };

  return (
    <button
      onClick={goBack}
      className="group inline-flex items-center gap-1.5 mb-3 pl-1.5 pr-3 py-1.5 rounded-full
                 bg-[oklch(0.78_0.13_235_/_0.10)] border border-[oklch(0.78_0.13_235_/_0.35)]
                 text-[color:var(--sky-soft)] font-medium text-sm
                 transition-all duration-300 hover:bg-[oklch(0.78_0.13_235_/_0.18)]
                 hover:-translate-x-0.5 active:scale-95"
      style={{ animation: "back-pulse 2.8s ease-in-out infinite" }}
      aria-label={label}
    >
      <span className="size-6 grid place-items-center rounded-full bg-[oklch(0.78_0.13_235_/_0.20)] group-hover:bg-[oklch(0.78_0.13_235_/_0.30)] transition-colors">
        <ChevronLeft className="size-4" />
      </span>
      {label}
    </button>
  );
}
