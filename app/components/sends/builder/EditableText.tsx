import { useState } from "react";
import { Input } from "../../ui/input";

/**
 * The props for the EditableText component.
 */
interface EditableTextProps {
  initialText: string;
}

/**
 * An editable text component.
 *
 * A component used in various places in the builder to allow the user to edit text inline. Reports any changes
 * to the parent component.
 */
export const EditableText = ({ initialText }: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
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
    <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
      {isEditing ? (
        <Input type="text" value={text} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} />
      ) : (
        <span>{text || "Untitled"}</span>
      )}
    </div>
  );
};
