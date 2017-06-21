'use strict';

import * as vscode from 'vscode';

import * as child from 'child_process';

import { GoTestsProvider } from './go-tests-provider';
import { TreeNode, TreeNodeType } from './model/tree-node';
import { GoTest } from './utils/go-test';

export function activate(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.rootPath;
    const outputChannel = vscode.window.createOutputChannel("Go Tests Outline");

    const goTestsProvider = new GoTestsProvider(rootPath);
    vscode.window.registerTreeDataProvider('goTests', goTestsProvider);

    const goTest = new GoTest(outputChannel);

    vscode.commands.registerCommand('gotests.launch', (test: TreeNode) => {
        test = test || goTestsProvider.selected;
        goTest.launch(test.pkgName, test.funcName)
            .then(code => {
                handleResult(code);
                outputChannel.show();
            });
    });

    vscode.commands.registerCommand('gotests.launch_all', () => {
        goTest.launch()
            .then(code => {
                handleResult(code);
                outputChannel.show();
            });
    });

    vscode.commands.registerCommand('gotests_internal.select', (node: TreeNode) => goTestsProvider.selected = node);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function handleResult(code: number) {
    if (code != 0) {
        vscode.window.showErrorMessage('Test(s) failed');
    } else {
        vscode.window.showInformationMessage('Test(s) succeded');
    }
}
