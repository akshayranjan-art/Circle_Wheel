import { createFileRoute } from "@tanstack/react-router";
import { LauncherHome } from "@/components/launcher-home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbit Cyber Launcher — Curved Edge App Wheel" },
      {
        name: "description",
        content: "An immersive mobile launcher with a curved edge app arc, live search, A–Z jump, wallpapers, and customizable shortcuts.",
      },
      { property: "og:title", content: "Orbit Cyber Launcher — Curved Edge App Wheel" },
      { property: "og:description", content: "Spin a curved edge launcher, search apps instantly, and personalize your wallpaper and shortcuts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LauncherHome,
});
