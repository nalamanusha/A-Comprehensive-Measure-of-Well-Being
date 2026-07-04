/* ===========================================================
   HDI Prediction App - Interactive Effects
   =========================================================== */

(function () {
  "use strict";

  // ====================================================================
  // 1. Three.js 3D Particle Background
  // ====================================================================
  function initParticleBackground() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particle system
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color(0x1e3c72); // primary blue
    const color2 = new THREE.Color(0x00d4ff); // accent cyan

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Spread particles in a sphere
      const radius = 15 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      // Random color between primary and accent
      const t = Math.random();
      const c = color1.clone().lerp(color2, t);
      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 20;

    // Mouse interaction for parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize handler
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Smooth mouse tracking
      targetX += (mouseX * 0.3 - targetX) * 0.02;
      targetY += (mouseY * 0.3 - targetY) * 0.02;

      particles.rotation.x += 0.0003 + targetY * 0.0001;
      particles.rotation.y += 0.0005 + targetX * 0.0001;

      renderer.render(scene, camera);
    }

    animate();
  }

  // ====================================================================
  // 2. Card 3D Tilt Effect
  // ====================================================================
  function initCardTilt() {
    const cards = document.querySelectorAll(".glass-card");

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateZ(10px)
        `;

        // Dynamic shadow follows mouse
        const shadowX = ((x - centerX) / centerX) * 20;
        const shadowY = ((y - centerY) / centerY) * 20;
        card.style.boxShadow = `
          ${shadowX}px ${shadowY}px 40px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = `
          perspective(1000px)
          rotateX(0deg)
          rotateY(0deg)
          translateZ(0)
        `;
        card.style.boxShadow = `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `;
      });
    });
  }

  // ====================================================================
  // 3. Button Ripple Effect
  // ====================================================================
  function initButtonRipples() {
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        const ripple = document.createElement("span");
        ripple.classList.add("ripple");

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  // ====================================================================
  // 4. Scroll-Triggered Animations (Intersection Observer)
  // ====================================================================
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
      ".glass-card, .tier-badge, .summary, .summary-row"
    );

    if (!("IntersectionObserver" in window)) {
      // Fallback: just show everything
      animatedElements.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = "running";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach((el) => {
      // Pause animations until visible
      el.style.animationPlayState = "paused";
      observer.observe(el);
    });
  }

  // ====================================================================
  // 5. Animated Number Counter
  // ====================================================================
  function initScoreCounter() {
    const counterEl = document.getElementById("score-counter");
    if (!counterEl) return;

    const target = parseFloat(counterEl.dataset.target);
    const duration = 1500; // ms
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = target * easedProgress;
      counterEl.textContent = current.toFixed(3);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counterEl.textContent = target.toFixed(3);
      }
    }

    // Start animation when element is visible
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              requestAnimationFrame(update);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(counterEl);
    } else {
      requestAnimationFrame(update);
    }
  }

  // ====================================================================
  // 6. Form Input Floating Label Enhancement
  // ====================================================================
  function initInputEffects() {
    const inputs = document.querySelectorAll("input[type='number']");

    inputs.forEach((input) => {
      // Add focus class to parent on focus
      input.addEventListener("focus", () => {
        input.closest(".form-group")?.classList.add("focused");
      });

      input.addEventListener("blur", () => {
        input.closest(".form-group")?.classList.remove("focused");
      });
    });
  }

  // ====================================================================
  // 7. Initialize Everything on DOM Ready
  // ====================================================================
  function init() {
    // Check if Three.js is loaded
    if (typeof THREE !== "undefined") {
      initParticleBackground();
    }

    initCardTilt();
    initButtonRipples();
    initScrollAnimations();
    initScoreCounter();
    initInputEffects();
  }

  // Wait for DOM + Three.js (if used)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
