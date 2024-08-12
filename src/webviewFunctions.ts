import path = require('path');
import * as vscode from 'vscode';

export const getWebviewContent = (context: vscode.ExtensionContext, panel: vscode.WebviewPanel) => {
    // Resolve the path to the video
    const videoPath = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'media', 'welcome.mp4'))
    );


    const inputExampleImg = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'media', 'inputexample.png'))
    );

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flowstate First Steps</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: #f4f4f4;
                overflow: hidden;
                height:100vh;
            }

            h1 {
                color: #444;
            }

            h2 {
                color: #444;
            }

            h3 {
                color: #696969;
            }

            p {
                font-size: 16px;
                color: #555;
            }

            video {
                height: 240px;
                border-radius: 5px;
            }

            button {
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #007A5A;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.3s;
            }

            button:hover {
                background-color: #014d38;
            }


        </style>
    </head>
    <body>
        <h1>First Steps with Flowstate</h1>
        <h2>Block out notifications when in the flow? Connect your Slack Workspace</h2>
        <button onclick="onConnectSlack()">Connect Slack</button>
        <p></p>
        <h2>Start your session with an intention. Click the coffee icon to start Flowstate</h2>
        <p></p>
        <video autoplay loop muted playsinline>
            <source src="${videoPath}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <script>
            function onConnectSlack() {
                const vscode = acquireVsCodeApi();
                vscode.postMessage({ command: 'connectSlack' });
            }
        </script>
    </body>
    </html>
    `;
}

