import { Renderer } from '../renderer.js';
import { HTTP } from '../http.js';
import { Events } from '../events.js';

export class Controller {
  template = 'Default controller';
  partials = {};
  data = {};
  container = null;
  partialFiles = [];
  templateFile = false;
  loadingPartials = false;
  loadingTemplate = false;
  partialsLoaded = false;
  templateLoaded = false;
  interfacePlugins = [];
  events = null;

  constructor(templateRoot) {
    this.templateRoot = templateRoot || '/app/templates/';
    this.events = new Events();
  }

  async getTemplate() {
    var success = false,
      self = this;

    if (this.templateFile && !this.template) {
      return this.getTemplateFromFile(this.templateFile + '.html').then(function(data) {
        self.template = data;
      }, function() {
        self.template = 'Could not find template ' + self.templateFile;
      });
    }

    return this.template;
  }

  async getPartials() {
    var self = this;
    if (Object.keys(this.partials) == this.partialFiles) {
      return this.partials;
    } else {

      var promises = this.partialFiles.map(function(name) {
        return self.getTemplateFromFile(name + '.html').then(function(template) {
          self.partials[name] = template;
        }, function() {
          self.partials[name] = 'Could not find template ' + name;
        });
      });

      return Promise.all(promises);
    }
  }

  async execute() {
    let template = await this.getTemplate();
    let partials = await this.getPartials();

    this.events.fire('controller.preRender', {
      controller: this,
      template: template,
      partials: partials
    });

    this.preRender();

    this.events.fire('controller.render', {
      controller: this,
      template: template,
      partials: partials
    })

    var renderer = new Renderer();
    this.container = renderer.render(this.template, this.data, this.container, this.partials);

    this.events.fire('controller.postRender', {
      controller: this,
      template: template,
      partials: partials
    });

    this.postRender();
    this.applyInterfacePlugins();

    this.events.fire('controller.executed');
  }

  preRender() {

  }

  postRender() {

  }

  dataChanged() {
    let self = this;
    setTimeout(function () {
      self.execute()
    }, 1);
  }

  applyInterfacePlugins() {
    let self = this;
    this.interfacePlugins.forEach(function(plugin) {
      if (typeof plugin.apply === 'function') {
        plugin.apply(self.container);
      }
    });
  }

  useInterfacePlugin(plugin) {
    this.interfacePlugins.push(plugin);
  }

  async getTemplateFromFile(file) {
    if (window.templateCache && window.templateCache[file]) {
      return window.templateCache[file];
    } else {
      let http =  new HTTP();
      return http.get(this.templateRoot + file);
    }
  }

  getFormValues(container) {
    container = container || this.container;

    let elements = container.querySelectorAll('input, textarea, select');
    let values = {};

    elements.forEach(function(element) {
      let name = element.name;
      let value = element.value;

      if (typeof values[name] === 'undefined') {
        values[name] = value;
      } else if (Array.isArray(values[name])) {
        values[name].push(value);
      } else {
        values[name] = [values[name], value];
      }
    });

    return values;
  }
}
