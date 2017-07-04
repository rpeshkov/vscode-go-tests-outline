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

    const input = `=== RUN   TestBlank
--- PASS: TestBlank (0.00s)
=== RUN   TestSuccess
--- PASS: TestSuccess (0.00s)
	/Users/rpeshkov/go/src/github.com/rpeshkov/multipkg/config_test.go:10: Success
=== RUN   TestSuccessMultiline
--- PASS: TestSuccessMultiline (0.00s)
	/Users/rpeshkov/go/src/github.com/rpeshkov/multipkg/config_test.go:14: Success
		Multiline
		Yay!
=== RUN   TestMultilevel
=== RUN   TestMultilevel/SubTest1
=== RUN   TestMultilevel/SubTest1/SubSubTest1
--- PASS: TestMultilevel (0.00s)
    --- PASS: TestMultilevel/SubTest1 (0.00s)
    	/Users/rpeshkov/go/src/github.com/rpeshkov/multipkg/config_test.go:51: Error1
    	/Users/rpeshkov/go/src/github.com/rpeshkov/multipkg/config_test.go:55: NIGHTMARE!!!
        --- PASS: TestMultilevel/SubTest1/SubSubTest1 (0.00s)
        	/Users/rpeshkov/go/src/github.com/rpeshkov/multipkg/config_test.go:54: Error2
=== RUN   TestConfigLoadedSuccesfully
--- PASS: TestConfigLoadedSuccesfully (0.00s)
PASS
ok  	github.com/rpeshkov/multipkg/config	0.012s`;


    test("Test1", () => {
        const gtp = new GoTestParser();
        const result = gtp.parse(input);
        assert.equal(result.size, 6);

        const expectedResult = {
            "TestBlank": TestStatus.Passed,
            "TestSuccess": TestStatus.Passed,
            "TestSuccessMultiline": TestStatus.Passed,
            "TestMultilevel": TestStatus.Passed,
            "TestConfigLoadedSuccesfully": TestStatus.Passed,
            "github.com/rpeshkov/multipkg/config": TestStatus.Passed
        };

        for (const k in expectedResult) {
            assert(result.has(k));
            assert.equal(result.get(k), expectedResult[k]);
        }
    });
});
