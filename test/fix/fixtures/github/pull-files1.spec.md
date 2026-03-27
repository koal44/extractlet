
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- tweak `run_in_terminal` changes by meganrogge · Pull Request #304843 · microsoft/vscode · GitHub -->
<!-- https://github.com/microsoft/vscode/pull/304843/files -->

[microsoft](https://github.com/microsoft) / **[vscode](https://github.com/microsoft/vscode)** Public

# tweak `run_in_terminal` changes #304843 · Open

meganrogge wants to merge 8 commits into `main` from `merogge/tweak-run-terminal`  
+16 −6 lines changed

## Files changed (5)

- extensions/vscode-api-tests/src/singlefolder-tests
  - chat.runInTerminal.test.ts
- src/vs
  - platform/terminal/common
    - terminal.ts
  - workbench/contrib
    - terminal/common
      - terminalConfiguration.ts 
      - terminalEnvironment.ts
    - terminalContrib/chatAgentTools/browser/executeStrategy
      - noneExecuteStrategy.ts

### extensions/vscode-api-tests/src/singlefolder-tests/chat.runInTerminal.test.ts

+5 -1

```
          @@ -8,6 +8,10 @@ import 'mocha';
  8   8   import * as vscode from 'vscode';
  9   9   import { DeferredPromise, assertNoRpc, closeAllEditors, disposeAll } from '../utils';
 10  10  
     11 + const enum ShellIntegrationTimeoutOverride {
     12 + 	DisableForTests = -2
     13 + }
     14 +
 11  15   const isWindows = process.platform === 'win32';
 12  16   const isMacOS = process.platform === 'darwin';
 13  17   const sandboxFileSystemSetting = isMacOS
          @@ -162,7 +166,7 @@ function extractTextContent(result: vscode.LanguageModelToolResult): string {
162 166   		setup(async () => {
163 167   			const termConfig = vscode.workspace.getConfiguration('terminal.integrated');
164 168   			await termConfig.update('shellIntegration.enabled', false, vscode.ConfigurationTarget.Global);
165     - 			await termConfig.update('shellIntegration.timeout', 0, vscode.ConfigurationTarget.Global);
    169 + 			await termConfig.update('shellIntegration.timeout', ShellIntegrationTimeoutOverride.DisableForTests, vscode.ConfigurationTarget.Global);
166 170  
167 171   			const toolConfig = vscode.workspace.getConfiguration('chat.tools.terminal');
168 172   			await toolConfig.update('idlePollInterval', 100, vscode.ConfigurationTarget.Global);
```

### src/vs/platform/terminal/common/terminal.ts

+4 -0

```
            @@ -1060,6 +1060,10 @@ export const enum ShellIntegrationInjectionFailureReason {
1060 1060   	FailedToCreateTmpDir = 'failedToCreateTmpDir',
1061 1061   }
1062 1062  
     1063 + export const enum ShellIntegrationTimeoutOverride {
     1064 + 	DisableForTests = -2
     1065 + }
     1066 +
1063 1067   export enum TerminalExitReason {
1064 1068   	Unknown = 0,
1065 1069   	Shutdown = 1,
```

### src/vs/workbench/contrib/terminal/common/terminalConfiguration.ts

+1 -1

```
          @@ -625,7 +625,7 @@ const terminalConfiguration: IStringDictionary<IConfigurationPropertySchema> = {
625 625   	},
626 626   	[TerminalSettingId.ShellIntegrationTimeout]: {
627 627   		restricted: true,
628     - 		markdownDescription: localize('terminal.integrated.shellIntegration.timeout', "Configures the duration in milliseconds to wait for shell integration after launch before declaring it's not there. Set to {0} to skip the wait entirely. The default value {1} uses a variable wait time based on whether shell integration injection is enabled and whether it's a remote window. Values between 1 and 499 are clamped to 500ms. Consider setting this to {0} if you intentionally disabled shell integration, or a large value if your shell starts very slowly.", '`0`', '`-1`'),
    628 + 		markdownDescription: localize('terminal.integrated.shellIntegration.timeout', "Configures the duration in milliseconds to wait for shell integration after launch before declaring it's not there. The default value {0} uses a variable wait time based on whether shell integration injection is enabled and whether it's a remote window. Values between 1 and 499 are clamped to 500ms. Consider setting this to a large value if your shell starts very slowly.", '`-1`'),
629 629   		type: 'integer',
630 630   		minimum: -1,
631 631   		maximum: 60000,
```

### src/vs/workbench/contrib/terminal/common/terminalEnvironment.ts

+5 -3

```
          @@ -12,7 +12,7 @@ import { URI, uriToFsPath } from '../../../../base/common/uri.js';
 12  12   import { IWorkspaceContextService, IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
 13  13   import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
 14  14   import { sanitizeProcessEnvironment } from '../../../../base/common/processes.js';
 15     - import { IShellLaunchConfig, ITerminalBackend, ITerminalEnvironment, TerminalSettingId, TerminalShellType, WindowsShellType } from '../../../../platform/terminal/common/terminal.js';
     15 + import { IShellLaunchConfig, ITerminalBackend, ITerminalEnvironment, ShellIntegrationTimeoutOverride, TerminalSettingId, TerminalShellType, WindowsShellType } from '../../../../platform/terminal/common/terminal.js';
 16  16   import { IProcessEnvironment, isWindows, isMacintosh, language, OperatingSystem } from '../../../../base/common/platform.js';
 17  17   import { escapeNonWindowsPath, sanitizeCwd } from '../../../../platform/terminal/common/terminalEnvironment.js';
 18  18   import { isNumber, isString } from '../../../../base/common/types.js';
          @@ -422,8 +422,10 @@ export function getShellIntegrationTimeout(
422 422   ): number {
423 423   	const timeoutValue = configurationService.getValue<unknown>(TerminalSettingId.ShellIntegrationTimeout);
424 424   	let timeoutMs: number;
425     -
426     - 	if (!isNumber(timeoutValue) || timeoutValue < 0) {
    425 + 	if (isNumber(timeoutValue) && timeoutValue === ShellIntegrationTimeoutOverride.DisableForTests) {
    426 + 		// Used for tests
    427 + 		timeoutMs = 0;
    428 + 	} else if (!isNumber(timeoutValue) || timeoutValue < 0) {
427 429   		timeoutMs = siInjectionEnabled ? 5000 : (isRemote ? 3000 : 2000);
428 430   	} else if (timeoutValue === 0) {
429 431   		timeoutMs = 0;
```

#### Comments near L429/R431

**meganrogge** marked this conversation as resolved.

##### **alexdima** (Member) • 2026-03-25 (yesterday)

@meganrogge Here we should remove this if branch

meganrogge reacted with 👍

### src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/executeStrategy/noneExecuteStrategy.ts

+1 -1

```
          @@ -106,7 +106,7 @@ export class NoneExecuteStrategy extends Disposable implements ITerminalExecuteS
106 106   				});
107 107  
108 108   				const cursorMoveTimeout = new Promise<'timeout'>(resolve => {
109     - 					const handle = setTimeout(() => resolve('timeout'), 5000);
    109 + 					const handle = setTimeout(() => resolve('timeout'), 1000);
110 110   					store.add({ dispose: () => clearTimeout(handle) });
111 111   				});
112 112  
```

<!-- XLET-END -->

