import Engine from '../Engine';

var GAME;

class CharLoader extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'Character';

    this.charsets = [
      'tilemap_1'
    ];
    this.characters = {};
  }

  init() {
    super.init();
  }

  load() {
    super.load();

    var p = new promise.Promise();

    this.characterLoader = new PIXI.loaders.Loader();

    for (var i in this.charsets) {
      this.characterLoader.add(this.charsets[i], 'resources/charsets/' + this.charsets[i] + '.json');
    }

    this.characterLoader.load((loader, res) => {
      for (var i in this.charsets) {
        this.characters[i] = res[this.charsets[i]];
      }

      p.done();
    });

    return p;
  }
}

export default CharLoader;
