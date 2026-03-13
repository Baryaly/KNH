/*
  Simple partial loader for a static site.
  When opening index.html in a browser, this script fetches common pieces of UI
  (header/footer/sections) to keep the HTML clean and consistent.
*/

const PARTIALS = {
  header: "partials/header.html",
  hero: "partials/hero.html",
  about: "partials/about.html",
  services: "partials/services.html",
  team: "partials/team.html",
  faq: "partials/faq.html",
  contact: "partials/contact.html",
  footer: "partials/footer.html",
};

async function loadPartials() {
  const keys = Object.keys(PARTIALS);

  await Promise.all(
    keys.map(async (key) => {
      const selector = `#${key}`;
      const element = document.querySelector(selector);
      if (!element) return;

      try {
        const resp = await fetch(PARTIALS[key]);
        if (!resp.ok) throw new Error(`Failed to load ${PARTIALS[key]}`);
        element.innerHTML = await resp.text();
      } catch (error) {
        console.error(error);
        element.innerHTML = `<div class="load-error">Unable to load ${key} section.</div>`;
      }
    })
  );

  const year = new Date().getFullYear();
  const footerYear = document.querySelector("#footer-year");
  if (footerYear) footerYear.textContent = year;
}

function initFormHandlers() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());

    console.log("Contact form submitted", values);

    const message = document.createElement("p");
    message.className = "form-success";
    message.textContent = "Thanks! We received your message and will be in touch soon.";

    form.reset();
    form.appendChild(message);

    setTimeout(() => message.remove(), 5000);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();
  initFormHandlers();

  if (typeof window.initNavigation === "function") {
    window.initNavigation();
  }

  const faqToggleButtons = document.querySelectorAll(".faq-question");
  faqToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      const answer = button.nextElementSibling;
      if (answer) answer.hidden = expanded;
    });
  });
});
