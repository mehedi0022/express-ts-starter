import { config } from "../../../config/env.js";
import type { EmailTemplate } from "../email.types.js";
import { renderBrandedEmail, type EmailBrand } from "./base.template.js";

export const createEmailVerifiedEmail = ({
  appUrl,
  recipientName,
  userEmail,
  brand,
}: {
  appUrl: string;
  recipientName?: string;
  userEmail?: string;
  brand?: EmailBrand;
}): EmailTemplate => {
  const resolvedBrand = brand ?? config.email;
  const brandName = resolvedBrand.brandName;

  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";

  const details = userEmail
    ? [
        { label: "Verified Email", value: userEmail },
        { label: "Account Status", value: "Active & Verified" },
      ]
    : undefined;

  return {
    subject: `Email verified — Welcome to ${brandName}`,
    text: `${greeting}\n\nYour email address has been successfully verified for ${brandName}.\n\nYour account is now fully active. Access your workspace here: ${appUrl}`,
    html: renderBrandedEmail({
      previewText: `Your email address has been verified. Access your ${brandName} account now.`,
      title: "Email address verified",
      greeting,
      paragraphs: [
        `Great news! Your email address has been verified successfully.`,
        `Your account is now fully active and ready. Click the button below to sign in and jump straight into your dashboard.`,
      ],
      details,
      action: { label: "Go to Workspace", url: appUrl },
      securityNote:
        "If you did not initiate this email verification, please contact our support team immediately.",
      variant: "welcome",
      brand: resolvedBrand,
    }),
  };
};
