const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-demo-form]");
const message = document.querySelector("[data-form-message]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  message.textContent = "Grazie. La richiesta demo è pronta per essere collegata al sistema di contatto.";
  message.classList.add("is-visible");
  form.reset();
});
