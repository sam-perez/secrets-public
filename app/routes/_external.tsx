import { useEffect, useState } from "react";
import { Outlet } from "@remix-run/react";

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
      <main className="h-auto pt-10 sm:pt-20">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </>
  );
}
