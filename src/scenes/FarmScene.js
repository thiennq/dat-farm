import Phaser from 'phaser';

export default class FarmScene extends Phaser.Scene {
  constructor() {
    super('FarmScene');
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.treesGroup = null;
    this.objectsGroup = null;
    this.decorationsGroup = null;
    this.animalsGroup = null;
    this.lastDirection = 'down';
  }

  preload() {
    // Show loading status in UI if element exists
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.innerText = 'Đang tải bản đồ và tài nguyên...';
    }

    // Load Tilemap JSON
    this.load.tilemapTiledJSON('map', 'assets/data/map.json');

    // Load Tileset Images
    this.load.image('Grass', 'assets/environment/Grass.png');
    this.load.image('Hills', 'assets/environment/Hills.png');
    this.load.image('Fences', 'assets/environment/Fences.png');
    this.load.image('Plant Decoration', 'assets/environment/Plant Decoration.png');
    this.load.image('Paths', 'assets/environment/Paths.png');
    this.load.image('interaction', 'assets/environment/interaction.png');
    this.load.image('Water', 'assets/environment/Water.png');
    this.load.image('House', 'assets/environment/House.png');
    this.load.image('House Decoration', 'assets/environment/House Decoration.png');

    // Load Object Images
    this.load.image('bush', 'assets/objects/bush.png');
    this.load.image('merchant', 'assets/objects/merchant.png');
    this.load.image('stump_medium', 'assets/objects/stump_medium.png');
    this.load.image('stump_small', 'assets/objects/stump_small.png');
    this.load.image('sunflower', 'assets/objects/sunflower.png');
    this.load.image('tree_medium', 'assets/objects/tree_medium.png');
    this.load.image('tree_small', 'assets/objects/tree_small.png');
    this.load.image('flower', 'assets/objects/flower.png');
    this.load.image('mushroom', 'assets/objects/mushroom.png');
    this.load.image('mushrooms', 'assets/objects/mushrooms.png');

    // Load Player Frames (Walk & Idle)
    const directions = ['down', 'up', 'left', 'right'];
    
    // Walk frames (4 frames: 0, 1, 2, 3)
    directions.forEach(dir => {
      for (let i = 0; i < 4; i++) {
        this.load.image(`player_walk_${dir}_${i}`, `assets/character/${dir}/${i}.png`);
      }
    });

    // Idle frames (2 frames: 0, 1)
    directions.forEach(dir => {
      for (let i = 0; i < 2; i++) {
        this.load.image(`player_idle_${dir}_${i}`, `assets/character/${dir}_idle/${i}.png`);
      }
    });

    // Load Animal Spritesheets
    this.load.spritesheet('chicken', 'assets/animals/chicken.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('brown_chicken', 'assets/animals/brown_chicken.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('cow', 'assets/animals/cow.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('sheep', 'assets/animals/sheep.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    // 1. Create Tilemap
    const map = this.make.tilemap({ key: 'map' });

    // Link preloaded images to tileset names in JSON
    const tilesets = [
      map.addTilesetImage('Grass', 'Grass'),
      map.addTilesetImage('Hills', 'Hills'),
      map.addTilesetImage('Fences', 'Fences'),
      map.addTilesetImage('Plant Decoration', 'Plant Decoration'),
      map.addTilesetImage('Paths', 'Paths'),
      map.addTilesetImage('interaction', 'interaction'),
      map.addTilesetImage('Water', 'Water'),
      map.addTilesetImage('House', 'House'),
      map.addTilesetImage('House Decoration', 'House Decoration')
    ];

    // 2. Render Tile Layers (in drawing order)
    map.createLayer('Water', tilesets, 0, 0);
    map.createLayer('Ground', tilesets, 0, 0);
    map.createLayer('Forest Grass', tilesets, 0, 0);
    map.createLayer('Outside Decoration', tilesets, 0, 0);
    map.createLayer('Hills', tilesets, 0, 0);
    map.createLayer('Fence', tilesets, 0, 0);
    
    // House specific layers
    map.createLayer('HouseFloor', tilesets, 0, 0);
    map.createLayer('HouseWalls', tilesets, 0, 0);
    map.createLayer('HouseFurnitureBottom', tilesets, 0, 0);

    // Collision layer
    const collisionLayer = map.createLayer('Collision', tilesets, 0, 0);
    collisionLayer.setCollision(170); // Tile GID 170 is collision
    collisionLayer.setVisible(false); // Hide the collision blocks

    // Farmable layer
    const farmableLayer = map.createLayer('Farmable', tilesets, 0, 0);
    farmableLayer.setVisible(false);

    // 3. Create Static Groups for Objects with Colliders
    this.treesGroup = this.physics.add.staticGroup();
    this.objectsGroup = this.physics.add.staticGroup();
    this.decorationsGroup = this.add.group(); // No physics colliders for grass/flowers

    // Spawn trees from 'Trees' object group
    const treeObjects = map.getObjectLayer('Trees')?.objects || [];
    treeObjects.forEach(obj => {
      const treeKey = obj.name === 'Large' ? 'tree_medium' : 'tree_small';
      const tree = this.treesGroup.create(obj.x, obj.y, treeKey);
      tree.setOrigin(0, 1);
      tree.refreshBody();

      // Custom collider bodies so character can stand behind/under tree canopies
      if (treeKey === 'tree_medium') {
        tree.body.setSize(24, 20).setOffset(36, 100);
      } else {
        tree.body.setSize(16, 16).setOffset(20, 96);
      }
    });

    // Spawn objects from 'Objects' object group
    const generalObjects = map.getObjectLayer('Objects')?.objects || [];
    generalObjects.forEach(obj => {
      let key = '';
      if (obj.gid === 148) key = 'tree_medium';
      else if (obj.gid === 149) key = 'tree_small';
      else if (obj.gid === 144) key = 'merchant';
      else if (obj.gid === 147) key = 'sunflower';

      if (key) {
        const sprite = this.objectsGroup.create(obj.x, obj.y, key);
        sprite.setOrigin(0, 1);
        sprite.refreshBody();

        // Custom collider bodies
        if (key === 'tree_medium') {
          sprite.body.setSize(24, 20).setOffset(36, 100);
        } else if (key === 'tree_small') {
          sprite.body.setSize(16, 16).setOffset(20, 96);
        } else if (key === 'merchant') {
          sprite.body.setSize(24, 24).setOffset(16, 40);
        } else if (key === 'sunflower') {
          sprite.body.setSize(16, 16).setOffset(20, 96);
        }
      }
    });

    // Spawn decorations from 'Decoration' object group (no colliders)
    const decorationObjects = map.getObjectLayer('Decoration')?.objects || [];
    decorationObjects.forEach(obj => {
      let key = '';
      if (obj.gid === 152) key = 'mushrooms';
      else if (obj.gid === 147) key = 'sunflower';
      else if (obj.gid === 150) key = 'flower';
      else if (obj.gid === 151) key = 'mushroom';
      else if (obj.gid === 143) key = 'bush';

      if (key) {
        const sprite = this.add.sprite(obj.x, obj.y, key);
        sprite.setOrigin(0, 1);
        this.decorationsGroup.add(sprite);
      }
    });

    // 4. Create Player Animations
    const directions = ['down', 'up', 'left', 'right'];
    
    directions.forEach(dir => {
      // Walk animation
      this.anims.create({
        key: `player-walk-${dir}`,
        frames: [
          { key: `player_walk_${dir}_0` },
          { key: `player_walk_${dir}_1` },
          { key: `player_walk_${dir}_2` },
          { key: `player_walk_${dir}_3` }
        ],
        frameRate: 8,
        repeat: -1
      });

      // Idle animation
      this.anims.create({
        key: `player-idle-${dir}`,
        frames: [
          { key: `player_idle_${dir}_0` },
          { key: `player_idle_${dir}_1` }
        ],
        frameRate: 3,
        repeat: -1
      });
    });

    // 5. Spawn Player at 'Start' position in object layer 'Player'
    const playerObjects = map.getObjectLayer('Player')?.objects || [];
    const startObj = playerObjects.find(obj => obj.name === 'Start');
    
    const spawnX = startObj ? startObj.x : 1500;
    const spawnY = startObj ? startObj.y : 1700;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_idle_down_0');
    this.player.play('player-idle-down');

    // Make player collision box narrow and positioned at their feet
    this.player.body.setSize(24, 20);
    this.player.body.setOffset(74, 98);

    // 6. Draw HouseFurnitureTop on top of the Player (depth sorting handles this too, but layer is explicitly drawn above)
    map.createLayer('HouseFurnitureTop', tilesets, 0, 0);

    // 7. Colliders
    this.physics.add.collider(this.player, collisionLayer);
    this.physics.add.collider(this.player, this.treesGroup);
    this.physics.add.collider(this.player, this.objectsGroup);

    // 7b. Create Animal Animations
    const animalTypes = ['chicken', 'brown_chicken', 'cow', 'sheep'];
    const dirs = ['down', 'up', 'left', 'right'];
    const dirOffsets = { down: 0, up: 4, left: 8, right: 12 };
    
    animalTypes.forEach(animalName => {
      dirs.forEach(dir => {
        const offset = dirOffsets[dir];
        
        // Walk animation
        this.anims.create({
          key: `${animalName}-walk-${dir}`,
          frames: this.anims.generateFrameNumbers(animalName, { start: offset, end: offset + 3 }),
          frameRate: 6,
          repeat: -1
        });

        // Idle animation
        this.anims.create({
          key: `${animalName}-idle-${dir}`,
          frames: [
            { key: animalName, frame: offset },
            { key: animalName, frame: offset + 2 }
          ],
          frameRate: 2,
          repeat: -1
        });

        // Eat/Peck animation
        this.anims.create({
          key: `${animalName}-eat-${dir}`,
          frames: [
            { key: animalName, frame: offset + 2 }
          ],
          frameRate: 1,
          repeat: -1
        });
      });
    });

    // 7c. Spawn Animals Group
    this.animalsGroup = this.physics.add.group();

    // Scan map for walkable grass tiles
    const grassTiles = [];
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        const collisionTile = map.getTileAt(x, y, true, 'Collision');
        const hasCollision = collisionTile && collisionTile.index !== -1 && collisionTile.index !== 0;

        const grassTile = map.getTileAt(x, y, true, 'Forest Grass');
        const hasGrass = grassTile && grassTile.index !== -1 && grassTile.index !== 0;

        const houseTile = map.getTileAt(x, y, true, 'HouseFloor');
        const isHouse = houseTile && houseTile.index !== -1 && houseTile.index !== 0;
        
        const waterTile = map.getTileAt(x, y, true, 'Water');
        const isWater = waterTile && waterTile.index !== -1 && waterTile.index !== 0;

        if (hasGrass && !hasCollision && !isHouse && !isWater) {
          grassTiles.push({ x: x * 64 + 32, y: y * 64 + 32 });
        }
      }
    }

    // Filter grass tiles that are far from player spawn
    const validGrassTiles = grassTiles.filter(tile => {
      const distToPlayer = Phaser.Math.Distance.Between(tile.x, tile.y, spawnX, spawnY);
      return distToPlayer > 150;
    });

    // Spawn 10 random animals
    const numAnimals = 10;
    for (let i = 0; i < numAnimals; i++) {
      if (validGrassTiles.length === 0) break;
      
      const idx = Phaser.Math.Between(0, validGrassTiles.length - 1);
      const tile = validGrassTiles.splice(idx, 1)[0];
      
      const type = animalTypes[Phaser.Math.Between(0, animalTypes.length - 1)];
      
      const animal = this.physics.add.sprite(tile.x, tile.y, type);
      
      if (type === 'chicken' || type === 'brown_chicken') {
        animal.setScale(1.6);
        animal.body.setSize(12, 12);
        animal.body.setOffset(2, 4);
      } else {
        animal.setScale(1.8);
        animal.body.setSize(24, 20);
        animal.body.setOffset(4, 10);
      }
      
      animal.animalType = type;
      animal.lastDirection = dirs[Phaser.Math.Between(0, dirs.length - 1)];
      animal.aiState = 'idle';
      animal.setCollideWorldBounds(true);
      
      this.animalsGroup.add(animal);
      animal.play(`${type}-idle-${animal.lastDirection}`);
      
      this.setupAnimalAI(animal);
    }

    // Colliders for Animals
    this.physics.add.collider(this.animalsGroup, collisionLayer);
    this.physics.add.collider(this.animalsGroup, this.treesGroup);
    this.physics.add.collider(this.animalsGroup, this.objectsGroup);
    this.physics.add.collider(this.animalsGroup, this.animalsGroup);
    this.physics.add.collider(this.player, this.animalsGroup);

    // 8. Camera Setup
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5); // Slightly zoom in for a nice cozy Stardew look

    // 9. Input Listeners
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Update status UI
    const statusTextUI = document.getElementById('status-text');
    if (statusTextUI) {
      statusTextUI.innerText = 'Trang trại đã sẵn sàng. Di chuyển bằng phím WASD!';
    }
  }

  setupAnimalAI(animal) {
    const changeBehavior = () => {
      if (!animal.active) return;
      
      const states = ['idle', 'walk', 'eat'];
      const directions = ['down', 'up', 'left', 'right'];
      
      // Determine next state (40% idle, 40% walk, 20% eat)
      const r = Phaser.Math.Between(0, 9);
      if (r < 4) {
        animal.aiState = 'idle';
      } else if (r < 8) {
        animal.aiState = 'walk';
      } else {
        animal.aiState = 'eat';
      }
      
      if (animal.aiState === 'walk') {
        animal.lastDirection = directions[Phaser.Math.Between(0, 3)];
        const speed = animal.animalType.includes('chicken') ? 25 : 20;
        
        let vx = 0;
        let vy = 0;
        if (animal.lastDirection === 'left') vx = -speed;
        else if (animal.lastDirection === 'right') vx = speed;
        else if (animal.lastDirection === 'up') vy = -speed;
        else if (animal.lastDirection === 'down') vy = speed;
        
        animal.setVelocity(vx, vy);
        animal.play(`${animal.animalType}-walk-${animal.lastDirection}`, true);
      } else if (animal.aiState === 'eat') {
        animal.setVelocity(0, 0);
        animal.play(`${animal.animalType}-eat-${animal.lastDirection}`, true);
      } else {
        animal.setVelocity(0, 0);
        animal.play(`${animal.animalType}-idle-${animal.lastDirection}`, true);
      }
      
      // Schedule next check in 2-6 seconds
      this.time.addEvent({
        delay: Phaser.Math.Between(2000, 6000),
        callback: changeBehavior,
        callbackScope: this
      });
    };
    
    changeBehavior();
  }

  update() {
    if (!this.player) return;

    // Movement speeds
    const speed = 180;
    let vx = 0;
    let vy = 0;

    // Check keys
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      vx = -speed;
      this.lastDirection = 'left';
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      vx = speed;
      this.lastDirection = 'right';
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      vy = -speed;
      this.lastDirection = 'up';
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      vy = speed;
      this.lastDirection = 'down';
    }

    // Normalize diagonal movement speed so moving diagonally isn't faster
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    // Apply velocities
    this.player.setVelocity(vx, vy);

    // Update animations based on state
    if (vx !== 0 || vy !== 0) {
      this.player.play(`player-walk-${this.lastDirection}`, true);
    } else {
      this.player.play(`player-idle-${this.lastDirection}`, true);
    }

    // Dynamic Depth Sorting (Y-Sorting)
    // Characters and objects closer to the bottom of the screen render in front of those higher up
    if (this.player.body) {
      this.player.setDepth(this.player.body.bottom);
    } else {
      this.player.setDepth(this.player.y + 40);
    }
    
    if (this.animalsGroup) {
      this.animalsGroup.getChildren().forEach(animal => {
        if (animal.body) {
          animal.setDepth(animal.body.bottom);
        } else {
          animal.setDepth(animal.y);
        }
      });
    }
    
    this.treesGroup.getChildren().forEach(tree => {
      tree.setDepth(tree.y);
    });

    this.objectsGroup.getChildren().forEach(obj => {
      obj.setDepth(obj.y);
    });

    this.decorationsGroup.getChildren().forEach(dec => {
      dec.setDepth(dec.y);
    });
  }
}
