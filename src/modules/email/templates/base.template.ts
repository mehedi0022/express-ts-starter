import { config, type AppConfig } from "../../../config/env.js";

export type EmailBrand = AppConfig["email"] & {
  tagline?: string;
  secondaryColor?: string;
};

export type EmailDetailItem = {
  label: string;
  value: string;
};

export type BrandedEmailContent = {
  previewText: string;
  title: string;
  greeting: string;
  paragraphs: string[];
  features?: string[];
  details?: EmailDetailItem[];
  action: { label: string; url: string };
  securityNote?: string;
  badge?: string;
  variant?: "default" | "welcome" | "notification";
  brand?: EmailBrand;
};

export const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const initials = (brandName: string) =>
  brandName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const safeHttpUrl = (value: string) => {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Email action URLs must use HTTP(S)");
  }
  return url.toString();
};

const brandMark = (brand: EmailBrand) => {
  if (brand.logoUrl) {
    return `<img src="${escapeHtml(safeHttpUrl(brand.logoUrl))}" width="40" height="40" alt="${escapeHtml(brand.brandName)}" style="display:block;border:0;border-radius:12px;outline:none;text-decoration:none;object-fit:contain;">`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" width="40" height="40" style="width:40px;height:40px;background:linear-gradient(135deg, ${brand.primaryColor} 0%, #1e1b4b 100%);border-radius:12px;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:16px;font-weight:700;letter-spacing:0.5px;">${escapeHtml(initials(brand.brandName))}</td></tr></table>`;
};

const renderDetails = (details?: EmailDetailItem[]) => {
  if (!details || details.length === 0) return "";
  const rows = details
    .map(
      (d) =>
        `<tr>
          <td style="padding:12px 18px;color:#64748b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:500;border-bottom:1px solid #f1f5f9;">${escapeHtml(d.label)}</td>
          <td align="right" style="padding:12px 18px;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9;">${escapeHtml(d.value)}</td>
        </tr>`,
    )
    .join("");

  return `<tr>
    <td style="padding:10px 0 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;border-collapse:separate;border-spacing:0;">
        ${rows}
      </table>
    </td>
  </tr>`;
};

const renderFeatures = (features?: string[]) => {
  if (!features || features.length === 0) return "";
  const listItems = features
    .map(
      (item) =>
        `<tr>
          <td valign="top" style="padding:8px 12px 8px 0;width:24px;">
            <div style="width:20px;height:20px;border-radius:50%;background:#ecfdf5;color:#10b981;text-align:center;line-height:20px;font-size:12px;font-weight:bold;">✓</div>
          </td>
          <td valign="middle" style="padding:8px 0;color:#334155;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:22px;">${escapeHtml(item)}</td>
        </tr>`,
    )
    .join("");

  return `<tr><td style="padding:8px 0 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${listItems}</table></td></tr>`;
};

export const renderBrandedEmail = ({
  previewText,
  title,
  greeting,
  paragraphs,
  features,
  details,
  action,
  securityNote,
  badge,
  variant = "default",
  brand = config.email,
}: BrandedEmailContent) => {
  const actionUrl = safeHttpUrl(action.url);
  const secondaryColor = brand.secondaryColor || "#0f172a";

  const badgeText =
    badge ||
    (variant === "welcome"
      ? "Account Created"
      : variant === "notification"
        ? "Security Alert"
        : "System Update");
  const badgeBg = variant === "notification" ? "#fef2f2" : "#f0fdf4";
  const badgeColor = variant === "notification" ? "#dc2626" : "#15803d";

  const intro = paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,sans-serif;font-size:15px;line-height:26px;letter-spacing:-0.1px;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>
  <style>
    @media only screen and (max-width:620px) {
      .email-shell { width:100% !important; }
      .email-card { border-radius:16px !important; margin:10px !important; }
      .email-padding { padding-left:24px !important; padding-right:24px !important; }
      .email-button { display:block !important; width:100% !important; text-align:center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;-webkit-font-smoothing:antialiased;">
  <!-- Hidden Preview Text -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(previewText)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-shell" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;">
          
          <!-- Top Brand Header -->
          <tr>
            <td align="center" style="padding:0 0 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:12px;vertical-align:middle;">${brandMark(brand)}</td>
                  <td style="vertical-align:middle;text-align:left;">
                    <div style="color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.3px;">${escapeHtml(brand.brandName)}</div>
                    ${brand.tagline ? `<div style="color:#64748b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;font-weight:500;">${escapeHtml(brand.tagline)}</div>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Premium Card -->
          <tr>
            <td class="email-card" style="background:#ffffff;border-radius:20px;border:1px solid #e2e8f0;box-shadow:0 20px 30px -10px rgba(15, 23, 42, 0.05);overflow:hidden;">
              
              <!-- Gradient Glow Accent Bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:6px;background:linear-gradient(90deg, ${brand.primaryColor} 0%, ${secondaryColor} 100%);"></td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="email-padding" style="padding:40px 44px 12px;">
                    
                    <!-- Dynamic Pill Badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="background:${badgeBg};color:${badgeColor};border-radius:20px;padding:4px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.3px;">
                          ${escapeHtml(badgeText)}
                        </td>
                      </tr>
                    </table>

                    <!-- Heading & Greeting -->
                    <h1 style="margin:0 0 12px;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:26px;font-weight:800;line-height:34px;letter-spacing:-0.6px;">${escapeHtml(title)}</h1>
                    <p style="margin:0 0 20px;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,sans-serif;font-size:16px;font-weight:600;line-height:24px;">${escapeHtml(greeting)}</p>
                    
                    <!-- Intro Paragraphs -->
                    ${intro}
                    
                    <!-- Dynamic Modules -->
                    ${renderFeatures(features)}
                    ${renderDetails(details)}

                  </td>
                </tr>

                <!-- Premium CTA Button -->
                <tr>
                  <td class="email-padding" style="padding:12px 44px 36px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="email-button" style="width:auto;">
                      <tr>
                        <td align="center" style="background:${brand.primaryColor};border-radius:12px;box-shadow:0 4px 14px rgba(0, 0, 0, 0.15);">
                          <a href="${escapeHtml(actionUrl)}" target="_blank" style="display:inline-block;padding:15px 32px;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;line-height:20px;text-decoration:none;letter-spacing:-0.2px;">
                            ${escapeHtml(action.label)} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Security Note Module -->
                ${
                  securityNote
                    ? `<tr>
                        <td class="email-padding" style="padding:0 44px 36px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border-left:3px solid ${brand.primaryColor};border-radius:4px 8px 8px 4px;">
                            <tr>
                              <td style="padding:14px 16px;color:#64748b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:20px;">
                                <strong style="color:#334155;">Security Notice:</strong> ${escapeHtml(securityNote)}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>`
                    : ""
                }

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 20px 0;">
              <p style="margin:0 0 8px;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:20px;">
                ${
                  brand.supportEmail
                    ? `Have questions? Contact <a href="mailto:${escapeHtml(brand.supportEmail)}" style="color:${brand.primaryColor};text-decoration:none;font-weight:500;">${escapeHtml(brand.supportEmail)}</a>`
                    : "Automated security alert. Please do not reply."
                }
              </p>
              <p style="margin:0;color:#cbd5e1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;">
                © ${new Date().getFullYear()} ${escapeHtml(brand.brandName)}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
