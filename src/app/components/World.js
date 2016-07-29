import Engine from '../Engine';
import TiledLoader from './TiledLoader';
import Npc from './Npc';
import EventRunner from './EventRunner';
import shaders from '../shaders';

var GAME;

class World extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'World';

    this.mapCache = {};

    this.mapContainer = {};

    this.tilemap;
    this.tileSize;
    this.mapSize;
    this.tiledLoader;
    this.mapLoader;
    this.mapTiles;
    this.npcs;
    this.events;

    this.lightSprite;
  }

  init() {
    super.init();
  }

  _reset() {
    for (var i in this.mapContainer) {
      this.mapContainer[i].removeChildren();
    }

    this.tilemap = {};
    this.tileSize = GAME.options.maps.tileSize;
    this.mapSize;
    this.tiledLoader = new TiledLoader(GAME);
    this.mapLoader = new PIXI.loaders.Loader();
    this.mapTiles = [];
    this.npcs = [];
    this.events = [];
  }

  _cleanCache() {
    this.mapCache = {};
  }

  load(map, playerPosition) {
    super.load();

    this._reset();

    GAME.engine.player.setMovementEnabled(false);

    var p = new promise.Promise();

    var npcs = map + '_npcs';
    var events = map + '_events';

    this.tiledLoader.load()
    .then(() => {
      if (typeof this.mapCache[map] === 'undefined') {
        this.mapLoader.add(map, 'resources/maps/' + map + '.json');
        this.mapLoader.add(npcs, 'resources/maps/' + npcs + '.json');
        this.mapLoader.add(events, 'resources/maps/' + events + '.json');
        this.mapLoader.load((loader, res) => {
          this.mapCache[map] = {
            map: res[map],
            npcs: res[npcs],
            events: res[events]
          };

          this._afterLoad(map, playerPosition);

          p.done();
        });
      } else {
        this._afterLoad(map, playerPosition);

        p.done();
      }
    });

    return p;
  }

  _afterLoad(map, playerPosition) {
    this._buildMap(this.mapCache[map].map.data);
    this._placeNPCs(this.mapCache[map].npcs.data);
    this._placeEvents(this.mapCache[map].events.data);

    if (typeof this.mapCache[map].map.data.interior !== 'undefined' && this.mapCache[map].map.data.interior === true) {
      var lightTexture = new PIXI.Texture(GAME.engine.light.textures['light_fire_small'].texture);
      this.lightSprite = new PIXI.Sprite(lightTexture);

      this.lightSprite.position.z = 10000;
      this.lightSprite.scale = { x: 1, y: 1 };

      GAME.engine.camera.getContainer().addChild(this.lightSprite);

      GAME.camera.filters = [new PIXI.filters.LightmapFilter(this.lightSprite)];
    }

    if (playerPosition) {
      GAME.engine.player.setTiledPosition({
        x: playerPosition[0],
        y: playerPosition[1]
      });
    }

    GAME.engine.player.setMovementEnabled(true);
  }

  warp(map, pos) {
    return this.load(map, pos);
  }

  _buildMap(map) {
    var data = map.data;
    var layers = data.length;

    this.mapSize = {
      width: map.width,
      height: map.height
    };

    for (var layer = 0; layer < layers; ++layer) {
      var aboveLayer = layer + GAME.options.maps.playerLayer;

      this.mapTiles[layer] = {};
      this.mapContainer[layer] = new PIXI.Container();
      this.mapContainer[aboveLayer] = new PIXI.Container();

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

            var textureData = this.tiledLoader.textures[tileData];

            if (textureData.__abovePlayer) {
              this.mapContainer[aboveLayer].addChild(tile);
            } else {
              this.mapContainer[layer].addChild(tile);
            }

            this.mapTiles[layer][x][y] = textureData;
          }
        } else {
          var textureData = this.tiledLoader.textures[tileData[0]];

          var tileTL = this._createFragmentTile(map, i, tileData, 1);
          var tileTR = this._createFragmentTile(map, i, tileData, 2, 12);
          var tileBL = this._createFragmentTile(map, i, tileData, 3, 0, 12);
          var tileBR = this._createFragmentTile(map, i, tileData, 4, 12, 12);

          if (textureData.__abovePlayer) {
            this.mapContainer[aboveLayer].addChild(tileTL);
            this.mapContainer[aboveLayer].addChild(tileTR);
            this.mapContainer[aboveLayer].addChild(tileBL);
            this.mapContainer[aboveLayer].addChild(tileBR);
          } else {
            this.mapContainer[layer].addChild(tileTL);
            this.mapContainer[layer].addChild(tileTR);
            this.mapContainer[layer].addChild(tileBL);
            this.mapContainer[layer].addChild(tileBR);
          }

          this.mapTiles[layer][x][y] = textureData;
        }
      }

      this.mapContainer[layer].position.z = parseInt(layer) + 1;
      GAME.engine.camera.getContainer().addChild(this.mapContainer[layer]);

      this.mapContainer[aboveLayer].position.z = parseInt(aboveLayer) + 1;
      GAME.engine.camera.getContainer().addChild(this.mapContainer[aboveLayer]);
    }

    GAME.engine.camera.limitDraw();
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
    tile.visible = false;

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
    tile.visible = false;

    return tile;
  }

  _placeNPCs(npcs) {
    for (var i in npcs) {
      var options = {};
      var npc = new Npc(GAME, options);

      npc.setAction('Move', ['down', 'right', 'right', 'up', 'left', 'left', 'down', 'right', 'right', 'up', 'left', 'left', 'down', 'right', 'right', 'up', 'left', 'left', 'down', 'right', 'right', 'up', 'left', 'left', 'down', 'right', 'right', 'up', 'left', 'left', 'down', 'right', 'right', 'up', 'left', 'left', 'down', 'right', 'right', 'up', 'left', 'left', 'down', 'right', 'right', 'up', 'left', 'left', 'down', 'right', 'right', 'up', 'left', 'left']);
      npc.setAction('Turn', 'down');

      this.npcs.push(npc);
    }
  }

  _placeEvents(events) {
    for (var i in events) {
      var event = new EventRunner(GAME, events[i]);

      if (typeof events[i].position !== 'undefined') {
        this.events[events[i].position[0] + '_' + events[i].position[1]] = event;
      } else {
        this.events[i] = event;
      }
    }
  }

  _getBoundaries(x, y) {
    var boundaries = ['all', 'all', 'all', 'all', 'all'];

    for (var l in this.mapTiles) {
      var directions = [
        this.mapTiles[l][x][y],
        typeof this.mapTiles[l][x][y - 1] !== 'undefined' ? this.mapTiles[l][x][y - 1] : undefined,
        typeof this.mapTiles[l][x + 1] !== 'undefined' ? this.mapTiles[l][x + 1][y] : undefined,
        typeof this.mapTiles[l][x][y + 1] !== 'undefined' ? this.mapTiles[l][x][y + 1] : undefined,
        typeof this.mapTiles[l][x - 1] !== 'undefined' ? this.mapTiles[l][x - 1][y] : undefined
      ];

      var eq = [
        true,
        y > 0,
        x < this.mapSize.width - 1,
        y < this.mapSize.height - 1,
        x > 0
      ];

      for (var i = 0; i < directions.length; ++i) {
        if (typeof directions[i] !== 'undefined') {
          if (eq[i] && typeof directions[i].__void === 'undefined' && directions[i].__abovePlayer === false) {
            boundaries[i] = directions[i];
          } else if (!boundaries[i]['__blocking'] && directions[i].__abovePlayer === true) {
            boundaries[i] = { __blocking: false };
          }
        }
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

  checkEvent(pos) {
    if (typeof this.events[pos.x + '_' + pos.y] !== 'undefined') {
      this.events[pos.x + '_' + pos.y].run('touch');
    }
  }

  update() {
    super.update();

    if (this.lightSprite) {
      this.lightSprite.x = GAME.engine.player.getPosition().x + GAME.engine.player.getHitbox().width / 2 - this.lightSprite.width / 2;
      this.lightSprite.y = GAME.engine.player.getPosition().y + GAME.engine.player.getHitbox().height / 2 - this.lightSprite.height / 2;
    }
  }
}

export default World;
