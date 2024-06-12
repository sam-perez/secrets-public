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
        Emails and messaging platforms, while convenient, can leave our data vulnerable or accessible. 2Secured is
        designed to make secure secret retrieval and delivery easy and reliable. Whether you&apos;re sharing personal
        financial information with a family member or confidential work documents with a colleague, 2Secured ensures
        that your data remains protected without sacrificing convenience or security.
      </p>

      <h3 className="mt-4 mb-4">Key Features</h3>
      <ol>
        <li>
          <b>End-to-End Encryption</b>: Our core feature guarantees that data is encrypted on the sender&apos;s device
          and decrypted only on the recipient&apos;s device, ensuring data confidentiality throughout its journey.
        </li>
        <li>
          <b>Automated Secret Creation</b>: We offer automated creation of secrets with client-side encryption. The
          output is a secure link that can be easily shared with non-technical recipients while maintaining data
          security.
        </li>
        <li>
          <b>Secret Retrieval Requests</b>: Users can generate secret retrieval requests with a shareable link sent to
          recipients. The recipient interacts with a user-friendly form for retrieval, and the encrypted response is
          securely uploaded to our servers. The creator is notified via webhook, enabling seamless integration into
          workflows.
        </li>
        <li>
          <b>Data Security</b>: Our service ensures that no secrets are left exposed in plaintext on third-party
          services, minimizing the risk of data breaches.
        </li>
      </ol>

      <h3 className="mt-8 mb-4">AES 256 Encryption Algorithm</h3>
      <p className="text-base">
        AES (Advanced Encryption Standard) 256 uses a 256-bit key length, making it highly resistant to brute-force
        attacks. Here’s why AES 256 is a crucial component of our data security strategy:
      </p>
      <ol>
        <li>
          <b>Strong Security</b>: AES 256 provides a high level of security due to its large key size, making it
          computationally infeasible for attackers to decrypt data without the correct key.
        </li>
        <li>
          <b>Widely Accepted & Trusted</b>: AES is an established encryption standard adopted by governments, financial
          institutions, and security-conscious organizations globally, ensuring compliance and trust.
        </li>
        <li>
          <b>Efficient</b>: Despite its strong security, AES 256 is efficient in terms of computational resources,
          making it suitable for real-time encryption and decryption needs.
        </li>
        <li>
          <b>Versatile</b>: AES 256 can encrypt data of various types, including text, files, and multimedia, making it
          a versatile choice for securing a wide range of sensitive information.
        </li>
        <li>
          <b>Compliant</b>: AES 256 encryption aligns with industry standards and regulatory requirements, facilitating
          compliance with data protection regulations such as GDPR, HIPAA, and CCPA.
        </li>
      </ol>
    </div>
  );
}
