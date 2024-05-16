import { useState } from "react";
import { Input } from "../ui/input";

interface initialTextProps {
  initialText: string;
}

const EditableText = ({ initialText }: initialTextProps) => {
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

  return (
    <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
      {isEditing ? (
        <Input type="text" value={text} onChange={handleChange} onBlur={handleBlur} />
      ) : (
        <span>{text || "Untitled"}</span>
      )}
    </div>
  );
};

export default EditableText;
