import * as vscode from 'vscode';
import * as fs from 'fs';
import * as child from 'child_process';
import * as path from 'path';

import { GoTest } from './utils/go-test';
import { GoFile } from './utils/go-file';
import { GoList } from './utils/go-list';
import { TreeNode, TreeNodeType } from './model/tree-node';
import { TestStatus } from './model/test-status';

export class GoTestsProvider implements vscode.TreeDataProvider<TreeNode> {

    private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode | null>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private goList: GoList;
    private tree: TreeNode[];
    private selected: TreeNode;

    /**
     * Mapping of status to respective images filenames
     */
    private statusIcons = new Map<TestStatus, string>([
        [TestStatus.Unknown, 'test.svg'],
        [TestStatus.Failed, 'failed.svg'],
        [TestStatus.Passed, 'passed.svg'],
        [TestStatus.Skipped, 'skipped.svg'],
    ]);

    constructor(private workspaceRoot: string, private goTest: GoTest) {
        this.goList = new GoList(workspaceRoot);

        vscode.commands.registerCommand('gotests_internal.select', (node: TreeNode) => this.selected = node);

        vscode.workspace.onDidSaveTextDocument(async x => {
            this.tree = await this.buildTree();
            this._onDidChangeTreeData.fire();
        });
    }

    getTreeItem(element: TreeNode): vscode.TreeItem {
        const collapsibleState = element.child && element.child.length > 0
            ? vscode.TreeItemCollapsibleState.Expanded
            : vscode.TreeItemCollapsibleState.None;

        const treeItem = new vscode.TreeItem(element.name, collapsibleState);
        treeItem.iconPath = path.join(__filename, '..', '..', '..', 'resources', this.statusIcons.get(element.status));
        treeItem.contextValue = 'gotest';

        treeItem.command = {
            command: 'gotests_internal.select',
            title: '',
            arguments: [element]
        };

        return treeItem;
    }

    async getChildren(element?: TreeNode): Promise<TreeNode[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('Unable to find tests');
            return Promise.resolve([]);
        }

        if (!element) {
            this.tree = await this.buildTree();
            return this.tree;
        }

        return element.child;
    }

    async launch(test: TreeNode) {
        test = test || this.selected;
        const results = await this.goTest.launch(test.pkgName, test.funcName);
        this.updateStatuses(this.tree, results);
    }

    async launchAll() {
        const results = await this.goTest.launch();
        this.updateStatuses(this.tree, results);
    }

    private async buildTree(): Promise<TreeNode[]> {
        const tree = [];
        const packages = await this.goList.getProjectPackages();

        for (const packageName of packages) {

            const packageInfo = await this.goList.getPackageInfo(packageName);
            let packageTestFunctions: string[] = [];

            if (packageInfo.TestGoFiles && packageInfo.TestGoFiles.length > 0) {
                for (const testFile of packageInfo.TestGoFiles) {
                    const fullTestFile = path.join(packageInfo.Dir, testFile);
                    const fileTestFunctions = await GoFile.getTestFunctions(fullTestFile);
                    packageTestFunctions = packageTestFunctions.concat(fileTestFunctions);
                }
            }

            if (packageInfo.XTestGoFiles && packageInfo.XTestGoFiles.length > 0) {
                for (const testFile of packageInfo.XTestGoFiles) {
                    const fullTestFile = path.join(packageInfo.Dir, testFile);
                    const fileTestFunctions = await GoFile.getTestFunctions(fullTestFile);
                    packageTestFunctions = packageTestFunctions.concat(fileTestFunctions);
                }
            }

            if (packageTestFunctions.length > 0) {
                const node = new TreeNode(packageName, TreeNodeType.package);
                node.child = [];
                node.pkgName = packageName;
                const prevNode = this.tree && this.tree.find(x => x.pkgName === packageName);
                node.status = prevNode ? prevNode.status : TestStatus.Unknown;
                for (const testFunction of packageTestFunctions) {
                    const fnode = new TreeNode(testFunction, TreeNodeType.func);
                    fnode.pkgName = node.pkgName;
                    fnode.funcName = testFunction;
                    if (prevNode && prevNode.child) {
                        const prevFuncNode = prevNode.child.find(x => x.funcName === testFunction);
                        fnode.status = prevFuncNode ? prevFuncNode.status : fnode.status;
                    }

                    node.child.push(fnode);
                }
                tree.push(node);
            }
        }

        return tree;
    }

    private updateStatuses(nodes: TreeNode[], results: Map<string, TestStatus>) {
        for (const n of nodes || []) {
            const k = n.funcName || n.pkgName;

            if (results.has(k)) {
                n.status = results.get(k);
            }

            this.updateStatuses(n.child, results);
        }
        this._onDidChangeTreeData.fire();
    }
}
