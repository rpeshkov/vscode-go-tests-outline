import * as vscode from 'vscode';
import * as path from 'path';
import { Package } from './model/package';

export class GoTest extends vscode.TreeItem {

    constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly pkg: Package,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

    iconPath = path.join(__filename, '..', '..', '..', 'resources', 'test.svg');
	contextValue = 'gotest';
}
