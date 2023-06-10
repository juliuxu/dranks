import { getClient } from "@julianjark/notion-utils";
import { createGetImageAssets } from "@julianjark/notion-image";
import { LRUCache } from "lru-cache";
import { notionImageApiPath } from "./routes/api.notion-image";

const defaultLruOptions = {
  max: 1000,
  ttl: 1000 * 60,
  allowStale: true,
  allowStaleOnFetchRejection: true,
  allowStaleOnFetchAbort: true,
  noDeleteOnFetchRejection: true,
};
export function getNotionClientCached(notionToken: string, lruOptions = {}) {
  const getImageAssets = createGetImageAssets({
    apiPath: notionImageApiPath,
    notionTokenOrClient: notionToken,
  });
  const client = { ...getClient(notionToken), getImageAssets };

  const cache = new LRUCache<string, any>({
    ...defaultLruOptions,
    ...lruOptions,
    fetchMethod: async (argsAsJson) => {
      const { method, args } = JSON.parse(argsAsJson) as {
        method: keyof typeof client;
        args: any;
      };
      try {
        return await (client[method] as Function)(...args);
      } catch (e) {
        console.error(
          "getNotionClientCached: ❌ failed fetching or parsing",
          e
        );
        throw e;
      }
    },
  });

  const getDatabasePagesCached: typeof client.getDatabasePages = async (
    ...args
  ) =>
    (await cache.fetch(JSON.stringify({ method: "getDatabasePages", args })))!;

  const getImageAssetsCached: typeof getImageAssets = async (...args) =>
    (await cache.fetch(JSON.stringify({ method: "getImageAssets", args })))!;

  return {
    getDatabasePages: getDatabasePagesCached,
    getImageAssets: getImageAssetsCached,
  };
}
