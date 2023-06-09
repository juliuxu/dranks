import { z } from "zod";
import type { BlockObjectResponse } from "@julianjark/notion-utils";

const blockSchema = z.custom<BlockObjectResponse>((val) => {
  if ((val as BlockObjectResponse)?.type === "unsupported") return false;
  return true;
});

const alcoholSchema = z.object({
  title: z.string(),
  color: z.string(),
});
export type Alcohol = z.infer<typeof alcoholSchema>;

export const drinksMetainfo = z.object({
  alcohols: z.array(alcoholSchema),
  lastEditedTime: z.string(),
});
export type DrinksMetainfo = z.infer<typeof drinksMetainfo>;

// Drink meta information
export const drinkSchema = z.object({
  id: z.string(),
  title: z.string(),
  illustrationUrl: z.string().optional(),
  alcohol: alcoholSchema,
  tags: z.array(z.string()),
  groups: z.array(z.string()),
});
export type Drink = z.infer<typeof drinkSchema>;

// Body in notion blocks
export const drinkNotionBlocksBodySchema = z.object({
  preperations: z.array(blockSchema).optional(),
  ingredients: z.array(blockSchema),
  steps: z.array(blockSchema),
  notes: z.array(blockSchema).optional(),
  references: z.array(blockSchema),
});
export type DrinkNotionBlocksBody = z.infer<typeof drinkNotionBlocksBodySchema>;

// Body as structured data
// Based on DrinkNotionBlocksBodySchema
const ingredientSchema = z.object({
  raw: z.string(),
  title: z.string(),
  recommendation: z.string().optional(),
  amount: z.string().optional(),
  mlAmount: z.string().optional(),
});
export const drinkStructuredBodySchema = z.object({
  ingredients: z.array(ingredientSchema),
  steps: z.array(z.object({ title: z.string() })),
});
