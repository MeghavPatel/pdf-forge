import { ComponentType } from "react";

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: "active" | "coming-soon";
  component?: ComponentType;
}

const registry: Map<string, ToolConfig> = new Map();

export function registerTool(config: ToolConfig) {
  registry.set(config.id, config);
}

export function getTool(id: string): ToolConfig | undefined {
  return registry.get(id);
}

export function getAllTools(): ToolConfig[] {
  return Array.from(registry.values());
}

export function getActiveTools(): ToolConfig[] {
  return getAllTools().filter((t) => t.status === "active");
}
