// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import { GoTestParser } from '../src/utils/go-test-parser';
import { TestStatus } from "../src/model/test-status";

// Defines a Mocha test suite to group tests of similar kind together
suite("GoTestParser", () => {

    test('when all tests "passed", package must have "passed" status', () => {
        const input = `=== RUN   TestSuccess
--- PASS: TestSuccess (0.00s)
PASS
ok  	github.com/rpeshkov/multipkg/config	0.011s`;

        const gtp = new GoTestParser();

        const result = gtp.parse(input);

        const expectedResult = {
            "TestSuccess": TestStatus.Passed,
            "github.com/rpeshkov/multipkg/config": TestStatus.Passed
        };

        for (const k in expectedResult) {
            assert(result.has(k));
            assert.equal(result.get(k), expectedResult[k]);
        }
    });

    test('when at least 1 test failed, package must have "failed" status', () => {
        const input = `=== RUN   TestSuccess
--- PASS: TestSuccess (0.00s)
=== RUN   TestError
--- FAIL: TestError (0.00s)
	/Users/rpeshkov/go/src/github.com/rpeshkov/multipkg/config_test.go:18: Error
FAIL
exit status 1
FAIL	github.com/rpeshkov/multipkg/config	0.010s`;

        const gtp = new GoTestParser();

        const result = gtp.parse(input);
        const expectedResult = {
            "TestSuccess": TestStatus.Passed,
            "TestError": TestStatus.Failed,
            "github.com/rpeshkov/multipkg/config": TestStatus.Failed
        };

        for (const k in expectedResult) {
            assert(result.has(k));
            assert.equal(result.get(k), expectedResult[k]);
        }
    });

    test('skipped test must not affect overall status', () => {
        const input = `=== RUN   TestSuccess
--- PASS: TestSuccess (0.00s)
=== RUN   TestSkip
--- SKIP: TestSkip (0.00s)
PASS
ok  	github.com/rpeshkov/multipkg/config	0.010s`;

        const gtp = new GoTestParser();
        const result = gtp.parse(input);
        const expectedResult = {
            "TestSuccess": TestStatus.Passed,
            "TestSkip": TestStatus.Skipped,
            "github.com/rpeshkov/multipkg/config": TestStatus.Passed
        };

        for (const k in expectedResult) {
            assert(result.has(k));
            assert.equal(result.get(k), expectedResult[k]);
        }
    });

    test('status may be "passed", "failed" or "skipped"', () => {

        const input = `=== RUN   TestSuccess
--- PASS: TestSuccess (0.00s)
=== RUN   TestSkip
--- SKIP: TestSkip (0.00s)
=== RUN   TestError
--- FAIL: TestError (0.00s)
	/Users/rpeshkov/go/src/github.com/rpeshkov/multipkg/config_test.go:14: Error
FAIL
exit status 1
FAIL	github.com/rpeshkov/multipkg/config	0.011s`;

        const gtp = new GoTestParser();

        const result = gtp.parse(input);
        const expectedResult = {
            "TestSuccess": TestStatus.Passed,
            "TestSkip": TestStatus.Skipped,
            "TestError": TestStatus.Failed,
            "github.com/rpeshkov/multipkg/config": TestStatus.Failed
        };

        for (const k in expectedResult) {
            assert(result.has(k));
            assert.equal(result.get(k), expectedResult[k]);
        }

    });
});
