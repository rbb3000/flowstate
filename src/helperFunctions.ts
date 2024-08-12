import * as vscode from 'vscode';
import * as fs from 'fs';

export const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const generateStatusBarText = (objective: string) => {
  const maxCharsSessionObjective = 35;
  return `$(rocket)${objective && (' ' + objective.slice(0,maxCharsSessionObjective))}${objective.length > maxCharsSessionObjective ? '...' : ''}`;
};

export const darkenHexColor = (hex: string, amount: number) => {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');

    // Parse the r, g, b values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Make the color darker by decreasing each channel value
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);

    // Convert the r, g, b values back to hex
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const darkenedHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    return darkenedHex;
};

export const checkIfNumber = (n: any) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export const writeToFile = <T>(data: Array<T>, fileName: string) => {

  if (fs.existsSync(fileName)){
    fs.appendFile(fileName, String(data), (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
  } else {
    // Write data in 'Hello.txt' .
    fs.writeFile(fileName, String(data), (err) => {

      // In case of a error throw err.
      if (err) throw err;
    });
  }
};

export const getTimerId = (timeoutObject: any) => {
  const symbols = Object.getOwnPropertySymbols(timeoutObject);

  // Finding the asyncId and triggerId
  const asyncIdSymbol = symbols.find(sym => sym.toString() === 'Symbol(asyncId)');
  const triggerIdSymbol = symbols.find(sym => sym.toString() === 'Symbol(triggerId)');

  // Extracting the IDs
  const asyncId = timeoutObject[asyncIdSymbol!];
  const triggerId = timeoutObject[triggerIdSymbol!];

  return {
      asyncId,
      triggerId
  };
}

// export const disableNotifications = (config: vscode.WorkspaceConfiguration) => {

//     config.update('notifications.enabled', false, vscode.ConfigurationTarget.Global)
//       .then(() => {
//         vscode.window.showInformationMessage(`Notifications are now disabled'}.`);
//       }, (error) => {
//         vscode.window.showErrorMessage('Failed to update notification setting.');
//         console.error(error);
//       });
//   };

//   export const enableNotifications = (config: vscode.WorkspaceConfiguration) => {

//     config.update('notifications.enabled', true, vscode.ConfigurationTarget.Global)
//       .then(() => {
//         vscode.window.showInformationMessage(`Notifications are now enabled'}.`);
//       }, (error) => {
//         vscode.window.showErrorMessage('Failed to update notification setting.');
//         console.error(error);
//       });
//   };