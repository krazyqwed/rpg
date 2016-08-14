import deepClone from 'clone-deep';

var GAME;

class EventRunner {
  constructor(Game, event) {
    GAME = Game;

    this.NAME = 'EventRunner';
    this.event = deepClone(event);
    this.running = false;
  }

  run(activation) {
    if (!this.running) {
      if (activation === this.event.activation) {
        this.eventQueue = this.event.events;
        this._runQueue();
        this.running = true;
      }
    }
  }

  _runQueue() {
    var queueLength = this.eventQueue.length;

    for (var i = 0; i < queueLength; ++i) {
      this._runEvent(this.eventQueue[0]);

      this.eventQueue.shift();
    }

    this.running = false;
  }

  _runEvent(event) {
    if (event.type === 'warp') {
      GAME.engine.world.warp(event.attributes.to, event.attributes.destination);
    }
  }
}

export default EventRunner;
