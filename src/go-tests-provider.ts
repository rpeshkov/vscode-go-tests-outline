import * as vscode from 'vscode';
import * as fs from 'fs';
import * as child from 'child_process';

import { GoTest } from './go-test';

export class GoTestsProvider implements vscode.TreeDataProvider<GoTest> {

    constructor(private workspaceRoot: string) {
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
            const listCmd = 'go list -f \'{{.ImportPath}} {{join .TestGoFiles ","}}\' ./...';
            child.exec(listCmd, { cwd: packageJsonPath }, (err, stdout: string, stderr) => {
                const packages = stdout.split('\n');
                const items: GoTest[] = [];
                for (const p of packages) {
                    const [pkgName, testFiles] = p.split(' ');

                    // Skip vendors and packages without tests
                    if (pkgName.trim().length === 0 || pkgName.includes('/vendor/') || testFiles.trim().length === 0) {
                        continue;
                    }

                    items.push(new GoTest(pkgName, vscode.TreeItemCollapsibleState.None, {
   						command: 'gotests.package',
						title: '',
						arguments: [pkgName],

                    }));
                }

                resolve(items);
            });
        });
	}

}

