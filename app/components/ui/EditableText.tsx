import { Pencil1Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import { Input } from "./input";

/**
 * The props for the EditableText component.
 */
interface EditableTextProps {
  value?: string;
  defaultValue?: string;
  onChange?: (newText: string) => void;
}

/**
 * An editable text component.
 *
 * A component used in various places in the builder to allow the user to edit text inline. Reports any changes
 * to the parent component.
 */
export const EditableText = ({ defaultValue, value, onChange }: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState<string>(value || defaultValue || "");

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    setText(value);
  }, [value]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setText(text);
    onChange?.(text);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Save the changes or perform any required actions here
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleBlur();
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={handleClick} className="cursor-pointer">
      {isEditing ? (
        <Input type="text" value={text} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} />
      ) : (
        <div className="group/item flex items-center">
          <span>{text || "Untitled"}</span>
          <span className="group/edit invisible text-slate-500 group-hover/item:visible">
            <Pencil1Icon className="w-4 h-4 ml-1" />
          </span>
        </div>
      )}
    </div>
  );
};
