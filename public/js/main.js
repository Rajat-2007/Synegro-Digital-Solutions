'use strict';

const menuToggle = document.getElementById('menuToggle');
const primaryNav = document.getElementById('primaryNav');

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });
  primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    primaryNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }));
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

document.querySelectorAll('[data-service], [data-package]').forEach(link => {
  link.addEventListener('click', () => {
    const selected = link.dataset.service || link.dataset.package;
    const select = document.querySelector('#leadForm select[name="service"]');
    if (select) {
      const match = Array.from(select.options).find(option => option.textContent.toLowerCase() === selected.toLowerCase());
      if (match) select.value = match.value;
      else if (link.dataset.package) select.value = 'Other / Need advice';
    }
  });
});

const demoOrder = document.getElementById('demoOrder');
if (demoOrder) {
  demoOrder.addEventListener('click', () => {
    const caption = document.getElementById('demoCaption');
    caption.textContent = 'This is a visual sample only — ask us to build QR ordering for your business.';
    demoOrder.innerHTML = 'Sample viewed <span>✓</span>';
  });
}

const leadForm = document.getElementById('leadForm');
const formStatus = document.getElementById('formStatus');
const emailConfig = window.SYNEGRO_EMAILJS_CONFIG || {};
const hasEmailConfig = Boolean(emailConfig.publicKey && emailConfig.serviceId && emailConfig.templateId) &&
  ![emailConfig.publicKey, emailConfig.serviceId, emailConfig.templateId].some(value =>
    /^(YOUR_|PASTE_|REPLACE_)/i.test(String(value).trim())
  );
const emailSdkAvailable = typeof window.emailjs !== 'undefined' && typeof window.emailjs.send === 'function';
const emailJsConfigured = hasEmailConfig && emailSdkAvailable;

// EmailJS provides a client-side throttle as a secondary anti-abuse control.
if (emailJsConfigured) {
  window.emailjs.init({
    publicKey: emailConfig.publicKey,
    limitRate: { id: 'synegro-enquiry-form', throttle: 10000 }
  });
}

if (leadForm && formStatus) {
  let isSubmitting = false;
  let lastSubmitAt = 0;

  leadForm.addEventListener('submit', async event => {
    event.preventDefault();
    formStatus.className = 'form-status';
    formStatus.textContent = '';
    if (isSubmitting || !leadForm.reportValidity()) return;

    const submitButton = leadForm.querySelector('button[type="submit"]');
    const submitLabel = submitButton.querySelector('.submit-label');
    const originalLabel = submitLabel.textContent;

    // Bots that fill the visually hidden honeypot are silently ignored.
    const honeypot = leadForm.elements.namedItem('website');
    if (honeypot && honeypot.value.trim()) {
      leadForm.reset();
      formStatus.textContent = 'Thanks! Your enquiry has been received.';
      formStatus.classList.add('success');
      return;
    }

    if (!emailJsConfigured) {
      formStatus.textContent = !hasEmailConfig
        ? 'Email setup is incomplete. Add your EmailJS Public Key in public/js/email-config.js and save the file.'
        : 'The EmailJS library did not load. Check your internet connection, then refresh the page.';
      formStatus.classList.add('error');
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAt < 10000) {
      formStatus.textContent = 'Please wait a few seconds before sending another enquiry.';
      formStatus.classList.add('error');
      return;
    }

    const formData = new FormData(leadForm);
    const templateParams = {
      name: String(formData.get('name') || '').trim().slice(0, 80),
      age: String(formData.get('age') || '').trim().slice(0, 3),
      phone: String(formData.get('phone') || '').trim().slice(0, 25),
      email: String(formData.get('email') || '').trim().slice(0, 254),
      service: String(formData.get('service') || 'Not specified').trim().slice(0, 100),
      message: String(formData.get('message') || '').trim().slice(0, 1000)
    };

    isSubmitting = true;
    submitButton.disabled = true;
    submitLabel.textContent = 'Sending…';

    try {
      await window.emailjs.send(emailConfig.serviceId, emailConfig.templateId, templateParams, {
        publicKey: emailConfig.publicKey
      });
      lastSubmitAt = Date.now();
      formStatus.textContent = 'Thanks! Your enquiry has been sent. We will get back to you soon.';
      formStatus.classList.add('success');
      leadForm.reset();
    } catch (error) {
      // Keep provider diagnostics out of the UI; inspect browser DevTools if setup fails.
      console.error('EmailJS enquiry send failed:', error && error.status ? error.status : 'request failed');
      formStatus.textContent = 'We could not send your enquiry. Please check the EmailJS Service ID, Template ID, Public Key and template settings, or contact us directly by WhatsApp or email.';
      formStatus.classList.add('error');
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitLabel.textContent = originalLabel;
    }
  });
}
