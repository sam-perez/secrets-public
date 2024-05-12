import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";

interface BuilderHeaderProps {
  title?: string;
}

export default function BuilderHeader({ title }: BuilderHeaderProps) {
  return (
    <div className="pb-2">
      <div className="mb-2 flex items-center space-between">
        <Input placeholder="Untitled Secure Send" autoComplete="off" value={title} />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <DotsVerticalIcon className="h-4 w-4 flex-none ml-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Save as template</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* tags */}

      <Popover>
        <PopoverTrigger>
          <Badge variant="outline">
            <span className="text-xs muted">Add Tag</span>
          </Badge>
        </PopoverTrigger>
        <PopoverContent>
          <Input placeholder="Add Tag" />
        </PopoverContent>
      </Popover>
    </div>
  );
}
