'use strict';

import * as vscode from 'vscode';

import * as child from 'child_process';

import { GoTestsProvider } from './go-tests-provider';

export function activate(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.rootPath;

    var goTestsProvider = new GoTestsProvider(rootPath);
    vscode.window.registerTreeDataProvider('goTests', goTestsProvider);

    context.subscriptions.push(vscode.commands.registerCommand('gotests.package', (pkgName: string) => {
        const testCmd = `go test ${pkgName}`;
        child.exec(testCmd)
            .on('exit', code => {
                if (code != 0) {
                    vscode.window.showErrorMessage('Test(s) failed');
                } else {
                    vscode.window.showInformationMessage('Test(s) succeded');
                }
            });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('gotests.function', (pkgName: string, funcName: string) => {
        const testCmd = `go test -run '^${funcName}$' ${pkgName}`;
        child.exec(testCmd)
            .on('exit', code => {
                if (code != 0) {
                    vscode.window.showErrorMessage('Test(s) failed');
                } else {
                    vscode.window.showInformationMessage('Test(s) succeded');
                }
            });
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
