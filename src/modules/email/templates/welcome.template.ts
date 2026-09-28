import type { EmailTemplate } from "../email.types.js";
import { renderBrandedEmail, type EmailBrand } from "./base.template.js";

export const createWelcomeEmail = ({
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
  const greeting = recipientName
    ? `Welcome, ${recipientName}!`
    : "Welcome aboard!";
  const brandName = brand?.brandName || "our platform";

  const details = userEmail
    ? [
        { label: "Account Email", value: userEmail },
        { label: "Access Tier", value: "Standard Account" },
      ]
    : undefined;

  return {
    subject: `Welcome to ${brandName} — Let's get started`,
    text: `${greeting}\n\nWelcome to ${brandName}. Your account has been successfully created and is ready for action.\n\nKey next steps:\n- Complete your profile setup\n- Connect your favorite integrations\n- Invite your team members\n\nSign in to get started: ${appUrl}\n\nIf you need help, feel free to reply directly to this email.`,
    html: renderBrandedEmail({
      previewText: `Your ${brandName} account is ready. Jump in and set up your workspace.`,
      title: `Welcome to ${brandName}`,
      greeting,
      paragraphs: [
        `We're thrilled to have you with us. Your account is fully set up and ready to power your workflow.`,
        `Here are a few quick things you can do right away to get the most out of your experience:`,
      ],
      features: [
        "Complete your profile & workspace setup",
        "Connect your essential tools & integrations",
        "Invite team members to collaborate in real-time",
      ],
      details,
      action: { label: "Go to Dashboard", url: appUrl },
      securityNote:
        "If you did not create this account, please notify our support team immediately.",
      variant: "welcome",
      brand,
    }),
  };
};
