import {
  DndContext,
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

const itemsData: ItemProps[] = [
  {
    id: 1,
    title: "API Key Public",
    type: "text",
  },
  {
    id: 2,
    title: "API Secret",
    type: "text",
  },
  {
    id: 3,
    title: "thing 3",
    type: "text",
  },
  {
    id: 4,
    title: "file",
    type: "file",
  },
];

export default function BuilderFields() {
  const [items, setItems] = useState(itemsData);

  const getItemPosition = (id: number) => items.findIndex((item) => item.id === id);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id === over.id) return; //same position; ignore

    setItems((items) => {
      const originalPos = getItemPosition(active.id);
      const newPos = getItemPosition(over.id);

      return arrayMove(items, originalPos, newPos);
    });
  };

  //mobile and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <Column items={items} />
        </DndContext>
      </div>
    </>
  );
}
