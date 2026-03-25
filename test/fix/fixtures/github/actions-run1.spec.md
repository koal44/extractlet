
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Respect -q / -qq in uv self update · astral-sh/uv@681befb · GitHub -->
<!-- https://github.com/astral-sh/uv/actions/runs/23468574313/ -->

[astral-sh](https://github.com/astral-sh) / **[uv](https://github.com/astral-sh/uv)** Public

# Respect -q / -qq in uv self update #37581

## Workflow Summary

Triggered via pull request 2026-03-23 (2 days ago)

bejugamvarun synchronize [#18645](https://github.com/astral-sh/uv/pull/18645) [bejugamvarun:feat/uv-self-update-quiet-flags](https://github.com/bejugamvarun/uv/tree/refs/heads/feat/uv-self-update-quiet-flags)

Status Success

Total duration 17m 49s

Artifacts 10

## All Jobs

- plan (ok)
- check-fmt (ok)
  - rust (ok)
  - prettier (ok)
  - python (ok)
- check-lint (ok)
  - ruff (ok)
  - ty (ok)
  - shellcheck (ok)
  - validate-pyproject (ok)
  - readme (ok)
  - clippy on linux (ok)
  - clippy on windows (ok)
  - cargo shear (ok)
  - typos (ok)
- check-docs (ok)
  - mkdocs (ok)
- check-zizmor (ok)
  - zizmor (ok)
- check-publish (ok)
  - cargo publish dry-run (ok)
- check-release (ok)
  - dist plan (ok)
- check-generated-files (ok)
  - cargo dev generate-all (ok)
- test (ok)
  - cargo test on linux (ok)
  - cargo test on macos (skipped)
  - cargo test on windows 1 of 3 (ok)
  - cargo test on windows 2 of 3 (ok)
  - cargo test on windows 3 of 3 (ok)
- test-windows-trampolines (skipped)
- build-dev-binaries (ok)
  - linux libc (ok)
  - linux aarch64 (ok)
  - linux armv7 gnueabihf (ok)
  - linux musl (ok)
  - macos aarch64 (ok)
  - macos x86_64 (ok)
  - windows x86_64 (ok)
  - windows aarch64 (ok)
  - msrv (ok)
  - android aarch64 (ok)
  - freebsd (ok)
- build-release-binaries (skipped)
- build-docker (skipped)
- bench (ok)
  - walltime build (ok)
  - simulated (ok)
  - walltime on aarch64 linux (ok)
- test-smoke (ok)
  - linux (ok)
  - linux aarch64 (ok)
  - linux musl (ok)
  - macos (ok)
  - windows x86_64 (ok)
  - windows aarch64 (ok)
- test-integration (skipped)
- test-system (skipped)
- test-ecosystem (ok)
  - prefecthq/prefect (ok)
  - pallets/flask (ok)
  - pydantic/pydantic-core (ok)
- test uv publish (skipped)
- all required jobs passed (ok)

## Annotations

30 warnings

- **shear/doctest_disabled_with_doctests**
  > `doctest = false` on lib target `uv_keyring` but source contains doc tests (set `doctest = true` or remove the `doctest = false` setting)
- **shear/doctest_enabled_without_doctests**
  > `doctest = true` on lib target `uv_globfilter` but source contains no doc tests (set `doctest = false` to avoid running doc tests for this target)
- **shear/test_enabled_without_tests**
  > `test = true` on lib target `uv_git` but source contains no tests (set `test = false` to avoid compiling a test harness for this target)
- **shear/test_enabled_without_tests**
  > `test = true` on lib target `uv_flags` but source contains no tests (set `test = false` to avoid compiling a test harness for this target)
- **shear/doctest_disabled_with_doctests**
  > `doctest = false` on lib target `uv_distribution_filename` but source contains doc tests (set `doctest = true` or remove the `doctest = false` setting…
- **shear/test_enabled_without_tests**
  > `test = true` on lib target `uv_dispatch` but source contains no tests (set `test = false` to avoid compiling a test harness for this target)
- **shear/doctest_enabled_without_doctests**
  > `doctest = true` on lib target `uv_dev` but source contains no doc tests (set `doctest = false` to avoid running doc tests for this target)
- **shear/test_enabled_without_tests**
  > `test = true` on lib target `uv_console` but source contains no tests (set `test = false` to avoid compiling a test harness for this target)
- **shear/test_enabled_without_tests**
  > `test = true` on lib target `uv_bench` but source contains no tests (set `test = false` to avoid compiling a test harness for this target)
- **shear/doctest_enabled_without_doctests**
  > `doctest = true` on lib target `uv` but source contains no doc tests (set `doctest = false` to avoid running doc tests for this target)
- **build-dev-binaries / linux libc**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / android aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / linux aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / macos aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **check-docs / mkdocs**
  > The `python-version` input is not set. The version of Python currently in `PATH` will be used.
- **build-dev-binaries / linux musl**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / linux armv7 gnueabihf**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / macos x86_64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / windows x86_64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / windows aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **test-ecosystem / pallets/flask**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / linux musl**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-ecosystem / pydantic/pydantic-core**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-ecosystem / prefecthq/prefect**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / linux aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / windows x86_64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / windows aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / macos**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **bench / walltime on aarch64 linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/cache@0057852bfaa89a56745cba8…

## Artifacts

Produced during runtime

| Name | Size | Digest |
| --- | --- | --- |
| benchmarks-walltime | 624 MB | `sha256:bfbd32931052970f431c20d15bb428832673e481492dc322aa8ce9afa4c531dc` |
| uv-android-aarch64-1704adcb442190aee9a7ada3dd809d94172b2ee6 | 33.7 MB | `sha256:1235ae35e4f40b91dc8fa4efa669b0e03aece2a5aa316a287ed14e650e3fbca2` |
| uv-linux-aarch64-1704adcb442190aee9a7ada3dd809d94172b2ee6 | 35.5 MB | `sha256:4df9436a7d01979432896b5c6431701569c9b81380d0d3e1d7ceb3b9852d5f33` |
| uv-linux-armv7-gnueabihf-1704adcb442190aee9a7ada3dd809d94172b2ee6 | 33.3 MB | `sha256:e52015f16ec476d9253ff067f0239d994a9421eff84d851f93426e2c54b641b5` |
| uv-linux-libc-1704adcb442190aee9a7ada3dd809d94172b2ee6 | 37 MB | `sha256:412b84a7559fa69376aacfefe6b2ace31ca77c44269feb546be9c5898bd7b65b` |
| uv-linux-musl-1704adcb442190aee9a7ada3dd809d94172b2ee6 | 41.2 MB | `sha256:570a91eeb4790cdecb5364177ccbdd6cd23219f9dd5e8eaff8945634465d9960` |
| uv-macos-aarch64-1704adcb442190aee9a7ada3dd809d94172b2ee6 | 38 MB | `sha256:9b3ef7aeb31267c6bdc6df0f2e67f6c24cb3acb724160ba43c2c255109508ea3` |
| uv-macos-x86_64-1704adcb442190aee9a7ada3dd809d94172b2ee6 | 35.9 MB | `sha256:bb7c4823cf3bd6083ddfcf3ecd4137cdb0824bf8d792195c29b66bd2d03cce36` |
| uv-windows-aarch64-1704adcb442190aee9a7ada3dd809d94172b2ee6 | 23.9 MB | `sha256:0ec45577d1c459885f53bd72b70780306a0ecc6c4601d0661390fbe8573b6799` |
| uv-windows-x86_64-1704adcb442190aee9a7ada3dd809d94172b2ee6 | 25.4 MB | `sha256:85793eef6e7ef4fcb8b0c69801c959fc0bb4d0b2b05335567cf814d06aa89cec` |

<!-- XLET-END -->

