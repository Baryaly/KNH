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
  testimonials: "partials/testimonials.html",
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
  // Initialize booking appointment form with enhanced validation
  const bookingForm = document.querySelector(".booking-form");
  if (bookingForm) {
    // Real-time validation
    const inputs = bookingForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', validateField);
      input.addEventListener('input', clearFieldError);
    });

    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      // Validate all fields
      let isValid = true;
      inputs.forEach(input => {
        if (!validateField.call(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        showFormMessage(bookingForm, "Please correct the errors above.", "error");
        return;
      }

      const data = new FormData(bookingForm);
      const values = Object.fromEntries(data.entries());

      console.log("Appointment booking submitted", values);

      // Show loading state
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Booking...";
      submitBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        showFormMessage(bookingForm, "Appointment booked successfully! We'll call you to confirm within 24 hours.", "success");
        bookingForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Reset doctor options
        const doctorSelect = document.querySelector("#doctor");
        if (doctorSelect) {
          doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
        }
      }, 2000);
    });
  }

  // Initialize department selection with enhanced options
  const departmentSelect = document.querySelector("#department");
  const doctorSelect = document.querySelector("#doctor");

  if (departmentSelect && doctorSelect) {
    departmentSelect.addEventListener("change", (event) => {
      const department = event.target.value;
      updateDoctorOptions(department, doctorSelect);
    });
  }

  // Newsletter form
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;

      if (!isValidEmail(email)) {
        showFormMessage(newsletterForm, "Please enter a valid email address.", "error");
        return;
      }

      showFormMessage(newsletterForm, "Thank you for subscribing! You'll receive our latest updates.", "success");
      newsletterForm.reset();
    });
  }
}

function validateField() {
  const field = this;
  const value = field.value.trim();
  const fieldName = field.name;
  let isValid = true;
  let errorMessage = "";

  // Clear previous error
  clearFieldError.call(field);

  switch (fieldName) {
    case "name":
      if (!value) {
        errorMessage = "Full name is required";
        isValid = false;
      } else if (value.length < 2) {
        errorMessage = "Name must be at least 2 characters";
        isValid = false;
      }
      break;

    case "email":
      if (!value) {
        errorMessage = "Email address is required";
        isValid = false;
      } else if (!isValidEmail(value)) {
        errorMessage = "Please enter a valid email address";
        isValid = false;
      }
      break;

    case "phone":
      if (!value) {
        errorMessage = "Phone number is required";
        isValid = false;
      } else if (!isValidPhone(value)) {
        errorMessage = "Please enter a valid phone number";
        isValid = false;
      }
      break;

    case "date":
      if (!value) {
        errorMessage = "Appointment date is required";
        isValid = false;
      } else {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          errorMessage = "Appointment date cannot be in the past";
          isValid = false;
        }
      }
      break;

    case "time":
      if (!value) {
        errorMessage = "Appointment time is required";
        isValid = false;
      }
      break;

    case "department":
      if (!value) {
        errorMessage = "Please select a department";
        isValid = false;
      }
      break;

    case "doctor":
      if (!value) {
        errorMessage = "Please select a doctor";
        isValid = false;
      }
      break;

    case "message":
      if (value && value.length > 500) {
        errorMessage = "Message cannot exceed 500 characters";
        isValid = false;
      }
      break;
  }

  if (!isValid) {
    showFieldError(field, errorMessage);
  }

  return isValid;
}

function showFieldError(field, message) {
  field.classList.add('error');

  let errorElement = field.parentNode.querySelector('.field-error');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    field.parentNode.appendChild(errorElement);
  }
  errorElement.textContent = message;
}

function clearFieldError() {
  this.classList.remove('error');
  const errorElement = this.parentNode.querySelector('.field-error');
  if (errorElement) {
    errorElement.remove();
  }
}

function showFormMessage(form, message, type) {
  // Remove existing messages
  const existingMessage = form.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageElement = document.createElement('div');
  messageElement.className = `form-message ${type}`;
  messageElement.textContent = message;

  form.appendChild(messageElement);

  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function updateDoctorOptions(department, doctorSelect) {
  // Clear existing options
  doctorSelect.innerHTML = '<option value="">Select Doctor</option>';

  // Enhanced doctor options based on department
  const doctors = {
    cardiology: [
      "Dr. Rahimi - Interventional Cardiologist",
      "Dr. Hassan Ali - Cardiac Electrophysiologist",
      "Dr. Yasmeen Akhtar - Cardiac Rehabilitation Specialist"
    ],
    neurology: [
      "Dr. Fatima Zahra - Neurologist",
      "Dr. Omar Farooq - Neurosurgeon",
      "Dr. Ahmed Hassan - Neurophysiologist",
      "Dr. Tariq Mahmood - Psychiatrist"
    ],
    surgery: [
      "Dr. Munawar Ahmad - General Surgeon",
      "Dr. Ahmad Fayez - Orthopedic Surgeon",
      "Dr. Khalid Noori - Internal Medicine",
      "Dr. Basir Ahmad - Plastic Surgeon",
      "Dr. Asma Bibi - Urologist",
      "Dr. Rashid Khan - Pediatric Surgeon"
    ],
    pediatrics: [
      "Dr. Samim Noori - Pediatric Specialist",
      "Dr. Karima Karimi - Pediatrician",
      "Dr. Zahra Ahmed - Pediatric Cardiologist",
      "Dr. Imran Shah - Nuclear Medicine",
      "Dr. Fatima Noor - Endocrinologist"
    ],
    maternity: [
      "Dr. Malalai Herawi - Gynecologist",
      "Dr. Ayesha Bibi - Fertility Specialist",
      "Dr. Samira Hassan - Perinatologist",
      "Dr. Nabila Ahmed - Midwife"
    ],
    diagnostics: [
      "Dr. Walid Ahmad - Radiologist",
      "Dr. Sayed Sadat - Pathologist",
      "Dr. Naveed Ahmed - Microbiologist"
    ],
    dermatology: [
      "Dr. Nadia Hassan - Dermatologist",
      "Dr. Mariam Khan - Cosmetic Dermatologist",
      "Dr. Farhana Khan - Dermatopathologist",
      "Dr. Kamran Ali - Hair Transplant Surgeon"
    ],
    emergency: ["Any Available Emergency Doctor"]
  };

  if (doctors[department]) {
    doctors[department].forEach(doctor => {
      const option = document.createElement("option");
      option.value = doctor.toLowerCase().replace(/[^a-z0-9]/g, '-');
      option.textContent = doctor;
      doctorSelect.appendChild(option);
    });
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();
  initFormHandlers();

  if (typeof window.initNavigation === "function") {
    window.initNavigation();
  }

  // FAQ toggle functionality
  const faqToggleButtons = document.querySelectorAll(".faq-question");
  faqToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      const answer = button.nextElementSibling;
      if (answer) answer.hidden = expanded;
    });
  });

  // Enhanced Team filtering with animations
  const teamFilterButtons = document.querySelectorAll(".team-filters .filter-btn");
  const teamCards = document.querySelectorAll(".team-card");

  teamFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      // Update active button
      teamFilterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter cards with animation
      teamCards.forEach((card, index) => {
        const specialty = card.getAttribute("data-specialty");

        if (filter === "all" || specialty === filter) {
          setTimeout(() => {
            card.classList.remove("hidden");
          }, index * 100);
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  // Enhanced Testimonials filtering with animations
  const testimonialFilterButtons = document.querySelectorAll(".testimonials-filters .filter-btn");
  const testimonialCards = document.querySelectorAll(".testimonial-card");

  testimonialFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      // Update active button
      testimonialFilterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter cards with animation
      testimonialCards.forEach((card, index) => {
        const category = card.getAttribute("data-category");

        if (filter === "all" || category === filter) {
          setTimeout(() => {
            card.classList.remove("hidden");
          }, index * 100);
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  // Services filtering
  const serviceFilterButtons = document.querySelectorAll(".services-filter .filter-btn");
  const serviceCards = document.querySelectorAll(".service-card");

  serviceFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      // Update active button
      serviceFilterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter cards
      serviceCards.forEach((card) => {
        const category = card.getAttribute("data-category");

        if (filter === "all" || category === filter) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add loading animation for images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('load', function() {
      this.classList.add('loaded');
    });

    if (img.complete) {
      img.classList.add('loaded');
    }
  });

  // Emergency banner pulse animation
  const emergencyIcon = document.querySelector('.emergency-content i');
  if (emergencyIcon) {
    setInterval(() => {
      emergencyIcon.style.transform = 'scale(1.1)';
      setTimeout(() => {
        emergencyIcon.style.transform = 'scale(1)';
      }, 1000);
    }, 2000);
  }

  // Scroll animations
  initScrollAnimations();

  // Stats counter animation
  initStatsCounter();

  // Parallax effect for hero section
  initParallaxEffect();
});

// Scroll animations functionality
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Add stagger animation for multiple elements
        if (entry.target.classList.contains('stagger-children')) {
          const children = entry.target.children;
          Array.from(children).forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('visible');
            }, index * 100);
          });
        }
      }
    });
  }, observerOptions);

  // Add animation classes to elements
  const animateElements = document.querySelectorAll('.card, .service-card, .team-card, .testimonial-card, .value-item, .leadership-item, .accreditation-item, .award-item, .feature-card, .commitment-item, .gallery-item');
  animateElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // Add slide animations for specific sections
  const leftSlideElements = document.querySelectorAll('.slide-in-left-target');
  leftSlideElements.forEach(el => {
    el.classList.add('slide-in-left');
    observer.observe(el);
  });

  const rightSlideElements = document.querySelectorAll('.slide-in-right-target');
  rightSlideElements.forEach(el => {
    el.classList.add('slide-in-right');
    observer.observe(el);
  });

  // Add stagger animation to grid containers
  const gridContainers = document.querySelectorAll('.grid-2, .grid-3, .grid-4, .services-grid, .team-grid, .testimonials-grid');
  gridContainers.forEach(container => {
    container.classList.add('stagger-children');
  });
}

// Stats counter animation
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat-number');
  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const count = parseInt(target.textContent.replace(/[^0-9]/g, ''));
        animateCounter(target, 0, count, 2000);
        observer.unobserve(target);
      }
    });
  }, observerOptions);

  stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element, start, end, duration) {
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (end - start) * easeOutQuart);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  requestAnimationFrame(updateCounter);
}

// Parallax effect for hero section
function initParallaxEffect() {
  const hero = document.querySelector('#hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    // Apply parallax to background images
    const heroBackground = hero.querySelector('.hero-background, .hero-image');
    if (heroBackground) {
      heroBackground.style.transform = `translateY(${rate}px)`;
    }

    // Add subtle parallax to hero content
    const heroContent = hero.querySelector('.hero-content, .hero-inner');
    if (heroContent) {
      heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
  });
}

// Enhanced form validation with visual feedback
function enhanceFormValidation() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      // Add real-time validation
      input.addEventListener('input', () => {
        validateField(input);
      });

      // Add focus/blur effects
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
      });
    });
  });
}

// Loading states for buttons
function addLoadingStates() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    button.addEventListener('click', function() {
      if (this.type === 'submit' || this.closest('form')) {
        this.classList.add('loading');
        this.disabled = true;

        // Remove loading state after 3 seconds (for demo)
        setTimeout(() => {
          this.classList.remove('loading');
          this.disabled = false;
        }, 3000);
      }
    });
  });
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
  enhanceFormValidation();
  addLoadingStates();
});