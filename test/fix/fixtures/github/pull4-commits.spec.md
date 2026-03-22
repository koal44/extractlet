
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Compile bytecode only for newly installed packages via RECORD by paddymul · Pull Request #18636 · astral-sh/uv · GitHub -->
<!-- https://github.com/astral-sh/uv/pull/18636/commits -->

[astral-sh](https://github.com/astral-sh) / **[uv](https://github.com/astral-sh/uv)** Public

Compile bytecode only for newly installed packages via RECORD · #18636 · Draft  
[paddymul](https://github.com/paddymul) wants to merge 4 commits into `astral-sh:main` from `paddymul:targeted-bytecode-compilation`  
+339 -59 lines changed

### Commits on Mar 22, 2026

#### Only compile bytecode for newly installed packages  
[21339da](https://github.com/astral-sh/uv/pull/18636/commits/21339da513f3daaad8b1e7f5bffcd8d4b2bacae1)  
```
Only compile bytecode for newly installed packages

Instead of walking the entire site-packages directory and recompiling
every .py file, read each installed distribution's RECORD file to find
the specific .py files that were just installed, and compile only those.

This uses RECORD (the same source of truth the uninstaller uses) rather
than guessing directory names from package names, which would break for
packages like Pillow (installs to PIL/), PyYAML (yaml/), etc.

When --compile is requested but nothing was installed, falls back to
full site-packages compilation to handle the case where packages were
previously installed without --compile.

Closes #2637
Fixes #12202

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```  
paddymul and claude committed 2026-03-22 (24 hours ago)

#### Refactor: extract shared helpers, reuse find_dist_info  
[2f78bdf](https://github.com/astral-sh/uv/pull/18636/commits/2f78bdf3b0f39b73a38781c979a74f80fbea8ded)  
```
Refactor: extract shared helpers, reuse find_dist_info

- Extract `parse_compile_timeout()` and `spawn_workers_and_wait()` from
  `compile_tree` to eliminate duplication between `compile_tree` and
  `compile_files`
- Reuse existing `find_dist_info` from `uv-install-wheel` (made `pub`)
  instead of a custom `find_dist_info_dir` in mod.rs
- No behavioral changes

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```  
paddymul and claude committed 2026-03-22 (24 hours ago)  
44/55 checks

#### Fix deadlock: spawn workers before sending files into bounded channel  
[f35f09e](https://github.com/astral-sh/uv/pull/18636/commits/f35f09e847a32ae510788db3286002c37aa9f40d)  
```
Fix deadlock: spawn workers before sending files into bounded channel

The refactored compile_tree was sending files into the bounded channel
before spawning workers. When the number of .py files exceeded the
channel buffer (worker_count * 10), the sender would block forever
waiting for consumers that hadn't been spawned yet.

This caused python_install_compile_bytecode tests to hang because
the Python stdlib has thousands of .py files.

Fix by extracting spawn_workers() which is called before the send loop,
matching the original code's order of operations.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```  
paddymul and claude committed 2026-03-22 (23 hours ago)  
48/55 checks

#### Filter compiled files to site-packages and document recompile fallback  
[180e2d5](https://github.com/astral-sh/uv/pull/18636/commits/180e2d5477e6151aef19d4cbe65278f1341adffa)  
```
Filter compiled files to site-packages and document recompile fallback

- Only compile .py files that resolve within site-packages, skipping
  RECORD entries like ../bin/script.py that would leave orphaned .pyc
  files outside the uninstaller's cleanup scope.
- Add comment explaining the full-recompile fallback tradeoff for
  uv run --compile-bytecode vs pip sync --compile.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```  
paddymul and claude committed 2026-03-22 (23 hours ago)  
48/55 checks

<!-- XLET-END -->

