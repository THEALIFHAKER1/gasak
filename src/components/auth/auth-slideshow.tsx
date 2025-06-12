"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import useEmblaCarousel from "embla-carousel-react";

const slides = [
  {
    quote:
      "This platform has revolutionized how we manage our esports organization and track team performance across all our tournaments.",
    author: "Team Captain",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=1200&fit=crop&crop=center", // Gaming setup
    title: "Tournament Management",
  },
  {
    quote:
      "The analytics and reporting features have given us incredible insights into our players' performance and team dynamics.",
    author: "Esports Manager",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=1200&fit=crop&crop=center", // Gaming arena
    title: "Performance Analytics",
  },
  {
    quote:
      "Managing multiple teams and tournaments has never been easier. This tool is a game-changer for competitive gaming.",
    author: "Tournament Director",
    image:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=1200&fit=crop&crop=center", // Esports competition
    title: "Team Management",
  },
  {
    quote:
      "The real-time collaboration features help our coaching staff work together seamlessly across different time zones.",
    author: "Head Coach",
    image:
      "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=800&h=1200&fit=crop&crop=center", // Gaming team
    title: "Global Collaboration",
  },
];

export function AuthSlideshow() {
  // Carousel functionality
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);

    // Auto-scroll functionality
    const autoScroll = setInterval(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, 5000);

    return () => {
      clearInterval(autoScroll);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="bg-muted relative hidden h-full flex-col overflow-hidden text-white lg:flex dark:border-r">
      {/* Carousel Container - Full Background */}
      <div className="absolute inset-0">
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide, index) => (
              <div key={index} className="relative h-full w-full flex-none">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50" />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Header */}
      <div className="relative z-20 flex items-center p-10 pb-0 text-lg font-medium">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-6 w-6"
        >
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </svg>
        GASAK Esport
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-1 flex-col justify-between p-10">
        {/* Slide Title */}
        <div className="mt-8">
          <h2 className="mb-2 text-3xl font-bold">
            {slides[currentSlide]?.title}
          </h2>
          <div className="h-1 w-16 rounded bg-white/60"></div>
        </div>

        {/* Quote and Navigation */}
        <div className="space-y-6">
          <blockquote className="space-y-4">
            <p className="text-xl leading-relaxed font-light">
              &ldquo;{slides[currentSlide]?.quote}&rdquo;
            </p>
            <footer className="text-base font-medium opacity-90">
              {slides[currentSlide]?.author}
            </footer>
          </blockquote>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    currentSlide === index
                      ? "w-12 bg-white"
                      : "w-6 bg-white/40",
                  )}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={scrollPrev}
                className="rounded-full bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <IconChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollNext}
                className="rounded-full bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <IconChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
