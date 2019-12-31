import { Machine, assign, spawn, send, actions, State } from "xstate";
import { PlayerActor, actorMachine, randomCard } from "./actorMachine";
import { respond } from "xstate/lib/actions";

interface SkipboStateSchema {
  states: {
    initializing: {};
    idle: {};
    playing: {
      states: {
        player1: {};
        player2: {};
      };
    };
    celebration: {};
  };
}

export type CurrentPlayerType = "" | "player1" | "player2";

export type TurnEndedEvent = {
  type: "TURN_ENDED";
  identity: "player1" | "player2";
};

export type StartGameEvent = {
  type: "START_GAME";
};

export type GameWonEvent = {
  type: "GAME_WON";
};

export type DrawCardEvent = {
  type: "DRAW_CARD";
};

export type DrawnCardEvent = {
  type: "DRAWN_CARD";
  card: number;
};

export type SendCardsEvent = {
  type: "SEND_CARDS";
  card: number;
};

export type Card = {
  value: number;
  //   value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 0;
};

interface SkipboContext {
  playerRefs: any;

  //   [] | [PlayerActor, PlayerActor];

  pile: Card[];
  //   squares: Card[][];
}

function generateGamePile() {
  let playerPile = [];
  for (let i = 0; i < 100; i++) {
    playerPile.push(randomCard());
  }
  return playerPile;
}

type GameState = State<SkipboContext, SkipboEvent>;

type SkipboEvent =
  | TurnEndedEvent
  | StartGameEvent
  | GameWonEvent
  | DrawCardEvent
  | DrawnCardEvent
  | SendCardsEvent;

// const gameLogic = {};
// const getPlayerMove = (state: GameState, player: "player1" | "player2") =>
//   state.value["playing"][player]["action"];

export const gameMachine = Machine<
  SkipboContext,
  SkipboStateSchema,
  SkipboEvent
>({
  id: "game",
  initial: "initializing",
  context: {
    pile: [],
    playerRefs: []
  },
  states: {
    initializing: {
      on: {
        "": {
          actions: assign({
            pile: () => generateGamePile(),
            playerRefs: () => [
              spawn(
                actorMachine.withContext({
                  identity: "player1",
                  pile: [],
                  hand: [],
                  tempPile: [],
                  selectedCard: 0
                })
              ),
              spawn(
                actorMachine.withContext({
                  identity: "player2",
                  pile: [],
                  hand: [],
                  tempPile: [],
                  selectedCard: 0
                })
              )
            ]
          }),
          target: "idle"
        }
      }
    },
    idle: {},
    playing: {
      initial: "player1",
      states: {
        player1: {
          entry: send("BEGIN_TURN", { to: context => context.playerRefs[0] }),
          on: {
            DRAW_CARD: {
              // actions: respond({type: 'DRAW_CARD'})
              //   actions: send(
              //     { type: "SEND_CARDS", card: 1 },
              //     {
              //       to: (context: SkipboContext) => context.playerRefs[0]
              //     }
              //   )
            },
            TURN_ENDED: { target: "player2" }
          }
        },
        player2: {
          entry: send("BEGIN_TURN", { to: context => context.playerRefs[1] }),
          on: {
            TURN_ENDED: "player1"
          }
        }
      }
    },
    celebration: {}
  },
  on: {
    GAME_WON: {
      target: "celebration"
    },
    START_GAME: {
      target: "playing"
    }
  }
});
