import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { SecretFieldRenderer, SecretFieldRendererProps } from "./SecretFieldRenderer";

/**
 * Props for the SecretFieldsContainerProps component.
 */
type SecretFieldsContainerProps = {
  secretFields: SecretFieldRendererProps[];
};

/**
 * A container for the drag and droppable secret fields.
 *
 * It wraps each secret field renderer in a sortable context to allow the user to drag and drop the fields.
 */
export const SecretFieldsContainer = ({ secretFields }: SecretFieldsContainerProps) => {
  return (
    <>
      <div className="p-2">
        <SortableContext items={secretFields} strategy={verticalListSortingStrategy}>
          {secretFields.map((secretField) => (
            <SecretFieldRenderer
              title={secretField.title}
              key={secretField.id}
              id={secretField.id}
              type={secretField.type}
              value={secretField?.value}
              placeholder={secretField?.placeholder}
            />
          ))}
        </SortableContext>
      </div>
    </>
  );
};
