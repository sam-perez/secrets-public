import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Item, ItemProps } from "./item";

type ColumnProps = {
  items: ItemProps[];
};

export const Column = ({ items }: ColumnProps) => {
  return (
    <>
      <div className="p-2">
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <Item
              title={item.title}
              key={item.id}
              id={item.id}
              type={item.type}
              value={item?.value}
              placeholder={item?.placeholder}
            />
          ))}
        </SortableContext>
      </div>
    </>
  );
};
