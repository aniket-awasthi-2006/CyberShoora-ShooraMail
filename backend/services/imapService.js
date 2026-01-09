import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Helper to create a new client instance
// Note: ImapFlow requires a new instance/connection for distinct lifecycles 
// or you must manage a persistent connection carefully. 
// Here we follow your pattern of "Connect -> Do Work -> Disconnect".
const getClient = (email, password) => {
    return new ImapFlow({
        host: process.env.IMAP_HOST || 'imap.cybershoora.com', // Use environment variable
        port: parseInt(process.env.IMAP_PORT) || 993,
        secure: process.env.IMAP_SECURE === 'true',
        tls: {
            rejectUnauthorized: false // Matches your previous config
        },
        auth: {
            user: email,
            pass: password,
        },
        logger: true // Enable detailed logging for debugging
    });
};

const parseEmail = async (message, source, folder = 'inbox') => {
    // 'source' is the raw email buffer provided by ImapFlow
    const mail = await simpleParser(source);

    const senderMatch = mail.from?.text.match(/"([^"]*)"/);
    const emailMatch = mail.from?.text.match(/<([^>]*)>/);
    const senderName = senderMatch ? senderMatch[1] : (mail.from?.text.split('<')[0].trim() || 'Unknown');
    const senderEmail = emailMatch ? emailMatch[1] : (mail.from?.text || '');

    const toemailMatch = mail.to?.text.match(/<([^>]*)>/);
    const toemailName = toemailMatch ? toemailMatch[1] : (mail.to?.text.split('@')[0].trim() || 'Unknown');
    const toemailEmail = toemailMatch ? toemailMatch[1] : (mail.to?.text || '');

    // Categorize email based on sender domain
    const categorizeEmail = (email) => {
        if (!email) return 'personal';

        const domain = email.toLowerCase().split('@')[1];
        if (!domain) return 'personal';

        // Work domains (common business domains)
        const workDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'protonmail.com', 'icloud.com', 'me.com', 'mac.com'];
        // Promotional domains (common marketing/sender domains)
        const promoDomains = ['newsletter', 'mailchimp', 'constantcontact', 'sendgrid', 'mailgun', 'amazon', 'ebay', 'facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'netflix', 'spotify', 'uber', 'lyft', 'airbnb', 'booking', 'expedia', 'tripadvisor', 'paypal', 'stripe', 'shopify', 'woocommerce', 'wordpress', 'blogger', 'medium', 'substack', 'patreon', 'kickstarter', 'indiegogo', 'gofundme', 'eventbrite', 'meetup', 'slack', 'discord', 'zoom', 'teams', 'webex', 'gotomeeting', 'cisco', 'juniper', 'aruba', 'huawei', 'dell', 'hp', 'lenovo', 'apple', 'microsoft', 'google', 'amazon', 'facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'netflix', 'spotify', 'uber', 'lyft', 'airbnb', 'booking', 'expedia', 'tripadvisor', 'paypal', 'stripe', 'shopify', 'woocommerce', 'wordpress', 'blogger', 'medium', 'substack', 'patreon', 'kickstarter', 'indiegogo', 'gofundme', 'eventbrite', 'meetup', 'slack', 'discord', 'zoom', 'teams', 'webex', 'gotomeeting'];

        // Check if domain contains promotional keywords
        const hasPromoKeyword = promoDomains.some(keyword => domain.includes(keyword));

        // Check if it's a work domain (common personal email providers)
        const isWorkDomain = workDomains.some(workDomain => domain === workDomain);

        if (hasPromoKeyword) {
            return 'promotions';
        } else if (isWorkDomain) {
            return 'work';
        } else {
            // For other domains, check if they look like business domains
            // Business domains typically have 2-3 parts and no common personal suffixes
            const parts = domain.split('.');
            if (parts.length >= 2 && parts.length <= 3 && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail')) {
                return 'work';
            }
            return 'personal';
        }
    };

    const category = categorizeEmail(senderEmail);

    // Process attachments without saving to disk - create direct download links
    const processedAttachments = [];
    if (mail.attachments && mail.attachments.length > 0) {
        for (let i = 0; i < mail.attachments.length; i++) {
            const attachment = mail.attachments[i];
            try {
                // Create direct download link using IMAP message data
                const imapFolder = folder === 'inbox' ? 'INBOX' : folder.toUpperCase();
                const downloadUrl = `/api/download-attachment?uid=${message.uid}&folder=${imapFolder}&index=${i}&filename=${encodeURIComponent(attachment.filename || `attachment-${i}`)}`;

                processedAttachments.push({
                    filename: attachment.filename || `attachment-${i}`,
                    originalFilename: attachment.filename,
                    size: attachment.size || (attachment.content ? attachment.content.length : 0),
                    contentType: attachment.contentType,
                    url: downloadUrl,
                    contentId: attachment.contentId,
                    contentDisposition: attachment.contentDisposition,
                    // Store content as base64 for inline preview if needed
                    content: attachment.content && attachment.content.length < 1024 * 1024 ? attachment.content.toString('base64') : null,
                    isInline: attachment.contentDisposition === 'inline'
                });
            } catch (error) {
                console.error('Error processing attachment:', error);
            }
        }
    }

    return {
        id: message.uid, // ImapFlow provides UID directly on the message object
        sender: senderName,
        senderEmail: senderEmail,
        to: toemailName,
        toEmail: toemailEmail,
        subject: mail.subject,
        preview: mail.textAsHtml ? mail.textAsHtml.slice(0, 100) : (mail.text ? mail.text.slice(0, 100) : ''),
        body: mail.html || mail.textAsHtml || mail.text,
        date: mail.date || message.internalDate,
        unread: !message.flags.has('\\Seen'),
        flagged: message.flags.has('\\Flagged'),
        categoryColor: category === 'work' ? '#34A853' : category === 'personal' ? '#FFB800' : '#2D62ED',
        category: category,
        attachments: processedAttachments,
        avatar: '',
        folder: folder,
        important: message.flags.has('Important'),
    };
};

// Save sent email to "Sent" folder
const saveSentEmail = async (email, password, mailOptions) => {
    const client = getClient(email, password);

    // 1. Compile the email object into a raw buffer (RFC822 format)
    const composer = new MailComposer(mailOptions);
    const messageBuffer = await composer.compile().build();

    await client.connect();

    // 2. Define target folder (Stackmail usually uses "Sent")
    const sentFolder = 'Sent';

    let lock = await client.getMailboxLock(sentFolder);
    try {
        // 3. Append the message with the \Seen flag so it appears read
        await client.append(sentFolder, messageBuffer, ['\\Seen']);
    } catch (err) {
        // Optional: Retry with "Sent Items" if "Sent" fails
    } finally {
        lock.release();
    }

    await client.logout();
};

//fetch inbox
const fetchInbox = async (email, password, page = 1, limit = 10) => {
    const client = getClient(email, password);
    const parsedMails = [];
    let status;

    await client.connect();

    // We must lock the mailbox to perform operations
    let lock = await client.getMailboxLock('INBOX');
    try {
        // Force refresh mailbox by selecting it explicitly to get latest status
        await client.mailboxOpen('INBOX', { readOnly: true });
        await client.noop();

        // 1. Get status to find out how many messages are there
        status = await client.status('INBOX', { messages: true });
        const total = status.messages;

        // 2. Calculate pagination using UIDs for reliability
        const offset = (page - 1) * limit;
        const start = Math.max(1, total - offset - limit + 1);
        const end = Math.min(total, total - offset);
        const range = total > 0 ? `${start}:${end}` : '';

        if (total > 0 && start <= end) {
            // 3. Fetch specific range using sequence numbers but get UID info
            for await (let message of client.fetch(range, { envelope: true, source: true, uid: true, flags: true, internalDate: true })) {
                const parsed = await parseEmail(message, message.source);
                parsedMails.push(parsed);
            }
        }
    } finally {
        // Always release lock
        lock.release();
    }

    await client.logout();

    const emailUser = email.split('@')[0];
    const userName = emailUser.split('.').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');

    // Reverse to show newest first
    return {
        userName,
        mails: parsedMails.reverse(),
        pagination: {
            page,
            limit,
            total: status.messages,
            hasNext: page * limit < status.messages,
            hasPrev: page > 1
        }
    };
};

const fetchEmailsByFolder = async (email, password, folder, page = 1, limit = 20) => {
    const client = getClient(email, password);
    const parsedMails = [];
    let status;

    await client.connect();

    let lock = await client.getMailboxLock(folder);
    try {
        status = await client.status(folder, { messages: true });
        const total = status.messages;

        // Calculate pagination
        const offset = (page - 1) * limit;
        const start = Math.max(1, total - offset - limit + 1);
        const end = Math.min(total, total - offset);
        const range = total > 0 ? `${start}:${end}` : '';

        if (total > 0 && start <= end) {
            for await (let message of client.fetch(range, { envelope: true, source: true, uid: true, flags: true, internalDate: true })) {
                const parsed = await parseEmail(message, message.source, folder);
                parsedMails.push(parsed);
            }
        }
    } catch (err) {
    } finally {
        lock.release();
    }

    await client.logout();

    return {
        folder,
        mails: parsedMails.reverse(),
        pagination: {
            page,
            limit,
            total: status.messages,
            hasNext: page * limit < status.messages,
            hasPrev: page > 1
        }
    };
};

const markAsRead = async (email, password, messageId, read) => {
    const client = getClient(email, password);
    await client.connect();

    let lock = await client.getMailboxLock('INBOX');
    try {
        // 'uid: true' is crucial because we are passing a UID, not a sequence number
        if (read) {
            await client.messageFlagsAdd(messageId, ['\\Seen'], { uid: true });
        } else {
            await client.messageFlagsRemove(messageId, ['\\Seen'], { uid: true });
        }
    } finally {
        lock.release();
    }

    await client.logout();
};

const saveDraft = async (email, password, draftData) => {
    const client = getClient(email, password);

    // Defensively ensure draftData is an object to prevent errors if it's null or undefined.
    const data = draftData || {};

    // 1. Map your frontend data to Nodemailer structure
    const mailOptions = {
        from: email,
        to: data.to,
        subject: data.subject,
        text: data.body, // or data.text depending on your frontend
        html: data.html || (data.body ? `<p>${data.body}</p>` : '') // A more robust fallback to avoid "<p>undefined</p>"
    };

    // 2. Compile into raw email buffer
    const composer = new MailComposer(mailOptions);
    const messageBuffer = await composer.compile().build();

    await client.connect();

    // 3. Determine Drafts Folder
    // Common names: 'Drafts', 'Draft', '[Gmail]/Drafts'
    // You can also look it up via client.list() if needed
    const draftFolder = 'Drafts';

    let lock = await client.getMailboxLock(draftFolder);
    try {
        // 4. Append to Drafts folder
        // We add \Seen (so it doesn't look like a new unread mail)
        // We add \Draft (standard IMAP flag for drafts)
        await client.append(draftFolder, messageBuffer, ['\\Seen', '\\Draft']);
    } catch (err) {
        throw err; // Re-throw so your API knows it failed
    } finally {
        lock.release();
    }

    await client.logout();
    return { success: true };
};

// Don't forget to export it!
const toggleStarred = async (email, password, messageId, starred) => {
    const client = getClient(email, password);
    await client.connect();

    let lock = await client.getMailboxLock('INBOX');
    try {
        if (starred) {
            await client.messageFlagsAdd(messageId, ['\\Flagged'], { uid: true });
        } else {
            await client.messageFlagsRemove(messageId, ['\\Flagged'], { uid: true });
        }
    } finally {
        lock.release();
    }

    await client.logout();
};

const toggleImportant = async (email, password, messageId, important) => {
    const client = getClient(email, password);
    await client.connect();

    let lock = await client.getMailboxLock('INBOX');
    try {
        if (important) {
            await client.messageFlagsAdd(messageId, ['Important'], { uid: true });
        } else {
            await client.messageFlagsRemove(messageId, ['Important'], { uid: true });
        }
    } finally {
        lock.release();
    }

    await client.logout();
};
const deleteEmail = async (email, password, messageId, folder = 'INBOX') => {
    const client = getClient(email, password);
    await client.connect();

    let lock = await client.getMailboxLock(folder);
    try {
        // Mark as deleted
        await client.messageFlagsAdd(messageId, ['\\Deleted'], { uid: true });
        // Expunge/Delete is handled by messageDelete in ImapFlow or implies expunge depending on server
        // Using messageDelete is the safest explicit way to remove by UID
        await client.messageDelete(messageId, { uid: true });

    } finally {
        lock.release();
    }

    await client.logout();
};

const moveEmail = async (email, password, messageId, destinationFolder, sourceFolder = 'INBOX') => {
    const client = getClient(email, password);
    await client.connect();

    let lock = await client.getMailboxLock(sourceFolder);
    try {
        // messageMove returns a result object, true usually implies success
        await client.messageMove(messageId, destinationFolder, { uid: true });
    } finally {
        lock.release();
    }

    await client.logout();
};

const downloadAttachment = async (email, password, uid, folder, index) => {
    console.log('downloadAttachment called with:', { email: email ? '***@***' : 'missing', password: password ? '***' : 'missing', uid, folder, index });

    try {
        // First, let's just test if we can connect and get basic mailbox info
        const client = getClient(email, password);

        console.log('Connecting to IMAP server...');
        await client.connect();
        console.log('IMAP connection successful');

        try {
            console.log('Getting mailbox lock for folder:', folder);
            let lock = await client.getMailboxLock(folder);
            console.log('Mailbox lock acquired');

            try {
                console.log('Fetching message with UID:', uid);
                // Fetch the specific message with full source
                const message = await client.fetchOne(uid, { source: true, uid: true });
                console.log('Message fetched, has source:', !!message.source);

                if (!message || !message.source) {
                    throw new Error('Message not found');
                }

                console.log('Parsing email message...');
                // Parse the email to get attachments
                const mail = await simpleParser(message.source);
                console.log('Email parsed, attachments count:', mail.attachments ? mail.attachments.length : 0);

                if (!mail.attachments || mail.attachments.length === 0) {
                    throw new Error('No attachments found in email');
                }

                if (index >= mail.attachments.length) {
                    throw new Error(`Attachment index ${index} out of range (total: ${mail.attachments.length})`);
                }

                const attachment = mail.attachments[index];
                console.log('Found attachment:', {
                    filename: attachment.filename,
                    size: attachment.size ? attachment.size.length : 0,
                    contentType: attachment.contentType
                });

                return {
                    filename: attachment.filename || `attachment-${index}`,
                    contentType: attachment.contentType || 'application/octet-stream',
                    content: attachment.content,
                    size: attachment.size || (attachment.content ? attachment.content.length : 0),
                    contentDisposition: attachment.contentDisposition || 'attachment'
                };
            } finally {
                lock.release();
                console.log('Mailbox lock released');
            }
        } finally {
            await client.logout();
            console.log('IMAP connection closed');
        }
    } catch (error) {
        console.error('Error in downloadAttachment:', error);
        // Return a more detailed error for debugging
        throw new Error(`DownloadAttachment failed: ${error.message}`);
    }
};

export { fetchInbox, fetchEmailsByFolder, markAsRead, deleteEmail, moveEmail, toggleStarred, toggleImportant, saveSentEmail, saveDraft, downloadAttachment };