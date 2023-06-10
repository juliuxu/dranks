import type { BlockComponentProps } from "@julianjark/notion-render";
import { useNotionRenderContext } from "@julianjark/notion-render";
import { getTextFromRichText } from "@julianjark/notion-utils";
import { Image } from "@unpic/react";
import { transform } from "~/routes/_layout._index/unpic-cloudinary";
import { imageUrlBuilder } from "~/routes/api.notion-image";

export const UnpicNotionImage = ({ block }: BlockComponentProps) => {
  const ctx = useNotionRenderContext();
  if (block.type !== "image") return null;

  const url = imageUrlBuilder({ type: "image-block", blockId: block.id });
  return (
    <Image
      layout="fullWidth"
      className={ctx.classes.image.root}
      alt={getTextFromRichText(block.image.caption)}
      src={url}
      transformer={transform}
    />
  );
};
