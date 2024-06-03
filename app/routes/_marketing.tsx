import { useEffect, useState } from "react";
import { Outlet } from "@remix-run/react";
import Footer from "~/components/ui/footer";
import MarketingNav from "~/components/ui/marketing-nav";
import { Toaster } from "~/components/ui/toaster";

export default function MarketingLayout() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server. We're getting some hydration errors,
  // so this is a workaround for now. The hydration errors are likely due to radix-ui.
  if (!isClient) {
    return null;
  }

  return (
    <>
      <MarketingNav />
      <div className="sm:container mt-4 flex flex-col min-h-screen">
        <Outlet />
        <Toaster />
      </div>
      <Footer />
    </>
  );
}
