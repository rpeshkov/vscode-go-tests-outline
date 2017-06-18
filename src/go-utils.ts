import * as vscode from 'vscode';
import * as child from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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

    getTestFunctions(pkg: Package): string[] {
        let packageFunctions: string[] = [];
        for (const testFile of pkg.testFiles) {
            const fullTestFileName = path.join(process.env.GOPATH, 'src', pkg.name, testFile);
            packageFunctions = packageFunctions.concat(this.parseTestFunctions(fullTestFileName));
        }

        return packageFunctions;
    }

    private parseTestFunctions(filename: string): string[] {
        const testFunctions: string[] = [];
        const re = /^func\s+(\w+)/mg;
        const fileContents = fs.readFileSync(filename, 'UTF-8');
        let found: RegExpExecArray;
        while (found = re.exec(fileContents)) {
            testFunctions.push(found[1]);
        }

        return testFunctions;
    }



}
