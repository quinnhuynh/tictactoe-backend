import {v4 as uuidv4} from "uuid";
import { Board } from "./logic.js";
import { io } from "./socket.js";

const userSessionMapping = new Map();
const userQueue = [];
const userGameMatching = new Map();
const gameSessionMapping = new Map();

const TIME_OUT = 24 * 60 * 60 * 1000;
const GAME_TIME_OUT = 30 * 60 * 1000;

setInterval(() => {
    if(userQueue.length >= 2) {
        let player1 = userQueue.pop();
        let player2 = userQueue.pop();
        let gameId = UserService.newUUID();
        while(gameSessionMapping.has(gameId)) {
            gameId = uuidv4();
        }
        UserService.startMatch(player1, player2, gameId)
    }
}, 1000);

const UserService = {
    newUUID : () => {
        
        let uuid = uuidv4();
        while(userSessionMapping.has(uuid)) {
            uuid = uuidv4();
        }
        UserService.renewUUID(uuid);
        return uuid;
    },

    getGame: (uuid) => {
        return userGameMatching.get(uuid);
    },

    setGame : (gameId, game) => {
        let players = game.players;
        let player1 = players[0];
        let player2 = players[1];
        gameSessionMapping.set(gameId, game);
        UserService.updateGameToPlayers(player1, player2, gameId);

    },

    renewUUID : (uuid) => {
        userSessionMapping.set(uuid, Date.now());
        setTimeout(() => {
            let currentTime = Date.now();
            if(userSessionMapping.get(uuid) + TIME_OUT < currentTime) {
                console.log(`${uuid} expired!`);
                userSessionMapping.delete(uuid);
            }
        }, TIME_OUT + 1000) // 1 day
    },

    checkUUID : (uuid) => {
        return userSessionMapping.has(uuid);
    },

    startMatch: (player1, player2, gameId) => {
        userGameMatching.set(player1, gameId);
        userGameMatching.set(player2, gameId);
        let players = [player1, player2];
        gameSessionMapping.set(gameId, {
            ...Board.newBoard(3, [...players])
        });
        UserService.updateGameToPlayers(player1, player2, gameId);
        setTimeout(() => {
            let getPlayers = gameSessionMapping.get(gameId).players;
            gameSessionMapping.delete(gameId);
            getPlayers.forEach((e) => {
                if(userGameMatching.get(e) === gameId) {
                    userGameMatching.delete(e);
                }
            });
        }, GAME_TIME_OUT);
    },

    updateGameToPlayers: (player1, player2, gameId) => {
        console.log(`Game updated for ${player1} and ${player2} at ${gameId}`);
        io.to(player1).emit('game-update', UserService.getUserInfo(player1));
        io.to(player2).emit('game-update', UserService.getUserInfo(player2));
    },
    
    add2Queue: (uuid) => {
        UserService.renewUUID(uuid);
        if(userGameMatching.has(uuid) || userQueue.indexOf(uuid) !== -1) {
            return false;
        }
        userQueue.push(uuid);
        return true;
    },
    
    getPositionInQueue : (uuid) => {
        return userQueue.indexOf(uuid) + 1;
    },

    leaveUserFromCurrentGame : (uuid) => {
        userGameMatching.delete(uuid);
    },

    getUserInfo: (uuid) => {
        let gameId = userGameMatching.get(uuid);
        return {
            uuid,
            gameId,
            game: gameSessionMapping.get(gameId),
            queuePosition: UserService.getPositionInQueue(uuid)
        };
    }
}

export default UserService;