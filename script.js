/* ==========================================================================
   Von Kohler Drain Cleaning and Plumbing — site behaviour
   - mobile navigation
   - current year in the footer
   - LeadrVision form submission (fetch with JSON, graceful fallback)
   - "Thanks, your message was sent" confirmation for ?submitted=1
   ========================================================================== */
(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://vision.leadrai.com/api/forms/d625f11706e3cddfbeeddedd1b094df4';

  /* ---------------------------------------------------------------- nav */
  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });

    // Close the menu after choosing a link (mobile)
    nav.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a') : null;
      if (!link || window.innerWidth > 860) return;
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
    });

    // Reset state when resizing back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --------------------------------------------------------------- year */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --------------------------------------------------------------- page */
  /*
   * The _page field tells LeadrVision which page the visitor submitted from,
   * so they are returned to the right place. It is kept in sync with the URL
   * on load and included in the JSON fetch body as well.
   */
  function pageValue() {
    return window.location.href;
  }

  function setPageFields() {
    var fields = document.querySelectorAll('input[name="_page"]');
    for (var i = 0; i < fields.length; i++) {
      fields[i].value = pageValue();
    }
  }

  /* ------------------------------------------------------------ success */
  function showSuccess(form) {
    var success = document.getElementById('form-success');
    var error = document.getElementById('form-error');
    if (error) error.hidden = true;
    if (success) {
      success.hidden = false;
      if (form) {
        try {
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {
          success.scrollIntoView();
        }
      }
    }
    if (form) {
      form.reset();
      setPageFields();
    }
  }

  function showError() {
    var error = document.getElementById('form-error');
    if (error) error.hidden = false;
  }

  /*
   * A plain (no-JavaScript) submission returns to this page with
   * ?submitted=1 — show the same confirmation in that case.
   */
  function initReturnedSubmission() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('submitted') !== '1') return;

    showSuccess(null);

    // Keep the confirmation but tidy the URL for the visitor.
    if (window.history && window.history.replaceState) {
      params.delete('submitted');
      var query = params.toString();
      var clean = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
      window.history.replaceState({}, document.title, clean);
    }
  }

  /* --------------------------------------------------------------- form */
  function formToObject(form) {
    var data = new FormData(form);
    var payload = {};
    data.forEach(function (value, key) {
      payload[key] = typeof value === 'string' ? value : value.name;
    });
    payload._page = pageValue();
    return payload;
  }

  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var submitButton = document.getElementById('contact-submit');

    form.addEventListener('submit', function (event) {
      // Let the browser handle validation first.
      if (!form.checkValidity()) return;

      if (typeof window.fetch !== 'function') return; // native POST fallback

      event.preventDefault();

      var error = document.getElementById('form-error');
      if (error) error.hidden = true;

      var originalLabel = submitButton ? submitButton.textContent : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending\u2026';
      }

      var payload = formToObject(form);

      var restore = function () {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      };

      var nativeFallback = function () {
        restore();
        // Last resort: hand the submission back to the browser (plain POST).
        HTMLFormElement.prototype.submit.call(form);
      };

      // LeadrVision accepts a JSON body; _page is included so the visitor
      // returns to this page after the submission is processed.
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (response.ok) return response;
          // Retry with the exact form encoding a plain HTML post would send.
          var encoded = new URLSearchParams();
          Object.keys(payload).forEach(function (key) {
            encoded.append(key, payload[key]);
          });
          return fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
              Accept: 'application/json'
            },
            body: encoded.toString()
          }).then(function (retry) {
            if (!retry.ok) throw new Error('Form submission failed: ' + retry.status);
            return retry;
          });
        })
        .then(function () {
          restore();
          showSuccess(form);
        })
        .catch(function () {
          restore();
          var offline = !navigator.onLine;
          if (offline) {
            showError();
          } else {
            nativeFallback();
          }
        });
    });
  }

  /* --------------------------------------------------------------- boot */
  function init() {
    initNav();
    initYear();
    setPageFields();
    initReturnedSubmission();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
