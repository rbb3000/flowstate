// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { darkenHexColor } from './functions';

// Types
enum ColorTypes {
	statusBackground = "statusBar.background",
	statusDebuggingBackground = "statusBar.debuggingBackground",
}

// Mutable values
let myStatusBarItem: vscode.StatusBarItem;
let addedLinesTotal = 0;
let addedCharactersTotal = 0;
let movingAverage = {chars: 0, lines: 0};
let standardThemeConfig: Record<string, {[ColorTypes.statusBackground]: string, [ColorTypes.statusDebuggingBackground]: string}>;
let isFlowState = false;

const charsToFlow = 10;


// Immutable values
const dimColor = 80;
const timeline: Array<{time: number, lines: number, characters: number}> = [];


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, the extension "flowstate" is now active!');

	// TODO: test for light and dark theme

	// update the workbench color customizations
	const config = vscode.workspace.getConfiguration();

    const colorCustomizations: any = config.get('colorCustomizations') || {};

	// check if user has custom theme installed

	if(Object.keys(colorCustomizations).length > 0){
		// handle it if user has custom theme
		standardThemeConfig = colorCustomizations;
	} else {
		standardThemeConfig = {...colorCustomizations, [ColorTypes.statusBackground]: (colorCustomizations[ColorTypes.statusBackground] ? colorCustomizations[ColorTypes.statusBackground] : '#007acc'), [ColorTypes.statusDebuggingBackground]: colorCustomizations[ColorTypes.statusDebuggingBackground] ? colorCustomizations[ColorTypes.statusDebuggingBackground] : '#007acc'};
	}

	

	// register a command that is invoked when the status bar
	// item is selected
	const myCommandId = 'flowstate.start';
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
		startPolling();
	}));

	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, dimColor);
	myStatusBarItem.command = myCommandId;
	context.subscriptions.push(myStatusBarItem);

	// register listener to collect changes made to text doc
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => updateAddedContent(e)));

	// update view once at start
	myStatusBarItem.text = `$(coffee)`;
	myStatusBarItem.show();
	updateView();
}

const updateThemeColor = async () => {
	// Update the workbench color customizations
	const config = vscode.workspace.getConfiguration();

	// console.log('standard theme config', standardThemeConfig[ColorTypes.statusBackground]);

	const updatedCustomizations = {
		[ColorTypes.statusBackground]: darkenHexColor(String(standardThemeConfig[ColorTypes.statusBackground]), dimColor),
		[ColorTypes.statusDebuggingBackground]: darkenHexColor(String(standardThemeConfig[ColorTypes.statusBackground]), dimColor)
	};

	const updatedColorCustomizations = { ...standardThemeConfig, ...updatedCustomizations };
	
	// console.log('updatedcolors:', updatedColorCustomizations);
	
	//todo: reset the colors

	await config.update('workbench.colorCustomizations', updatedColorCustomizations, vscode.ConfigurationTarget.Global)
		// .then(() => {
		// 	vscode.window.showInformationMessage('Theme color updated!');
		// }, (err) => {
		// 	vscode.window.showErrorMessage(`Failed to update theme color: ${err.message}`);
		// });
};

const resetThemeColor = async () => {
	const config = vscode.workspace.getConfiguration();
	// vscode.window.showInformationMessage('Reset theme color!');

	config.update('workbench.colorCustomizations', standardThemeConfig, vscode.ConfigurationTarget.Global);
};

const updateAddedContent = (e: vscode.TextDocumentChangeEvent) => {
	const addedLines = e.contentChanges.reduce((acc, change) => {
		if(change.text.match(/\n/g)){
			return acc + 1;
		}
		return 0;
	}, 0);

	const addedCharacters = e.contentChanges.reduce((acc, change) => {
		if(change.text.length > 0){
			return acc + 1;
		}
		return 0;
	}, 0);

	addedCharactersTotal += addedCharacters;
	addedLinesTotal += addedLines;
};

const updateView = (): void => {
	if(!isFlowState && movingAverage.chars > charsToFlow){ // define flow state
		updateThemeColor();
		myStatusBarItem.text = `$(rocket)`;
		myStatusBarItem.show();
		isFlowState = true;
	} else if (isFlowState && movingAverage.chars <= charsToFlow) {
		resetThemeColor();
		myStatusBarItem.text = `$(coffee)`;
		myStatusBarItem.show();
		isFlowState = false;
	}
};

const getNumberOfSelectedLines = (editor: vscode.TextEditor | undefined): number => {
	let lines = 0;
	if (editor) {
		lines = editor.selections.reduce((prev, curr) => prev + (curr.end.line - curr.start.line), 0);
	}
	return lines;
};

const startPolling = () => {

	const minutes = 1;

    const pollingInterval = minutes * 60 * 1000; // Poll every x min

	const addTimelineEntry = () => {
		const time = new Date().getTime(); // Current time in ms

		timeline.push({time, lines: addedLinesTotal, characters: addedCharactersTotal}); // Add added characters in last time interval

		// Reset counts
		addedCharactersTotal = 0;
		addedLinesTotal = 0;

		// Only select timeperiod for moving average
		const timePeriod = 3;

		const movingTotal = timeline.slice(-timePeriod).reduce((acc, curr) => {
			return {chars: acc.chars + curr.characters, lines: acc.lines + curr.lines};
		}, {chars:0, lines:0});

		if(timeline.length >= timePeriod){
			// Set moving average
			movingAverage = {chars: movingTotal.chars / timePeriod, lines: movingTotal.lines / timePeriod};
		}

		updateView();
	};

    setInterval(addTimelineEntry, pollingInterval);
};

// This method is called when your extension is deactivated
export const deactivate = () => {
	resetThemeColor();
};
