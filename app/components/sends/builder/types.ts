/**
 * This file contains the frontend types for the send builder component.
 */

/**
 * A single-line text field.
 */
type SingleLineTextField = {
  /** A single-line text field. */
  type: "single-line-text";

  /** The single-line string value of the field. */
  value: string | null;
};

/**
 * A multi-line text field.
 */
type MultiLineTextField = {
  /** A multi-line text field. */
  type: "multi-line-text";

  /** The multi-line string value of the field. */
  value: string | null;

  /** The number of rows for the text area. */
  rows?: number;
};

/**
 * A file field.
 */
type FileField = {
  /** A file field. */
  type: "file";

  /** The file value of the field. */
  value: Array<File> | null;
};

/**
 * A field in the send builder.
 */
export type SendBuilderField = {
  /** The title of the field. */
  title: string;

  /** A placeholder for display purposes. */
  placeholder?: string;
} & (SingleLineTextField | MultiLineTextField | FileField);

/** Expiration date time unit options. */
export const EXPIRATION_DATE_TIME_UNIT_OPTIONS = ["minutes", "hours", "days", "weeks"] as const;

/** Expiration date time units. */
export type ExpirationDateTimeUnits = (typeof EXPIRATION_DATE_TIME_UNIT_OPTIONS)[number];

/**
 * The configuration for a send.
 */
export type SendBuilderConfiguration = {
  /** The title of the send. */
  title: string;

  /** The password for a send. Optional. */
  password: string | null;

  /** The expiration expression for a send. Optional.  */
  expirationDate: {
    /** The total time units for the send. */
    totalTimeUnits: number;

    /** The time unit for the send. */
    timeUnit: ExpirationDateTimeUnits;
  } | null;

  /** The email address for MFA. Optional. */
  confirmationEmail: string | null;

  /** The max number of views allowed for the send. Optional. If not set, defaults to one. */
  maxViews: number | null;

  /** The fields in the send. */
  fields: Array<SendBuilderField>;
};

/**
 * A send builder template.
 */
export type SendBuilderTemplate = {
  /** The title of the template. */
  title: string;

  /** The description of the template. */
  description: string;

  /** The fields for the template */
  fields: Array<Omit<SendBuilderField, "value">>;

  /** Optional flag. If true, the template will not be shown in the template list or sitemap. */
  private?: boolean;
};

/**
 * Our library of sending templates.
 */
export const SEND_BUILDER_TEMPLATES: { [SLUG in string]: SendBuilderTemplate } = {
  new: {
    title: "Blank Send",
    description: "Start from scratch and share any data with end-to-end encryption.",
    fields: [
      {
        title: "Untitled",
        type: "single-line-text",
        placeholder: "Enter Text",
      },
    ],
  },
  /** A template for sending an AWS API key. */
  "aws-api-key": {
    title: "AWS API Key",
    description: "Use this starter template to securely send an AWS API Key that is end-to-end encrypted.",
    fields: [
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
    description: "Use this starter template to securely send an API key that is end-to-end encrypted.",
    fields: [
      {
        title: "API Key description",
        type: "single-line-text",
        placeholder: "Enter description",
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
    description: "Use this starter template to securely send Stripe API keys to authenticate API requests.",
    fields: [
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
    description: "Use this starter template to securely send Google Cloud API keys to authenticate API requests.",
    fields: [
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
    description: "Use this starter template to securely send a password.",
    fields: [
      {
        title: "Password",
        type: "single-line-text",
        placeholder: "Password",
      },
    ],
  },
  "social-security-number": {
    title: "Social Security Number",
    description: "Use this starter template to securely send a Social Security Number.",
    fields: [
      {
        title: "Social Security Number",
        type: "single-line-text",
        placeholder: "123-45-6789",
      },
    ],
  },
  "credit-card-number": {
    title: "Credit Card Number",
    description: "Use this starter template to securely send a credit card number.",
    fields: [
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
    description: "Use this starter template to securely send a home address.",
    fields: [
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
    description: "Use this starter template to securely send bank account details.",
    fields: [
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
    description: "Use this starter template to securely send IRS I-9 information.",
    fields: [
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
    description: "Use this starter template to securely send driver's license information.",
    fields: [
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
    description: "Use this starter template to securely send passport information.",
    fields: [
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
    description: "Use this starter template to securely send health insurance information.",
    fields: [
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
    description: "Use this starter template to securely send email account credentials.",
    fields: [
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
    description: "Use this starter template to securely send medical record information.",
    fields: [
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
    description: "Use this starter template to securely send utility account information.",
    fields: [
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
    description: "Use this starter template to securely send loan account information.",
    fields: [
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
    description: "Use this template to securely send tax return documents.",
    fields: [
      {
        title: "Year",
        type: "single-line-text",
        placeholder: "2023",
      },
      {
        title: "Year",
        type: "single-line-text",
        placeholder: "2023",
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
  "birth-certificate": {
    title: "Birth Certificate",
    description: "Use this template to securely send birth certificate information.",
    fields: [
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
    description: "Use this template to securely send marriage certificate information.",
    fields: [
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
    description: "Use this template to securely send property deed information.",
    fields: [
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
    description: "Use this template to securely send medical prescription information.",
    fields: [
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
    description: "Use this template to securely send contract or agreement documents.",
    fields: [
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
    description: "Use this template to securely send investment record information.",
    fields: [
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
    description: "Use this template to securely send lease agreement information.",
    fields: [
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
    description: "Use this template to securely send utility bill information.",
    fields: [
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
    description: "Use this template to securely send legal document information.",
    fields: [
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
    description: "Use this template to securely send insurance claim information.",
    fields: [
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
    description: "Use this template to securely send payroll information.",
    fields: [
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
    description: "Use this template to securely send information needed for a background check.",
    fields: [
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
    description: "Use this template to securely send confidential reports.",
    fields: [
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
    description: "Use this template to securely send academic transcripts.",
    fields: [
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
    description: "Use this starter template to securely send employment verification information.",
    fields: [
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
