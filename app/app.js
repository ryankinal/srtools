import { Router } from './router.js';
import { CombatController } from './controllers/combat-controller.js';
import { CharacterController } from './controllers/character-controller.js';
import { ShowHide } from './interface-plugins/showhide/showhide.js';

(function() {
  let root = window.location.pathname;

  let addNavHandlers = function(container) {
    container.querySelectorAll('[location]').forEach(function(link) {
      let location = link.getAttribute('location');

      link.addEventListener('click', function(e) {
        router.go(location);
        e.preventDefault();
      });
    });
  };

  let currentController = null;

  let router = new Router(root, 'SR Tools', CharacterController);
  router.addRoute('/combat', 'Combat Manager', CombatController);
  router.addRoute('/characters', 'Characters', CharacterController);

  let showHide = new ShowHide();
  showHide.apply(document.body);

  router.events.on('route.executed', function(data) {
    currentController = data.controller;

    if (data.controller.container) {
      addNavHandlers(data.controller.container);
    }

    currentController.events.on('controller.postRender', function(data) {
      addNavHandlers(currentController.container);
    });
  });

  addNavHandlers(document.body);

  router.go('/characters');
})();
