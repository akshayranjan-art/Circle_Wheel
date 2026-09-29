import { createFileRoute } from "@tanstack/react-router";
import { LauncherHome } from "@/components/launcher-home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbit Menu — Curved Edge Phone Launcher" },
      {
        name: "description",
        content: "An immersive mobile launcher with a curved edge app arc, live search, A–Z jump, wallpapers, and customizable shortcuts.",
      },
      { property: "og:title", content: "Orbit Menu — Curved Edge Phone Launcher" },
      { property: "og:description", content: "Spin a curved edge launcher, search apps instantly, and personalize your wallpaper and shortcuts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LauncherHome,
});
