import { config } from "../../../config/env.js";
import type { EmailTemplate } from "../email.types.js";
import { renderBrandedEmail, type EmailBrand } from "./base.template.js";

export const createPasswordChangedEmail = ({
  appUrl,
  recipientName,
  userEmail,
  changedAt,
  brand,
}: {
  appUrl: string;
  recipientName?: string;
  userEmail?: string;
  changedAt?: string;
  brand?: EmailBrand;
}): EmailTemplate => {
  const resolvedBrand = brand ?? config.email;
  const brandName = resolvedBrand.brandName;

  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";
  const timeFormatted = changedAt ?? "Just now";

  const details = userEmail
    ? [
        { label: "Account Email", value: userEmail },
        { label: "Time of Change", value: timeFormatted },
        { label: "Active Sessions", value: "Signed out" },
      ]
    : undefined;

  return {
    subject: `Security Alert: Your ${brandName} password was changed`,
    text: `${greeting}\n\nThis is a confirmation that your ${brandName} account password was changed on ${timeFormatted}.\n\nAll other active sessions have been signed out automatically for your protection.\n\nIF YOU DID NOT MAKE THIS CHANGE:\nSecure your account immediately by visiting: ${appUrl}`,
    html: renderBrandedEmail({
      previewText: `Security alert: Your ${brandName} account password was recently updated.`,
      title: "Password updated",
      greeting,
      paragraphs: [
        `This email confirms that your password for your ${brandName} account was changed successfully.`,
        `For your protection, all other active browser and mobile sessions have been automatically signed out.`,
      ],
      details,
      action: { label: "Secure Account Immediately", url: appUrl },
      securityNote:
        "CRITICAL: If you did not authorize this password change, someone else may have accessed your account. Click the button above to secure your account immediately.",
      variant: "notification",
      brand: resolvedBrand,
    }),
  };
};
