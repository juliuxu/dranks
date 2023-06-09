import { LRUCache } from "lru-cache";
import type { NotionTokenAndDatabaseId } from "./client";
import { getDrinksAndMetaInfo, getDrinkWithNotionBody } from "./client";

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
  const drinkWithNotionBodyCache = new LRUCache<
    string,
    Awaited<ReturnType<typeof getDrinkWithNotionBody>>
  >({
    ...lruOptions,
    fetchMethod: async (notionPageId) => {
      try {
        return await getDrinkWithNotionBody({
          notionToken,
          notionPageId,
        });
      } catch (e) {
        console.error("getDrinksAndMetaInfo: ❌ failed fetching or parsing", e);
        throw e;
      }
    },
  });

  const getDrinksAndMetaInfoCached = async () =>
    (await drinksAndMetainfoCache.fetch(""))!;

  const getDrinkWithNotionBodyCached = async (notionPageId: string) =>
    (await drinkWithNotionBodyCache.fetch(notionPageId))!;

  return {
    getDrinksAndMetaInfo: getDrinksAndMetaInfoCached,
    getDrinkWithNotionBody: getDrinkWithNotionBodyCached,
  };
}
