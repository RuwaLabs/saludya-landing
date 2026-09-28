/* =========================================================
   SaludYa — Sistema de internacionalización ES/EN
   RuwaLabs · UPC · 2026
   ========================================================= */

(function () {
  "use strict";

  const DEFAULT_LANG = "es";
  const SUPPORTED_LANGS = ["es", "en"];
  const STORAGE_KEY = "saludya-lang";

  /**
   * Detecta el idioma inicial: prioriza el guardado por el usuario,
   * luego el idioma del navegador, y por defecto español.
   */
  function detectInitialLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      return stored;
    }
    const browserLang = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
    return SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
  }

  /**
   * Carga el archivo JSON de traducciones correspondiente al idioma.
   */
  async function loadTranslations(lang) {
    const path = `assets/locales/${lang}.json`;
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo de traducciones: ${path}`);
    }
    return response.json();
  }

  /**
   * Recorre un objeto con claves anidadas usando notación con punto.
   * Ejemplo: getNestedValue(obj, "hero.title") -> obj.hero.title
   */
  function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
        return acc[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Aplica las traducciones a todos los elementos con [data-i18n].
   * También soporta [data-i18n-attr] para traducir atributos HTML.
   */
  function applyTranslations(translations) {
    // --- Texto: [data-i18n] ---
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = getNestedValue(translations, key);
      if (typeof value === "string") {
        el.textContent = value;
      }
    });

    // --- Atributos: [data-i18n-attr="attr1:key1,attr2:key2"] ---
    const attrElements = document.querySelectorAll("[data-i18n-attr]");
    attrElements.forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr");
      spec.split(",").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        const value = getNestedValue(translations, key);
        if (attr && value) {
          el.setAttribute(attr, value);
        }
      });
    });
  }

  /**
   * Actualiza el atributo lang del <html> y el estado de los botones.
   */
  function updateLangUI(lang) {
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const isActive = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  /**
   * Cambia el idioma activo: carga traducciones, aplica y persiste.
   */
  async function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;

    try {
      const translations = await loadTranslations(lang);
      applyTranslations(translations);
      updateLangUI(lang);
      localStorage.setItem(STORAGE_KEY, lang);
      document.dispatchEvent(
        new CustomEvent("saludya:langchange", { detail: { lang } })
      );
    } catch (error) {
      console.error("[SaludYa i18n] Error al cambiar idioma:", error);
    }
  }

  /**
   * Inicializa el sistema: detecta idioma y conecta los botones.
   */
  async function initI18n() {
    const initialLang = detectInitialLang();
    await setLanguage(initialLang);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        if (lang) setLanguage(lang);
      });
    });
  }

  // Exponer API pública mínima
  window.SaludYa = window.SaludYa || {};
  window.SaludYa.i18n = {
    setLanguage,
    getCurrentLang: () => localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG,
    supported: SUPPORTED_LANGS.slice()
  };

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }
})();