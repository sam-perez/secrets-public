import { LockOpen1Icon } from "@radix-ui/react-icons";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import AboutSidenav from "~/components/about-sidenav";
import { ReceiveBuilderTemplate } from "~/components/receives/builder/types";
import { DisplaySecrets } from "~/components/shared/revealer/DisplaySecrets";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { getReceiveConfig, getReceiveResponseState, ReceiveId, ReceiveResponseId } from "~/lib/receives";

import {
  EncryptionWorkerProvider,
  useEncryptionWorker,
} from "../components/context-providers/EncryptionWorkerContextProvider";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/Spinner";
import { utf16ArrayBufferToString } from "../lib/crypto-utils";
import { PackedSecrets, PublicPackedSecrets, SecretResponses } from "../lib/secrets";
import { parallelWithLimit } from "../lib/utils";
// eslint-disable-next-line max-len
import { DOWNLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS } from "./marketing.api.receives.download-receive-response-encrypted-part";

type LoaderData =
  | {
      available: true;
      totalEncryptedParts: number;
      receiveId: ReceiveId;
      receiveResponseId: ReceiveResponseId;
      template: ReceiveBuilderTemplate;
    }
  | {
      available: false;
    };

export const loader: LoaderFunction = async ({ params }) => {
  const { receiveId, receiveResponseId } = params;

  if (!receiveId || !receiveResponseId) {
    return json<LoaderData>({ available: false });
  }

  let loaderData: LoaderData;

  try {
    // fetch the config for the receive and the receive response from the server and pass it to the client
    const receiveConfig = await getReceiveConfig(receiveId as ReceiveId);
    const receiveResponseState = await getReceiveResponseState(
      receiveConfig.receiveId,
      receiveResponseId as ReceiveResponseId
    );

    console.log(JSON.stringify({ receiveConfig, receiveResponseState }, null, 4));

    if (
      receiveResponseState.readyAt !== null &&
      receiveResponseState.dataDeletedAt === null &&
      receiveResponseState.totalEncryptedParts !== null
    ) {
      loaderData = {
        available: true,
        totalEncryptedParts: receiveResponseState.totalEncryptedParts,
        receiveId: receiveConfig.receiveId,
        receiveResponseId: receiveResponseState.receiveResponseId,
        template: receiveConfig.template,
      };
    } else {
      loaderData = { available: false };
    }
  } catch (e) {
    console.log("Error fetching receive response config", e);
    loaderData = { available: false };
  }

  return json<LoaderData>(loaderData);
};

// set page title
export const meta: MetaFunction = () => {
  return [
    { title: "View Encrypted Link | 2Secure" },
    {
      name: "description",
      content: "This end-to-end encrypted data was shared with you via 2Secured.link",
    },
  ];
};

/**
 * Default export for the receive response revealer container.
 * Just wraps the receive response revealer in the encryption worker provider so that the receive response revealer
 * can use the encryption worker if it needs to.
 */
export default function ReceiveResponseRevealerRootContainer() {
  return (
    <EncryptionWorkerProvider>
      <ReceiveResponseContainer />
    </EncryptionWorkerProvider>
  );
}

/**
 * Responsible for pulling out the receive id, receive response id, and fetching data from the server.
 */
function ReceiveResponseContainer() {
  const loaderData = useLoaderData<LoaderData>();

  if (!loaderData.available) {
    return (
      <div className="container">
        <h3>🤔 This link has expired or does not exist</h3>
        <p className="muted mt-2 mb-4">
          The secret link you are trying to view has expired, may have never existed, or was deleted. If it did in fact
          exist, there is no way to retrieve it anymore.
        </p>
        <Link to={"https://2secured.link"}>
          <Button>Back to 2Secured</Button>
        </Link>
      </div>
    );
  }

  return (
    <ReceiveResponseDownloaderAndDecryptor
      receiveId={loaderData.receiveId}
      receiveResponseId={loaderData.receiveResponseId}
      totalEncryptedParts={loaderData.totalEncryptedParts}
      receiveBuilderTemplate={loaderData.template}
    />
  );
}

/**
 * The main component that will download the encrypted parts, decrypt them and display the decrypted data.
 */
function ReceiveResponseDownloaderAndDecryptor({
  receiveId,
  receiveResponseId,
  totalEncryptedParts,
  receiveBuilderTemplate,
}: {
  receiveId: ReceiveId;
  receiveResponseId: ReceiveResponseId;
  totalEncryptedParts: number;
  receiveBuilderTemplate: ReceiveBuilderTemplate;
}) {
  const encryptionWorker = useEncryptionWorker();

  const [secretResponses, setSecretResponses] = useState<SecretResponses | null>(null);

  // pull out fragment from the URL
  const password = window.location.hash.slice(1);

  useEffect(() => {
    if (password === "") {
      return;
    }

    const fetchAndDecrypt = async () => {
      // fetch the encrypted parts
      const fetchEncryptedPartsPromiseGenerators = Array.from({ length: totalEncryptedParts }).map((_, index) => {
        return async () => {
          return fetch(`/marketing/api/receives/download-receive-response-encrypted-part`, {
            method: "GET",
            headers: {
              [DOWNLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.RECEIVE_ID]: receiveId,
              [DOWNLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.RECEIVE_RESPONSE_ID]: receiveResponseId,
              [DOWNLOAD_RECEIVE_RESPONSE_ENCRYPTED_PART_HEADERS.PART_NUMBER]: `${index + 1}`,
            },
          });
        };
      });

      // get the string data out from each and then concatenate them
      const encryptedParts = await parallelWithLimit({
        promiseGenerators: fetchEncryptedPartsPromiseGenerators,
        limit: 3,
      });

      const encryptedPartArrayBuffers = await Promise.all(encryptedParts.map((part) => part.arrayBuffer()));
      const text = encryptedPartArrayBuffers
        // each of these buffers should be a utf16 string and should be concatenated in order
        .map((arrayBuffer) => utf16ArrayBufferToString(arrayBuffer))
        .join("");

      const parsedPublicPackedSecrets = JSON.parse(text) as PublicPackedSecrets;

      const parsedPackedSecrets: PackedSecrets = {
        ...parsedPublicPackedSecrets,
        password,
      };

      const secretResponses = await encryptionWorker.sendPackedSecretsForDecryption(parsedPackedSecrets);
      setSecretResponses(secretResponses);
    };

    fetchAndDecrypt();
  }, [encryptionWorker, password, receiveId, receiveResponseId, totalEncryptedParts]);

  if (password === "") {
    // can't do anything failed to load password via fragment
    return (
      <div className="container">
        <h3>🫤 Something went wrong</h3>
        <p className="muted mb-4">
          Failed to load password from URL fragment. Unfortunately, this link is not viewable.
        </p>
      </div>
    );
  }

  if (secretResponses === null) {
    return (
      <div className="container">
        <h3>Unlocking data...</h3>
        <p className="muted mb-4">The link has been successfully unlocked.</p>

        {/** Can add in more fancy states here */}
        <div className="flex items-center space-x-2">
          <Spinner /> Downloading and decrypting...
        </div>
      </div>
    );
  } else {
    return (
      <div className="mx-auto lg:grid lg:max-w-2xl grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <Alert className="mb-4">
            <LockOpen1Icon className="h-4 w-4 text-green-500" />
            <AlertTitle>Unlocked</AlertTitle>
            <AlertDescription>The link has been successfully unlocked and decrypted</AlertDescription>
          </Alert>

          <h3 className="mb-2">{receiveBuilderTemplate.title}</h3>
          <div className="mt-4">
            <DisplaySecrets template={receiveBuilderTemplate} responses={secretResponses} />
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div>
            {/* TODO use a toast ^ */}
            <AboutSidenav showAbout={true} />
          </div>
        </div>
      </div>
    );
  }
}
