const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-demo-form]");
const message = document.querySelector("[data-form-message]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const setActiveNav = () => {
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const active = sections
    .filter((section) => section.getBoundingClientRect().top <= 140)
    .at(-1);

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", Boolean(active && link.getAttribute("href") === `#${active.id}`));
  });
};

setHeaderState();
setActiveNav();

window.addEventListener("scroll", () => {
  setHeaderState();
  setActiveNav();
}, { passive: true });

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (form && message) {
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
}
