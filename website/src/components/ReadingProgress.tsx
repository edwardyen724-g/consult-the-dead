"use client";

import { useEffect, useState } from "react";

export function ReadingProgress({ color }: { color?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      className="reading-progress"
      style={{
        width: `${progress}%`,
        backgroundColor: color || "#C45D3E",
        opacity: progress > 0 ? 1 : 0,
      }}
    />
  );
}
