import { GalleryDecor } from "@/components/steins-gate/gallery/gallery-decor";
import { GalleryVideos } from "@/components/steins-gate/gallery/gallery-videos";
import { GalleryPhotos } from "@/components/steins-gate/gallery/gallery-photos";
import { SectionHeading } from "@/components/steins-gate/ui/section-heading";
import { steinsGateContent } from "@/data/steins-gate-content";

export function Gallery() {
  const { eyebrow, heading, videos, photos } = steinsGateContent.gallery;

  return (
    <section id="gallery" className="bg-background relative isolate py-8 md:py-10 lg:py-12">
      <GalleryDecor />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <SectionHeading heading={heading} eyebrow={eyebrow} />

        {/* Split layout: videos left, photos right */}
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <div className="lg:w-[35%] lg:shrink-0">
            <GalleryVideos videos={videos} />
          </div>
          <div className="lg:flex-1">
            <GalleryPhotos photos={photos} />
          </div>
        </div>
      </div>
    </section>
  );
}
