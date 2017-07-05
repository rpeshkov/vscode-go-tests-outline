//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';

import * as myExtension from '../src/extension';
import { GoList } from '../src/utils/go-list';
import { GoFile } from '../src/utils/go-file';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // Defines a Mocha unit test
    test("Something 1", async () => {

        const wd = path.join(process.env.GOPATH, 'src', 'github.com', 'rpeshkov', 'multipkg');

        const gl = new GoList(wd);
        const packages = await gl.getProjectPackages();
        const pkgInfo = await gl.getPackageInfo(packages[2]);
        for (const file of pkgInfo.TestGoFiles) {
            console.log(path.join(pkgInfo.Dir, file));
            const testFunctions = await GoFile.getTestFunctions(path.join(pkgInfo.Dir, file));
            console.log(testFunctions);
        }
    });
});
