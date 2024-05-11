import { computeSHA256HashOfUint8Array } from "../lib/encryption";

if (typeof window !== "undefined" || typeof self !== "undefined") {
  // This function calculates the nth Fibonacci number
  const fibonacci = (n: number): number => {
    if (n <= 1) {
      return n;
    }

    return fibonacci(n - 1) + fibonacci(n - 2);
  };

  console.log("Worker started, in VITE BEAUTY ME PLZ!!!");

  (async () => {
    console.log("HERE IS A HASH", await computeSHA256HashOfUint8Array(new Uint8Array([1, 2, 13])));
  })();

  // Listen for messages from the main thread
  self.onmessage = (event) => {
    const {
      data: { data },
    } = event;

    console.log("DATA:", event.data);
    if (typeof data === "number") {
      const result = fibonacci(data);
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
}
