import { createFileRoute } from "@tanstack/react-router";

import { HeicToJpg } from "@/components/tools/HeicToJpg";
import { toolHead } from "@/lib/seo";
import { getLiveTool } from "@/lib/tools";

export const Route = createFileRoute("/photo/heic-to-jpg")({
  head: () => toolHead(getLiveTool("heic-to-jpg")),
  component: HeicToJpg,
});
