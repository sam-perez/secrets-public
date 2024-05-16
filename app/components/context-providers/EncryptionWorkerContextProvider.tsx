import { createContext, useContext } from "react";
import { SecretResponses, PackedSecrets } from "../../lib/secrets";

// eslint-disable-next-line import/default
import EncryptionWorker from "../../workers/encryptionWorker.js?worker";

// Memoized function to get the worker instance, lazy initialization
const getEncryptionWorker = (() => {
  let encryptionWorker: Worker;
  let workerInitialized: Promise<void>;

  return () => {
    if (!encryptionWorker) {
      encryptionWorker = new EncryptionWorker();

      workerInitialized = new Promise<void>((resolve) => {
        const initializedEventListner = (event: MessageEvent) => {
          if (event.data.code === "INITIALIZED") {
            encryptionWorker.removeEventListener("message", initializedEventListner);
            resolve();
          }
        };

        encryptionWorker.addEventListener("message", initializedEventListner);
      });
    }

    return { encryptionWorker, workerInitialized };
  };
})();

// Define the type for the context value
interface EncryptionWorkerContextType {
  sendSecretResponsesForEncryption: (secretResponses: SecretResponses) => Promise<PackedSecrets>;
  sendPackedSecretsForDecryption: (packedSecrets: PackedSecrets) => Promise<SecretResponses>;
}

const defaultContextValue: EncryptionWorkerContextType = {
  sendSecretResponsesForEncryption: async (secretResponses: SecretResponses) => {
    const { encryptionWorker, workerInitialized } = getEncryptionWorker();
    await workerInitialized;

    encryptionWorker.postMessage({
      code: "PACK_SECRETS",
      secretResponses,
    });

    const packedSecrets = await new Promise<PackedSecrets>((resolve) => {
      const donePackingEventListener = (event: MessageEvent) => {
        if (event.data.code === "DONE_PACKING_SECRETS") {
          encryptionWorker.removeEventListener("message", donePackingEventListener);
          resolve(event.data.packedSecrets as PackedSecrets);
        }
      };

      encryptionWorker.addEventListener("message", donePackingEventListener);
    });

    return packedSecrets;
  },
  sendPackedSecretsForDecryption: async (packedSecrets: PackedSecrets) => {
    const { encryptionWorker, workerInitialized } = getEncryptionWorker();
    await workerInitialized;

    encryptionWorker.postMessage({
      code: "UNPACK_SECRETS",
      packedSecrets,
    });

    const secretResponses = await new Promise<SecretResponses>((resolve) => {
      const doneUnpackingEventListener = (event: MessageEvent) => {
        if (event.data.code === "DONE_UNPACKING_SECRETS") {
          encryptionWorker.removeEventListener("message", doneUnpackingEventListener);
          resolve(event.data.secretResponses as SecretResponses);
        }
      };

      encryptionWorker.addEventListener("message", doneUnpackingEventListener);
    });

    return secretResponses;
  },
};

export const EncryptionWorkerContext = createContext<EncryptionWorkerContextType>(defaultContextValue);

export const useEncryptionWorker = () => {
  return useContext(EncryptionWorkerContext);
};

interface EncryptionWorkerProviderProps {
  children: React.ReactNode;
}

export const EncryptionWorkerProvider: React.FC<EncryptionWorkerProviderProps> = ({ children }) => {
  return <EncryptionWorkerContext.Provider value={defaultContextValue}>{children}</EncryptionWorkerContext.Provider>;
};
