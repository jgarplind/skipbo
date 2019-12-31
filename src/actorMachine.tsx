import { Machine, assign, Actor, sendParent, actions } from "xstate";
import { Card, TurnEndedEvent } from "./gameMachine";

const { raise } = actions;

export function randomCard() {
  return { value: Math.ceil(12 * Math.random()) };
}

function generatePlayerPile() {
  let playerPile = [];
  for (let i = 0; i < 10; i++) {
    playerPile.push(randomCard());
  }
  return playerPile;
}

function generatePlayerHand() {
  let playerHand = [];
  for (let i = 0; i < 5; i++) {
    playerHand.push(randomCard());
  }
  return playerHand;
}

function drawTopCard() {
  return randomCard();
  //draw fr
}

type Pile = Card[];

export type PlayerActor = Actor<ActorContext, ActorEvent>;

interface ActorStateSchema {
  states: {
    generatingPile: {};
    active: {};
    inactive: {};
  };
}

export interface ActorContext {
  identity: "" | "player1" | "player2";
  pile: Card[];
  hand: Card[];
  tempPile: Card[];
  selectedCard: number;
}

export type SelectCardEvent = {
  type: "SELECT_CARD";
  index: number;
};

type ActorEvent =
  | {
      type: "BEGIN_TURN" | "PLAY_CARD" | "SAVE_CARD" | "TURN_ENDED";
    }
  | SelectCardEvent;

export const actorMachine = Machine<ActorContext, ActorStateSchema, ActorEvent>(
  {
    id: "player",
    initial: "generatingPile",
    context: {
      identity: "",
      pile: [],
      hand: [],
      selectedCard: 0,
      tempPile: []
    },
    states: {
      generatingPile: {
        on: {
          "": {
            actions: assign({
              hand: _ => generatePlayerHand(),
              pile: _ => generatePlayerPile()
            }),
            target: "inactive"
          }
        }
      },
      inactive: {
        on: {
          BEGIN_TURN: "active"
        }
      },
      active: {
        entry: sendParent("DRAW_CARD"),
        on: {
          SELECT_CARD: {
            actions: assign({
              selectedCard: (context, event) => event.index
            })
          },
          PLAY_CARD: [
            {
              actions: assign({
                hand: (context, event) => {
                  return context.selectedCard !== 0
                    ? context.hand.filter(
                        (card: Card, index: number) =>
                          index !== context.selectedCard - 1
                      )
                    : context.hand;
                },
                pile: (context, event) => {
                  return context.selectedCard === 0
                    ? context.pile.slice(1)
                    : context.pile;
                },
                selectedCard: (context, event) => 0
              }),
              cond: (context, event) => context.pile.length !== 1
            },
            {
              actions: sendParent("GAME_WON")
            }
          ],
          SAVE_CARD: {
            actions: assign({
              tempPile: (context: ActorContext, event) =>
                context.tempPile.concat(
                  context.hand.splice(context.selectedCard + 1, 1)
                ),
              selectedCard: (context, event) => 0
            }),
            target: "inactive"
          }
        },
        exit: sendParent(
          (context: any) =>
            ({
              type: "TURN_ENDED",
              identity: context.identity
            } as TurnEndedEvent)
        )
      }
    }
  }
);
