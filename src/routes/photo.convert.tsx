import { createFileRoute } from "@tanstack/react-router";

import { ConvertImage } from "@/components/tools/ConvertImage";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/photo/convert")({
  head: () => toolHead(getLiveTool("convert-image")),
  component: ConvertImage,
});
