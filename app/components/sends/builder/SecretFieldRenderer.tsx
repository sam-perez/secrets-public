import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "../../ui/input";
import { Cross1Icon, DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { EditableText } from "./EditableText";
import { SendBuilderField } from "./types";

/** Internally used type for the builder fields, id is required to play nicely with dnd-kit */
export type SendBuilderFieldWithId = SendBuilderField & { id: number };

/**
 * Renders a secret field in the builder.
 *
 * Takes in the configuration required to render and receive the secret field, and
 * reports back the secret field's value to the parent component.
 */
export const SecretFieldRenderer = ({
  sendBuilderField,
  updateItem,
}: {
  sendBuilderField: SendBuilderFieldWithId;
  updateItem: (itemIndex: number, newItem: Partial<Pick<SendBuilderField, "title" | "value">>) => void;
}) => {
  const { title, type, placeholder, value, id } = sendBuilderField;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null); // Create a ref for the file input

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="block" style={style}>
      <div className="flex items-center p-2">
        <DragHandleDots2Icon className="h-4 w-4 flex-none mr-2 text-slate-400 hover:text-slate-800" />
        <div className="w-full space-y-2">
          <Label className="hover:text-slate-600 w-full">
            <EditableText
              value={title}
              onChange={(updatedTitle) => {
                updateItem(sendBuilderField.id, { title: updatedTitle });
              }}
            />
          </Label>
          <div className="flex items-center space-x-2" data-no-dnd="true">
            {type === "single-line-text" && (
              <Input
                type="text"
                placeholder={placeholder}
                value={value || ""}
                onChange={(event) => {
                  updateItem(sendBuilderField.id, { value: event.target.value });
                }}
              />
            )}
            {type === "file" && (
              // We will need to render our own file input here, as the default input doesn't play nicely with dnd-kit
              // The file that has been uploaded will be cleared on a rearrange.
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
                  ref={fileInputRef} // Attach the ref to the file input
                  onChange={(event) => {
                    const files = event.target.files;
                    if (files !== null && files.length > 0) {
                      updateItem(sendBuilderField.id, { value: Array.from(files) });
                    }
                  }}
                  style={{ display: "none" }} // Hide the actual input element
                />
                <div>{value !== null && value.length > 0 ? value[0].name : "Click to select a file..."}</div>
              </div>
            )}
            {type === "multi-line-text" && (
              <Textarea
                placeholder={placeholder}
                value={value || ""}
                onChange={(event) => {
                  updateItem(sendBuilderField.id, { value: event.target.value });
                }}
              />
            )}
            <Button variant="outline" size="icon">
              <Cross1Icon className="h-3 w-3 flex-none" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
