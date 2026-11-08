import { createFileRoute } from "@tanstack/react-router";

import { CategoryPage } from "@/components/CategoryPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/audio/")({
  head: () =>
    pageHead(
      "Free Online Audio Tools — Convert & Cut | ClipBench",
      "Convert audio to MP3, WAV or M4A and cut tracks with fades. Private, in-browser processing with no uploads.",
    ),
  component: () => <CategoryPage category="audio" />,
});
