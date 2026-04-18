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
   * SCROLL REVEAL / OBSERVER
   * Adding a fade-in effect to sections as they enter the viewport
   */
  const observerOptions = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply to major sections
  const sections = document.querySelectorAll('section, .stats-bar');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(section);
  });
});