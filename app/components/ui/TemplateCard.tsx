import { ChevronRightIcon, Share2Icon } from "@radix-ui/react-icons";
import { Link } from "@remix-run/react";

interface TemplateCardProps {
  name: string;
  show_description: boolean;
  template_slug: string;
  uses?: number;
}

export const TemplateCard = ({ name, show_description, template_slug, uses }: TemplateCardProps) => {
  return (
    <Link to={"/sends/templates/" + template_slug}>
      <div className="p-4 border rounded-lg bg-white hover:bg-slate-50 flex items-center space-x-2 justify-between">
        <div className="space-y-1">
          <h5 className="font-medium">{name}</h5>
          {show_description && <p className="">Send or request {name} details using e2e encryption.</p>}
          {uses && (
            <span className="muted block flex items-center text-xs">
              <Share2Icon className="h-3 w-3 mr-1" />
              {uses}
            </span>
          )}
        </div>
        <ChevronRightIcon className="h-4 w-4 text-slate-400 flex-none" />
      </div>
    </Link>
  );
};
