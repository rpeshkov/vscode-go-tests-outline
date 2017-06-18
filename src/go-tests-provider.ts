import * as vscode from 'vscode';
import * as fs from 'fs';
import * as child from 'child_process';

import { GoTest } from './go-test';
import { GoUtils } from './go-utils';

export class GoTestsProvider implements vscode.TreeDataProvider<GoTest> {

    private goUtils: GoUtils;

    constructor(private workspaceRoot: string) {
        this.goUtils = new GoUtils();
	}

    getTreeItem(element: GoTest): vscode.TreeItem {
        return element;
    }

    getChildren(element?: GoTest): Thenable<GoTest[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('Unable to find tests');
			return Promise.resolve([]);
		}

		return new Promise(resolve => resolve(this.getTestsInFolder(this.workspaceRoot)));
	}

    private getTestsInFolder(packageJsonPath: string): GoTest[] | PromiseLike<GoTest[]> {

        return new Promise(resolve => {
            const items: GoTest[] = [];
            this.goUtils.getTestFiles(packageJsonPath)
                .then(packages => {
                    for (const p of packages) {
                        const treeNode = new GoTest(p.name, vscode.TreeItemCollapsibleState.None, {
                            command: 'gotests.package',
                            title: '',
                            arguments: [p.name],
                        });
                        items.push(treeNode);
                    }

                    resolve(items)
                });
        });
	}

}

