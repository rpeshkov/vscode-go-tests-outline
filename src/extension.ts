'use strict';

import * as vscode from 'vscode';

import * as child from 'child_process';

import { GoTestsProvider } from './go-tests-provider';
import { TreeNode, TreeNodeType } from './model/tree-node';

export function activate(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.rootPath;

    const goTestsProvider = new GoTestsProvider(rootPath);
    vscode.window.registerTreeDataProvider('goTests', goTestsProvider);

    const outputChannel = vscode.window.createOutputChannel("Go Tests Outline");

    context.subscriptions.push(vscode.commands.registerCommand('gotests.launch', (test: TreeNode) => {
        test = test || goTestsProvider.selected;
        let testCmd = '';

        switch (test.type) {
            case TreeNodeType.package:
                testCmd = `go test -v ${test.pkgName}`;
                break;
            case TreeNodeType.func:
                testCmd = `go test -v -run '^${test.funcName}$' ${test.pkgName}`;
                break;
        }

        child.exec(testCmd, {cwd: vscode.workspace.rootPath}, (e, stdout: string, stderr) => outputChannel.appendLine(stdout))
            .on('exit', code => {
                if (code != 0) {
                    vscode.window.showErrorMessage('Test(s) failed');
                } else {
                    vscode.window.showInformationMessage('Test(s) succeded');
                }
                outputChannel.show();
            });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('gotests.launch_all', () => {
        const testCmd = `go test -v ./...`;
        child.exec(testCmd, {cwd: vscode.workspace.rootPath}, (e, stdout: string, stderr) => outputChannel.appendLine(stdout))
            .on('exit', code => {
                if (code != 0) {
                    vscode.window.showErrorMessage('Test(s) failed');
                } else {
                    vscode.window.showInformationMessage('Test(s) succeded');
                }

                outputChannel.show();
            });
    }));

    vscode.commands.registerCommand('gotests_internal.select', (node: TreeNode) => goTestsProvider.selected = node);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
