import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { SecretFieldsContainer } from "./SecretFieldsContainer";
import { useSendBuilderConfiguration } from "./SendBuilderConfigurationContextProvider";
import { arrayMove } from "@dnd-kit/sortable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

import { Button } from "../../ui/button";

import { SendBuilderField } from "./types";
import { EditableText } from "./EditableText";

/** Internally used type for the builder fields, id is required to play nicely with dnd-kit */
type SendBuilderFieldWithId = SendBuilderField & { id: number };

/**
 * The container for the secret builder fields. It handles the rendering a component to add new fields, and
 * renders the existing fields in a draggable list.
 */
export default function SecretBuilderFieldsContainer() {
  const { config: sendBuilderConfiguration, updateConfig } = useSendBuilderConfiguration();

  const items = sendBuilderConfiguration.fields.map((field, index) => ({ ...field, id: index + 1 }));

  const updateItems = (newItems: SendBuilderFieldWithId[]) => {
    updateConfig({
      fields: newItems.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = item;

        return rest;
      }),
    });
  };

  const addItem = (type: SendBuilderField["type"]) => {
    const newItemId = items.length + 1;
    let newItem: SendBuilderFieldWithId;

    if (type === "single-line-text") {
      newItem = {
        id: newItemId,
        title: "New Field",
        type: "single-line-text",
        value: null,
      };
    } else if (type === "multi-line-text") {
      newItem = {
        id: newItemId,
        title: "New Field",
        type: "multi-line-text",
        value: null,
      };
    } else {
      newItem = {
        id: newItemId,
        title: "New Field",
        type: "file",
        value: null,
      };
    }

    updateItems([...items, newItem]);
  };

  const getItemPosition = (id: number) => items.findIndex((item) => item.id === id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id === over.id) return; //same position; ignore

    if (over) {
      const originalPos = getItemPosition(active.id as number);
      const newPos = getItemPosition(over.id as number);

      const updatedItems = arrayMove(items, originalPos, newPos);

      updateItems(updatedItems);
    }
  };

  //mobile and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    })
  );

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="px-4 pt-4">
          <h4 className="hover:bg-slate-50">
            <EditableText initialText={sendBuilderConfiguration.title} />
          </h4>
        </div>

        {/* menu TOOD refactor */}
        <div className="px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="">
                + Add Field
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Add Field</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => addItem("single-line-text")}>Text</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addItem("multi-line-text")}>Multiline Text</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addItem("file")}>File Upload</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* end menu */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <SecretFieldsContainer
            secretFields={items.map((item) => ({
              id: item.id,
              title: item.title,
              type: item.type,
              // TODO: handle nulls and files properly
              value: item.value === null ? undefined : typeof item.value === "string" ? item.value : "FILES",
              placeholder: item.placeholder,
            }))}
          />
        </DndContext>
      </div>
    </>
  );
}
