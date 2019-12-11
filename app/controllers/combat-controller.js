import { Controller } from './controller.js';
import { Combat } from '../model/combat.js';
import { ShowHide } from '../interface-plugins/showhide/showhide.js';
import { CardCarousel } from '../interface-plugins/card-carousel/card-carousel.js';
import { CharacterRepository } from '../data-access/character-repository.js';
import { Dice } from '../utilities/dice.js';

export class CombatController extends Controller {
  templateFile = 'combat-manager';
  template = false;
  combat = null;
  data = null;
  characters = null;
  grunts = null;
  charactersById = {};

  constructor(templateRoot) {
    super(templateRoot);

    let self = this;
    let characterRepo = new CharacterRepository();

    this.combat = new Combat();
    this.dice = new Dice();
    this.useInterfacePlugin(new ShowHide());
    this.useInterfacePlugin(new CardCarousel());

    Promise.all([
      characterRepo.getCharacters(),
      characterRepo.getGrunts()
    ]).then(function(data) {
      let viewModel = {
        participants: {
          alphabetical: self.combat.getParticipants(self.combat.SORT_ALPHA),
          initiative: self.combat.getParticipants(self.combat.SORT_INIT)
        },
        characters: data[0],
        grunts: data[1],
        hasParticipants: false,
        round: 1,
        pass: 1,
        currentParticipant: 0
      };

      data[0].forEach(function(c) {
        self.charactersById[c.id] = c;
      });

      data[1].forEach(function(c) {
        self.charactersById[c.id] = c;
      });

      self.data = viewModel;
      self.dataChanged();
    });

    this.combat.events.on('combat.passFinished', function() {
      self.data.pass = self.combat.pass;
      self.data.round = self.combat.round;
      self.data.currentParticipant = 0;
      self.dataChanged();
    });

    this.combat.events.on('combat.roundFinished', function() {
      self.data.pass = self.combat.pass;
      self.data.round = self.combat.round;
      self.data.currentParticipant = 0;
      self.data.roundStarted = false;
      self.dataChanged();
    });

    self.combat.events.on('combat.nextParticipant', function() {
      self.data.currentParticipant = self.combat.currentIndex;
      self.dataChanged();
      return true;
    });
  }

  preRender() {

  }

  wireCharacterSelector(popup) {
    let self = this;
    let submit = popup.querySelector('[submit]');
    let characterElements = popup.querySelectorAll('[character-id]');
    let selected = [];

    let makeSelectHandler = function(characterElement) {
      let id = characterElement.getAttribute('character-id');
      let countInput = characterElement.querySelector('input[name=howMany]');

      return function(e) {
        let index = selected.indexOf(id);

        if (index >= 0) {
          selected = selected.filter(function(i) {
            return i !== id;
          });

          characterElement.classList.remove('selected');
        } else {
          let count = Math.min(Math.max(1, (countInput) ? parseInt(countInput.value) : 1), 10);

          while (count) {
            selected.push(id);
            count--;
          }

          characterElement.classList.add('selected');
        }
      };
    };

    let makeCountChangeHandler = function(characterElement, countInput) {
      let id = characterElement.getAttribute('character-id');

      return function(e) {
        if (parseInt(countInput.value) === 0) {
          selected = selected.filter(function(i) {
            return i !== id;
          });

          characterElement.classList.remove('selected');
        } else {
          let count = Math.min(Math.max(1, (countInput) ? parseInt(countInput.value) : 1), 10);
          let existing = selected.filter(function(i) {
            return i === id;
          });

          countInput.value = count;

          while (count) {
            selected.push(id);
            count--;
          }

          characterElement.classList.add('selected');
        }
      };
    };

    characterElements.forEach(function(element) {
      let countInput = element.querySelector('input[name=howMany]');
      let selectHandler = makeSelectHandler(element);

      element.addEventListener('click', selectHandler);

      if (countInput) {
        let countHandler = makeCountChangeHandler(element, countInput);
        countInput.addEventListener('change', countHandler);
        countInput.addEventListener('click', function(e) {
          e.cancelBubble = true;
          e.stopPropagation();
        });
      }
    });

    submit.addEventListener('click', function() {
      if (selected.length) {
        selected.map(function(id) {
          return self.charactersById[id];
        }).forEach(function(character) {
          self.combat.addCharacter(character);
        });

        self.data.hasParticipants = self.combat.hasParticipants;
        self.dataChanged();
      }
    });
  }

  wireParticipantsList(participantsList) {
    let self = this;
    let participantElements = participantsList.querySelectorAll('[participant-id]');

    participantElements.forEach(function(el) {
      let id = el.getAttribute('participant-id');
      let participant = self.combat.getParticipant(id);

      let initiativeInput = el.querySelector('[initiative]');
      let aliveButton = el.querySelector('[alive]');
      let detailsButton = el.querySelector('[details]');
      let rollButton = el.querySelector('[roll]');

      let initiativeChanged = function() {
        let value = initiativeInput.value.replace(/[^\d]/g, '');

        if (value && value.length) {
          participant.initiative = parseInt(value);
          self.combat.recalculateCurrentParticipant();
          self.dataChanged();
        }
      };

      if (initiativeInput) {
        initiativeInput.addEventListener('change', initiativeChanged);
        initiativeInput.addEventListener('keypress', function(e) {
          if (e.keyCode === 13) {
            initiativeChanged();
          }
        })
      }

      if (aliveButton) {
        aliveButton.addEventListener('click', function() {
          participant.alive = !participant.alive;

          if (participant.current) {
            self.combat.recalculateCurrentParticipant();
          }
          self.dataChanged();
        });
      }

      if (rollButton) {
        rollButton.addEventListener('click', function() {
          console.log(participant.character.initiative.meat);

          let pool = participant.character.initiative.meat.dice;
          let total = self.dice.rollTotal(pool);

          console.log(total);

          participant.initiative = total + participant.character.initiative.meat.value;
          self.combat.recalculateCurrentParticipant();
          self.dataChanged();
        });
      }
    });

    let nextButtons = participantsList.querySelectorAll('[next]');

    nextButtons.forEach(function(n) {
      n.addEventListener('click', function() {
        self.combat.nextParticipant();
      });
    });

    let startButton = participantsList.querySelector('[start-round]');

    if (startButton) {
      startButton.addEventListener('click', function() {
        if (self.combat.startRound()) {
          self.data.roundStarted = true;
          self.dataChanged();
        }
      });
    }
  }

  postRender() {
    let self = this;
    let popup = this.container.querySelector('#character-selector');
    let blanket = document.querySelector('.modal-blanket');

    this.wireCharacterSelector(popup);
    this.wireParticipantsList(this.container);

    if (this.data && !this.data.hasParticipants) {
      popup.classList.remove('hide');
      popup.classList.add('show');
      blanket.classList.remove('hide');
      blanket.classList.remove('show');
    }
  }

  dataChanged() {
    this.data.participants.initiative = this.combat.getParticipants(this.combat.SORT_INIT);
    this.data.participants.alphabetical = this.combat.getParticipants(this.combat.SORT_ALPHA);

    super.dataChanged();
  }
}
