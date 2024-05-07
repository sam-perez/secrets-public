import { Outlet } from "@remix-run/react";

export default function AppLayout() {
  return (
    <>
      <main className="h-auto pt-10 sm:pt-20">
        <Outlet />
      </main>
    </>
  );
}
