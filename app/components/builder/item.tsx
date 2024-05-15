import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "../ui/input";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Label } from "../ui/label";

export type ItemProps = {
  id: number;
  title: string;
  type: "text" | "file";
};

export const Item = ({ id, title, type }: ItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="block" style={style}>
      <div className="flex items-center p-2">
        <DragHandleDots2Icon className="h-4 w-4 flex-none mr-2 text-slate-400 hover:text-slate-800" />
        <div className="w-full space-y-1">
          <Label>{title}</Label>
          {type === "text" && <Input type="text" />}
          {type === "file" && <Input type="file" />}
        </div>
      </div>
    </div>
  );
};
