# Synegro Digital Solutions — Version 2.0.0

A refreshed, responsive Synegro Digital Solutions website. The existing visual style and sections are preserved, the starter service now begins at **₹999**, and the EmailJS browser SDK URL is pinned to a stable v4 release.

## Run on Windows / VS Code

1. Extract this ZIP.
2. In VS Code, open the inner `Synegro-Digital-Solutions` folder (the one containing `package.json`).
3. Open **Terminal → New Terminal** and run:

   ```powershell
   npm install
   npm start
   ```

4. Open `http://localhost:3000`.

If port 3000 is already in use, stop the old terminal with `Ctrl+C`, then run `npm start` again.

## EmailJS setup (one value needs to be added)

Open `public/js/email-config.js`. Service ID and the latest Template ID are already filled in:

- Service ID: `service_5z62wte`
- Template ID: `template_hnu9luv`
- Public Key: copy it from https://dashboard.emailjs.com/admin/account and paste it into `publicKey`.

Example format (replace only the public-key text with your real Public Key):

```js
window.SYNEGRO_EMAILJS_CONFIG = Object.freeze({
  publicKey: "PASTE_YOUR_EMAILJS_PUBLIC_KEY_HERE",
  serviceId: "service_5z62wte",
  templateId: "template_hnu9luv"
});
```

Save with `Ctrl+S`, then hard-refresh the site using `Ctrl+Shift+R`. The public key must be the **EmailJS Public Key**, not a Private Key. Never put a Gmail password, App Password, or EmailJS Private Key in this file.

## EmailJS template settings

In the `template_hnu9luv` template, set **To Email** to `synegrodigisolutions@gmail.com`. Set **Reply To** to `{{email}}` if available. The template content should use these exact variables:

```text
New Website Enquiry — Synegro Digital Solutions

Name: {{name}}
Age: {{age}}
Phone: {{phone}}
Email: {{email}}
Service: {{service}}

Message:
{{message}}
```

The connected Gmail service and recipient are different settings. The Gmail connection may be used to send, while **To Email** determines where the enquiry is delivered. If EmailJS history says `Invalid grant`, reconnect the Gmail service in EmailJS.

For local testing, allow `http://localhost:3000` in EmailJS domain/origin settings if domain restrictions are enabled. When published, allow the exact HTTPS domain too. Check EmailJS Email History, Inbox and Spam for the first test.

## Included

- Responsive website with the existing visual design and sections
- Services, QR solutions, industries, pricing, workflow and contact sections
- Starter service from ₹999; higher packages and add-ons remain listed separately
- Contact form fields: name, age, phone, email, service and message
- WhatsApp, email and Instagram contact links
- Express server with Helmet security headers

## Useful commands

```powershell
npm run check
npm start
```
