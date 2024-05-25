export class RoundedRectContainer extends Phaser.GameObjects.Container {
  image
  graphics
  stroke

  constructor(scene, image, frame, rect, radius) 
  {
    super(scene, rect.x, rect.y);

    this.height = rect.height;
    this.width = rect.width;
    this.x = rect.x;
    this.y = rect.y;

    if (typeof image === 'string') {
      this.image = new Phaser.GameObjects.Image(scene, 0, 0, image,  frame);
    } else {
      this.image = image;    
    }   
    this.image.setOrigin(0,0);

    // add graphics into the scene and fill it with circle
    // importance to set circle position to the (x, y)first    
    this.graphics = scene.add.graphics();
    this.graphics.fillRoundedRect(this.x, this.y, this.width, this.height, radius);
    const mask = this.graphics.createGeometryMask();

    this.stroke = scene.add.graphics();
    this.stroke.lineStyle(1, 0x000000, 1);
    this.stroke.strokeRoundedRect(this.x, this.y, this.width, this.height);
  
    // add image into the child of container
    this.add(this.image).setMask(mask);
  }


  contains(x,y)
  {    
    return this.getBounds().contains(x,y);
  }
}