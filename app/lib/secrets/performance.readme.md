## Setup.

We ran the following code in a small benchmark sampling run on Sam's new
macbook pro 15" with m2 and 24gb of ram in up to date chrome on 2024-05-15.

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

Observations (avg time across all samples)

### 1 megabyte

_packSecrets_: 456.8ms

_unpackSecrets_: 38.8ms

### 5 megabytes

_packSecrets_: 839.6ms

_unpackSecrets_: 135.4ms

### 10 megabytes

_packSecrets_: 1649.4ms

_unpackSecrets_: 263.8ms

### 20 megabytes

_packSecrets_: 3288.8ms

_unpackSecrets_: 528ms

### 30 megabytes

_packSecrets_: 5144.2ms

_unpackSecrets_: 785.2ms

### 40 megabytes

_packSecrets_: 6614.6ms

_unpackSecrets_: 1048.6ms

### 50 megabytes

_packSecrets_: 8318.6ms

_unpackSecrets_: 1292.6ms
