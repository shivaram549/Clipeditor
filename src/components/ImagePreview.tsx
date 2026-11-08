export function ImagePreview({ url, alt }: { url: string | null; alt: string }) {
  if (!url) return null;
  return (
    <div className="bg-checker overflow-hidden rounded-xl border border-border">
      <img src={url} alt={alt} className="mx-auto max-h-[360px] w-auto object-contain" />
    </div>
  );
}
