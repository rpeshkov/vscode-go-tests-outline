import { TestStatus } from '../model/test-status';

export class GoTestParser {
    /**
     * regex for matching test result
     * @example "--- PASS: TestBlank (0.00s)"
     * @example "--- FAIL: TestSomething (0.00s)"
     * @example "--- SKIP: TestCaseInsentitiveGOPATH (0.00s)"
     */
    private readonly funcRe = /^--- (PASS|FAIL|SKIP): (\S+)\s\(.+\)$/;

    /**
     * regex for matching package test run result
     * @example "ok  	github.com/rpeshkov/multipkg/config	0.012s"
     * @example "FAIL	github.com/rpeshkov/multipkg/config	0.014s"
     */
    private readonly pkgRe = /^(ok|FAIL)\s+([\S,\.,\\]+)\s.+$/;

    /**
     * Map for different text statuses
     */
    private readonly statusMap = {
        'PASS': TestStatus.Passed,
        'ok': TestStatus.Passed,
        'FAIL': TestStatus.Failed,
        'SKIP': TestStatus.Unknown
    };

    parse(input: string): Map<string, TestStatus> {
        const result = new Map<string, TestStatus>();

        for (const line of input.split('\n')) {
            const funcMatch = this.funcRe.exec(line);
            if (funcMatch) {
                const [, status, name] = funcMatch;
                result.set(name, this.statusMap[status]);
                continue;
            }

            const pkgMatch = this.pkgRe.exec(line);
            if (pkgMatch) {
                const [, status, name] = pkgMatch;
                result.set(name, this.statusMap[status]);
            }
        }

        return result;
    }
}
