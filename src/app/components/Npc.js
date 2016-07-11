import Engine from '../Engine';

var GAME;

const MOVE_LEFT = 'left';
const MOVE_RIGHT = 'right';
const MOVE_UP = 'up';
const MOVE_DOWN = 'down';

class Npc extends Engine {
  constructor(Game, options) {
    super();
    GAME = Game;

    this.NAME = 'NPC';

    this._spriteGroup = new PIXI.Container();
    this.walkSpeed = 0.5;
    this.isMoving = false;
    this.oldIsMoving = true;
    this.animations = {
      stand: new PIXI.Container(),
      walk: new PIXI.Container()
    };
    this.activeAnimation = 'stand';
    this.facing = 0;
    this.actionQueue = [];
    this.actionInProgress = false;

    this.load();
  }

  load() {
    super.load();

    this._spriteGroup.pivot.x = 12;
    this._spriteGroup.pivot.y = 24;
    this._spriteGroup.position.z = GAME.options.maps.playerLayer;

    this.setTiledPosition({ x: 10, y: 15 });

    GAME.engine.camera.getContainer().addChild(this._spriteGroup);

    this._initAnimations(GAME.engine.charLoader.characters[0].textures);
    this.setAnimation('stand');

    this.update();
  }

  update() {
    super.update();

    if (GAME.engine.camera.objectIsVisible([this._spriteGroup.position.x, this._spriteGroup.position.y])) {
      if (this.actionQueue.length > 0 || this.actionInProgress) {
        if (typeof this.actionInProgress['action'] !== 'undefined') {
          if (this.actionInProgress['action'] === 'turn') {
            this._turn(this.actionInProgress['direction']);
          } else if (this.actionInProgress['action'] === 'move') {
            this._move(this.actionInProgress['direction']);
          }
        } else {
          this.actionInProgress = this.actionQueue[0];
          this.actionQueue.shift();
        }
      } else {
        this.setAnimation('stand');
        this.playAnimation();
      }
    }

    requestAnimationFrame(() => { this.update(); });
  }

  setAction(action, param) {
    if (typeof param === 'string') {
      this['_action' + action](param);
    } else {
      for (var i = 0; i < param.length; ++i) {
        this['_action' + action](param[i]);
      }
    }
  }

  _actionTurn(direction) {
    this.actionQueue.push({
      action: 'turn',
      direction: direction
    });
  }

  _actionMove(direction) {
    this.actionQueue.push({
      action: 'move',
      direction: direction
    });
  }

  _turn(direction) {
    if (direction === 'left') {
      this.facing = 3;
    } else if (direction === 'right') {
      this.facing = 1;
    } else if (direction === 'up') {
      this.facing = 0;
    } else if (direction === 'down') {
      this.facing = 2;
    }

    this.setAnimation('stand');
    this.playAnimation();

    this.actionInProgress = false;
  }

  _move(direction) {
    var tileSize = GAME.options.maps.tileSize;
    var pos = this._spriteGroup.position;

    switch (direction) {
      case 'left': {
        pos.x -= this.walkSpeed;
        break;
      }
      case 'right': {
        pos.x += this.walkSpeed;
        break;
      }
      case 'up': {
        pos.y -= this.walkSpeed;
        break;
      } 
      case 'down': {
        pos.y += this.walkSpeed;
        break;
      }
    }

    if (parseFloat(pos.x.toFixed(1)) % tileSize == 0 && parseFloat(pos.y.toFixed(1)) % tileSize == 0) {
      this.isMoving = false;
      this.actionInProgress = false;
    }

    if (this.oldIsMoving !== this.isMoving) {
      if (direction === 'left') {
        this.facing = 3;
      } else if (direction === 'right') {
        this.facing = 1;
      } else if (direction === 'up') {
        this.facing = 0;
      } else if (direction === 'down') {
        this.facing = 2;
      }

      this.oldIsMoving = this.isMoving;
      this.isMoving = direction;

      this.setAnimation('walk');
      this.playAnimation();
    }
  }

  getPosition() {
    return {
      x: this._spriteGroup.position.x,
      y: this._spriteGroup.position.y,
      z: this._spriteGroup.position.z
    };
  }

  setPosition(pos) {
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

export default Npc;
