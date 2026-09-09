"use client";

import { useState } from "react";
import { AnalyzeImagePanel } from "@/components/features/analyze-image-panel";
import { FoodInfoPanel } from "@/components/features/food-info-panel";
import { GenerateImagePanel } from "@/components/features/generate-image-panel";
import { IngredientsPanel } from "@/components/features/ingredients-panel";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "food-info", label: "Food Info", panel: FoodInfoPanel },
  { id: "ingredients", label: "Ingredients", panel: IngredientsPanel },
  { id: "generate-image", label: "Generate Image", panel: GenerateImagePanel },
  { id: "analyze-image", label: "Analyze Image", panel: AnalyzeImagePanel },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("food-info");
  const ActivePanel = tabs.find((tab) => tab.id === activeTab)?.panel ?? FoodInfoPanel;

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-fit flex-wrap justify-center gap-1 rounded-xl border border-border bg-muted/70 p-1.5 dark:bg-muted/40">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={
                isActive
                  ? "shadow-sm"
                  : "text-muted-foreground opacity-55 hover:opacity-100"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      <ActivePanel />
    </div>
  );
}
