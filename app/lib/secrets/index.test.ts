import { describe, expect, it } from "vitest";
import { packSecrets, unpackSecrets } from "./index";

describe("when we pack some secrets and then unpack some secrets", async () => {
  const randomData = () => {
    // do something between 1kb and 10kb
    const length = Math.floor(Math.random() * 1024 * 10) + 1024;
    const data = new Uint8Array(length).map(() => Math.floor(Math.random() * 256));

    return { data };
  };

  it("should return the original secrets", async () => {
    const secretResponse = [
      {
        textValues: ["some text"],
        files: [
          {
            name: "file1",
            ...randomData(),
          },
        ],
      },
      {
        textValues: ["some other text"],
        files: [
          {
            name: "file2",
            ...randomData(),
          },
          {
            name: "file3",
            ...randomData(),
          },
          {
            name: "file2",
            ...randomData(),
          },
        ],
      },
      {
        textValues: [],
        files: [],
      },
      {
        textValues: ["just text", "more text"],
        files: [],
      },
    ];

    const packedSecrets = await packSecrets(secretResponse);
    const unpackedSecrets = await unpackSecrets(packedSecrets);

    expect(unpackedSecrets).toEqual(secretResponse);
  });

  // Load tests do not seem to be working in the backend.
  describe.skip("Timing tests", async () => {
    describe("when we work with large data", async () => {
      it("should work", async () => {
        const largeDataSizeInMB = 30;
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

        const packedSecrets = await packSecrets(secretResponse);

        const unpackedSecrets = await unpackSecrets(packedSecrets);

        expect(unpackedSecrets).toEqual(secretResponse);
      }, 100000000);
    });
  });
});
