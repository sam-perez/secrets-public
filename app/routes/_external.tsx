import { Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";

import MarketingNav from "~/components/ui/marketing-nav";

export default function AppLayout() {
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
      <MarketingNav hide_links={true} />
      <main className="h-auto pt-4 sm:pt-10 px-4">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </>
  );
}
