import { Button } from "~/components/ui/button";

export default function TemplateDetails() {
  return (
    <>
      <div className="flex">
        <Button variant={"secondary"}>Send</Button>
        <Button variant={"secondary"}>Receive</Button>
      </div>
      <h2>Securely send or receive Bank Account details</h2>
      <p>
        Securely send your bank account information, or send a request to someone to provide their bank account
        information with this template using end-to-end encryption.
      </p>

      <Button>Start with this template</Button>
    </>
  );
}
