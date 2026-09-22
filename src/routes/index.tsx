import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbit — Navigation that goes in circles" },
      {
        name: "description",
        content:
          "A radial navigation menu with icon buttons arranged around a central toggle.",
      },
      { property: "og:title", content: "Orbit — Navigation that goes in circles" },
      {
        property: "og:description",
        content:
          "A radial navigation menu with icon buttons arranged around a central toggle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageShell
      eyebrow="Orbit"
      title="Navigation that goes in circles."
      description="Tap the glowing button at the bottom of the screen and six destinations fan out around it. Pick one, press Escape, or tap anywhere to close."
    >
      <div className="mt-10 flex items-center gap-3 text-muted-foreground">
        <span className="h-px w-10 bg-border" />
        <span className="text-xs uppercase tracking-[0.2em]">
          Tap the toggle below
        </span>
        <span className="h-px w-10 bg-border" />
      </div>
    </PageShell>
  );
}
