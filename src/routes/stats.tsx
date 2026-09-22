import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Stats — Orbit" },
      { name: "description", content: "Activity and insights in Orbit." },
      { property: "og:title", content: "Stats — Orbit" },
      { property: "og:description", content: "Activity and insights in Orbit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Stats,
});

function Stats() {
  return (
    <PageShell
      eyebrow="Stats"
      title="Your numbers at a glance."
      description="Track activity, streaks and progress without leaving the flow."
    />
  );
}
