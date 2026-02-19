// Scroll reveal using IntersectionObserver
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealElements.forEach((el) => {
  revealObserver.observe(el);
});

// Mobile navigation overlay
const navToggle = document.querySelector(".nav-toggle");
const navOverlay = document.getElementById("nav-overlay");
const overlayLinks = document.querySelectorAll(".overlay-link");

if (navToggle && navOverlay) {
  const toggleMenu = () => {
    const isOpen = navOverlay.classList.toggle("is-visible");
    navToggle.classList.toggle("is-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
    // If the menu has just closed, remove the persistent 'is-selected' class
    // after the overlay hide transition so the selection remains visible
    // until the overlay fully disappears.
    if (!isOpen) {
      setTimeout(() => {
        overlayLinks.forEach((l) => l.classList.remove("is-selected"));
      }, 340); // slightly longer than the CSS transition (0.28s)
    }
  };

  navToggle.addEventListener("click", toggleMenu);

  overlayLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // mark this link as selected so it stays highlighted until the
      // overlay finishes closing
      overlayLinks.forEach((l) => l.classList.remove("is-selected"));
      link.classList.add("is-selected");

      if (navOverlay.classList.contains("is-visible")) {
        // small timeout so the :active state is visible on tap before we begin closing
        setTimeout(() => toggleMenu(), 40);
      }
    });
  });
}

// Smooth scroll for in-page links (non-overlay nav)
document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;
    if (!target) return;

    e.preventDefault();
    const rect = target.getBoundingClientRect();
    const offsetTop = window.pageYOffset + rect.top - 80; // slight offset for sticky nav

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  });
});

// Dynamic year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString();
}

// Load profile image - prioritize file paths (for hosting), localStorage as fallback
const heroImage = document.getElementById("profile-img");
const placeholder = document.getElementById("placeholder");
const imageInput = document.getElementById("image-input");

if (heroImage && placeholder) {
  let imageLoaded = false;

  // Try file paths first (these work when hosting the site)
  const imagePaths = [
    "assets/profile.jpg",
    "assets/profile.jpg.jpeg",
    "assets/profile.png",
    "assets/profile.JPG",
    "assets/profile.PNG",
    "profile.jpg",
    "profile.png",
  ];

  let currentPathIndex = 0;

  const tryLoadImage = () => {
    if (currentPathIndex >= imagePaths.length) {
      // All file paths failed, try localStorage as fallback (for local development)
      try {
        const savedImage = localStorage.getItem("profileImage");
        if (savedImage) {
          heroImage.src = savedImage;
          heroImage.style.display = "block";
          placeholder.style.display = "none";
          imageLoaded = true;
          console.log("✓ Image loaded from localStorage (fallback)");
          return;
        }
      } catch (err) {
        console.log("Could not load from localStorage");
      }
      
      // All methods failed, show placeholder
      heroImage.style.display = "none";
      placeholder.style.display = "flex";
      console.log("Image not found. Showing placeholder.");
      return;
    }

    heroImage.src = imagePaths[currentPathIndex];
    console.log(`Trying to load: ${imagePaths[currentPathIndex]}`);
  };

  heroImage.addEventListener("load", function() {
    // Image loaded successfully
    placeholder.style.display = "none";
    this.style.display = "block";
    imageLoaded = true;
    console.log(`✓ Image loaded successfully from: ${this.src}`);
  });

  heroImage.addEventListener("error", function() {
    // Try next path
    currentPathIndex++;
    if (currentPathIndex < imagePaths.length) {
      console.log(`✗ Failed to load: ${imagePaths[currentPathIndex - 1]}`);
      tryLoadImage();
    } else {
      tryLoadImage(); // This will now try localStorage
    }
  });

  // Start trying to load the image
  tryLoadImage();
}

// File upload handler (for re-uploading if needed)
if (imageInput && heroImage && placeholder) {
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        heroImage.src = event.target.result;
        placeholder.style.display = "none";
        heroImage.style.display = "block";
        console.log("Image loaded from file input");
        
        // Save to localStorage for persistence
        try {
          localStorage.setItem("profileImage", event.target.result);
          console.log("Image saved to localStorage");
        } catch (err) {
          console.log("Could not save to localStorage:", err);
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

