import Image from "next/image";
import type { GalleryPhotoView } from "@/lib/queries";

/** Uma foto da galeria. A legenda é opcional e some quando vazia. */
export function GalleryPhotoCard({ photo }: { photo: GalleryPhotoView }) {
  return (
    <figure className="flex flex-col gap-2">
      <Image
        src={photo.image}
        alt={photo.caption || ""}
        width={640}
        height={480}
        className="aspect-[4/3] w-full rounded-xl object-cover"
      />
      {photo.caption ? (
        <figcaption className="text-sm text-muted-foreground">
          {photo.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
