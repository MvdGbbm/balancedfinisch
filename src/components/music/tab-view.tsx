
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabViewProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  tabsListClassName?: string;
}

export function TabView({ 
  tabs, 
  defaultValue, 
  className,
  tabsListClassName
}: TabViewProps) {
  return (
    <Tabs 
      defaultValue={defaultValue || tabs[0]?.value} 
      className={cn("w-full", className)}
    >
      <TabsList className={cn("flex w-full", tabsListClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex-1"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
