import { useCallback, useState } from "react";

import { probeMedia, type MediaInfo } from "@/lib/media";

/** Holds the selected file plus browser-probed duration/dimensions. */
export function useMediaFile(kind: "video" | "audio") {
  const [file, setFileState] = useState<File | null>(null);
  const [info, setInfo] = useState<MediaInfo | null>(null);
  const [probing, setProbing] = useState(false);

  const setFile = useCallback(
    async (f: File) => {
      setFileState(f);
      setInfo(null);
      setProbing(true);
      const result = await probeMedia(f, kind);
      setInfo(result);
      setProbing(false);
      return result;
    },
    [kind],
  );

  const clear = useCallback(() => {
    setFileState(null);
    setInfo(null);
  }, []);

  return { file, info, probing, setFile, clear };
}
