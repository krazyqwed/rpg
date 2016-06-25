import Engine from '../Engine';
import Keyboard from '../Keyboard';

var GAME;

const KEY_LEFT = 'left';
const KEY_RIGHT = 'right';
const KEY_UP = 'up';
const KEY_DOWN = 'down';

class Player extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'Player';

    this._spriteGroup = new PIXI.Container();
    this.assetsLoaded = false;
    this.keys = {
      left: null,
      right: null,
      up: null,
      down: null
    }
    this.walkSpeed = 2;
    this.isMoving = false;
  }

  init(container) {
    super.init();

    this.keys[KEY_LEFT] = new Keyboard(37);
    this.keys[KEY_UP] = new Keyboard(38);
    this.keys[KEY_RIGHT] = new Keyboard(39);
    this.keys[KEY_DOWN] = new Keyboard(40);
  }

  load() {
    super.load();

    this.loader = new PIXI.loaders.Loader();
    this.loader.add('player', 'resources/charsets/tilemap_1.json');

    this.loader.load((loader, resources) => {
      var textures = resources['player'].textures;
      var body = new PIXI.Sprite(textures['body']);
      var armor = new PIXI.Sprite(textures['armor']);
      var head = new PIXI.Sprite(textures['head']);

      this._spriteGroup.addChild(body);
      this._spriteGroup.addChild(armor);
      this._spriteGroup.addChild(head);

      this._spriteGroup.pivot.x = 12;
      this._spriteGroup.pivot.y = 24;
      this._spriteGroup.position.x = GAME.options.maps.tileSize;
      this._spriteGroup.position.y = GAME.options.maps.tileSize;
      this._spriteGroup.position.z = 1.1;

      GAME.engine.camera.getContainer().addChild(this._spriteGroup);

      this.assetsLoaded = true;
    });
  }

  update() {
    super.update();

    var tileSize = GAME.options.maps.tileSize;
    var pos = this._spriteGroup.position;

    if (this.assetsLoaded) {
      var canMove = {
        KEY_LEFT: pos.x > tileSize && !GAME.engine.world.isBlocking(Math.ceil(pos.x / tileSize) - (pos.x % tileSize === 0 || pos.x / tileSize < Math.ceil(pos.x / tileSize) ? 1 : 0), Math.ceil(pos.y / tileSize), KEY_LEFT),
        KEY_RIGHT: pos.x < tileSize * (GAME.engine.world.mapSize - 2) && !GAME.engine.world.isBlocking(Math.ceil(pos.x / tileSize) + (pos.x % tileSize === 0 ? 1 : 0), Math.ceil(pos.y / tileSize), KEY_RIGHT),
        KEY_UP: pos.y > tileSize && !GAME.engine.world.isBlocking(Math.ceil(pos.x / tileSize), Math.ceil(pos.y / tileSize) - (pos.y % tileSize === 0 || pos.y / tileSize < Math.ceil(pos.y / tileSize) ? 1 : 0), KEY_UP),
        KEY_DOWN: pos.y < tileSize * (GAME.engine.world.mapSize - 2) && !GAME.engine.world.isBlocking(Math.ceil(pos.x / tileSize), Math.ceil(pos.y / tileSize) + (pos.y % tileSize === 0 ? 1 : 0), KEY_DOWN)
      }

      switch (this.isMoving) {
        case KEY_LEFT: canMove.KEY_LEFT ? pos.x -= this.walkSpeed : false; break;
        case KEY_RIGHT: canMove.KEY_RIGHT ? pos.x += this.walkSpeed : false; break;
        case KEY_UP: canMove.KEY_UP ? pos.y -= this.walkSpeed : false; break;
        case KEY_DOWN: canMove.KEY_DOWN ? pos.y += this.walkSpeed : false; break;
      }

      if (pos.x % tileSize === 0 && pos.y % tileSize === 0) {
        this.isMoving = false;
      }

      if (this.isMoving === false) {
        if (this.keys.left.getState()) {
          this.isMoving = KEY_LEFT;
        }
        if (this.keys.right.getState()) {
          this.isMoving = KEY_RIGHT;
        }
        if (this.keys.up.getState()) {
          this.isMoving = KEY_UP;
        }
        if (this.keys.down.getState()) {
          this.isMoving = KEY_DOWN;
        }
      }
    }
  }

  getHitbox() {
    return this.assetsLoaded ? {
      width: this._spriteGroup.width,
      height: this._spriteGroup.height
    } : { width: 0, height: 0 };
  }

  getPosition() {
    return this.assetsLoaded ? {
      x: this._spriteGroup.position.x,
      y: this._spriteGroup.position.y
    } : { x: 0, y: 0 };
  }

  setPosition(position) {
    this._spriteGroup.position.x = (position.x !== undefined) ? position.x : this._spriteGroup.position.x;
    this._spriteGroup.position.y = (position.y !== undefined) ? position.y : this._spriteGroup.position.y;
  }
}

export default Player;
