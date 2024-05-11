import { createContext, useContext, ReactNode } from "react";
// eslint-disable-next-line import/default
import EncryptionWorker from "../../workers/encryptionWorker.js?worker";

// Define the type for the context value
interface EncryptionWorkerContextType {
  sendMessage: (message: unknown) => Promise<void>; // Define a more specific type instead of `unknown` if possible
}

// Creating the context with TypeScript specifics
const EncryptionWorkerContext = createContext<EncryptionWorkerContextType | null>(null);

interface EncryptionWorkerProviderProps {
  children: ReactNode;
}

// Memoized function to get the worker instance, lazy initialization
const getEncryptionWorker = (() => {
  let encryptionWorker: Worker;
  let workerInitialized: Promise<void>;

  return () => {
    if (!encryptionWorker) {
      encryptionWorker = new EncryptionWorker();

      workerInitialized = new Promise<void>((resolve) => {
        const initializedEventListner = (event: MessageEvent) => {
          console.log("Received from worker:", event.data);
          if (event.data.code === "initialized") {
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

// Provider Component with TypeScript
export const EncryptionWorkerProvider = ({ children }: EncryptionWorkerProviderProps) => {
  // The value provided to the context consumers
  const value = {
    sendMessage: async (message: unknown) => {
      const { encryptionWorker, workerInitialized } = getEncryptionWorker();

      await workerInitialized;
      encryptionWorker.postMessage(message);
    },
  };

  return <EncryptionWorkerContext.Provider value={value}>{children}</EncryptionWorkerContext.Provider>;
};

// Custom hook to use the worker context
export const useEncryptionWorker = (): EncryptionWorkerContextType | null => useContext(EncryptionWorkerContext);
