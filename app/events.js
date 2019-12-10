export class Events {
  verifyEvents = false;
  events = [];
  handlers = {};
  typeMap = {};
  context = null;

  constructor(context, events) {
    if (Array.isArray(events) && events.length) {
      this.verifyEvents = true;
      this.events = events;
    } else {
      this.events = [];
      this.verifyEvents = true;
      this.events.forEach(function(e) {
        this.handlers[eventType] = {};
      });
    }

    this.context = context || this;
  }

  on(eventType, handler) {
    if (this.verifyEvents && !this.events.indexOf(eventType)) {
      return false;
    } else {
      if (typeof handler === 'function') {
        let id = Math.floor(Math.random() * 100000) + (new Date().getTime());

        if (typeof this.handlers[eventType] === 'undefined') {
          this.handlers[eventType] = {};
        }

        this.handlers[eventType][id] = handler;
        this.typeMap[id] = eventType;
        return id;
      } else {
        throw('Event handler must be a function');
      }
    }
  };

  off(id) {
    if (typeMap[id]) {
      let eventType = typeMap[id];

      if (this.handlers[eventType] && this.handlers[eventType][id]) {
        delete this.handlers[eventType][id];
        delete this.typeMap[id];
        return true;
      }
    }

    return false;
  }

  fire(eventType, data) {
    let self = this;
    if (this.handlers[eventType]) {
      Object.keys(this.handlers[eventType]).forEach(function(key) {
        let handler = self.handlers[eventType][key];
        setTimeout(function() {
           handler.call(self.context, data);
        }, 1);
      });
    }
  }
};
