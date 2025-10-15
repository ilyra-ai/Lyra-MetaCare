"use client";

import { cn } from "@/lib/utils";
import { type CarouselApi } from "@/components/ui/carousel";
import * as React from "react";

interface OnboardingNavigationDotsProps {
  api: CarouselApi | undefined;
  count: number;
}

export function OnboardingNavigationDots({ api, count }: OnboardingNavigationDotsProps) {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const dots = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        "h-2 w-2 rounded-full transition-all duration-300",
        index === current - 1 ? "bg-green-600 w-6" : "bg-gray-300"
      )}
    />
  ));

  return <div className="flex space-x-2">{dots}</div>;
}