import express from 'express';
import { fetchInbox, fetchEmailsByFolder, markAsRead, deleteEmail, moveEmail, toggleStarred, toggleImportant, saveDraft, saveSentEmail, downloadAttachment } from '../services/imapService.js';
import { sendEmail, replyEmail, forwardEmail } from '../services/smtpService.js';

const router = express.Router();

// Login and Fetch Initial Emails
router.post('/login-fetch', async (req, res) => {
    const { email, password } = req.body;

    try {
        const emails = await fetchInbox(email, password);

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
    const { email, password } = req.body;

    try {
        const emails = await fetchInbox(email, password);
        res.status(200).json({ success: true, data: emails });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch inbox" });
    }
});

// Fetch Emails by Folder
router.post('/folder-fetch', async (req, res) => {
    const { email, password, folder } = req.body;

    try {
        const emails = await fetchEmailsByFolder(email, password, folder);
        res.status(200).json({ success: true, data: emails });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch folder emails" });
    }
});

// Send Email
router.post('/send-mail', async (req, res) => {
    const { email, password, to, subject, body, html, attachments } = req.body;
    try {
        // Always send HTML content - if html is provided use it, otherwise convert body to HTML
        const htmlContent = html || `<div>${body}</div>`;
        
        // Process attachments for nodemailer
        let processedAttachments = [];
        if (attachments && Array.isArray(attachments)) {
            processedAttachments = attachments.map(attachment => {
                if (attachment.path) {
                    // File was uploaded to server
                    return {
                        path: attachment.path,
                        filename: attachment.filename,
                        contentType: attachment.mimetype
                    };
                } else if (attachment.content) {
                    // Base64 encoded content
                    return {
                        content: attachment.content,
                        filename: attachment.filename,
                        contentType: attachment.mimetype,
                        encoding: 'base64'
                    };
                } else if (attachment.url) {
                    // URL-based attachment
                    return {
                        path: attachment.url.startsWith('http') ? attachment.url : path.join(process.cwd(), attachment.url),
                        filename: attachment.filename,
                        contentType: attachment.mimetype
                    };
                }
                return {
                    path: attachment.path || attachment.url,
                    filename: attachment.filename,
                    contentType: attachment.mimetype
                };
            });
        }
        
        await sendEmail(
            { user: email, pass: password },
            { from: email, to, subject, html: htmlContent, text: body, attachments: processedAttachments }
        );
        res.status(200).json({ success: true, message: "Email Sent Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    } finally {
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
);

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
