import { config } from "~/config.server";
import { getNotionClientCached } from "~/notion-client-cached";
import { getCachedDrinksClient } from "./notion-drinker/client-cached";

export const notionClientCached = getNotionClientCached(config.notionToken);

export const drinksClient = getCachedDrinksClient({
  notionToken: config.notionToken,
  notionDatabaseId: config.notionDrinksDatabaseId,
});

export async function warmUpCache() {
  const { drinks } = await drinksClient.getDrinksAndMetaInfo();
  for (const drink of drinks) {
    await drinksClient.getDrinkWithNotionBody(drink.id);
  }
}

// Warm the cache on startup
if (process.env.NODE_ENV === "production") {
  (async () => {
    console.log("🛢️ Warming up cache...");
    const start = performance.now();
    await warmUpCache();
    const end = performance.now();
    console.log(`✅ Cache warmed up! Took ${end - start}ms`);
  })();
}
