import { PackedSecrets, packSecrets, SecretResponses, unpackSecrets } from "../lib/secrets";

if (typeof window !== "undefined" || typeof self !== "undefined") {
  // Listen for messages from the main thread
  let isProcessing = false;
  self.onmessage = (event) => {
    if (isProcessing) {
      return;
    }

    isProcessing = true;

    const { code } = event.data;

    switch (code) {
      case "PACK_SECRETS":
        packSecrets(event.data.secretResponses as SecretResponses).then((packedSecrets) => {
          self.postMessage({
            code: "DONE_PACKING_SECRETS",
            packedSecrets,
          });
        });
        break;
      case "UNPACK_SECRETS":
        unpackSecrets(event.data.packedSecrets as PackedSecrets).then((secretResponses) => {
          self.postMessage({
            code: "DONE_UNPACKING_SECRETS",
            secretResponses,
          });
        });
        break;
      default:
        console.error("Encryption Worker: Unknown code", code);
        break;
    }

    isProcessing = false;
  };

  // Send a message to the main thread that the worker is initialized
  self.postMessage({
    code: "INITIALIZED",
  });
}
