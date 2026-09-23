import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "" }],
  }),
  component: BlankPage,
});

function BlankPage() {
  return <main aria-label="Blank page" className="min-h-screen" />;
}
