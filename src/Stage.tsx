import {ReactElement} from "react";
import {StageBase, StageResponse, InitialData, Message, Character} from "@chub-ai/stages-ts";
import {LoadResponse} from "@chub-ai/stages-ts/dist/types/load";


type MessageStateType = any;

type ConfigType = any;

type InitStateType = any;

type ChatStateType = any;


export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {


    // Configuration:
    boardScale: number = 75;

    // Message State:
    currentSpace: {[key: string]: number};
    previousSpace: {[key: string]: number};
    currentTurn: string;

    // Other variables:
    characterIds: string[];
    userId: string = '';

    constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {

        super(data);
        const {
            characters,
            users,
            config,
            messageState,
            environment,
            initState,
            chatState
        } = data;
        this.currentSpace = {};
        this.previousSpace = {};
        this.userId = users[Object.keys(users)[0]].name;
        this.characterIds = [];
        this.currentTurn = '';
        for(let character of Object.values(characters)) {
            if (this.characterIds.length < 3) {
                this.characterIds.push(character.name);
            } 
        }

        this.readMessageState(messageState);
        console.log('end constructor()');
    }

    async load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>> {
        return {
            success: true,
            error: null,
            initState: null,
            chatState: null,
        };
    }

    async setState(state: MessageStateType): Promise<void> {
        console.log('setState()');
        this.readMessageState(state ?? {});
        console.log('end setState()');
    }

    writeMessageState(): MessageStateType {
        console.log('writeMessageState()');
        return {currentSpace: this.currentSpace ?? {},
                previousSpace: this.previousSpace ?? {},
                currentTurn: this.currentTurn ?? ''
        };
    }

    async readMessageState(state: MessageStateType) {
        console.log('readMessageState()');
        if (state) {
            this.currentSpace = state.currentSpace ?? {};
            this.previousSpace = state.previousSpace ?? {};
            this.currentTurn = state.currentTurn ?? '';
        }
        console.log('end readMessageState()');
    }

    async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        const { 
            content,
            promptForId
        } = userMessage;
        console.log('beforePrompt()');

        let aiNote: string|null  = '';
        let boardRendering: string|null = null;

        if (this.currentTurn == '') {
            // You know, C&L, like the kids play
            if (['play chutes and ladders', 'play chutes & ladders', 'play a board game', 'play C&L', 'play C & L'].filter(phrase => content.toLowerCase().indexOf(phrase) > -1).length > 0) {
                // Start a game of Chutes and Ladders!

                this.currentTurn = this.userId;
                aiNote = `{{user}} wants to play Chutes and Ladders, and {{char}} will play agree as they set up the board. The game hasn't started yet, though.`;
            }
        } else if (['knock the board', 'throw the board', 'spill the pieces', 'knock over the board', 'bump the board'].filter(phrase => content.toLowerCase().indexOf(phrase) > -1).length > 0) {
            aiNote = `{{user}} has messed up the board; {{char}} will consider this as {{user}} forfeiting--therefore, losing the game.`;
            this.currentTurn = '';
        } else {
            // Playing; check if it's player's turn and see if they made their move.
            const move = true;

            if (move) {
                
            } else {
                aiNote = `{{user}} didn't take their turn. {{char}} should spend some time chatting, bantering, or antagonizing them, but it will remain {{user}}'s turn.`;
            }
            //aiNote = `{{char}} and {{user}} are playing chess; ${(this.wins + this.losses + this.draws > 0) ? `{{user}} has a record of ${this.wins}-${this.losses}-${this.draws} against {{char}}` : `this is their first game together`}.\n` +
            //            `${aiNote}\nThis response should focus upon recent moves, {{char}}'s reactions to the current state of the board, and any ongoing conversation or banter from {{char}}. The game is waiting for {{user}}'s next move, which will happen later. For reference, this is the board's current FEN: ${getFen(this.gameState)}`;
        }
        if (aiNote.trim() != '') {
            //aiNote = this.replaceTags(`[RESPONSE GUIDE]${aiNote}[/RESPONSE GUIDE]`, {"user": this.user.name, "char": promptForId ? this.characters[promptForId].name : ''});
            //console.log(aiNote);
        } else {
            aiNote = null;
        }
        console.log('end beforePrompt()');
        return {
            stageDirections: aiNote,
            messageState: this.writeMessageState(),
            modifiedMessage: null,
            systemMessage: null,
            error: null,
            chatState: null,
        };
    }

    async afterResponse(botMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        console.log('afterResponse()');
        let boardRendering: string|null = null;
        if (this.currentTurn != '') {
            boardRendering = this.buildBoard();
        }
        console.log('end afterResponse()');

        return {
            stageDirections: null,
            messageState: this.writeMessageState(),
            modifiedMessage: null,
            error: null,
            systemMessage: this.buildBoard(),
            chatState: null
        };
    }

    buildBoard() {
        let result = `---\n`;
        result += `<div style="width: ${this.boardScale}%; padding-bottom: ${this.boardScale}%; border: 4px solid red; border-radius: 4px; position: relative; display: table;">` + 
                `<div style="width:100%; height: 100%; position: absolute; top: 0; left: 0; background-image: url('https://i.imgur.com/jUxnE9a.png');"></div>`;
        Object.keys(this.currentSpace).forEach((key, index) => {
            console.log(`Index: ${index}, Key: ${key}, Value: ${this.currentSpace[key]}`);
            const space = this.currentSpace[key];
            result += `<div style="width: ${this.boardScale * 0.2}%; height: ${this.boardScale * 0.2}%; position: absolute; left: ${5 + (space % 10) * 9}%; bottom: ${5 + Math.floor(space / 10) * 9}%` +
                    `background-image: url('https://i.imgur.com/L1MLIuJ.png'); background-size: 400% 300%; background-position: 100% 100%; filter: saturate(200%) brightness(70%) hue-rotate(330deg);></div>`;
            });
            
        result += `</div>`;
        return `${result}`;
    }


    render(): ReactElement {

        return <></>;
    }

}
