import * as vscode from 'vscode';
import * as fs from 'fs';
import * as child from 'child_process';
import * as path from 'path';

import { Package } from './model/package';
import { GoUtils } from './go-utils';
import { GoTest } from './utils/go-test';
import { TreeNode, TreeNodeType, TestStatus } from './model/tree-node';

export class GoTestsProvider implements vscode.TreeDataProvider<TreeNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | null> = new vscode.EventEmitter<TreeNode | null>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private goUtils: GoUtils;
    private tree: TreeNode[];
    private selected: TreeNode;

    private statusIcons = new Map<TestStatus, string>([
        [TestStatus.Unknown, 'test.svg'],
        [TestStatus.Failed, 'failed.svg'],
        [TestStatus.Passed, 'passed.svg'],
    ]);

    constructor(private workspaceRoot: string, private goTest: GoTest) {
        this.goUtils = new GoUtils();

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

        let treeItem = new vscode.TreeItem(element.name, collapsibleState);
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

    launch(test: TreeNode) {
        test = test || this.selected;
        this.goTest.launch(test.pkgName, test.funcName)
            .then(results => this.handleResult(this.tree, results));
    }

    launchAll() {
        this.goTest.launch()
            .then(results => this.handleResult(this.tree, results));
    }

    private async buildTree(): Promise<TreeNode[]> {
        const tree = [];
        const packages = await this.goUtils.getTestFiles(this.workspaceRoot);

        for (const p of packages) {
            const node = new TreeNode(p.name, TreeNodeType.package);
            node.child = [];
            node.pkgName = p.name;
            node.status = TestStatus.Unknown;

            const testFunctions = this.goUtils.getTestFunctions(p);

            for (const f of testFunctions) {
                const fnode = new TreeNode(f, TreeNodeType.func);
                fnode.pkgName = node.pkgName;
                fnode.funcName = f;
                fnode.status = TestStatus.Unknown;
                node.child.push(fnode);
            }
            tree.push(node);
        }

        return tree;
    }

    private handleResult(nodes: TreeNode[], results: Map<string, boolean>) {
        for (const n of nodes || []) {
            const k = n.funcName || n.pkgName;

            if (results.has(k)) {
                n.status = results.get(k) ? TestStatus.Passed : TestStatus.Failed;
                this._onDidChangeTreeData.fire(n);
            }

            this.handleResult(n.child, results);
        }
    }
}

