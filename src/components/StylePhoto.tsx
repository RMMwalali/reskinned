import Image from "next/image";
import { pexels, type Photo } from "@/lib/photos";

/** A cover-cropped stock photo in a rounded frame. Parent sets the size. */
export function StylePhoto({ photo, sizes = "(max-width: 640px) 50vw, 220px", priority = false, position = "50% 30%" }: { photo: Photo; sizes?: string; priority?: boolean; position?: string }) {
  return (
    <span style={{ position: "relative", display: "block", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit", background: "var(--cream-2)" }}>
      <Image src={pexels(photo.id, 1200)} alt={photo.alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: position }} />
    </span>
  );
}
