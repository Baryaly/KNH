// Smooth scrolling and active navigation state

function smoothScrollTo(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initNavigation() {
  const links = Array.from(document.querySelectorAll("nav a[href^='#']"));
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const href = link.getAttribute("href");
      smoothScrollTo(href);
    });
  });
}

window.initNavigation = initNavigation;
