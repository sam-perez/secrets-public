import { CopyIcon, DownloadIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import AboutSidenav from "~/components/about-sidenav";
import { Button } from "~/components/ui/button";

const sends = [
  {
    name: "Sending API Key",
    email: "taylorballenger@gmail.com",
    created_on: "4/24/24",
    created_by: "taylorballenger@gmail.com",
    expires_in: "3d / 4 views",
    encrypted_data: [
      {
        key: "Instructions",
        value: "Please store your new api key somewhere safe!",
        type: "text",
      },
      {
        key: "API Secret",
        value: [
          "kqkzqthhsrfdwaojqlsvrfcrastkaqveverrbsiunqqeefcmcxfptezav",
          "jvbsyumpxmdxdisxxjytonhkcnnjqtoasdqbehysfsddzlsgxenwcxuqazznnxfgfiqcia",
        ].join(""),
        type: "text",
      },
      {
        key: "API Story",
        value: [
          "Check out our new font generator and level up your social bios.",
          "Need more? Head over to Glyphy for all the fancy fonts and cool symbols you could ever imagine.",
        ].join(""),
        type: "text",
      },
      {
        key: "Env file to use",
        value: "use_this.env.local",
        type: "file",
      },
    ],
  },
];

export default function Revealer() {
  const send = sends[0];

  return (
    <>
      <div className="px-4 container max-w-5xl">
        <h2>{send.name}</h2>
        <p className="muted mb-4">{send.email} has securely shared this data with you via s2ee.</p>
        <div className="mx-auto lg:grid lg:max-w-7xl grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* share content  */}
            <div className="border p-4 rounded mb-4">
              {send.encrypted_data.map((data, index) => (
                <div key={index} className="flex space-x-2 items-center mb-4">
                  <div className="flex-1">
                    <p className="font-medium pb-2">{data.key}</p>
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
                  <p>{send.created_on}</p>
                </div>
                <div>
                  <small>Created by</small>
                  <p>{send.created_by}</p>
                </div>
                <div>
                  <small>Expires in</small>
                  <p>{send.expires_in}</p>
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
