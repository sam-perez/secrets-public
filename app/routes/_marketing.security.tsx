import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Security | 2Secured" },
    {
      name: "description",
      content:
        // eslint-disable-next-line max-len
        "2Secured offers a simple yet powerful way to send and receive information securely using end-to-end encryption. Encrypt text or files, and share via links that can expire, require MFA, or a password to view.",
    },
  ];
};

export default function Security() {
  return (
    <div className="max-w-5xl mx-auto mb-24 px-4">
      <h1 className="mt-4">Security</h1>
      <p className="lead mt-2">How 2Secured keeps your data safe</p>

      <p className="text-base mt-2">
        Everyday, at home and at work, we frequently deal with sensitive information that needs to be shared securely.
        Emails and messaging platforms, while convenient, can leave our data vulnerable and accessible. 2Secured is
        designed to make secure secret retrieval and delivery easy, reliable, and completely private. With end-to-end
        encryption, your data remains confidential, ensuring that only you and your intended recipients can access it.
        No one else, not even 2Secured, can ever view your data.
      </p>
      <p className="text-base mt-2">
        Whether you&apos;re sharing personal financial information with a family member or confidential work documents
        {/* eslint-disable-next-line max-len */}
        with a colleague, 2Secured ensures that your data remains protected without sacrificing convenience or security.
      </p>

      <h3 className="mt-4 mb-4">Key Features</h3>
      <ol>
        <li>
          <b>End-to-End Encryption</b>: Our core feature. Data is encrypted on the sender&apos;s device and can only be
          decrypted on the recipient&apos;s device, ensuring complete data confidentiality throughout its journey. No
          one else, not even 2Secured, can ever view your data.
        </li>
        <li>
          <b>Automated Secret Creation</b>: We offer automated creation of secrets with client-side encryption. The
          output is a secure link that can be easily shared with non-technical recipients while maintaining data
          security.
        </li>
        <li>
          <b>Secret Retrieval Requests</b>: Users can generate secret retrieval requests with a shareable link that can
          be sent to recipients. The recipient interacts with a user-friendly form for retrieval, and the response is
          encrypted on the client and then is securely uploaded to our servers. The creator of the retrieval request is
          notified of the submission and are the only ones who can decrypt the response on devices they control using
          easy to use libraries provided by 2Secured. They can then seamlessly work the data into their workflows.
        </li>
        <li>
          <b>Data Security</b>: Using our service ensures that no secrets are left exposed in plaintext on third-party
          services, unlike other common methods of sharing sensitive data such as email or chat. This dramatically
          reduces the risk of data breaches and unauthorized access.
        </li>
      </ol>

      <h3 className="mt-8 mb-4">AES-GCM 256 Encryption</h3>
      <p className="text-base">
        AES (Advanced Encryption Standard) GCM 256 uses a 256-bit key length, making it highly resistant to brute-force
        attacks. Here’s why AES-GCM 256 is a crucial component of our data security strategy:
      </p>
      <ol>
        <li>
          <b>Best In Class Security</b>: AES-GCM 256 provides a robust level of security due to its large key size,
          making it computationally impossible for attackers to decrypt encrypted data.
        </li>
        <li>
          <b>Widely Accepted & Trusted</b>: AES-GCM 256 is an established encryption standard adopted by modern
          browsers, governments, financial institutions, and security-conscious organizations globally, ensuring
          compliance and trust.
        </li>
        <li>
          <b>Efficient</b>: Along with its strong security, AES-GCM 256 is efficient in terms of computational
          resources, making it suitable for encryption and decryption of small and large amounts of data alike, across
          all platforms.
        </li>
        <li>
          <b>Compliant</b>: AES-GCM 256 encryption is universally recognized as the industry standard and meets all
          regulatory requirements, ensuring compliance with data protection frameworks such as GDPR, HIPAA, and CCPA.
        </li>
      </ol>
    </div>
  );
}
