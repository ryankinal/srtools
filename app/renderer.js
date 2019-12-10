export class Renderer {
  render(template, data, container, partials) {
    if (!container) {
      let found = document.querySelector('[output]');

      if (found) {
        container = found;
      } else {
        container = document.body;
      }
    }

    data = data || {};
    partials = partials || {};

    container.innerHTML = Mustache.render(template, data, partials);

    return container;
  }
}
