import { createFileRoute } from "@tanstack/react-router";

import { RemoveAudio } from "@/components/tools/RemoveAudio";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/video/remove-audio")({
  head: () => toolHead(getLiveTool("remove-audio")),
  component: RemoveAudio,
});
