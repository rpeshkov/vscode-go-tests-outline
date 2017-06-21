import * as vscode from 'vscode';
import * as child from 'child_process';

export class GoTest {

    constructor(private channel: vscode.OutputChannel) { }

    launch(pkgName: string = './...', funcName: string = undefined): Promise<number> {
        return new Promise<number>(resolve => {
            let cmd = `go test -v`;
            if (funcName) {
                cmd += ` -run "^${funcName}"`;
            }
            cmd += ` ${pkgName}`;

            const execOptions: child.ExecOptions = {
                cwd: vscode.workspace.rootPath
            };

            child.exec(cmd, execOptions, (e, stdout: string, stderr) => this.channel.appendLine(stdout))
                .on('exit', code => resolve(code));
        });
    }

}
