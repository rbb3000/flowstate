import * as vscode from 'vscode';
import { GlobalState } from './types';
import { connectSlack, endSession, findNumberInString, setSlackStatus } from './functions';
import { checkIfNumber, generateStatusBarText } from './helperFunctions';

let countdown: NodeJS.Timer;

export const showInput = (context: vscode.ExtensionContext, statusBarItem: vscode.StatusBarItem, setStatusBarTextAndTime: (text: string, time: number) => void) => {
    const sessionObjective = context.globalState.get(GlobalState.sessionObjective);

	if(!sessionObjective){
		vscode.window.showInputBox({
			prompt: "What is your objective and how much time do you plan for this session?",
			placeHolder: "e.g. Fix Sidebar 20 min"
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
				context.globalState.update(GlobalState.slackStatus, undefined);
				return;
			}

			if (value !== undefined) {
				
				setStatusBarTextAndTime('$(rocket) Starting session...', 0);


			  let [sessionTime, newSessionObjective] = findNumberInString(value);

              
              statusBarItem.show();

              context.globalState.update(GlobalState.isFlowState, true);

			  context.globalState.update(GlobalState.userId, userId);

				// use 45 as default if no number found
				sessionTime = sessionTime ? sessionTime : 45;

			  let secondsRemaining = sessionTime * 60;

			  context.globalState.update(GlobalState.sessionObjective, newSessionObjective);
			  context.globalState.update(GlobalState.secondsRemaining, secondsRemaining);

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
					clearInterval(countdown);
					vscode.window.showInformationMessage('Session finished!');
					endSession(context, statusBarItem);
					setStatusBarTextAndTime('$(coffee)', 0);
				}
			};
	
			// Set an interval to update every second
			countdown = setInterval(updateCountdown, 1000);
			} else {
			  // vscode.window.showInformationMessage('Input box was cancelled');
			}
		  });
	} else {
		vscode.window.showInputBox({
			prompt: 'End session?',
			placeHolder: 'Type "y" to confirm, ESC to cancel'
		  }).then(value => {
			if(value === 'y' || value === 'yes'){
				
				endSession(context, statusBarItem);
				clearInterval(countdown);
				vscode.window.showInformationMessage(`Session "${sessionObjective}" ended`);
			}
		  });
	}
};
