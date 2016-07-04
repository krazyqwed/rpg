import World from './components/World';
import Player from './components/Player';
import Camera from './components/Camera';
import options from './options';

const OPTIONS = options;

class Game {
  constructor() {
    this.options = OPTIONS;

    this.engine = {};

    this.stage;
    this.renderer;
    this.loader;
    this.world;
    this.camera = new PIXI.Container();
    this.stats;

    this.engine.world = new World(this);
    this.engine.player = new Player(this);
    this.engine.camera = new Camera(this);

    this.init();
  }

  init() {
    this.engine.world.init();
    this.engine.player.init();
    this.engine.camera.init(new PIXI.Container());
    this.engine.camera.getContainer().scale = {x: 2, y: 2 };
    this.camera.addChild(this.engine.camera.getContainer());

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
    this.renderer = new PIXI.WebGLRenderer(this.options.stage.width, this.options.stage.height, { antialias: false, transparent: false, resolution: 1 });
    
    this.camera.width = this.options.stage.width;
    this.camera.height = this.options.stage.height;

    console.log(this.camera);

    this.stats = new Stats();
    this.stats.setMode(0);
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';

    document.body.appendChild(this.renderer.view);
    document.body.appendChild(this.stats.domElement);

    this.load();
  }

  load() {
    this.engine.camera.load();
    this.engine.world.load()
    .then(() => this.engine.player.load())
    .then(() => this.update());
  }

  update() {
    this.stats.begin();

    this.engine.world.update();
    this.engine.player.update();
    this.engine.camera.update();

    this.render();

    this.stats.end();
    requestAnimationFrame(this.update.bind(this));
  }

  render() {
    this.engine.world.render();

    this.renderer.render(this.camera);
  }
}

var _Game = new Game();
