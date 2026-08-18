(function (window, document) {
  "use strict";

  const API_BASE = "https://api.kreditor.pro";

  function openLead() {
    if (
      window.KreditorLeadModal &&
      typeof window.KreditorLeadModal.open === "function"
    ) {
      window.KreditorLeadModal.open();
      return;
    }

    const dialog = document.querySelector("dialog");

    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  }

  function getStatusNode(form) {
    let node = form.querySelector(".form-status");

    if (!node) {
      node = document.createElement("p");
      node.className = "form-status";
      node.setAttribute("aria-live", "polite");
      form.appendChild(node);
    }

    return node;
  }

  function setStatus(form, message, isError) {
    const node = getStatusNode(form);

    node.textContent = message || "";
    node.dataset.state = isError ? "error" : "success";
  }

  function getSubmitButton(form) {
    return form.querySelector(
      'button[type="submit"], input[type="submit"]'
    );
  }

  function setBusy(form, busy, label) {
    const button = getSubmitButton(form);

    if (!button) {
      return;
    }

    if (busy) {
      if (!button.dataset.originalText) {
        button.dataset.originalText =
          button.textContent || button.value || "";
      }

      button.disabled = true;

      if (button.tagName === "INPUT") {
        button.value = label;
      } else {
        button.textContent = label;
      }

      return;
    }

    button.disabled = false;

    const original = button.dataset.originalText;

    if (original) {
      if (button.tagName === "INPUT") {
        button.value = original;
      } else {
        button.textContent = original;
      }
    }
  }

  function ensureCodeField(form) {
    let wrapper = form.querySelector(
      "[data-lead-otp-field]"
    );

    if (wrapper) {
      return wrapper.querySelector(
        'input[name="verification_code"]'
      );
    }

    wrapper = document.createElement("label");
    wrapper.setAttribute("data-lead-otp-field", "");

    const title = document.createElement("span");
    title.textContent = "Код из SMS";

    const input = document.createElement("input");
    input.name = "verification_code";
    input.type = "text";
    input.inputMode = "numeric";
    input.autocomplete = "one-time-code";
    input.maxLength = 6;
    input.pattern = "[0-9]{6}";
    input.placeholder = "6 цифр";
    input.required = true;

    wrapper.appendChild(title);
    wrapper.appendChild(input);

    const button = getSubmitButton(form);

    if (button) {
      form.insertBefore(wrapper, button);
    } else {
      form.appendChild(wrapper);
    }

    return input;
  }

  async function apiPost(path, payload) {
    const response = await fetch(API_BASE + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      throw new Error(
        data.detail ||
        ("Ошибка сервера: HTTP " + response.status)
      );
    }

    return data;
  }

  function formPayload(form) {
    const data = Object.fromEntries(
      new FormData(form)
    );

    return {
      name: String(data.name || "").trim(),
      phone: String(data.phone || "").trim(),
      email: String(data.email || "").trim(),
      role: String(data.role || "").trim(),
      message: String(
        data.message || data.problem || ""
      ).trim()
    };
  }

  async function requestSms(form) {
    const payload = formPayload(form);

    setBusy(form, true, "Отправляем SMS…");
    setStatus(form, "", false);

    try {
      const result = await apiPost(
        "/api/leads/request-code",
        {
          phone: payload.phone
        }
      );

      form.dataset.leadOtpPhone = result.phone;

      const codeInput = ensureCodeField(form);
      codeInput.focus();

      const button = getSubmitButton(form);

      if (button) {
        button.dataset.originalText =
          "Подтвердить и отправить";

        if (button.tagName === "INPUT") {
          button.value = "Подтвердить и отправить";
        } else {
          button.textContent =
            "Подтвердить и отправить";
        }
      }

      setStatus(
        form,
        "Код отправлен по SMS. Введите 6 цифр и подтвердите заявку.",
        false
      );
    } catch (error) {
      setStatus(
        form,
        error.message || "Не удалось отправить SMS.",
        true
      );
    } finally {
      setBusy(form, false, "");
    }
  }

  async function verifyAndSubmit(form) {
    const payload = formPayload(form);
    const codeInput = form.querySelector(
      'input[name="verification_code"]'
    );

    const code = String(
      codeInput ? codeInput.value : ""
    ).trim();

    if (!/^\d{6}$/.test(code)) {
      setStatus(
        form,
        "Введите 6-значный код из SMS.",
        true
      );

      if (codeInput) {
        codeInput.focus();
      }

      return;
    }

    setBusy(form, true, "Проверяем код…");
    setStatus(form, "", false);

    try {
      const verified = await apiPost(
        "/api/leads/verify-code",
        {
          phone: payload.phone,
          code: code
        }
      );

      setBusy(form, true, "Отправляем заявку…");

      await apiPost(
        "/api/leads",
        Object.assign({}, payload, {
          verification_token:
            verified.verification_token
        })
      );

      setStatus(
        form,
        "Спасибо. Телефон подтверждён, заявка принята.",
        false
      );

      form.reset();
      delete form.dataset.leadOtpPhone;

      const otpField = form.querySelector(
        "[data-lead-otp-field]"
      );

      if (otpField) {
        otpField.remove();
      }

      const button = getSubmitButton(form);

      if (button) {
        button.dataset.originalText = "Продолжить";

        if (button.tagName === "INPUT") {
          button.value = "Продолжить";
        } else {
          button.textContent = "Продолжить";
        }
      }

      if (
        typeof window.track === "function"
      ) {
        window.track(
          "conversion_lead_verified",
          { page: window.location.pathname }
        );
      }
    } catch (error) {
      setStatus(
        form,
        error.message ||
          "Не удалось подтвердить или отправить заявку.",
        true
      );
    } finally {
      setBusy(form, false, "");
    }
  }

  function bindLeadForms() {
    document
      .querySelectorAll("form[data-lead-form]")
      .forEach(function (form) {
        if (form.dataset.leadBound === "true") {
          return;
        }

        form.dataset.leadBound = "true";

        form.addEventListener(
          "submit",
          async function (event) {
            event.preventDefault();

            if (!form.reportValidity()) {
              return;
            }

            const otpField = form.querySelector(
              "[data-lead-otp-field]"
            );

            if (!otpField) {
              await requestSms(form);
              return;
            }

            await verifyAndSubmit(form);
          }
        );
      });
  }

  function initialize() {
    document
      .querySelectorAll(".js-open-lead")
      .forEach(function (button) {
        button.addEventListener(
          "click",
          function (event) {
            event.preventDefault();
            openLead();
          }
        );
      });

    bindLeadForms();
  }

  window.KreditorLeadFlow = Object.freeze({
    initialize: initialize,
    open: openLead
  });
})(window, document);
