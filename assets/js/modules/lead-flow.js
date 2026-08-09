(function (window, document) {
  "use strict";

  const API_URL = "https://api.kreditor.pro/api/leads";

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

  function setStatus(form, message, isError) {
    const status = form.querySelector(".form-status");

    if (status) {
      status.textContent = message;
      status.style.color = isError ? "#b42318" : "";
    }
  }

  async function submitLead(form) {
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      role: String(formData.get("role") || "").trim(),
      message: String(formData.get("message") || "").trim()
    };

    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus(form, "Отправляем обращение…", false);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(
          result.detail ||
          result.message ||
          "Не удалось отправить обращение"
        );
      }

      setStatus(
        form,
        "Спасибо! Ваше обращение зарегистрировано. Мы свяжемся с вами.",
        false
      );

      form.reset();

      if (
        form.closest("dialog") &&
        form.closest("dialog").open
      ) {
        setTimeout(function () {
          form.closest("dialog").close();
        }, 1800);
      }

    } catch (error) {
      console.error("Ошибка отправки обращения:", error);

      setStatus(
        form,
        error.message ||
        "Не удалось отправить обращение. Попробуйте ещё раз.",
        true
      );

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
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

        form.addEventListener("submit", function (event) {
          event.preventDefault();

          if (!form.reportValidity()) {
            return;
          }

          submitLead(form);
        });

      });
  }

  function initialize() {
    document
      .querySelectorAll(".js-open-lead")
      .forEach(function (button) {

        button.addEventListener("click", function (event) {
          event.preventDefault();
          openLead();
        });

      });

    bindLeadForms();
  }

  window.KreditorLeadFlow = Object.freeze({
    initialize,
    open: openLead
  });

})(window, document);
