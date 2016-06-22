import Engine from '../Engine';

var GAME;

class Camera extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'Camera';

    this._container;
  }

  init(container) {
    super.init();

    this._container = container;
  }

  update() {
    super.update();

    this._container.position.x = -(GAME.engine.player.getPosition().x - GAME.options.stage.width / 4) * 2;
    this._container.position.y = -(GAME.engine.player.getPosition().y - GAME.options.stage.height / 4) * 2;

    this._container.children.sort(this._depthCompare);
  }

  _depthCompare(a, b) {
    if (a.position.z < b.position.z || a.position.z === undefined) return -1;
    if (a.position.z > b.position.z || b.position.z === undefined) return 1;

    return 0;
  }

  getContainer() {
    return this._container;
  }

  getPosition() {
    return {
      x: this._container.position.x,
      y: this._container.position.y
    }
  }
}

export default Camera;
