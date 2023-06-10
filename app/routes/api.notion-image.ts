import type { LoaderArgs } from "@remix-run/node";
import {
  createImageUrlBuilder,
  getNotionImage,
} from "@julianjark/notion-image";
import { config } from "~/config.server";

const apiPath = "/api/notion-image";
const basePath = "https://dranks.julianjark.no";

const imageUrlBuilder = createImageUrlBuilder(
  new URL(apiPath, basePath).toString()
);

/**
 * Optimize images with Cloudinary
 * Browser -> Cloudinary -> This API -> Notion
 */
const cloudinaryImageUrlBuilder: typeof imageUrlBuilder = (...args) =>
  `https://res.cloudinary.com/dxv2fa2wh/image/fetch/f_auto,q_auto/${encodeURIComponent(
    imageUrlBuilder(...args)
  )}`;
export { cloudinaryImageUrlBuilder as imageUrlBuilder };

export const loader = async ({ request }: LoaderArgs) => {
  return getNotionImage(config.notionToken)(
    Object.fromEntries(new URL(request.url).searchParams)
  );
};
