import { CopyIcon, DownloadIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";
import AboutSidenav from "~/components/about-sidenav";
import { secretBlobProps } from "~/components/builder/fields";
import { Button } from "~/components/ui/button";

//load secretBlob data and use props from builder
const secretBlobDecrypted: secretBlobProps[] = [
  {
    secretHeader: {
      title: "Sending API Key",
      created: "Fri, 02 Feb 1996 03:04:05 GMT",
      expiration_date: "3d",
      expiration_views_remaining: 2,
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
  const send = secretBlobDecrypted[0];

  return (
    <>
      <div className="px-4 container max-w-5xl">
        <h2>{send.secretHeader.title}</h2>
        <p className="muted mb-4">
          Someone has securely shared this data with you via{" "}
          <Link target="_blank" to="https://2secured.link" rel="noreferrer">
            2Secured
          </Link>
        </p>
        <div className="mx-auto lg:grid lg:max-w-7xl grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* share content  */}
            <div className="border p-4 rounded mb-4">
              {send.secretConfig.map((data, index) => (
                <div key={index} className="flex space-x-2 items-center mb-4">
                  <div className="flex-1">
                    <p className="font-medium pb-2">{data.title}</p>
                    <p className="break-all bg-slate-50 p-2 rounded">
                      <code>{data.value}</code>
                    </p>
                  </div>
                  <div className="flex-none">
                    <div className="flex space-x-2">
                      {data.type == "text" && (
                        <>
                          {/* copy text */}
                          <Button variant={"outline"} size={"icon"}>
                            <CopyIcon className="h-4 w-4" />
                          </Button>
                          <Button variant={"outline"} size={"icon"}>
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {data.type == "file" && (
                        <>
                          <Button variant={"outline"} size={"icon"}>
                            <EyeOpenIcon className="h-4 w-4" />
                          </Button>
                          <Button variant={"outline"} size={"icon"}>
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
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
                  <small>Created on</small>
                  <p>{send.secretHeader.created}</p>
                </div>

                <div>
                  <small>Expires in</small>
                  <p>
                    {send.secretHeader.expiration_date} / {send.secretHeader.expiration_views_remaining} views
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
