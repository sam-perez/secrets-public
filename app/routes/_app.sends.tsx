import {
    DotsHorizontalIcon,
    PaperPlaneIcon,
    Pencil1Icon,
} from "@radix-ui/react-icons";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";

const templates = [
    {
        name: "Sending API Key",
        uses_number: 3,
        security: "email confirmation required, expires after 10d",
        last_updated: "2 days ago",
    },
    {
        name: "Sending API Key Copy",
        uses_number: 0,
        security: "email confirmation required, expires after 10d",
        last_updated: "2 days ago",
    },
    {
        name: "Another Send Template",
        uses_number: 1,
        security: "email confirmation required, expires after 10d",
        last_updated: "2 days ago",
    },
];

const sends = [
    {
        created: "Just now",
        title: "Sending API keys to bob",
        tags: ["taylor@test.com", "API", "Engineering"],
        views: 2,
        expires: "3d / 4 views",
        status: "Shared",
    },
    {
        created: "2h ago",
        title: "Sending API keys to bob",
        views: 4,
        expires: "3d / 4 views",
        status: "Expired",
    },
    {
        created: "2h ago",
        title: "Sending API keys to bob",
        views: 1,
        expires: "3d / 4 views",
        status: "Expired",
        tags: ["testing tags"],
    },
    {
        created: "1w ago",
        title: "Untitled Secure Send",
        views: 1,
        expires: "3d / 4 views",
        status: "Expired",
    },
    {
        created: "3m ago",
        title: "Untitled Secure Send",
        views: 1,
        expires: "3d / 4 views",
        status: "Expired",
    },
];

export default function Sends() {
    return (
        <>
            <section className="space-y-2 mb-8">
                <div className="large">My Templates</div>
                {templates.map((template, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-4 rounded-md hover:bg-slate-50 p-4"
                    >
                        <div className="flex-1">
                            <p className="font-medium">{template.name}</p>
                            <p className="muted">
                                {template.uses_number} uses ·{" "}
                                {template.security} · {template.last_updated}
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button>
                                <PaperPlaneIcon className="h-4 w-4 mr-2" />
                                New Send
                            </Button>
                            <Button variant={"outline"} size={"icon"}>
                                <Pencil1Icon className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant={"outline"} size={"icon"}>
                                        <DotsHorizontalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>View</DropdownMenuItem>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Make a copy
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </section>

            <div className="large mb-4">All Sends</div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Created</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sends.map((send, index) => (
                        <TableRow key={index}>
                            <TableCell className="py-6">
                                {send.created}
                            </TableCell>
                            <TableCell className="font-medium space-y-1">
                                <div>{send.title}</div>
                                {send.tags && (
                                    <div className="space-x-1">
                                        {send.tags.map((tag, index) => (
                                            <Badge
                                                key={index}
                                                variant={"secondary"}
                                            >
                                                <div>{tag}</div>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>{send.views}</TableCell>
                            <TableCell>{send.expires}</TableCell>
                            <TableCell>{send.status}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button
                                            variant={"outline"}
                                            size={"icon"}
                                        >
                                            <DotsHorizontalIcon className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>
                                            View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            Make a copy
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            Add a tag
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
