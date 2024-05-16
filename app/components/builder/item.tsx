import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "../ui/input";
import { Cross1Icon, DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import EditableText from "./editableText";

export interface ItemProps {
  id: number;
  title: string;
  type: "text" | "file" | "multi";
  value?: string;
  placeholder?: string;
}

export const Item = ({ id, title, type, placeholder, value }: ItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="block" style={style}>
      <div className="flex items-center p-2">
        <DragHandleDots2Icon className="h-4 w-4 flex-none mr-2 text-slate-400 hover:text-slate-800" />
        <div className="w-full space-y-2">
          <Label>
            {/* TODO */}
            <EditableText initialText={title} />
          </Label>
          <div className="flex items-center space-x-2" data-no-dnd="true">
            {type === "text" && <Input type="text" placeholder={placeholder} value={value} />}
            {type === "file" && <Input type="file" />}
            {type === "multi" && <Textarea placeholder={placeholder} />}
            <Button variant="outline" size="icon">
              <Cross1Icon className="h-3 w-3 flex-none" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
