import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Column } from "./column";
import { useState } from "react";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ItemProps } from "./item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import EditableText from "./editableText";

interface secretBlobProps {
  secretHeader: {
    title: string;
  };
  secretConfig: ItemProps[];
}

const secretBlob: secretBlobProps[] = [
  {
    secretHeader: {
      title: "API Header",
    },
    secretConfig: [
      {
        id: 1,
        title: "API Key Public",
        type: "text",
        placeholder: "enter it!",
      },
      {
        id: 2,
        title: "API Key Public",
        type: "multi",
        placeholder: "enter it!",
      },
      {
        id: 3,
        title: ".env file",
        type: "file",
        placeholder: "enter it!",
      },
      {
        id: 4,
        title: "Has value",
        type: "text",
        placeholder: "enter it!",
        value: "has value",
      },
    ],
  },
];

// const secretConfig: ItemProps[] = [
//   {
//     id: 1,
//     title: "API Key Public",
//     type: "text",
//     value: "has a value",
//   },
//   {
//     id: 2,
//     title: "API Secret",
//     type: "text",
//   },
//   {
//     id: 3,
//     title: "thing 3",
//     type: "text",
//   },
//   {
//     id: 4,
//     title: "file",
//     type: "file",
//   },
// ];

export default function BuilderFields() {
  //get items from the returned data
  const [items, setItems] = useState(secretBlob[0].secretConfig);

  //add new item button
  const addItem = (type: "text" | "file" | "multi") => {
    const newItemId = items.length + 1;
    const newItem: ItemProps = {
      id: newItemId,
      title: type === "text" ? `New Text Item ${newItemId}` : `New File Item ${newItemId}`,
      type: type,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };
  //end

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
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  console.log(secretBlob[0].secretConfig);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="p-4">
          <h4>
            <EditableText initialText="edit me" />
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
              <DropdownMenuItem onClick={() => addItem("text")}>Text</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addItem("multi")}>Multiline Text</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addItem("file")}>File Upload</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* end menu */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <Column items={items} />
        </DndContext>
      </div>
    </>
  );
}
