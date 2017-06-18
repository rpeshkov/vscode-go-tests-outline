import * as vscode from 'vscode';
import * as fs from 'fs';
import * as child from 'child_process';

import { Package } from './model/package';
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

        if (element) {
            return new Promise(resolve => resolve(this.getTestsForPackage(element.pkg)));
        } else {
            return new Promise(resolve => resolve(this.getTestsInFolder(this.workspaceRoot)));
        }


	}

    private getTestsInFolder(packageJsonPath: string): GoTest[] | PromiseLike<GoTest[]> {

        return new Promise(resolve => {
            const items: GoTest[] = [];
            this.goUtils.getTestFiles(packageJsonPath)
                .then(packages => {
                    for (const p of packages) {
                        const cmd = {
                            command: 'gotests.package',
                            title: '',
                            arguments: [p.name],
                        };

                        const treeNode = new GoTest(p.name, vscode.TreeItemCollapsibleState.Expanded, p, cmd);
                        items.push(treeNode);
                    }

                    resolve(items)
                });
        });
	}

    private getTestsForPackage(pkg: Package) {
        const testFunctions = this.goUtils.getTestFunctions(pkg);
        const items: GoTest[] = [];

        for (const func of testFunctions) {
            const cmd = {
                            command: 'gotests.package',
                            title: '',
                            arguments: [func],
                        };
            items.push(new GoTest(func, vscode.TreeItemCollapsibleState.None, pkg, cmd));
        }
        return items;
    }

}

