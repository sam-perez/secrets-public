import { DndContext, closestCorners } from "@dnd-kit/core";
import { useState } from "react";
import { Column } from "./column";
const items = [
  {
    id: 1,
    title: "thing",
  },
  {
    id: 2,
    title: "thing 2",
  },
  {
    id: 3,
    title: "thing 3",
  },
];

export default function BuilderFields() {
  return (
    <>
      <div className="max-w-4xl mx-auto">
        <DndContext collisionDetection={closestCorners}>
          <Column items={items} />
        </DndContext>
      </div>
    </>
  );
}
