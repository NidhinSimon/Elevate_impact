import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const emailService = {
  async sendEmail(to: string | string[], subject: string, html: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Email Service Error:", err);
      return null;
    }
  },

  async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
        <h1 style="color: #0F0A4A;">Welcome to Elevated Impact 🌟</h1>
        <p>Hi ${name},</p>
        <p>We're thrilled to have you join our mission-driven community. Your athletic performance is now a force for global good.</p>
        <div style="margin: 30px 0; padding: 20px; background: #F8F9FE; border-radius: 15px;">
          <h3 style="margin-top: 0;">Next Steps:</h3>
          <ul style="padding-left: 20px;">
            <li>Choose your impact partner in the dashboard</li>
            <li>Set your charitable contribution percentage</li>
            <li>Log your first score to qualify for the next draw</li>
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="display: inline-block; padding: 15px 30px; background: #34D399; color: #0F0A4A; text-decoration: none; border-radius: 12px; font-weight: bold;">Go to Dashboard</a>
      </div>
    `;
    return this.sendEmail(email, "Welcome to Elevated Impact 🌟", html);
  },

  async sendDrawResults(emails: string[], drawnNumbers: number[]) {
    const html = `
      <div style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h2 style="color: #0F0A4A;">The Monthly Draw Results Are In!</h2>
        <div style="margin: 30px 0;">
          ${drawnNumbers.map(n => `<span style="display: inline-block; width: 40px; height: 40px; line-height: 40px; background: #0F0A4A; color: white; border-radius: 50%; margin: 5px; font-weight: bold;">${n}</span>`).join('')}
        </div>
        <p>Check the dashboard to see if you matched and view your impact contribution for this cycle.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/draw" style="display: inline-block; padding: 12px 24px; background: #34D399; color: #0F0A4A; text-decoration: none; border-radius: 10px; font-weight: bold;">View Full Results</a>
      </div>
    `;
    return this.sendEmail(emails, "Monthly Draw Results - Elevated Impact", html);
  },

  async sendWinnerAlert(email: string, amount: number) {
    const html = `
      <div style="font-family: sans-serif; padding: 40px; border: 2px solid #34D399; border-radius: 24px;">
        <h1 style="color: #0F0A4A;">🏆 You've won!</h1>
        <p style="font-size: 18px;">Congratulations! You matched the sequence and have won <span style="font-weight: 900; color: #15803d;">£${amount.toLocaleString()}</span>.</p>
        <p>To claim your prize, please upload your proof of performance in the dashboard winnings section.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/winnings" style="display: inline-block; padding: 15px 30px; background: #0F0A4A; color: white; text-decoration: none; border-radius: 12px; font-weight: bold;">Claim Prize Now</a>
      </div>
    `;
    return this.sendEmail(email, `🏆 You've won! Claim your £${amount.toLocaleString()}`, html);
  },

  async sendPayoutConfirmed(email: string, amount: number) {
    const html = `
      <div style="font-family: sans-serif; padding: 40px;">
        <h2 style="color: #0F0A4A;">Your prize payment is on its way 💸</h2>
        <p>Good news! Your payout of <strong>£${amount.toLocaleString()}</strong> has been approved and is being processed.</p>
        <p>A portion of this win has also been allocated to your chosen charity as part of your impact commitment.</p>
        <p>Thank you for being part of Elevated Impact.</p>
      </div>
    `;
    return this.sendEmail(email, "Your prize payment is on its way 💸", html);
  }
};
