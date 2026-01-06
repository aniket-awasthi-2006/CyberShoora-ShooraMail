import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fetchInbox, fetchEmailsByFolder, markAsRead, deleteEmail, moveEmail, toggleStarred, toggleImportant, saveDraft, saveSentEmail } from '../services/imapService.js';
import { sendEmail, replyEmail, forwardEmail } from '../services/smtpService.js';

const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'text/csv',
            'video/mp4', 'video/avi', 'video/mov',
            'audio/mp3', 'audio/wav', 'audio/ogg'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, documents, and media files are allowed.'), false);
        }
    }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File size too large. Maximum size is 10MB.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ success: false, message: 'Too many files. Maximum is 5 files.' });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ success: false, message: 'Unexpected file field.' });
        }
    }
    next(error);
};

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

// Upload Attachments
router.post('/upload-attachments', upload.array('files', 5), async (req, res) => {
    try {
        console.log('Upload request received:', req.files);
        console.log('Request body:', req.body);
        
        if (!req.files || req.files.length === 0) {
            console.log('No files in request');
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const uploadedFiles = req.files.map(file => {
            console.log('Processing file:', file.originalname, file.mimetype, file.size);
            return {
                filename: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
                url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${file.filename}`
            };
        });

        console.log('Files processed successfully:', uploadedFiles.length);
        
        res.status(200).json({ 
            success: true, 
            message: 'Files uploaded successfully',
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to upload files' });
    }
});

// Apply error handling middleware after the route
router.use(handleMulterError);

// Move Email to Folder
router.post('/move-mail', async (req, res) => {
    const { email, password, messageId, destinationFolder } = req.body;
    try {
        await moveEmail(email, password, messageId, destinationFolder);
        res.status(200).json({ success: true, message: "Email moved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to move email" });
    }
});

export default router;
