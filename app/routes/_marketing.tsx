import { useEffect, useState } from "react";
import { Outlet } from "@remix-run/react";
import Footer from "~/components/ui/footer";
import MarketingNav from "~/components/ui/marketing-nav";

export default function MarketingLayout() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

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
