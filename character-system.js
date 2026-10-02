'use strict';
(() => {
  const seen = new WeakSet();
  const reveal = section => {
    section?.querySelectorAll('.site-character').forEach(character => {
      if (seen.has(character)) return;
      seen.add(character);
      character.classList.add('character-entered');
    });
  };
  // Observe the established section lifecycle without changing its navigation.
  document.addEventListener('section-reveal', event => reveal(event.detail?.section));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, {threshold: .12});
  document.querySelectorAll('main > section').forEach(section => observer.observe(section));
  const scene = document.querySelector('.character-workbench');
  const screen = scene?.querySelector('use');
  const icons = {build:'web', connect:'plug', debug:'bug', test:'model', map:'map', experiment:'terminal', create:'camera'};
  const buttons = [...document.querySelectorAll('.bench-object')];
  const update = () => {
    const active = buttons.find(button => button.getAttribute('aria-expanded') === 'true');
    const icon = icons[active?.dataset.cap];
    if (!scene || !screen) return;
    if (!icon) { delete scene.dataset.screen; return; }
    screen.setAttribute('href', '#icon-' + icon);
    scene.dataset.screen = active.dataset.cap;
  };
  const controls = new MutationObserver(update);
  buttons.forEach(button => controls.observe(button, {attributes:true, attributeFilter:['aria-expanded']}));
  update();
})();
