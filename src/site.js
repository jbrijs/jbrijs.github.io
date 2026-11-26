// Header border once the page scrolls.
const header = document.querySelector(".site-header");
const onScroll = () =>
  header.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile menu.
const toggle = document.querySelector(".menu-toggle");
const links = document.querySelector(".nav-links");
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

// Fade sections in as they enter the viewport.
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

document.getElementById("year").textContent = new Date().getFullYear();
