import { CheckIcon, CopyIcon, DownloadIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { SendBuilderField } from "../builder/types";

export const DecryptedItem = ({ senderBuildField }: { senderBuildField: SendBuilderField }) => {
  const [isCopied, setIsCopied] = useState(false);

  const { title, type, value } = senderBuildField;

  const handleCopy = () => {
    if (!value) return;
    if (type === "file") return; // Don't copy files to clipboard (for now)
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
  };

  const handleDownload = () => {
    if (!value) return;
    if (type === "file") return; // Don't download files (for now

    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.txt`; // Use title to name the file
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex space-x-2 items-center mb-4">
      <div className="flex-1">
        <Label>{title}</Label>
        <p className="break-all bg-slate-50 p-2 rounded">
          {type === "file" ? (
            // TODO: display multiple files correctly? Are we even supporting multiple files?
            <code>{value === null ? "No file uploaded" : value.map(({ name }) => name).join(" ")}</code>
          ) : (
            <code>{value}</code>
          )}
        </p>
      </div>
      <div className="flex-none">
        <div className="flex space-x-2">
          {type === "single-line-text" && (
            <>
              <Button variant={"outline"} size={"icon"} onClick={handleCopy}>
                {isCopied ? <CheckIcon className="text-green-500 h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
              <Button variant={"outline"} size={"icon"} onClick={handleDownload}>
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </>
          )}

          {type == "multi-line-text" && (
            <>
              <Button variant={"outline"} size={"icon"} onClick={handleCopy}>
                {isCopied ? <CheckIcon className="text-green-500 h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
              <Button variant={"outline"} size={"icon"} onClick={handleDownload}>
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </>
          )}

          {type == "file" && (
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
  );
};
