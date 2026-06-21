import type { ReactNode } from "react";
import { CreditPerson } from "@/components/steins-gate/credits/credit-person";
import { CreditsDecor } from "@/components/steins-gate/credits/credits-decor";
import { SectionHeading } from "@/components/steins-gate/ui/section-heading";
import { steinsGateContent } from "@/data/steins-gate";
import { cn } from "@/lib/utils";

interface GroupHeadingProps {
  title: string;
  className?: string;
}

/** Centered group title with a thin amber rule beneath. */
function GroupHeading({ title, className }: GroupHeadingProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2.5", className)}>
      <h3 className="text-foreground text-center text-2xl font-bold md:text-3xl">{title}</h3>
      <span aria-hidden="true" className="bg-primary/60 h-px w-10" />
    </div>
  );
}

interface CreditGroupProps {
  title: string;
  children: ReactNode;
}

/** A titled credit block: centered heading, thin amber rule, then its roster. */
function CreditGroup({ title, children }: CreditGroupProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <GroupHeading title={title} />
      <div className="w-full">{children}</div>
    </div>
  );
}

export function Credits() {
  const { eyebrow, heading, labMembers, partners, specialThanks, volunteers } =
    steinsGateContent.credits;

  return (
    <section id="credits" className="relative py-8 md:py-10 lg:py-12">
      <CreditsDecor />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <SectionHeading heading={heading} eyebrow={eyebrow} />

        {/* Left column gets a bit more width than the volunteer list so longer
            member names (+ inline icons) stay on a single line. */}
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-12">
            {/* Lab members and partners share ONE grid so their two columns line
                up identically at every breakpoint; the headings span both columns. */}
            <div className="mx-auto grid w-fit gap-x-12 gap-y-7 sm:grid-cols-2">
              <GroupHeading title={labMembers.title} className="sm:col-span-2" />
              {labMembers.members.map((person) => (
                <CreditPerson key={person.name} person={person} />
              ))}

              <GroupHeading title={partners.title} className="pt-5 sm:col-span-2" />
              {partners.members.map((person) => (
                <CreditPerson key={person.name} person={person} />
              ))}
            </div>

            <CreditGroup title={specialThanks.title}>
              <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-center">
                {specialThanks.names.map((name) => (
                  <li key={name} className="text-foreground font-medium">
                    {name}
                  </li>
                ))}
              </ul>
            </CreditGroup>
          </div>

          {/* Right column — volunteer translators. self-center keeps this block
              vertically centered against the taller left column at lg+. */}
          <div className="lg:self-center">
            <CreditGroup title={volunteers.title}>
              <ul className="mx-auto grid w-fit grid-cols-2 gap-x-12 gap-y-3 text-left">
                {volunteers.names.map((name) => (
                  <li key={name} className="text-foreground font-medium">
                    {name}
                  </li>
                ))}
              </ul>
            </CreditGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
