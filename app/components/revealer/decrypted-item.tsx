import { Button } from "../ui/button";
import { CopyIcon, DownloadIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Label } from "../ui/label";

export const Item = ({ id, title, type, value }) => {
  return (
    <div className="flex space-x-2 items-center mb-4">
      <div className="flex-1">
        <Label>{title}</Label>
        <p className="break-all bg-slate-50 p-2 rounded">
          <code>{value}</code>
        </p>
      </div>
      <div className="flex-none">
        <div className="flex space-x-2">
          {type == "text" ||
            (type == "multi" && (
              <>
                {/* copy text */}
                <Button variant={"outline"} size={"icon"}>
                  <CopyIcon className="h-4 w-4" />
                </Button>
                <Button variant={"outline"} size={"icon"}>
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </>
            ))}

          {type == "file" && (
            <>
              <Button variant={"outline"} size={"icon"}>
                <EyeOpenIcon className="h-4 w-4" />
              </Button>
              <Button variant={"outline"} size={"icon"}>
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
