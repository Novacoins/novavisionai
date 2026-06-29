import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

import img3 from "@/assets/carousel/carousel-3.png.asset.json";
import img4 from "@/assets/carousel/carousel-4.jpg.asset.json";
import img5 from "@/assets/carousel/carousel-5.png.asset.json";
import img6 from "@/assets/carousel/carousel-6.png.asset.json";

const SLIDES = [
  "https://i.postimg.cc/sXSVWhMz/IMG-20260629-202818-2.jpg",
  "https://i.postimg.cc/02jBHqCK/7addc46af04e63e7a92a1e8cc3a224cb.jpg",
  img3.url,
  img4.url,
  img5.url,
  img6.url,
];

export function AutoCarousel({ className }: { className?: string }) {
  const autoplay = useRef(Autoplay({ delay: 2800, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, dragFree: false, align: "center" }, [autoplay.current]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    onSelect();
  }, [embla]);

  const scrollTo = (i: number) => embla?.scrollTo(i);

  const handlePause = () => autoplay.current.stop();
  const handleResume = () => autoplay.current.play();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "relative w-full max-w-md mx-auto rounded-3xl overflow-hidden glass-card shadow-2xl",
          className,
        )}
        style={{ aspectRatio: "16 / 10" }}
        onPointerDown={handlePause}
        onPointerUp={handleResume}
        onPointerLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        <div ref={emblaRef} className="overflow-hidden h-full">
          <div className="flex h-full">
            {SLIDES.map((src, i) => (
              <div key={i} className="relative min-w-0 shrink-0 grow-0 basis-full h-full">
                <motion.img
                  src={src}
                  alt={`Slide ${i + 1}`}
                  loading="lazy"
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  initial={{ scale: 1.06, opacity: 0 }}
                  animate={selected === i ? { scale: 1, opacity: 1 } : { scale: 1.06, opacity: 0.7 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 bg-white/60",
                selected === i ? "w-6 bg-white shadow-md" : "w-1.5 hover:bg-white/80",
              )}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
      </motion.div>
    </AnimatePresence>
  );
}
