import Engine from '../Engine';
import { selectiveColor as shader } from '../shaders';

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

  load() {
    super.load();

    var uniforms = {
      customUniform: { type: '1f', value: 0.5 }
    };

    var customShader = new PIXI.Filter('', shader, uniforms);
    GAME.camera.filters = [customShader];
  }

  update() {
    super.update();

    var playerHitbox = GAME.engine.player.getHitbox();
    var playerPos = GAME.engine.player.getPosition();

    if (playerPos.x + (playerHitbox.width / 4) < GAME.options.stage.width / 4) {
      this._container.position.x = 0;
    } else if (playerPos.x + (playerHitbox.width / 4) > GAME.engine.world.mapSize.width * GAME.options.maps.tileSize - GAME.options.stage.width / 4) {
      this._container.position.x = -(GAME.engine.world.mapSize.width * GAME.options.maps.tileSize - GAME.options.stage.width / 2) * 2;
    } else {
      this._container.position.x = -(playerPos.x + (playerHitbox.width / 4) - GAME.options.stage.width / 4) * 2;
    }

    if (playerPos.y + (playerHitbox.height / 2) < GAME.options.stage.height / 4) {
      this._container.position.y = 0;
    } else if (playerPos.y + (playerHitbox.height / 2) > GAME.engine.world.mapSize.height * GAME.options.maps.tileSize - GAME.options.stage.height / 4) {
      this._container.position.y = -(GAME.engine.world.mapSize.height * GAME.options.maps.tileSize - GAME.options.stage.height / 2) * 2;
    } else {
      this._container.position.y = -(playerPos.y + (playerHitbox.height / 2) - GAME.options.stage.height / 4) * 2;
    }

    this._container.children.sort(this._depthCompare.bind(this));
  }

  _depthCompare(a, b) {
    var az = a.position.z;
    var bz = b.position.z;

    if (az === undefined) return -1;
    if (bz === undefined) return 1;
    if (az < bz) return -1;
    if (az > bz) return 1;

    var ay = a.position.y;
    var by = b.position.y;

    if (ay < by) return -1;
    if (ay > by) return 1;

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
