"use client";

import { useState, useEffect } from "react";
import thoughts from "@/data/thoughts";

export default function ThoughtsCarousel() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % thoughts.length);
        setVisible(true);
      }, 4200);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 w-full px-4">
      <div className="w-full rounded-2xl border border-gray-100 px-8 py-6" style={{ minHeight: "10rem" }}>
        <span className="mb-4 block text-xs font-semibold uppercase tracking-widest text-gray-400">
          Milad&rsquo;s Random Thoughts
        </span>
        <div className="flex min-h-[6rem] flex-col items-center justify-center gap-2">
          <p
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 1.2s ease-in-out",
            }}
            className="w-full text-center text-lg font-medium italic text-gray-700"
          >
            &ldquo;{thoughts[index].text}&rdquo;
          </p>
          <p
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 1.2s ease-in-out",
            }}
            className="mt-2 text-center text-xs text-gray-400"
          >
            {thoughts[index].date}
          </p>
        </div>
      </div>
    </div>
  );
}
