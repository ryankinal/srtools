import { Events } from '../../events';

class Carousel {
  index = 0;
  element;
  events;
  cards;
  cardsContainer;
  nextButtons;
  prevButtons;

  constructor(element) {
    let self = this;
    let maxHeight = 0;
    let xDown = null;
    let direction = null;
    let passedIndex = element.getAttribute('index') || 0;
    let swipe = element.getAttribute('swipe');

    this.element = element;
    this.events = new Events();
    this.cardsContainer = element.querySelector('[cards]');
    this.nextButtons = element.querySelectorAll('[next]');
    this.prevButtons = element.querySelectorAll('[previous]');
    this.cards = element.querySelectorAll('.card');

    if (passedIndex) {
      this.scrollToIndex(parseInt(passedIndex));
    }

    if (swipe === 'yes' || !swipe) {
      element.addEventListener('touchstart', function(e) {
        let touch = e.touches.length ? e.touches[0] : null;

        if (touch) {
          xDown = touch.clientX;
        }
      });

      element.addEventListener('touchmove', function(e) {
        if (xDown) {
          let touch = e.touches.length ? e.touches[0] : null;
          let x = touch.clientX;
          let diff = Math.abs(xDown - x);

          if (diff > 10) {
            if (x < xDown) {
              direction = 1;
            } else if (x > xDown) {
              direction = -1;
            }
          } else {
            direction = 0;
          }
        }
      });

      element.addEventListener('touchend', function(e) {
        console.log(xDown, direction, self);
        if (xDown && direction) {
          self.index = Math.min(Math.max(self.index + direction, 0), self.cards.length -1);
          self.scrollToIndex(self.index);
        }

        direction = null;
        xDown = null;
      });
    }

    this.nextButtons.forEach(function(b) {
      b.addEventListener('click', function() {
        self.next();
      });
    });

    this.prevButtons.forEach(function(b) {
      b.addEventListener('click', function() {
        self.prev();
      });
    });
  }

  next() {
    console.log(this);
    if (this.index < this.cards.length - 1) {
      this.scrollToIndex(++this.index);
      this.events.fire('carousel.next', {
        carousel: this,
        index: this.index
      });
    }
  }

  prev() {
    console.log(this);
    if (this.index > 0) {
      this.scrollToIndex(--this.index);
      this.events.fire('carousel.prev', {
        carousel: this,
        index: this.index
      });
    }
  }

  scrollToIndex(index, animate) {
    if (index >= 0 && index < this.cards.length) {
      let card = this.cards[index];
      let rect = this.cardsContainer.getBoundingClientRect();
      let left = rect.width * index;
      let activeCard = this.element.querySelector('.card.active');

      if (activeCard) {
        activeCard.classList.remove('active');
      }

      card.classList.add('active');

      this.index = index;

      if (!animate && typeof animate !== 'undefined') {
        this.cardsContainer.style.transitionProperty = 'none';
      } else {
        this.cardsContainer.style.transitionProperty = 'transform';
      }

      this.cardsContainer.style.transform = "translateX(-" + left + "px)";

      this.events.fire('carousel.to', {
        carousel: this,
        index: this.index
      });
    }
  }
}

export class CardCarousel {
  instances = [];

  applyToElement(element) {
    let instance = new Carousel(element);

    this.instances.id = instance;
  }

  apply(container) {
    let self = this;
    let carousElements = container.querySelectorAll('[card-carousel]');

    carousElements.forEach(function(el) {
      self.applyToElement(el);
    });
  }

  getInstance(element) {
    let instances = this.instances.filter(function(i) {
      return i.element === element;
    });

    if (instances.length) {
      return instances[0];
    } else {
      return null;
    }
  }
}
