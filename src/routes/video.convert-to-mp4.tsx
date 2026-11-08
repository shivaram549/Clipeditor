import { createFileRoute } from "@tanstack/react-router";

import { ConvertToMp4 } from "@/components/tools/ConvertToMp4";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/video/convert-to-mp4")({
  head: () => toolHead(getLiveTool("convert-to-mp4")),
  component: ConvertToMp4,
});
