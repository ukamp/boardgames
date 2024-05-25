import { AUTO } from 'phaser';
import { Game } from './scenes/Game';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1040,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    //transparent:true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Game        
    ]
};

export default new Phaser.Game(config);
