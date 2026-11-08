import { createFileRoute } from "@tanstack/react-router";

import { TrimVideo } from "@/components/tools/TrimVideo";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/video/trim")({
  head: () => toolHead(getLiveTool("trim-video")),
  component: TrimVideo,
});
