const storedValue = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Could not read ${key} from local storage.`, error);
    return null;
  }
};

const saveValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Could not save ${key} to local storage.`, error);
  }
};

const removeValue = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Could not remove ${key} from local storage.`, error);
  }
};

const debounce = (callback, delay) => {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
};

function initializeTheme() {
  const toggle = document.getElementById("theme-toggle-button");
  const root = document.documentElement;
  const savedTheme = storedValue("theme") || "dark";

  root.classList.toggle("dark", savedTheme === "dark");
  toggle?.setAttribute("aria-pressed", String(savedTheme === "dark"));

  toggle?.addEventListener("click", () => {
    const isDark = root.classList.toggle("dark");
    toggle.setAttribute("aria-pressed", String(isDark));
    saveValue("theme", isDark ? "dark" : "light");
  });
}

function initializeMobileNavigation() {
  const header = document.querySelector("#header .container");
  const navigation = document.querySelector(".nav-links");
  if (!header || !navigation) return;

  const menuButton = document.createElement("button");
  menuButton.type = "button";
  menuButton.className =
    "mobile-menu-btn lg:hidden text-slate-900 dark:text-white text-2xl focus:outline-none";
  menuButton.setAttribute("aria-label", "فتح القائمة");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  header.append(menuButton);

  const closeMenu = () => {
    navigation.classList.remove("active");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "فتح القائمة");
    menuButton.querySelector("i").className = "fa-solid fa-bars";
  };

  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("active");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "إغلاق القائمة" : "فتح القائمة",
    );
    menuButton.querySelector("i").className = isOpen
      ? "fa-solid fa-xmark"
      : "fa-solid fa-bars";
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

function initializeActiveNavigation() {
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll('.nav-links a[href^="#"]');

  const updateActiveLink = () => {
    let activeId = "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 120) {
        activeId = section.id;
      }
    });

    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  window.addEventListener("scroll", debounce(updateActiveLink, 50), {
    passive: true,
  });
  updateActiveLink();
}

function initializeSettings() {
  const sidebar = document.getElementById("settings-sidebar");
  const toggle = document.getElementById("settings-toggle");
  const close = document.getElementById("close-settings");
  const reset = document.getElementById("reset-settings");
  const colorsGrid = document.getElementById("theme-colors-grid");
  const fontButtons = [...document.querySelectorAll(".font-option")];
  if (!sidebar || !toggle || !colorsGrid) return;

  const themes = [
    { name: "بنفسجي وأزرق", primary: "#6366f1", secondary: "#8b5cf6", accent: "#a855f7" },
    { name: "وردي وبرتقالي", primary: "#ec4899", secondary: "#f97316", accent: "#fb923c" },
    { name: "أخضر زمردي", primary: "#10b981", secondary: "#059669", accent: "#34d399" },
    { name: "أزرق وسماوي", primary: "#3b82f6", secondary: "#06b6d4", accent: "#22d3ee" },
    { name: "أحمر ووردي", primary: "#ef4444", secondary: "#f43f5e", accent: "#fb7185" },
    { name: "كهرماني وبرتقالي", primary: "#f59e0b", secondary: "#ea580c", accent: "#fbbf24" },
  ];

  const applyTheme = ({ primary, secondary, accent }) => {
    const root = document.documentElement;
    const setColor = (name, hex) => {
      const value = hex.slice(1);
      const rgb = [0, 2, 4]
        .map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16))
        .join(" ");
      root.style.setProperty(`--color-${name}`, hex);
      root.style.setProperty(`--color-${name}-rgb`, rgb);
    };

    setColor("primary", primary);
    setColor("secondary", secondary);
    setColor("accent", accent);
  };

  const selectFont = (font, persist = true) => {
    if (!["alexandria", "tajawal", "cairo"].includes(font)) return;
    document.body.classList.remove(
      "font-alexandria",
      "font-tajawal",
      "font-cairo",
    );
    document.body.classList.add(`font-${font}`);

    fontButtons.forEach((button) => {
      const isSelected = button.dataset.font === font;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-checked", String(isSelected));
      button.classList.toggle("border-primary", isSelected);
      button.classList.toggle("bg-slate-50", isSelected);
      button.classList.toggle("dark:bg-slate-800", isSelected);
      button.classList.toggle("border-slate-200", !isSelected);
      button.classList.toggle("dark:border-slate-700", !isSelected);
    });

    if (persist) saveValue("selectedFont", font);
  };

  const selectTheme = (theme, button, persist = true) => {
    applyTheme(theme);
    colorsGrid.querySelectorAll("button").forEach((colorButton) => {
      colorButton.classList.remove(
        "ring-2",
        "ring-primary",
        "ring-offset-2",
        "ring-offset-white",
        "dark:ring-offset-slate-900",
      );
    });
    button?.classList.add(
      "ring-2",
      "ring-primary",
      "ring-offset-2",
      "ring-offset-white",
      "dark:ring-offset-slate-900",
    );
    if (persist) saveValue("selectedTheme", JSON.stringify(theme));
  };

  const openSettings = () => {
    sidebar.classList.remove("translate-x-full");
    sidebar.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    toggle.style.right = "20rem";
  };

  const closeSettings = () => {
    sidebar.classList.add("translate-x-full");
    sidebar.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.style.right = "0";
  };

  toggle.addEventListener("click", openSettings);
  close?.addEventListener("click", closeSettings);
  document.addEventListener("click", (event) => {
    if (
      !sidebar.contains(event.target) &&
      !toggle.contains(event.target) &&
      !sidebar.classList.contains("translate-x-full")
    ) {
      closeSettings();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSettings();
  });

  fontButtons.forEach((button) => {
    button.addEventListener("click", () => selectFont(button.dataset.font));
  });

  themes.forEach((theme) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "w-12 h-12 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 border-slate-200 dark:border-slate-700 hover:border-primary shadow-sm";
    button.style.background = `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`;
    button.setAttribute("aria-label", theme.name);
    button.title = theme.name;
    button.addEventListener("click", () => selectTheme(theme, button));
    colorsGrid.append(button);
  });

  const savedFont = storedValue("selectedFont");
  selectFont(savedFont || "tajawal", false);

  const savedTheme = storedValue("selectedTheme");
  if (savedTheme) {
    try {
      const parsedTheme = JSON.parse(savedTheme);
      const matchingTheme = themes.find(
        (theme) =>
          theme.primary === parsedTheme.primary &&
          theme.secondary === parsedTheme.secondary,
      );
      const selectedTheme = matchingTheme || parsedTheme;
      const matchingButton = [...colorsGrid.querySelectorAll("button")].find(
        (button, index) =>
          themes[index].primary === selectedTheme.primary &&
          themes[index].secondary === selectedTheme.secondary,
      );
      if (
        typeof selectedTheme.primary === "string" &&
        typeof selectedTheme.secondary === "string" &&
        typeof selectedTheme.accent === "string"
      ) {
        selectTheme(selectedTheme, matchingButton, false);
      }
    } catch (error) {
      console.warn("Could not load the saved color theme.", error);
      removeValue("selectedTheme");
    }
  }

  reset?.addEventListener("click", () => {
    removeValue("selectedTheme");
    removeValue("selectedFont");
    selectFont("tajawal", false);
    selectTheme(themes[0], colorsGrid.querySelector("button"), false);
    closeSettings();
  });
}

function initializePortfolioFilters() {
  const filters = [...document.querySelectorAll(".portfolio-filter")];
  const cards = [...document.querySelectorAll(".portfolio-item")];
  if (!filters.length || !cards.length) return;

  const activeClasses = [
    "active",
    "bg-linear-to-r",
    "from-primary",
    "to-secondary",
    "text-white",
    "shadow-lg",
    "shadow-primary/50",
  ];
  const inactiveClasses = [
    "bg-white",
    "dark:bg-slate-800",
    "text-slate-600",
    "dark:text-slate-300",
    "border",
    "border-slate-300",
    "dark:border-slate-700",
  ];

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.filter;
      filters.forEach((button) => {
        button.classList.remove(...activeClasses);
        button.classList.add(...inactiveClasses);
        button.setAttribute("aria-pressed", "false");
      });
      filter.classList.remove(...inactiveClasses);
      filter.classList.add(...activeClasses);
      filter.setAttribute("aria-pressed", "true");

      cards.forEach((card) => {
        const shouldShow =
          category === "all" || card.dataset.category === category;
        card.style.opacity = "0";
        card.style.transform = "scale(0.96)";
        window.setTimeout(() => {
          card.hidden = !shouldShow;
          if (shouldShow) {
            requestAnimationFrame(() => {
              card.style.opacity = "1";
              card.style.transform = "scale(1)";
            });
          }
        }, 180);
      });
    });
  });

  cards.forEach((card) => {
    card.style.transition = "opacity 0.2s ease, transform 0.2s ease";
  });
}

function initializeTestimonials() {
  const carousel = document.getElementById("testimonials-carousel");
  const previous = document.getElementById("prev-testimonial");
  const next = document.getElementById("next-testimonial");
  const indicators = [...document.querySelectorAll(".carousel-indicator")];
  const cards = [...document.querySelectorAll(".testimonial-card")];
  if (!carousel || !previous || !next || !cards.length) return;

  let index = 0;
  const visibleCount = () =>
    window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;

  const updateCarousel = () => {
    const maximumIndex = Math.max(0, cards.length - visibleCount());
    index = Math.min(index, maximumIndex);
    carousel.style.transform = `translateX(${(index * 100) / visibleCount()}%)`;

    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === index;
      indicator.classList.toggle("active", isActive);
      indicator.classList.toggle("bg-accent", isActive);
      indicator.classList.toggle("scale-125", isActive);
      indicator.classList.toggle("bg-slate-400", !isActive);
      indicator.classList.toggle("dark:bg-slate-600", !isActive);
    });
  };

  next.addEventListener("click", () => {
    const maximumIndex = Math.max(0, cards.length - visibleCount());
    index = index >= maximumIndex ? 0 : index + 1;
    updateCarousel();
  });
  previous.addEventListener("click", () => {
    const maximumIndex = Math.max(0, cards.length - visibleCount());
    index = index <= 0 ? maximumIndex : index - 1;
    updateCarousel();
  });
  indicators.forEach((indicator, indicatorIndex) => {
    indicator.addEventListener("click", () => {
      index = indicatorIndex;
      updateCarousel();
    });
  });
  window.addEventListener("resize", debounce(updateCarousel, 150));
  updateCarousel();
}

function initializeScrollToTop() {
  const button = document.getElementById("scroll-to-top");
  if (!button) return;

  const updateVisibility = () => {
    const isVisible = window.scrollY > 300;
    button.classList.toggle("opacity-100", isVisible);
    button.classList.toggle("visible", isVisible);
    button.classList.toggle("opacity-0", !isVisible);
    button.classList.toggle("invisible", !isVisible);
  };

  window.addEventListener("scroll", debounce(updateVisibility, 100), {
    passive: true,
  });
  button.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
  updateVisibility();
}

function initializeCustomSelects() {
  const closeAll = () => {
    document.querySelectorAll(".custom-select").forEach((select) => {
      select.setAttribute("aria-expanded", "false");
      select.nextElementSibling?.classList.add("hidden");
      const icon = select.querySelector(".fa-chevron-down");
      if (icon) icon.style.transform = "rotate(0deg)";
    });
  };

  document.querySelectorAll(".custom-select").forEach((select) => {
    const optionsPanel = select.nextElementSibling;
    const selectedText = select.querySelector(".selected-text");
    const icon = select.querySelector(".fa-chevron-down");
    if (!optionsPanel || !selectedText) return;

    const toggleOptions = (event) => {
      event.stopPropagation();
      const shouldOpen = optionsPanel.classList.contains("hidden");
      closeAll();
      if (shouldOpen) {
        optionsPanel.classList.remove("hidden");
        select.setAttribute("aria-expanded", "true");
        if (icon) icon.style.transform = "rotate(180deg)";
      }
    };

    select.addEventListener("click", toggleOptions);
    select.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleOptions(event);
      } else if (event.key === "Escape") {
        closeAll();
      }
    });

    optionsPanel.querySelectorAll(".custom-option").forEach((option) => {
      option.setAttribute("tabindex", "0");
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        selectedText.textContent = option.dataset.value;
        selectedText.classList.remove(
          "text-slate-400",
          "text-slate-500",
          "dark:text-slate-400",
        );
        selectedText.classList.add("text-slate-800", "dark:text-white");
        optionsPanel
          .querySelectorAll(".custom-option")
          .forEach((item) => item.classList.remove("bg-primary/10"));
        option.classList.add("bg-primary/10");
        closeAll();
      });
      option.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          option.click();
        }
      });
    });
  });

  document.addEventListener("click", closeAll);
}

function initializeContactForm() {
  const form = document.querySelector("#contact form");
  if (!form) return;

  const nameField = form.querySelector("#full-name");
  const emailField = form.querySelector("#email");
  const phoneField = form.querySelector("#phone");
  const detailsField = form.querySelector("#project-details");

  const clearError = (field) => {
    field.classList.remove("border-red-500");
    field.parentElement.querySelector(".error-message")?.remove();
  };

  const showError = (field, message) => {
    clearError(field);
    field.classList.add("border-red-500");
    const error = document.createElement("p");
    error.className = "error-message text-red-400 text-sm mt-1";
    error.textContent = message;
    field.parentElement.append(error);
  };

  [nameField, emailField, phoneField, detailsField].forEach((field) => {
    field?.addEventListener("input", () => clearError(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let isValid = true;
    const projectType = form.querySelector(
      '.custom-select[data-name="project-type"] .selected-text',
    );
    const budget = form.querySelector(
      '.custom-select[data-name="budget"] .selected-text',
    );

    if (!nameField.value.trim()) {
      showError(nameField, "يرجى إدخال الاسم الكامل");
      isValid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
      showError(emailField, "يرجى إدخال بريد إلكتروني صحيح");
      isValid = false;
    }
    if (
      phoneField.value.trim() &&
      !/^[+\d\s().-]{7,20}$/.test(phoneField.value.trim())
    ) {
      showError(phoneField, "يرجى إدخال رقم هاتف صحيح");
      isValid = false;
    }
    if (projectType.classList.contains("text-slate-400")) {
      const wrapper = projectType.closest(".custom-select-wrapper");
      const error = document.createElement("p");
      error.className = "error-message text-red-400 text-sm mt-1";
      error.textContent = "يرجى اختيار نوع المشروع";
      wrapper.append(error);
      wrapper.querySelector(".custom-select").classList.add("border-red-500");
      isValid = false;
    }
    if (detailsField.value.trim().length < 10) {
      showError(detailsField, "يرجى إدخال تفاصيل المشروع (10 أحرف على الأقل)");
      isValid = false;
    }
    if (!isValid) return;

    const subject = `طلب مشروع من ${nameField.value.trim()}`;
    const message = [
      `الاسم: ${nameField.value.trim()}`,
      `البريد الإلكتروني: ${emailField.value.trim()}`,
      `رقم الهاتف: ${phoneField.value.trim() || "غير محدد"}`,
      `نوع المشروع: ${projectType.textContent.trim()}`,
      `الميزانية: ${budget.textContent.trim()}`,
      "",
      "تفاصيل المشروع:",
      detailsField.value.trim(),
    ].join("\n");
    const mailto = `mailto:hzdourstw5112008@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 flex items-center justify-center z-50 bg-slate-950/80 backdrop-blur-sm";
    const dialog = document.createElement("div");
    dialog.className =
      "bg-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center border border-slate-700 shadow-2xl";
    const heading = document.createElement("h3");
    heading.className = "text-2xl font-bold mb-3";
    heading.textContent = "رسالتك جاهزة للإرسال";
    const description = document.createElement("p");
    description.className = "text-slate-300 mb-6";
    description.textContent =
      "سيفتح تطبيق البريد برسالتك. اضغط إرسال لإتمام التواصل.";
    const openMail = document.createElement("a");
    openMail.className =
      "inline-flex bg-gradient-to-r from-primary to-secondary px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300";
    openMail.href = mailto;
    openMail.textContent = "فتح البريد";
    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className =
      "mr-2 px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-slate-700";
    dismiss.textContent = "إغلاق";
    dismiss.addEventListener("click", () => overlay.remove());
    openMail.addEventListener("click", () => {
      window.setTimeout(() => overlay.remove(), 500);
    });

    dialog.append(heading, description, openMail, dismiss);
    overlay.append(dialog);
    overlay.addEventListener("click", (clickEvent) => {
      if (clickEvent.target === overlay) overlay.remove();
    });
    document.body.append(overlay);
  });
}

function initializePage() {
  initializeTheme();
  initializeMobileNavigation();
  initializeActiveNavigation();
  initializeSettings();
  initializePortfolioFilters();
  initializeTestimonials();
  initializeScrollToTop();
  initializeCustomSelects();
  initializeContactForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage, { once: true });
} else {
  initializePage();
}
