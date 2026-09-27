import type { EmailTemplate } from "../email.types.js";
import { renderBrandedEmail, type EmailBrand } from "./base.template.js";

export const createPasswordChangedEmail = ({
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
    subject: "Your password was changed",
    text: `${greeting}\n\nYour password was changed successfully. If this was not you, secure your account immediately: ${appUrl}`,
    html: renderBrandedEmail({
      previewText: "Your account password was changed.",
      title: "Password changed",
      greeting,
      paragraphs: [
        "Your password was changed successfully and other active sessions were signed out.",
        "If you did not make this change, please secure your account immediately.",
      ],
      action: { label: "Secure your account", url: appUrl },
      securityNote: "For your protection, never share your password or verification codes with anyone.",
      brand,
    }),
  };
};
