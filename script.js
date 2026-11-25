const sectionLinks = document.querySelectorAll('nav a');

function markCurrentSection() {
  for (const link of sectionLinks) {
    if (link.hash === location.hash) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

window.addEventListener('hashchange', markCurrentSection);
markCurrentSection();
