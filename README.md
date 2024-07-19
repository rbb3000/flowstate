# flowstate README

Hello, fellow connoisseur of the Flow State. 

Click the Coffee Icon in the Status Bar after installing the Extension to start.

This extension helps you to get into / and stay in the flow state while coding. Start your session by setting a goal 🏅 and a timer ⏱️ for it. The extension will set you to Do Not Disturb 🙅‍♂️ on Slack for the set time (further integrations coming).

What helps you get into the flow or stay in it? Mention it in the comment section.

<img href="https://dribbble.com/shots/8553709-Flow-state" target="_blank" src="images/lais-lara-flowstate.gif" width="320" />


## 

## Implemented Features

* Click on the small Coffee Icon in your Status Bar to start
* Set your goal 🏅 for the coding session and the time ⏱️ you want to focus (e.g. Finish authentication : 45)
* Connect Slack
* Automatically be set to do not disturb 🙅‍♂️ in slack

Normal State Icon (Status Bar) 

<img src="images/coffee.png" width="40" />

Flow State (Status Bar)

<img src="images/rocket.png" width="40" />

## Next up

* Keep the Flow State alive by disabling as many disturbances as possible
    * Disable notifications in VScode
    * Disable desktop notifications
    * Integrate Slack to set status

* More advanced detection of the Flow State using a self trained machine learning model
    * Train the model with a few developers that rate their Flow State regularly (eg every 20 min)
    * Ship the model to a wider user base that provide ratings only on a daily basis
    * Ship the model to everyone

## Backlog

* Time tracking
* Web dashboard to see time coded and flow periods
* Smart time tracking that summarizes topics worked on
* Set music when in Flow State
* Integrate Teams to set do not disturb status when in Flow State
* Integrate Outlook to set blockers in calendar when in Flow State
* Integrate Outlook to set blockers in calendar when in Flow State

## Requirements

Currently no specific requirements.

## Extension Settings

This extension contributes the following settings:

* `flowstate.enable`: Enable/disable this extension.
* `flowstate.workbench.colorCustomizations`: Dim status bar color.

## Known Issues

No known issues yet.

## Release Notes

### 0.0.2

Initial release of Flow State

* Set goal and timer in status bar
* Automatically set Slack to Do Not Disturb for the set time
