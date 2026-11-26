const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Header: becomes a pill once scrolled ----------
const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
const links = document.querySelector(".nav-links");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ---------- Mobile menu ----------
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});
links.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// ---------- Active section highlight in the nav ----------
const indicator = document.querySelector(".nav-indicator");
const sectionLinks = [...links.querySelectorAll('a[href^="#"]')];
let activeLink = null;

const moveIndicator = () => {
  if (!activeLink) {
    indicator.classList.remove("is-on");
    return;
  }
  const place = () => {
    indicator.style.width = `${activeLink.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;
  };
  if (!indicator.classList.contains("is-on")) {
    // First appearance: snap into place, then fade in (no slide from zero).
    indicator.style.transition = "none";
    place();
    indicator.offsetWidth;
    indicator.style.transition = "";
  } else {
    place();
  }
  indicator.classList.add("is-on");
};

const setActive = (id) => {
  const next = sectionLinks.find((a) => a.getAttribute("href") === `#${id}`) || null;
  if (next === activeLink) return;
  activeLink?.classList.remove("is-active");
  activeLink = next;
  activeLink?.classList.add("is-active");
  moveIndicator();
};

if ("IntersectionObserver" in window) {
  const visible = new Map();
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
      const current = sectionLinks
        .map((a) => a.getAttribute("href").slice(1))
        .filter((id) => visible.get(id))
        .pop();
      setActive(current);
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sectionLinks.forEach((a) => {
    const section = document.querySelector(a.getAttribute("href"));
    if (section) spy.observe(section);
  });
}
window.addEventListener("resize", moveIndicator);
document.fonts?.ready.then(moveIndicator);

// ---------- Fade sections in as they enter the viewport ----------
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

// ---------- Impact numbers count up once ----------
const stats = document.querySelectorAll(".stat-value");
if (!reduceMotion && "IntersectionObserver" in window) {
  const parts = (text) => {
    const m = text.match(/^(\D*)([\d.]+)(.*)$/);
    return m && { prefix: m[1], value: parseFloat(m[2]), decimals: (m[2].split(".")[1] || "").length, suffix: m[3] };
  };
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  const run = (el) => {
    const p = el._count;
    const start = performance.now();
    const duration = 1400;
    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = p.prefix + (p.value * ease(t)).toFixed(p.decimals) + p.suffix;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const counter = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counter.unobserve(entry.target);
          run(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  stats.forEach((el) => {
    const p = parts(el.textContent.trim());
    if (!p) return;
    el._count = p;
    el.setAttribute("aria-label", el.textContent.trim());
    el.textContent = p.prefix + (0).toFixed(p.decimals) + p.suffix;
    counter.observe(el);
  });
}

// ---------- Accordions open and close smoothly ----------
document.querySelectorAll(".role-more").forEach((details) => {
  const summary = details.querySelector("summary");
  const body = details.querySelector(".role-detail");
  let anim = null;
  let opening = false;

  summary.addEventListener("click", (event) => {
    if (reduceMotion || !details.animate) return;
    event.preventDefault();

    // Mid-animation clicks reverse whatever direction is in flight.
    const closing = anim ? opening : details.open;
    const from = details.offsetHeight;
    anim?.cancel();
    opening = !closing;
    if (!closing) details.open = true;
    const to = closing ? summary.offsetHeight : details.scrollHeight;

    anim = details.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: closing ? 320 : 420, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
    );
    body.animate(
      closing
        ? { opacity: [1, 0] }
        : { opacity: [0, 1], transform: ["translateY(-6px)", "none"] },
      { duration: closing ? 200 : 420, easing: "ease" }
    );
    anim.onfinish = () => {
      if (closing) details.open = false;
      anim = null;
    };
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
