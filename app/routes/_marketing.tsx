import { Outlet } from "@remix-run/react";
import Footer from "~/components/ui/footer";
import MarketingNav from "~/components/ui/marketing-nav";

export default function MarketingLayout() {
  return (
    <>
      <MarketingNav />
      <div className="sm:container mt-4 flex flex-col min-h-screen">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
