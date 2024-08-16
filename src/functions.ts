import * as vscode from 'vscode';
import { randomUUID } from 'crypto';
import { updateSlack } from './api';
import { baseUrl } from './constants';
import { GlobalState } from './types';
import { getWebviewContent } from './webviewFunctions';

export const endSession = (context: vscode.ExtensionContext, myStatusBarItem: vscode.StatusBarItem) => {
	context.globalState.update(GlobalState.isFlowState, false);
	context.globalState.update(GlobalState.sessionObjective, undefined);
	context.globalState.update(GlobalState.secondsRemaining, 0);

	myStatusBarItem.text = `$(coffee)`;
	myStatusBarItem.show();
};

export const setSlackStatus = async (userid: string, time: number) => {
	try{
		await updateSlack(userid, time);
		return true;
	} catch {
		return false;
	}

};

export const findNumberInString = (input: string): [number | undefined, string] => {
    if (typeof input !== 'string') {return [undefined, input]};

    // Regular expression to match numbers with optional space and "min" or "minutes" after them
    const regex = /(\d+)(\s*(min|minutes))?/g;
    let matches = [];
    let match;

    // Find all matches in the string
    while ((match = regex.exec(input)) !== null) {
        matches.push({ number: Number(match[1]), index: match.index, length: match[0].length });
    }

    if (matches.length === 0) {
        return [undefined, input.trim()];
    }

    // Sort matches: prioritize those with "min" or "minutes" and then by their index (reverse order)
    matches.sort((a, b) => {
        const aHasMin = /min|minutes/.test(input.slice(a.index));
        const bHasMin = /min|minutes/.test(input.slice(b.index));

        if (aHasMin && !bHasMin) {return 1};
        if (!aHasMin && bHasMin) {return -1};

        return b.index - a.index;
    });

    // Get the best match
    const bestMatch = matches[0];

    // Remove the matched portion including the "min" or "minutes" part
    let resultString = input.slice(0, bestMatch.index) + input.slice(bestMatch.index + bestMatch.length);
    resultString = resultString.replace(/\s+/g, ' ').trim(); // Clean up any extra whitespace

    // Return the number and the rest of the string
    return [bestMatch.number, resultString];
}

export const connectSlack = async (context: vscode.ExtensionContext) => {
		const userid = randomUUID();
		const uri = vscode.Uri.parse(baseUrl+ `/auth/slack?userid=${userid}`);
		const success = await vscode.env.openExternal(uri);
		if(success){
			context.globalState.update(GlobalState.userId, userid);
			vscode.window.showInformationMessage(`Slack connected.`);
			return userid;
		} else {
			vscode.window.showErrorMessage(`Failed to open URL, Slack not connected.`);
			return undefined;
		}

};


export const showWelcomeMessage = (context: vscode.ExtensionContext) => {
	const panel = vscode.window.createWebviewPanel(
        'welcome', // Identifies the type of the webview. Used internally
        'Welcome to Flowstate!', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in
        {
            enableScripts: true // Enable scripts in the webview
        }
    );

    panel.webview.html = getWebviewContent(context, panel);

	    // Listen for messages from the webview
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'connectSlack':
						vscode.window.showInformationMessage('Connecting slack..');
						// Trigger further actions or commands here
						// showHelpPanel(context);
						connectSlack(context);
						return;
				}
			},
			undefined,
			context.subscriptions
		);

	context.globalState.update(GlobalState.returningUser, true);
};


// export const resetThemeColor = async (config: vscode.WorkspaceConfiguration) => {
// 	// vscode.window.showInformationMessage('Reset theme color!');

// 	config.update('workbench.colorCustomizations', standardThemeConfig, vscode.ConfigurationTarget.Global);
// };

// export const updateAddedContent = (e: vscode.TextDocumentChangeEvent) => {
// 	const addedLines = e.contentChanges.reduce((acc, change) => {
// 		if(change.text.match(/\n/g)){
// 			return acc + 1;
// 		}
// 		return 0;
// 	}, 0);

// 	const addedCharacters = e.contentChanges.reduce((acc, change) => {
// 		if(change.text.length > 0){
// 			return acc + 1;
// 		}
// 		return 0;
// 	}, 0);

// 	addedCharactersTotal += addedCharacters;
// 	addedLinesTotal += addedLines;
// };

// export const updateView = (): void => {
// 	const config = vscode.workspace.getConfiguration();

// 	//in flow
// 	if((!isFlowState && movingAverage.chars > charsToFlow) || sessionObjective){ // define flow state
// 		activateFlowState();
// 	//in break
// 	} else if (isFlowState && movingAverage.chars <= charsToFlow) {
// 		deactivateFlowState();
// 	}
// };

// export const startPolling = () => {

//     const pollingInterval = minutes * 60 * 1000; // Poll every x min

//     setInterval(() => addTimelineEntry(), pollingInterval);
// };


// export const updateThemeColor = async (config: vscode.WorkspaceConfiguration) => {
// 	// Update the workbench color customizations

// 	// console.log('standard theme config', standardThemeConfig[ColorTypes.statusBackground]);

// 	const updatedCustomizations = {
// 		[ColorTypes.statusBackground]: darkenHexColor(String(standardThemeConfig[ColorTypes.statusBackground]), dimColor),
// 		[ColorTypes.statusDebuggingBackground]: darkenHexColor(String(standardThemeConfig[ColorTypes.statusBackground]), dimColor)
// 	};

// 	const updatedColorCustomizations = { ...standardThemeConfig, ...updatedCustomizations };
	
// 	// console.log('updatedcolors:', updatedColorCustomizations);
	
// 	//todo: reset the colors

// 	await config.update('workbench.colorCustomizations', updatedColorCustomizations, vscode.ConfigurationTarget.Global);
// 		// .then(() => {
// 		// 	vscode.window.showInformationMessage('Theme color updated!');
// 		// }, (err) => {
// 		// 	vscode.window.showErrorMessage(`Failed to update theme color: ${err.message}`);
// 		// });
// };

// export const addTimelineEntry = (rating?: number, pushTimeline = (v: EntryType): void => {}) => {
// 	// vscode.window.showInformationMessage('Polling!');
// 	// vscode.window.showInformationMessage(`${movingAverage.chars}`);
	
// 	const time = new Date().getTime(); // Current time in ms

//     pushTimeline({time, lines: addedLinesTotal, characters: addedCharactersTotal, objective: sessionObjective, rating: rating }); // Add added characters in last time interval

// 	// Reset counts
// 	addedCharactersTotal = 0;
// 	addedLinesTotal = 0;

// 	// Only select timeperiod for moving average

// 	const movingTotal = timeline.slice(-timePeriod).reduce((acc, curr) => {
// 		return {chars: acc.chars + curr.characters, lines: acc.lines + curr.lines};
// 	}, {chars:0, lines:0});

// 	// Set moving average
// 	movingAverage = {chars: movingTotal.chars / timePeriod, lines: movingTotal.lines / timePeriod};
	
// 	writeToFile(timeline, 'flowstate.txt');
// 	updateView();
// };

// export const setColorCustomization = () => {
// 		// update the workbench color customizations
// 		const config = vscode.workspace.getConfiguration();

// 		const colorCustomizations: any = config.get('colorCustomizations') || {};

// 		if(Object.keys(colorCustomizations).length > 0){
// 			// handle it if user has custom theme
// 			return colorCustomizations;
// 		} else {
// 			return {...colorCustomizations, [ColorTypes.statusBackground]: (colorCustomizations[ColorTypes.statusBackground] ? colorCustomizations[ColorTypes.statusBackground] : '#007acc'), [ColorTypes.statusDebuggingBackground]: colorCustomizations[ColorTypes.statusDebuggingBackground] ? colorCustomizations[ColorTypes.statusDebuggingBackground] : '#007acc'};
// 		}
// };