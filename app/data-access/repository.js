export class Repository {
  createUUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  getSaveable(obj, visited) {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      let self = this;
      let keys = Object.keys(obj);
      let stripped = {};
      visited = visited || [];

      keys.forEach(function(key) {
        let circular = (visited.indexOf(obj[key]) >= 0);

        if (typeof obj[key] === 'object') {
          visited.push(obj[key]);
        }

        if (obj.hasOwnProperty(key) && typeof obj[key] !== 'function' && !circular) {
          stripped[key] = self.getSaveable(obj[key], visited);
        }
      });

      return stripped;
    } else {
      return obj;
    }
  }
}
