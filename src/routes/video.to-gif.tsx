import { createFileRoute } from "@tanstack/react-router";

import { VideoToGif } from "@/components/tools/VideoToGif";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/video/to-gif")({
  head: () => toolHead(getLiveTool("video-to-gif")),
  component: VideoToGif,
});
