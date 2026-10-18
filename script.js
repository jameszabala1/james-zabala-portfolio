/* =========================================================
   PORTFOLIO — James Zabala
   JavaScript principal (vanilla, sin dependencias)
   Se carga con defer, así que el DOM ya existe.
   ========================================================= */

(function () {
  "use strict";

  /* Detección de preferencia de movimiento reducido */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* -------------------------------------------------------
     1. MENÚ MÓVIL
     ------------------------------------------------------- */
  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));

  function openMenu() {
    navMenu.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Cerrar menú de navegación");
  }

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú de navegación");
  }

  function toggleMenu() {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  }

  if (navToggle && navMenu) {
    /* Click en la hamburguesa */
    navToggle.addEventListener("click", toggleMenu);

    /* Al pulsar un enlace, cerrar el menú (el scroll lo hace el módulo 2) */
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navMenu.classList.contains("is-open")) closeMenu();
      });
    });

    /* Cerrar al hacer click fuera */
    document.addEventListener("click", (event) => {
      if (!navMenu.classList.contains("is-open")) return;

      const clickedInside =
        navMenu.contains(event.target) || navToggle.contains(event.target);

      if (!clickedInside) closeMenu();
    });

    /* Cerrar con Escape y devolver el foco al botón */
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        closeMenu();
        navToggle.focus();
      }
    });

    /* Si se pasa a escritorio, cerrar el menú */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && navMenu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  /* -------------------------------------------------------
     2. SCROLL SUAVE CON OFFSET POR EL HEADER STICKY
     ------------------------------------------------------- */
  const header = document.querySelector(".header");

  function getHeaderOffset() {
    return header ? header.offsetHeight : 0;
  }

  const internalLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

  internalLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#" || href.length < 2) return;

    const target = document.querySelector(href);
    if (!target) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();

      const offset = getHeaderOffset();
      const targetTop =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        offset +
        1; /* +1 por subpíxeles */

      const behavior = prefersReducedMotion ? "auto" : "smooth";

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: behavior,
      });

      /* Actualizar la URL sin saltar */
      if (history.pushState) {
        history.pushState(null, "", href);
      } else {
        location.hash = href;
      }
    });
  });

  /* Si se entra con un hash en la URL, respetar el offset del header */
  if (window.location.hash && window.location.hash.length > 1) {
    const initialTarget = document.querySelector(window.location.hash);
    if (initialTarget) {
      /* Esperar al siguiente frame para que el layout esté calculado */
      window.requestAnimationFrame(() => {
        const top =
          initialTarget.getBoundingClientRect().top +
          window.pageYOffset -
          getHeaderOffset() +
          1;
        window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
      });
    }
  }

  /* -------------------------------------------------------
     3. NAV ACTIVO SEGÚN LA SECCIÓN VISIBLE
     ------------------------------------------------------- */
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const linkBySectionId = new Map();

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      linkBySectionId.set(href.slice(1), link);
    }
  });

  let ticking = false;

  function updateActiveLink() {
    if (!sections.length || !navLinks.length) return;

    const offset = getHeaderOffset() + 24;
    const scrollY = window.pageYOffset;

    /* Buscar la última sección cuyo top ya hemos pasado */
    let currentSection = sections[0];
    for (const section of sections) {
      if (section.offsetTop - offset <= scrollY) {
        currentSection = section;
      } else {
        break;
      }
    }

    navLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });

    const activeLink = linkBySectionId.get(currentSection.id);
    if (activeLink) {
      activeLink.classList.add("is-active");
      activeLink.setAttribute("aria-current", "true");
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveLink();
      ticking = false;
    });
  }

  if (sections.length && navLinks.length) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActiveLink);
    updateActiveLink();
  }

  /* -------------------------------------------------------
     4. AÑO DINÁMICO EN EL FOOTER
     ------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
