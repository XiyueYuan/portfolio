const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('show');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Hero section scroll zoom effect
const heroSection = document.querySelector('#hello');
const heroInner = document.querySelector('.hero-inner');

function updateHeroZoom() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  
  // Only apply zoom effect when we're in the hero section
  if (scrollY < windowHeight) {
    const progress = scrollY / windowHeight;
    const scale = 1 + progress * 0.3; // Zoom in by 30% max
    const opacity = 1 - progress * 0.5; // Fade out as we scroll
    
    heroSection.style.transform = `scale(${scale})`;
    heroInner.style.opacity = opacity;
    heroInner.style.transform = `translateY(${scrollY * 0.2}px)`; // Parallax effect
  }
}

window.addEventListener('scroll', updateHeroZoom);
window.addEventListener('resize', updateHeroZoom);

// About Me section scroll reveal animation
const aboutPoints = document.querySelectorAll('.reveal-point');
const aboutObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

aboutPoints.forEach(point => aboutObserver.observe(point));

// Dynamic star field animation
function createStarField() {
  const starsContainer = document.querySelector('.stars');
  if (!starsContainer) return;

  // Clear existing stars
  starsContainer.innerHTML = '';

  // Create static stars
  for (let i = 0; i < 150; i++) {
    const star = document.createElement('div');
    star.className = 'star small';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    starsContainer.appendChild(star);
  }

  // Create medium stars
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star medium';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    starsContainer.appendChild(star);
  }

  // Create large stars
  for (let i = 0; i < 20; i++) {
    const star = document.createElement('div');
    star.className = 'star large';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    starsContainer.appendChild(star);
  }

  // Create colored stars
  for (let i = 0; i < 15; i++) {
    const star = document.createElement('div');
    star.className = Math.random() > 0.5 ? 'star purple' : 'star cyan';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 3 + 3) + 's';
    starsContainer.appendChild(star);
  }

  // Create shooting stars
  function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.left = Math.random() * 100 + '%';
    shootingStar.style.top = Math.random() * 50 + '%';
    shootingStar.style.transform = `rotate(${Math.random() * 45 + 15}deg)`;
    shootingStar.style.animationDuration = (Math.random() * 2 + 3) + 's';
    starsContainer.appendChild(shootingStar);

    // Remove after animation
    setTimeout(() => {
      if (shootingStar.parentNode) {
        shootingStar.parentNode.removeChild(shootingStar);
      }
    }, 5000);
  }

  // Create shooting stars periodically
  setInterval(createShootingStar, 8000);
  
  // Create initial shooting star
  setTimeout(createShootingStar, 2000);
}

// Initialize star field
createStarField();

const form = document.getElementById('guestbook-form');
const statusEl = document.getElementById('form-status');
if (form) {
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    statusEl.textContent = 'Submitting...';
    const fd = new FormData(form);
    const payload = { name: fd.get('name'), message: fd.get('message') };
    try {
      const res = await fetch('http://localhost:5050/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Network error');
      statusEl.textContent = 'Received. Thank you for your message!';
      form.reset();
    } catch (e) {
      statusEl.textContent = 'Submission failed, please try again later';
    }
  });
}