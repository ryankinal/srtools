export class ShowHide {
  addShow(target) {
    target.classList.add('show');
    target.classList.remove('hide');
  }

  removeShow(target) {
    target.classList.remove('show');
    target.classList.add('hide');
  }

  toggleShow(target) {
    if (target.classList.contains('show')) {
      this.removeShow(target);
    } else {
      this.addShow(target);
    }
  }

  applyToElement(container, element, attribute) {
    let self = this;
    let targetSelector = element.getAttribute(attribute);
    let targets = document.querySelectorAll(targetSelector);

    if (attribute === 'showhide') {
      element.addEventListener('click', function(e) {
        targets.forEach(function(target) {
          self.toggleShow(target);
        });
      });
    } else if (attribute === 'hide') {
      element.addEventListener('click', function(e) {
        targets.forEach(function(target) {
          self.removeShow(target);
        });
      });
    } else if (attribute === 'show') {
      element.addEventListener('click', function(e) {
        targets.forEach(function(target) {
          self.addShow(target);
        });
      });
    }
  }

  apply(container) {
    let self = this;
    let toggleElements = container.querySelectorAll('[showhide]');
    let hideElements = container.querySelectorAll('[hide]');
    let showElements = container.querySelectorAll('[show]');

    toggleElements.forEach(function(element) {
      self.applyToElement(container, element, 'showhide');
    });

    hideElements.forEach(function(element) {
      self.applyToElement(container, element, 'hide');
    });

    showElements.forEach(function(element) {
      self.applyToElement(container, element, 'show');
    });
  }
}
