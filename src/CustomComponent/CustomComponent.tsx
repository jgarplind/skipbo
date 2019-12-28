import React from "react";

enum SKIPBO_STATES {
  PLAYER1 = "player1",
  PLAYER2 = "player2"
}

interface Card {
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 0;
}

interface Player {
  hiddenCards: Card[];
  cardsOnHand: Card[];
}

export default function CustomComponent() {
  let [currentPlayer, setCurrentPlayer] = React.useState<SKIPBO_STATES>(
    SKIPBO_STATES.PLAYER1
  );
  function nextPlayer() {
    currentPlayer === SKIPBO_STATES.PLAYER1
      ? setCurrentPlayer(SKIPBO_STATES.PLAYER2)
      : setCurrentPlayer(SKIPBO_STATES.PLAYER1);
  }
  return (
    <div>
      <p>It is currently {currentPlayer}'s turn</p>
      {/* <p>These are {currentPlayer}'s cards on hand</p>
      <ul>
        {}
      </ul> */}
      <button onClick={nextPlayer}>Next player</button>
    </div>
  );
}
