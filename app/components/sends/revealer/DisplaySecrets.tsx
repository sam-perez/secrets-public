import { SecretResponses } from "~/lib/secrets";
import { SendBuilderTemplate } from "../builder/types";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { CheckIcon, CopyIcon, DownloadIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useState } from "react";

type DisplaySecretsProps = {
  template: SendBuilderTemplate;
  responses: SecretResponses;
};

export const DisplaySecrets = ({ template, responses }: DisplaySecretsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (index: number) => {
    const textToCopy = responses[index].textValues[0];
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000); // Reset copied state after 1 seconds
  };

  const isCopied = (index: number) => copiedIndex === index;

  return (
    <div className="border p-4 rounded-lg mb-4 bg-slate-50">
      {template.fields.map((field, index) => (
        <div key={index} className="flex space-x-2 items-center mb-4">
          {field.type == "single-line-text" && (
            <>
              <div className="flex-1">
                <Label>{field.title}</Label>
                <div className="flex space-x-2">
                  <p className="w-full break-all bg-white p-2 rounded">
                    <code>{responses[index].textValues[0]}</code>
                  </p>
                  <div className="flex-none space-x-1">
                    <Button variant={"outline"} size={"icon"} onClick={() => handleCopy(index)}>
                      {isCopied(index) ? (
                        <CheckIcon className="text-green-500 h-4 w-4" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant={"outline"} size={"icon"}>
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {field.type == "multi-line-text" && (
            <>
              <div className="flex-1">
                <Label>{field.title}</Label>
                <div className="flex space-x-2">
                  <p className="w-full break-all bg-white p-2 rounded">{responses[index].textValues[0]}</p>
                  <div className="flex-none space-x-1">
                    <Button variant={"outline"} size={"icon"} onClick={() => handleCopy(index)}>
                      {isCopied(index) ? (
                        <CheckIcon className="text-green-500 h-4 w-4" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant={"outline"} size={"icon"}>
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {field.type == "file" && (
            //TODO file download
            <>
              <div className="flex-1">
                <Label>{field.title}</Label>
                <div className="flex items-center space-x-2">
                  <p className="break-all bg-white p-2 rounded w-full">
                    <code>File Name: {responses[index].files[0].name}</code>
                  </p>
                  {/* Display the file here based on responses[index].files[0].data */}
                  <div className="flex-none space-x-1">
                    <Button variant={"outline"} size={"icon"}>
                      <EyeOpenIcon className="h-4 w-4" />
                    </Button>
                    <Button variant={"outline"} size={"icon"}>
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
