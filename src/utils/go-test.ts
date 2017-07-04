import * as vscode from 'vscode';
import * as child from 'child_process';
import * as path from 'path';
import { GoTestParser } from './go-test-parser';
import { TestStatus } from "../model/test-status";

export class GoTest {

    constructor(private channel: vscode.OutputChannel, private parser: GoTestParser) { }

    launch(pkgName: string = './...', funcName: string = undefined): Promise<Map<string, TestStatus>> {
        return new Promise<Map<string, TestStatus>>(resolve => {
            let cmd = `go test -v`;
            if (funcName) {
                cmd += ` -run "^${funcName}$"`;
            }
            cmd += ` ${pkgName}`;

            const execOptions: child.ExecOptions = {
                cwd: vscode.workspace.rootPath
            };

            child.exec(cmd, execOptions,
                (error, stdout, stderr) => {
                    const output = this.expandFilePathInOutput(stdout, vscode.workspace.rootPath);
                    this.channel.appendLine(output);

                    const testResult = this.parser.parse(stdout);
                    resolve(testResult);
                });

        });
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
