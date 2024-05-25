import { Scene } from 'phaser';
import { RoundedRectContainer } from '../RoundedRectContainer';
import { Components } from '../Components';

export class Game extends Scene
{    
    cursors;
    gameBoard;    
    tileLayerGameBoard;
    tileLayerBar;
    selectedTile;
    tileMarker;
    boardTileMarker;


    constructor ()
    {
        super();
    }


    preload ()
    {
        this.load.image('titleMain', 'assets/titleMain2.png');
        this.load.image('gameBoard', 'assets/gameBoard.jpg');
        this.load.image('tilesetHexTiles', 'assets/tilesetHexTiles2.png');
        this.load.tilemapTiledJSON('tileMapGameBoard', 'assets/tileMapGameBoard.json');    
        this.load.tilemapTiledJSON('tileMapBar', 'assets/tileMapBar.json'); 
    }    


    create ()
    {   

        var imageTitle = this.add.image(0,20,"titleMain");
        imageTitle.setOrigin(0,0);
        imageTitle.x = (this.scale.width-imageTitle.width)/2;


        var gameboardRect = new Phaser.Geom.Rectangle(0, imageTitle.y+imageTitle.height+20, 760, 530)        
        gameboardRect.x = (this.scale.width-gameboardRect.width)/2;
        
        this.gameBoard = new RoundedRectContainer(this, "gameBoard", null, gameboardRect, 20)
        this.add.existing(this.gameBoard);

        const tileMapBar = this.add.tilemap('tileMapBar');        
        var tilesetHexTiles = tileMapBar.addTilesetImage('tilesetHexTiles');    
        this.tileLayerBar = tileMapBar.createLayer('tileLayerBar', tilesetHexTiles, 1, 4);
        this.tileLayerBar.x = this.gameBoard.x - (tileMapBar.layer.baseTileWidth+40);
        this.tileLayerBar.y = this.gameBoard.y + (this.gameBoard.height-tileMapBar.layer.heightInPixels)/2;
                
        const tileMapGameBoard = this.add.tilemap('tileMapGameBoard');
        this.tileLayerGameBoard = tileMapGameBoard.createLayer('tileLayerGameBoard', tilesetHexTiles, 0,0);        
        this.gameBoard.add(this.tileLayerGameBoard);
        
        this.tileMarker = this.add.graphics();        
        this.boardTileMarker = this.add.graphics();    
        this.gameBoard.add(this.boardTileMarker);        

        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointermove', pointer => this.pointermove(pointer));               
    }


    pointermove(pointer)
    {
        this.tileMarker.clear();
        this.boardTileMarker.clear();

        var tile;
        if (this.gameBoard.contains(pointer.worldX, pointer.worldY)) {
            tile = this.tileLayerGameBoard.getTileAtWorldXY(pointer.worldX, pointer.worldY);      
            if (tile) this.highlightTile(tile, this.tileLayerGameBoard.layer);
        }                

        if (!tile) {
            tile = this.tileLayerBar.getTileAtWorldXY(pointer.worldX, pointer.worldY);  
            if (tile) this.highlightTile(tile, this.tileLayerBar.layer);
        }         
    }

   
    update (time, delta)
    {
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);        
        const scrollStep=20;
        
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

            let tile = this.tileLayerBar.getTileAtWorldXY(worldPoint.x,worldPoint.y);                     
            if (tile) {																										 
                this.selectedTile = tile;                                             																																	 
            } else {
                let tile = this.tileLayerGameBoard.getTileAtWorldXY(worldPoint.x,worldPoint.y);  
                if (tile && this.selectedTile) {								 
                    this.tileLayerGameBoard.putTileAt(this.selectedTile, tile.x, tile.y, this.tileLayerBar);																  
                }
            }
        }                    			
    }            


    highlightTile(tile, datalayer) 
    {
        var points = this.getTileOutline(tile, datalayer);
        if (datalayer.name == "tileLayerBar"){
            this.tileMarker.lineStyle(5, 0xffff00, 1); // Yellow color with full opacity                
            this.tileMarker.strokePoints(points, true);        
        } else  {
            this.boardTileMarker.lineStyle(2, 0xffff00, 1); // Yellow color with full opacity    
            this.boardTileMarker.strokePoints(points, true);
        }                                      
    }

    
    getTileOutline(tile, layerData, camera) 
    {
        var points = [];
        var worldPos = new Phaser.Math.Vector2;          
        var tileRect = tile.getBounds();
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

        for (var i = 0; i < 6; i++) {
            var angle = Phaser.Math.DegToRad(60 * i+30);
            points.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }
        return points;
    }    
}

