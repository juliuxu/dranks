import { Fragment, useMemo } from "react";
import type {
  HeadersFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import { dranksClasses } from "../_layout/route";
import { getDrinks, getDrinksMetainfo } from "~/notion-drinker/client";
import { config } from "~/config.server";
import { z } from "zod";
import { debounce } from "~/utils";
import type { Alcohol, Drink } from "~/notion-drinker/schema";
import { slugify } from "@julianjark/notion-utils";

const querySchema = z.object({
  q: z.string().optional(),
  alcohols: z
    .array(z.string())
    .or(z.string().transform((val) => [val]))
    .optional(),
});

export const loader = async ({ request }: LoaderArgs) => {
  const startFetchTime = performance.now();
  const [drinks, drinksMetainfo] = await Promise.all([
    getDrinks({
      notionToken: config.notionToken,
      notionDatabaseId: config.drinksDatabaseId,
    }),
    getDrinksMetainfo({
      notionToken: config.notionToken,
      notionDatabaseId: config.drinksDatabaseId,
    }),
  ]);
  const fetchTime = Math.round(performance.now() - startFetchTime);

  // Filtering
  const filter = querySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams.entries())
  );
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
  const alcohols = drinksMetainfo.alchohols.filter((alcohol) =>
    drinks.some((drink) => drink.alcohol.title === alcohol.title)
  );

  const drinksByAlcohol = alcohols.map((alcohol) => ({
    alcohol,
    drinks: drinksFiltered.filter(
      (drink) => drink.alcohol.title === alcohol.title
    ),
  }));

  return json(
    {
      alcohols,
      drinks: drinksFiltered,
      drinksByAlcohol,
      filter,
    },
    {
      headers: {
        "Server-Timing": `fetch;dur=${fetchTime}`,
      },
    }
  );
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
  const submitDebounced = useMemo(() => debounce(submit, 200), []);

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

interface DrinkCardProps {
  drink: Drink;
  index: number;
}
const DrankCard = ({ drink, index }: DrinkCardProps) => {
  return (
    <Link prefetch="intent" to={`${slugify(drink.title)}`} preventScrollReset>
      <div className="group relative bg-gradient-to-b from-cyan-400 via-green-200 to-yellow-200">
        {/* <Image
          width={300}
          aspectRatio={1 / 1.2}
          src={drank.Illustrasjon}
          transformer={unpicTransformer}
          priority={index < 6}
          className="transition-all duration-300 ease-in-out group-hover:scale-[1.1]"
          background="auto"
          style={{ backgroundPosition: "center" }}
        /> */}
        <img src={drink.illustrationUrl} alt="" />
        <span
          className="absolute bottom-0 p-4 text-2xl font-semibold text-white drop-shadow-lg"
          style={{ textShadow: "0 0 10px rgb(0 0 0 / 33%)" }}
        >
          {drink.title}
        </span>
      </div>
    </Link>
  );
};
