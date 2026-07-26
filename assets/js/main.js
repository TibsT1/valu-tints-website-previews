(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  const quoteForm = document.querySelector('#quote-form');

  if (quoteForm) {
    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const statusBox = quoteForm.querySelector('#form-status');
    const normalButtonText = submitButton ? submitButton.textContent : 'Send quote request';

    quoteForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      if (statusBox) {
        statusBox.hidden = false;
        statusBox.classList.remove('error');
        statusBox.textContent = 'Sending your quote request...';
      }

      try {
        const formData = new FormData(quoteForm);

        const response = await fetch('https://formsubmit.co/ajax/info@valutints.co.uk', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        let data = {};
        try {
          data = await response.json();
        } catch (_) {}

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'The form service could not send the message.');
        }

        if (statusBox) {
          statusBox.innerHTML =
            '<strong>Quote request sent.</strong> Thank you. Valu Tints has received your enquiry.';
        }

        quoteForm.reset();
      } catch (error) {
        console.error('Quote form error:', error);

        if (statusBox) {
          statusBox.classList.add('error');
          statusBox.innerHTML =
            '<strong>Could not send the form.</strong> Please call ' +
            '<a href="tel:+447921457060">07921 457060</a> or email ' +
            '<a href="mailto:info@valutints.co.uk">info@valutints.co.uk</a>.';
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = normalButtonText;
        }
      }
    });
  }
})();
