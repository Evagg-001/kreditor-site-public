(function (window, document) {
  "use strict";

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


  function bindLeadForms() {

    document.querySelectorAll("form[data-lead-form]").forEach(function (form) {

      if (form.dataset.leadBound === "true") {
        return;
      }

      form.dataset.leadBound = "true";


      form.addEventListener("submit", function (event) {

        event.preventDefault();


        const data = Object.fromEntries(
          new FormData(form)
        );


        const message =
`Новое обращение с сайта KREDITOR.PRO

Имя: ${data.name || ""}
Телефон: ${data.phone || ""}
Роль: ${data.role || ""}
Сообщение:
${data.message || ""}`;


        const url =
          "https://wa.me/79777379737?text=" +
          encodeURIComponent(message);


        window.open(url, "_blank");


        form.reset();

      });

    });

  }


  function initialize() {

    document.querySelectorAll(".js-open-lead")
      .forEach(function (button) {

        button.addEventListener("click", function(event){

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
