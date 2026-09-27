import type { EmailTemplate } from "../email.types.js";
import { renderBrandedEmail, type EmailBrand } from "./base.template.js";

export const createWelcomeEmail = ({
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
    subject: "Welcome! Your account is ready",
    text: `${greeting}\n\nWelcome to your new account. You can now sign in and get started: ${appUrl}`,
    html: renderBrandedEmail({
      previewText: "Your new account is ready to use.",
      title: "Welcome aboard",
      greeting,
      paragraphs: [
        "Your account has been created successfully and is ready to use.",
        "Sign in to explore your workspace and make the most of what’s next.",
      ],
      action: { label: "Open the app", url: appUrl },
      variant: "welcome",
      brand,
    }),
  };
};
