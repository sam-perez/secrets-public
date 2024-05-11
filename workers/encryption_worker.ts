// this should never run in the server, but will hopefully run in the worker in the browser
if (typeof window !== "undefined" || typeof self !== "undefined") {
  // This function calculates the nth Fibonacci number
  const fibonacci = (n: number): number => {
    if (n <= 1) {
      return n;
    }

    return fibonacci(n - 1) + fibonacci(n - 2);
  };

  console.log("Worker started");

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
}
