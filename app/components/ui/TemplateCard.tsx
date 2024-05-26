import { ChevronRightIcon, ReaderIcon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";

interface TemplateCardProps {
  name: string;
  show_description: boolean;
  description?: string;
  template_slug: string;
  number_fields?: number;
}

export const TemplateCard = ({
  name,
  show_description,
  template_slug,
  number_fields,
  description,
}: TemplateCardProps) => {
  return (
    <Link to={"/sends/templates/" + template_slug}>
      <div className="p-4 border rounded-lg bg-white hover:bg-slate-50 flex items-center space-x-2 justify-between">
        <div className="space-y-1">
          <h5 className="font-medium">{name}</h5>
          {show_description && <p className="">{description}</p>}
          {number_fields && (
            <span className="muted block flex items-center text-xs">
              <ReaderIcon className="h-3 w-3 mr-1" />
              {number_fields} fields
            </span>
          )}
        </div>
        <ChevronRightIcon className="h-4 w-4 text-slate-400 flex-none" />
      </div>
    </Link>
  );
};
