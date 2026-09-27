import type { EmailTemplate } from "../email.types.js";
import { renderBrandedEmail, type EmailBrand } from "./base.template.js";

export const createEmailVerifiedEmail = ({
  appUrl,
  recipientName,
  brand,
}: {
  appUrl: string;
  recipientName?: string;
  brand?: EmailBrand;
}): EmailTemplate => {
  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";

  return {
    subject: "Your email address is verified",
    text: `${greeting}\n\nYour email address has been verified. You can now continue using your account: ${appUrl}`,
    html: renderBrandedEmail({
      previewText: "Your email address has been verified.",
      title: "Email verified",
      greeting,
      paragraphs: [
        "Your email address has been verified successfully.",
        "Your account is ready for you to continue.",
      ],
      action: { label: "Open the app", url: appUrl },
      brand,
    }),
  };
};
