import { Controller } from '../controllers/controller';
import { CharacterRepository } from '../data-access/character-repository';
import { ShowHide } from '../interface-plugins/showhide/showhide';
import { Character } from '../model/character';
import { CAP } from '../utilities/cap';

export class CharacterController extends Controller {
  templateFile = 'character-manager';
  template = false;
  characters = [];
  characterRepo = null;
  data = {};

  constructor() {
    super();

    let self = this;
    this.characterRepo = new CharacterRepository();

    this.useInterfacePlugin(new ShowHide());

    this.characterRepo.getCharacters().then(function(characters) {
      self.data.characters = characters;
      self.dataChanged();
    });

    console.log(typeof new Character());
  }

  sortCharacters(characters) {
    characters.sort(function(a, b) {
      let lowerA = a.name.toLowerCase();
      let lowerB = b.name.toLowerCase();

      return lowerA.localeCompare(lowerB);
    });

    return characters;
  }

  postRender() {
    let self = this;
    let form = this.container.querySelector('.character-form');
    let saveButton = form.querySelector('button');
    let nameInput = form.querySelector('input');
    let attributeInputs = this.container.querySelectorAll('[attribute]');

    saveButton.addEventListener('click', function() {
      if (nameInput.value) {
        let config = {
          name: nameInput.value,
          attributes: {}
        };

        attributeInputs.forEach(function(i) {
          let value = (i.value && i.value !== '') ? parseInt(i.value) : 0;
          let attr = i.getAttribute('attribute');

          if (attr) {
            config.attributes[attr] = value;
          }
        });

        self.characterRepo.addCharacter(config).then(function(character) {
          self.data.characters.push(character);
          self.data.characters = self.sortCharacters(self.data.characters);
          self.dataChanged();
        });
      }
    });

    let characterElements = this.container.querySelectorAll('[character-id]');

    characterElements.forEach(function(elem) {
      let id = elem.getAttribute('character-id');

      if (id) {
        let cap = new CAP();
        let deleteButton = elem.querySelector('[delete]');

        deleteButton.addEventListener('click', function() {
          cap.confirm('Are you sure you want to delete this character?').then(function() {
            return self.characterRepo.removeCharacter(id);
          }).then(function(characters) {
            self.data.characters = self.sortCharacters(characters);
            self.dataChanged();
          });
        });
      }
    });
  }
}
