import { describe, it, expect } from "vitest";
import { packSecrets, unpackSecrets } from "./index";
import { computeSHA256HashOfUint8Array } from "../encryption";

describe("when we pack some secrets and then unpack some secrets", async () => {
  it("should return the original secrets", async () => {
    const secretResponse = [
      {
        textValues: ["some text"],
        files: [
          {
            name: "file1",
            sha256Hash: await computeSHA256HashOfUint8Array(new Uint8Array([1, 2, 3])),
            data: new Uint8Array([1, 2, 3]),
          },
        ],
      },
      {
        textValues: ["some other text"],
        files: [
          {
            name: "file2",
            sha256Hash: await computeSHA256HashOfUint8Array(new Uint8Array([4, 5, 6])),
            data: new Uint8Array([4, 5, 6]),
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
});
