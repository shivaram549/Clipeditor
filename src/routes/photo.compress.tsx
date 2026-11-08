import { createFileRoute } from "@tanstack/react-router";

import { CompressImage } from "@/components/tools/CompressImage";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/photo/compress")({
  head: () => toolHead(getLiveTool("compress-image")),
  component: CompressImage,
});
