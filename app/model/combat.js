import { CombatParticipant } from './combat-participant';
import { Events } from '../events';

export class Combat {
  participants = [];
  currentParticipant = null;
  currentIndex = 0;
  round = 1;
  pass = 1;
  SORT_ALPHA = 0;
  SORT_INIT = 1;
  events = null;
  roundStarted = false;

  get hasParticipants() {
    return this.participants.length > 0;
  }

  constructor(characters) {
    var self = this;

    if (characters) {
      characters.forEach(function(c) {
        self.addCharacter(c);
      });
    }

    this.events = new Events();
  }

  sortByInitiative(a, b) {
    if (a.active === b.active) {
      return b.initiative - a.initiative;
    } else {
      return b.active - a.active;
    }
  }

  sortByName(a, b) {
    let lowerA = a.character.name.toLowerCase();
    let lowerB = b.character.name.toLowerCase();
    return lowerA.localeCompare(lowerB);
  }

  addCharacter(character) {
    let participant = new CombatParticipant(character);
    participant.pass = this.pass;
    participant.round = this.round;

    this.participants.push(participant);

    this.events.fire('combat.participantAdded', {
      combat: this,
      participant: participant
    });
  }

  nextParticipant() {
    let round = this.round;

    if (this.currentParticipant) {
      this.currentParticipant.passed = true;
    }

    if (this.recalculateCurrentParticipant()) {
      this.events.fire('combat.nextParticipant', {
        combat: this,
        participant: this.currentParticipant
      });
    } else {
      this.finishPass();

      if (this.round === round) {
        this.nextParticipant();
      }
    }
  }

  recalculateCurrentParticipant() {
    let self = this;
    let round = this.round;
    let participants = this.participants;
    let firstIndex = null;

    participants.sort(this.sortByInitiative);

    participants = participants.filter(function(p, i) {
      if (!p.passed && p.active && p.pass === self.pass && p.round === self.round) {
        if (firstIndex === null) {
          firstIndex = i;
        }

        return true;
      } else {
        return false;
      }
    });

    if (this.currentParticipant) {
      this.currentParticipant.current = false;
    }

    if (participants.length > 0) {
      this.currentParticipant = participants[0];
      this.currentParticipant.current = true;
    } else {
      this.currentParticipant = null;
    }

    return this.currentParticipant;
  }

  startRound() {
    let above0 = this.participants.filter(function(p) {
      return p.initiative > 0;
    });

    if (above0.length > 0) {
      this.roundStarted = true;
      this.recalculateCurrentParticipant();
      return true;
    } else {
      return false;
    }
  }

  finishRound() {
    let self = this;
    this.round++;
    this.pass = 1;
    this.roundStarted = false;
    this.currentParticipant = null;
    this.currentIndex = null;

    this.participants.forEach(function(p) {
      p.initiative = 0;
      p.round = self.round;
      p.pass = self.pass;
    });

    this.events.fire('combat.roundFinished', {
       combat: this,
       round: this.round - 1
    });
  }

  finishPass() {
    let self = this;
    let above0 = false;

    this.currentParticipant = null;
    this.pass++;
    this.participants.forEach(function(p) {
      p.pass = self.pass;
      p.initiative -= 10;
      p.initiative = Math.max(p.initiative, 0);
      p.passed = false;

      if (p.initiative > 0) {
        above0 = true;
      }
    });

    this.events.fire('combat.passFinished', {
      combat: this,
      pass: this.pass - 1
    })

    if (!above0) {
      this.finishRound();
    }
  }

  getParticipants(sort) {
    let clone = _.cloneDeep(this.participants);

    sort = sort || this.SORT_ALPHA;

    switch (sort) {
      case this.SORT_ALPHA:
        clone.sort(this.sortByName);
        break;
      case this.SORT_INIT:
        clone.sort(this.sortByInitiative);
    }

    return clone;
  }

  getParticipant(id) {
    let participants = this.participants.filter(function(p) {
      return p.id === id;
    });

    return participants.length ? participants[0] : false;
  }
}
