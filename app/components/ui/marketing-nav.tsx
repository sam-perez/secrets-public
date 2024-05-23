import { Link } from "@remix-run/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

const nav_links = [
  {
    name: "Templates",
    href: "/templates",
  },
  {
    name: "Pricing",
    href: "#",
  },
  {
    name: "Documentation",
    href: "#",
  },
  {
    name: "Security",
    href: "#",
  },
];

export default function MarketingNav() {
  return (
    <nav className="border-b">
      <div className="container py-2 flex items-center space-x-4 justify-between">
        <Link to={"/"}>
          <div className=" flex items-center">
            {/* <LogoIcon size="20px" color="#a8a29e" /> */}
            <span className="text-base font-bold tracking-tight">2Secured</span>
          </div>
        </Link>
        <NavigationMenu className="hidden sm:block">
          <NavigationMenuList>
            {/* <NavigationMenuItem>
              <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
              <NavigationMenuContent className="w-64">
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem> */}
            {nav_links.map((link, index) => (
              <NavigationMenuItem key={index}>
                <Link to={link.href}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>{link.name}</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
