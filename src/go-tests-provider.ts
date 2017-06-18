import * as vscode from 'vscode';
import * as fs from 'fs';
import * as child from 'child_process';
import * as path from 'path';

import { Package } from './model/package';
import { GoUtils } from './go-utils';
import { TreeNode, TreeNodeType } from './model/tree-node';

export class GoTestsProvider implements vscode.TreeDataProvider<TreeNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | null> = new vscode.EventEmitter<TreeNode | null>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private goUtils: GoUtils;
    private tree: TreeNode[];

    constructor(private workspaceRoot: string) {
        this.goUtils = new GoUtils();

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
		treeItem.iconPath = path.join(__filename, '..', '..', '..', 'resources', 'test.svg');
		treeItem.contextValue = 'gotest';

        switch (element.type) {
            case TreeNodeType.package:
                treeItem.command = {
                    command: 'gotests.package',
                    title: '',
                    arguments: [element.name]
                };
                break;
            case TreeNodeType.func:
                treeItem.command = {
                    command: 'gotests.function',
                    title: '',
                    arguments: [element.parent.name, element.name]
                };
                break;
        }

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

    private async buildTree(): Promise<TreeNode[]> {
        const tree = [];
        const packages = await this.goUtils.getTestFiles(this.workspaceRoot);

        for (const p of packages) {
            const node = new TreeNode(p.name, TreeNodeType.package);
            node.child = [];
            node.parent = null;

            const testFunctions = this.goUtils.getTestFunctions(p);

            for (const f of testFunctions) {
                const fnode = new TreeNode(f, TreeNodeType.func);
                fnode.parent = node;
                node.child.push(fnode);
            }
            tree.push(node);
        }

        return tree;
    }
}

