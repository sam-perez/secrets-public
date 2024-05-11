"use strict";
(() => {
  // workers/encryption_worker.ts
  if (typeof window !== "undefined" || typeof self !== "undefined") {
    const fibonacci = (n) => {
      if (n <= 1) {
        return n;
      }
      return fibonacci(n - 1) + fibonacci(n - 2);
    };
    console.log("Worker started");
    self.onmessage = (event) => {
      const {
        data: { data }
      } = event;
      console.log("DATA:", event.data);
      if (typeof data === "number") {
        const result = fibonacci(data);
        self.postMessage(result);
      } else {
        self.postMessage("Please provide a number");
      }
    };
  }
})();
