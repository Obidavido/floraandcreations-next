"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

const fallbackImage = "/images/original-hero-bouquet.webp";

export function ProductImage({ src, alt, width, height, className, priority = false }: ProductImageProps) {
  const candidates = useMemo(() => {
    const values = [src];
    if (src.startsWith("/api/")) {
      values.push(`https://api.floraandcreations.com${src}`);
      values.push(`https://api.floraandcreations.com${src.replace(/^\/api/, "")}`);
    }
    values.push(fallbackImage);
    return [...new Set(values.filter(Boolean))];
  }, [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const currentSrc = candidates[Math.min(candidateIndex, candidates.length - 1)] || fallbackImage;

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setCandidateIndex((index) => Math.min(index + 1, candidates.length - 1))}
    />
  );
}
