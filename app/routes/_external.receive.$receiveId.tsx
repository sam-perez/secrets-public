import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { ReceiveResponseContainer } from "~/components/receives/responder/ReceiveResponderContainer";
// eslint-disable-next-line max-len
import { getReceiveConfig, ReceiveConfig, ReceiveId } from "~/lib/receives";

type LoaderData =
  | {
      receiveId: ReceiveId;
      receiveTemplate: ReceiveConfig["template"];
      notificationConfig: ReceiveConfig["notificationConfig"];
    }
  | { error: string };

export const loader: LoaderFunction = async ({ params }) => {
  const { receiveId } = params;
  let loaderData: LoaderData;

  if (!receiveId) {
    loaderData = { error: "Invalid template." };
  } else {
    const receiveConfig = await getReceiveConfig(receiveId as ReceiveId);

    loaderData = {
      receiveId: receiveConfig.receiveId,
      receiveTemplate: receiveConfig.template,
      notificationConfig: receiveConfig.notificationConfig,
    };
  }

  return json<LoaderData>(loaderData);
};

export default function ReceivePage() {
  const data = useLoaderData<LoaderData>();

  if ("error" in data) {
    return <p>Invalid template.</p>;
  }

  return (
    <ReceiveResponseContainer
      startingTemplate={data.receiveTemplate}
      receiveId={data.receiveId}
      notificationConfig={data.notificationConfig}
    />
  );
}
