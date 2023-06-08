import type { HeadersFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import { Outlet, useLoaderData } from "@remix-run/react";

import { Footer } from "./footer";
import { Header } from "./header";
import { getClient } from "@julianjark/notion-utils";
import { config } from "~/config.server";

export const loader = async () => {
  const images = await getClient(config.notionToken).getImageAssets(
    ["sitroner", "last-ned-fra-app-store"],
    {
      databaseId: config.imageAssetsDatabaseId,
      titleProperty: "Navn",
      srcProperty: "Bilde",
      altProperty: "Alt",
    }
  );

  return json({ images });
};
export const shouldRevalidate: ShouldRevalidateFunction = () => false;
export const headers: HeadersFunction = ({ loaderHeaders }) => loaderHeaders;

export default function Component() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="flex min-h-screen flex-col font-satoshi">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer images={data.images} />
    </div>
  );
}

export const dranksClasses = /*tw*/ {
  layoutPadding: "px-3 sm:px-6 md:px-12 lg:px-24 xl:px-36 2xl:px-48",
  layoutMaxWidth: "", // "mx-auto md:max-w-5xl lg:max-w-7xl",
} as const;
