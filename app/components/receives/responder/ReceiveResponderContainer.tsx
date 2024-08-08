import { LockClosedIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import AboutSidenav from "~/components/about-sidenav";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { ReceiveConfig } from "~/lib/receives";
import { computeTotalSizeOfSecretFields } from "~/lib/utils";

import { ReceiveBuilderTemplate, ReceiveField } from "../builder/types";
import { ReceiveFieldWithId, ReceiveResponderSecretFieldRenderer } from "./ReceiveResponderSecretFieldRenderer";
import { ReceiveResponseSealerAndSender } from "./ReceiveResponseSealerAndSender";
import { ReceiveResponse } from "./types";

const MAXIMUM_RECEIVE_SIZE_IN_MEGA_BYTES = 20;

/**
 * The container for the receive response secret form.
 *
 * It collects the secret fields and sends them to the backend.
 */
export const ReceiveResponseContainer = ({
  receiveId,
  startingTemplate,
  notificationConfig,
}: {
  receiveId: string;
  startingTemplate: ReceiveBuilderTemplate;
  notificationConfig: ReceiveConfig["notificationConfig"];
}) => {
  const [receiveResponse, setReceiveResponse] = useState<ReceiveResponse>({
    fields: startingTemplate.fields.map((field) => ({ ...field, value: null })),
  });

  const [shouldUploadSecrets, setShouldUploadSecrets] = useState(false);

  const items = receiveResponse.fields.map((field, index) => ({ ...field, id: index + 1 }));

  const updateItems = (newItems: ReceiveFieldWithId[]) => {
    const newResponse = {
      fields: newItems.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = item;

        return rest;
      }),
    };

    setReceiveResponse(newResponse);
  };

  const updateItem = (id: number, updatedField: Partial<Pick<ReceiveField, "title" | "value">>) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedField,
        } as ReceiveFieldWithId;
      }

      return item;
    });

    updateItems(updatedItems);
  };

  const totalBytesOfFields = computeTotalSizeOfSecretFields(items);

  const numberOfFields = receiveResponse.fields.length;
  const numberOfFieldsWithValues = receiveResponse.fields.filter(
    // all fields are either a string or a file array, so funny enough they all have a length property.
    (field) => field.value !== null && field.value.length > 0
  ).length;

  let readyToSubmitSecrets = false;
  let linkText: string;
  if (totalBytesOfFields >= MAXIMUM_RECEIVE_SIZE_IN_MEGA_BYTES * 1024 * 1024) {
    linkText = `Limit of ${MAXIMUM_RECEIVE_SIZE_IN_MEGA_BYTES}MB exceeded`;
  } else if (numberOfFields !== numberOfFieldsWithValues) {
    linkText = `Completed ${numberOfFieldsWithValues} of ${numberOfFields} fields`;
  } else {
    linkText = "Submit response";
    readyToSubmitSecrets = true;
  }

  return (
    <>
      <div className="mx-auto lg:grid lg:max-w-2xl grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <Alert className="mb-4">
            <LockClosedIcon className="h-4 w-4 text-green-500" />
            <AlertTitle>End-to-end encrypted</AlertTitle>
            <AlertDescription>The data you enter will be encrypted and sent to the requestor.</AlertDescription>
          </Alert>
          <div className="rounded border">
            <div className="px-4 pt-4">
              <h3 className="">{startingTemplate.title}</h3>
            </div>
            <div className="p-2 ">
              {items.map((item) => (
                <ReceiveResponderSecretFieldRenderer key={item.id} receiveField={item} updateItem={updateItem} />
              ))}
            </div>
            <div className="border-t bg-slate-50 rounded-b-xl">
              <div className="px-4 py-2 sm:flex flex-wrap justify-between items-center text-sm overflow-hidden">
                {/* Button to generate link. */}
                <div>
                  <Button
                    className="w-full"
                    disabled={!readyToSubmitSecrets}
                    onClick={() => setShouldUploadSecrets(true)}
                  >
                    {linkText}
                  </Button>
                </div>

                {shouldUploadSecrets === false ? null : (
                  <ReceiveResponseSealerAndSender
                    receiveId={receiveId}
                    receiveResponse={receiveResponse}
                    notificationConfig={notificationConfig}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4 lg:col-span-2 mt-8">
            <div>
              {/* TODO use a toast ^ */}
              <AboutSidenav showAbout={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
