import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "../ui/input";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Label } from "../ui/label";

export const Item = ({ id, title }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="block" style={style}>
      <div className="flex items-center">
        <DragHandleDots2Icon className="h-4 w-4" />
        <div className="w-full">
          <Label>{title}</Label>
          <Input />
        </div>
      </div>
    </div>
  );
};
