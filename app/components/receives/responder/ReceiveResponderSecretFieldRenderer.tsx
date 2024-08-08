import { useRef } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { humanReadableFileSize } from "~/lib/utils";

import { ReceiveField } from "../builder/types";

/** The type for the response of the receive configuration */
export type ReceiveFieldWithId = ReceiveField & { id: number };

/**
 * Renders a secret field from a receive responder.
 *
 * Takes in the configuration required to render and receive the field, and
 * reports back the secret field's value to the parent component.
 *
 * TODO: This component has a lot of overlap with SendSecretFieldRenderer.
 * There might be a sensible refactor to combine these two.
 */
export const ReceiveResponderSecretFieldRenderer = ({
  receiveField,
  updateItem,
}: {
  receiveField: ReceiveFieldWithId;
  updateItem: (itemIndex: number, newItem: Partial<Pick<ReceiveField, "title" | "value">>) => void;
}) => {
  const { title, type, placeholder, value } = receiveField;

  const fileInputRef = useRef<HTMLInputElement | null>(null); // Create a ref for the file input

  return (
    <div className={"block"}>
      <div className="flex items-center p-2">
        <div className="w-full space-y-2">
          <Label className="hover:text-slate-600 w-full">{title}</Label>
          <div className="flex items-center space-x-2 justify-between" data-no-dnd="true">
            {type === "single-line-text" && (
              <Input
                type="text"
                placeholder={placeholder}
                value={value || ""}
                onChange={(event) => {
                  updateItem(receiveField.id, { value: event.target.value });
                }}
              />
            )}
            {type === "file" && (
              // We will need to render our own file input here, as the default input doesn't play nicely with dnd-kit.
              // The file that has been uploaded will be cleared on a rearrange if we use the default input.
              // eslint-disable-next-line max-len
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div
                onClick={() => {
                  if (fileInputRef.current !== null) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <input
                  type="file"
                  multiple={true}
                  ref={fileInputRef} // Attach the ref to the file input
                  onChange={(event) => {
                    const files = event.target.files;
                    if (files !== null && files.length > 0) {
                      updateItem(receiveField.id, { value: Array.from(files) });
                    }
                  }}
                  style={{ display: "none" }} // Hide the actual input element
                />
                <div>
                  {value !== null && value.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ flex: "1 1 auto", display: "flex", flexWrap: "wrap", alignContent: "flex-start" }}>
                        {value.map((f) => (
                          <Badge key={f.name} variant={"outline"} className="mr-2 cursor-pointer mt-2">
                            {f.name} ({humanReadableFileSize(f.size)})
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-2">
                        <Badge variant={"secondary"} className="cursor-pointer">
                          <span>Change</span>
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <Button variant={"secondary"}>Choose files</Button>
                  )}
                </div>
              </div>
            )}
            {type === "multi-line-text" && (
              <Textarea
                style={{ resize: "none" }}
                placeholder={placeholder}
                value={value || ""}
                onChange={(event) => {
                  updateItem(receiveField.id, { value: event.target.value });
                }}
                rows={(() => {
                  // Base number of rows is 4. We will resize automatically based on the number of lines in the text
                  // up to a maximum of 20 rows.
                  const MAX_ROWS = 20;
                  const MIN_ROWS = 4;

                  const rowsRequiredByText = (value || "").split("\n").length;

                  if (rowsRequiredByText < MIN_ROWS) {
                    return MIN_ROWS;
                  }

                  if (rowsRequiredByText > MAX_ROWS) {
                    return MAX_ROWS;
                  }

                  return rowsRequiredByText;
                })()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
