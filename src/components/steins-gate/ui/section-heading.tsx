import { DecryptedText } from "@/components/ui/decrypted-text";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  heading: string;
  eyebrow: string;
  className?: string;
}

export function SectionHeading({ heading, eyebrow, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-12 flex w-fit flex-col items-start md:mb-16", className)}>
      <h2 className="text-foreground text-3xl leading-tight font-bold md:text-4xl">
        <DecryptedText
          text={heading}
          animateOn="inViewHover"
          speed={50}
          sequential={true}
          className="text-foreground transition-all duration-300"
          characters="กขคฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ"
        />
      </h2>
      <span className="mt-1 block self-end">
        <DecryptedText
          text={eyebrow}
          animateOn="inViewHover"
          speed={50}
          sequential={true}
          className="text-primary font-mono text-sm tracking-wider"
          encryptedClassName="text-primary font-mono"
          characters="abcdefghijklmnopqrstuvwxyz$_#"
        />
      </span>
    </div>
  );
}
