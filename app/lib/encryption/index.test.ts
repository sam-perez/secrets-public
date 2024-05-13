import { describe, it, expect } from "vitest";
import { encryptString, decryptString } from "./index";

describe("when we encrypt and decrypt a string", async () => {
  const randomString = (length: number) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
  };

  it("should return the original string", async () => {
    // some password between 100 and 200 characters
    const password = randomString(Math.floor(Math.random() * 100) + 100);
    // some plain text between 100 and 200 characters
    const plainText = randomString(Math.floor(Math.random() * 100) + 100);
    const { iv, ciphertext, salt } = await encryptString(plainText, password);
    const decrypted = await decryptString(iv, ciphertext, salt, password);

    expect(decrypted).toEqual(plainText);
  });
});
