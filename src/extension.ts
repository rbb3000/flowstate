// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showWelcomeMessage } from './functions';
import { GlobalState } from './types';
import { showInput } from './inputbox';


// Initialize a Slack Web API client
// const slackClient = new WebClient(process.env.SLACK_API_TOKEN);


// Types
enum ColorTypes {
	statusBackground = "statusBar.background",
	statusDebuggingBackground = "statusBar.debuggingBackground",
}

export type EntryType = {
	time: number, lines: number, characters: number, objective: string, rating?: number
};

let statusBarIcon:vscode.StatusBarItem;

const setStatusBarTextAndTime = (text: string, time: number) => {
	if(time > 0){
		statusBarIcon.text = `${text} | ${Math.floor(time/60 + 1)} min left`;
	} else {
		statusBarIcon.text = text;
	}
};

// Dev
const minutes = 0.1;
const timePeriod = 4;

// Immutable values	`
// const minutes = 0.5;
// const timePeriod = 4;
const charsToFlow = 10;
const dimColor = 80;
const timeline: Array<EntryType> = [];


// This method is called when the extension is activated
// The extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)

	const returningUser = context.globalState.get(GlobalState.returningUser);

	// context.globalState.update(GlobalState.userId, undefined);
	// context.globalState.update(GlobalState.isFlowState, undefined);
	// context.globalState.update(GlobalState.secondsRemaining, undefined);
	// context.globalState.update(GlobalState.sessionObjective, undefined);
	// context.globalState.update(GlobalState.returningUser, undefined);
	// context.globalState.update(GlobalState.timerId, undefined);
	// context.globalState.update(GlobalState.slackStatus, undefined);
	
	if(!returningUser){
		showWelcomeMessage(context);
	}

	// create a new status bar item
	statusBarIcon = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);

	// Add a click event listener to the status bar item
	statusBarIcon.command = "flowstate.showInputBox";

	// update view once at start
	statusBarIcon.tooltip = "Click to show input box"; // Tooltip for the status bar item
	
	// set initial icon
	statusBarIcon.text = `$(coffee)`;

	// Listeners

	// register listener to collect changes made to text doc
	// context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => updateAddedContent(e)));

	// Commands

	// Add the showInputBox to the context subscriptions
	context.subscriptions.push(vscode.commands.registerCommand('flowstate.showInputBox', () => {
		showInput(context, statusBarIcon, setStatusBarTextAndTime);
	}));

	// context.subscriptions.push(vscode.commands.registerCommand('flowstate.start', () => {
	// 	startPolling();
	// }));

	context.subscriptions.push();

	// show icon
	statusBarIcon.show();
	// updateView();
}



// This method is called when your extension is deactivated
export const deactivate = () => {
	const config = vscode.workspace.getConfiguration();
	// resetThemeColor(config);
};
