import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Cross1Icon, DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useRef } from "react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { EditableText } from "./EditableText";
import { SendBuilderField } from "./types";
import { Badge } from "~/components/ui/badge";

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
  deleteItem,
}: {
  sendBuilderField: SendBuilderFieldWithId;
  updateItem: (itemIndex: number, newItem: Partial<Pick<SendBuilderField, "title" | "value">>) => void;
  deleteItem: (id: number) => void;
}) => {
  const { title, type, placeholder, value, id } = sendBuilderField;

  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    transition: null,
  });

  const computedTransform =
    transform !== null
      ? {
          x: transform.x,
          y: transform.y,
          scaleX: transform.scaleX,
          // No y scaling when dragging please
          scaleY: 1,
        }
      : null;

  const style = {
    transition,
    transform: CSS.Transform.toString(computedTransform),
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null); // Create a ref for the file input

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "auto";
    }
  }, [isDragging]);

  return (
    <div ref={setNodeRef} className={"block"} style={{ ...style, opacity: isDragging ? 0.5 : 1 }}>
      <div className="flex items-center p-2">
        <DragHandleDots2Icon
          {...listeners}
          className={[
            "h-4",
            "w-4",
            "flex-none",
            "mr-2",
            "text-slate-400",
            "hover:text-slate-800",
            ...(isDragging ? ["hover:cursor-grabbing"] : ["hover:cursor-grab"]),
          ].join(" ")}
        />
        <div className="w-full space-y-2">
          <Label className="hover:text-slate-600 w-full">
            <EditableText
              value={title}
              onChange={(updatedTitle) => {
                updateItem(sendBuilderField.id, { title: updatedTitle });
              }}
            />
          </Label>
          <div className="flex items-center space-x-2 justify-between" data-no-dnd="true">
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
                      updateItem(sendBuilderField.id, { value: Array.from(files) });
                    }
                  }}
                  style={{ display: "none" }} // Hide the actual input element
                />
                <div>
                  {value !== null && value.length > 0 ? (
                    value.map((f) => (
                      <Badge key={f.name} variant={"secondary"} className="mr-2">
                        {f.name}
                      </Badge>
                    ))
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
                  updateItem(sendBuilderField.id, { value: event.target.value });
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

            <Button variant="ghost" size="icon" onClick={() => deleteItem(id)}>
              <TrashIcon className="h-4 w-4 flex-none" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
