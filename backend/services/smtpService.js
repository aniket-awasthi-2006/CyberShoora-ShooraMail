import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { saveSentEmail } from './imapService.js';
dotenv.config();

const createTransporter = (authDetails) => {
    const auth = authDetails
        ? {
            user: authDetails.user,
            pass: authDetails.pass,
        }
        : {
            user: process.env.SITE_EMAIL,
            pass: process.env.SITE_PASSWORD,
        };

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.stackmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true',
        tls: {
            rejectUnauthorized: false,
        },
        auth: auth,
    });
};

const sendEmail = async (authDetails, mailOptions) => {
    const transporter = createTransporter(authDetails);
    return transporter.sendMail(mailOptions);

  
};

const replyEmail = async (authDetails, mailOptions) => {
    const replySubject = mailOptions.subject.startsWith('Re: ') ? mailOptions.subject : `Re: ${mailOptions.subject}`;
    
    // Handle HTML content properly
    let replyBodyHtml, replyBodyText;
    
    if (mailOptions.html) {
        replyBodyHtml = `${mailOptions.html}<br><br><hr><p><em>--- Original Message ---</em></p>${mailOptions.html}`;
        replyBodyText = mailOptions.text || mailOptions.html.replace(/<[^>]*>?/gm, '');
    } else {
        replyBodyText = `\n\n--- Original Message ---\n${mailOptions.text}`;
        replyBodyHtml = `<div>${replyBodyText.replace(/\n/g, '<br>')}</div>`;
    }

    const replyOptions = {
        ...mailOptions,
        subject: replySubject,
        html: replyBodyHtml,
        text: replyBodyText,
    };

    const transporter = createTransporter(authDetails);
    return transporter.sendMail(replyOptions);
};

const forwardEmail = async (authDetails, mailOptions) => {
    const forwardSubject = mailOptions.subject.startsWith('Fwd: ') ? mailOptions.subject : `Fwd: ${mailOptions.subject}`;
    
    // Handle HTML content properly
    let forwardBodyHtml, forwardBodyText;
    
    if (mailOptions.html) {
        forwardBodyHtml = `${mailOptions.html}<br><br><hr><p><em>--- Forwarded Message ---</em></p>${mailOptions.html}`;
        forwardBodyText = mailOptions.text || mailOptions.html.replace(/<[^>]*>?/gm, '');
    } else {
        forwardBodyText = `\n\n--- Forwarded Message ---\n${mailOptions.text}`;
        forwardBodyHtml = `<div>${forwardBodyText.replace(/\n/g, '<br>')}</div>`;
    }

    const forwardOptions = {
        ...mailOptions,
        subject: forwardSubject,
        html: forwardBodyHtml,
        text: forwardBodyText,
    };

    const transporter = createTransporter(authDetails);
    return transporter.sendMail(forwardOptions);
};

export { sendEmail, replyEmail, forwardEmail };
