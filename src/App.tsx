import React from "react";
import "./App.css";
import { useMachine, useService } from "@xstate/react";
import { gameMachine, Card } from "./gameMachine";
import { SelectCardEvent, ActorContext } from "./actorMachine";

function Player({ myRef }: any) {
  const [state, send] = useService(myRef);
  const context = state.context as ActorContext;
  let playableCards = [context.pile[0]].concat(context.hand);

  if (context.tempPile[0]) {
    playableCards = playableCards.concat(context.tempPile[0]);
  }

  return (
    <div>
      <p>
        {context.identity} is {state.value}
      </p>{" "}
      <p>and has {context.pile.length} cards in their pile</p>
      <p>and the card on top is {playableCards[0].value}</p>
      <p>and has {context.hand.length} cards in their hand</p>
      <ul>
        those cards are:{" "}
        {context.hand.map((card: Card, index: number) => (
          <li key={index}>{card.value}</li>
        ))}
      </ul>
      <ul>
        cards on the ground are:{" "}
        {context.tempPile.map((card: Card, index: number) => (
          <li key={index}>{card.value}</li>
        ))}
      </ul>
      <select
        onChange={event => {
          send({
            type: "SELECT_CARD",
            index: event.target.selectedIndex
          } as SelectCardEvent);
        }}
        value={context.selectedCard}
      >
        {playableCards.map((card: Card, index: number) => {
          return (
            <option key={index} value={index}>
              {index === 0
                ? "pile " + card.value
                : card.value + " (" + index + ")"}
            </option>
          );
        })}
      </select>
      <button onClick={() => send({ type: "PLAY_CARD" })}>
        Play selected card
      </button>
      <button onClick={() => send({ type: "SAVE_CARD" })}>
        Save selected card
      </button>
    </div>
  );
}

function Skipbo() {
  const [state, send] = useMachine(gameMachine, { devTools: true });
  return (
    <div className="App">
      <header className="App-header">Skipbo</header>
      <main>
        {state.matches("idle") ? (
          <button onClick={() => send({ type: "START_GAME" })}>
            Start game
          </button>
        ) : state.matches("playing") ? (
          <>
            <div className="game-field">
              <p>This is the game field</p>
              <p>Cards remaining in main pile: {state.context.pile.length}</p>
            </div>
            {state.context.playerRefs
              .filter((playerRef: any) => playerRef.state.value === "active")
              .map((playerRef: any) => (
                <Player key={playerRef.id} myRef={playerRef} />
              ))}
          </>
        ) : (
          <div>
            You,{" "}
            {
              state.context.playerRefs.filter((playerRef: any) => {
                console.log(playerRef.state.context.identity);
                return playerRef.state.value === "active";
              })[0].state.context.identity
            }
            {", "}
            won!
            <button onClick={() => send({ type: "START_GAME" })}>
              Start new game
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Skipbo;
