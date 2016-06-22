import Engine from '../Engine';
import Keyboard from '../Keyboard';

var GAME;

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
  }

  init(container) {
    super.init();

    this.keys.left = new Keyboard(37);
    this.keys.up = new Keyboard(38);
    this.keys.right = new Keyboard(39);
    this.keys.down = new Keyboard(40);

    this.keys.up.setPressed(() => {
      this._spriteGroup.children[1].visible = !this._spriteGroup.children[1].visible;
    });

    this.keys.down.setPressed(() => {
      this._spriteGroup.children[2].visible = !this._spriteGroup.children[2].visible;
    });
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

      this._spriteGroup.position.x = 100;
      this._spriteGroup.position.y = 100;
      this._spriteGroup.position.z = 2;

      GAME.engine.camera.getContainer().addChild(this._spriteGroup);

      this.assetsLoaded = true;
    });
  }

  update() {
    super.update();

    if (this.assetsLoaded) {
      if (this.keys.left.getState()) {
        this._spriteGroup.position.x -= 1;
      }

      if (this.keys.right.getState()) {
        this._spriteGroup.position.x += 1;
      }
    }
  }

  getPosition() {
    return this.assetsLoaded ? {
      x: this._spriteGroup.position.x,
      y: this._spriteGroup.position.y
    } : { x: 0, y: 0 };
  }
}

export default Player;
