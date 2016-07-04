import Engine from '../Engine';
import { objectClone } from '../mixins';
import TiledLoader from './TiledLoader';

var GAME;

class World extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'World';

    this.assetsLoaded = false;
    this.loader;
    this.tilemap = {};
    this.tileSize = GAME.options.maps.tileSize;
    this.mapSize;
    this.tiledLoader = new TiledLoader(GAME);
    this.mapLoader = new PIXI.loaders.Loader();
    this.mapTiles = [];
  }

  init() {
    super.init();
  }

  load() {
    super.load();

    var p = new promise.Promise();

    var map = 'map_1';

    this.tiledLoader.load()
    .then(() => {
      this.mapLoader.add(map, 'resources/maps/' + map + '.json');
      this.mapLoader.load((loader, res) => {
        this._buildMap(res[map].data);
        p.done();
      });
    });

    return p;
  }

  _buildMap(map) {
    var data = map.data;
    var layers = data.length;
    var mapContainer = {};

    this.mapSize = {
      width: map.width,
      height: map.height
    };

    for (var layer = 0; layer < layers; ++layer) {
      var aboveLayer = layer + GAME.options.maps.playerLayer;

      this.mapTiles[layer] = {};
      mapContainer[layer] = new PIXI.Container();
      mapContainer[aboveLayer] = new PIXI.Container();

      for (var i = 0; i < data[layer].length; ++i) {
        var tileData = data[layer][i];
        var tile;
        var x = i % map.width;
        var y = Math.floor(i / map.width) % map.height;

        if (typeof this.mapTiles[layer][x] === 'undefined') this.mapTiles[layer][x] = {};

        if (typeof tileData === 'number') {
          if (tileData === 0) {
            this.mapTiles[layer][x][y] = {
              __void: true,
              __blocking: false
            };
          } else {
            tile = this._createTile(map, i, tileData);

            if (this.tiledLoader.textures[tileData].__abovePlayer) {
              mapContainer[aboveLayer].addChild(tile);
            } else {
              mapContainer[layer].addChild(tile);
            }

            this.mapTiles[layer][x][y] = this.tiledLoader.textures[tileData];
          }
        } else {
          // TopLeft
          var tileContainer = new PIXI.Container();

          tile = this._createFragmentTile(map, i, tileData, 1);
          tileContainer.addChild(tile);

          // TopRight
          tile = this._createFragmentTile(map, i, tileData, 2, 12);
          tileContainer.addChild(tile);

          // BottomLeft
          tile = this._createFragmentTile(map, i, tileData, 3, 0, 12);
          tileContainer.addChild(tile);

          // BottomRight
          tile = this._createFragmentTile(map, i, tileData, 4, 12, 12);
          tileContainer.addChild(tile);

          if (this.tiledLoader.textures[tileData[0]].__abovePlayer) {
            mapContainer[aboveLayer].addChild(tile);
          } else {
            mapContainer[layer].addChild(tile);
          }

          this.mapTiles[layer][x][y] = this.tiledLoader.textures[tileData[0]];
        }
      }

      mapContainer[layer].position.z = parseInt(layer) + 1;
      GAME.engine.camera.getContainer().addChild(mapContainer[layer]);

      mapContainer[aboveLayer].position.z = parseInt(aboveLayer) + 1;
      GAME.engine.camera.getContainer().addChild(mapContainer[aboveLayer]);
    }
  }

  _createTile(map, i, tileData) {
    var tile;

    if (!Array.isArray(this.tiledLoader.textures[tileData])) {
      tile = new PIXI.Sprite(this.tiledLoader.textures[tileData]);
    } else {
      tile = new PIXI.extras.MovieClip(this.tiledLoader.textures[tileData]);
      tile.animationSpeed = this.tiledLoader.animationSpeed;
      tile.play();
    }

    tile.position.x = (i % map.width) * 24;
    tile.position.y = (Math.floor(i / map.width) % map.height) * 24;

    return tile;
  }

  _createFragmentTile(map, i, tileData, part, xOffset = 0, yOffset = 0) {
    var tile;

    if (!Array.isArray(this.tiledLoader.textures[tileData[0] + '_fragments'][tileData[part] * 4 + part - 1])) {
      tile = new PIXI.Sprite(this.tiledLoader.textures[tileData[0] + '_fragments'][tileData[part] * 4 + part - 1]);
    } else {
      tile = new PIXI.extras.MovieClip(this.tiledLoader.textures[tileData[0] + '_fragments'][tileData[part] * 4 + part - 1]);
      tile.animationSpeed = this.tiledLoader.animationSpeed;
      tile.play();
    }

    tile.position.x = (i % map.width) * 24 + xOffset;
    tile.position.y = (Math.floor(i / map.width) % map.height) * 24 + yOffset;

    return tile;
  }

  _getBoundaries(x, y) {
    var boundaries = ['all', 'all', 'all', 'all', 'all'];

    for (var l = 0; l < this.mapTiles.length; ++l) {
      if (typeof this.mapTiles[l][x][y].__void === 'undefined') {
        boundaries[0] = this.mapTiles[l][x][y];
      }

      if (y > 0 && typeof this.mapTiles[l][x][y - 1].__void === 'undefined') {
        boundaries[1] = this.mapTiles[l][x][y - 1];
      }

      if (x < this.mapSize.width - 1 && typeof this.mapTiles[l][x + 1][y].__void === 'undefined') {
        boundaries[2] = this.mapTiles[l][x + 1][y];
      }

      if (y < this.mapSize.height - 1 && typeof this.mapTiles[l][x][y + 1].__void === 'undefined') {
        boundaries[3] = this.mapTiles[l][x][y + 1];
      }

      if (x > 0 && typeof this.mapTiles[l][x - 1][y].__void === 'undefined') {
        boundaries[4] = this.mapTiles[l][x - 1][y];
      }
    }

    return boundaries;
  }

  isBlocking(x, y, dir) {
    var boundaries = this._getBoundaries(x, y);
    var currentBlocking = boundaries[0] !== false && boundaries[0].__blocking !== false;

    if (dir === 'up' && currentBlocking && boundaries[0].__blocking.indexOf('up') > -1) {
      return true;
    } else if (dir === 'right' && currentBlocking && boundaries[0].__blocking.indexOf('right') > -1) {
      return true;
    } else if (dir === 'down' && currentBlocking && boundaries[0].__blocking.indexOf('down') > -1) {
      return true;
    } else if (dir === 'left' && currentBlocking && boundaries[0].__blocking.indexOf('left') > -1) {
      return true;
    }

    if (dir === 'up' && (boundaries[1] === 'all' || (boundaries[1].__blocking !== false && (boundaries[1].__blocking.indexOf('down') > -1 || boundaries[1].__blocking === 'all')))) {
      return true;
    } else if (dir === 'right' && (boundaries[2] === 'all' || (boundaries[2].__blocking !== false && (boundaries[2].__blocking.indexOf('left') > -1 || boundaries[2].__blocking === 'all')))) {
      return true;
    } else if (dir === 'down' && (boundaries[3] === 'all' || (boundaries[3].__blocking !== false && (boundaries[3].__blocking.indexOf('up') > -1 || boundaries[3].__blocking === 'all')))) {
      return true;
    } else if (dir === 'left' && (boundaries[4] === 'all' || (boundaries[4].__blocking !== false && (boundaries[4].__blocking.indexOf('right') > -1 || boundaries[4].__blocking === 'all')))) {
      return true;
    }

    return false;
  }

  update() {
    super.update();
  }
}

export default World;
