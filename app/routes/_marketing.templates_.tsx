import { Link } from "@remix-run/react";

export default function Templates() {
  return (
    <>
      <h2>Templates</h2>
      <Link to={"/templates/bank-account"}>Bank Account</Link>
    </>
  );
}
