import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipProvider } from "@radix-ui/react-tooltip";
import { Link, NavLink } from "@remix-run/react";

import { Button } from "./button";
import LogoIcon from "./logo";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from "./navigation-menu";
import { TooltipContent, TooltipTrigger } from "./tooltip";

interface MarketingNavProps {
  hide_links?: boolean;
}

const nav_links_left = [
  {
    name: "Browse Templates",
    href: "/sends/templates",
  },
];
const nav_links_right = [
  {
    name: "Security",
    href: "/security",
  },
  // {
  //   name: "Github",
  //   href: "https://github.com/2Secured",
  // },
];

export default function MarketingNav({ hide_links }: MarketingNavProps) {
  return (
    <nav className="border-b" id="marketing-nav">
      <div className="container py-2 flex items-center space-x-4 justify-between">
        {/* left nav */}
        <div className="flex items-center">
          <Link to={"/"}>
            <div className=" flex items-center">
              <LogoIcon size="28px" color="#a8a29e" />
              <span className="ml-1 text-base font-bold tracking-tight">2Secured</span>
            </div>
          </Link>

          {!hide_links && (
            <NavigationMenu className="ml-8">
              <NavigationMenuList>
                {/* <NavigationMenuItem>
              <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
              <NavigationMenuContent className="w-64">
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem> */}
                {nav_links_left.map((link, index) => (
                  <NavLink to={link.href} key={index} className={navigationMenuTriggerStyle()}>
                    <NavigationMenuItem>{link.name}</NavigationMenuItem>
                  </NavLink>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        {!hide_links && (
          <NavigationMenu className="hidden sm:block">
            <NavigationMenuList>
              <Link to={"/sends/templates/new"}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant={"outline"}>
                        <PaperPlaneIcon className="h-3 w-3 mr-2" /> New Send
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Encrypted Send</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
              {nav_links_right.map((link, index) => (
                <NavLink key={index} to={link.href} className={navigationMenuTriggerStyle()}>
                  <NavigationMenuItem>{link.name}</NavigationMenuItem>
                </NavLink>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
    </nav>
  );
}
