import Engine from '../Engine';
import shaders from '../shaders';

var GAME;

class Camera extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'Camera';

    this._container = new PIXI.Container();
    this._container.scale = { x: 2, y: 2 };
    this.shaders = {};
  }

  init() {
    super.init();
  }

  load() {
    super.load();

    var p = new promise.Promise();

    this.shaders['day_night'] = new PIXI.Filter('', shaders['day_night']);

    GAME.camera.filters = this._objectToArray(this.shaders);
    GAME.camera.filterArea = new PIXI.Rectangle(0, 0, GAME.options.stage.width, GAME.options.stage.height);

    p.done();

    return p;
  }

  update() {
    super.update();

    var playerHitbox = GAME.engine.player.getHitbox();
    var playerPos = GAME.engine.player.getPosition();
    var smallerX = false;
    var smallerY = false;

    if (GAME.engine.world.mapSize.width * GAME.options.maps.tileSize < GAME.options.stage.width) {
      this._container.position.x = parseInt((GAME.options.stage.width - GAME.engine.world.mapSize.width * GAME.options.maps.tileSize) / 2 - (GAME.engine.world.mapSize.width * GAME.options.maps.tileSize) / 2);
      smallerX = true;
    }

    if (GAME.engine.world.mapSize.height * GAME.options.maps.tileSize < GAME.options.stage.height) {
      this._container.position.y = parseInt((GAME.options.stage.height - GAME.engine.world.mapSize.height * GAME.options.maps.tileSize) / 2 - (GAME.engine.world.mapSize.height * GAME.options.maps.tileSize) / 2);
      smallerY = true;
    }

    if (!smallerX) {
      if (playerPos.x + (playerHitbox.width / 4) < GAME.options.stage.width / 4) {
        this._container.position.x = 0.1;
      } else if (playerPos.x + (playerHitbox.width / 4) > GAME.engine.world.mapSize.width * GAME.options.maps.tileSize - GAME.options.stage.width / 4) {
        this._container.position.x = -(GAME.engine.world.mapSize.width * GAME.options.maps.tileSize - GAME.options.stage.width / 2) * 2;
      } else {
        this._container.position.x = -(playerPos.x + (playerHitbox.width / 4) - GAME.options.stage.width / 4) * 2;
      }
    }

    if (!smallerX) {
      if (playerPos.y + (playerHitbox.height / 2) < GAME.options.stage.height / 4) {
        this._container.position.y = 0.1;
      } else if (playerPos.y + (playerHitbox.height / 2) > GAME.engine.world.mapSize.height * GAME.options.maps.tileSize - GAME.options.stage.height / 4) {
        this._container.position.y = -(GAME.engine.world.mapSize.height * GAME.options.maps.tileSize - GAME.options.stage.height / 2) * 2;
      } else {
        this._container.position.y = -(playerPos.y + (playerHitbox.height / 2) - GAME.options.stage.height / 4) * 2;
      }
    }

    this._container.children.sort(this._depthCompare.bind(this));
  }

  limitDraw() {
    for (var i in GAME.engine.world.mapContainer) {
      var layer = GAME.engine.world.mapContainer[i];

      for (var j = 0; j < layer.children.length; ++j) {
        var pos = {
          x: layer.children[j].x,
          y: layer.children[j].y
        };
        
        if (this.objectIsVisible(pos, 1)) {
          layer.children[j].visible = true;
        } else {
          layer.children[j].visible = false;
        }
      }
    }
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

  objectIsVisible(pos, margin) {
    if (!margin) {
      margin = 2;
    }

    if (pos[0] <= -this._container.position.x / 2 - GAME.options.maps.tileSize * margin || pos[0] >= -this._container.position.x / 2 + GAME.options.stage.width / 2 + GAME.options.maps.tileSize * margin) {
      return false;
    }

    if (pos[1] <= -this._container.position.y / 2 - GAME.options.maps.tileSize * margin || pos[1] >= -this._container.position.y / 2 + GAME.options.stage.height / 2 + GAME.options.maps.tileSize * margin) {
      return false;
    }

    return true;
  }

  setShader(shaderName, customShader, visible, uniforms, hasVertex) {
    if (visible) {
      if (!uniforms) {
        uniforms = {};
      }

      if (customShader === false) {
        this.shaders[shaderName] = new PIXI.Filter(hasVertex ? shaders[shaderName + '_vert'] : '', shaders[shaderName], uniforms);
      } else {
        this.shaders[shaderName] = customShader;
      }
    } else {
      delete this.shaders[shaderName];
    }

    GAME.camera.filters = this._objectToArray(this.shaders);
  }

  _objectToArray(object) {
    var array = [];

    for (var i in object) {
      array.push(object[i]);
    }

    return array;
  }
}

export default Camera;
