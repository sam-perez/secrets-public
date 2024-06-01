import { SecretResponses } from "~/lib/secrets";
import { SendBuilderTemplate } from "../builder/types";
import { Label } from "~/components/ui/label";

type DisplaySecretsProps = {
  template: SendBuilderTemplate;
  responses: SecretResponses;
};

export const DisplaySecrets = ({ template, responses }: DisplaySecretsProps) => {
  return (
    <div>
      {template.fields.map((field, index) => (
        <div key={index} className="flex space-x-2 items-center mb-4">
          {field.type == "single-line-text" && (
            <>
              <div className="flex-1">
                <Label>{field.title}</Label>
                <p className="break-all bg-slate-50 p-2 rounded">
                  <code>{responses[index].textValues[0]}</code>
                </p>
              </div>
              <div>actions</div>
            </>
          )}

          {field.type == "multi-line-text" && (
            <>
              <div className="flex-1">
                <Label>{field.title}</Label>
                <p className="break-all bg-slate-50 p-2 rounded">multi {responses[index].textValues[0]}</p>
              </div>
              <div>actions</div>
            </>
          )}

          {field.type == "file" && (
            <>
              <div className="flex-1">
                <Label>{field.title}</Label>
                <p className="break-all bg-slate-50 p-2 rounded">File Name: {responses[index].files[0].name}</p>
                {/* Display the file here based on responses[index].files[0].data */}
              </div>
              <div>actions</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
