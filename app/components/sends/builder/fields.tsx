import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Column } from "./column";
import { useState } from "react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Button } from "../../ui/button";
import EditableText from "./editableText";
import { SendBuilderConfiguration, SendBuilderField } from "./types";

/** Internally used type for the builder fields, id is required to play nicely with dnd-kit */
type SendBuilderFieldWithId = SendBuilderField & { id: number };

export default function BuilderFields({ builderConfiguration }: { builderConfiguration: SendBuilderConfiguration }) {
  const [items, setItems] = useState<Array<SendBuilderFieldWithId>>(
    builderConfiguration.fields.map((field, index) => ({ ...field, id: index }))
  );

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

    setItems((prevItems) => [...prevItems, newItem]);
  };

  const getItemPosition = (id: number) => items.findIndex((item) => item.id === id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id === over.id) return; //same position; ignore

    if (over) {
      setItems((items) => {
        const originalPos = getItemPosition(active.id as number);
        const newPos = getItemPosition(over.id as number);

        return arrayMove(items, originalPos, newPos);
      });
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
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates,
    // })
  );

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="px-4 pt-4">
          <h4 className="hover:bg-slate-50">
            <EditableText initialText={builderConfiguration.title} />
          </h4>
        </div>

        {/* menu TOOD refactor */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="link" className="w-full">
                    + Add Field
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new encrypted field to this form</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        {/* end menu */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <Column
            items={items.map((item) => ({
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
