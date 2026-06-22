import { useGameState } from './minimax';
import './index.css';

export default function App() {
  const game = useGameState();

  const p1Role = game.round === 1 ? "Player 1" : "AI";
  const p2Role = game.round === 1 ? "AI" : "Player 1";
  const handleLeftClick = (r, c) => {
    if (!game.isHumanTurn) return;
    game.applyMove(r, c, 'O');
  };

  const handleRightClick = (e, r, c) => {
    e.preventDefault(); // stop right-click menu
    if (!game.isHumanTurn) return;
    game.applyMove(r, c, 'X');
  };
  return (
    <div className="wrapper">
      <h1>Order & Chaos</h1>

      <div className="status-bar">
        <div>ORDER: {p1Role}</div>
        <div>CHAOS: {p2Role}</div>
        <div>ROUND: {game.round}</div>
        <div>MOVES: {game.moveCount}</div>
      </div>

      <div className="controls">
        <span className="o-color">LEFT CLICK = O</span> <br> </><span className="x-color">RIGHT CLICK = X</span>
      </div>

      <div className="board">
        {game.board.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className="cell"
              onClick={() => handleLeftClick(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
            >
              <span className={val === 'X' ? 'x-color' : 'o-color'}>{val}</span>
            </div>
          ))
        )}
      </div>

      {game.round === 1 && game.round1Stats && (
        <div className="modal">
          <h2>Round 1 Done</h2>
          <p>Order got 5 in a row? {game.round1Stats.orderWon ? 'YES' : 'NO'}</p>
          <p>Tiebreaker points (4s): {game.round1Stats.straight4s}</p>
          <button onClick={game.startRound2}>Start Round 2</button>
        </div>
      )}

      {game.overallWinner && (
        <div className="modal">
          <h2>GAME OVER</h2>
          <p>WINNER: {game.overallWinner}</p>
          <button onClick={game.resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}
