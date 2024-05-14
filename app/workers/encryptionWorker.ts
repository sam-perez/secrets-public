import { packSecrets, unpackSecrets } from "../lib/secrets";

if (typeof window !== "undefined" || typeof self !== "undefined") {
  // This function calculates the nth Fibonacci number
  const fibonacci = (n: number): number => {
    if (n <= 1) {
      return n;
    }

    return fibonacci(n - 1) + fibonacci(n - 2);
  };

  console.log("Worker started, in VITE BEAUTY ME PLZ!!!");

  // Listen for messages from the main thread
  self.onmessage = (event) => {
    const {
      data: { data },
    } = event;

    console.log("DATA:", event.data);
    if (typeof data === "number") {
      const result = fibonacci(data);
      console.log("From worker result:", result);
      // Send the result back to the main thread
      self.postMessage(result);
    } else {
      self.postMessage("Please provide a number");
    }
  };

  // Send a message to the main thread that the worker is initialized
  self.postMessage({
    code: "initialized",
  });

  (async () => {
    const largeDataSizeInMB = 50;
    const largeData = new Uint8Array(largeDataSizeInMB * 1024 * 1024).map(() => Math.floor(Math.random() * 256));

    const secretResponse = [
      {
        textValues: ["some text"],
        files: [
          {
            name: "file1",
            data: largeData,
          },
        ],
      },
    ];

    console.log(`${new Date().toISOString()} - Packing secrets...`);
    const packedSecrets = await packSecrets(secretResponse);

    console.log(`${new Date().toISOString()} - Done packing secrets, now unpacking...`);
    await unpackSecrets(packedSecrets);
    console.log(`${new Date().toISOString()} - Done unpacking secrets...`);
  })();
}
