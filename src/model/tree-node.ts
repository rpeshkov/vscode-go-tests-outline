export enum TreeNodeType {
    package,
    func,
    bench
}

export class TreeNode {
    constructor(public name: string, public type: TreeNodeType) {}
    pkgName: string;
    funcName: string;
    child: TreeNode[];
}
