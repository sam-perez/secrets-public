import { Outlet } from "@remix-run/react";

export default function AppLayout() {
    return (
        <>
            <main className="h-auto pt-20">
                <div className="container mx-auto ">
                    <Outlet />
                </div>
            </main>
        </>
    );
}
