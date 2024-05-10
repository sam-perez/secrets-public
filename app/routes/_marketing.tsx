import { Outlet } from "@remix-run/react";

export default function MarketingLayout() {
  return (
    <>
      marketing nav
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}
