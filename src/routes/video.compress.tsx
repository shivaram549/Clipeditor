import { createFileRoute } from "@tanstack/react-router";

import { CompressVideo } from "@/components/tools/CompressVideo";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/video/compress")({
  head: () => toolHead(getLiveTool("compress-video")),
  component: CompressVideo,
});
