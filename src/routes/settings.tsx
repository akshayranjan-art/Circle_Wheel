import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Orbit" },
      { name: "description", content: "Tune how Orbit works for you." },
      { property: "og:title", content: "Settings — Orbit" },
      { property: "og:description", content: "Tune how Orbit works for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Settings() {
  return (
    <PageShell
      eyebrow="Settings"
      title="Tune it your way."
      description="Preferences, privacy and account controls, always within reach."
    />
  );
}
