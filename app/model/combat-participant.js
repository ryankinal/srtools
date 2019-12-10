import { Character } from './character';
import { Repository } from '../data-access/repository';

export class CombatParticipant {
  id = '';
  name = '';
  initiative = 0;
  alive = true;
  notes = [];
  character = null;
  pass = 1;
  round = 1;
  passed = false;
  current = false;

  get active() {
    return this.initiative > 0 && this.alive;
  }

  constructor(character) {
    let repo = new Repository();

    this.id = repo.createUUID();
    this.character = character;
    this.name = this.character.name;
  }
}
