import { Fragment } from "react";
import type {
  HeadersFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { z } from "zod";

import { dranksClasses } from "~/routes/_layout/route";
import { useDebounceEffect } from "~/utils";
import type { Alcohol } from "~/notion-drinker/schema";
import { drinksClient } from "~/clients.server";
import { DrankCard } from "./drink-card";

const querySchema = z.object({
  q: z.string().optional(),
  alcohols: z
    .array(z.string())
    .or(z.string().transform((val) => [val]))
    .optional(),
});

export const loader = async ({ request }: LoaderArgs) => {
  const { drinks, drinksMetainfo } = await drinksClient.getDrinksAndMetaInfo();

  // Filtering
  const { searchParams } = new URL(request.url);
  const filter = querySchema.parse({
    ...Object.fromEntries(searchParams.entries()),
    alcohols: searchParams.getAll("alcohols"),
  });
  const drinksFiltered = drinks
    .filter((drink) => {
      if (!filter.q) return true;
      const searchTargets = [drink.title].map((x) => x.toLowerCase());
      const searchString = filter.q.toLowerCase().trim().replace(/\s+/, " ");
      return searchTargets.some((searchTarget) =>
        searchTarget.includes(searchString)
      );
    })
    .filter((drink) => {
      if (!filter.alcohols || filter.alcohols?.length === 0) return true;
      return filter.alcohols.includes(drink.alcohol.title);
    });

  // Ordering
  const drinksByAlcohol = drinksMetainfo.alcohols.map((alcohol) => ({
    alcohol,
    drinks: drinksFiltered.filter(
      (drink) => drink.alcohol.title === alcohol.title
    ),
  }));

  return json({
    alcohols: drinksMetainfo.alcohols,
    drinks: drinksFiltered,
    drinksByAlcohol,
    filter,
  });
};
export let headers: HeadersFunction = ({ loaderHeaders }) => loaderHeaders;

export const meta: V2_MetaFunction = () => [
  {
    title: "Dranks",
  },
];

export default function Dranks() {
  const data = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const submitDebounced = useDebounceEffect(submit, 200);

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";

  const isAlcoholChecked = (alcohol: Alcohol) => {
    return (
      navigation.formData?.getAll("alcohols") ??
      data.filter.alcohols ??
      []
    ).includes(alcohol.title);
  };

  return (
    <>
      <div
        className={`flex flex-col gap-14 py-16 ${dranksClasses.layoutPadding} ${dranksClasses.layoutMaxWidth}`}
      >
        <Form
          method="get"
          className="flex flex-col gap-7"
          id="dranks-filter-form"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                aria-hidden="true"
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>

            <input
              className="block w-full rounded-lg bg-gray-100 p-3 pl-10"
              type="search"
              placeholder="Søk etter dranks"
              name="q"
              autoFocus
              defaultValue={data.filter.q}
              onChange={(e) =>
                submitDebounced(e.currentTarget.form, { replace: true })
              }
            />
          </div>

          <div className="flex flex-row flex-wrap gap-3 gap-y-3">
            {data.alcohols.map((alcohol) => (
              <Fragment key={alcohol.title}>
                <label className="contents cursor-pointer">
                  <input
                    type="checkbox"
                    name="alcohols"
                    className="peer sr-only"
                    value={alcohol.title}
                    checked={isAlcoholChecked(alcohol)}
                    onChange={(e) => submit(e.currentTarget.form)}
                  />
                  <span className="rounded-lg border border-dranks-orange px-5 py-[10px] transition peer-checked:bg-dranks-orange peer-checked:text-white peer-focus:ring">
                    {alcohol.title}
                  </span>
                </label>
              </Fragment>
            ))}
          </div>
        </Form>
        <section id="drank-list">
          <ul
            className={`grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 ${
              (isSubmitting || isLoading) &&
              "brightness-75 transition-[filter] delay-500 duration-500"
            }`}
          >
            {data.drinksByAlcohol
              .flatMap(({ drinks: drinker }) => drinker)
              .map((drink, index) => (
                <Fragment key={drink.id}>
                  <li className="overflow-hidden rounded-md shadow">
                    <DrankCard drink={drink} index={index} />
                  </li>
                </Fragment>
              ))}
          </ul>
        </section>
      </div>
    </>
  );
}
