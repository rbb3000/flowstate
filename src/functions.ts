import * as vscode from 'vscode';
import { WebClient } from '@slack/web-api';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import { checkIfNumber, generateStatusBarText, getTimerId, writeToFile } from './helperFunctions';
import { EntryType } from './extension';
import { updateSlack } from './api';
import { baseUrl } from './constants';
import { GlobalState } from './types';
import { getWebviewContent } from './webviewFunctions';

export const showInput = (context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem, setStatusBarTextAndTime: (text: string, time: number) => void) => {
    const sessionObjective = context.globalState.get(GlobalState.sessionObjective);


	if(sessionObjective === '' || !sessionObjective){
		vscode.window.showInputBox({
			prompt: "What is your objective and how much time do you plan for this session?",
			placeHolder: "Session objective : time in minutes"
		  }).then(async (value) => {

			const userId: string | undefined = context.globalState.get(GlobalState.userId);

			if (value === '--resetslack'){
				vscode.window.showInformationMessage('Slack token reset.');
				context.globalState.update(GlobalState.userId, undefined);
				connectSlack(context);
				return;
			}

			if (value === '--resetonboarding'){
				vscode.window.showInformationMessage('Onboarding reset.');
				context.globalState.update(GlobalState.returningUser, undefined);
				return;
			}

			if (value === '--resetglobalstate'){
				context.globalState.update(GlobalState.userId, undefined);
				context.globalState.update(GlobalState.isFlowState, undefined);
				context.globalState.update(GlobalState.secondsRemaining, undefined);
				context.globalState.update(GlobalState.sessionObjective, undefined);
				context.globalState.update(GlobalState.returningUser, undefined);
				context.globalState.update(GlobalState.timerId, undefined);
				context.globalState.update(GlobalState.slackStatus, undefined);
				return;
			}

			if (value !== undefined) {
			  const [newSessionObjective, newSessionTimeString] = value.split(':');
              
              statusBarItem.show();

              context.globalState.update(GlobalState.isFlowState, true);

			  context.globalState.update(GlobalState.userId, userId);

			  const sessionTime = checkIfNumber(newSessionTimeString) ? Number(newSessionTimeString) : 45;

			  let secondsRemaining = sessionTime * 60;

			  context.globalState.update(GlobalState.secondsRemaining, secondsRemaining);
			  context.globalState.update(GlobalState.sessionObjective, newSessionObjective);

			  if(userId){
				  let statusSet = await setSlackStatus(userId, sessionTime);
				  context.globalState.update(GlobalState.slackStatus, statusSet);
			  }

			  const updateCountdown = () => {
				if (secondsRemaining > 0) {
					secondsRemaining--;
					context.globalState.update(GlobalState.secondsRemaining, secondsRemaining);
					setStatusBarTextAndTime(generateStatusBarText(newSessionObjective), secondsRemaining);
				} else {
					vscode.window.showInformationMessage('Session finished!');
					endSession(context);
					setStatusBarTextAndTime('$(coffee)', 0);
				}
			};
	
			// Set an interval to update every second
			updateCountdown(); // Initial call to display immediately
			const countdown = setInterval(updateCountdown, 1000);
			context.globalState.update(GlobalState.timerId, JSON.stringify(countdown));
			  
			  // vscode.window.showInformationMessage(`You entered: ${value}`);
			} else {
			  // vscode.window.showInformationMessage('Input box was cancelled');
			}
		  });
	} else {
		vscode.window.showInputBox({
			prompt: 'Are you happy with your session?',
			placeHolder: 'Rate 1-10'
		  }).then(value => {
			if ( checkIfNumber(value)) {
				// addTimelineEntry( Number(value));
				deactivateFlowState(context, statusBarItem);
				vscode.window.showInformationMessage(`Session "${sessionObjective}" ended`);
				endSession(context);
				setStatusBarTextAndTime('$(coffee)', 0);
			} else {
			  vscode.window.showInformationMessage(`Continuing session "${sessionObjective}"`);
			}
		  });
	}
};

export const endSession = (context: vscode.ExtensionContext) => {
	const countdown = context.globalState.get(GlobalState.timerId);
	if(countdown){
		clearInterval(countdown as any);
	}

	context.globalState.update(GlobalState.isFlowState, false);
	context.globalState.update(GlobalState.timerId, undefined);
	context.globalState.update(GlobalState.sessionObjective, '');
	context.globalState.update(GlobalState.secondsRemaining, 0);
};
export const setSlackStatus = async (userid: string, time: number) => {
	try{
		await updateSlack(userid, time);
		return true;
	} catch {
		return false;
	}

};

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

export const deactivateFlowState = (context: vscode.ExtensionContext, myStatusBarItem: vscode.StatusBarItem) => {
	const config = vscode.workspace.getConfiguration();
	// resetThemeColor(config);
	myStatusBarItem.text = `$(coffee)`;
	myStatusBarItem.show();
	context.globalState.update(GlobalState.isFlowState, false);
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