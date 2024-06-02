import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "../../ui/input";
import { Cross1Icon, DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { EditableText } from "./EditableText";
import { SendBuilderField } from "./types";

/**
 * Props for the SecretFieldRenderer component.
 */
export interface SecretFieldRendererProps {
  id: number;
  title: string;
  type: SendBuilderField["type"];
  value?: string;
  placeholder?: string;
}

/**
 * Renders a secret field in the builder.
 *
 * Takes in the configuration required to render and receive the secret field, and
 * reports back the secret field's value to the parent component.
 */
export const SecretFieldRenderer = ({ id, title, type, placeholder, value }: SecretFieldRendererProps) => {
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
          <Label className="hover:text-slate-600 w-full">
            {/* TODO */}
            <EditableText initialText={title} />
          </Label>
          <div className="flex items-center space-x-2" data-no-dnd="true">
            {type === "single-line-text" && <Input type="text" placeholder={placeholder} value={value} />}
            {type === "file" && <Input type="file" />}
            {type === "multi-line-text" && <Textarea placeholder={placeholder} />}
            <Button variant="outline" size="icon">
              <Cross1Icon className="h-3 w-3 flex-none" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
