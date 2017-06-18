import * as vscode from 'vscode';
import * as path from 'path';

export class GoTest extends vscode.TreeItem {

    constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

    iconPath = path.join(__filename, '..', '..', '..', 'resources', 'test.svg');
	contextValue = 'gotest';
}
