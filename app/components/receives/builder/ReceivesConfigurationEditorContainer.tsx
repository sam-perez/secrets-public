import {
  closestCorners,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { EditableText } from "~/components/ui/EditableText";

import { SecretBuilderConfigurationFooter } from "./ReceiveSecretBuilderConfigurationFooter";
import { ReceiveBuilderFieldWithId } from "./ReceiveSecretFieldRenderer";
import { ReceiveSecretFieldsContainer } from "./ReceiveSecretFieldsContainer";
import { ReceiveBuilderConfiguration, ReceiveBuilderField } from "./types";

/**
 * The container for the receive configuration editor.
 *
 * It handles the editing of the fields as well as the title of the receive.
 *
 * The notification configuration is handled by a child component.
 */
export const ReceivesConfigurationEditorContainer = ({
  templateConfig,
}: {
  templateConfig: ReceiveBuilderConfiguration;
}) => {
  const [receiveBuilderConfiguration, setReceiveBuilderConfiguration] = useState<ReceiveBuilderConfiguration>({
    ...templateConfig,
  });

  // For now, let's just have it snap. We achieve this by just re-rendering the component.
  const [rearrangeCount, setRearrangeCount] = useState<number>(0);

  const items = receiveBuilderConfiguration.fields.map((field, index) => ({ ...field, id: index + 1 }));

  const updateItems = (newItems: ReceiveBuilderFieldWithId[]) => {
    const newConfig = {
      ...receiveBuilderConfiguration,
      fields: newItems.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = item;

        return rest;
      }),
    };

    setReceiveBuilderConfiguration(newConfig);
  };

  const addItem = (type: ReceiveBuilderField["type"]) => {
    const newItemId = items.length + 1;
    let newItem: ReceiveBuilderFieldWithId;

    if (type === "single-line-text") {
      newItem = {
        id: newItemId,
        title: "New Field",
        type: "single-line-text",
        value: null,
      };
    } else if (type === "multi-line-text") {
      newItem = {
        id: newItemId,
        title: "New Field",
        type: "multi-line-text",
        value: null,
      };
    } else {
      newItem = {
        id: newItemId,
        title: "New Field",
        type: "file",
        value: null,
      };
    }

    updateItems([...items, newItem]);
  };

  const getItemPosition = (id: number) => items.findIndex((item) => item.id === id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id === over.id) return; //same position; ignore

    if (over) {
      const originalPos = getItemPosition(active.id as number);
      const newPos = getItemPosition(over.id as number);

      const updatedItems = arrayMove(items, originalPos, newPos);

      updateItems(updatedItems);
      setRearrangeCount(rearrangeCount + 1);
    }
  };

  //mobile and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    })
  );

  const updateItem = (id: number, updatedField: Partial<Pick<ReceiveBuilderField, "title" | "value">>) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedField,
        } as ReceiveBuilderFieldWithId;
      }

      return item;
    });

    updateItems(updatedItems);
  };

  const deleteItem = (id: number) => {
    const updatedItems = items.filter((item) => item.id !== id);

    updateItems(updatedItems);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="px-4 pt-4">
          <h4 className="hover:bg-slate-50">
            <EditableText
              value={receiveBuilderConfiguration.title}
              onChange={(newTitle) => {
                setReceiveBuilderConfiguration({ ...receiveBuilderConfiguration, title: newTitle });
              }}
            />
          </h4>
        </div>

        {/* menu TOOD refactor */}
        <div className="px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="">
                + Add Field
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Add Field</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => addItem("single-line-text")}>Text</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addItem("multi-line-text")}>Multiline Text</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addItem("file")}>File Upload</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* end menu */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <ReceiveSecretFieldsContainer
            key={rearrangeCount}
            updateItem={updateItem}
            deleteItem={deleteItem}
            receiveBuilderFields={items}
          />
        </DndContext>
      </div>
      <SecretBuilderConfigurationFooter
        receiveBuilderConfiguration={receiveBuilderConfiguration}
        updateNotificationConfig={(notificationConfig) => {
          setReceiveBuilderConfiguration({ ...receiveBuilderConfiguration, notificationConfig });
        }}
      />
    </>
  );
};
