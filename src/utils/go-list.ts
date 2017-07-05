import * as child from 'child_process';

export interface PackageInfo {
    Dir: string;
    ImportPath: string;
    Name: string;
    Target: string;
    Stale: boolean;
    StaleReason: string;
    Root: string;
    GoFiles: string[];
    Deps: string[];
    TestGoFiles: string[];
    TestImports: string[];
    XTestGoFiles: string[];
}

export class GoList {

    private defaultOptions: child.ExecFileOptionsWithStringEncoding;

    constructor(private workingDirectory: string) {
        this.defaultOptions = {
            cwd: workingDirectory,
            encoding: 'utf8'
        };
    }

    /**
     * Return names of all packages (including vendor) that found in workingDirectory
     */
    getAllPackages() : Promise<string[]> {
        const cmd = 'go list ./...';

        return new Promise(resolve => {
            child.exec(cmd, this.defaultOptions, (error, stdout, stderr) => {
                resolve(stdout.split('\n').filter(x => x.length > 0));
            });
        });
    }

    /**
     * Return packages that are in vendor folder
     */
    async getVendorPackages(): Promise<string[]> {
        const allPackages = await this.getAllPackages();
        return allPackages.filter(x => x.includes('/vendor/'))
    }

    /**
     * Return packages that are not in vendor folder
     */
    async getProjectPackages(): Promise<string[]> {
        const allPackages = await this.getAllPackages();
        return allPackages.filter(x => !x.includes('/vendor/'));
    }

    /**
     * Get package information
     */
    getPackageInfo(packageName: string): Promise<PackageInfo> {
        const cmd = 'go list -json ' + packageName;

        return new Promise(resolve => {
            child.exec(cmd, this.defaultOptions, (error, stdout, stderr) => {
                resolve(JSON.parse(stdout) as PackageInfo);
            });
        });
    }
}
