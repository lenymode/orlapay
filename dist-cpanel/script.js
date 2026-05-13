const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-demo-form]");
const message = document.querySelector("[data-form-message]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const themeToggle = document.querySelector("[data-theme-toggle]");
const storedTheme = localStorage.getItem("orlay-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const setTheme = (theme) => {
  document.body.dataset.theme = theme;

  if (!themeToggle) return;

  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Passa alla modalità chiara" : "Passa alla modalità scura");
};

setTheme(storedTheme || preferredTheme);

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

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("orlay-theme", nextTheme);
    setTheme(nextTheme);
  });
}

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
  const requiredFields = [...form.querySelectorAll("input[required], textarea[required]")];

  const ensureFieldError = (field) => {
    const row = field.closest(".form-row");
    if (!row) return null;

    let error = row.querySelector(".field-error");
    if (!error) {
      error = document.createElement("small");
      error.className = "field-error";
      error.id = `${field.id || field.name}-error`;
      row.append(error);
    }

    field.setAttribute("aria-describedby", error.id);
    return error;
  };

  const getFieldError = (field) => {
    if (!field.value.trim()) return "Questo campo è obbligatorio.";
    if (field.type === "email" && field.validity.typeMismatch) return "Inserisci un indirizzo email valido.";
    return "";
  };

  const setFieldError = (field, errorText) => {
    const row = field.closest(".form-row");
    const error = ensureFieldError(field);
    if (!row || !error) return;

    row.classList.toggle("has-error", Boolean(errorText));
    field.setAttribute("aria-invalid", String(Boolean(errorText)));
    error.textContent = errorText;
  };

  const validateField = (field) => {
    const errorText = getFieldError(field);
    setFieldError(field, errorText);
    return !errorText;
  };

  requiredFields.forEach((field) => {
    ensureFieldError(field);
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
    field.addEventListener("blur", () => validateField(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.classList.remove("is-visible");

    let firstInvalidField = null;
    requiredFields.forEach((field) => {
      if (!validateField(field) && !firstInvalidField) firstInvalidField = field;
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    message.textContent = "Grazie. Analizzeremo i flussi del tuo evento e ti contatteremo per fissare una demo focalizzata su venue, pubblico e punti di servizio.";
    message.classList.add("is-visible");
    form.reset();
    requiredFields.forEach((field) => setFieldError(field, ""));
  });
}
