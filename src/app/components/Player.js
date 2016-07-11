import Engine from '../Engine';
import Keyboard from '../Keyboard';
import { addStatePlayer } from '../mixins';

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
    this.animations = {
      stand: new PIXI.Container(),
      walk: new PIXI.Container()
    };
    this.activeAnimation = 'stand';
    this.facing = 2;
  }

  init() {
    super.init();

    this.keys[KEY_LEFT] = new Keyboard(37);
    this.keys[KEY_UP] = new Keyboard(38);
    this.keys[KEY_RIGHT] = new Keyboard(39);
    this.keys[KEY_DOWN] = new Keyboard(40);
  }

  load() {
    super.load();

    var p = new promise.Promise();

    this._spriteGroup.pivot.x = 12;
    this._spriteGroup.pivot.y = 24;
    this._spriteGroup.position.z = GAME.options.maps.playerLayer;

    this.setTiledPosition({ x: 30, y: 90 });

    GAME.engine.camera.getContainer().addChild(this._spriteGroup);

    this._initAnimations(GAME.engine.charLoader.characters[0].textures);
    this.setAnimation('stand');

    p.done();

    return p;
  }

  update() {
    super.update();

    var tileSize = GAME.options.maps.tileSize;
    var pos = this._spriteGroup.position;
    var canMove;

    switch (this.isMoving) {
      case KEY_LEFT: {
        pos.x -= this.walkSpeed;
        break;
      }
      case KEY_RIGHT: {
        pos.x += this.walkSpeed;
        break;
      }
      case KEY_UP: {
        pos.y -= this.walkSpeed;
        break;
      } 
      case KEY_DOWN: {
        pos.y += this.walkSpeed;
        break;
      }
    }

    if (pos.x % tileSize === 0 && pos.y % tileSize === 0) {
      this.isMoving = false;
    }

    if (this.isMoving === false) {
      var currentPos;
      var isArrowPress = this.keys.left.getState() || this.keys.right.getState() || this.keys.up.getState() || this.keys.down.getState();

      if (isArrowPress) {
        currentPos = this.getTiledPosition();
        this.setAnimation('walk');
      }

      if (this.keys.left.getState()) {
        this.isMoving = !GAME.engine.world.isBlocking(currentPos.x, currentPos.y, KEY_LEFT) ? KEY_LEFT : false;
        this.facing = 3;
      }
      if (this.keys.right.getState()) {
        this.isMoving = !GAME.engine.world.isBlocking(currentPos.x, currentPos.y, KEY_RIGHT) ? KEY_RIGHT : false;
        this.facing = 1;
      }
      if (this.keys.up.getState()) {
        this.isMoving = !GAME.engine.world.isBlocking(currentPos.x, currentPos.y, KEY_UP) ? KEY_UP : false;
        this.facing = 0;
      }
      if (this.keys.down.getState()) {
        this.isMoving = !GAME.engine.world.isBlocking(currentPos.x, currentPos.y, KEY_DOWN) ? KEY_DOWN : false;
        this.facing = 2;
      }

      if (!this.isMoving && this.activeAnimation !== 'stand') {
        this.setAnimation('stand');
      }

      this.playAnimation();
    }
  }

  getHitbox() {
    return {
      width: 48,
      height: 48
    };
  }

  getPosition() {
    return {
      x: this._spriteGroup.position.x,
      y: this._spriteGroup.position.y,
      z: this._spriteGroup.position.z
    };
  }

  setPosition(position) {
    this._spriteGroup.position.x = (position.x !== undefined) ? position.x : this._spriteGroup.position.x;
    this._spriteGroup.position.y = (position.y !== undefined) ? position.y : this._spriteGroup.position.y;
  }

  getTiledPosition() {
    return {
      x: Math.ceil(this._spriteGroup.position.x / GAME.options.maps.tileSize),
      y: Math.ceil(this._spriteGroup.position.y / GAME.options.maps.tileSize)
    };
  }

  setTiledPosition(pos) {
    this._spriteGroup.position.x = pos.x * GAME.options.maps.tileSize;
    this._spriteGroup.position.y = pos.y * GAME.options.maps.tileSize;
  }

  _initAnimations(tex) {
    var sprite;

    for (var i = 0; i < 4; ++i) {
      sprite = new PIXI.extras.MovieClip([tex[i * 3 + 2]]);
      this.animations['stand'].addChild(sprite);

      sprite = new PIXI.extras.MovieClip([tex[i * 3 + 1], tex[i * 3 + 2], tex[i * 3 + 3], tex[i * 3 + 2]]);
      sprite.animationSpeed = 1 / sprite.textures.length / 2;
      sprite.visible = false;
      this.animations['walk'].addChild(sprite);
    }

    this._spriteGroup.addChild(this.animations['stand']);
    this._spriteGroup.addChild(this.animations['walk']);
  }

  setAnimation(key) {
    this.activeAnimation = key;

    this.resetAnimations();
  }

  resetAnimations() {
    for (var i in this.animations) {
      for (var j = 0; j < 4; ++j) {
        if (i !== this.activeAnimation || j !== this.facing) {
          this.animations[i].children[j].visible = false;
          this.animations[i].children[j].gotoAndStop(0);
        }
      }
    }
  }

  playAnimation() {
    this.resetAnimations();

    this.animations[this.activeAnimation].children[this.facing].visible = true;
    this.animations[this.activeAnimation].children[this.facing].play();
  }

  pauseAnimation() {
    this.animations[this.activeAnimation].children[this.facing].stop();
  }

  stopAnimation() {
    this.animations[this.activeAnimation].children[this.facing].gotoAndStop(0);
  }
}

export default Player;
