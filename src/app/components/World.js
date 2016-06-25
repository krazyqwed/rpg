import Engine from '../Engine';

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
  }

  init() {
    super.init();

    
  }

  load() {
    super.load();

    this.loader = new PIXI.loaders.Loader();
    this.loader.add('map', 'resources/maps/1.json');
    this.loader.load((loader, resources) => {
      this.mapData = resources['map'].data;

      this._postLoad();
    });
  }

  _postLoad() {
    for (var layer in this.mapData.tilesets) {
      for (var set in this.mapData.tilesets[layer]) {
        this.loader.add(this.mapData.tilesets[layer][set], 'resources/tilesets/' + this.mapData.tilesets[layer][set] + '.json');
      }
    }

    this.loader.load((loader, resources) => {
      for (var layer in this.mapData.tilesets) {
        for (var set in this.mapData.tilesets[layer]) {
          this.tilemap[layer] = new PIXI.tilemap.CompositeRectTileLayer(0, [resources[this.mapData.tilesets[layer][set] + '_image'].texture], true);
          this.tilemap[layer + '.5'] = new PIXI.tilemap.CompositeRectTileLayer(0, [resources[this.mapData.tilesets[layer][set] + '_image'].texture], true);
        }

        this.tilemap[layer].position.z = layer;
        this.tilemap[layer + '.5'].position.z = layer + 0.5;

        GAME.engine.camera.getContainer().addChild(this.tilemap[layer]);
        GAME.engine.camera.getContainer().addChild(this.tilemap[layer + '.5']);
      }

      this._buildMap();
      this.assetsLoaded = true;
    });
  }

  _buildMap() {
    var resources = this.loader.resources;
    var textures = {};
    var tile;

    var map = this.mapData.map;
    this.mapSize = map.length;

    for (var layer in this.mapData.tilesets) {
      for (var set in this.mapData.tilesets[layer]) {
        textures[layer] = resources[this.mapData.tilesets[layer][set]].textures;
      }
    }

    for (var x = 1; x < this.mapSize - 1; x++) {
      for (var y = 1; y < this.mapSize - 1; y++) {
        var tile = textures[0][map[x][y][0]];

        if (typeof resources['tilemap_1'].data.frames[map[x][y][0]].fragment !== 'undefined') {
          this._buildFragments(map, x, y, textures, map[x][y][0]);
        } else {
          this.tilemap[0].addFrame(tile, x * this.tileSize, y * this.tileSize);
        }

        if (typeof map[x][y][1] !== 'undefined') {
          tile = textures[1][map[x][y][1] + '_1'];
          this.tilemap[1].addFrame(tile, x * this.tileSize, y * this.tileSize);

          tile = textures[1][map[x][y][1] + '_2'];
          this.tilemap['1.5'].addFrame(tile, x * this.tileSize, (y - 1) * this.tileSize);
        }
      }
    }
  }

  _buildFragments(map, x, y, textures, tileName) {
    var fragments = {};
    fragments[0] = textures[0][tileName + '_void'];
    fragments[1] = textures[0][tileName + '_void'];
    fragments[2] = textures[0][tileName + '_void'];
    fragments[3] = textures[0][tileName + '_void'];

    var c = map[x][y][0];
    var cT = map[x][y - 1][0];
    var cR = map[x + 1][y][0];
    var cB = map[x][y + 1][0];
    var cL = map[x - 1][y][0];
    var cTL = map[x - 1][y - 1][0];
    var cTR = map[x + 1][y - 1][0];
    var cBL = map[x - 1][y + 1][0];
    var cBR = map[x + 1][y + 1][0];

    if (cT === c) {
      if (cL === c) {
        fragments[0] = textures[0][tileName + '_enw'];

        if (cTL === c) {
          fragments[0] = textures[0][tileName + '_empty1'];
        }
      } else {
        fragments[0] = textures[0][tileName + '_w1'];
      }
      
      if (cR === c) {
        fragments[1] = textures[0][tileName + '_ene'];

        if (cTR === c) {
          fragments[1] = textures[0][tileName + '_empty2'];
        }
      } else {
        fragments[1] = textures[0][tileName + '_e1'];
      }
    } else {
      fragments[0] = textures[0][tileName + '_nw'];
      fragments[1] = textures[0][tileName + '_ne'];

      if (cL === c) {
        fragments[0] = textures[0][tileName + '_n1'];
      }
      
      if (cR === c) {
        fragments[1] = textures[0][tileName + '_n2'];
      }
    }

    if (cB === c) {
      if (cL === c) {
        fragments[2] = textures[0][tileName + '_esw'];

        if (cBL === c) {
          fragments[2] = textures[0][tileName + '_empty3'];
        }
      } else {
        fragments[2] = textures[0][tileName + '_w1'];
      }
      
      if (cR === c) {
        fragments[3] = textures[0][tileName + '_ese'];

        if (cBR === c) {
          fragments[3] = textures[0][tileName + '_empty4'];
        }
      } else {
        fragments[3] = textures[0][tileName + '_e1'];
      }
    } else {
      fragments[2] = textures[0][tileName + '_sw'];
      fragments[3] = textures[0][tileName + '_se'];

      if (cL === c) {
        fragments[2] = textures[0][tileName + '_s1'];
      }
      
      if (cR === c) {
        fragments[3] = textures[0][tileName + '_s2'];
      }
    }

    this.tilemap[0].addFrame(fragments[0], x * this.tileSize, y * this.tileSize);
    this.tilemap[0].addFrame(fragments[1], x * this.tileSize + this.tileSize / 2, y * this.tileSize);
    this.tilemap[0].addFrame(fragments[2], x * this.tileSize, y * this.tileSize + this.tileSize / 2);
    this.tilemap[0].addFrame(fragments[3], x * this.tileSize + this.tileSize / 2, y * this.tileSize + this.tileSize / 2);
  }

  isBlocking(x, y, dir) {
    var resources = this.loader.resources;

    if (typeof this.mapData.map[x][y][1] !== 'undefined' && typeof resources['tilemap_2'].data.frames[this.mapData.map[x][y][1] + '_1'].blocking !== 'undefined') {
      var blocking = resources['tilemap_2'].data.frames[this.mapData.map[x][y][1] + '_1'].blocking;
      
      if (blocking === 'all') return true;
/*
      if (blocking.indexOf('right') > -1 && dir === 'left') {
        return true;
      } else if (blocking.indexOf('left') > -1 && dir === 'right') {
        return true;
      } else if (blocking.indexOf('up') > -1 && dir === 'down') {
        return true;
      } else if (blocking.indexOf('down') > -1 && dir === 'up') {
        return true;
      }
*/

      return false;
    }

    return false;
  }

  update() {
    super.update();
  }
}

export default World;
