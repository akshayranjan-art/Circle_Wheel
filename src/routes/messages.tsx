import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Orbit" },
      { name: "description", content: "Conversations and notifications in Orbit." },
      { property: "og:title", content: "Messages — Orbit" },
      {
        property: "og:description",
        content: "Conversations and notifications in Orbit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Messages,
});

function Messages() {
  return (
    <PageShell
      eyebrow="Messages"
      title="Say hello."
      description="Your conversations live here, one tap from anywhere in the app."
    />
  );
}
