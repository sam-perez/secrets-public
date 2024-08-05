import { ChevronRightIcon } from "@radix-ui/react-icons";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import AboutSidenav from "~/components/about-sidenav";
// eslint-disable-next-line max-len
import { ReceivesConfigurationEditorContainer } from "~/components/receives/builder/ReceivesConfigurationEditorContainer";
import { Alert } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { getReceiveConfig, ReceiveConfig, ReceiveId } from "~/lib/receives";

type LoaderData =
  | {
      receiveTemplate: ReceiveConfig["template"];
    }
  | { error: string };

export const loader: LoaderFunction = async ({ params }) => {
  const { receiveId } = params;
  let loaderData: LoaderData;

  if (!receiveId) {
    loaderData = { error: "Invalid template." };
  } else {
    const receiveConfig = await getReceiveConfig(receiveId as ReceiveId);

    loaderData = { receiveTemplate: receiveConfig.template };
  }

  return json<LoaderData>(loaderData);
};

export default function ReceivePage() {
  const data = useLoaderData<LoaderData>();

  if ("error" in data) {
    return <p>Invalid template.</p>;
  }

  console.log(JSON.stringify({ data }, null, 2));

  return <div>TODO</div>;
}
