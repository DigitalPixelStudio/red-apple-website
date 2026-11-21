"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
  id?: string;
};

export default function Reveal({ children, className = "", delay = 0, as = "div", id }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver (very old browsers, prerender): show immediately.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    // Trigger slightly before the block reaches the viewport so the content is
    // already settled when the reader arrives. No negative margin, no waiting
    // for 8% of a tall section to be on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px 18% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as "div";
  return (
    <Tag
      ref={ref}
      id={id}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-[560ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
