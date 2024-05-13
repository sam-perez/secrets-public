import { Outlet } from "@remix-run/react";
import MarketingNav from "~/components/ui/marketing-nav";

export default function MarketingLayout() {
  return (
    <>
      <MarketingNav />
      <div className="sm:container mt-4">
        <Outlet />
      </div>
    </>
  );
}
