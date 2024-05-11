import { Link } from "@remix-run/react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { GlobeIcon, InfoCircledIcon, LockClosedIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";

interface AboutSidenavProps {
  showAbout: boolean;
}

const marketing = [
  {
    icon: LockClosedIcon,
    text: "All of your information is end-to-end encrypted; only you have the decryption token.",
  },
  {
    icon: GlobeIcon,
    text: "PCI DSS bank-level security",
  },
  {
    icon: QuestionMarkCircledIcon,
    text: "Have more questions?",
  },
];

export default function AboutSidenav({ showAbout }: AboutSidenavProps) {
  return (
    <>
      {showAbout && (
        <div className="mb-8">
          <Link to={"/"}>
            <Alert className="bg-slate-50 hover:bg-slate-100">
              <InfoCircledIcon className="h-4 w-4" />
              <AlertTitle>About 2Secure</AlertTitle>
              <AlertDescription>
                2Secure is a free, secure way to send or request sensitive information securely using end-to-end
                encryption.
              </AlertDescription>
            </Alert>
          </Link>
        </div>
      )}

      {marketing.map((item, index) => (
        <div key={index} className="flex items-top text-sm text-slate-600 space-x-4 mb-4 mt-4 px-4">
          <item.icon className="h-5 w-5 flex-none" />
          <span>{item.text}</span>
        </div>
      ))}
    </>
  );
}
