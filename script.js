const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-demo-form]");
const message = document.querySelector("[data-form-message]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const themeToggle = document.querySelector("[data-theme-toggle]");
const brandLink = document.querySelector(".brand[href='#top']");
const storedTheme = localStorage.getItem("orlay-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const shouldStartAtTop = !window.location.hash;
let isReturningToTop = false;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const resetInitialScroll = () => {
  if (!shouldStartAtTop) return;
  window.scrollTo(0, 0);
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

resetInitialScroll();
setHeaderState();
setActiveNav();

window.addEventListener("load", () => {
  resetInitialScroll();
  setHeaderState();
});

window.addEventListener("pageshow", () => {
  resetInitialScroll();
  setHeaderState();
});

window.addEventListener("scroll", () => {
  setHeaderState();
  setActiveNav();
}, { passive: true });

if (brandLink) {
  brandLink.addEventListener("click", (event) => {
    event.preventDefault();
    isReturningToTop = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    header?.classList.remove("is-scrolled");

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
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
