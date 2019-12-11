import { Controller } from './controllers/controller.js';
import { Events } from './events.js';

export class Router {
  root = '/';
  previous = null;
  current = null;
  routes = { };
  events = null;

  constructor(root, rootTitle, rootController) {
    if (root) {
      this.root = root;
      this.routes[root] = {
        controller: rootController,
        title: rootTitle
      }
    } else {
      this.root = '/';
      this.routes[root] = {
        controller: new Controller(),
        title: 'Home'
      };
    }

    window.addEventListener('popstate', function(event) {
      var path = document.location.path;
      if (this.routes[path]) {
        this.routes[path].contoller.execute();
      }
    });

    this.events = new Events()
  }

  addRoute(location, title, execute) {
    let route = {
      title: title
    };

    if (typeof execute === 'string') {
      route.templateFile = execute;
    } else {
      route.controller = execute;
    }

    this.routes[location] = route;

    this.events.fire('route.added', {
      location: location,
      title: title,
      controller: route.controller
    })
  }

  go(location, data) {
    if (location !== this.current) {
      let definition = this.routes[location];

      if (definition) {
        this.previous = this.current;
        this.current = location;

        let controller = null;

        if (definition.controller) {
          controller = new (definition.controller)(root + 'app/templates/');
        } else if (definition.templateFile) {
          controller = new Controller();
          controller.templateFile = definition.templateFile;
        }

        controller.execute(data);
        history.pushState(data, location);

        this.events.fire('route.executed', {
          location: location,
          data: data,
          controller: controller
        });
      } else {
        throw('Unknown route: ' + location);
      }
    }
  }
}
