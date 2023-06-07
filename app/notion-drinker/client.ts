import { getClient } from "@vargtech/notion-utils";
import {
  parseDrink,
  parseDrinksMetainfo,
  parseNotionDrinkBody,
  safeParseDrinks,
  safeParseNotionDrinkBody,
} from "./parser";
import { typedBoolean } from "./utils";

interface NotionTokenAndDatabaseId {
  notionToken: string;
  notionDatabaseId: string;
}
interface NotionTokenAndPageId {
  notionToken: string;
  notionPageId: string;
}

export async function getDrinksMetainfo({
  notionToken,
  notionDatabaseId,
}: NotionTokenAndDatabaseId) {
  const client = getClient(notionToken);
  const database = await client.getDatabase(notionDatabaseId);
  return parseDrinksMetainfo(database);
}

// Bulk lookups
export async function getDrinks({
  notionToken,
  notionDatabaseId,
}: NotionTokenAndDatabaseId) {
  const client = getClient(notionToken);

  const pages = await client.getDatabasePages(notionDatabaseId);
  const [drinks, unparsed] = safeParseDrinks(pages);
  if (unparsed.length > 0) {
    console.error("Failed to parse the following drinks", unparsed);
  }
  return drinks;
}

export async function getDrinksWithNotionBodies({
  notionToken,
  notionDatabaseId,
}: NotionTokenAndDatabaseId) {
  const client = getClient(notionToken);
  const drinks = await getDrinks({ notionToken, notionDatabaseId });
  const drinkBodies = await Promise.all(
    drinks
      .map(async (drink) => {
        const blocks = await client.getBlocksWithChildren(drink.id);
        const parsed = safeParseNotionDrinkBody(blocks);
        if (parsed.success) {
          return {
            ...drink,
            ...parsed.data,
          };
        } else {
          console.error(
            "Failed to parse the following drink body",
            parsed.error
          );
          return undefined;
        }
      })
      .filter(typedBoolean)
  );
  return drinkBodies;
}

// Single lookups
export async function getDrink({
  notionToken,
  notionPageId,
}: NotionTokenAndPageId) {
  const client = getClient(notionToken);
  const page = await client.getPage(notionPageId);
  return parseDrink(page);
}

export async function getNotionDrinkBody({
  notionToken,
  notionPageId,
}: NotionTokenAndPageId) {
  const client = getClient(notionToken);
  const blocks = await client.getBlocksWithChildren(notionPageId);
  return parseNotionDrinkBody(blocks);
}

export async function getDrinkWithNotionBody(
  notionTokenAndPageId: NotionTokenAndPageId
) {
  const [drink, drinkBody] = await Promise.all([
    getDrink(notionTokenAndPageId),
    getNotionDrinkBody(notionTokenAndPageId),
  ]);
  return { ...drink, ...drinkBody };
}
