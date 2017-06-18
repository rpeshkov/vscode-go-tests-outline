export enum TreeNodeType {
    package,
    func,
    bench
}

export class TreeNode {
    constructor(public name: string, public type: TreeNodeType) {}
    parent: TreeNode;
    child: TreeNode[];
}
