import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create — Orbit" },
      { name: "description", content: "Start something new in Orbit." },
      { property: "og:title", content: "Create — Orbit" },
      { property: "og:description", content: "Start something new in Orbit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Create,
});

function Create() {
  return (
    <PageShell
      eyebrow="Create"
      title="Make something new."
      description="A blank canvas, a fresh idea. Everything you start here is kept with your account."
    />
  );
}
