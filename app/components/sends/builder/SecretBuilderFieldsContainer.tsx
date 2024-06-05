import { useState } from "react";

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
import { SendBuilderFieldWithId } from "./SecretFieldRenderer";
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

/**
 * The container for the secret builder fields. It handles the rendering a component to add new fields, and
 * renders the existing fields in a draggable list.
 */
export default function SecretBuilderFieldsContainer() {
  const { config: sendBuilderConfiguration, updateConfig } = useSendBuilderConfiguration();
  // TODO: figure out why dnd kit is flickering/transitioning incorrectly when re-ordering
  // For now, let's just have it snap. We achieve this by just re-rendering the component.
  const [rearrangeCount, setRearrangeCount] = useState<number>(0);

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
      setRearrangeCount(rearrangeCount + 1);
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

  const updateItem = (id: number, updatedField: Partial<Pick<SendBuilderField, "title" | "value">>) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedField,
        } as SendBuilderFieldWithId;
      }

      return item;
    });

    updateItems(updatedItems);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="px-4 pt-4">
          <h4 className="hover:bg-slate-50">
            <EditableText value={sendBuilderConfiguration.title} />
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
          <SecretFieldsContainer key={rearrangeCount} updateItem={updateItem} sendBuilderFields={items} />
        </DndContext>
      </div>
    </>
  );
}
