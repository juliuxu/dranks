import { slugify } from "@julianjark/notion-utils";
import type {
  HeadersFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { config } from "~/config.server";
import { assertItemFound } from "~/utils";
import { dranksClasses } from "../_layout/route";
import { NotionRender } from "@julianjark/notion-render";
import { drinksClient, notionClientCached } from "~/clients.server";
import { notionRenderComponents } from "~/components/notion-render-components";

export const loader = async ({ params }: LoaderArgs) => {
  const drink = (await drinksClient.getDrinksAndMetaInfo()).drinks.find(
    (drink) => slugify(drink.title) === params.slug
  );
  assertItemFound(drink);

  const [drinkWithNotionBody, images] = await Promise.all([
    drinksClient.getDrinkWithNotionBody(drink.id),
    notionClientCached.getImageAssets(["appelsiner"], {
      databaseId: config.imageAssetsDatabaseId,
      titleProperty: "Navn",
      srcProperty: "Bilde",
      altProperty: "Alt",
    }),
  ]);

  return json(
    {
      drink: drinkWithNotionBody,
      images,
    },
    {
      headers: {
        "Cache-Control": `public, max-age=${60}, must-revalidate, s-maxage=${60}, stale-while-revalidate=${
          60 * 60 * 24 * 30
        }`,
      },
    }
  );
};
export let headers: HeadersFunction = ({ loaderHeaders }) => loaderHeaders;

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.drink.title,
  },
  { name: "description", content: data?.drink.title },
];

export default function DrinkView() {
  const data = useLoaderData<typeof loader>();

  return (
    <div
      className={`flex flex-col gap-16 py-16 ${dranksClasses.layoutPadding} ${dranksClasses.layoutMaxWidth}`}
    >
      <h1 className="text-orange font-comico text-5xl italic">
        {data.drink.title}
      </h1>

      <div className="flex flex-col gap-14">
        {data.drink.preperations && (
          <div>
            <div id="Forberedelser" className="absolute -top-10" />
            <h2 className="text-orange mb-5 text-2xl">Forberedelser</h2>
            <NotionRender
              components={notionRenderComponents}
              blocks={data.drink.preperations}
            />
          </div>
        )}

        <div className="flex justify-between">
          <div className="flex w-2/3 flex-col gap-14">
            <div>
              <h2 className="text-orange mb-5 text-2xl" id="Ingredienser">
                Du trenger
              </h2>
              <NotionRender
                components={notionRenderComponents}
                blocks={data.drink.ingredients}
              />
            </div>

            <div>
              <h2 className="text-orange mb-5 text-2xl" id="Fremgangsmåte">
                Fremgangsmåte
              </h2>
              <NotionRender
                components={notionRenderComponents}
                blocks={data.drink.steps}
              />
            </div>

            {data.drink.notes && (
              <div>
                <h2 className="text-orange mb-5 text-2xl" id="Notater">
                  Notater
                </h2>
                <div className="flex flex-wrap gap-10">
                  <NotionRender
                    components={notionRenderComponents}
                    blocks={data.drink.notes}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative w-1/3 overflow-visible">
            {/* <Image
              priority
              layout="fullWidth"
              transformer={unpicTransformer}
              {...data.images.appelsiner}
              className="-mt-12"
            /> */}
            <img
              src={data.images.appelsiner.src}
              alt={data.images.appelsiner.alt}
              className="-mt-12"
            />
          </div>
        </div>

        {data.drink.references && (
          <div>
            <h2 className="text-orange mb-5 text-2xl" id="Referanser">
              Referanser
            </h2>
            <div className="flex flex-wrap gap-10">
              <NotionRender
                components={notionRenderComponents}
                blocks={data.drink.references}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
