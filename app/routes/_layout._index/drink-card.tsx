import { Link, useSearchParams } from "@remix-run/react";
import { Image } from "@unpic/react";
import { slugify } from "@julianjark/notion-utils";
import type { Drink } from "~/notion-drinker/schema";
import { transform } from "./unpic-cloudinary";

interface DrinkCardProps {
  drink: Drink;
  index: number;
}
export const DrankCard = ({ drink, index }: DrinkCardProps) => {
  const [searchParams] = useSearchParams();
  const screenshot = searchParams.get("screenshot") === "true";
  return (
    <Link prefetch="intent" to={`${slugify(drink.title)}`}>
      <div className="group relative bg-gradient-to-b from-cyan-400 via-green-200 to-yellow-200">
        <Image
          width={200}
          aspectRatio={1 / 1.2}
          src={drink.illustrationUrl}
          priority={index < 6}
          className={
            "lg:hidden " +
            "transition-all duration-300 ease-in-out group-hover:scale-[1.1]"
          }
          background={screenshot ? undefined : "auto"}
          transformer={transform}
          style={{ backgroundPosition: "center" }}
          alt=""
        />
        <Image
          width={300}
          aspectRatio={1 / 1.2}
          src={drink.illustrationUrl}
          loading="eager"
          className={
            "hidden lg:block " +
            "transition-all duration-300 ease-in-out group-hover:scale-[1.1]"
          }
          background={screenshot ? undefined : "auto"}
          transformer={transform}
          style={{ backgroundPosition: "center" }}
          alt=""
        />
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
