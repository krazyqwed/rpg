import Engine from '../Engine';
import { deepClone } from '../mixins';

var GAME;

class CharLoader extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'Character';

    this.tilemapSkeleton = 'tilemap_skeleton';

    this.layerImages = [
      'vanguard',
      'vanguard_cloth',
      'vanguard_faction1',
      'vanguard_skin',
      'vanguard_plate'
    ];

    this.layers = {};
  }

  init() {
    super.init();
  }

  load() {
    super.load();

    let p = new promise.Promise();

    this.characterLoader = new PIXI.loaders.Loader();

    this.characterLoader.add('skeleton', 'resources/charsets/' + this.tilemapSkeleton + '.json');

    for (let i in this.layerImages) {
      this.characterLoader.add(this.layerImages[i], 'resources/charsets/' + this.layerImages[i] + '.png');
    }

    this.characterLoader.load((loader, res) => {
      for (let i = 0; i < this.layerImages.length; ++i) {
        res[this.layerImages[i]].noFrame = false;

        let clone = {
          textures: {}
        };

        for (let j in res['skeleton'].textures) {
          var frame = res['skeleton'].textures[j]._frame;

          clone.textures[j] = new PIXI.Texture(res[this.layerImages[i]].texture);
          clone.textures[j].noFrame = false;
          clone.textures[j].frame = new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height);
        }

        this.layers[i] = clone;
      }

      p.done();
    });

    return p;
  }
}

export default CharLoader;
