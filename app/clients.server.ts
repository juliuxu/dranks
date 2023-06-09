import { config } from "~/config.server";
import { getNotionClientCached } from "~/notion-client-cached";
import { getCachedDrinksClient } from "./notion-drinker/client-cached";

export const notionClientCached = getNotionClientCached(config.notionToken);

export const drinksClient = getCachedDrinksClient({
  notionToken: config.notionToken,
  notionDatabaseId: config.notionDrinksDatabaseId,
});
