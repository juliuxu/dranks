import type { LoaderArgs } from "@remix-run/node";
import {
  createImageUrlBuilder,
  getNotionImage,
} from "@julianjark/notion-image";
import { config } from "~/config.server";

export const notionImageApiPath = "/api/notion-image";
export const imageUrlBuilder = createImageUrlBuilder(notionImageApiPath);

export const loader = async ({ request }: LoaderArgs) => {
  return getNotionImage(config.notionToken)(
    Object.fromEntries(new URL(request.url).searchParams)
  );
};
