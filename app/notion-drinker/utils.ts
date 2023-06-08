import type { BlockObjectResponse } from "@julianjark/notion-utils";
import { getTextFromRichText } from "@julianjark/notion-utils";
import type { z } from "zod";

// Like the built-in Partial, but requires all keys
export type Relaxed<T extends object> = {
  [K in keyof T]: T[K] | undefined;
};

export function typedBoolean<T>(
  value: T
): value is Exclude<T, "" | 0 | false | null | undefined> {
  return Boolean(value);
}

/**
 * Take from the start of a list while a predicate is true
 * modifies the original array
 */
export function takeWhileM<T>(list: T[], predicate: (element: T) => boolean) {
  const result: T[] = [];
  while (list.length > 0 && predicate(list[0])) {
    result.push(list.shift()!);
  }
  return result;
}

/**
 * Safe parse a list of elements according to a schema
 * return both the successfully parsed elements and the failed ones
 */
export function safeParseList<
  Element,
  Mapper extends (element: Element) => Partial<z.infer<Schema>>,
  Schema extends z.Schema
>(list: Element[], mapper: Mapper, schema: Schema) {
  const success: z.infer<Schema>[] = [];
  const failed: {
    unparsed: Partial<z.infer<Schema>>;
    errors: z.ZodIssue[];
  }[] = [];

  list
    .map(mapper)
    .map((unparsed) => ({
      unparsed,
      parsed: schema.safeParse(unparsed),
    }))
    .forEach(({ unparsed, parsed }) => {
      if (parsed.success) {
        success.push(parsed.data);
      } else {
        failed.push({
          unparsed,
          errors: parsed.error.errors,
        });
      }
    });

  return [success, failed] as const;
}

/**
 * Take a blocks under a header until the next header,
 * but only if the header is present and matching the given string
 * e.g.
 *
 * Given the following blocks:
 * ```
 * # Ingredients
 * - 1
 * - 2
 * # Steps
 * - 3
 * - 4
 * ```
 * takeItemsIfHeaderMatches("Ingredients", blocks) will return `[1, 2]`
 */
export function takeItemsIfHeaderMatches(
  headerToMatch: string,
  currentBlock: BlockObjectResponse,
  blocksUnderneath: BlockObjectResponse[]
) {
  const headingBlockTypes: BlockObjectResponse["type"][] = [
    "heading_1",
    "heading_2",
    "heading_3",
  ];
  if (!headingBlockTypes.includes(currentBlock.type)) return undefined;

  const headingText = getTextFromRichText(
    (currentBlock as any)[currentBlock.type].rich_text
  );
  if (!headingText.includes(headerToMatch)) return undefined;

  return takeWhileM(
    blocksUnderneath,
    (x) => !headingBlockTypes.includes(x.type)
  );
}
