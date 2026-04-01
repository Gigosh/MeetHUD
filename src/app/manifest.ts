import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeetHUD",
    short_name: "MeetHUD",
    description:
      "A warm, dark meeting operating system for agendas, live notes, decisions, and action tracking.",
    start_url: "/meetings",
    display: "standalone",
    background_color: "#08090c",
    theme_color: "#f97316",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
