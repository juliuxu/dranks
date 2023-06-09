import type {
  BlockObjectResponse,
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@julianjark/notion-utils";
import {
  getTitle,
  getCover,
  getSelectAndColor,
  getMultiSelect,
} from "@julianjark/notion-utils";
import type { DrinksMetainfo, Drink, DrinkNotionBlocksBody } from "./schema";
import { drinkNotionBlocksBodySchema } from "./schema";
import { drinkSchema } from "./schema";
import { drinksMetainfo } from "./schema";
import type { Relaxed } from "./utils";
import { safeParseList } from "./utils";
import { takeItemsIfHeaderMatches } from "./utils";

export function parseDrinksMetainfo(fromDatabase: DatabaseObjectResponse) {
  const alcohol = fromDatabase.properties["Alkohol"];
  return drinksMetainfo.parse({
    alcohols:
      alcohol?.type === "select"
        ? alcohol.select.options.map(({ name, color }) => ({
            title: name,
            color,
          }))
        : undefined,
    lastEditedTime: fromDatabase.last_edited_time,
  } satisfies Relaxed<DrinksMetainfo>);
}

export function mapDrink(fromPage: PageObjectResponse) {
  return {
    id: fromPage.id,
    title: getTitle(fromPage),
    illustrationUrl: getCover(fromPage),
    alcohol: getSelectAndColor("Alkohol", fromPage),
    tags: getMultiSelect("Tags", fromPage),
    groups: getMultiSelect("Gruppering", fromPage),
  } satisfies Relaxed<Drink>;
}
export function parseDrink(fromPage: PageObjectResponse) {
  return drinkSchema.parse(mapDrink(fromPage));
}
export function safeParseDrinks(fromPages: PageObjectResponse[]) {
  return safeParseList(fromPages, mapDrink, drinkSchema);
}

/**
 * Recursively map blocks to a structured drink body
 */
export function mapNotionDrinkBody(fromBlocks: BlockObjectResponse[]) {
  const remainingBlocks = fromBlocks.slice();

  const result: Partial<DrinkNotionBlocksBody> = {};
  let currentBlock: BlockObjectResponse | undefined;
  while ((currentBlock = remainingBlocks.shift()) !== undefined) {
    // Notes
    if (currentBlock.type === "callout") {
      result.notes = [...(result.notes ?? []), currentBlock];
      continue;
    }

    // References
    const referenceBlockTypes: BlockObjectResponse["type"][] = [
      "bookmark",
      "video",
      "image",
    ];
    if (referenceBlockTypes.includes(currentBlock.type)) {
      result.references = [...(result.references ?? []), currentBlock];
      continue;
    }

    // Ingredients, steps, preparations
    result.preperations =
      takeItemsIfHeaderMatches("Forbredelser", currentBlock, remainingBlocks) ??
      result.preperations;
    result.ingredients =
      takeItemsIfHeaderMatches("Ingredienser", currentBlock, remainingBlocks) ??
      result.ingredients;
    result.steps =
      takeItemsIfHeaderMatches(
        "Fremgangsmåte",
        currentBlock,
        remainingBlocks
      ) ?? result.steps;

    // Recursively go down the tree
    const blockChildren = (currentBlock as any)[currentBlock.type]?.children as
      | BlockObjectResponse[]
      | undefined;
    if (blockChildren?.length) {
      const recursiveResult = mapNotionDrinkBody(blockChildren);

      // Manual merge
      result.notes = [
        ...(result.notes ?? []),
        ...(recursiveResult.notes ?? []),
      ];
      result.references = [
        ...(result.references ?? []),
        ...(recursiveResult.references ?? []),
      ];
      result.preperations = recursiveResult.preperations ?? result.preperations;
      result.ingredients = recursiveResult.ingredients ?? result.ingredients;
      result.steps = recursiveResult.steps ?? result.steps;
    }
  }
  return result;
}
export function safeParseNotionDrinkBody(fromBlocks: BlockObjectResponse[]) {
  return drinkNotionBlocksBodySchema.safeParse(mapNotionDrinkBody(fromBlocks));
}
export function parseNotionDrinkBody(fromBlocks: BlockObjectResponse[]) {
  return drinkNotionBlocksBodySchema.parse(mapNotionDrinkBody(fromBlocks));
}
export function safeParseNotionDrinkBodies(
  fromBlocksList: BlockObjectResponse[][]
) {
  return safeParseList(
    fromBlocksList,
    mapNotionDrinkBody,
    drinkNotionBlocksBodySchema
  );
}
