"use client";

import { useEffect } from "react";

declare global {
  interface Document { modelContext?: { registerTool(tool: { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute(input: unknown): unknown | Promise<unknown> }, options?: { signal?: AbortSignal }): void | Promise<void> } }
}

export function AdminWebMcp() {
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "open_portfolio_admin_section",
      title: "Open portfolio admin section",
      description: "Navigate the visible owner dashboard to a specific portfolio content section without changing saved data.",
      inputSchema: { type: "object", properties: { section: { type: "string", enum: ["profile", "education", "project", "skillGroup", "certificate", "achievement", "volunteer", "activity", "interest", "language", "attachment", "security"] } }, required: ["section"], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        const section = (input as { section?: string })?.section;
        if (!section) throw new Error("A section is required.");
        window.dispatchEvent(new CustomEvent("admin:navigate", { detail: section }));
        return { section, status: "opened" };
      },
    }, { signal: controller.signal })).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return null;
}
