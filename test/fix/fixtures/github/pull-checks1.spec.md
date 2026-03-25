
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Compile bytecode only for newly installed packages via RECORD by paddymul · Pull Request #18636 · astral-sh/uv · GitHub -->
<!-- https://github.com/astral-sh/uv/pull/18636/checks -->

[astral-sh](https://github.com/astral-sh) / **[uv](https://github.com/astral-sh/uv)** Public

Compile bytecode only for newly installed packages via RECORD · #18636 · Draft  
[paddymul](https://github.com/paddymul) wants to merge 2 commits into `astral-sh:main` from `paddymul:targeted-bytecode-compilation`  
+356 −59 lines changed

## Checks

Selected commit: `fbbda7c` — Compile bytecode only for newly installed packages

### [CI on: pull_request](https://github.com/astral-sh/uv/actions/runs/23409518640) (14 annotations)

- **[plan](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094174438?pr=18636)**
  success
- [check-fmt / rust](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094174447?pr=18636)
  success
- [check-fmt / prettier](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094174463?pr=18636)
  success
- [check-fmt / python](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094174445?pr=18636)
  success
- [check-lint / ruff](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200537?pr=18636)
  success
- [check-lint / ty](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200551?pr=18636)
  success
- [check-lint / shellcheck](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200477?pr=18636)
  success
- [check-lint / validate-pyproject](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200531?pr=18636)
  success
- [check-lint / readme](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200524?pr=18636)
  success
- [check-lint / clippy on linux](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200464?pr=18636)
  success
- [check-lint / clippy on windows](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200481?pr=18636)
  success
- [check-lint / cargo shear](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200487?pr=18636)
  success
- [check-lint / typos](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200530?pr=18636)
  success
- [check-docs / mkdocs](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200499?pr=18636)
  success
- [check-zizmor / zizmor](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200456?pr=18636)
  success
- [check-publish / cargo publish dry-run](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200449?pr=18636)
  in progress
- [check-release / dist plan](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200468?pr=18636)
  success
- [check-generated-files / cargo dev generate-all](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200441?pr=18636)
  success
- [test / cargo test on linux](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200472?pr=18636)
  in progress
- [test / cargo test on macos](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200644?pr=18636)
  skipped
- [test / cargo test on windows 1 of 3](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200484?pr=18636)
  in progress
- [test / cargo test on windows 2 of 3](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200520?pr=18636)
  in progress
- [test / cargo test on windows 3 of 3](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200492?pr=18636)
  in progress
- [test-windows-trampolines](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200557?pr=18636)
  skipped
- [build-dev-binaries / linux libc](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200534?pr=18636)
  success
- [build-dev-binaries / linux aarch64](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200512?pr=18636)
  success
- [build-dev-binaries / linux armv7 gnueabihf](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200542?pr=18636)
  success
- [build-dev-binaries / linux musl](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200538?pr=18636)
  in progress
- [build-dev-binaries / macos aarch64](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200516?pr=18636)
  success
- [build-dev-binaries / macos x86_64](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200513?pr=18636)
  success
- [build-dev-binaries / windows x86_64](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200518?pr=18636)
  success
- [build-dev-binaries / windows aarch64](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200521?pr=18636)
  in progress
- [build-dev-binaries / msrv](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200527?pr=18636)
  success
- [build-dev-binaries / android aarch64](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200515?pr=18636)
  success
- [build-dev-binaries / freebsd](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200525?pr=18636)
  success
- [build-release-binaries](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200514?pr=18636)
  skipped
- [build-docker](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200576?pr=18636)
  skipped
- [bench / walltime build](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200470?pr=18636)
  in progress
- [bench / simulated](https://github.com/astral-sh/uv/actions/runs/23409518640/job/68094200498?pr=18636)
  in progress

### Code scanning results

- [zizmor](https://github.com/astral-sh/uv/pull/18636/checks?check_run_id=68094215543)
  success

## Run Log: plan

succeeded on 2026-03-22 (6 hours ago) in 32s

1. Set up job · success · 1s
2. Run actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd · success · 10s
3. Plan · success · 1s
4. Post Run actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd · success · 0s
5. Complete job · success · 0s

<!-- XLET-END -->

