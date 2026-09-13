import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


const transporterPromise = (async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('✉️ Configuring real SMTP server:', process.env.SMTP_HOST);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    console.log('✉️ No SMTP credentials found in env. Generating Ethereal test email account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('✉️ Ethereal SMTP account created successfully:', testAccount.user);
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (err) {
      console.error('❌ Failed to create Ethereal SMTP test account, falling back to dummy console transport:', err.message);
      
      return {
        sendMail: async (options) => {
          console.log('\n--- DUMMY EMAIL TRANSPORT LOG ---');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log('---------------------------------\n');
          return { messageId: 'dummy_id_' + Date.now() };
        }
      };
    }
  }
})();

let activeTransporter = null;

async function getTransporter() {
  if (activeTransporter) return activeTransporter;
  activeTransporter = await transporterPromise;
  return activeTransporter;
}


async function sendMail({ to, subject, html }) {
  try {
    const transporter = await getTransporter();
    const sender = process.env.SMTP_FROM || `"UniRetrieve AI" <${process.env.SMTP_USER || 'noreply@uniretrieve.univ'}>`;
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html
    });
    
    console.log(`✉️ Email notification sent successfully to: ${to}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`✉️ Ethereal Email Preview URL: ${previewUrl}`);
    }
    return info;
  } catch (err) {
    console.error('❌ Error occurred while sending email:', err.message);
    return null;
  }
}


function getHtmlTemplate(title, bodyHtml) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            background-color: #030303;
            color: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #0b0b0f;
            border: 1px solid rgba(0, 245, 255, 0.2);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0, 245, 255, 0.05);
          }
          .header {
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .logo {
            font-family: monospace;
            font-size: 24px;
            font-weight: bold;
            color: #00f5ff;
            text-shadow: 0 0 10px rgba(0, 245, 255, 0.4);
            letter-spacing: 1px;
          }
          .title {
            color: #ffffff;
            font-size: 20px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 15px;
            text-align: center;
          }
          .content {
            font-size: 15px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 25px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            background-color: rgba(168, 85, 247, 0.15);
            border: 1px solid #a855f7;
            color: #ffffff !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 14px;
            display: inline-block;
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.1);
          }
          .footer {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
          }
          .highlight {
            color: #00ff88;
            font-weight: bold;
          }
          .highlight-cyan {
            color: #00f5ff;
            font-weight: bold;
          }
          .details-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">UniRetrieve AI</div>
          </div>
          <h2 class="title">${title}</h2>
          <div class="content">
            ${bodyHtml}
          </div>
          <div class="footer">
            This is an automated security notification from UniRetrieve Campus Asset Recovery System.<br>
            &copy; 2026 UniRetrieve. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

export const notificationService = {
  
  async sendMatchNotification(recipientEmail, recipientName, itemTitle, similarityScore, matchId) {
    const title = 'Possible Match Found!';
    const matchUrl = `http://localhost:5173/match/${matchId}`;
    const bodyHtml = `
      <p>Hello ${recipientName},</p>
      <p>Our UniRetrieve matching engine has detected a potential match for your reported item: <span class="highlight-cyan">"${itemTitle}"</span>.</p>
      <div class="details-card">
        <p style="margin: 0;"><strong>Match Strength:</strong> <span class="highlight" style="font-size: 18px;">${similarityScore}% Similarity</span></p>
        <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Pending Claim Verification</p>
      </div>
      <p>Secure ownership verification is required to claim this item. Please review the match details and submit your challenge responses in the portal.</p>
      <div class="button-container">
        <a href="${matchUrl}" class="button">View Match & Claim</a>
      </div>
    `;
    
    return sendMail({
      to: recipientEmail,
      subject: `[UniRetrieve] AI Match Detected: ${itemTitle} (${similarityScore}% Match)`,
      html: getHtmlTemplate(title, bodyHtml)
    });
  },

  
  async sendClaimNotification(recipientEmail, recipientName, itemTitle, claimantName, studentId) {
    const title = 'Ownership Claim Request Received';
    const bodyHtml = `
      <p>Hello ${recipientName},</p>
      <p>A claim request has been filed for the item you found: <span class="highlight-cyan">"${itemTitle}"</span>.</p>
      <div class="details-card">
        <p style="margin: 0;"><strong>Claimant:</strong> ${claimantName}</p>
        <p style="margin: 5px 0 0 0;"><strong>Student ID:</strong> ${studentId}</p>
      </div>
      <p>Please log in to the UniRetrieve portal, review their challenge-response answers, and verify their student card proof to resolve this claim.</p>
      <div class="button-container">
        <a href="http://localhost:5173/chat" class="button">Open Chat & Verify</a>
      </div>
    `;

    return sendMail({
      to: recipientEmail,
      subject: `[UniRetrieve] New Claim File for Found: ${itemTitle}`,
      html: getHtmlTemplate(title, bodyHtml)
    });
  },

  
  async sendResolutionNotification(recipientEmail, recipientName, itemTitle, isApproved) {
    const title = isApproved ? 'Claim Request Approved! 🟢' : 'Claim Request Declined 🔴';
    const bodyHtml = `
      <p>Hello ${recipientName},</p>
      <p>Your ownership claim for <span class="highlight-cyan">"${itemTitle}"</span> has been <span class="${isApproved ? 'highlight' : 'highlight-cyan'}">${isApproved ? 'APPROVED' : 'DECLINED'}</span>.</p>
      
      ${isApproved ? `
        <div class="details-card" style="border-color: rgba(0, 255, 136, 0.3); background: rgba(0, 255, 136, 0.02);">
          <p style="margin: 0;"><strong>Next Step:</strong> Arrange pickup with the finder inside the chat or visit the security office.</p>
        </div>
        <p>Please ensure you bring your student ID card for identity confirmation upon meeting.</p>
      ` : `
        <div class="details-card" style="border-color: rgba(255, 0, 110, 0.3); background: rgba(255, 0, 110, 0.02);">
          <p style="margin: 0;"><strong>Reason:</strong> The details or image proof submitted did not match the item criteria.</p>
        </div>
        <p>You can re-submit the verification proof or contact Campus Security (ADMIN001) for further assistance.</p>
      `}
      <div class="button-container">
        <a href="http://localhost:5173/chat" class="button">Open Chat</a>
      </div>
    `;

    return sendMail({
      to: recipientEmail,
      subject: `[UniRetrieve] Claim Resolution: ${itemTitle} (${isApproved ? 'Approved' : 'Declined'})`,
      html: getHtmlTemplate(title, bodyHtml)
    });
  }
};
