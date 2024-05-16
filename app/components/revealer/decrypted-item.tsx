import { Button } from "../ui/button";
import { CheckIcon, CopyIcon, DownloadIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Label } from "../ui/label";
import { ItemProps } from "../builder/item";
import { useState } from "react";

export const DecryptedItem = ({ title, type, value }: ItemProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <div className="flex space-x-2 items-center mb-4">
      <div className="flex-1">
        <Label>{title}</Label>
        <p className="break-all bg-slate-50 p-2 rounded">
          <code>{value}</code>
        </p>
      </div>
      <div className="flex-none">
        <div className="flex space-x-2">
          {type == "text" && (
            <>
              {/* copy text */}
              <Button variant={"outline"} size={"icon"} onClick={handleCopy}>
                {isCopied ? <CheckIcon className="text-green-500 h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
              <Button variant={"outline"} size={"icon"}>
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </>
          )}

          {type == "multi" && (
            <>
              {/* copy text */}
              <Button variant={"outline"} size={"icon"} onClick={handleCopy}>
                {isCopied ? <CheckIcon className="text-green-500 h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
              <Button variant={"outline"} size={"icon"}>
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
