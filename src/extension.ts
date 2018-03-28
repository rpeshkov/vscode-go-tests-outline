'use strict';

import * as vscode from 'vscode';

import * as child from 'child_process';

import { GoTestsProvider } from './go-tests-provider';
import { TreeNode } from './model/tree-node';
import { GoTest } from './utils/go-test';
import { GoTestParser } from './utils/go-test-parser';

const CFG_SECTION = 'go-tests-outline';

let goTestsProvider: GoTestsProvider;

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration(CFG_SECTION);

    const rootPath = vscode.workspace.rootPath;
    const outputChannel = vscode.window.createOutputChannel('Go Tests Outline');
    const parser = new GoTestParser();
    const goTest = new GoTest(outputChannel, parser, config);

    vscode.workspace.onDidChangeConfiguration(() => {
        goTest.config = vscode.workspace.getConfiguration(CFG_SECTION);
    });

    goTestsProvider = new GoTestsProvider(rootPath, goTest);
    vscode.window.registerTreeDataProvider('goTests', goTestsProvider);

    vscode.commands.registerCommand('gotests.launch', async test => {
        await goTestsProvider.launch(test);
        outputChannel.show();
    });
    vscode.commands.registerCommand('gotests.launch_all', async () => {
        await goTestsProvider.launchAll();
        outputChannel.show();
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}
