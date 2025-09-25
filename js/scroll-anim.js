/* ===== 1) Fade contínuo por seção (tipo Apple) ===== */
(function () {
  const sections = Array.from(document.querySelectorAll("section"));
  if (!sections.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    sections.forEach(sec => { sec.style.opacity = 1; sec.style.transform = "none"; });
    return;
  }

  let rafId = null;
  const MAX_TRANSLATE = 40;       // px máximos de deslocamento quando longe do centro
  const FADE_RADIUS   = 0.75;     // quanto da janela influencia o fade (0.65 ~ suave)

  function updateSections() {
    const H = window.innerHeight;
    const center = H / 2;

    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      const secCenter = rect.top + rect.height / 2;
      const dist = Math.abs(secCenter - center);                // distância do centro
      const t = Math.min(1, dist / (H * FADE_RADIUS));          // 0 (centro) -> 1 (longe)
      const opacity = 1 - t;                                    // mais perto, mais opaco
      const translateY = MAX_TRANSLATE * t;                     // desloca pra baixo sutilmente

      sec.style.opacity = opacity.toFixed(3);
      sec.style.transform = `translateY(${translateY}px)`;
    }
    rafId = requestAnimationFrame(updateSections);
  }

  function onVisibilityChange() {
    if (document.hidden) { if (rafId) cancelAnimationFrame(rafId); }
    else { updateSections(); }
  }

  window.addEventListener("load", updateSections, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
})();

/* ===== 2) Animações infinitas por elemento (substitui AOS) ===== */
(function () {
  const animEls = Array.from(document.querySelectorAll("[data-anim]"));
  if (!animEls.length) return;

  // aplica delay via atributo (ms)
  for (const el of animEls) {
    const delay = el.getAttribute("data-anim-delay");
    if (delay) el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
    const dur = el.getAttribute("data-anim-dur");
    if (dur) el.style.setProperty("--anim-dur", `${parseInt(dur, 10)}ms`);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // quando entra, liga; quando sai, desliga (pra animar de novo quando voltar)
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, {
    threshold: 0.25, // 25% visível já conta
    rootMargin: "0px 0px -10% 0px" // liga um pouco antes do centro
  });

  animEls.forEach(el => io.observe(el));
})();
