import { slugify } from "@julianjark/notion-utils";
import { Link } from "@remix-run/react";
import type { Drink } from "~/notion-drinker/schema";

interface DrinkCardProps {
  drink: Drink;
  index: number;
}
export const DrankCard = ({ drink, index }: DrinkCardProps) => {
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
