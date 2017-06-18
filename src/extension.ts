'use strict';

import * as vscode from 'vscode';

import * as child from 'child_process';

import { GoTestsProvider } from './go-tests-provider';

export function activate(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.rootPath;

    var goTestsProvider = new GoTestsProvider(rootPath);
    vscode.window.registerTreeDataProvider('goTests', goTestsProvider);



    let disposable = vscode.commands.registerCommand('gotests.package', (arg: string) => {
        const testCmd = `go test ${arg}`;
        child.exec(testCmd)
            .on('exit', code => {
                if (code != 0) {
                    vscode.window.showErrorMessage('Test(s) failed');
                } else {
                    vscode.window.showInformationMessage('Test(s) succeded');
                }
            });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
