import { Resend } from "resend";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromAddress = process.env.EMAIL_FROM ?? "Tracker <onboarding@resend.dev>";

export async function sendStatusChangeEmail({
  to,
  name,
  company,
  title,
  previousStatus,
  newStatus,
}: {
  to: string;
  name: string;
  company: string;
  title: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
}) {
  const subject = `Status update: ${title} at ${company}`;
  const body = `Hi ${name},

Your application status changed:

${title} — ${company}
${STATUS_LABELS[previousStatus]} → ${STATUS_LABELS[newStatus]}

— Tracker`;

  if (!resend) {
    console.info("[email:demo]", { to, subject, body });
    return { ok: true as const, mode: "demo" as const };
  }

  const { error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject,
    text: body,
  });

  if (error) {
    console.error("[email:error]", error);
    return { ok: false as const, mode: "live" as const, error: error.message };
  }

  return { ok: true as const, mode: "live" as const };
}
