import { Link, NavLink } from "@remix-run/react";

import { dranksClasses } from "./route";

export const Header = () => {
  const classes = /*tw*/ {
    link: "text-xl",
    linkActive: "underline underline-offset-4 text-dranks-orange",
    linkButton:
      "text-base uppercase rounded-xl w-40 h-12 text-center flex items-center justify-center transition hover:brightness-90",
  };
  return (
    <header>
      <nav className={`${dranksClasses.layoutPadding}`}>
        <ul className="flex min-h-[5rem] flex-wrap items-center gap-y-4 gap-x-8 py-4">
          <li>
            <NavLink
              prefetch="intent"
              to="/"
              end
              className={({ isActive }) =>
                `${classes.link} ${isActive && classes.linkActive}`
              }
            >
              Dranks
            </NavLink>
          </li>
          <li>
            <NavLink
              prefetch="intent"
              to="/sirup"
              className={({ isActive }) =>
                `${classes.link} ${isActive && classes.linkActive}`
              }
            >
              Sirup
            </NavLink>
          </li>
          <li>
            <NavLink
              prefetch="intent"
              to="/super-juice"
              className={({ isActive }) =>
                `${classes.link} ${isActive && classes.linkActive}`
              }
            >
              Super juice
            </NavLink>
          </li>
          <li>
            <NavLink
              prefetch="intent"
              to="/utstyr"
              className={({ isActive }) =>
                `${classes.link} ${isActive && classes.linkActive}`
              }
            >
              Utstyr
            </NavLink>
          </li>

          <li
            aria-hidden
            className="h-0 flex-grow-0 basis-full md:flex-grow md:basis-auto"
          />
          <li className="contents">
            <ul className="flex w-full flex-col gap-y-4 gap-x-5 md:w-auto md:flex-row lg:gap-x-8">
              <Link
                prefetch="intent"
                to="/quiz"
                className={`${classes.linkButton} w-full bg-dranks-orange text-white md:w-40`}
              >
                Quiz
              </Link>
              <Link
                prefetch="intent"
                to="/last-ned-app"
                className={`${classes.linkButton} w-full bg-light-orange md:w-40`}
              >
                Last ned app
              </Link>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};
