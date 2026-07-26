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


    const phoneInput = quoteForm.querySelector('#phone');

    const validateUkPhone = () => {
      if (!phoneInput) return true;

      const raw = phoneInput.value.trim();

      if (!raw) {
        phoneInput.setCustomValidity('');
        return true;
      }

      // Permit common visual formatting, but validate the real underlying number.
      const normalized = raw.replace(/[\s()-]/g, '');
      const valid = /^0\d{10}$/.test(normalized) || /^\+44\d{10}$/.test(normalized);

      phoneInput.setCustomValidity(
        valid
          ? ''
          : 'Enter a valid UK phone number with 11 digits starting with 0, or +44 followed by 10 digits.'
      );

      return valid;
    };

    if (phoneInput) {
      phoneInput.addEventListener('input', validateUkPhone);
      phoneInput.addEventListener('blur', validateUkPhone);
    }

    quoteForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      validateUkPhone();

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


  // Click-to-enlarge lightbox for website photography.
  const lightboxCandidates = document.querySelectorAll('img');

  const excludedFromLightbox = (img) => {
    return Boolean(
      img.closest('.logo-link') ||
      img.classList.contains('footer-logo') ||
      img.closest('.site-footer') && img.alt === 'Valu Tints' ||
      img.src.includes('favicon') ||
      img.src.includes('apple-touch-icon') ||
      img.src.includes('valu-tints-logo')
    );
  };

  const lightboxImages = Array.from(lightboxCandidates).filter(
    (img) => !excludedFromLightbox(img)
  );

  if (lightboxImages.length) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Enlarged image');
    overlay.innerHTML = `
      <div class="lightbox-dialog">
        <button class="lightbox-close" type="button" aria-label="Close enlarged image">&times;</button>
        <div class="lightbox-image-wrap">
          <img class="lightbox-image" src="" alt="">
        </div>
        <div class="lightbox-caption" hidden></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const largeImage = overlay.querySelector('.lightbox-image');
    const caption = overlay.querySelector('.lightbox-caption');
    const closeButton = overlay.querySelector('.lightbox-close');

    let lastFocused = null;

    const closeLightbox = () => {
      overlay.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      largeImage.src = '';
      largeImage.alt = '';
      caption.textContent = '';
      caption.hidden = true;

      if (lastFocused) {
        lastFocused.focus({ preventScroll: true });
      }
    };

    const openLightbox = (img) => {
      lastFocused = img;

      // Use the original displayed asset directly, so the modal gets the
      // highest resolution version already shipped with the website.
      largeImage.src = img.currentSrc || img.src;
      largeImage.alt = img.alt || 'Valu Tints vehicle image';

      if (img.alt) {
        caption.textContent = img.alt;
        caption.hidden = false;
      } else {
        caption.hidden = true;
      }

      overlay.classList.add('open');
      document.body.classList.add('lightbox-open');
      closeButton.focus();
    };

    lightboxImages.forEach((img) => {
      img.classList.add('lightbox-enabled');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `${img.alt || 'Image'} — click to enlarge`);

      img.addEventListener('click', () => openLightbox(img));
      img.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(img);
        }
      });
    });

    closeButton.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

})();
