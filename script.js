/* =========================================================
   Yashvardhan Goel · interactions
   - Scroll reveals (IntersectionObserver)
   - Count-up stats
   - Sticky nav blur + active-section highlight
   - Mobile menu
   - Card pointer spotlight
   All motion respects prefers-reduced-motion.
   ========================================================= */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky nav state ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 12) nav.classList.add("is-stuck");
    else nav.classList.remove("is-stuck");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const toggle = document.getElementById("navToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__links a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const revObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => revObserver.observe(el));
  }

  /* ---- Count-up stats ---- */
  const counters = document.querySelectorAll(".count");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.to);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => countObserver.observe(el));
  } else {
    counters.forEach(runCount);
  }

  /* ---- Active section in nav ---- */
  const navLinks = Array.from(document.querySelectorAll(".nav__links a"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((a) =>
              a.classList.toggle("is-active", a.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---- GitHub contributions ----
     Data is scraped from the public profile by a third-party service, so private
     commits are never included and a fetch failure must stay invisible: the block
     ships hidden and is only revealed once real data has rendered. */
  const contrib = document.getElementById("contrib");
  if (contrib) {
    const GH_USER = "yash2002vardhan";
    const grid = document.getElementById("contribGrid");
    const countEl = document.getElementById("contribCount");
    const monthsEl = document.getElementById("contribMonths");

    const renderContrib = (days, total) => {
      // Pad the front so the first column starts on Sunday, matching GitHub's layout.
      const lead = new Date(days[0].date + "T00:00:00").getDay();
      const frag = document.createDocumentFragment();
      for (let i = 0; i < lead; i++) {
        const pad = document.createElement("i");
        pad.className = "contrib__cell";
        pad.style.visibility = "hidden";
        frag.appendChild(pad);
      }
      days.forEach((d) => {
        const cell = document.createElement("i");
        cell.className = "contrib__cell";
        cell.dataset.level = String(d.level);
        cell.title = `${d.count} contribution${d.count === 1 ? "" : "s"} on ${d.date}`;
        frag.appendChild(cell);
      });
      grid.appendChild(frag);

      countEl.textContent = total.toLocaleString();

      const fmt = new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" });
      const first = new Date(days[0].date + "T00:00:00");
      const last = new Date(days[days.length - 1].date + "T00:00:00");
      monthsEl.textContent = `${fmt.format(first)} — ${fmt.format(last)}`;

      contrib.hidden = false;
    };

    fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const days = Array.isArray(data.contributions) ? data.contributions : [];
        if (!days.length) return;
        const total =
          (data.total && (data.total.lastYear ?? Object.values(data.total)[0])) ||
          days.reduce((sum, d) => sum + d.count, 0);
        renderContrib(days, total);
      })
      .catch(() => {
        /* Service unavailable — leave the section hidden. */
      });
  }

  /* ---- Card pointer spotlight (dark project cards) ---- */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }
})();
