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
      <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 40px; background: #ffffff;">
        <h1 style="color: #1A146B; font-weight: 900; margin-bottom: 24px;">Welcome to Elevate Impact 🌟</h1>
        <p style="color: #475569; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #475569; line-height: 1.6;">Your journey toward athletic excellence and global impact starts now.</p>
        <div style="margin: 32px 0; padding: 32px; background: #F8F9FE; border-radius: 24px; border: 1px solid #EEF2FF;">
          <h3 style="color: #1A146B; margin-top: 0; font-weight: 800;">Next Steps:</h3>
          <ul style="color: #475569; padding-left: 20px;">
            <li>Select your Impact Partner</li>
            <li>Log your first performance score</li>
            <li>Qualify for the monthly £10k+ Draw</li>
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="display: inline-block; padding: 20px 40px; background: #68dba9; color: #1A146B; text-decoration: none; border-radius: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Go to Dashboard</a>
      </div>
    `;
    return this.sendEmail(email, "Welcome to Elevate Impact 🌟", html);
  },

  async sendDrawResults(emails: string[], drawnNumbers: number[]) {
    const html = `
      <div style="font-family: 'Manrope', sans-serif; text-align: center; padding: 60px; background: #1A146B; color: #ffffff; border-radius: 40px;">
        <h2 style="font-weight: 900; font-size: 32px; margin-bottom: 40px;">The Numbers are In!</h2>
        <div style="margin-bottom: 40px;">
          ${drawnNumbers.map(n => `<span style="display: inline-block; width: 50px; height: 50px; line-height: 50px; background: #68dba9; color: #1A146B; border-radius: 16px; margin: 8px; font-weight: 900; font-size: 20px;">${n}</span>`).join('')}
        </div>
        <p style="color: #A5B4FC; font-weight: 500; margin-bottom: 40px;">Check your dashboard to see if you've matched this cycle's sequence.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/draw" style="display: inline-block; padding: 18px 36px; background: #ffffff; color: #1A146B; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase;">View Leaderboard</a>
      </div>
    `;
    return this.sendEmail(emails, "Draw Results: Elevate Impact Cycle Complete", html);
  },

  async sendWinnerAlert(email: string, amount: number) {
    const html = `
      <div style="font-family: 'Manrope', sans-serif; padding: 60px; border: 2px solid #68dba9; border-radius: 40px; text-align: center; background: #ffffff;">
        <h1 style="color: #1A146B; font-weight: 900; font-size: 40px; margin-bottom: 16px;">🏆 YOU WON!</h1>
        <p style="font-size: 20px; color: #475569; margin-bottom: 40px;">Congratulations! Your performance has earned you <span style="font-weight: 900; color: #1A146B;">$${amount.toLocaleString()}</span>.</p>
        <div style="margin-bottom: 40px; padding: 24px; background: #F0FDF4; border-radius: 20px; color: #166534; font-weight: 700;">
          IMPORTANT: You must verify your score to claim the payout.
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/verify-win" style="display: inline-block; padding: 20px 40px; background: #1A146B; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 900; text-transform: uppercase;">Verify & Claim Now</a>
      </div>
    `;
    return this.sendEmail(email, `🏆 You've won! Claim your $${amount.toLocaleString()}`, html);
  },

  async sendPayoutConfirmed(email: string, amount: number) {
    const html = `
      <div style="font-family: 'Manrope', sans-serif; padding: 60px; background: #F8F9FE; border-radius: 40px; text-align: center;">
        <h2 style="color: #1A146B; font-weight: 900; font-size: 32px; margin-bottom: 16px;">Payout Confirmed 💸</h2>
        <p style="color: #475569; font-size: 18px; line-height: 1.6; margin-bottom: 40px;">Your prize of <strong>£${amount.toLocaleString()}</strong> is on its way to your account.</p>
        <div style="padding: 24px; background: #ffffff; border-radius: 20px; border: 1px solid #EEF2FF; display: inline-block;">
          <p style="margin: 0; color: #1A146B; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Keep Elevating. Keep Impacting.</p>
        </div>
      </div>
    `;
    return this.sendEmail(email, "Your prize payment is on its way 💸", html);
  }
};

