import { restaurant } from '../data/restaurant.js';
import { qs } from '../utils/dom.js';
import {
  LIMITS,
  validateMessage,
  validateName,
  validateOptionalEmail,
  validateRequiredChoice,
} from '../utils/validate.js';
import { buildContactMessage, buildWhatsAppUrl } from '../utils/whatsapp.js';

/**
 * Contact form → WhatsApp hand-off.
 *
 * The site has no server, so the form does not "send" anything itself.
 * On a valid submit it opens WhatsApp with the message pre-written; the
 * visitor presses send there. The states shown are honest about this:
 *   loading  "Opening WhatsApp…"
 *   success  WhatsApp opened; remind them to press send
 *   error    WhatsApp couldn't open (blocked pop-up or number not set up)
 */
export function initContactForm() {
  const form = qs('[data-js="contact-form"]');
  if (!form) return;

  const submit = qs('[data-js="contact-submit"]', form);
  const submitLabel = qs('[data-js="contact-submit-label"]', form);
  const status = qs('[data-js="form-status"]', form);
  const counter = qs('[data-js="message-count"]', form);
  const topics = [...form.elements.topic.options].map((option) => option.value).filter(Boolean);

  const validators = {
    name: validateName,
    email: validateOptionalEmail,
    topic: (value) => validateRequiredChoice(value, topics),
    message: validateMessage,
  };

  const touched = new Set();

  function showFieldError(name) {
    const input = form.elements[name];
    const errorElement = qs(`[data-error-for="${name}"]`, form);
    const message = validators[name](input.value);
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.hidden = !message;
    }
    return !message;
  }

  for (const name of Object.keys(validators)) {
    const input = form.elements[name];
    input.addEventListener('blur', () => {
      if (input.value.trim() || touched.has(name)) {
        touched.add(name);
        showFieldError(name);
      }
    });
    input.addEventListener(name === 'topic' ? 'change' : 'input', () => {
      if (touched.has(name)) showFieldError(name);
      if (status.dataset.state === 'error' || status.dataset.state === 'success') clearStatus();
    });
  }

  const updateCounter = () => {
    const length = form.elements.message.value.length;
    counter.textContent = `${length} / ${LIMITS.messageMax}`;
  };
  form.elements.message.addEventListener('input', updateCounter);
  updateCounter();

  function setStatus(state, title, body, link) {
    status.dataset.state = state;
    const icon = { success: '#icon-check', error: '#icon-alert', loading: '#icon-chat' }[state];
    status.innerHTML = `<svg class="icon" aria-hidden="true"><use href="${icon}"/></svg><p class="form-status__title"></p><p class="form-status__body"></p>`;
    qs('.form-status__title', status).textContent = title;
    const bodyElement = qs('.form-status__body', status);
    bodyElement.textContent = body;
    if (link) {
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.textContent = link.text;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      bodyElement.append(' ', anchor);
    }
    status.hidden = false;
  }

  function clearStatus() {
    status.hidden = true;
    delete status.dataset.state;
    status.replaceChildren();
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submit.setAttribute('aria-busy', String(busy));
    submitLabel.textContent = busy ? 'Opening WhatsApp…' : 'Send on WhatsApp';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearStatus();

    let firstInvalid = null;
    for (const name of Object.keys(validators)) {
      touched.add(name);
      if (!showFieldError(name) && !firstInvalid) firstInvalid = form.elements[name];
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = {
      name: form.elements.name.value,
      email: form.elements.email.value,
      topic: form.elements.topic.value,
      message: form.elements.message.value,
    };
    const url = buildWhatsAppUrl(restaurant.whatsapp, buildContactMessage(data, restaurant.name));

    if (!url) {
      setStatus(
        'error',
        'WhatsApp isn’t set up yet.',
        'This preview has no WhatsApp number configured, so the message can’t be sent. Your text is still in the form.',
      );
      status.focus();
      return;
    }

    setBusy(true);
    setStatus('loading', 'Opening WhatsApp…', 'Your message is being prepared.');

    // window.open must run inside the submit handler, or pop-up blockers stop it.
    const whatsappWindow = window.open(url, '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;

    // Brief pause so the loading state is perceivable before the result.
    window.setTimeout(() => {
      setBusy(false);
      if (whatsappWindow) {
        setStatus(
          'success',
          'WhatsApp is open with your message.',
          'Press send in WhatsApp to reach us. We reply in the same chat.',
        );
        form.reset();
        touched.clear();
        updateCounter();
      } else {
        setStatus(
          'error',
          'WhatsApp didn’t open.',
          'Your browser may have blocked it. Your text is still in the form.',
          { href: url, text: 'Open WhatsApp with this message' },
        );
      }
      status.focus();
    }, 600);
  });
}
