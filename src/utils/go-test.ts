import * as vscode from 'vscode';
import * as child from 'child_process';
import * as path from 'path';

export class GoTest {

    constructor(private channel: vscode.OutputChannel) { }

    launch(pkgName: string = './...', funcName: string = undefined): Promise<number> {
        return new Promise<number>(resolve => {
            let cmd = `go test -v`;
            if (funcName) {
                cmd += ` -run "^${funcName}$"`;
            }
            cmd += ` ${pkgName}`;

            const execOptions: child.ExecOptions = {
                cwd: vscode.workspace.rootPath
            };

            child.exec(cmd, execOptions, this.execCallback.bind(this))
                .on('exit', code => resolve(code));
        });
    }

    private execCallback(error: Error, stdout: string, stderr: string) {
        const output = this.expandFilePathInOutput(stdout, vscode.workspace.rootPath);
        this.channel.appendLine(output);
    }

    /**
     * Expands test file paths to full.
     * Taken from vscode-go with small change \t -> \s+. This change expands paths also in subtests runs
     * https://github.com/Microsoft/vscode-go/blob/master/src/goTest.ts
     */
    private expandFilePathInOutput(output: string, cwd: string): string {
        let lines = output.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let matches = lines[i].match(/^\s+(\S+_test.go):(\d+):/);
            if (matches) {
                lines[i] = lines[i].replace(matches[1], path.join(cwd, matches[1]));
            }
        }
        return lines.join('\n');
    }

}
