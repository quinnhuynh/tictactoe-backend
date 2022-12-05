

class Board {

    static isDraw = (boardList) => {
        return !boardList.isWin
            && boardList.every((e) => e.every((e2) => e2 !== 0));
    }

    static isWin = (boardList) => {

        let n = boardList.length;
        for (let i = 0; i < n; i++) {
            let flag = true;
            for (let j = 0; j < n; j++) {
                if (boardList[i][j] !== boardList[i][0] || boardList[i][j] === 0) {
                    flag = false;
                    break;
                }
            }
            if (flag) return true;
            flag = true;
            for (let j = 0; j < n; j++) {
                if (boardList[j][i] !== boardList[0][i] || boardList[j][i] === 0) {
                    flag = false;
                    break;
                }
            }
            if (flag) return true;
        }

        let flag = true;

        for (let i = 0; i < n; i++) {
            if (boardList[i][i] !== boardList[0][0] || boardList[i][i] === 0) {
                flag = false;
                break;
            }
        }

        if (flag) return true;

        flag = true;

        for (let i = 0; i < n; i++) {
            if (boardList[i][n - i - 1] !== boardList[0][n - 1] || boardList[i][n - i - 1] === 0) {
                flag = false;
                break;
            }
        }

        if (flag) return true;

        return false;
    }

    static move = (player, boardObj, i, j) => {

        let newList = boardObj.boardList.map(l => [...l]);
        let realPlayer = boardObj.players[boardObj.player - 1];
        if (newList[i][j] !== 0
            || player !== realPlayer
            || boardObj.winner) {
            return { ...boardObj };
        }

        newList[i][j] = boardObj.player;

        if (Board.isWin(newList)) {
            return {
                players: boardObj.players,
                player: 3 - boardObj.player,
                boardList: newList,
                winner: boardObj.player
            };
        }

        if (Board.isDraw(newList)) {
            return {
                players: boardObj.players,
                player: 3 - boardObj.player,
                boardList: newList,
                winner: null
            };
        }

        return {
            players: boardObj.players,
            player: 3 - boardObj.player,
            boardList: newList,
            winner: undefined
        };

    }

    static newBoard = (n, players) => {
        return {
            players,
            player: 1,
            boardList: [...Array(n).keys()]
                .map(e => [...Array(n).keys()].map(e => 0)),
            winner: undefined,
        }
    }

};

export { Board };