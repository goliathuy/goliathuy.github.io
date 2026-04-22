document.addEventListener('DOMContentLoaded', function() {
  /**
   * Mai.1to components.
   */
  const _k92 = 'mario';
  const _v18 = 'tkigo' + '.com';

  // Handle CV Request Buttons (Hero and Footer)
  const cvButtons = document.querySelectorAll('.cv-request-link');
  cvButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      // Assemble on the fly
      const _full = _k92 + '@' + _v18;
      window.location.href = 'mailto:' + _full + '?subject=CV%20Request%20%E2%80%94%20Mario%20Albornoz';
    });
  });

  // Handle generic email links
  const emailLinks = document.querySelectorAll('.email-obfuscated');
  emailLinks.forEach(link => {
    // Reveal text if it was a placeholder
    if (link.textContent === 'Connect via Email') {
      link.textContent = _k92 + '@' + _v18;
    }
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'mailto:' + _k92 + '@' + _v18;
    });
  });

  /**
   * SCROLL REVEAL — keep sections visible if IO is late/missing (common on mobile WebKit).
   */
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const reveal = (el) => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px 5% 0px' }
  );

  const sections = document.querySelectorAll('section, .stats-bar');
  sections.forEach((section) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(section);
  });

  const revealInViewNow = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    sections.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.top < vh && r.bottom > 0) {
        reveal(el);
        try {
          observer.unobserve(el);
        } catch (_e) {
          /* ignore */
        }
      }
    });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(revealInViewNow);
  });
  setTimeout(revealInViewNow, 50);
  setTimeout(revealInViewNow, 300);

  setTimeout(() => {
    sections.forEach((el) => {
      if (getComputedStyle(el).opacity === '0') {
        reveal(el);
        try {
          observer.unobserve(el);
        } catch (_e) {
          /* ignore */
        }
      }
    });
  }, 2000);
});