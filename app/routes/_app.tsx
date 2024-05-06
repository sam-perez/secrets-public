import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { Outlet } from "@remix-run/react";

export default function AppLayout() {
    return (
        <>
            <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="sticky top-0 p-4 w-full">
                    <ul className="flex flex-col overflow-hidden">
                        <li>
                            <PaperPlaneIcon className="h-4 w-4 mr-2" />
                            Send
                        </li>
                        <li>Receive</li>
                        <li>Developers</li>
                    </ul>
                </div>
            </aside>
            <main className="p-4 md:ml-64 h-auto pt-20">
                <div className="container mx-auto ">
                    <Outlet />
                </div>
            </main>
        </>
    );
}
