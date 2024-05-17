import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const EnterEmailToDecrypt = () => {
  return (
    <>
      <h4>Enter Email Address to View</h4>
      <p>
        The sender has restricted access to t...@...com. Please enter this email address below to receive a single-use
        code:
      </p>
      <Input placeholder="Enter email" />
      <Button>Continue</Button>

      <hr />

      <p>If the email you entered matches, you will receive a code. </p>

      <Input placeholder="Enter code" />

      <p className="muted">Didn&apos;t receive the email? Try checking your spam or resend it.</p>
      <Button>Submit</Button>
    </>
  );
};
