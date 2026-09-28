import { config } from "../../../config/env.js";
import type { EmailTemplate } from "../email.types.js";
import { renderBrandedEmail, type EmailBrand } from "./base.template.js";

export const createPasswordResetEmail = ({
  resetUrl,
  recipientName,
  userEmail,
  expiresIn = "1 hour",
  brand,
}: {
  resetUrl: string;
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
    subject: `Reset your ${brandName} password`,
    text: `${greeting}\n\nWe received a request to reset your password for your ${brandName} account. Reset your password using the link below:\n${resetUrl}\n\nNote: This link is valid for ${expiresIn}.\n\nIf you did not request a password reset, you can safely ignore this email — your password will remain unchanged.`,
    html: renderBrandedEmail({
      previewText: `Reset your ${brandName} password securely. Link expires in ${expiresIn}.`,
      title: "Reset your password",
      greeting,
      paragraphs: [
        `We received a request to reset the password for your ${brandName} account. Click the button below to choose a new, secure password.`,
        `For security reasons, this password reset link will expire in ${expiresIn}.`,
      ],
      details,
      action: { label: "Reset Password", url: resetUrl },
      securityNote:
        "If you didn't request a password reset, you can safely ignore this email. Your current password will remain completely unchanged and secure.",
      variant: "default",
      brand: resolvedBrand,
    }),
  };
};
