const nodemailer = require('nodemailer');

// ─── Validation Helpers ────────────────────────────────────────────────────────

function validateName(name) {
    if (!name || typeof name !== 'string') return 'Full name is required';
    const trimmed = name.trim();
    if (trimmed.length < 2) return 'Name must be at least 2 characters';
    if (trimmed.length > 60) return 'Name must be under 60 characters';
    if (!/^[a-zA-Z\s.']+$/.test(trimmed)) return 'Name should only contain letters, spaces, dots, or apostrophes';
    return null;
}

function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return 'Phone number is required';
    const trimmed = phone.trim().replace(/\D/g, '');
    if (trimmed.length !== 10) return 'Phone number must be exactly 10 digits';
    if (!/^[6-9]\d{9}$/.test(trimmed)) return 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9';
    return null;
}

function validateEmail(email) {
    if (!email || typeof email !== 'string' || !email.trim()) return null; // optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return 'Please enter a valid email address';
    return null;
}

function validateSource(source) {
    const allowed = ['enquire', 'brochure', 'floor-plan', 'inquiry'];
    if (!source || !allowed.includes(source)) return 'Invalid form source';
    return null;
}

// ─── Pretty Email Template ─────────────────────────────────────────────────────

function buildEmailHTML({ name, phone, email, unit, message, source }) {
    const sourceLabels = {
        'enquire': '📋 Enquire Now Modal',
        'brochure': '📄 Brochure Download Request',
        'floor-plan': '🏗️ Floor Plan Unlock',
        'inquiry': '📝 Inquiry Section Form',
    };

    const sourceLabel = sourceLabels[source] || source;
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFDF9; border: 1px solid #E5D6C0; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #A71D3A 0%, #85132A 100%); padding: 28px 32px; text-align: center;">
            <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
                🏠 New Lead — Reyansh Vedanta
            </h1>
            <p style="margin: 6px 0 0; color: #F5C76E; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                ${sourceLabel}
            </p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 32px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; width: 140px; vertical-align: top;">
                        Name
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #1a1a1a; font-size: 15px; font-weight: 600;">
                        ${escapeHtml(name)}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">
                        Phone
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #1a1a1a; font-size: 15px; font-weight: 600;">
                        <a href="tel:+91${phone.trim()}" style="color: #A71D3A; text-decoration: none;">
                            +91 ${phone.trim()}
                        </a>
                    </td>
                </tr>
                ${email && email.trim() ? `
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">
                        Email
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #1a1a1a; font-size: 15px;">
                        <a href="mailto:${escapeHtml(email.trim())}" style="color: #A71D3A; text-decoration: none;">
                            ${escapeHtml(email.trim())}
                        </a>
                    </td>
                </tr>` : ''}
                ${unit ? `
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">
                        Configuration
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #1a1a1a; font-size: 15px; font-weight: 600;">
                        ${escapeHtml(unit)}
                    </td>
                </tr>` : ''}
                ${message && message.trim() ? `
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">
                        Message
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #F0E6D6; color: #1a1a1a; font-size: 15px; line-height: 1.5;">
                        ${escapeHtml(message.trim())}
                    </td>
                </tr>` : ''}
            </table>

            <!-- Quick Action Buttons -->
            <div style="margin-top: 24px; text-align: center;">
                <a href="tel:+91${phone.trim()}"
                   style="display: inline-block; background: #A71D3A; color: #fff; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 8px; text-decoration: none; margin: 0 6px;">
                    📞 Call Now
                </a>
                <a href="https://wa.me/91${phone.trim()}?text=Hi%20${encodeURIComponent(name.trim())}%2C%20thank%20you%20for%20your%20interest%20in%20Reyansh%20Vedanta.%20How%20can%20we%20assist%20you%3F"
                   style="display: inline-block; background: #25D366; color: #fff; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 8px; text-decoration: none; margin: 0 6px;">
                    💬 WhatsApp
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #F4EDE0; padding: 16px 32px; text-align: center; border-top: 1px solid #E5D6C0;">
            <p style="margin: 0; color: #999; font-size: 11px;">
                Received on ${now} IST · Reyansh Vedanta, Daulat Nagar, Borivali East
            </p>
        </div>
    </div>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ─── Main Handler ───────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { name, phone, email, unit, message, source } = req.body || {};

        // ── Validate all fields ──
        const errors = {};

        const nameErr = validateName(name);
        if (nameErr) errors.name = nameErr;

        const phoneErr = validatePhone(phone);
        if (phoneErr) errors.phone = phoneErr;

        const emailErr = validateEmail(email);
        if (emailErr) errors.email = emailErr;

        const sourceErr = validateSource(source);
        if (sourceErr) errors.source = sourceErr;

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        // ── Send Email via Gmail SMTP ──
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const sourceSubjects = {
            'enquire': 'New Enquiry',
            'brochure': 'Brochure Request',
            'floor-plan': 'Floor Plan Request',
            'inquiry': 'New Inquiry',
        };

        await transporter.sendMail({
            from: `"Reyansh Vedanta Website" <${process.env.GMAIL_USER}>`,
            to: 'anuragtiwari890@gmail.com',
            subject: `${sourceSubjects[source] || 'New Lead'} — ${name.trim()} | Reyansh Vedanta`,
            html: buildEmailHTML({ name, phone, email, unit, message, source }),
        });

        return res.status(200).json({ success: true, message: 'Enquiry submitted successfully' });

    } catch (error) {
        console.error('Email send error:', error);
        return res.status(500).json({
            success: false,
            error: 'Something went wrong. Please try again or call us directly.',
        });
    }
};
