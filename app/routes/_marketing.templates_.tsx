import { Link } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function Templates() {
  return (
    <>
      <h2>Templates</h2>
      <Link to={"/templates/bank-account"}>Bank Account</Link>
      <Card>
        <CardHeader>
          <CardTitle>Bank Account</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>stuff</CardContent>
      </Card>
    </>
  );
}
