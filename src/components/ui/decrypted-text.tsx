/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";

interface DecryptedTextProps extends HTMLMotionProps<"span"> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: "view" | "hover" | "inViewHover" | "click";
  clickMode?: "once" | "toggle";
}

type Direction = "forward" | "reverse";

export function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "once",
  ...props
}: DecryptedTextProps) {
  const originalGraphemes = useMemo(() => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(segmenter.segment(text)).map((s) => s.segment);
    }
    return Array.from(text);
  }, [text]);

  const [displayText, setDisplayText] = useState<string[]>(originalGraphemes);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [isDecrypted, setIsDecrypted] = useState<boolean>(animateOn !== "click");
  const [direction, setDirection] = useState<Direction>("forward");

  const containerRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo<string[]>(() => {
    return useOriginalCharsOnly
      ? Array.from(new Set(originalGraphemes)).filter((char) => char !== " ")
      : characters.split("");
  }, [useOriginalCharsOnly, originalGraphemes, characters]);

  const shuffleText = useCallback(
    (graphemes: string[], currentRevealed: Set<number>) => {
      return graphemes.map((char, i) => {
        if (char === " ") return " ";
        if (currentRevealed.has(i)) return char;
        return availableChars[Math.floor(Math.random() * availableChars.length)];
      });
    },
    [availableChars],
  );

  const computeOrder = useCallback(
    (len: number): number[] => {
      const order: number[] = [];
      if (len <= 0) return order;
      if (revealDirection === "start") {
        for (let i = 0; i < len; i++) order.push(i);
        return order;
      }
      if (revealDirection === "end") {
        for (let i = len - 1; i >= 0; i--) order.push(i);
        return order;
      }
      // center
      const middle = Math.floor(len / 2);
      let offset = 0;
      while (order.length < len) {
        if (offset % 2 === 0) {
          const idx = middle + offset / 2;
          if (idx >= 0 && idx < len) order.push(idx);
        } else {
          const idx = middle - Math.ceil(offset / 2);
          if (idx >= 0 && idx < len) order.push(idx);
        }
        offset++;
      }
      return order.slice(0, len);
    },
    [revealDirection],
  );

  const fillAllIndices = useCallback((): Set<number> => {
    const s = new Set<number>();
    for (let i = 0; i < originalGraphemes.length; i++) s.add(i);
    return s;
  }, [originalGraphemes]);

  const removeRandomIndices = useCallback((set: Set<number>, count: number): Set<number> => {
    const arr = Array.from(set);
    for (let i = 0; i < count && arr.length > 0; i++) {
      const idx = Math.floor(Math.random() * arr.length);
      arr.splice(idx, 1);
    }
    return new Set(arr);
  }, []);

  const encryptInstantly = useCallback(() => {
    const emptySet = new Set<number>();
    setRevealedIndices(emptySet);
    setDisplayText(shuffleText(originalGraphemes, emptySet));
    setIsDecrypted(false);
  }, [originalGraphemes, shuffleText]);

  const triggerDecrypt = useCallback(() => {
    if (sequential) {
      orderRef.current = computeOrder(originalGraphemes.length);
      pointerRef.current = 0;
      setRevealedIndices(new Set());
    } else {
      setRevealedIndices(new Set());
    }
    setDirection("forward");
    setIsAnimating(true);
  }, [sequential, computeOrder, originalGraphemes.length]);

  const triggerReverse = useCallback(() => {
    if (sequential) {
      // compute forward order then reverse it: we'll remove indices in that order
      orderRef.current = computeOrder(originalGraphemes.length).slice().reverse();
      pointerRef.current = 0;
      setRevealedIndices(fillAllIndices()); // start fully revealed
      setDisplayText(shuffleText(originalGraphemes, fillAllIndices()));
    } else {
      // non-seq: start from fully revealed as well
      setRevealedIndices(fillAllIndices());
      setDisplayText(shuffleText(originalGraphemes, fillAllIndices()));
    }
    setDirection("reverse");
    setIsAnimating(true);
  }, [sequential, computeOrder, fillAllIndices, shuffleText, originalGraphemes]);

  useEffect(() => {
    if (!isAnimating) return;

    let currentIteration = 0;

    const getNextIndex = (revealedSet: Set<number>): number => {
      const textLength = originalGraphemes.length;
      switch (revealDirection) {
        case "start":
          return revealedSet.size;
        case "end":
          return textLength - 1 - revealedSet.size;
        case "center": {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

          if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
            return nextIndex;
          }
          for (let i = 0; i < textLength; i++) {
            if (!revealedSet.has(i)) return i;
          }
          return 0;
        }
        default:
          return revealedSet.size;
      }
    };

    intervalRef.current = setInterval(() => {
      setRevealedIndices((prevRevealed) => {
        if (sequential) {
          // Forward
          if (direction === "forward") {
            if (prevRevealed.size < originalGraphemes.length) {
              const nextIndex = getNextIndex(prevRevealed);
              const newRevealed = new Set(prevRevealed);
              newRevealed.add(nextIndex);
              setDisplayText(shuffleText(originalGraphemes, newRevealed));
              return newRevealed;
            } else {
              clearInterval(intervalRef.current ?? undefined);
              setIsAnimating(false);
              setIsDecrypted(true);
              return prevRevealed;
            }
          }
          // Reverse
          if (direction === "reverse") {
            if (pointerRef.current < orderRef.current.length) {
              const idxToRemove = orderRef.current[pointerRef.current++];
              const newRevealed = new Set(prevRevealed);
              newRevealed.delete(idxToRemove);
              setDisplayText(shuffleText(originalGraphemes, newRevealed));
              if (newRevealed.size === 0) {
                clearInterval(intervalRef.current ?? undefined);
                setIsAnimating(false);
                setIsDecrypted(false);
              }
              return newRevealed;
            } else {
              clearInterval(intervalRef.current ?? undefined);
              setIsAnimating(false);
              setIsDecrypted(false);
              return prevRevealed;
            }
          }
        } else {
          // Non-Sequential
          if (direction === "forward") {
            setDisplayText(shuffleText(originalGraphemes, prevRevealed));
            currentIteration++;
            if (currentIteration >= maxIterations) {
              clearInterval(intervalRef.current ?? undefined);
              setIsAnimating(false);
              setDisplayText(originalGraphemes);
              setIsDecrypted(true);
            }
            return prevRevealed;
          }

          // Non-Sequential Reverse
          if (direction === "reverse") {
            let currentSet = prevRevealed;
            if (currentSet.size === 0) {
              currentSet = fillAllIndices();
            }
            const removeCount = Math.max(
              1,
              Math.ceil(originalGraphemes.length / Math.max(1, maxIterations)),
            );
            const nextSet = removeRandomIndices(currentSet, removeCount);
            setDisplayText(shuffleText(originalGraphemes, nextSet));
            currentIteration++;
            if (nextSet.size === 0 || currentIteration >= maxIterations) {
              clearInterval(intervalRef.current ?? undefined);
              setIsAnimating(false);
              setIsDecrypted(false);
              // ensure final scrambled state
              setDisplayText(shuffleText(originalGraphemes, new Set()));
              return new Set();
            }
            return nextSet;
          }
        }
        return prevRevealed;
      });
    }, speed);
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [
    isAnimating,
    originalGraphemes,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    shuffleText,
    direction,
    fillAllIndices,
    removeRandomIndices,
    characters,
    useOriginalCharsOnly,
  ]);

  /* Click Behaviour */
  const handleClick = () => {
    if (animateOn !== "click") return;

    if (clickMode === "once") {
      if (isDecrypted) return;
      setDirection("forward");
      triggerDecrypt();
    }

    if (clickMode === "toggle") {
      if (isDecrypted) {
        triggerReverse();
      } else {
        setDirection("forward");
        triggerDecrypt();
      }
    }
  };

  /* Hover Behaviour */
  const triggerHoverDecrypt = useCallback(() => {
    if (isAnimating) return;

    setRevealedIndices(new Set());
    setIsDecrypted(false);
    setDisplayText(originalGraphemes);
    setDirection("forward");
    setIsAnimating(true);
  }, [isAnimating, originalGraphemes]);

  const resetToPlainText = useCallback(() => {
    clearInterval(intervalRef.current ?? undefined);
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(originalGraphemes);
    setIsDecrypted(true);
    setDirection("forward");
  }, [originalGraphemes]);

  /* View Observer */
  useEffect(() => {
    if (animateOn !== "view" && animateOn !== "inViewHover") return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          triggerDecrypt();
          setHasAnimated(true);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [animateOn, hasAnimated, triggerDecrypt]);

  useEffect(() => {
    if (animateOn === "click") {
      encryptInstantly();
    } else {
      setDisplayText(originalGraphemes);
      setIsDecrypted(true);
    }
    setRevealedIndices(new Set());
    setDirection("forward");
  }, [animateOn, originalGraphemes, encryptInstantly]);

  const animateProps =
    animateOn === "hover" || animateOn === "inViewHover"
      ? {
          onMouseEnter: triggerHoverDecrypt,
          onMouseLeave: resetToPlainText,
        }
      : animateOn === "click"
        ? {
            onClick: handleClick,
          }
        : {};

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      {...animateProps}
      {...props}
    >
      <span className="sr-only">{displayText.join("")}</span>

      <span aria-hidden="true">
        {displayText.map((char, index) => {
          const isRevealedOrDone = revealedIndices.has(index) || (!isAnimating && isDecrypted);

          return (
            <span key={index} className={isRevealedOrDone ? className : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
