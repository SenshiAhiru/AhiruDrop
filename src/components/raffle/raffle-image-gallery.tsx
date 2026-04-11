"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  altText?: string;
}

interface RaffleImageGalleryProps {
  images: GalleryImage[];
  className?: string;
}

export function RaffleImageGallery({ images, className }: RaffleImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-video w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary-600/20 via-primary-700/10 to-accent-500/20 border border-[var(--border)]",
          className
        )}
      >
        <svg
          className="h-16 w-16 text-primary-600/30"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
          />
        </svg>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <Image
          src={activeImage.url}
          alt={activeImage.altText || "Imagem da rifa"}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200",
                index === activeIndex
                  ? "border-primary-600 shadow-md shadow-primary-600/20 ring-1 ring-primary-600/30"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-[var(--border)]"
              )}
            >
              <Image
                src={image.url}
                alt={image.altText || `Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
