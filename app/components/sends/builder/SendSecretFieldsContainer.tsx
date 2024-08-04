import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { SendBuilderFieldWithId, SendSecretFieldRenderer } from "./SendSecretFieldRenderer";

/**
 * Props for the SecretFieldsContainerProps component.
 */
type SendSecretFieldsContainerProps = {
  sendBuilderFields: SendBuilderFieldWithId[];
  updateItem: (itemIndex: number, newItem: Partial<Pick<SendBuilderFieldWithId, "title" | "value">>) => void;
  deleteItem: (id: number) => void;
};

/**
 * A container for the drag and droppable secret fields.
 *
 * It wraps each secret field renderer in a sortable context to allow the user to drag and drop the fields.
 */
export const SendSecretFieldsContainer = ({
  sendBuilderFields,
  updateItem,
  deleteItem,
}: SendSecretFieldsContainerProps) => {
  return (
    <>
      <div className="p-2">
        <SortableContext items={sendBuilderFields} strategy={verticalListSortingStrategy}>
          {sendBuilderFields.map((sendBuilderField) => (
            <SendSecretFieldRenderer
              key={sendBuilderField.id}
              updateItem={updateItem}
              deleteItem={deleteItem}
              sendBuilderField={sendBuilderField}
            />
          ))}
        </SortableContext>
      </div>
    </>
  );
};
