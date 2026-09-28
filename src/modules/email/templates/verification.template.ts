import { config } from "../../../config/env.js";
import type { EmailTemplate } from "../email.types.js";
import { renderBrandedEmail, type EmailBrand } from "./base.template.js";

export const createVerificationEmail = ({
  verificationUrl,
  recipientName,
  userEmail,
  expiresIn = "24 hours",
  brand,
}: {
  verificationUrl: string;
  recipientName?: string;
  userEmail?: string;
  expiresIn?: string;
  brand?: EmailBrand;
}): EmailTemplate => {
  const resolvedBrand = brand ?? config.email;
  const brandName = resolvedBrand.brandName;

  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";

  const details = userEmail
    ? [
        { label: "Account Email", value: userEmail },
        { label: "Link Validity", value: expiresIn },
      ]
    : undefined;

  return {
    subject: `Verify your email address for ${brandName}`,
    text: `${greeting}\n\nPlease verify your email address for ${brandName} by visiting the link below:\n${verificationUrl}\n\nNote: This link will expire in ${expiresIn}.\n\nIf you did not request this, you can safely ignore this email.`,
    html: renderBrandedEmail({
      previewText: `Verify your email address to complete your ${brandName} registration.`,
      title: "Verify your email address",
      greeting,
      paragraphs: [
        `Thanks for getting started with ${brandName}. Please confirm your email address by clicking the button below to finish setting up your account.`,
        `For your security, this verification link will expire in ${expiresIn}.`,
      ],
      details,
      action: { label: "Verify Email Address", url: verificationUrl },
      securityNote:
        "If you didn't request this email, no further action is needed and you can safely ignore it.",
      variant: "default",
      brand: resolvedBrand,
    }),
  };
};
