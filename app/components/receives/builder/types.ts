import { SecretField } from "../../shared/types";

/**
 * This file contains the frontend types for the receive builder component.
 */

/**
 * A field in the receive builder.
 */
export type ReceiveField = {
  /** The title of the field. */
  title: string;

  /** A placeholder for display purposes. */
  placeholder?: string;
} & SecretField;

/**
 * The configuration for a receive.
 */
export type ReceiveBuilderConfiguration = {
  /** The title of the receive. */
  title: string;

  /**
   * The notification configuration for the receive.
   *
   * Note that we allow this to be null here on the frontend, but that is just for convenience while we are
   * constructing the receive. The backend will not allow this to be null, and we should make sure that it is
   * set before sending it to the backend.
   *
   * This should be fine as long as you use the CreateReceiveBody type from the create receive endpoint.
   */
  notificationConfig: {
    /** A webhook notification. */
    type: "webhook";

    /** The url to send the notification to. */
    url: string;
  } | null;

  /** The fields in the receive. */
  fields: Array<ReceiveField>;
};

/**
 * A receive builder template.
 */
export type ReceiveBuilderTemplate = {
  /** The title of the template. */
  title: string;

  /** The fields for the template */
  fields: Array<Omit<ReceiveField, "value">>;
};

/**
 * Our library of receiving templates.
 *
 * We use the ReceiveBuilderTemplate type, plus a description and optional private flag that are used
 * in the UI to display the templates.
 */
export const RECEIVE_BUILDER_TEMPLATES: {
  [SLUG in string]: ReceiveBuilderTemplate & {
    /** The description of the template. */
    description: string;

    /** Optional flag. If true, the template will not be shown in the template list or sitemap. */
    private?: boolean;
  };
} = {
  new: {
    title: "Encrypted Blank Form",
    description: "A blank template to request and receive any data from someone else with end-to-end encryption.",
    fields: [
      {
        title: "Untitled",
        type: "single-line-text",
        placeholder: "Receipent enters text here",
      },
    ],
  },

  /** A template for fetching an AWS API key. */
  "aws-api-key": {
    title: "AWS API Key",
    description: "Use this starter template to securely receive AWS API Keys that are end-to-end encrypted.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "AWS Access Key",
        type: "single-line-text",
        placeholder: "Access key",
      },
      {
        title: "AWS Secret Access Key",
        type: "single-line-text",
        placeholder: "Secret access key",
      },
    ],
  },
  "api-key": {
    title: "Basic API Key",
    description: "Use this starter template to securely receive API keys that are end-to-end encrypted.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Public API Key",
        type: "single-line-text",
        placeholder: "Public",
      },
      {
        title: "Private API Key",
        type: "single-line-text",
        placeholder: "Private",
      },
    ],
  },
  "stripe-api-key": {
    title: "Stripe API keys",
    description: "Use this starter template to securely receive Stripe API keys to authenticate API requests.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Stripe account identifier",
        type: "single-line-text",
        placeholder: "Enter email or ID for the stripe account",
      },

      {
        title: "Publishable Key",
        type: "single-line-text",
        placeholder: "Enter Publishable Key",
      },
      {
        title: "Secret Key",
        type: "single-line-text",
        placeholder: "Enter Secret Key",
      },
    ],
  },
  "google-cloud-api-key": {
    title: "Google Cloud API keys",
    description: "Use this starter template to securely receive Google Cloud API keys to authenticate API requests.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "API key string",
        type: "single-line-text",
        placeholder: "AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe",
      },

      {
        title: "API key ID",
        type: "single-line-text",
        placeholder: "The key ID can be found in the URL of the key's edit page in the Google Cloud console",
      },
      {
        title: "Display name",
        type: "single-line-text",
        placeholder: "Descriptive name for the key",
      },
    ],
  },
  password: {
    title: "Password",
    description: "Use this starter template to securely receive passwords.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Password",
        type: "single-line-text",
        placeholder: "Password",
      },
    ],
  },
  "social-security-number": {
    title: "Social Security Number",
    description: "Use this starter template to securely receive Social Security Numbers.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Social Security Number",
        type: "single-line-text",
        placeholder: "123-45-6789",
      },
    ],
  },
  "credit-card-number": {
    title: "Credit Card Number",
    description: "Use this starter template to securely receive credit card numbers.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Credit Card Number",
        type: "single-line-text",
        placeholder: "4111 1111 1111 1111",
      },
      {
        title: "Expiration Date",
        type: "single-line-text",
        placeholder: "MM/YY",
      },
      {
        title: "CVV",
        type: "single-line-text",
        placeholder: "123",
      },
    ],
  },
  "home-address": {
    title: "Home Address",
    description: "Use this starter template to securely receive home addresses.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Street Address",
        type: "multi-line-text",
        placeholder: "123 Main St",
      },
      {
        title: "City",
        type: "single-line-text",
        placeholder: "City",
      },
      {
        title: "State",
        type: "single-line-text",
        placeholder: "State",
      },
      {
        title: "Zip Code",
        type: "single-line-text",
        placeholder: "12345",
      },
    ],
  },
  "bank-account": {
    title: "Bank Account",
    description: "Use this starter template to securely receive bank account details.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Bank Name",
        type: "single-line-text",
        placeholder: "Bank Name",
      },
      {
        title: "Routing Number",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Account Number",
        type: "single-line-text",
        placeholder: "987654321",
      },
    ],
  },
  "irs-i9": {
    title: "IRS I-9",
    description: "Use this starter template to securely receive IRS I-9 information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Employee Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Employee SSN",
        type: "single-line-text",
        placeholder: "123-45-6789",
      },
      {
        title: "Employee Address",
        type: "multi-line-text",
        placeholder: "123 Main St",
      },
      {
        title: "Employee City",
        type: "single-line-text",
        placeholder: "City",
      },
      {
        title: "Employee State",
        type: "single-line-text",
        placeholder: "State",
      },
      {
        title: "Employee Zip Code",
        type: "single-line-text",
        placeholder: "12345",
      },
    ],
  },
  "drivers-license": {
    title: "Driver's License",
    description: "Use this starter template to securely receive driver's license information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Driver License Number",
        type: "single-line-text",
        placeholder: "D1234567",
      },
      {
        title: "State",
        type: "single-line-text",
        placeholder: "State",
      },
      {
        title: "Upload License",
        type: "file",
        placeholder: "",
      },
    ],
  },
  passport: {
    title: "Passport",
    description: "Use this starter template to securely receive passport information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Passport Number",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Country of Issuance",
        type: "single-line-text",
        placeholder: "Country",
      },
      {
        title: "Upload Passport",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "health-insurance": {
    title: "Health Insurance",
    description: "Use this starter template to securely receive health insurance information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Insurance Company",
        type: "single-line-text",
        placeholder: "Insurance Company",
      },
      {
        title: "Policy Number",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Group Number",
        type: "single-line-text",
        placeholder: "987654321",
      },
      {
        title: "Upload Insurance Card",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "email-login": {
    title: "Email Login",
    description: "Use this starter template to securely receive email account credentials.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Email Address",
        type: "single-line-text",
        placeholder: "example@example.com",
      },
      {
        title: "Password",
        type: "single-line-text",
        placeholder: "Password",
      },
    ],
  },
  "medical-records": {
    title: "Medical Records",
    description: "Use this starter template to securely receive medical record information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Patient Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Medical Record Number",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Upload Medical Record",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "utility-account": {
    title: "Utility Account",
    description: "Use this starter template to securely receive utility account information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Utility Company",
        type: "single-line-text",
        placeholder: "Utility Company",
      },
      {
        title: "Account Number",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Upload Utility Bill",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "loan-account": {
    title: "Loan Account",
    description: "Use this starter template to securely receive loan account information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Loan Account Number",
        type: "single-line-text",
        placeholder: "987654321",
      },
      {
        title: "Loan Provider",
        type: "single-line-text",
        placeholder: "Loan Provider",
      },
      {
        title: "Upload Loan Document",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "tax-return": {
    title: "Tax Return",
    description: "Use this template to securely receive tax return documents.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Year",
        type: "single-line-text",
        placeholder: "2023",
      },
      {
        title: "Upload Tax Return",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "bitcoin-wallet-address": {
    title: "Bitcoin Wallet",
    description: "Use this template to securely receive tax return documents.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Type",
        type: "single-line-text",
        placeholder: "Bitcoin",
      },
      {
        title: "Wallet Address",
        type: "single-line-text",
        placeholder: "1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4ZnX71",
      },
    ],
  },
  "birth-certificate": {
    title: "Birth Certificate",
    description: "Use this template to securely receive birth certificate information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Full Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Date of Birth",
        type: "single-line-text",
        placeholder: "MM/DD/YYYY",
      },
      {
        title: "Upload Birth Certificate",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "marriage-certificate": {
    title: "Marriage Certificate",
    description: "Use this template to securely receive marriage certificate information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Spouse 1 Full Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Spouse 2 Full Name",
        type: "single-line-text",
        placeholder: "Jane Doe",
      },
      {
        title: "Date of Marriage",
        type: "single-line-text",
        placeholder: "MM/DD/YYYY",
      },
      {
        title: "Upload Marriage Certificate",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "property-deed": {
    title: "Property Deed",
    description: "Use this template to securely receive property deed information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Property Address",
        type: "multi-line-text",
        placeholder: "123 Main St",
      },
      {
        title: "Owner Full Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Upload Property Deed",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "medical-prescription": {
    title: "Medical Prescription",
    description: "Use this template to securely receive medical prescription information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Patient Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Medication Name",
        type: "single-line-text",
        placeholder: "Medication",
      },
      {
        title: "Dosage",
        type: "single-line-text",
        placeholder: "Dosage",
      },
      {
        title: "Upload Prescription",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "contract-agreement": {
    title: "Contract or Agreement",
    description: "Use this template to securely receive contract or agreement documents.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Contract Name",
        type: "single-line-text",
        placeholder: "Contract Name",
      },
      {
        title: "Parties Involved",
        type: "multi-line-text",
        placeholder: "John Doe, Jane Doe",
      },
      {
        title: "Upload Contract",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "investment-record": {
    title: "Investment Record",
    description: "Use this template to securely receive investment record information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Investment Account Number",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Upload Investment Statement",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "lease-agreement": {
    title: "Lease Agreement",
    description: "Use this template to securely receive lease agreement information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Property Address",
        type: "multi-line-text",
        placeholder: "123 Main St",
      },
      {
        title: "Tenant Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Upload Lease Agreement",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "utility-bill": {
    title: "Utility Bill",
    description: "Use this template to securely receive utility bill information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Utility Company",
        type: "single-line-text",
        placeholder: "Utility Company",
      },
      {
        title: "Account Number",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Upload Utility Bill",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "legal-document": {
    title: "Legal Document",
    description: "Use this template to securely receive legal document information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Document Name",
        type: "single-line-text",
        placeholder: "Document Name",
      },
      {
        title: "Upload Document",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "insurance-claim": {
    title: "Insurance Claim",
    description: "Use this template to securely receive insurance claim information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Claim Number",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Upload Claim Documents",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "payroll-information": {
    title: "Payroll Information",
    description: "Use this template to securely receive payroll information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Employee Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Employee ID",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Upload Payroll Document",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "background-check": {
    title: "Background Check",
    description: "Use this template to securely receive information needed for a background check.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Applicant Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Social Security Number",
        type: "single-line-text",
        placeholder: "123-45-6789",
      },
      {
        title: "Upload Driver's License",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "confidential-report": {
    title: "Confidential Report",
    description: "Use this template to securely receive confidential reports.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Report Title",
        type: "single-line-text",
        placeholder: "Report Title",
      },
      {
        title: "Upload Report",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "academic-transcript": {
    title: "Academic Transcript",
    description: "Use this template to securely receive academic transcripts.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Student Name",
        type: "single-line-text",
        placeholder: "John Doe",
      },
      {
        title: "Student ID",
        type: "single-line-text",
        placeholder: "123456789",
      },
      {
        title: "Upload Transcript",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "employment-verification": {
    title: "Employment Verification",
    description: "Use this starter template to securely receive employment verification information.",
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Employer Name",
        type: "single-line-text",
        placeholder: "Company Name",
      },
      {
        title: "Payroll Stub",
        type: "file",
        placeholder: "",
      },
      {
        title: "Bank Statement",
        type: "file",
        placeholder: "",
      },
    ],
  },
  "blox-bank-info": {
    title: "Blox Bank Info",
    description: "Collect banking information for properties in the Blox application.",
    private: true,
    fields: [
      {
        title: "Who is filling this out?",
        type: "single-line-text",
        placeholder: "Add your name or email",
      },
      {
        title: "Business Name",
        type: "single-line-text",
        placeholder: "Business Name",
      },
      {
        title: "Routing Number",
        type: "single-line-text",
        placeholder: "Routing Number",
      },
      {
        title: "Account Number",
        type: "single-line-text",
        placeholder: "Account Number",
      },
      {
        title: "Address",
        type: "multi-line-text",
        placeholder: "Address",
      },
    ],
  },
};
