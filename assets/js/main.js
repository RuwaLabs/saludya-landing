/* =========================================================
   SaludYa — Lógica general del sitio
   RuwaLabs · UPC · 2026
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Menú móvil ---------- */
  function initNavToggle() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".primary-nav");
    if (!toggle || !nav) return;

    const getLabel = (key, fallback) => {
      const lang = (window.SaludYa?.i18n?.getCurrentLang?.() || "es");
      const dict = {
        es: { open: "Abrir menú", close: "Cerrar menú" },
        en: { open: "Open menu", close: "Close menu" }
      };
      return dict[lang]?.[key] || fallback;
    };

    const setExpanded = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? getLabel("close", "Cerrar menú") : getLabel("open", "Abrir menú")
      );
    };

    toggle.addEventListener("click", () => {
      setExpanded(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (nav.classList.contains("is-open")) {
          setExpanded(false);
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (
        nav.classList.contains("is-open") &&
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        setExpanded(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setExpanded(false);
        toggle.focus();
      }
    });

    document.addEventListener("saludya:langchange", () => {
      const open = nav.classList.contains("is-open");
      toggle.setAttribute(
        "aria-label",
        open ? getLabel("close", "Cerrar menú") : getLabel("open", "Abrir menú")
      );
    });
  }

  /* ---------- Scroll suave con compensación del header ---------- */
  function initSmoothScroll() {
    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 0;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        const targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });

        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- Resaltado del enlace activo en el nav ---------- */
  function initActiveNavHighlight() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              const isActive = link.getAttribute("href") === `#${id}`;
              link.classList.toggle("is-active", isActive);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Año dinámico en el footer ---------- */
  function initFooterYear() {
    const yearEls = document.querySelectorAll("[data-year]");
    const currentYear = new Date().getFullYear();
    yearEls.forEach((el) => {
      el.textContent = String(currentYear);
    });
  }

  /* ---------- Animación de aparición al hacer scroll ---------- */
  function initRevealOnScroll() {
    const revealTargets = document.querySelectorAll(
      ".card, .feature, .video-block, .testimonial, .team-member, .about-pillar, .value-card"
    );
    if (!revealTargets.length) return;

    if (!("IntersectionObserver" in window)) return;

    revealTargets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  /* ---------- Validación básica del formulario de contacto (si existe) ---------- */
  function initContactForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      const email = form.querySelector('input[type="email"]');
      const name = form.querySelector('input[name="name"]');
      let valid = true;

      [email, name].forEach((field) => {
        if (!field) return;
        if (!field.value.trim()) {
          field.setAttribute("aria-invalid", "true");
          valid = false;
        } else {
          field.removeAttribute("aria-invalid");
        }
      });

      if (!valid) {
        event.preventDefault();
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }

  /* ---------- Inicialización ---------- */
  function init() {
    initNavToggle();
    initSmoothScroll();
    initActiveNavHighlight();
    initFooterYear();
    initRevealOnScroll();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();