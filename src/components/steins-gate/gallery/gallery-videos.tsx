import { useState } from "react";
import { LuPlay } from "react-icons/lu";
import type { GalleryVideo } from "@/data/steins-gate-content";
import { cn } from "@/lib/utils";

interface GalleryVideosProps {
  videos: readonly GalleryVideo[];
}

export function GalleryVideos({ videos }: GalleryVideosProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {videos.map((video, index) => {
        const isPlaying = activeIndex === index;

        return (
          <div key={index} className="group border-border/40 relative overflow-hidden border">
            {isPlaying ? (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 size-full"
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className="relative block w-full cursor-pointer"
                aria-label={`เล่นวิดีโอ: ${video.title}`}
              >
                {/* YouTube thumbnail */}
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className="from-background/90 via-background/30 absolute inset-0 bg-gradient-to-t to-transparent" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      "border-primary/60 bg-background/70 flex size-14 items-center justify-center rounded-full border-2 backdrop-blur-sm",
                      "group-hover:border-primary group-hover:bg-background/90 transition-all duration-300 group-hover:scale-110",
                      "group-hover:shadow-[0_0_20px_rgba(251,192,0,0.3)]",
                    )}
                  >
                    <LuPlay className="text-primary ml-0.5 size-6" />
                  </div>
                </div>

                {/* Video info overlay */}
                <div className="absolute right-0 bottom-0 left-0 p-3 text-start">
                  <p className="text-foreground line-clamp-1 text-sm leading-snug font-medium">
                    {video.title}
                  </p>
                  {video.channel && (
                    <p className="text-muted-foreground mt-0.5 text-xs">{video.channel}</p>
                  )}
                </div>

                {/* Duration badge */}
                {video.duration && (
                  <span className="bg-background/80 text-foreground absolute top-2 right-2 px-1.5 py-0.5 font-mono text-[10px] backdrop-blur-sm">
                    {video.duration}
                  </span>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
