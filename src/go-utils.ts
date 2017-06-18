import * as vscode from 'vscode';
import * as child from 'child_process';

import { Package } from './model/package';

export class GoUtils {

    private readonly getTestFilesCmd = 'go list -f \'{{.ImportPath}} {{join .TestGoFiles ","}}\' ./...';

    /**
     * Returns all test files in directory
     *
     * @param cwd: working directory
     */
    getTestFiles(cwd: string, ignoreEmpty: boolean = true, ignoreVendor: boolean = true): PromiseLike<Package[]> {

        return new Promise(resolve => {

            const result: Package[] = [];

            child.exec(this.getTestFilesCmd, { cwd: cwd }, (err, stdout: string, stderr) => {
                const packages = stdout.split('\n');

                for (const p of packages) {
                    const [pkgName, testFiles] = p.split(' ');

                    if (ignoreEmpty && (pkgName.trim().length === 0 || testFiles.trim().length === 0)) {
                        continue;
                    }

                    if (ignoreVendor && pkgName.includes('/vendor/')) {
                        continue;
                    }

                    const pkg = new Package(pkgName);
                    pkg.testFiles = testFiles.split(',');

                    result.push(pkg);
                }

                resolve(result);
            });
        });
    }

}
