
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Evaluate extras and groups when determining auditable packages · astral-sh/uv@f9377a7 · GitHub -->
<!-- https://github.com/astral-sh/uv/actions/runs/23519507540 -->

[astral-sh](https://github.com/astral-sh) / **[uv](https://github.com/astral-sh/uv)** Public

# Evaluate extras and groups when determining auditable packages #37636

## Workflow Summary

Triggered via pull request 2026-03-24 (23 hours ago)

woodruffw synchronize [#18511](https://github.com/astral-sh/uv/pull/18511) [ww/uv-audit-filter](https://github.com/astral-sh/uv/tree/refs/heads/ww/uv-audit-filter)

Status In progress

Total duration –

Artifacts 59

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
  - cargo test on macos (ok)
  - cargo test on windows 1 of 3 (ok)
  - cargo test on windows 2 of 3 (ok)
  - cargo test on windows 3 of 3 (ok)
- test-windows-trampolines (ok)
  - check windows crate version (ok)
  - check on x86_64 (ok)
  - check on i686 (ok)
  - check on aarch64 (ok)
  - test on x86_64 (ok)
  - test on i686 (ok)
  - test on aarch64 (ok)
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
- build-release-binaries (running)
  - sdist (ok)
  - x86_64-apple-darwin (ok)
  - aarch64-apple-darwin (ok)
  - x86_64-pc-windows-msvc (running)
  - i686-pc-windows-msvc (running)
  - aarch64-pc-windows-msvc (running)
  - i686-unknown-linux-gnu (ok)
  - x86_64-unknown-linux-gnu (ok)
  - aarch64-unknown-linux-gnu (ok)
  - armv7-unknown-linux-gnueabihf (ok)
  - arm-unknown-linux-musleabihf (ok)
  - s390x-unknown-linux-gnu (ok)
  - powerpc64le-unknown-linux-gnu (ok)
  - riscv64gc-unknown-linux-gnu (ok)
  - x86_64-unknown-linux-musl (ok)
  - i686-unknown-linux-musl (ok)
  - aarch64-unknown-linux-musl (ok)
  - armv7-unknown-linux-musleabihf (ok)
  - riscv64gc-unknown-linux-musl (ok)
- build-docker (ok)
  - plan (ok)
  - build uv (ok)
  - build alpine:3.23,alpine3.23,alpine (ok)
  - build alpine:3.22,alpine3.22 (ok)
  - build debian:trixie-slim,trixie-slim,debian-slim (ok)
  - build buildpack-deps:trixie,trixie,debian (ok)
  - build python:3.14-alpine3.23,python3.14-alpine3.23,python3.14-alpine (ok)
  - build python:3.13-alpine3.23,python3.13-alpine3.23,python3.13-alpine (ok)
  - build python:3.12-alpine3.23,python3.12-alpine3.23,python3.12-alpine (ok)
  - build python:3.11-alpine3.23,python3.11-alpine3.23,python3.11-alpine (ok)
  - build python:3.10-alpine3.23,python3.10-alpine3.23,python3.10-alpine (ok)
  - build python:3.9-alpine3.22,python3.9-alpine3.22,python3.9-alpine (ok)
  - build python:3.14-trixie,python3.14-trixie (ok)
  - build python:3.13-trixie,python3.13-trixie (ok)
  - build python:3.12-trixie,python3.12-trixie (ok)
  - build python:3.11-trixie,python3.11-trixie (ok)
  - build python:3.10-trixie,python3.10-trixie (ok)
  - build python:3.9-trixie,python3.9-trixie (ok)
  - build python:3.14-slim-trixie,python3.14-trixie-slim (ok)
  - build python:3.13-slim-trixie,python3.13-trixie-slim (ok)
  - build python:3.12-slim-trixie,python3.12-trixie-slim (ok)
  - build python:3.11-slim-trixie,python3.11-trixie-slim (ok)
  - build python:3.10-slim-trixie,python3.10-trixie-slim (ok)
  - build python:3.9-slim-trixie,python3.9-trixie-slim (ok)
  - build dhi.io/alpine-base:3.23,alpine3.23-dhi,alpine-dhi (ok)
  - build dhi.io/debian-base:trixie-debian13,trixie-dhi,debian-dhi (ok)
  - build dhi.io/python:3.14,python3.14-dhi (ok)
  - build dhi.io/python:3.13,python3.13-dhi (ok)
  - build dhi.io/python:3.12,python3.12-dhi (ok)
  - build dhi.io/python:3.11,python3.11-dhi (ok)
  - build dhi.io/python:3.10,python3.10-dhi (ok)
  - annotate uv (skipped)
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
- test-integration (ok)
  - nushell (ok)
  - conda on linux (ok)
  - conda on macos x86-64 (ok)
  - deadsnakes python3.9 on ubuntu (ok)
  - armv7 on aarch64 linux (ok)
  - free-threaded on windows (ok)
  - aarch64 windows implicit (ok)
  - aarch64 windows explicit (ok)
  - windows python install manager (ok)
  - windows registry (ok)
  - pypy on linux (ok)
  - pypy on windows (ok)
  - graalpy on linux (ok)
  - graalpy on windows (ok)
  - pyodide on linux (ok)
  - pyodide on windows (ok)
  - termux on android (ok)
  - github actions (ok)
  - free-threaded on github actions (ok)
  - pyenv on wsl (ok)
  - registries (ok)
  - uv_build (ok)
  - cache on linux (ok)
  - cache on macos aarch64 (ok)
- test-system (skipped)
- test-ecosystem (ok)
  - prefecthq/prefect (ok)
  - pallets/flask (ok)
  - pydantic/pydantic-core (ok)
- test uv publish (ok)
- all required jobs passed (ok)

## Annotations

167 warnings and 1 notice

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
- **build-dev-binaries / macos aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / linux aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **check-docs / mkdocs**
  > The `python-version` input is not set. The version of Python currently in `PATH` will be used.
- **build-dev-binaries / macos x86_64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / linux armv7 gnueabihf**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / android aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / linux libc**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / windows x86_64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / linux musl**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **build-dev-binaries / windows aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/upload-artifact@ea165f8d65b6e…
- **test-integration / pypy on linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / free-threaded on github actions**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / cache on macos aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-ecosystem / pallets/flask**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / nushell**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / termux on android**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / linux aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / github actions**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-ecosystem / pydantic/pydantic-core**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / pypy on windows**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / linux musl**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-ecosystem / prefecthq/prefect**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / deadsnakes python3.9 on ubuntu**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / free-threaded on windows**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / graalpy on linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / graalpy on windows**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / aarch64 windows explicit**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / windows python install manager**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / pyodide on linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / aarch64 windows implicit**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / conda on linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / conda on linux**
  > The 'defaults' channel might have been added implicitly. If this is intentional, add 'defaults' to the 'channels' list. Otherwise, consider setting 'c…
- **test-smoke / windows x86_64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / windows aarch64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / windows registry**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / pyodide on windows**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / armv7 on aarch64 linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / cache on linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / registries**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / pyenv on wsl**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-smoke / macos**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / uv_build**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / conda on macos x86-64**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **test-integration / conda on macos x86-64**
  > The 'defaults' channel might have been added implicitly. If this is intentional, add 'defaults' to the 'channels' list. Otherwise, consider setting 'c…
- **test uv publish**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/download-artifact@d3f86a106a0…
- **build-docker / build uv**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.10-slim-trixie,python3.10-trixie-slim**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.10-slim-trixie,python3.10-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.10-slim-trixie,python3.10-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.9-slim-trixie,python3.9-trixie-slim**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.9-slim-trixie,python3.9-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.9-slim-trixie,python3.9-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.13-alpine3.23,python3.13-alpine3.23,python3.13-alpine**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.13-alpine3.23,python3.13-alpine3.23,python3.13-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.13-alpine3.23,python3.13-alpine3.23,python3.13-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.13-alpine3.23,python3.13-alpine3.23,python3.13-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.13-alpine3.23,python3.13-alpine3.23,python3.13-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build debian:trixie-slim,trixie-slim,debian-slim**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build debian:trixie-slim,trixie-slim,debian-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build debian:trixie-slim,trixie-slim,debian-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build debian:trixie-slim,trixie-slim,debian-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build debian:trixie-slim,trixie-slim,debian-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.11-slim-trixie,python3.11-trixie-slim**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.11-slim-trixie,python3.11-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.11-slim-trixie,python3.11-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/alpine-base:3.23,alpine3.23-dhi,alpine-dhi**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build dhi.io/alpine-base:3.23,alpine3.23-dhi,alpine-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/alpine-base:3.23,alpine3.23-dhi,alpine-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/alpine-base:3.23,alpine3.23-dhi,alpine-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/alpine-base:3.23,alpine3.23-dhi,alpine-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.11,python3.11-dhi**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build dhi.io/python:3.11,python3.11-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.11,python3.11-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build alpine:3.22,alpine3.22**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build alpine:3.22,alpine3.22**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build alpine:3.22,alpine3.22**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.12-trixie,python3.12-trixie**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.12-trixie,python3.12-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.12-trixie,python3.12-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.13,python3.13-dhi**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build dhi.io/python:3.13,python3.13-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.13,python3.13-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build alpine:3.23,alpine3.23,alpine**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build alpine:3.23,alpine3.23,alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build alpine:3.23,alpine3.23,alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build alpine:3.23,alpine3.23,alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build alpine:3.23,alpine3.23,alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.9-alpine3.22,python3.9-alpine3.22,python3.9-alpine**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.9-alpine3.22,python3.9-alpine3.22,python3.9-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.9-alpine3.22,python3.9-alpine3.22,python3.9-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.9-alpine3.22,python3.9-alpine3.22,python3.9-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.9-alpine3.22,python3.9-alpine3.22,python3.9-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.12-alpine3.23,python3.12-alpine3.23,python3.12-alpine**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.12-alpine3.23,python3.12-alpine3.23,python3.12-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.12-alpine3.23,python3.12-alpine3.23,python3.12-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.12-alpine3.23,python3.12-alpine3.23,python3.12-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.12-alpine3.23,python3.12-alpine3.23,python3.12-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.10,python3.10-dhi**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build dhi.io/python:3.10,python3.10-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.10,python3.10-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.10-alpine3.23,python3.10-alpine3.23,python3.10-alpine**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.10-alpine3.23,python3.10-alpine3.23,python3.10-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.10-alpine3.23,python3.10-alpine3.23,python3.10-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.10-alpine3.23,python3.10-alpine3.23,python3.10-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.10-alpine3.23,python3.10-alpine3.23,python3.10-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.11-alpine3.23,python3.11-alpine3.23,python3.11-alpine**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.11-alpine3.23,python3.11-alpine3.23,python3.11-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.11-alpine3.23,python3.11-alpine3.23,python3.11-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.11-alpine3.23,python3.11-alpine3.23,python3.11-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.11-alpine3.23,python3.11-alpine3.23,python3.11-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.14,python3.14-dhi**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build dhi.io/python:3.14,python3.14-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.14,python3.14-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/debian-base:trixie-debian13,trixie-dhi,debian-dhi**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build dhi.io/debian-base:trixie-debian13,trixie-dhi,debian-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/debian-base:trixie-debian13,trixie-dhi,debian-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/debian-base:trixie-debian13,trixie-dhi,debian-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/debian-base:trixie-debian13,trixie-dhi,debian-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.13-slim-trixie,python3.13-trixie-slim**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.13-slim-trixie,python3.13-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.13-slim-trixie,python3.13-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.14-slim-trixie,python3.14-trixie-slim**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.14-slim-trixie,python3.14-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.14-slim-trixie,python3.14-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.14-alpine3.23,python3.14-alpine3.23,python3.14-alpine**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.14-alpine3.23,python3.14-alpine3.23,python3.14-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.14-alpine3.23,python3.14-alpine3.23,python3.14-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.14-alpine3.23,python3.14-alpine3.23,python3.14-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.14-alpine3.23,python3.14-alpine3.23,python3.14-alpine**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.12,python3.12-dhi**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build dhi.io/python:3.12,python3.12-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build dhi.io/python:3.12,python3.12-dhi**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.9-trixie,python3.9-trixie**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.9-trixie,python3.9-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.9-trixie,python3.9-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.12-slim-trixie,python3.12-trixie-slim**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.12-slim-trixie,python3.12-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.12-slim-trixie,python3.12-trixie-slim**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.13-trixie,python3.13-trixie**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.13-trixie,python3.13-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.13-trixie,python3.13-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.10-trixie,python3.10-trixie**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.10-trixie,python3.10-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.10-trixie,python3.10-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.14-trixie,python3.14-trixie**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.14-trixie,python3.14-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.14-trixie,python3.14-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build buildpack-deps:trixie,trixie,debian**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build buildpack-deps:trixie,trixie,debian**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build buildpack-deps:trixie,trixie,debian**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build buildpack-deps:trixie,trixie,debian**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build buildpack-deps:trixie,trixie,debian**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.11-trixie,python3.11-trixie**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: depot/setup-action@b0b1ea4f69e92ebf5d…
- **build-docker / build python:3.11-trixie,python3.11-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **build-docker / build python:3.11-trixie,python3.11-trixie**
  > dry-run does not conform to PEP 440. More info: https://www.python.org/dev/peps/pep-0440
- **bench / walltime on aarch64 linux**
  > Node.js 20 actions are deprecated. The following actions are running on Node.js 20 and may not work as expected: actions/cache@0057852bfaa89a56745cba8…
- **test uv publish**
  > Generating and uploading digital attestations

## Artifacts

Produced during runtime

| Name | Size | Digest |
| --- | --- | --- |
| artifacts-aarch64-apple-darwin | 19.4 MB | `sha256:c703709121820425d33c41c9aed34d99169d5840a2047eac5ddad8460985d771` |
| artifacts-aarch64-pc-windows-msvc | 20.6 MB | `sha256:f6e5a2471bd3bd5a87e9d4005de4e76be5a15c6ef5f006a04ca59dea72ca4115` |
| artifacts-aarch64-unknown-linux-gnu | 21.2 MB | `sha256:df69785510a7cadca9371880b08f57001da188bc1de0f095d136f7f5b3cb74e0` |
| artifacts-aarch64-unknown-linux-musl | 21.1 MB | `sha256:256766fb6d5ab21f6f372c24885373bd1e84d9e6087cdda3455afc8b35f106cf` |
| artifacts-arm-unknown-linux-musleabihf | 21.3 MB | `sha256:0de139c643a56f24fdd3ffce5e09e9ac0a490808a933ae733334e41896bdd8a6` |
| artifacts-armv7-unknown-linux-gnueabihf | 20.9 MB | `sha256:f7c2cb0fb055235ef83b4c87835ff6f0853681344cb037a2fcbc70e56fa9dec6` |
| artifacts-armv7-unknown-linux-musleabihf | 21 MB | `sha256:a23a2b71c4dc3126e4b08575c694c7d4fe6b1aa721a5203f765a11a08eb52e1f` |
| artifacts-i686-unknown-linux-gnu | 22.8 MB | `sha256:f34ddc5545d10f8585bf58cb156369d5b23d261cb38480899b8fd9ab2ba858ae` |
| artifacts-i686-unknown-linux-musl | 22 MB | `sha256:4ee687cdf0bb835d280b07151e82f78d54839db0fb9b3b0cb1dab89f25ec59a9` |
| artifacts-macos-x86_64 | 21.1 MB | `sha256:a00a4c891da7f49050b88d3d24096fb4468098c04307acf8d02644f60f39eb60` |
| artifacts-powerpc64le-unknown-linux-gnu | 23.3 MB | `sha256:51a06a7c7a0be5badf17407d8f5878d9be94bf0bb8461b12d9b26bfc705f88b4` |
| artifacts-riscv64gc-unknown-linux-gnu | 22.3 MB | `sha256:b897965843e3f95ae93276a4b53563c09fb490c71ade9bc4a0216ac2bf8b4c65` |
| artifacts-riscv64gc-unknown-linux-musl | 22.2 MB | `sha256:2cde4134015a7a7cadc88e56de99cc2e41360a6e9eda94087274c13172bce3f2` |
| artifacts-s390x-unknown-linux-gnu | 22.6 MB | `sha256:6c3dd09506530379ed44a07316692ed4355d1c88dbecab2acfaffeb25a159e91` |
| artifacts-x86_64-unknown-linux-gnu | 22.7 MB | `sha256:3ef49b12b11970565baceff7bb8323b48357a55519de998921f3104825faa099` |
| artifacts-x86_64-unknown-linux-musl | 22.9 MB | `sha256:681647b62cf490f458525c30c791b995304785c4f72f45ae66477f7d18b08bd6` |
| benchmarks-walltime | 624 MB | `sha256:a9f6239ff7bf9ada80acc2d247832f02af330ae9d187806219b2cac6a0d6ea13` |
| uv-android-aarch64-24ebe1ceffe693b17b16aa4785fab15c0fbb83f4 | 33.7 MB | `sha256:46061b284f6ac5759b4262e3316c43d9e4e1ae18cc6894e263b645f7541b88fd` |
| uv-linux-aarch64-24ebe1ceffe693b17b16aa4785fab15c0fbb83f4 | 35.5 MB | `sha256:e5f9bccc8ea784cd1273f9ce93579bb908f602beb2f01445733062d3aad9bdb0` |
| uv-linux-armv7-gnueabihf-24ebe1ceffe693b17b16aa4785fab15c0fbb83f4 | 33.3 MB | `sha256:804f2b0918b428527285b6a9957eda2aab2ec2147ac3e2de999baab4a3cf34e7` |
| uv-linux-libc-24ebe1ceffe693b17b16aa4785fab15c0fbb83f4 | 37 MB | `sha256:9dd44d832acfff39217cedf9d0dc300927ecc02159d0d5bf42da067761030a5b` |
| uv-linux-musl-24ebe1ceffe693b17b16aa4785fab15c0fbb83f4 | 41.3 MB | `sha256:2eac75b05f7e9628ecc3d2ba8147a467b180bda4ba6036c9fe747c72f9ea55bf` |
| uv-macos-aarch64-24ebe1ceffe693b17b16aa4785fab15c0fbb83f4 | 38.1 MB | `sha256:c01657596581c71b77f24bbe9a4737fa398eb7164855b01060a125b83d92402c` |
| uv-macos-x86_64-24ebe1ceffe693b17b16aa4785fab15c0fbb83f4 | 35.9 MB | `sha256:0dfc56146aaaf6539844de487a685b9624a249d0d044ddeada07513703ddb86d` |
| uv-windows-aarch64-24ebe1ceffe693b17b16aa4785fab15c0fbb83f4 | 23.9 MB | `sha256:13658bf8c285788120cbc5bff26f90432db480a043d150da39ff1a2b97fa82e7` |
| uv-windows-x86_64-24ebe1ceffe693b17b16aa4785fab15c0fbb83f4 | 25.4 MB | `sha256:9d5e7fcad2f15d5ad21f3b2fb2138b260ca30375e6c8680075eccca6e667f41d` |
| wheels_uv-aarch64-apple-darwin | 20.3 MB | `sha256:f620116349298203c4bb39e37bb3f19e969689b93ea58b3f9284ca07b92f7d32` |
| wheels_uv-aarch64-pc-windows-msvc | 22.3 MB | `sha256:6c25a40135f47f415100049ad6e68cb321d230bbe0f791441282773b0d585a94` |
| wheels_uv-aarch64-unknown-linux-gnu | 22.1 MB | `sha256:98c4dd63e8e443d19c8c36243ae27adf6394ef36adea507dd93bda2f22e2fe99` |
| wheels_uv-aarch64-unknown-linux-musl | 22 MB | `sha256:49c88544ce41e8bd59dab6e2c545bdbdb5b0119b4d8057ecc6fbe27435dae2ee` |
| wheels_uv-arm-unknown-linux-musleabihf | 22.2 MB | `sha256:91c0ea73581a2836f125f9bc1a70ab867430e921e8ee941df392e9b2f64c7b36` |
| wheels_uv-armv7-unknown-linux-gnueabihf | 21.8 MB | `sha256:5b8bdf9dac1e01b0e397407738a597513cf42b5db3798007864ae378ab9a9b0d` |
| wheels_uv-armv7-unknown-linux-musleabihf | 21.8 MB | `sha256:df30902951f01efccf637bd2e592d40e1e79325bb3227b6bf69fe81b0d01b3ad` |
| wheels_uv-i686-unknown-linux-gnu | 23.4 MB | `sha256:f85775c149930f5e9a2bb74144f98938177b826f54104ad4f3de10dcf42cc6bb` |
| wheels_uv-i686-unknown-linux-musl | 22.6 MB | `sha256:cb7260e52dd9e18eedba408c1ed538cec99228491cf7fc9a9a46578e78d2bbbe` |
| wheels_uv-macos-x86_64 | 21.7 MB | `sha256:85e4b3a0fda2d67df12a01d8ca440991021fe29e9f3528f513049ceacf2dcee7` |
| wheels_uv-powerpc64le-unknown-linux-gnu | 24 MB | `sha256:d808f8939750566ec16a8f9aa5616d9eb41e3b7c8e0f02f1b3640f17e9bb6bc8` |
| wheels_uv-riscv64gc-unknown-linux-gnu | 22.9 MB | `sha256:f7d5a0a89c39dc0f2b2ca040d9afa60ed104de185fc660c5a67607148942e078` |
| wheels_uv-riscv64gc-unknown-linux-musl | 22.9 MB | `sha256:2c7c3837f9d8ecd7b81cd77fab28c94bf27d6c6967c846c57676e7af5455aa9b` |
| wheels_uv-s390x-unknown-linux-gnu | 23.2 MB | `sha256:0e6775b3cfb17d21421e1e1c66d66ca01b0feadcea7e1069660e5d673ae1c544` |
| wheels_uv-sdist | 3.82 MB | `sha256:b74de46fee94539d1d5b2e9985cb116a201916450991d0a8f5cc62fac1994f53` |
| wheels_uv-x86_64-unknown-linux-gnu | 23.3 MB | `sha256:feed5e2887146eb94338d769cbc64a1d5f2f4a12d2238a9b9c8748cf1e5d1a2b` |
| wheels_uv-x86_64-unknown-linux-musl | 23.5 MB | `sha256:f818ab389faa3d20041696d4a82f6dfa7f3533cf4732b9f8733ddd296476d03f` |
| wheels_uv_build-aarch64-apple-darwin | 1.36 MB | `sha256:4805b75ed3bfd45da5e01b09ae189540966de95ebf5b555e76270ab9e63a0fa2` |
| wheels_uv_build-aarch64-unknown-linux-gnu | 1.52 MB | `sha256:ab1084379c3e7e4385c9dad2e85d105bc20ede1d8c3bd67e8196477fc3154139` |
| wheels_uv_build-aarch64-unknown-linux-musl | 1.53 MB | `sha256:b13d439227ceceb1aced0cadc5ed9e73316a27f2d7e3c5cb4ba5c778b09ba68e` |
| wheels_uv_build-arm-unknown-linux-musleabihf | 1.46 MB | `sha256:a75e849acce595cf0a0b37c15d2b65fc5bf8260d639ae0047156173aeff9b243` |
| wheels_uv_build-armv7-unknown-linux-gnueabihf | 1.41 MB | `sha256:d0ebe362ad90031dd7097194e2f930855ea232f5ee11c8ee5bb9c335260ee4c7` |
| wheels_uv_build-armv7-unknown-linux-musleabihf | 1.44 MB | `sha256:0c8c309cf4dbc8301839afafca839653df13dc02bdd5e192ce2435bd4ebb80b9` |
| wheels_uv_build-i686-unknown-linux-gnu | 1.57 MB | `sha256:f653488bc8c4dfae6f0672f5bd101522a8b886ec9cca0074bf79ca46ed03f636` |
| wheels_uv_build-i686-unknown-linux-musl | 1.53 MB | `sha256:7164e66a4581b9221300d3861f36d82852bd0dba8f492f4b9989c7c8f0c194d2` |
| wheels_uv_build-macos-x86_64 | 1.4 MB | `sha256:4138cf8719a0adbfa35da14f16bbeda69ca62eaf9a9d46bd3e7161ab89b6ff99` |
| wheels_uv_build-powerpc64le-unknown-linux-gnu | 1.6 MB | `sha256:4b345fd57c72f6bb76d0ce0cb8acb5e7d43e600418234d2167f9c4a67e452653` |
| wheels_uv_build-riscv64gc-unknown-linux-gnu | 1.49 MB | `sha256:f51caac04f9511232e9ef4bfcdcfe4f9e5f1bd3ad73eefc6bdbe7c781899b32a` |
| wheels_uv_build-riscv64gc-unknown-linux-musl | 1.52 MB | `sha256:5bf9c79a5d95cedcd09f48ad666e556d543443eb6afc10b24a69b641090ff65d` |
| wheels_uv_build-s390x-unknown-linux-gnu | 1.49 MB | `sha256:bc353b2a4a43d4048159e16689ff8393707ccae0a2b230b0e563268893a001de` |
| wheels_uv_build-sdist | 371 KB | `sha256:59cc1bbe88d7572982afee5d3bdba5cd0588d02f187d1b5c282d392fd2b388f3` |
| wheels_uv_build-x86_64-unknown-linux-gnu | 1.53 MB | `sha256:c11e06abb7655cd182dfc96acf565db9e92c1d99578e713a6ace48b9c921797b` |
| wheels_uv_build-x86_64-unknown-linux-musl | 1.59 MB | `sha256:460858652cd304e28c9b8f313c37940a26141c06d385c682b2a298a99411c666` |

<!-- XLET-END -->

