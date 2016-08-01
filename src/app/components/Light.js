import Engine from '../Engine';
import shaders from '../shaders';

var GAME;

class LightmapFilter extends PIXI.Filter {
  constructor(sprite) {
    super(shaders['lightmap_vert'], shaders['lightmap_frag']);

    var maskMatrix = new PIXI.Matrix();
    sprite.renderable = false;

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;

    this.uniforms.mapSampler = sprite.texture;
    this.uniforms.filterMatrix = maskMatrix.toArray(true);
  }

  apply(filterManager, input, output) {
    var ratio =  (1 / output.destinationFrame.width) * (output.size.width / input.size.width);

    this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);

    filterManager.applyFilter(this, input, output);
  }

  get map() {
    return this.uniforms.mapSampler.value;
  }

  set map(value) {
    this.uniforms.mapSampler.value = value;
  }
}

PIXI.filters.LightmapFilter = LightmapFilter;

class Light extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'Light';

    this.lightLoader;
    this.lights = [
      'light_small',
      'light_fire_down_small_2',
      'light_medium',
      'light_fire_medium_yellow',
      'light_fire_down_small_yellow',
      'light_fire_down_small_yellow_2',
      'light_fire_down_small_purple_2'
    ];
    this.textures = {};

    this.maxShaderId = 0;

    this.lightmap;
    this.lightmapContainer = new PIXI.Container();
    this.lightmapFilter;
    this.lightSprites = {};
    this.renderLightmapTexture = PIXI.RenderTexture.create(GAME.options.stage.width, GAME.options.stage.height);
  }

  init() {
    super.init();

    this.lightmap = new PIXI.Sprite(this.renderLightmapTexture);
    this.lightmap.renderable = false;
  }

  load() {
    super.load();

    var p = new promise.Promise();

    this.lightLoader = new PIXI.loaders.Loader();

    for (var i in this.lights) {
      this.lightLoader.add(this.lights[i], 'resources/tilesets/' + this.lights[i] + '.png');
    }

    this.lightLoader.load((loader, res) => {
      for (var i in this.lights) {
        this.textures[this.lights[i]] = res[this.lights[i]];
      }

      GAME.engine.camera.getContainer().addChild(this.lightmap);

      p.done();
    });

    return p;
  }

  add(sprite, position, attached) {
    this.maxShaderId++;

    var id = 'sprite' + this.maxShaderId;
    var lightTexture = new PIXI.Texture(GAME.engine.light.textures[sprite].texture);
    this.lightSprites[id] = new PIXI.Sprite(lightTexture);
    this.lightSprites[id].__position = position;
    this.lightSprites[id].__attached = attached;
    this.lightSprites[id].blendMode = PIXI.BLEND_MODES.NORMAL;

    if (!attached) {
      this.lightSprites[id].x = position.x;
      this.lightSprites[id].y = position.y;
    }

    this.lightmapContainer.addChild(this.lightSprites[id]);

    if (Object.keys(this.lightSprites).length) {
      this.lightmapFilter = new PIXI.filters.LightmapFilter(this.lightmap);
      GAME.engine.camera.setShader('lightmap', this.lightmapFilter, true);
    }

    return id;
  }

  remove(id) {
    this.lightmapContainer.removeChild(this.lightSprites[id]);
    delete this.lightSprites[id];

    if (!Object.keys(this.lightSprites).length) {
      GAME.engine.camera.setShader('lightmap', null, false);
    }
  }

  update() {
    super.update();

    if (Object.keys(this.lightSprites).length) {
      this.lightmapFilter.uniforms.daylight = [0, 0, 0, 0.1];

      for (var light in this.lightSprites) {
        if (this.lightSprites[light].__attached) {
          var aX = this.lightSprites[light].__attached.x;
          var aY = this.lightSprites[light].__attached.y;
          var aW = this.lightSprites[light].__attached.width;
          var aH = this.lightSprites[light].__attached.height;

          this.lightSprites[light].x = aX - this.lightSprites[light].width / 2 + aW / 4;
          this.lightSprites[light].y = aY - this.lightSprites[light].height / 2 + aH / 4;

          if (this.lightSprites[light].__position.align) {
            if (this.lightSprites[light].__position.align.indexOf('up') > -1) {
              this.lightSprites[light].y = aY - this.lightSprites[light].height;
            }

            if (this.lightSprites[light].__position.align.indexOf('right') > -1) {
              this.lightSprites[light].x = aX + this.lightSprites[light].width + aW;
            }

            if (this.lightSprites[light].__position.align.indexOf('down') > -1) {
              this.lightSprites[light].y = aY + this.lightSprites[light].height + aH;
            }

            if (this.lightSprites[light].__position.align.indexOf('left') > -1) {
              this.lightSprites[light].x = aX - this.lightSprites[light].width;
            }
          }
        }
      }

      GAME.renderer.render(this.lightmapContainer, this.renderLightmapTexture);
    }
  }
}

export default Light;
