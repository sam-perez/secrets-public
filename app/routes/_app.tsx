import { ArrowRightIcon, CodeIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { Link, Outlet } from "@remix-run/react";

const nav_links = [
  {
    href: "/sends",
    icon: PaperPlaneIcon,
    text: "Send",
  },
  {
    href: "/receive",
    icon: ArrowRightIcon,
    text: "Receive",
  },
  {
    href: "#",
    icon: CodeIcon,
    text: "Developers",
  },
];

export default function AppLayout() {
  return (
    <>
      <aside
        className={[
          "fixed",
          "top-0",
          "left-0",
          "z-40",
          "w-64",
          "h-screen",
          "pt-4",
          "transition-transform",
          "-translate-x-full",
          "bg-white",
          "border-r",
          "border-gray-200",
          "md:translate-x-0",
          "dark:bg-gray-800",
          "dark:border-gray-700",
        ].join(" ")}
      >
        <div className="sticky top-0 p-4 w-full">
          <div className="large mb-4">S2EE</div>
          <ul className="flex flex-col overflow-hidden">
            {nav_links.map((item, index) => (
              <li key={index} className="hover:bg-slate-100 py-3 px-2 rounded text-sm font-medium leading-none">
                <Link to={item.href} className="flex items-center">
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="p-4 md:ml-64 h-auto pt-8">
        <div className="container mx-auto ">
          <Outlet />
        </div>
      </main>
    </>
  );
}
