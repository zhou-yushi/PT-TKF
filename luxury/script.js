// Navbar background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // small stagger when siblings reveal together
      setTimeout(() => e.target.classList.add('in'), (i % 4) * 90);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Membership form
const form = document.getElementById('memberForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const email = document.getElementById('memberEmail').value.trim();
  if (!email) return;
  note.textContent = 'Thank you. Your request has been placed on our private list.';
  note.classList.add('ok');
  form.reset();
});

// Subtle hero parallax
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y < window.innerHeight) heroBg.style.transform = `scale(1.05) translateY(${y * 0.18}px)`;
}, { passive: true });
