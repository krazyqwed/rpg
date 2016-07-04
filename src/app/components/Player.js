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

    var p = new promise.Promise();

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
      this._spriteGroup.position.x = 48;
      this._spriteGroup.position.y = 96;
      this._spriteGroup.position.z = GAME.options.maps.playerLayer;

      GAME.engine.camera.getContainer().addChild(this._spriteGroup);

      p.done();
    });

    return p;
  }

  update() {
    super.update();

    var tileSize = GAME.options.maps.tileSize;
    var pos = this._spriteGroup.position;
    var canMove;

    switch (this.isMoving) {
      case KEY_LEFT: pos.x -= this.walkSpeed; break;
      case KEY_RIGHT: pos.x += this.walkSpeed; break;
      case KEY_UP: pos.y -= this.walkSpeed; break;
      case KEY_DOWN: pos.y += this.walkSpeed; break;
    }

    if (pos.x % tileSize === 0 && pos.y % tileSize === 0) {
      this.isMoving = false;
    }

    if (this.isMoving === false) {
      if (this.keys.left.getState()) {
        var currentPos = this.getTiledPosition();

        this.isMoving = !GAME.engine.world.isBlocking(currentPos.x, currentPos.y, KEY_LEFT) ? KEY_LEFT : false;
      }
      if (this.keys.right.getState()) {
        var currentPos = this.getTiledPosition();

        this.isMoving = !GAME.engine.world.isBlocking(currentPos.x, currentPos.y, KEY_RIGHT) ? KEY_RIGHT : false;
      }
      if (this.keys.up.getState()) {
        var currentPos = this.getTiledPosition();

        this.isMoving = !GAME.engine.world.isBlocking(currentPos.x, currentPos.y, KEY_UP) ? KEY_UP : false;
      }
      if (this.keys.down.getState()) {
        var currentPos = this.getTiledPosition();

        this.isMoving = !GAME.engine.world.isBlocking(currentPos.x, currentPos.y, KEY_DOWN) ? KEY_DOWN : false;
      }
    }
  }

  getHitbox() {
    return {
      width: this._spriteGroup.width,
      height: this._spriteGroup.height
    };
  }

  getPosition() {
    return {
      x: this._spriteGroup.position.x,
      y: this._spriteGroup.position.y,
      z: this._spriteGroup.position.z
    };
  }

  getTiledPosition() {
    return {
      x: Math.ceil(this._spriteGroup.position.x / GAME.options.maps.tileSize),
      y: Math.ceil(this._spriteGroup.position.y / GAME.options.maps.tileSize)
    };
  }

  setPosition(position) {
    this._spriteGroup.position.x = (position.x !== undefined) ? position.x : this._spriteGroup.position.x;
    this._spriteGroup.position.y = (position.y !== undefined) ? position.y : this._spriteGroup.position.y;
  }
}

export default Player;
