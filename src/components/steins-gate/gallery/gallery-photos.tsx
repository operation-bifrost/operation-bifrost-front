import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { LuX, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import type { GalleryPhoto } from "@/data/steins-gate";
import { cn } from "@/lib/utils";

interface GalleryPhotosProps {
  photos: readonly GalleryPhoto[];
}

export function GalleryPhotos({ photos }: GalleryPhotosProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Two-phase mount: `mounted` keeps the DOM alive, `visible` drives the CSS transition
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Build rows of 2
  const rows: GalleryPhoto[][] = [];
  for (let i = 0; i < photos.length; i += 2) {
    rows.push(photos.slice(i, i + 2) as GalleryPhoto[]);
  }

  // --- Open: mount → next frame → make visible ---
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setMounted(true);
    // trigger enter animation on next frame so the initial state (opacity-0) is painted first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  // --- Close: hide → wait for transition → unmount ---
  const closeLightbox = useCallback(() => {
    setVisible(false);
    // unmount after the CSS transition finishes
  }, []);

  const handleOverlayTransitionEnd = useCallback(() => {
    if (!visible) {
      setMounted(false);
      setLightboxIndex(null);
    }
  }, [visible]);

  // --- Navigate: instant swap ---
  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % photos.length));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + photos.length) % photos.length));
  }, [photos.length]);

  // Lock body scroll & listen for Escape / arrow keys
  useEffect(() => {
    if (!mounted) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [mounted, closeLightbox, goNext, goPrev]);

  // Flatten index calculation
  let flatIndex = 0;

  return (
    <>
      <div className="flex flex-col gap-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            {row.map((photo) => {
              const currentIndex = flatIndex++;
              return (
                <button
                  key={`${rowIdx}-${currentIndex}`}
                  type="button"
                  onClick={() => openLightbox(currentIndex)}
                  className="group border-border/30 focus-visible:outline-primary relative flex-1 cursor-pointer overflow-hidden border"
                  aria-label={`ดูภาพ: ${photo.alt}`}
                >
                  <img
                    src={photo.thumbSrc}
                    srcSet={`${photo.thumbSrc} 640w, ${photo.src} 1280w`}
                    sizes="(min-width: 1024px) 45vw, 48vw"
                    alt={photo.alt}
                    width={1280}
                    height={720}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="bg-background/0 group-hover:bg-background/20 absolute inset-0 transition-colors duration-300" />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lightbox overlay — portalled to body to escape isolate stacking context */}
      {mounted &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-md",
              "transition-all duration-300 ease-out",
              visible ? "bg-background/70 opacity-100" : "bg-background/0 opacity-0",
            )}
            onClick={closeLightbox}
            onTransitionEnd={handleOverlayTransitionEnd}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeLightbox();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="แกลเลอรีรูปภาพ"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className={cn(
                "text-foreground/70 hover:text-foreground absolute top-6 right-6 z-10 cursor-pointer",
                "transition-all duration-300",
                visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
              )}
              aria-label="ปิด"
            >
              <LuX className="size-8" />
            </button>

            {/* Previous */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className={cn(
                "absolute left-4 z-10 flex size-12 cursor-pointer items-center justify-center rounded-full",
                "border-border/50 bg-secondary/60 text-foreground/70 border backdrop-blur-sm",
                "hover:border-primary/50 hover:text-primary transition-all duration-300",
                visible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
                "md:left-8",
              )}
              aria-label="ภาพก่อนหน้า"
            >
              <LuChevronLeft className="size-6" />
            </button>

            {/* Image — instant swap, only animates on enter/exit */}
            <img
              src={photos[lightboxIndex!].src}
              alt={photos[lightboxIndex!].alt}
              className={cn(
                "max-h-[85vh] max-w-[90vw] object-contain",
                "transition-all duration-300 ease-out",
                visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
              )}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className={cn(
                "absolute right-4 z-10 flex size-12 cursor-pointer items-center justify-center rounded-full",
                "border-border/50 bg-secondary/60 text-foreground/70 border backdrop-blur-sm",
                "hover:border-primary/50 hover:text-primary transition-all duration-300",
                visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                "md:right-8",
              )}
              aria-label="ภาพถัดไป"
            >
              <LuChevronRight className="size-6" />
            </button>

            {/* Counter */}
            <span
              className={cn(
                "text-muted-foreground absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm",
                "transition-all duration-300",
                visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              {lightboxIndex! + 1} / {photos.length}
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}
