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
    this.canMove = true;
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

    this.setTiledPosition({ x: 7, y: 9 });

    GAME.engine.camera.getContainer().addChild(this._spriteGroup);

    this._initAnimations(GAME.engine.charLoader.layers);
    this.setAnimation('stand');

    GAME.engine.light.add('light_radial', {
      position: { x: this._spriteGroup.x, y: this._spriteGroup.y, z: GAME.options.maps.playerLayer },
      scale: 3.0
    }, this._spriteGroup);

    p.done();

    return p;
  }

  update() {
    super.update();

    var tileSize = GAME.options.maps.tileSize;
    var pos = this._spriteGroup.position;

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

    if (this.isMoving && pos.x % tileSize === 0 && pos.y % tileSize === 0) {
      GAME.engine.world.checkEvent(this.getTiledPosition());
      GAME.engine.camera.limitDraw();
      this.isMoving = false;
    }

    if (!this.isMoving && this.canMove) {
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

  setPosition(pos) {
    this.isMoving = false;

    this._spriteGroup.position.x = (pos.x !== undefined) ? pos.x : this._spriteGroup.position.x;
    this._spriteGroup.position.y = (pos.y !== undefined) ? pos.y : this._spriteGroup.position.y;
  }

  getTiledPosition() {
    return {
      x: Math.ceil(this._spriteGroup.position.x / GAME.options.maps.tileSize),
      y: Math.ceil(this._spriteGroup.position.y / GAME.options.maps.tileSize)
    };
  }

  setTiledPosition(pos) {
    this.isMoving = false;

    this._spriteGroup.position.x = pos.x * GAME.options.maps.tileSize;
    this._spriteGroup.position.y = pos.y * GAME.options.maps.tileSize;
  }

  setMovementEnabled(val) {
    this.canMove = val;
  }

  _initAnimations(layers) {
    for (var dir = 0; dir < 4; ++dir) {
      var layerStand = new PIXI.Container();
      var layerWalk = new PIXI.Container();

      layerWalk.visible = false;

      for (var tex in layers) {
        var sprite;

        sprite = new PIXI.extras.MovieClip([layers[tex].textures[dir * 3 + 2]]);

        if (parseInt(tex, 10) === 2) {
          sprite.tint = 0xFF3333;
        }
        if (parseInt(tex, 10) === 3) {
          sprite.tint = 0x442211;
        }
        if (parseInt(tex, 10) === 4) {
          sprite.tint = 0x222222;
        }

        layerStand.addChild(sprite);



        sprite = new PIXI.extras.MovieClip([layers[tex].textures[dir * 3 + 1], layers[tex].textures[dir * 3 + 2], layers[tex].textures[dir * 3 + 3], layers[tex].textures[dir * 3 + 2]]);
        sprite.animationSpeed = 1 / sprite.textures.length / 2;

        if (parseInt(tex, 10) === 2) {
          sprite.tint = 0xFF3333;
        }
        if (parseInt(tex, 10) === 3) {
          sprite.tint = 0x442211;
        }
        if (parseInt(tex, 10) === 4) {
          sprite.tint = 0x222222;
        }

        layerWalk.addChild(sprite);
      }

      this.animations['stand'].addChild(layerStand);
      this.animations['walk'].addChild(layerWalk);
    }

    this._spriteGroup.addChild(this.animations['stand']);
    this._spriteGroup.addChild(this.animations['walk']);
  }

  setAnimation(key) {
    this.activeAnimation = key;

    this.resetAnimations();
  }

  resetAnimations() {
    for (var key in this.animations) {
      for (var dir = 0; dir < 4; ++dir) {
        if (key !== this.activeAnimation || dir !== this.facing) {
          this.animations[key].children[dir].visible = false;

          for (var item in this.animations[key].children[dir].children) {
            this.animations[key].children[dir].children[item].gotoAndStop(0);
          }
        }
      }
    }
  }

  playAnimation() {
    this.resetAnimations();

    this.animations[this.activeAnimation].children[this.facing].visible = true;

    for (var item in this.animations[this.activeAnimation].children[this.facing].children) {
      this.animations[this.activeAnimation].children[this.facing].children[item].play();
    }
  }

  pauseAnimation() {
    for (var item in this.animations[this.activeAnimation].children[this.facing].children) {
      this.animations[this.activeAnimation].children[this.facing].children[item].stop();
    }
  }

  stopAnimation() {
    for (var item in this.animations[this.activeAnimation].children[this.facing].children) {
      this.animations[this.activeAnimation].children[this.facing].children[item].gotoAndStop(0);
    }
  }
}

export default Player;
