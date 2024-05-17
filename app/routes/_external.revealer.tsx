import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";
import { useState } from "react";
import AboutSidenav from "~/components/about-sidenav";
import { secretBlobProps } from "~/components/builder/fields";

import { DecryptedItem } from "~/components/revealer/DecryptedItem";
import { EnterEmailToDecrypt } from "~/components/revealer/EnterEmail";
import { EnterPasswordToDecrypt } from "~/components/revealer/EnterPassword";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

//load secretBlob data and use props from builder
const secretBlobDecrypted: secretBlobProps[] = [
  {
    secretHeader: {
      title: "Sending API Key",
      created: "Fri, 02 Feb 1996 03:04:05 GMT",
      expiration_date: "3d",
      expiration_views_remaining: 2,
      link: "https://2secured.link/req123#decryptionkey",
    },
    secretConfig: [
      {
        id: 1,
        title: "API Key Public",
        type: "text",
        placeholder: "enter it!",
        value: "kqkzqthhsrfdwaojqlsvrfcrastkaqveverrbsiunqqeefcmcxfptezav",
      },
      {
        id: 2,
        title: "API Key Private",
        type: "multi",
        placeholder: "enter it!",
        value: "kqkzqthhsrfdwaojqlsvrfcrastkaqveverrbsiunqqeefcmcxfptezavkqkzqthhsrfdwaojqlsvrfcrastkaqvv",
      },
      {
        id: 3,
        title: ".env file",
        type: "file",
        placeholder: "enter it!",
        value: "filename.txt",
      },
      {
        id: 4,
        title: "Has value",
        type: "text",
        placeholder: "enter it!",
        value: "has value",
      },
    ],
  },
];

export default function Revealer() {
  const [isCopied, setIsCopied] = useState(false);
  const decryptedData = secretBlobDecrypted[0];

  const handleLinkCopy = () => {
    if (!decryptedData.secretHeader.link) return;
    navigator.clipboard.writeText(decryptedData.secretHeader.link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <>
      {/* Enter password popup */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Enter Password Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-2">
            <EnterPasswordToDecrypt />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Enter Email Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-2">
            <EnterEmailToDecrypt />
          </div>
        </DialogContent>
      </Dialog>
      <div className="px-4 container max-w-5xl">
        <h3>{decryptedData.secretHeader.title}</h3>
        <p className="muted mb-4">
          Someone has securely shared this data with you via{" "}
          <Link target="_blank" to="https://2secured.link" rel="noreferrer">
            2Secured
          </Link>
          .
        </p>
        <div className="mx-auto lg:grid lg:max-w-7xl grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* share content  */}
            <div className="border p-4 rounded mb-4">
              {decryptedData.secretConfig.map((item) => (
                <DecryptedItem
                  id={item.id}
                  key={item.id}
                  title={item.title}
                  type={item.type}
                  value={item?.value}
                  placeholder={item?.placeholder}
                />
              ))}
              <div className="flex justify-between">
                <Button>Close</Button>
                <Button variant={"outline"}>Download All</Button>
              </div>
            </div>
          </div>
          <div>
            <aside className="sticky top-6">
              <div className="space-y-4 border-b pb-10 mb-10">
                <div>
                  <Label>Secure link</Label>
                  <div className="flex space-x-2">
                    <Input disabled={true} value={decryptedData.secretHeader.link} />
                    <Button variant={"outline"} size={"icon"} onClick={handleLinkCopy}>
                      {isCopied ? <CheckIcon className="text-green-500 h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Created on</Label>
                  <p>{decryptedData.secretHeader.created}</p>
                </div>

                <div>
                  <Label>Expires in</Label>
                  <p>
                    {decryptedData.secretHeader.expiration_date} or{" "}
                    {decryptedData.secretHeader.expiration_views_remaining} views
                  </p>
                </div>
              </div>
              {/* marketing    */}
              <div>
                <AboutSidenav showAbout={false} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
