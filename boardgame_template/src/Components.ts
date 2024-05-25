export class Components
{

    static HexagonalTileToWorldXY (tileX:number, tileY:number, point: Phaser.Math.Vector2, camera: Phaser.Cameras.Scene2D.Camera, layer: Phaser.Tilemaps.LayerData)
    {
        if (!point) { point = new Phaser.Math.Vector2(); }

        var tileWidth = layer.baseTileWidth;
        var tileHeight = layer.baseTileHeight;
        var tilemapLayer = layer.tilemapLayer;

        var worldX = 0;
        var worldY = 0;

        if (tilemapLayer)
        {
            if (!camera) { camera = tilemapLayer.scene.cameras.main; }

            worldX = tilemapLayer.x + camera.scrollX * (1 - tilemapLayer.scrollFactorX);
            worldY = tilemapLayer.y + camera.scrollY * (1 - tilemapLayer.scrollFactorY);

            tileWidth *= tilemapLayer.scaleX;
            tileHeight *= tilemapLayer.scaleY;
        }

        //  Hard-coded orientation values for Pointy-Top (staggerAxis === 'y') Hexagons only

        //  origin
        var tileWidthHalf = tileWidth / 2;
        var tileHeightHalf = tileHeight / 2;

        var x;
        var y;

        if (layer.staggerAxis === 'y')
        {
            x = worldX + (tileWidth * tileX) + tileWidth;
            y = worldY + ((1.5 * tileY) * tileHeightHalf) + tileHeightHalf;
            
            if (tileY % 2 === 0)
            {
                if (layer.staggerIndex === 'odd')
                {
                    x -= tileWidthHalf;
                }
                else
                {
                    x -= tileWidthHalf;
                }
            }
            else
            {
                if (layer.staggerIndex === 'even')
                {
                    x -= tileWidth;
                }
            }
        }
        else if ((layer.staggerAxis === 'x') && (layer.staggerIndex === 'odd'))
        {
            x = worldX + ((1.5 * tileX) * tileWidthHalf) + tileWidthHalf;
            y = worldY + (tileHeight * tileX) + tileHeight;

            if (tileX % 2 === 0)
            {
                if (layer.staggerIndex === 'odd')
                {
                    y -= tileHeightHalf;
                }
                else
                {
                    y += tileHeightHalf;
                }
            }
        }

        return point.set(x, y);
    }

}