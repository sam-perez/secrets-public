import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useRef } from "react";

import { Button } from "../../ui/button";
import { EditableText } from "../../ui/EditableText";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { ReceiveBuilderField } from "./types";

/** Internally used type for the builder fields, id is required to play nicely with dnd-kit */
export type ReceiveBuilderFieldWithId = ReceiveBuilderField & { id: number };

/**
 * Renders a secret field in the builder.
 *
 * Takes in the configuration required to render and receive the secret field, and
 * reports back the secret field's value to the parent component.
 */
export const ReceiveSecretFieldRenderer = ({
  receiveBuilderField,
  updateItem,
  deleteItem,
}: {
  receiveBuilderField: ReceiveBuilderFieldWithId;
  updateItem: (itemIndex: number, newItem: Partial<Pick<ReceiveBuilderField, "title" | "value">>) => void;
  deleteItem: (id: number) => void;
}) => {
  const { title, type, placeholder, id } = receiveBuilderField;

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
                updateItem(receiveBuilderField.id, { title: updatedTitle });
              }}
            />
          </Label>
          <div className="flex items-center space-x-2 justify-between" data-no-dnd="true">
            {type === "single-line-text" && (
              <Input type="text" placeholder={placeholder} readOnly={true} disabled={true} />
            )}
            {type === "file" && (
              // We will need to render our own file input here, as the default input doesn't play nicely with dnd-kit.
              // The file that has been uploaded will be cleared on a rearrange if we use the default input.
              // eslint-disable-next-line max-len
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div
                onClick={() => {
                  // deliberately non-interactable, this is just a form builder
                }}
              >
                <input
                  type="file"
                  multiple={true}
                  ref={fileInputRef} // Attach the ref to the file input
                  onChange={(event) => {
                    const files = event.target.files;
                    if (files !== null && files.length > 0) {
                      updateItem(receiveBuilderField.id, { value: Array.from(files) });
                    }
                  }}
                  style={{ display: "none" }} // Hide the actual input element
                  disabled={true}
                />
                <div>
                  <Button variant={"secondary"} disabled={true}>
                    Choose files
                  </Button>
                </div>
              </div>
            )}
            {type === "multi-line-text" && (
              <Textarea
                style={{ resize: "none" }}
                placeholder={placeholder}
                value={""}
                rows={4}
                readOnly={true}
                disabled={true}
              />
            )}

            <Button variant="ghost" size="icon" onClick={() => deleteItem(id)} tabIndex={-1}>
              <TrashIcon className="h-4 w-4 flex-none" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
