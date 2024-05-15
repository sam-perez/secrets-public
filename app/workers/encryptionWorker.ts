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
    const dataSizeInMB = [1, 5, 10, 20, 30, 40, 50];
    const samples = 5;

    console.log("Starting benchmarks...");
    const observations = dataSizeInMB.reduce((acc, size) => {
      acc[size.toString()] = [];
      return acc;
    }, {} as { [key: string]: { packSecretsTime: number; unpackSecretsTime: number }[] });

    for (const size of dataSizeInMB) {
      for (let i = 0; i < samples; i++) {
        const largeData = new Uint8Array(size * 1024 * 1024).map(() => Math.floor(Math.random() * 256));

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

        console.log(`Starting benchmark ${i} of ${samples} for ${size} MB...`);
        const packSecretsStart = new Date().getTime();
        const packedSecrets = await packSecrets(secretResponse);
        console.log(`Packed secrets for ${size} MB...`);
        const packSecretsEnd = new Date().getTime();
        await unpackSecrets(packedSecrets);
        const unpackSecretsEnd = new Date().getTime();
        console.log(`Unpacked secrets for ${size} MB...`);

        const packSecretsTime = packSecretsEnd - packSecretsStart;
        const unpackSecretsTime = unpackSecretsEnd - packSecretsEnd;
        observations[size.toString()].push({ packSecretsTime, unpackSecretsTime });
      }
    }

    console.log("Benchmarks complete");
    const averageTimes = dataSizeInMB.reduce((acc, size) => {
      const sizeObservations = observations[size.toString()];
      const packSecretsAvgTime =
        sizeObservations.reduce((acc, { packSecretsTime }) => acc + packSecretsTime, 0) / sizeObservations.length;
      const unpackSecretsAvgTime =
        sizeObservations.reduce((acc, { unpackSecretsTime }) => acc + unpackSecretsTime, 0) / sizeObservations.length;

      acc[size.toString()] = { packSecretsAvgTime, unpackSecretsAvgTime };
      return acc;
    }, {} as { [key: string]: { packSecretsAvgTime: number; unpackSecretsAvgTime: number } });

    console.log("Average times:", averageTimes);
  })();
}
