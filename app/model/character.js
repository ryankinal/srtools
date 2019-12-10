export class Character {
  id = null;
  name = '';
  looks = '';
  personality = '';
  story = '';
  type = null;

  // Used to store things that are temporarily modified
  // particularlarly condition monitors and unspent karma
  state = {
    damage: {
      physical: 9, // damaged boxes
      stun: 9 // remaining boxes
    },
    karma: 0
  };

  metatype = '';
  attributes = {
    body: 1,
    agility: 1,
    reaction: 1,
    strength: 1,
    willpower: 1,
    logic: 1,
    intuition: 1,
    charisma: 1,
    edge: 1,
    essence: 6,
    movement: 1
  };

  initiative = {
    meat: {
      value: 1,
      dice: 1
    },
    ar: {
      value: 1,
      dice: 1
    },
    coldsim: {
      value: 1,
      dice: 3
    },
    hotsim: {
      value: 1,
      dice: 4
    },
    astral: {
      value: 1,
      dice: 2
    }
  };

  limits = {
    physical: 1,
    mental: 1,
    social: 1,
    astral: 1
  };

  condition = {
    physical: 9,
    stun: 9,
    matrix: 9
  };

  combat = {
    attacks: [
    ],
    armor: 0
  };

  qualities = {
    negative: [
      { name: '', rating: 0, karma: 0 }
    ],
    positive: [
      { name: '', rating: 0, karma: 0 }
    ]
  };

  skills = {
    groups: {
      name: ''
    },
    active: {
      name: { rating: 0, specialization: '', attribute: '', group: '' }
    },
    knowledge: {
      name: { rating: 0, specialization: '', attribute: '', group: '' }
    }
  };

  gear = {
    weapons: [
      { /* stats */ }
    ],
    armor: [
      { /* stats */ }
    ],
    matrix: [
      { /* stats */ }
    ],
    vehicles: [
      { /* stats */ }
    ],
    drones: [
      { /* stats */ }
    ],
    everythingElse: [
      { /* stats */ }
    ]
  };

  progress = {
    karma: 0,
    notoriety: 0,
    streetRep: 0,
    publicAwareness: 0
  };

  constructor(params, derive) {
    if (typeof derive === 'undefined') {
      derive = true;
    }

    _.merge(this, params);

    if (derive) {
      this.calculateDerivedAttributes();
    }
  }

  calculateDerivedAttributes() {
    // calculate derived attributes
    this.initiative.meat.value = this.attributes.reaction + this.attributes.intuition;
    this.initiative.astral.value = this.attributes.intuition * 2;
    this.initiative.ar.value = this.attributes.reaction + this.attributes.intuition;
    this.initiative.coldsim.value = 4 + this.attributes.intuition;
    this.initiative.hotsim.value = 4 + this.attributes.intuition;

    this.condition.physical = 8 + Math.ceil(this.attributes.body / 2);
    this.condition.stun = 8 + Math.ceil(this.attributes.willpower / 2);
    this.condition.overflow = this.attributes.body;

    this.limits.mental = Math.ceil(((this.attributes.logic * 2) + this.attributes.intuition + this.attributes.willpower) / 3);
    this.limits.physical = Math.ceil(((this.attributes.strength * 2) + this.attributes.body + this.attributes.reaction) / 3);

    this.limits.social = Math.ceil(((this.attributes.charisma * 2) + this.attributes.willpower + this.attributes.essense) / 3);

    if (!this.state) {
      this.state = {
        condition: {
          physical: this.condition.physical,
          stun: this.condition.stun
        },
        karma: this.progress.karma
      };
    }

    if (this.gear.armor.length) {
      this.combat.armor = this.gear.armor.map(function(a) {
        return a.value || 0;
      }).reduce(function(a, b) {
        return a + b;
      });
    } else {
      this.combat.armor = 0;
    }
  }
}
