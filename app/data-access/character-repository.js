import { Repository } from './repository';
import { HTTP } from '../http';
import { Character } from '../model/character';

export class CharacterRepository extends Repository {
  getAll() {
    var promises = [
        this.getCharacters(),
        this.getGrunts()
      ];

     return Promise.all(promises).then(function(data) {
       return data[0].concat[data[1]];
     });
  }

  getCharacters() {
    return new Promise(function(resolve, reject) {
      let characters = localStorage.getItem('characters');

      resolve((characters) ? JSON.parse(characters) : []);
    });
  }

  getGrunts() {
    if (localStorage.getItem('grunts')) {
      return new Promise(function(resolve, reject) {
        resolve(JSON.parse(localStorage.getItem('grunts')));
      });
    } else {
      let http = new HTTP();
      return http.get('/data/grunts.json').then(function(data) {
        let grunts = JSON.parse(data).map(function(g) {
          return new Character(g);
        });

        return grunts;
      });
    }
  }

  addCharacter(name) {
    let self = this;
    let character = new Character({
      name: name
    });

    if (typeof name === 'Character') {
      character = name;
    } else if (typeof name === 'object') {
      character = new Character(name);
    }

    if (!character.id) {
      character.id = this.createUUID();
    }

    console.log(character);

    return new Promise(function(resolve, reject) {
      let characters = localStorage.getItem('characters');

      if (characters) {
        characters = JSON.parse(characters);
      } else {
        characters = [];
      }

      characters.push(self.getSaveable(character));
      localStorage.setItem('characters', JSON.stringify(characters));
      resolve(character);
    });
  }

  removeCharacter(id) {
    let characters = localStorage.getItem('characters');

    if (characters) {
      characters = JSON.parse(characters);
    } else {
      characters = [];
    }

    characters = characters.filter(function(c) {
      return c.id !== id;
    });

    localStorage.setItem('characters', JSON.stringify(characters));

    return Promise.resolve(characters);
  }
}
