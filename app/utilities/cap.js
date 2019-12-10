export class CAP {
  constructor(config) {
    let popup = document.createElement('div');
    popup.className = 'cap-popup cap-hide';

    let okayButton = document.createElement('button');
    okayButton.className = 'cap-button cap-okay-button';
    okayButton.innerText = 'OK';

    let cancelButton = document.createElement('button');
    cancelButton.className = 'cap-button cap-cancel-button';
    cancelButton.innerText = 'Cancel';

    let blanket = document.createElement('div');
    blanket.className = 'cap-blanket cap-hide';

    document.body.appendChild(popup);
    document.body.appendChild(blanket);

    this.popup = popup;
    this.blanket = blanket;
    this.okayButton = okayButton;
    this.cancelButton = cancelButton;
  }

  getButtons(ok, cancel) {
    let buttons = document.createElement('div');
    buttons.className = 'cap-buttons';

    let ret = {
      container: buttons
    };

    if (ok) {
      ret.ok = this.okayButton.cloneNode(true);
      buttons.appendChild(ret.ok);
    }

    if (cancel) {
      ret.cancel = this.cancelButton.cloneNode(true);
      buttons.appendChild(ret.cancel);
    }

    return ret;
  }

  hide() {
    this.blanket.classList.remove('cap-show');
    this.blanket.classList.add('cap-hide');
    this.popup.classList.remove('cap-show');
    this.popup.classList.add('cap-hide');
  }

  show() {
    this.blanket.classList.remove('cap-hide');
    this.blanket.classList.add('cap-show');
    this.popup.classList.remove('cap-hide');
    this.popup.classList.add('cap-show');
  }

  getContent(message) {
    return `<div class="cap-message">${message}</div>`;
  }

  confirm(message) {
    let self = this;

    this.popup.innerHTML = this.getContent(message);;

    let buttons = this.getButtons(true, true);
    this.popup.appendChild(buttons.container);

    this.show();

    return new Promise(function(resolve, reject) {
      buttons.ok.addEventListener('click', function () {
        resolve(true);
        self.hide();
      });
      buttons.cancel.addEventListener('click', function () {
        reject();
        self.hide();
      });
    });
  }

  alert(message) {
    this.popup.innerHTML = this.getContent(message);

    let buttons = this.getButtons(true, false);
    this.popup.appendChild(buttons.container);

    this.show();

    return new Promise(function(resolve, reject) {
      buttons.ok.addEventListener('click', function () {
        resolve(true);
        self.hide;
      });
    });
  }

  prompt(message) {
    throw('Not yet implemented');
  }
}
