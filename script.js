const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-demo-form]");
const message = document.querySelector("[data-form-message]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const pageSections = [...document.querySelectorAll("main section[id]")];
const problemSection = document.querySelector("#problema");
const themeToggle = document.querySelector("[data-theme-toggle]");
const brandLink = document.querySelector(".brand[href='#top']");
const storedTheme = localStorage.getItem("orlay-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const savedSectionId = sessionStorage.getItem("orlay-active-section");
const shouldRestoreSection = !window.location.hash && savedSectionId && savedSectionId !== "top";
let isReturningToTop = false;
let canStoreActiveSection = false;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "auto";
}

const jumpToSection = (section) => {
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";

  window.scrollTo({
    top: Math.max(section.getBoundingClientRect().top + window.scrollY - 96, 0),
    behavior: "auto",
  });

  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  });
};

const restoreSavedSectionFallback = () => {
  if (!shouldRestoreSection) return;

  const section = document.getElementById(savedSectionId);
  if (!section) return;

  requestAnimationFrame(() => {
    if (window.scrollY > 24) return;

    jumpToSection(section);
    setHeaderState();
    setActiveNav();
  });
};

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
  if (isReturningToTop) {
    header.classList.remove("is-scrolled");
    if (window.scrollY <= 12) isReturningToTop = false;
    return;
  }
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

const storeActiveSection = () => {
  if (!canStoreActiveSection) return;

  const active = pageSections
    .filter((section) => section.getBoundingClientRect().top <= window.innerHeight * 0.42)
    .at(-1);

  if (active?.id) {
    sessionStorage.setItem("orlay-active-section", active.id);
  }
};

restoreSavedSectionFallback();
setHeaderState();
setActiveNav();

window.addEventListener("load", () => {
  restoreSavedSectionFallback();
  setHeaderState();
  setActiveNav();

  window.setTimeout(() => {
    canStoreActiveSection = true;
    storeActiveSection();
  }, 180);
});

window.addEventListener("pageshow", () => {
  restoreSavedSectionFallback();
  setHeaderState();
  setActiveNav();

  window.setTimeout(() => {
    canStoreActiveSection = true;
    storeActiveSection();
  }, 180);
});

window.addEventListener("scroll", () => {
  setHeaderState();
  setActiveNav();
  storeActiveSection();
}, { passive: true });

window.addEventListener("beforeunload", () => {
  canStoreActiveSection = true;
  storeActiveSection();
});

if (brandLink) {
  brandLink.addEventListener("click", (event) => {
    event.preventDefault();
    isReturningToTop = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    header?.classList.remove("is-scrolled");

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    sessionStorage.setItem("orlay-active-section", "top");
  });
}

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

if (problemSection && "IntersectionObserver" in window) {
  const problemObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        problemSection.classList.add("is-animated");
        problemObserver.unobserve(problemSection);
      }
    });
  }, { threshold: 0.42 });

  problemObserver.observe(problemSection);
} else {
  problemSection?.classList.add("is-animated");
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
