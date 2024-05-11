import { Outlet } from "@remix-run/react";

export default function MarketingLayout() {
  return (
    <>
      marketing nav
      <div className="sm:container">
        <Outlet />
      </div>
    </>
  );
}
