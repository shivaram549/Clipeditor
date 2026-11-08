import { createFileRoute } from "@tanstack/react-router";

import { ExtractAudio } from "@/components/tools/ExtractAudio";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/video/extract-audio")({
  head: () => toolHead(getLiveTool("extract-audio")),
  component: ExtractAudio,
});
