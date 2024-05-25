export class RoundedRectContainer extends Phaser.GameObjects.Container 
{
    image: Phaser.GameObjects.Image;
    graphics: Phaser.GameObjects.Graphics;
    stroke: Phaser.GameObjects.Graphics;
  
    constructor(scene: Phaser.Scene, image: string | Phaser.GameObjects.Image, rect: Phaser.Geom.Rectangle, radius: number) 
    {
      super(scene, rect.x, rect.y);
  
      this.height = rect.height;
      this.width = rect.width;
      this.x = rect.x;
      this.y = rect.y;
  
      if (typeof image === 'string') {
        this.image = new Phaser.GameObjects.Image(scene, 0, 0, image);
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
      this.stroke.strokeRoundedRect(this.x, this.y, this.width, this.height, radius);
    
      // add image into the child of container
      this.add(this.image).setMask(mask);
    }
  
  
    contains(x:number, y:number)
    {    
      return this.getBounds().contains(x,y);
    }
  }