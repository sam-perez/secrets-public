## Setup.

We ran the following code in a small benchmark sampling run.

```
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
        // new set of random data per test
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
```

## Results.

Machine: Sam's new macbook pro 15" with m2 and 24gb of ram in up to date chrome on 2024-05-15.

Observations (avg time across all samples)

| Size         | _packSecrets_ (ms) | _unpackSecrets_ (ms) |
| ------------ | ------------------ | -------------------- |
| 1 megabyte   | 456.8              | 38.8                 |
| 5 megabytes  | 839.6              | 135.4                |
| 10 megabytes | 1649.4             | 263.8                |
| 20 megabytes | 3288.8             | 528                  |
| 30 megabytes | 5144.2             | 785.2                |
| 40 megabytes | 6614.6             | 1048.6               |
| 50 megabytes | 8318.6             | 1292.6               |

---

Machine: Taylor's M1 Macbook Pro, 16gb of ram in chrome.

Observations (avg time across all samples)

| Size         | _packSecrets_ (ms) | _unpackSecrets_ (ms) |
| ------------ | ------------------ | -------------------- |
| 1 megabytes  | 596.6              | 44.8                 |
| 5 megabytes  | 959                | 156.2                |
| 10 megabytes | 1870.6             | 305                  |
| 20 megabytes | 3762               | 574                  |
| 30 megabytes | 5893.6             | 865.2                |
| 40 megabytes | 7769.2             | 1158.6               |
| 50 megabytes | 9681.6             | 1468.6               |
