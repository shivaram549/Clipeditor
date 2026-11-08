import { createFileRoute } from "@tanstack/react-router";

import { AudioCutter } from "@/components/tools/AudioCutter";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/audio/cutter")({
  head: () => toolHead(getLiveTool("audio-cutter")),
  component: AudioCutter,
});
