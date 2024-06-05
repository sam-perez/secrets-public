import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { SecretFieldRenderer, SendBuilderFieldWithId } from "./SecretFieldRenderer";

/**
 * Props for the SecretFieldsContainerProps component.
 */
type SecretFieldsContainerProps = {
  sendBuilderFields: SendBuilderFieldWithId[];
  updateItem: (itemIndex: number, newItem: Partial<Pick<SendBuilderFieldWithId, "title" | "value">>) => void;
};

/**
 * A container for the drag and droppable secret fields.
 *
 * It wraps each secret field renderer in a sortable context to allow the user to drag and drop the fields.
 */
export const SecretFieldsContainer = ({ sendBuilderFields, updateItem }: SecretFieldsContainerProps) => {
  return (
    <>
      <div className="p-2">
        <SortableContext items={sendBuilderFields} strategy={verticalListSortingStrategy}>
          {sendBuilderFields.map((sendBuilderField) => (
            <SecretFieldRenderer
              key={sendBuilderField.id}
              updateItem={updateItem}
              sendBuilderField={sendBuilderField}
            />
          ))}
        </SortableContext>
      </div>
    </>
  );
};
