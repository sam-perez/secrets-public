import { Link } from "@remix-run/react";

export default function Footer() {
  return (
    <>
      <footer className="bg-white border-t mt-4 dark:bg-gray-800">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2024{" "}
            <Link to="https://2secured.link/" className="hover:underline">
              2Secured
            </Link>
            . All Rights Reserved.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 sm:mt-0">
            <li>
              <Link to="#" className="hover:underline me-4 md:me-6">
                About
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
