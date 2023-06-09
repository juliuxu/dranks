import { LRUCache } from "lru-cache";
import type { NotionTokenAndDatabaseId } from "./client";
import { getDrinksAndMetaInfo } from "./client";

const lruOptions = {
  max: 1000,
  ttl: 1000 * 60,
  allowStale: true,
  allowStaleOnFetchRejection: true,
  allowStaleOnFetchAbort: true,
  noDeleteOnFetchRejection: true,
};

export function getCachedDrinksClient({
  notionToken,
  notionDatabaseId,
}: NotionTokenAndDatabaseId) {
  const drinksAndMetainfoCache = new LRUCache<
    string,
    Awaited<ReturnType<typeof getDrinksAndMetaInfo>>
  >({
    ...lruOptions,
    fetchMethod: async () => {
      try {
        return await getDrinksAndMetaInfo({
          notionToken,
          notionDatabaseId,
        });
      } catch (e) {
        console.error("getDrinksAndMetaInfo: ❌ failed fetching or parsing", e);
        throw e;
      }
    },
  });

  const getDrinksAndMetaInfoCached = async () =>
    (await drinksAndMetainfoCache.fetch(""))!;

  return { getDrinksAndMetaInfo: getDrinksAndMetaInfoCached };
}
