import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { ReceiveBuilderFieldWithId, ReceiveSecretFieldRenderer } from "./ReceiveSecretFieldRenderer";

/**
 * Props for the SecretFieldsContainerProps component.
 */
type ReceiveSecretFieldsContainerProps = {
  receiveBuilderFields: ReceiveBuilderFieldWithId[];
  updateItem: (itemIndex: number, newItem: Partial<Pick<ReceiveBuilderFieldWithId, "title" | "value">>) => void;
  deleteItem: (id: number) => void;
};

/**
 * A container for the drag and droppable secret fields.
 *
 * It wraps each secret field renderer in a sortable context to allow the user to drag and drop the fields.
 */
export const ReceiveSecretFieldsContainer = ({
  receiveBuilderFields,
  updateItem,
  deleteItem,
}: ReceiveSecretFieldsContainerProps) => {
  return (
    <>
      <div className="p-2">
        <SortableContext items={receiveBuilderFields} strategy={verticalListSortingStrategy}>
          {receiveBuilderFields.map((receiveBuilderField) => (
            <ReceiveSecretFieldRenderer
              key={receiveBuilderField.id}
              updateItem={updateItem}
              deleteItem={deleteItem}
              receiveBuilderField={receiveBuilderField}
            />
          ))}
        </SortableContext>
      </div>
    </>
  );
};
