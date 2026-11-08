import { createFileRoute } from "@tanstack/react-router";

import { CategoryPage } from "@/components/CategoryPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/video/")({
  head: () =>
    pageHead(
      "Free Online Video Tools — Trim, Compress, Convert | ClipBench",
      "Trim, compress, convert to MP4, make GIFs and strip audio from videos — all processed privately in your browser.",
    ),
  component: () => <CategoryPage category="video" />,
});
