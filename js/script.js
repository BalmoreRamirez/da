const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.filter-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.filter-button.active').classList.remove('active');
    button.classList.add('active');
    const filter = button.dataset.filter;

    document.querySelectorAll('.portfolio-item').forEach((item) => {
      const visible = filter === 'all' || item.dataset.category === filter;
      item.hidden = !visible;
    });
  });
});

const quoteForm = document.querySelector('.quote-form');
const formStatus = document.querySelector('.form-status');

quoteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.textContent = 'Gracias. Recibimos tu solicitud y te contactaremos pronto.';
  quoteForm.reset();
});
