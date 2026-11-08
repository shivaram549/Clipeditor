import { createFileRoute } from "@tanstack/react-router";

import { CategoryPage } from "@/components/CategoryPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/photo/")({
  head: () =>
    pageHead(
      "Free Online Photo Tools — Compress, Resize, HEIC to JPG | ClipBench",
      "Compress, resize and convert images, including iPhone HEIC photos, right in your browser. Nothing is uploaded.",
    ),
  component: () => <CategoryPage category="photo" />,
});
