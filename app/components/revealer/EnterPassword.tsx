import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const EnterPasswordToDecrypt = () => {
  return (
    <>
      <h4>Enter Password to View</h4>
      <p>The sender has required a password to view this encrypted data. Please enter it below to continue.</p>
      <Input placeholder="Enter password" />
      <Button>Continue</Button>
    </>
  );
};
