import Engine from '../Engine';

var GAME;

class World extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'World';

    this.assetsLoaded = false;
    this.loader;
    this.tilemap;
    this.tileSize = 48;

    this.chunks = [];
    this.activeChunk = [0, 0];
  }

  init() {
    super.init();

    for (var x = -1; x <= 1; x++) {
      this.chunks[x] = [];

      for (var y = -1; y <= 1; y++) {
        this.chunks[x][y] = this._generateChunk();
      }
    }
  }

  _generateChunk() {
    var blocks = [];

    for (var x = 0; x < GAME.options.chunks.width; x++) {
      blocks[x] = [];

      for (var y = 0; y < GAME.options.chunks.height; y++) {
        blocks[x][y] = Math.round(Math.random());
      }
    }

    return blocks;
  }

  load() {
    super.load();

    this.loader = new PIXI.loaders.Loader();
    this.loader.add('atlas', 'resources/tilesets/tilemap_1.json');
    this.loader.load((loader, resources) => {
      this.tilemap = new PIXI.tilemap.CompositeRectTileLayer(0, [resources['atlas_image'].texture], true);
      GAME.engine.camera.getContainer().addChild(this.tilemap);

      this._postLoad();
      this.assetsLoaded = true;
    });
  }

  _postLoad() {
    this.tilemap.clear();

    for (var x = this.activeChunk[0] - 1; x <= this.activeChunk[0] + 1; x++) {
      for (var y = this.activeChunk[1] - 1; y <= this.activeChunk[1] + 1; y++) {
        this._renderChunk(this.chunks[x][y], x, y);
      }
    }
  }

  _renderChunk(chunk, chunkX, chunkY) {
    var resources = this.loader.resources;
    var textures = resources.atlas.textures;

    for (var x = 0; x < GAME.options.chunks.width; x++) {
      for (var y = 0; y < GAME.options.chunks.height; y++) {
        var tile = chunk[x][y] ? textures.grass : textures.dirt;

        this.tilemap.addFrame(tile, (x * this.tileSize) + (chunkX * GAME.options.chunks.width * this.tileSize), (y * this.tileSize) + (chunkY * GAME.options.chunks.height * this.tileSize));
      }
    }
  }

  update() {
    super.update();

    if (this.assetsLoaded) {
      var camPosition = GAME.engine.camera.getPosition();

      if (camPosition.x > this.activeChunk[0] * GAME.options.chunks.width * this.tileSize) {
        //this.activeChunk[0]++;
      }
    }
  }
}

export default World;
