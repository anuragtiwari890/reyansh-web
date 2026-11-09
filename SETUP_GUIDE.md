# Reyansh Vedanta — Email Backend Setup Guide

This project uses a serverless Vercel Function (`api/enquiry.js`) with **Nodemailer + Gmail SMTP** to handle form submissions and deliver leads directly to `anuragtiwari890@gmail.com`.

---

## 📁 Architecture Overview

| File | Purpose |
|------|---------|
| [`api/enquiry.js`](./api/enquiry.js) | Vercel Serverless Function — validates form inputs & sends formatted HTML email |
| [`vercel.json`](./vercel.json) | Vercel configuration (specifies function memory & execution timeout) |
| [`.env`](./.env) | Local environment variables (**never commit this file**) |
| [`.env.example`](./.env.example) | Template reference for required environment variables |
| [`.gitignore`](./.gitignore) | Excludes `.env`, `node_modules/`, and `.vercel/` from git |
| [`vedanta.html`](./vedanta.html) | Frontend landing page wired to `POST /api/enquiry` |

---

## 🔒 Form Behavior & Content Gating

| Form | Behavior |
|------|----------|
| **Enquire / Brochure Modal** | Submits lead → displays success screen with direct brochure download |
| **Floor Plan Gate** | Submits lead → **only reveals & unlocks floor plan after API confirms success** |
| **Inquiry Section Form** | Submits lead → shows inline confirmation message with lead details |

> **Note:** If backend validation fails or email sending fails, the floor plan remains locked and an error message is displayed to the user.

---

## 🔑 Step 1: Generate Gmail App Password

Gmail SMTP requires an **App Password** (your personal Gmail account password will not work):

1. Log in to **[Google Account Security](https://myaccount.google.com/security)** with `anuragtiwari890@gmail.com`.
2. Ensure **2-Step Verification** is turned **ON**.
3. Open **[App Passwords](https://myaccount.google.com/apppasswords)**.
4. Set an App name (e.g., `Reyansh Website`) and click **Create**.
5. Copy the generated **16-character code** (e.g., `abcd efgh ijkl mnop`).

---

## ⚙️ Step 2: Configure Local Environment

Edit the [`.env`](./.env) file in the root directory:

```env
GMAIL_USER=anuragtiwari890@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```
*(Paste the 16 characters without spaces).*

---

## 🧪 Step 3: Test Locally

Run the local dev server using the Vercel CLI (this executes serverless functions locally exactly as they run on Vercel):

```bash
# Run with npx (no global installation needed)
npx vercel dev
```

Or install Vercel CLI globally first:

```bash
npm install -g vercel
vercel dev
```

1. Open `http://localhost:3000/vedanta.html`.
2. Fill out any form (Enquire modal, floor plan gate, or bottom contact section).
3. Check `anuragtiwari890@gmail.com` inbox for the lead email.
4. Verify that the floor plan unlocks only after submission succeeds.

---

## 🚀 Step 4: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended with Git)

1. Push your code to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), open your project.
3. Go to **Settings** → **Environment Variables**.
4. Add the following two variables for **Production**, **Preview**, and **Development**:
   - `GMAIL_USER` = `anuragtiwari890@gmail.com`
   - `GMAIL_APP_PASSWORD` = `<your-16-character-app-password>`
5. Redeploy the project (or push a new commit) for the environment variables to take effect.

### Option B: Via Vercel CLI

```bash
# Deploy to production
npx vercel --prod
```

When prompted, set environment variables using:
```bash
npx vercel env add GMAIL_USER production
npx vercel env add GMAIL_APP_PASSWORD production
```

---

## 🛡️ Backend Validation Rules

The backend strictly enforces the following validation rules in `api/enquiry.js`:

- **Phone (Required):** Must be a valid 10-digit Indian mobile number starting with `6`, `7`, `8`, or `9` (e.g., `9876543210`).
- **Name (Required):** 2 to 60 characters; allows alphabets, spaces, and periods.
- **Email (Optional):** If supplied, must conform to standard email syntax.
- **Source (Required):** Must be one of `enquire`, `brochure`, `floor-plan`, or `inquiry`.
- **Rate Limit / Limits:** Gmail SMTP allows up to **500 emails/day** for free accounts, which is well within capacity for a real estate landing page.

---

## 📩 Email Notification Format

When a user submits a form, an HTML email is sent with:
- **Lead Source Badge** (`Enquiry Modal`, `Floor Plan Request`, or `Inquiry Form`)
- **Prospect Details:** Name, Phone Number, Email, Interested Configuration (2 BHK / 3 BHK / Commercial)
- **One-Click Action Buttons:**
  - 📞 **Call Now** (`tel:`)
  - 💬 **Chat on WhatsApp** (`https://wa.me/91...`)
- **Timestamp:** Formatted in Indian Standard Time (IST)

---

## ❓ Troubleshooting

| Issue | Cause & Solution |
|-------|------------------|
| `500 Server Error: Missing Gmail credentials` | The environment variables `GMAIL_USER` or `GMAIL_APP_PASSWORD` are not configured in `.env` (locally) or Vercel Settings (production). |
| `535-5.7.8 Username and Password not accepted` | The 16-character App Password is incorrect or 2-Step Verification was disabled. Re-generate a new app password. |
| `Invalid phone number` (400 response) | Must be exactly 10 digits starting with 6, 7, 8, or 9. Country codes (+91) are automatically cleaned up if entered. |
| Floor plan does not unlock | The frontend will only unlock upon receiving `{ success: true }` from `/api/enquiry`. Inspect the browser console (F12) for detailed error messages. |
