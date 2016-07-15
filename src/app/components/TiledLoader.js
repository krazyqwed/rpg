import Engine from '../Engine';

var GAME;

class TiledLoader extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'TiledLoader';

    this.tilemapLoader;
    this.tilesets = [
      'tilemap_1',
      'tilemap_2'
    ];
    this.textures = {};
    this.animationSpeed = 0.065;
  }

  load(func) {
    super.load();

    var p = new promise.Promise();

    this.tilemapLoader = new PIXI.loaders.Loader();

    for (var i in this.tilesets) {
      this.tilemapLoader.add(this.tilesets[i], 'resources/tilesets/' + this.tilesets[i] + '.json');
    }

    this.tilemapLoader.load((loader, res) => {
      for (var i in this.tilesets) {
        let set = res[this.tilesets[i]];

        for (var j in set.data.frames) {
          let frame = set.data.frames[j];

          this.textures[j] = PIXI.Texture.fromFrame(j);

          if (typeof frame.fragment !== 'undefined') {
            this.textures[j + '_fragments'] = [];

            for (var f = 0; f < 10; ++f) {
              var fragment = this.textures[j].clone();
              fragment.frame = new PIXI.Rectangle(fragment.frame.x, f * 12, 12, 12);
              this.textures[j + '_fragments'].push(fragment);

              fragment = this.textures[j].clone();
              fragment.frame = new PIXI.Rectangle(fragment.frame.x + 12, f * 12, 12, 12);
              this.textures[j + '_fragments'].push(fragment);
            }
          }

          if (typeof frame.animation !== 'undefined') {
            var textureArray = [];

            for (var a = 0; a < frame.animation.length; ++a) {
              var keyframe = this.textures[j].clone();
              keyframe.frame = new PIXI.Rectangle(frame.frame.x + frame.animation[a] * 24, frame.frame.y, 24, 24);
              textureArray.push(keyframe);
            };

            this.textures[j] = textureArray;

            if (typeof this.textures[j + '_fragments'] !== 'undefined') {
              for (var af = 0; af < this.textures[j + '_fragments'].length; ++af) {
                textureArray = [];

                for (var a = 0; a < frame.animation.length; ++a) {
                  var keyframe = this.textures[j + '_fragments'][af].clone();
                  keyframe.frame = new PIXI.Rectangle(frame.frame.x + frame.animation[a] * 24 + (af % 2 * 12), frame.frame.y + Math.floor(af / 2) * 12, 12, 12);
                  textureArray.push(keyframe);
                };

                this.textures[j + '_fragments'][af] = textureArray;
              }
            }
          }

          if (typeof frame.animation !== 'undefined') {
            this.textures[j].__animation = frame.animation;
          } else {
            this.textures[j].__animation = false;
          }

          if (typeof frame.abovePlayer !== 'undefined') {
            this.textures[j].__abovePlayer = frame.abovePlayer;
          } else {
            this.textures[j].__abovePlayer = false;
          }

          if (typeof frame.blocking !== 'undefined') {
            this.textures[j].__blocking = frame.blocking;
          } else {
            this.textures[j].__blocking = false;
          }
        }
      }

      p.done();
    });

    return p;
  }
}

export default TiledLoader;
