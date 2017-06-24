'use strict';

import * as vscode from 'vscode';

import * as child from 'child_process';

import { GoTestsProvider } from './go-tests-provider';
import { TreeNode, TreeNodeType, TestStatus } from './model/tree-node';
import { GoTest } from './utils/go-test';
import { GoTestParser } from './utils/go-test-parser';


let goTestsProvider: GoTestsProvider;

export function activate(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.rootPath;
    const outputChannel = vscode.window.createOutputChannel("Go Tests Outline");

    goTestsProvider = new GoTestsProvider(rootPath);
    vscode.window.registerTreeDataProvider('goTests', goTestsProvider);

    const parser = new GoTestParser();

    const goTest = new GoTest(outputChannel, parser);

    vscode.commands.registerCommand('gotests.launch', (test: TreeNode) => {
        test = test || goTestsProvider.selected;
        goTest.launch(test.pkgName, test.funcName)
            .then(results => {
                handleResult(goTestsProvider.tree, results);
                outputChannel.show();
            });
    });

    vscode.commands.registerCommand('gotests.launch_all', () => {
        goTest.launch()
            .then(results => {
                handleResult(goTestsProvider.tree, results);
                outputChannel.show();
            });
    });

    vscode.commands.registerCommand('gotests_internal.select', (node: TreeNode) => goTestsProvider.selected = node);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function handleResult(nodes: TreeNode[], results: Map<string, boolean>) {
    for (const n of nodes || []) {
        const k = n.funcName || n.pkgName;

        if (results.has(k)) {
            n.status = results.get(k) ? TestStatus.Passed : TestStatus.Failed;
            goTestsProvider.fire(n);
        }

        handleResult(n.child, results);
    }
}
