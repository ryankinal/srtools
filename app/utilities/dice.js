export class Dice {
  rollOne() {
    return Math.floor(Math.random() * 6);
  }

  rollPool(pool, explode) {
    let results = [];

    while (pool > 0) {
      let roll = this.rollOne();
      results.push(roll);

      while (explode && roll === 6) {
        roll = this.rollOne();
        results.push(roll);
      }

      pool--;
    }

    return results;
  }

  getHits(pool, explode) {
    let results = this.rollPool(pool, explode);

    return {
      results: results,
      hits: results.filter(function(i) {
        return (i >= 5) ? 1 : 0;
      }).reduce(function(a, b) {
        return a + b;
      })
    };
  }

  rollTotal(pool) {
    let results = [];

    while (pool > 0) {
      let roll = this.rollOne();
      results.push(roll);
      pool--;
    }

    return results.reduce(function(a, b) {
      return a + b;
    });
  }
}
