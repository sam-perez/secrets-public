import { CheckIcon, CopyIcon, DownloadIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { ReceiveBuilderTemplate } from "~/components/receives/builder/types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { SecretResponses, SecretValue } from "~/lib/secrets";

import { SendBuilderTemplate } from "../../sends/builder/types";

type DisplaySecretsProps = {
  template: SendBuilderTemplate | ReceiveBuilderTemplate;
  responses: SecretResponses;
};

type FilesProps = {
  files: SecretValue["files"];
};

const FilesList = ({ files }: FilesProps) => {
  return (
    <div>
      {files.map((file, index) => {
        // Convert Uint8Array to Blob
        const blob = new Blob([file.data], { type: "application/octet-stream" });

        // Create object URL
        const url = URL.createObjectURL(blob);

        return (
          <a href={url} download={file.name} key={index}>
            <Badge variant="outline" className="bg-white hover:bg-slate-100 mr-2">
              <DownloadIcon className="h-3 w-3 mr-1" />
              {file.name}
            </Badge>
          </a>
        );
      })}
    </div>
  );
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
                  </div>
                </div>
              </div>
            </>
          )}

          {field.type == "file" && (
            <>
              <div className="flex-1">
                <Label>{field.title}</Label>
                <div className="flex items-center space-x-2">
                  <FilesList files={responses[index].files} />
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
