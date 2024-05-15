import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Item, ItemProps } from "./item";

type ColumnProps = {
  items: ItemProps[];
};

export const Column = ({ items }: ColumnProps) => {
  return (
    <>
      <div className="bg-red-50 p-5">
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <Item title={item.title} key={item.id} id={item.id} />
          ))}
        </SortableContext>
      </div>
    </>
  );
};
