import { createFileRoute } from "@tanstack/react-router";
import { ShortsSection } from "@/components/ShortsSection";

export const Route = createFileRoute("/shorts")({
  head: () => ({
    meta: [
      { title: "Shorts — Baumer" },
      { name: "description", content: "Endless vertical trailers from movies and TV." },
      { property: "og:title", content: "Shorts — Baumer" },
      {
        property: "og:description",
        content: "Endless vertical trailers from movies and TV.",
      },
    ],
  }),
  component: () => <ShortsSection full />,
});
