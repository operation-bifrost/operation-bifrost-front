import { FaqCard } from "@/components/steins-gate/faq/faq-card";
import { FaqDecor } from "@/components/steins-gate/faq/faq-decor";
import { SectionHeading } from "@/components/steins-gate/ui/section-heading";
import { steinsGateContent } from "@/data/steins-gate-content";

export function Faq() {
  const { eyebrow, heading, items } = steinsGateContent.faq;

  return (
    <section id="faq" className="relative py-8 md:py-10 lg:py-12">
      <FaqDecor />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <SectionHeading heading={heading} eyebrow={eyebrow} />

        <div className="grid items-stretch gap-6 sm:grid-cols-2">
          {items.map((item, index) => (
            <FaqCard key={item.question} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
