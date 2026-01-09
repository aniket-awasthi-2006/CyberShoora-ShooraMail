import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fetchInbox, fetchEmailsByFolder, markAsRead, deleteEmail, moveEmail, toggleStarred, toggleImportant, saveDraft, saveSentEmail, downloadAttachment } from '../services/imapService.js';
import { sendEmail, replyEmail, forwardEmail } from '../services/smtpService.js';

const router = express.Router();

// Utility function to clean up uploaded files
const cleanupUploadedFiles = (attachments) => {
    if (attachments && Array.isArray(attachments)) {
        attachments.forEach(attachment => {
            if (attachment.path && fs.existsSync(attachment.path)) {
                try {
                    fs.unlinkSync(attachment.path);
                    console.log(`Cleaned up file: ${attachment.path}`);
                } catch (err) {
                    console.error(`Failed to cleanup file ${attachment.path}:`, err);
                }
            }
        });
    }
};

// Configure multer for file uploads
// Ensure uploads directory exists relative to project root
const uploadsDir = path.join(process.cwd(), 'backend/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.zip', '.rar'];
        const allowedMimeTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/zip', 'application/x-rar-compressed'
        ];

        const extname = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype.toLowerCase();

        if (allowedExtensions.includes(extname) && allowedMimeTypes.includes(mimetype)) {
            return cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Extension: ${extname}, MIME: ${mimetype}`));
        }
    }
});

// Login and Fetch Initial Emails
router.post('/login-fetch', async (req, res) => {
    const { email, password } = req.body;

    try {
        const emails = await fetchInbox(email, password, 1, 10);

        // Send Welcome Mail (Fire and forget)
        const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Email</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            width: 100%;
            margin: 0;
            padding: 0;
        }
        .responsive-image {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 10px;
            -webkit-border-radius: 10px;
            -moz-border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <img src="https://res.cloudinary.com/dtwumvj5i/image/upload/v1767200085/Mail_Image_iwjmp1.jpg" 
             alt="Mail Image" 
             class="responsive-image">
    </div>
</body>
</html>
        `;

        sendEmail(
            null,
            {
                from: `Shoora Mail <${process.env.SITE_EMAIL}>`,
                to: email,
                subject: 'Welcome to Shoora Mail! 🚀',
                html: welcomeHtml,
                text: 'Welcome to Shoora Mail! You have successfully logged in.',
            }
        ).catch(err => { });
        res.status(200).json({ success: true, data: emails });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid Credentials or Connection Failed" });
    }
});

// Fetch Inbox Emails
router.post('/inbox-fetch', async (req, res) => {
    const { email, password, page = 1, limit = 10 } = req.body;

    try {
        const emails = await fetchInbox(email, password, parseInt(page), parseInt(limit));
        res.status(200).json({ success: true, data: emails });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch inbox" });
    }
});

// Fetch Emails by Folder
router.post('/folder-fetch', async (req, res) => {
    const { email, password, folder, page = 1, limit = 10 } = req.body;

    try {
        const emails = await fetchEmailsByFolder(email, password, folder, parseInt(page), parseInt(limit));
        res.status(200).json({ success: true, data: emails });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch folder emails" });
    }
});

// Send Email with error handling middleware
const handleMulterError = (error, req, res, next) => {
    // Clean up any uploaded files on error
    const attachments = req.files?.attachments || [];
    cleanupUploadedFiles(attachments);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: "File size exceeds 10MB limit" });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ success: false, message: "Maximum 10 attachments allowed" });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ success: false, message: "Unexpected file field" });
        }
        return res.status(400).json({ success: false, message: `Upload error: ${error.message}` });
    }

    // Handle custom file filter errors
    if (error.message && error.message.includes('Invalid file type')) {
        return res.status(400).json({ success: false, message: error.message });
    }

    next(error);
};

// Send Email
router.post('/send-mail', upload.fields([{ name: 'attachments', maxCount: 10 }]), handleMulterError, async (req, res) => {
    const { email, password, to, subject, body, html } = req.body;
    const attachments = req.files?.attachments || [];
    let emailSent = false;

    try {
        // Validate required fields
        if (!to || !subject || (!body && !html)) {
            cleanupUploadedFiles(attachments);
            return res.status(400).json({ success: false, message: "Missing required fields: to, subject, and body/html" });
        }

        // Always send HTML content - if html is provided use it, otherwise convert body to HTML
        const htmlContent = html || `<div>${body}</div>`;

        // Process attachments for nodemailer
        let processedAttachments = [];
        if (attachments && Array.isArray(attachments)) {
            processedAttachments = attachments.map(attachment => ({
                path: attachment.path,
                filename: attachment.originalname,
                contentType: attachment.mimetype
            }));
        }

        await sendEmail(
            { user: email, pass: password },
            { from: email, to, subject, html: htmlContent, text: body, attachments: processedAttachments }
        );
        emailSent = true;
        res.status(200).json({ success: true, message: "Email Sent Successfully" });

        // Schedule cleanup after successful send
        setTimeout(() => cleanupUploadedFiles(attachments), 1000); // Delay cleanup to ensure email is sent
    } catch (error) {
        console.error('Email sending error:', error);
        cleanupUploadedFiles(attachments);
        res.status(500).json({ success: false, message: error.message || "Failed to send email" });
    } finally {
        // Only try to save sent email if it was actually sent
        if (emailSent) {
            try {
                const htmlContent = html || `<div>${body}</div>`;

                // Process attachments for saving sent email
                let processedAttachments = [];
                if (attachments && Array.isArray(attachments)) {
                    processedAttachments = attachments.map(attachment => ({
                        filename: attachment.filename,
                        size: attachment.size,
                        mimetype: attachment.mimetype,
                        url: attachment.url
                    }));
                }

                await saveSentEmail(
                    email, // Assuming authDetails has the email/user
                    password, // Assuming authDetails has the password
                    { from: email, to, subject, html: htmlContent, text: body, attachments: processedAttachments }
                );
            } catch (err) {
                // We log the error but don't throw it, because the email WAS actually sent to the recipient.
                // We don't want to tell the frontend "Failed" just because the copy wasn't saved.
                console.error('Error saving sent email copy:', err);
            }
        }
    }
});

// Reply to Email
router.post('/reply-mail', async (req, res) => {
    const { email, password, to, subject, body, html, originalMessageId } = req.body;
    try {
        // Always send HTML content - if html is provided use it, otherwise convert body to HTML
        const htmlContent = html || `<div>${body}</div>`;

        await replyEmail(
            { user: email, pass: password },
            { from: email, to, subject, html: htmlContent, text: body, inReplyTo: originalMessageId }
        );
        res.status(200).json({ success: true, message: "Reply Sent Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Forward Email
router.post('/forward-mail', async (req, res) => {
    const { email, password, to, subject, body, html } = req.body;
    try {
        // Always send HTML content - if html is provided use it, otherwise convert body to HTML
        const htmlContent = html || `<div>${body}</div>`;

        await forwardEmail(
            { user: email, pass: password },
            { from: email, to, subject, html: htmlContent, text: body }
        );
        res.status(200).json({ success: true, message: "Email Forwarded Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark Email as Read/Unread
router.post('/mark-read', async (req, res) => {
    const { email, password, messageId, read } = req.body;
    try {
        await markAsRead(email, password, messageId, read);
        res.status(200).json({ success: true, message: `Email marked as ${read ? 'read' : 'unread'}` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to mark email" });
    }
});

//toggle-star
router.post('/toggle-star', async (req, res) => {
    const { email, password, messageId, starred } = req.body;
    try {
        await toggleStarred(email, password, messageId, starred);
        res.status(200).json({ success: true, message: `Email marked as ${starred ? 'starred' : 'unstarred'}` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to mark email" });
    }
});

//toggle-important
router.post('/toggle-important', async (req, res) => {
    const { email, password, messageId, important } = req.body;
    try {
        await toggleImportant(email, password, messageId, important);
        res.status(200).json({ success: true, message: `Email marked as ${important ? 'important' : 'unimportant'}` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to mark email" });
    }
});

//save-draft
router.post('/save-draft', async (req, res) => {
    try {
        // The error indicates the nested `composeData` object is not being received.
        // This is likely because the frontend is sending a flat object, similar to other endpoints.
        // We'll destructure the properties directly from the body for consistency.
        const { email, password, to, subject, body, html } = req.body;

        // Only save draft if there's actual content
        if (!to && !subject && !body && !html) {
            return res.json({ success: true, message: 'No content to save' });
        }

        await saveDraft(email, password, { to, subject, body, html });
        res.json({ success: true, message: 'Draft saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to save draft' });
        console.error('Error saving draft:', error);
    }
});


// Delete Email
router.post('/delete-mail', async (req, res) => {
    const { email, password, messageId, folder } = req.body;
    try {
        await deleteEmail(email, password, messageId, folder || 'INBOX');
        res.status(200).json({ success: true, message: "Email deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete email" });
    }
});

// Move Email to Folder
router.post('/move-mail', async (req, res) => {
    const { email, password, messageId, destinationFolder, sourceFolder } = req.body;
    try {
        await moveEmail(email, password, messageId, destinationFolder, sourceFolder);
        res.status(200).json({ success: true, message: "Email moved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to move email" });
    }
});

// Test IMAP Connection
router.post('/test-imap', async (req, res) => {
    const { email, password } = req.body;

    console.log('Testing IMAP connection for:', email ? '***@***' : 'missing');

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
    }

    try {
        // Import getClient directly
        const { ImapFlow } = await import('imapflow');
        const dotenv = await import('dotenv');
        dotenv.config();

        const client = new ImapFlow({
            host: process.env.IMAP_HOST || 'imap.cybershoora.com',
            port: parseInt(process.env.IMAP_PORT) || 993,
            secure: process.env.IMAP_SECURE === 'true',
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user: email,
                pass: password,
            },
            logger: true
        });

        console.log('Attempting to connect...');
        await client.connect();
        console.log('Connection successful!');

        // Test basic mailbox access
        let lock = await client.getMailboxLock('INBOX');
        console.log('Mailbox lock acquired');

        const status = await client.status('INBOX', { messages: true });
        console.log('Mailbox status:', status);

        lock.release();
        await client.logout();
        console.log('Connection closed successfully');

        res.json({
            success: true,
            message: "IMAP connection successful",
            mailboxInfo: {
                totalMessages: status.messages,
                mailbox: 'INBOX'
            }
        });
    } catch (error) {
        console.error('IMAP connection test failed:', error);
        res.status(500).json({
            success: false,
            message: "IMAP connection failed",
            error: error.message
        });
    }
});

// Download Attachment
router.post('/download-attachment', async (req, res) => {
    const { email, password, uid, folder, index, filename } = req.body;

    console.log('Download request:', { email: email ? '***@***' : 'missing', password: password ? '***' : 'missing', uid, folder, index, filename });

    if (!email || !password) {
        console.log('Missing credentials error');
        return res.status(400).json({ success: false, message: "User credentials required" });
    }

    try {
        console.log('Attempting to download attachment...');
        // Ensure folder is properly formatted for IMAP
        const imapFolder = (folder === 'inbox' ? 'INBOX' : folder?.toUpperCase()) || 'INBOX';
        console.log('Using folder:', imapFolder);

        const attachment = await downloadAttachment(email, password, uid, imapFolder, parseInt(index));

        console.log('Attachment found:', { filename: attachment.filename, size: attachment.size, contentType: attachment.contentType });

        // Set appropriate headers
        res.setHeader('Content-Type', attachment.contentType);
        res.setHeader('Content-Disposition', `${attachment.contentDisposition}; filename="${attachment.filename}"`);
        res.setHeader('Content-Length', attachment.size);

        // Send the attachment content
        res.send(attachment.content);
    } catch (error) {
        console.error('Download attachment error:', error);
        res.status(500).json({ success: false, message: "Failed to download attachment", error: error.message });
    }
});

export default router;
