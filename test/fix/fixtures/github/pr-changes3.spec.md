
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- fix: remoteAgentConnection should attempt to reconnect on RemoteAuthorityResolverError by ibetitsmike · Pull Request #273060 · microsoft/vscode -->
<!-- https://github.com/microsoft/vscode/pull/273060/changes -->

[microsoft](https://github.com/microsoft) / [vscode](https://github.com/microsoft/vscode)

# fix: remoteAgentConnection should attempt to reconnect on RemoteAuthorityResolverError #273060 · Open

ibetitsmike wants to merge 1 commit into `microsoft:main` from `coder:ibetitsmike/allow-retry-on-resolver-errors`  
+3 -3 lines changed

## Files changed (1)

- src/vs/platform/remote/common
  - remoteAgentConnection.ts

### `src/vs/platform/remote/common/remoteAgentConnection.ts`

+3 -3

```
          @@ -701,10 +701,10 @@
701 701   					continue;
702 702   				}
703 703   				if (err instanceof RemoteAuthorityResolverError) {
704     - 					this._options.logService.error(`${logPrefix} A RemoteAuthorityResolverError occurred while trying to reconnect. Will give up now! Error:`);
    704 + 					this._options.logService.error(`${logPrefix} A RemoteAuthorityResolverError occurred while trying to reconnect. Error:`);
705 705   					this._options.logService.error(err);
706     - 					this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, RemoteAuthorityResolverError.isHandled(err));
    706 + 					// try again!
707     - 					break;
    707 + 					continue;
708 708   				}
709 709   				this._options.logService.error(`${logPrefix} An unknown error occurred while trying to reconnect, since this is an unknown case, it will be treated as a permanent error! Will give up now! Error:`);
710 710   				this._options.logService.error(err);
```

#### Comment on lines R704 to R707

##### alexdima (Member) • 2025-10-25 (5 months ago)

This **is** the API. If a remote extension wishes vscode to keep trying it can throw a TemporarilyNotAvailableError. If a remote extension wishes vscode to abort connecting it can throw a RemoteAuthorityResolverError. Changing RemoteAuthorityResolverError to behave like a TemporarilyNotAvailableError is not the right change.

We need to see what kind of scenarios lead to the SSH resolver returning RemoteAuthorityResolverError instead of a TemporarilyNotAvailableError and if they are incorrect, modify the SSH resolver to throw the right error.

##### ibetitsmike (Author) • 2025-10-26 (5 months ago)

Thanks for the feedback. I would definitely like to suggest the improvement to the official Remote SSH plugin - however it is closed source and I'm unable to do so.

##### alexdima (Member) • 2025-10-26 (5 months ago)

I understand, I acknowledge that you can't contribute the fix directly because it is closed source. But if there would be some good repro steps someone from our side (e.g. @joshspicer) could investigate and fix the problem.

By good steps I mean something like e.g.

1. connect to SSH machine
2. close laptop lid
3. unplug router
4. open laptop lid
5. connect to phone internet sharing
6. (observe) SSH fails to reconnect

I think the steps above should work, but if you have some steps that help reproduce the cases where you see SSH failing to reconnect, then @joshspicer or the team could try to reproduce and find the root cause and create a fix.

##### ibetitsmike (Author) • 2025-10-27 (5 months ago)

Currently the process I see for reproduction is not even that complicated:

1. connect to SSH machine
2. turn off your wifi
3. after 30s vscode fails to reconnect and asks to `Reload the window`

@joshspicer would you prefer this to be extracted into an issue?

```
[11:28:51.577] VS Code version: 1.105.0
[11:28:51.577] Remote-SSH version: remote-ssh@0.120.0
[11:30:01.163] Stopped parsing output early. Remaining text: local-server-1> Running ssh connection command: ssh -v -T -D 60516 workspace-mike.coderlocal-server-1> Spawned ssh, pid=62463ssh: connect to host workspace-mike.coder port 22: Undefined error: 0local-server-1> ssh child died, shutting down
[11:30:01.164] WARN: $PLATFORM is undefined in installation script output.  Errors may be dropped.
[11:30:01.164] Failed to parse remote port from server output
[11:30:01.164] Resolver error: Error: 
	at y.Create (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:744751)
	at t.handleInstallOutput (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:742832)
	at e (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:798600)
	at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
	at async /Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:823806
	at async t.withShowDetailsEvent (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:827501)
	at async /Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:795312
	at async P (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:793367)
	at async t.resolveWithLocalServer (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:794864)
	at async A (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:820659)
	at async t.resolve (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:824898)
	at async /Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:1113660
```

##### ibetitsmike (Author) • 2025-10-27 (5 months ago)

If I only disable my DNS that recognizes the workspace-mike.coder (leaving wifi on) - the remote ssh plugin seems to behave correctly (shows the "reconnecting" window and surfaces the errors for the CoPilot helper):

```
15:36:31.637] > local-server-10> ssh child died, shutting down
[15:36:31.640] Local server exit: 0
[15:36:31.640] Received install output: local-server-10> Running ssh connection command: ssh -v -T -D 54276 workspace-mike.coder
local-server-10> Spawned ssh, pid=93640
ssh: Could not resolve hostname workspace-mike.coder: nodename nor servname provided, or not known
local-server-10> ssh child died, shutting down

[15:36:31.640] Stopped parsing output early. Remaining text: local-server-10> Running ssh connection command: ssh -v -T -D 54276 workspace-mike.coderlocal-server-10> Spawned ssh, pid=93640ssh: Could not resolve hostname workspace-mike.coder: nodename nor servname provided, or not knownlocal-server-10> ssh child died, shutting down
[15:36:31.640] WARN: $PLATFORM is undefined in installation script output.  Errors may be dropped.
[15:36:31.641] Resolver error: Error: Could not resolve hostname
	at y.Offline (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:744802)
	at /Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:740886
	at t.handleInstallOutput (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:741433)
	at e (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:798600)
	at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
	at async /Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:823806
	at async t.withShowDetailsEvent (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:827501)
	at async /Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:795312
	at async P (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:793367)
	at async t.resolveWithLocalServer (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:794864)
	at async A (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:820659)
	at async t.resolve (/Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:824898)
	at async /Users/mike/.vscode/extensions/ms-vscode-remote.remote-ssh-0.120.0/out/extension.js:2:1113660
```

##### ibetitsmike (Author) • 2025-10-28 (5 months ago)

@alexdima I found the original issue behind this behavior - [#162590](https://github.com/microsoft/vscode/issues/162590)  
and for me it's very clear that this failure we're seeing is not related to the installation failing. I assume the Resolver parses and expects some specific output in `handleInstallOutput` and I don't see any docs related to that.

##### joshspicer (Member) • 2025-10-29 (5 months ago)

Thank you for all the helpful debugging steps @ibetitsmike - I am going to take a look from the SSH extension's point of view

Reactions: 👍 (jdarpinian and YodaEmbedding) · 😄 (YodaEmbedding) · 🎉 (YodaEmbedding) · ❤️ (YodaEmbedding) · 🚀 (YodaEmbedding)

##### joshspicer (Member) • 2025-10-30 (5 months ago)

(still looking into it, but sharing some initial testing)

> Currently the process I see for reproduction is not even that complicated:

> connect to SSH machine  
> turn off your wifi  
> after 30s vscode fails to reconnect and asks to Reload the window

On my machine I feel like this is working as I would want/expect **with these steps**. We see `TemporarilyNotAvailableError` (added that extra bit of logging). FWIW I have definitely seen the 'overnight' behavior _not_ behave this way, which I think is what folks find the most frustrating?

What I see consistently:

▸ Screen.Recording.2025-10-30.at.1.34.36.PM.mov

##### joshspicer (Member) • 2025-10-31 (5 months ago)

Leaving a connection overnight (closing my laptop lid) I end up in a permanantly not available state, even though our extension code (for offline errors) always throw TemporarilyNotAvailable

@alexdima do you think in this case we hit the global timeout? I'm not certain if that's the main reason (and it does perhaps warrant some change in core) or if I can handle something like offlineError differently in our remote extensions

##### ibetitsmike (Author) • 2025-10-31 (5 months ago)

IIRC the server side has a 3h timeout.

However - for me this scenario happens even after a 20-30 min sleep. It's as if sometimes when the remote extension tries to reconnect on a macOS system (during being slept) it will say it failed to process the remote server output.

Reactions: 👍 (joshspicer and gianmarcod)

##### ruant2025-11-02 (5 months ago)

Is it this one you're thinking of?  
[https://github.com/microsoft/vscode/blame/main/src/vs/base/parts/ipc/common/ipc.net.ts#L298](https://github.com/microsoft/vscode/blame/main/src/vs/base/parts/ipc/common/ipc.net.ts#L298)

Anyway, 3 hours is nothing. It should be made configurable, so people can set their own.

Reactions: 👍 (joshspicer and jameskoch)

##### ibetitsmike (Author) • 2025-11-10 (5 months ago)

@alexdima I think this thread is awaiting some feedback from you after the comments from Josh

##### joshspicer (Member) • 2025-11-17 (4 months ago)

👋 the latest pre-release SSH extension now includes a setting `remote.SSH.reconnectionGraceTime`.

I've spend a decent amount of time trying to reproduce various scenarios and I haven't seen a case where the permanent reconnection wasn't due to the grace timeout. Certainly could be some other variables on your machine that cause it. It's be curious to see your window trace logs after you repro, as there should be some information there.

Reactions: ❤️ (ibetitsmike)

##### ibetitsmike (Author) • 2025-11-17 (4 months ago)

Thanks Josh. I'll get on testing this immediately.

##### ibetitsmike (Author) • 2025-11-17 (4 months ago)

@joshspicer I can't get the pre-release SSH extension with that flag to establish the connection.

`> error: unexpected argument '--reconnection-grace-time' found`

##### ibetitsmike (Author) • 2025-11-17 (4 months ago)

Ok, this insiders version works now:

```
Version: 1.107.0-insider (Universal)
Commit: 7ba6cc6685504e207bf21dcefde21eb300cfa132
Date: 2025-11-17T05:05:47.761Z (12 hrs ago)
```

Reactions: 👍 (joshspicer)

##### ibetitsmike (Author) • 2025-11-18 (4 months ago)

@joshspicer FYI the docs for the field say it's in seconds, but when I look at the code it's definitely `ms` (especially since you default to `ProtocolConstants.ReconnectionShortGraceTime` which is in `ms`.

##### ibetitsmike (Author) • 2025-11-18 (4 months ago)

@joshspicer

I've been pretty successfuly running an open vscode instance for almost 24h and it worked (with sleeping the machine in between), but about 5 minutes ago this suddenly failed due to the local exec server shutting down AFAICT (which permanently failed vscode).

```
[17:20:03.910] ------
[17:20:03.910] SSH Resolver called for "ssh-remote+workspace-mike.coder", attempt 5, (Reconnection)
[17:20:03.917] SSH Resolver called for host: workspace-mike.coder
[17:20:03.918] Setting up SSH remote "workspace-mike.coder"
[17:20:03.926] Acquiring local install lock: /var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-remote-ssh-6cdcdf0c-install.lock
[17:20:03.928] Looking for existing server data file at /Users/mike/Library/Application Support/Code - Insiders/User/globalStorage/ms-vscode-remote.remote-ssh/vscode-ssh-host-6cdcdf0c-7ba6cc6685504e207bf21dcefde21eb300cfa132-0.122.2025111415-es/data.json
[17:20:03.928] Found existing data file
[17:20:03.928] Found local server running: {"remoteListeningOn":{"port":35847},"osReleaseId":"ubuntu","arch":"x86_64","sshAuthSock":"","display":"","tmpDir":"/tmp","platform":"linux","execServerToken":"82c407ba-91a0-4c09-a705-d3b22ba894fe","pid":23018,"ipcHandlePath":"/var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-ssh-askpass-d96120ec6cc46b589930ad1bae50d8a477281143.sock","socksPort":54899,"startupTime":1763479801822}
[17:20:03.928] Running server is stale. Ignoring
[17:20:03.929] Using commit id "7ba6cc6685504e207bf21dcefde21eb300cfa132" and quality "insider" for server
[17:20:03.929] Extensions to install: 
[17:20:03.933] Install and start server if needed
[17:20:03.939] askpass server listening on /var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-ssh-askpass-40eeca2679f3487f40a33d243f73d3395e04db45.sock
[17:20:03.939] Spawning local server with {"serverId":4,"ipcHandlePath":"/var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-ssh-askpass-99228dc50f3044acff897d18892f2fb91a5ab3cc.sock","sshCommand":"ssh","sshArgs":["-v","-T","-D","59158","workspace-mike.coder"],"serverDataFolderName":".vscode-server-insiders","dataFilePath":"/Users/mike/Library/Application Support/Code - Insiders/User/globalStorage/ms-vscode-remote.remote-ssh/vscode-ssh-host-6cdcdf0c-7ba6cc6685504e207bf21dcefde21eb300cfa132-0.122.2025111415-es/data.json"}
[17:20:03.939] Local server env: {"SSH_AUTH_SOCK":"/private/tmp/com.apple.launchd.kJTtmcOXGF/Listeners","SHELL":"/bin/zsh","DISPLAY":"1","ELECTRON_RUN_AS_NODE":"1","SSH_ASKPASS":"/Users/mike/.vscode-insiders/extensions/ms-vscode-remote.remote-ssh-0.122.2025111415/out/local-server/askpass.sh","VSCODE_SSH_ASKPASS_NODE":"/Applications/Visual Studio Code - Insiders.app/Contents/Frameworks/Code - Insiders Helper (Plugin).app/Contents/MacOS/Code - Insiders Helper (Plugin)","VSCODE_SSH_ASKPASS_EXTRA_ARGS":"","VSCODE_SSH_ASKPASS_MAIN":"/Users/mike/.vscode-insiders/extensions/ms-vscode-remote.remote-ssh-0.122.2025111415/out/askpass-main.js","VSCODE_SSH_ASKPASS_HANDLE":"/var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-ssh-askpass-40eeca2679f3487f40a33d243f73d3395e04db45.sock"}
[17:20:03.941] Spawned 36728
[17:20:03.941] Detected connect timeout of 0. Setting maximum timeout.
[17:20:04.091] > local-server-4> Running ssh connection command: ssh -v -T -D 59158 workspace-mike.coder
[17:20:04.092] > local-server-4> Spawned ssh, pid=36732
[17:20:04.250] stderr> debug1: Server host key: ssh-rsa SHA256:nZIy2Y6LlYby49rz8wi0uAQHyRUA/KYYegWdv16E+ak
[17:20:04.379] stderr> Authenticated to workspace-mike.coder ([fd60:627a:a42b:4cc3:8141:d6af:a1bd:1cac]:22) using "none".
[17:20:04.490] > ready: ac2909cc9efc
[17:20:04.535] > Linux 6.8.0-60-generic #63-Ubuntu SMP PREEMPT_DYNAMIC Tue Apr 15 19:04:15 UTC 2025
[17:20:04.536] Platform: linux
[17:20:04.573] > /bin/bash
[17:20:04.573] Parent Shell: bash
[17:20:04.573] Parent Shell pid: 36728
[17:20:04.573] Waiting for subshell to start
[17:20:04.617] > 1755682
[17:20:04.618] stdout -> '1755682'
[17:20:04.618] sub-process detected
[17:20:04.669] > ac2909cc9efc: running
> Script executing under PID: 1755682
[17:20:04.680] > Found existing installation at /home/coder/.vscode-server-insiders...
> Starting VS Code CLI...
[17:20:04.682] > Removing old logfile at /home/coder/.vscode-server-insiders/.cli.7ba6cc6685504e207bf21dcefde21eb300cfa132.log
[17:20:04.685] > Spawned remote CLI: 1755700
[17:20:04.689] > Waiting for server log...
[17:20:04.725] > ac2909cc9efc: start
> listeningOn==127.0.0.1:33763==
> osReleaseId==ubuntu==
> arch==x86_64==
> vscodeArch==x64==
> bitness==64==
> tmpDir==/tmp==
> platform==linux==
> unpackResult====
> didLocalDownload==0==
> downloadTime====
> installTime====
> serverStartTime==42==
> execServerToken==11aa1111-a1a1-1a1a-a11a-11a11a111aaa==
> platformDownloadPath==cli-alpine-x64==
> SSH_AUTH_SOCK====
> DISPLAY====
> ac2909cc9efc: end
[17:20:04.726] Received install output: 
listeningOn==127.0.0.1:33763==
osReleaseId==ubuntu==
arch==x86_64==
vscodeArch==x64==
bitness==64==
tmpDir==/tmp==
platform==linux==
unpackResult====
didLocalDownload==0==
downloadTime====
installTime====
serverStartTime==42==
execServerToken==11aa1111-a1a1-1a1a-a11a-11a11a111aaa==
platformDownloadPath==cli-alpine-x64==
SSH_AUTH_SOCK====
DISPLAY====

[17:20:04.726] Remote server is listening on port 33763
[17:20:04.726] Parsed server configuration: {"serverConfiguration":{"remoteListeningOn":{"port":33763},"osReleaseId":"ubuntu","arch":"x86_64","sshAuthSock":"","display":"","tmpDir":"/tmp","platform":"linux","execServerToken":"11aa1111-a1a1-1a1a-a11a-11a11a111aaa"},"serverStartTime":42,"installUnpackCode":""}
[17:20:04.727] Persisting server connection details to /Users/mike/Library/Application Support/Code - Insiders/User/globalStorage/ms-vscode-remote.remote-ssh/vscode-ssh-host-6cdcdf0c-7ba6cc6685504e207bf21dcefde21eb300cfa132-0.122.2025111415-es/data.json
[17:20:04.746] Starting forwarding server. local port 59160 -> socksPort 59158 -> remotePort 33763
[17:20:04.746] Forwarding server listening on port 59160
[17:20:04.747] Waiting for ssh tunnel to be ready
[17:20:04.747] Tunneled port 33763 to local port 59160
[17:20:04.748] Resolved "ssh-remote+workspace-mike.coder" to "port 59160"
[17:20:04.749] [Forwarding server port 59160] Got connection 0
[17:20:04.793] Verified and reusing cached exec server for ssh-remote+workspace-mike.coder
[17:20:04.793] Extensions to install: 
[17:20:04.795] ------




[17:20:04.798] No hints found in the recent session.
[17:20:08.081] Exec server for ssh-remote+workspace-mike.coder closed (gracefully)
[17:20:08.086] > local-server-3> Timed out
[17:20:08.097] Local server exit: 0
```

##### ibetitsmike (Author) • 2025-11-19 (4 months ago)

Another failing instance I see is the server loosing my token somehow and disconnecting (no connection loss, just sleeping the laptop). It works fine 18:24 and then suddenly 30 minutes later it `[ManagementConnection] Unknown reconnection token (never seen).` Maybe it's time out of the local server in the first log lines?

```
[18:24:21.450] No hints found in the recent session.
[18:24:21.546] [server] Checking /home/coder/.vscode-server-insiders/cli/servers/Insiders-7ba6cc6685504e207bf21dcefde21eb300cfa132/log.txt and /home/coder/.vscode-server-insiders/cli/servers/Insiders-7ba6cc6685504e207bf21dcefde21eb300cfa132/pid.txt for a running server...
[18:24:21.552] [server] Found running server (pid=3292641)
[18:56:32.312] Server delay-shutdown request failed: connect ENOENT /var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-ssh-askpass-4dc099f9b39ccae428e9de9e4998ad3647083503.sock
[18:56:32.312] > local-server-9> Timed out
[18:56:32.316] Exec server for ssh-remote+workspace-mike.coder closed (gracefully)
[18:56:32.318] Local server exit: 0
[18:56:32.339] ------




[18:56:32.339] SSH Resolver called for "ssh-remote+workspace-mike.coder", attempt 10, (Reconnection)
[18:56:32.343] SSH Resolver called for host: workspace-mike.coder
[18:56:32.343] Setting up SSH remote "workspace-mike.coder"
[18:56:32.344] Acquiring local install lock: /var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-remote-ssh-6cdcdf0c-install.lock
[18:56:32.344] Looking for existing server data file at /Users/mike/Library/Application Support/Code - Insiders/User/globalStorage/ms-vscode-remote.remote-ssh/vscode-ssh-host-6cdcdf0c-7ba6cc6685504e207bf21dcefde21eb300cfa132-0.122.2025111815-es/data.json
[18:56:32.344] No existing data file
[18:56:32.344] Using commit id "7ba6cc6685504e207bf21dcefde21eb300cfa132" and quality "insider" for server
[18:56:32.345] Extensions to install: 
[18:56:32.347] Install and start server if needed
[18:56:32.351] askpass server listening on /var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-ssh-askpass-01cca59c70b3c50b8795e482523afc5f6f9acb40.sock
[18:56:32.351] Spawning local server with {"serverId":10,"ipcHandlePath":"/var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-ssh-askpass-ee68938088a7b221053ee53c7e4a48f49aab4143.sock","sshCommand":"ssh","sshArgs":["-v","-T","-D","49379","workspace-mike.coder"],"serverDataFolderName":".vscode-server-insiders","dataFilePath":"/Users/mike/Library/Application Support/Code - Insiders/User/globalStorage/ms-vscode-remote.remote-ssh/vscode-ssh-host-6cdcdf0c-7ba6cc6685504e207bf21dcefde21eb300cfa132-0.122.2025111815-es/data.json"}
[18:56:32.351] Local server env: {"SSH_AUTH_SOCK":"/private/tmp/com.apple.launchd.kJTtmcOXGF/Listeners","SHELL":"/bin/zsh","DISPLAY":"1","ELECTRON_RUN_AS_NODE":"1","SSH_ASKPASS":"/Users/mike/.vscode-insiders/extensions/ms-vscode-remote.remote-ssh-0.122.2025111815/out/local-server/askpass.sh","VSCODE_SSH_ASKPASS_NODE":"/Applications/Visual Studio Code - Insiders.app/Contents/Frameworks/Code - Insiders Helper (Plugin).app/Contents/MacOS/Code - Insiders Helper (Plugin)","VSCODE_SSH_ASKPASS_EXTRA_ARGS":"","VSCODE_SSH_ASKPASS_MAIN":"/Users/mike/.vscode-insiders/extensions/ms-vscode-remote.remote-ssh-0.122.2025111815/out/askpass-main.js","VSCODE_SSH_ASKPASS_HANDLE":"/var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-ssh-askpass-01cca59c70b3c50b8795e482523afc5f6f9acb40.sock"}
[18:56:32.352] Spawned 80688
[18:56:32.352] Detected connect timeout of 0. Setting maximum timeout.
[18:56:32.457] > local-server-10> Running ssh connection command: ssh -v -T -D 49379 workspace-mike.coder
[18:56:32.459] > local-server-10> Spawned ssh, pid=80692
[18:56:43.660] stderr> debug1: Server host key: ssh-rsa SHA256:nZIy2Y6LlYby49rz8wi0uAQHyRUA/KYYegWdv16E+ak
[18:56:43.847] stderr> Authenticated to workspace-mike.coder ([fd60:627a:a42b:4cc3:8141:d6af:a1bd:1cac]:22) using "none".
[18:56:43.997] > ready: 13ecf1c5bb11
[18:56:44.044] > Linux 6.8.0-60-generic #63-Ubuntu SMP PREEMPT_DYNAMIC Tue Apr 15 19:04:15 UTC 2025
[18:56:44.044] Platform: linux
[18:56:44.092] > /bin/bash
[18:56:44.093] Parent Shell: bash
[18:56:44.093] Parent Shell pid: 80688
[18:56:44.093] Waiting for subshell to start
[18:56:44.142] > 3386548
[18:56:44.142] stdout -> '3386548'
[18:56:44.143] sub-process detected
[18:56:44.212] > 13ecf1c5bb11: running
> Script executing under PID: 3386548
[18:56:44.222] > Found existing installation at /home/coder/.vscode-server-insiders...
> Starting VS Code CLI...
[18:56:44.223] > Removing old logfile at /home/coder/.vscode-server-insiders/.cli.7ba6cc6685504e207bf21dcefde21eb300cfa132.log
[18:56:44.226] > Spawned remote CLI: 3386566
[18:56:44.227] > Waiting for server log...
[18:56:44.263] > 13ecf1c5bb11: start
> listeningOn==127.0.0.1:34765==
> osReleaseId==ubuntu==
> arch==x86_64==
> vscodeArch==x64==
> bitness==64==
> tmpDir==/tmp==
> platform==linux==
> unpackResult====
> didLocalDownload==0==
> downloadTime====
> installTime====
> serverStartTime==39==
> execServerToken==111aa1a1-aa11-111a-aa11-1a1111111111==
> platformDownloadPath==cli-alpine-x64==
> SSH_AUTH_SOCK====
> DISPLAY====
> 13ecf1c5bb11: end
[18:56:44.264] Received install output: 
listeningOn==127.0.0.1:34765==
osReleaseId==ubuntu==
arch==x86_64==
vscodeArch==x64==
bitness==64==
tmpDir==/tmp==
platform==linux==
unpackResult====
didLocalDownload==0==
downloadTime====
installTime====
serverStartTime==39==
execServerToken==111aa1a1-aa11-111a-aa11-1a1111111111==
platformDownloadPath==cli-alpine-x64==
SSH_AUTH_SOCK====
DISPLAY====

[18:56:44.264] Remote server is listening on port 34765
[18:56:44.265] Parsed server configuration: {"serverConfiguration":{"remoteListeningOn":{"port":34765},"osReleaseId":"ubuntu","arch":"x86_64","sshAuthSock":"","display":"","tmpDir":"/tmp","platform":"linux","execServerToken":"111aa1a1-aa11-111a-aa11-1a1111111111"},"serverStartTime":39,"installUnpackCode":""}
[18:56:44.266] Persisting server connection details to /Users/mike/Library/Application Support/Code - Insiders/User/globalStorage/ms-vscode-remote.remote-ssh/vscode-ssh-host-6cdcdf0c-7ba6cc6685504e207bf21dcefde21eb300cfa132-0.122.2025111815-es/data.json
[18:56:44.268] Starting forwarding server. local port 49479 -> socksPort 49379 -> remotePort 34765
[18:56:44.269] Forwarding server listening on port 49479
[18:56:44.269] Waiting for ssh tunnel to be ready
[18:56:44.270] [Forwarding server port 49479] Got connection 0
[18:56:44.270] Tunneled port 34765 to local port 49479
[18:56:44.270] Resolved "ssh-remote+workspace-mike.coder" to "port 49479"
[18:56:44.271] Initizing new exec server for ssh-remote+workspace-mike.coder
[18:56:44.271] Resolving exec server at port 49479
[18:56:44.272] [Forwarding server port 49479] Got connection 1
[18:56:44.452] Exec server for ssh-remote+workspace-mike.coder created and cached
[18:56:44.452] Extensions to install: 
[18:56:44.456] ------
18:56:44.460] No hints found in the recent session.
[18:56:44.513] [server] Checking /home/coder/.vscode-server-insiders/cli/servers/Insiders-7ba6cc6685504e207bf21dcefde21eb300cfa132/log.txt and /home/coder/.vscode-server-insiders/cli/servers/Insiders-7ba6cc6685504e207bf21dcefde21eb300cfa132/pid.txt for a running server...
[18:56:44.513] [server] Installing and setting up Visual Studio Code Server...
[18:56:44.514] [server] Server setup complete
[18:56:44.515] [server] Starting server...
[18:56:44.516] [server] Starting server with command... Command { std: "/home/coder/.vscode-server-insiders/cli/servers/Insiders-7ba6cc6685504e207bf21dcefde21eb300cfa132/server/bin/code-server-insiders" "--connection-token=remotessh" "--accept-server-license-terms" "--reconnection-grace-time=86400000" "--start-server" "--enable-remote-auto-shutdown" "--socket-path=/tmp/code-insiders-ef9abcd6-948a-42ae-b258-4a0274c34eac", kill_on_drop: false }
[18:56:44.617] [server] *
[18:56:44.617] [server] * Visual Studio Code Server
[18:56:44.619] [server] *
[18:56:44.654] [server] * By using the software, you agree to
[18:56:44.660] [server] * the Visual Studio Code Server License Terms (https://aka.ms/vscode-server-license) and
[18:56:44.666] [server] * the Microsoft Privacy Statement (https://privacy.microsoft.com/en-US/privacystatement).
[18:56:44.673] [server] Server bound to /tmp/code-insiders-ef9abcd6-948a-42ae-b258-4a0274c34eac
[18:56:44.673] [server] Extension host agent listening on /tmp/code-insiders-ef9abcd6-948a-42ae-b258-4a0274c34eac
[18:56:44.673] [server] parsed location: "/tmp/code-insiders-ef9abcd6-948a-42ae-b258-4a0274c34eac"
[18:56:44.674] [server] 
[18:56:44.674] [server] Server started
[18:56:44.674] [server] [17:56:44] 
[18:56:44.674] [server] 
[18:56:44.674] [server] 
[18:56:44.674] [server] 
[18:56:44.688] [server] [reconnection-grace-time] Parsed CLI argument: 86400000s -> 86400000000ms
[18:56:44.693] [server] [17:56:44] Extension host agent started.
[18:56:44.764] [server] [17:56:44] [/home/coder/.vscode-server-insiders/extensions/github.copilot-chat-0.34.2025111901]: Extension is not compatible with Code 1.107.0-insider. Extension requires: ^1.107.20251119.
[18:56:44.764] [server] [17:56:44] [/home/coder/.vscode-server-insiders/extensions/github.copilot-chat-0.34.2025111901]: Extension is not compatible with Code 1.107.0-insider. Extension requires: ^1.107.20251119.
[18:56:44.829] [server] [17:56:44] [<unknown>][b0619527][ManagementConnection] Unknown reconnection token (never seen).
[19:12:44.536] Server delay-shutdown request failed: connect ENOENT /var/folders/r_/yb44r8gd261dn7zzwj173qw00000gn/T/vscode-ssh-askpass-ee68938088a7b221053ee53c7e4a48f49aab4143.sock
[19:12:44.538] > local-server-10> Timed out
[19:12:44.538] Local server exit: 0
[19:12:44.539] Exec server for ssh-remote+workspace-mike.coder closed (gracefully)
```

##### joshspicer (Member) • 2025-12-01 (4 months ago)

> @joshspicer FYI the docs for the field say it's in seconds, but when I look at the code it's definitely ms (especially since you default to ProtocolConstants.ReconnectionShortGraceTime which is in ms.

The units are converted when first handled by the CLI unless I've missed a step somewhere. Thanks for the details, I've got other focuses as well but have not forgotten about this. Thanks for the continued help/details

Reactions: ❤️ (phorcys420)

#### Warning

Only the first 19 replies are currently being shown.

<!-- XLET-END -->

