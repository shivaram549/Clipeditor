import { createFileRoute } from "@tanstack/react-router";

import { ResizeImage } from "@/components/tools/ResizeImage";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/photo/resize")({
  head: () => toolHead(getLiveTool("resize-image")),
  component: ResizeImage,
});
