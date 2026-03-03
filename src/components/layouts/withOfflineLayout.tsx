"use client";

import type { ComponentType, FC } from "react";
import NeumoCard from "@/components/NeumoCard";

// HOC pour les pages "offline" (auth, reset, etc.) sans sidebar/dashboard
export function withOfflineLayout<P extends object>(
  PageComponent: ComponentType<P>,
) {
  const Wrapped: FC<P> = (props) => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgGray px-4">
        <div className="w-full max-w-md">
          <NeumoCard className="p-6 bg-white shadow-neu-soft">
            <PageComponent {...props} />
          </NeumoCard>
        </div>
      </div>
    );
  };

  Wrapped.displayName = `WithOfflineLayout(${
    PageComponent.displayName || PageComponent.name || "Component"
  })`;

  return Wrapped;
}

