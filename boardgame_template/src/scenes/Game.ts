import { Scene } from 'phaser';
import { RoundedRectContainer } from '../RoundedRectContainer';
import { Components } from '../Components';


enum TileType
{
    Empty = 1,
    Yellow = 5,
    Red = 6,
    Pink = 7,
    Purple = 8
}

export class TileInfo
{
    tileType: TileType;
    rotation: number;
    tileX: number;
    tileY: number;
}

export class Game extends Scene
{
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    gameBoard: RoundedRectContainer;    
    tileLayerGameBoard: Phaser.Tilemaps.TilemapLayer;
    tileLayerBar: Phaser.Tilemaps.TilemapLayer;;
    selectedTile: Phaser.Tilemaps.Tile;
    tileMarker:  Phaser.GameObjects.Graphics;
    boardTileMarker: Phaser.GameObjects.Graphics;    
    propertiesText : Phaser.GameObjects.Text;
    shiftKey: Phaser.Input.Keyboard.Key;

    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.image('titleMain', './assets/titleMain2.png');
        this.load.image('gameBoard', './assets/gameBoard.jpg');
        this.load.image('tilesetHexTiles', './assets/tilesetHexTiles2.png');
        this.load.tilemapTiledJSON('tileMapGameBoard', './assets/tileMapGameBoard.json');    
        this.load.tilemapTiledJSON('tileMapBar', './assets/tileMapBar.json'); 
    }    

    create ()
    {
        var imageTitle = this.add.image(0,20,"titleMain");
        imageTitle.setOrigin(0,0);
        imageTitle.x = (this.scale.width-imageTitle.width)/2;


        var gameboardRect = new Phaser.Geom.Rectangle(0, imageTitle.y+imageTitle.height+40, 760, 530)        
        gameboardRect.x = (this.scale.width-gameboardRect.width)/2;
        
        this.gameBoard = new RoundedRectContainer(this, "gameBoard", gameboardRect, 30)
        this.add.existing(this.gameBoard);

        const tileMapBar = this.add.tilemap('tileMapBar');        
        var tilesetHexTiles = tileMapBar.addTilesetImage('tilesetHexTiles');  
        this.tileLayerBar = tileMapBar.createLayer('tileLayerBar', tilesetHexTiles, 1, 4);        
        this.tileLayerBar.x = this.gameBoard.x - (tileMapBar.layer.baseTileWidth+40);
        this.tileLayerBar.y = this.gameBoard.y + (this.gameBoard.height-this.tileLayerBar.height)/2;
             


        const tileMapGameBoard = this.add.tilemap('tileMapGameBoard');
        this.tileLayerGameBoard = tileMapGameBoard.createLayer('tileLayerGameBoard', tilesetHexTiles, 0,0);        
        this.gameBoard.add(this.tileLayerGameBoard);
        
        this.tileMarker = this.add.graphics();        
        this.boardTileMarker = this.add.graphics();    
        this.gameBoard.add(this.boardTileMarker);      
        

        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointermove', this.pointermove, this);               
        this.input.keyboard.on('keydown', this.keydown, this);

        this.shiftKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);


        var layers : Phaser.Tilemaps.TilemapLayer[] = new Array();
        layers.push(this.tileLayerBar);
        layers.push(this.tileLayerGameBoard);
        layers.forEach(layer => {
            // Adjust the position of each tile to add spacing
            layer.forEachTile(tile => {
                var props: TileInfo = new TileInfo();
                props.tileType = tile.index;         
                props.rotation = 0;
                props.tileX = tile.x;
                props.tileY = tile.y;
                tile.properties = props;   
            });                            
        });

    

        this.propertiesText = this.add.text(200, 750, 'Properties: ', {fontSize: '18px',color: '#000000'});        
        this.add.text(200, 780, "Copy tiles with shift key pressed. Rotate with 'r'.", {fontSize: '18px',color: '#000000'});        



    }

    // Todo: Calculate zooming
    keydown(key: Phaser.Input.Keyboard.Key)
    {
        switch(key.keyCode)
        {
            case Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD:
                if (this.tileLayerGameBoard.scale < 5)
                    {
                        this.tileLayerGameBoard.scale*=1.2;
                        this.tileLayerGameBoard.x -=200;
                        this.tileLayerGameBoard.y -=100;
                    }   
                    break;                     
            case Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT:
                if (this.tileLayerGameBoard.scale >= 0.5)
                    {                
                        this.tileLayerGameBoard.scale/=1.2;
                        this.tileLayerGameBoard.x +=200;
                        this.tileLayerGameBoard.y +=100;
                    }
                break;
                case Phaser.Input.Keyboard.KeyCodes.R:
                    const worldPoint = (this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2);                      
                    var tile = this.tileLayerGameBoard.getTileAtWorldXY(worldPoint.x, worldPoint.y);  
                    if (tile && this.gameBoard.contains(worldPoint.x, worldPoint.y)) {                                    
                        
                        var prop = tile.properties as TileInfo;
                        if (prop.tileType != TileType.Empty) {
                            prop.rotation+=60;
                            if (prop.rotation==360) prop.rotation = 0;
                            tile.rotation = Phaser.Math.DegToRad(prop.rotation);
                            this.displayTileInfo(prop);           
                        }                                                  
                    }
                    
                    break;                
        }
    }    

    displayTileInfo(prop: TileInfo)
    {
        this.propertiesText.setText(`Properties: {tileType:${TileType[prop.tileType]}, rotation:${prop.rotation}, tileX:${prop.tileX}, tileY:${prop.tileY}}`);       
    }


    pointermove(pointer: Phaser.Input.Pointer)
    {
        this.tileMarker.clear();
        this.boardTileMarker.clear();

        var tile;
        if (this.gameBoard.contains(pointer.worldX, pointer.worldY)) {
            tile = this.tileLayerGameBoard.getTileAtWorldXY(pointer.worldX, pointer.worldY);      
            if (tile) this.highlightTile(tile, this.tileLayerGameBoard.layer, this.cameras.main);
        }                

        if (!tile) {
            tile = this.tileLayerBar.getTileAtWorldXY(pointer.worldX, pointer.worldY);  
            if (tile) this.highlightTile(tile, this.tileLayerBar.layer, this.cameras.main);
        }         
    }    

    update (time: number, delta: number)
    {

        const worldPoint = (this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2);        
        const scrollStep = 5;
        
        if (this.cursors.left.isDown){			 
            this.tileLayerGameBoard.x -= scrollStep;
            this.boardTileMarker.clear();
			 
        } else if (this.cursors.right.isDown) {			 
            this.tileLayerGameBoard.x += scrollStep;
            this.boardTileMarker.clear();                
        }

        if (this.cursors.up.isDown) {			 
            this.tileLayerGameBoard.y -= scrollStep;
            this.boardTileMarker.clear();
			 
        } else if (this.cursors.down.isDown) {			 
            this.tileLayerGameBoard.y += scrollStep;
            this.boardTileMarker.clear();
        }                  
        
        if (this.input.manager.activePointer.isDown) {
            
            var prop: TileInfo;
            let tile = this.tileLayerBar.getTileAtWorldXY(worldPoint.x, worldPoint.y);                     
            if (tile) {					
                if (this.shiftKey.isDown) this.selectedTile = tile;                
            } else {
                tile = this.tileLayerGameBoard.getTileAtWorldXY(worldPoint.x, worldPoint.y);  
                if (tile) {                
                    if (this.selectedTile && this.shiftKey.isDown) {								 
                        tile = this.tileLayerGameBoard.putTileAt(this.selectedTile, tile.x, tile.y);
                        prop = tile.properties as TileInfo;
                        prop.tileX = tile.x;
                        prop.tileY = tile.y;           
                    }
                }                                    
            }
            if (tile)
            {
                    this.displayTileInfo(tile.properties as TileInfo);
            }
        }                    			
    }            


    highlightTile(tile: Phaser.Tilemaps.Tile, datalayer: Phaser.Tilemaps.LayerData, camera: Phaser.Cameras.Scene2D.Camera) 
    {
        var points = this.getTileOutline(tile, datalayer, camera);
        if (datalayer.name == "tileLayerBar"){
            this.tileMarker.lineStyle(5, 0xffff00, 1); // Yellow color with full opacity                
            this.tileMarker.strokePoints(points, true);        
        } else  {
            this.boardTileMarker.lineStyle(2, 0xffff00, 1); // Yellow color with full opacity    
            this.boardTileMarker.strokePoints(points, true);
        }     
        this.displayTileInfo(tile.properties);
    }

    
    getTileOutline(tile: Phaser.Tilemaps.Tile, layerData: Phaser.Tilemaps.LayerData, camera: Phaser.Cameras.Scene2D.Camera) 
    {
        var points = [];
        var worldPos = new Phaser.Math.Vector2();          
        var tileRect = (tile.getBounds() as Phaser.Geom.Rectangle);
        var radius = tileRect.height/2;
        var centerX, centerY;
        

        if (layerData.orientation == Phaser.Tilemaps.Orientation.ORTHOGONAL){
            Phaser.Tilemaps.Components.TileToWorldXY(tile.x, tile.y, worldPos, camera, layerData);
            centerX = worldPos.x + tileRect.width/2;
            centerY = worldPos.y + tileRect.height/2;
        } else {
            //Phaser.Tilemaps.Components.HexagonalTileToWorldXY(tile.x, tile.y, worldPos, camera, layerData);
            Components.HexagonalTileToWorldXY(tile.x, tile.y, worldPos, camera, layerData);
            
            // Correct coordinates because of gamgeboard container
            centerX = worldPos.x - this.gameBoard.width+(this.gameBoard.width-this.gameBoard.x);
            centerY = worldPos.y - this.gameBoard.y;            
        }

        var rotation = (layerData.staggerAxis == "x") ? 0 : 30;
        for (var i = 0; i < 6; i++) {
            var angle = Phaser.Math.DegToRad(i*60 + rotation);
            points.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }
        return points;
    }     
}
