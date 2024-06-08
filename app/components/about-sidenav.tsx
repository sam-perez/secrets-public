import { GlobeIcon, LockClosedIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";

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
    text: "Using AES-256 Encryption Algorithm",
  },
  {
    icon: QuestionMarkCircledIcon,
    text: "Have more questions?",
  },
];

export default function AboutSidenav({ showAbout }: AboutSidenavProps) {
  return (
    <div className="pt-6 border-t">
      {marketing.map((item, index) => (
        <div key={index} className="text-sm text-slate-600">
          <div className="flex mb-4 space-x-4">
            <item.icon className="h-4 w-4 flex-none" />
            <span>{item.text}</span>
          </div>
        </div>
      ))}
      {showAbout && (
        <div className="border-t pt-6 mt-6 text-slate-600">
          <p>
            <Link className="font-medium hover:text-slate-500" to={"/"}>
              2Secured
            </Link>{" "}
            is a free, secure way to send or request sensitive info securely using end-to-end encryption.
          </p>
        </div>
      )}
    </div>
  );
}
