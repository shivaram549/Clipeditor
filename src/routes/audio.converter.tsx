import { createFileRoute } from "@tanstack/react-router";

import { AudioConverter } from "@/components/tools/AudioConverter";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/audio/converter")({
  head: () => toolHead(getLiveTool("audio-converter")),
  component: AudioConverter,
});
