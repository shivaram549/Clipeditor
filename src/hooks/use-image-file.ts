import { useCallback, useEffect, useState } from "react";

import { getImageSize } from "@/lib/image";

/** Selected image + its pixel size and a preview URL (revoked automatically). */
export function useImageFile(options: { preview?: boolean } = { preview: true }) {
  const [file, setFileState] = useState<File | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || options.preview === false) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file, options.preview]);

  const setFile = useCallback(async (f: File) => {
    setFileState(f);
    setSize(null);
    const s = await getImageSize(f);
    setSize(s);
    return s;
  }, []);

  const clear = useCallback(() => {
    setFileState(null);
    setSize(null);
  }, []);

  return { file, size, url, setFile, clear };
}
