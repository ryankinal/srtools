export class HTTP {
  request(params) {
    return new Promise(function(resolve, reject) {
      let method = params.method || 'GET';
      let url = params.url;
      let data = params.data;
      let query = params.query;
      let self = this;

      let xhr = new XMLHttpRequest();

      if (data && method !== 'GET') {
        xhr.setRequestHeader('Content-type', 'application/json');
        data = JSON.stringify(data);
      }

      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
              status: this.status,
              statusText: xhr.statusText
          });
        }
      };

      xhr.onerror = function () {
        reject({
            status: this.status,
            statusText: xhr.statusText
        });
      };

      xhr.open(method, url);
      xhr.send(data ? data : undefined);
    });
  }

  get(url, query) {
    var queryString;

    if (query) {
      queryString = '?' + query.map(function(val, name) {
        return encodeURIComponent(name) + '=' + encodeURIComponent(val);
      }).join('&');
    } else {
      queryString = '';
    }

    return this.request({
      method: 'GET',
      url: url + queryString
    });
  }
}
