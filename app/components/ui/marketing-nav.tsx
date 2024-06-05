import { Link, NavLink } from "@remix-run/react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from "./navigation-menu";
import { Button } from "./button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipProvider } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "./tooltip";
const nav_links_left = [
  {
    name: "Browse Templates",
    href: "/sends/templates",
  },
];
const nav_links_right = [
  // {
  //   name: "Pricing",
  //   href: "/pricing",
  // },
  {
    name: "Documentation",
    href: "https://github.com/",
  },
  {
    name: "Security",
    href: "/security",
  },
];

export default function MarketingNav() {
  return (
    <nav className="border-b" id="marketing-nav">
      <div className="container py-2 flex items-center space-x-4 justify-between">
        {/* left nav */}
        <div className="flex items-center">
          <Link to={"/"}>
            <div className=" flex items-center">
              {/* <LogoIcon size="20px" color="#a8a29e" /> */}
              <span className="text-base font-bold tracking-tight">2Secured</span>
            </div>
          </Link>

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
        </div>

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
      </div>
    </nav>
  );
}
