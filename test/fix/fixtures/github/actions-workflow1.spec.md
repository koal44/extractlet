
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- address review comments · astral-sh/uv@681befb  · GitHub -->
<!-- https://github.com/astral-sh/uv/actions/runs/23468574313/workflow -->

[astral-sh](https://github.com/astral-sh) / **[uv](https://github.com/astral-sh/uv)** Public

# Respect -q / -qq in uv self update #37581

## Workflow file for this run

[.github/workflows/ci.yml](https://github.com/astral-sh/uv/blob/681befbb9a2728351a75d6fe91e8a3153df044f8/.github/workflows/ci.yml) at [681befb](https://github.com/astral-sh/uv/commit/681befbb9a2728351a75d6fe91e8a3153df044f8)

```yaml
  1 name: CI
  2
  3 on:
  4   push:
  5     branches: [main]
  6   pull_request:
  7   workflow_dispatch:
  8
  9 permissions: {}
 10
 11 concurrency:
 12   group: ${{ github.workflow }}-${{ github.ref_name }}-${{ github.event.pull_request.number || github.sha }}
 13   cancel-in-progress: true
 14
 15 jobs:
 16   plan:
 17     runs-on: depot-ubuntu-24.04
 18     outputs:
 19       test-code: ${{ steps.plan.outputs.test_code }}
 20       check-schema: ${{ steps.plan.outputs.check_schema }}
 21       build-release-binaries: ${{ steps.plan.outputs.build_release_binaries }}
 22       run-checks: ${{ steps.plan.outputs.run_checks }}
 23       test-publish: ${{ steps.plan.outputs.test_publish }}
 24       test-windows-trampoline: ${{ steps.plan.outputs.test_windows_trampoline }}
 25       save-rust-cache: ${{ steps.plan.outputs.save_rust_cache }}
 26       run-bench: ${{ steps.plan.outputs.run_bench }}
 27       test-smoke: ${{ steps.plan.outputs.test_smoke }}
 28       test-ecosystem: ${{ steps.plan.outputs.test_ecosystem }}
 29       test-integration: ${{ steps.plan.outputs.test_integration }}
 30       test-system: ${{ steps.plan.outputs.test_system }}
 31       test-macos: ${{ steps.plan.outputs.test_macos }}
 32       build-docker: ${{ steps.plan.outputs.build_docker }}
 33       push-docker: ${{ steps.plan.outputs.push_docker }}
 34     steps:
 35       - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
 36         with:
 37           fetch-depth: 0
 38           persist-credentials: false
 39
 40       - name: "Plan"
 41         id: plan
 42         shell: bash
 43         env:
 44           GH_REF: ${{ github.ref }}
 45           HAS_SKIP_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'test:skip') }}
 46           HAS_INTEGRATION_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'test:integration') }}
 47           HAS_SYSTEM_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'test:system') }}
 48           HAS_EXTENDED_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'test:extended') }}
 49           HAS_MACOS_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'test:macos') }}
 50           HAS_PUBLISH_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'test:publish') }}
 51           HAS_BUILD_SKIP_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'build:skip') }}
 52           HAS_BUILD_SKIP_DOCKER_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'build:skip-docker') }}
 53           HAS_BUILD_SKIP_RELEASE_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'build:skip-release') }}
 54           HAS_BUILD_RELEASE_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'build:release') }}
 55           HAS_BUILD_PUSH_DOCKER_LABEL: ${{ contains(github.event.pull_request.labels.*.name, 'build:push-docker') }}
 56           BASE_SHA: ${{ github.event.pull_request.base.sha }}
 57         run: |
 58           [[ "$GH_REF" == "refs/heads/main" ]] && on_main_branch=1
 59           [[ "$HAS_SKIP_LABEL" == "true" ]] && has_skip_label=1
 60           [[ "$HAS_INTEGRATION_LABEL" == "true" ]] && has_integration_label=1
 61           [[ "$HAS_SYSTEM_LABEL" == "true" ]] && has_system_label=1
 62           [[ "$HAS_EXTENDED_LABEL" == "true" ]] && has_extended_label=1
 63           [[ "$HAS_MACOS_LABEL" == "true" ]] && has_macos_label=1
 64           [[ "$HAS_PUBLISH_LABEL" == "true" ]] && has_publish_label=1
 65           [[ "$HAS_BUILD_SKIP_LABEL" == "true" ]] && has_build_skip_label=1
 66           [[ "$HAS_BUILD_SKIP_DOCKER_LABEL" == "true" ]] && has_build_skip_docker_label=1
 67           [[ "$HAS_BUILD_SKIP_RELEASE_LABEL" == "true" ]] && has_build_skip_release_label=1
 68           [[ "$HAS_BUILD_RELEASE_LABEL" == "true" ]] && has_build_release_label=1
 69           [[ "$HAS_BUILD_PUSH_DOCKER_LABEL" == "true" ]] && has_build_push_docker_label=1
 70
 71           # Detect changed files
 72           while IFS= read -r file; do
 73             [[ -z "$file" ]] && continue
 74             [[ "$file" =~ \.rs$ ]] && rust_code_changed=1
 75             [[ "$file" == "Cargo.toml" || "$file" == "Cargo.lock" || "$file" =~ ^crates/.*/Cargo\.toml$ ]] && rust_deps_changed=1
 76             [[ "$file" == "rust-toolchain.toml" || "$file" =~ ^\.cargo/ ]] && rust_config_changed=1
 77             [[ "$file" == "pyproject.toml" || "$file" =~ ^crates/.*/pyproject\.toml$ ]] && python_config_changed=1
 78             [[ "$file" =~ ^\.github/workflows/.*\.yml$ ]] && workflow_changed=1
 79             [[ "$file" == ".github/workflows/build-release-binaries.yml" || "$file" == ".github/workflows/release.yml" ]] && release_workflow_changed=1
 80             [[ "$file" == "scripts/check_uv_wheel_contents.py" || "$file" == "scripts/patch-dist-manifest-checksums.py" ]] && release_build_changed=1
 81             [[ "$file" == ".github/workflows/ci.yml" ]] && ci_workflow_changed=1
 82             [[ "$file" == "uv.schema.json" ]] && schema_changed=1
 83             [[ "$file" =~ ^crates/uv-publish/ || "$file" =~ ^scripts/publish/ || "$file" == "crates/uv/src/commands/publish.rs" ]] && publish_code_changed=1
 84             [[ "$file" == ".github/workflows/test-windows-trampolines.yml" ]] && trampoline_workflow_changed=1
 85             [[ "$file" =~ ^crates/uv-trampoline/ || "$file" =~ ^crates/uv-trampoline-builder/ ]] && trampoline_code_changed=1
 86             [[ "$file" =~ ^crates/uv-build/ ]] && uv_build_changed=1
 87             [[ "$file" == "Dockerfile" ]] && dockerfile_changed=1
 88             [[ "$file" == ".github/workflows/build-docker.yml" ]] && docker_workflow_changed=1
 89             [[ "$file" == ".github/workflows/bench.yml" ]] && bench_workflow_changed=1
 90             [[ "$file" == ".github/workflows/test-integration.yml" || "$file" =~ ^test/integration/ || "$file" == "scripts/check_registry.py" || "$file" == "scripts/check_cache_compat.py" || "$file" == "scripts/registries-test.py" ]] && integration_changed=1
 91             [[ "$file" == ".github/workflows/test-system.yml" ]] && system_workflow_changed=1
 92             [[ "$file" == "scripts/check_system_python.py" || "$file" == "scripts/check_embedded_python.py" ]] && system_test_changed=1
 93             [[ "$file" =~ ^docs/ || "$file" =~ ^mkdocs.*\.yml$ || "$file" =~ \.md$ || "$file" =~ ^bin/ || "$file" =~ ^assets/ ]] && continue
 94             any_code_changed=1
 95           done <<< "$(git diff --name-only "${BASE_SHA:-origin/main}...HEAD")"
 96
 97           # Derived groups
 98           [[ $rust_code_changed || $rust_deps_changed || $rust_config_changed ]] && any_rust_changed=1
 99           [[ $python_config_changed || $rust_deps_changed || $rust_config_changed || $uv_build_changed || $release_workflow_changed ]] && release_build_changed=1
100           [[ $publish_code_changed || $ci_workflow_changed ]] && publish_changed=1
101           [[ $rust_deps_changed || $rust_config_changed || $workflow_changed ]] && cache_relevant_changed=1
102           [[ $python_config_changed || $rust_deps_changed || $rust_config_changed || $dockerfile_changed || $docker_workflow_changed ]] && docker_build_changed=1
103
104           # Decisions
105           [[ ! $has_skip_label && ($any_code_changed || $on_main_branch) ]] && test_code=1
106           [[ $schema_changed ]] && check_schema=1
107           [[ ! $has_skip_label && ! $has_build_skip_label && ! $has_build_skip_release_label && ($release_build_changed || $has_build_release_label) ]] && build_release_binaries=1
108           [[ ! $has_skip_label ]] && run_checks=1
109           [[ $publish_changed || $has_publish_label || $has_extended_label || $on_main_branch ]] && test_publish=1
110           [[ ! $has_skip_label && ($trampoline_code_changed || $trampoline_workflow_changed || $rust_deps_changed || $on_main_branch) ]] && test_windows_trampoline=1
111           [[ $on_main_branch || $cache_relevant_changed ]] && save_rust_cache=1
112           [[ ! $has_skip_label && ($any_rust_changed || $bench_workflow_changed || $on_main_branch) ]] && run_bench=1
113           [[ ! $has_skip_label ]] && test_smoke=1
114           [[ ! $has_skip_label ]] && test_ecosystem=1
115           [[ $has_integration_label || $has_extended_label || $on_main_branch || $integration_changed ]] && test_integration=1
116           [[ $has_system_label || $has_extended_label || $on_main_branch || $system_workflow_changed || $system_test_changed ]] && test_system=1
117           [[ $has_macos_label || $has_extended_label || $on_main_branch || $build_release_binaries ]] && test_macos=1
118           [[ ! $has_build_skip_label && ! $has_build_skip_docker_label && ($docker_build_changed || $has_build_push_docker_label) ]] && build_docker=1
119           [[ $has_build_push_docker_label ]] && push_docker=1
120
121           # Output (convert 1/empty to true/false for GHA)
122           out() { [[ "$2" ]] && echo "$1=true" || echo "$1=false"; }
123           {
124             out test_code               "$test_code"
125             out check_schema            "$check_schema"
126             out build_release_binaries  "$build_release_binaries"
127             out run_checks              "$run_checks"
128             out test_publish            "$test_publish"
129             out test_windows_trampoline "$test_windows_trampoline"
130             out save_rust_cache         "$save_rust_cache"
131             out run_bench               "$run_bench"
132             out test_smoke              "$test_smoke"
133             out test_ecosystem          "$test_ecosystem"
134             out test_integration        "$test_integration"
135             out test_system             "$test_system"
136             out test_macos              "$test_macos"
137             out build_docker            "$build_docker"
138             out push_docker             "$push_docker"
139           } >> "$GITHUB_OUTPUT"
140
141   check-fmt:
142     uses: ./.github/workflows/check-fmt.yml
143
144   check-lint:
145     needs: plan
146     uses: ./.github/workflows/check-lint.yml
147     with:
148       code-changed: ${{ needs.plan.outputs.test-code }}
149       save-rust-cache: ${{ needs.plan.outputs.save-rust-cache }}
150
151   check-docs:
152     needs: plan
153     if: ${{ needs.plan.outputs.run-checks == 'true' }}
154     uses: ./.github/workflows/check-docs.yml
155     secrets: inherit
156
157   check-zizmor:
158     needs: plan
159     if: ${{ needs.plan.outputs.run-checks == 'true' }}
160     uses: ./.github/workflows/check-zizmor.yml
161     permissions:
162       contents: read
163       security-events: write
164
165   check-publish:
166     needs: plan
167     if: ${{ needs.plan.outputs.test-code == 'true' }}
168     uses: ./.github/workflows/check-publish.yml
169
170   check-release:
171     needs: plan
172     if: ${{ needs.plan.outputs.run-checks == 'true' }}
173     uses: ./.github/workflows/check-release.yml
174
175   check-generated-files:
176     needs: plan
177     if: ${{ needs.plan.outputs.test-code == 'true' }}
178     uses: ./.github/workflows/check-generated-files.yml
179     with:
180       schema-changed: ${{ needs.plan.outputs.check-schema }}
181       save-rust-cache: ${{ needs.plan.outputs.save-rust-cache }}
182
183   test:
184     needs: plan
185     if: ${{ needs.plan.outputs.test-code == 'true' }}
186     uses: ./.github/workflows/test.yml
187     with:
188       save-rust-cache: ${{ needs.plan.outputs.save-rust-cache }}
189       test-macos: ${{ needs.plan.outputs.test-macos }}
190
191   test-windows-trampolines:
192     needs: plan
193     if: ${{ needs.plan.outputs.test-windows-trampoline == 'true' }}
194     uses: ./.github/workflows/test-windows-trampolines.yml
195
196   build-dev-binaries:
197     needs: plan
198     if: ${{ needs.plan.outputs.test-code == 'true' }}
199     uses: ./.github/workflows/build-dev-binaries.yml
200     with:
201       save-rust-cache: ${{ needs.plan.outputs.save-rust-cache }}
202
203   test-smoke:
204     needs:
205       - plan
206       - build-dev-binaries
207     if: ${{ needs.plan.outputs.test-smoke == 'true' }}
208     uses: ./.github/workflows/test-smoke.yml
209     with:
210       sha: ${{ github.sha }}
211
212   test-integration:
213     needs:
214       - plan
215       - build-dev-binaries
216     if: ${{ needs.plan.outputs.test-integration == 'true' }}
217     uses: ./.github/workflows/test-integration.yml
218     secrets: inherit
219     permissions:
220       id-token: write
221     with:
222       sha: ${{ github.sha }}
223
224   test-system:
225     needs:
226       - plan
227       - build-dev-binaries
228     if: ${{ needs.plan.outputs.test-system == 'true' }}
229     uses: ./.github/workflows/test-system.yml
230     with:
231       sha: ${{ github.sha }}
232
233   test-ecosystem:
234     needs:
235       - plan
236       - build-dev-binaries
237     if: ${{ needs.plan.outputs.test-ecosystem == 'true' }}
238     uses: ./.github/workflows/test-ecosystem.yml
239     with:
240       sha: ${{ github.sha }}
241
242   build-release-binaries:
243     needs: plan
244     if: ${{ needs.plan.outputs.build-release-binaries == 'true' }}
245     uses: ./.github/workflows/build-release-binaries.yml
246     secrets: inherit
247
248   build-docker:
249     needs: plan
250     if: ${{ needs.plan.outputs.build-docker == 'true' }}
251     uses: ./.github/workflows/build-docker.yml
252     with:
253       push-dev: ${{ needs.plan.outputs.push-docker == 'true' }}
254     secrets: inherit
255     permissions:
256       contents: read
257       id-token: write
258       packages: write
259       attestations: write
260
261   bench:
262     needs: plan
263     if: ${{ needs.plan.outputs.run-bench == 'true' }}
264     uses: ./.github/workflows/bench.yml
265     secrets: inherit
266     with:
267       save-rust-cache: ${{ needs.plan.outputs.save-rust-cache }}
268
269   # This job cannot be moved into a reusable workflow because it includes coverage for uploading
270   # attestations and PyPI does not support attestations in reusable workflows.
271   test-publish:
272     name: "test uv publish"
273     timeout-minutes: 20
274     needs:
275       - plan
276       - build-dev-binaries
277     runs-on: ubuntu-latest
278     # Only the main repository is a trusted publisher
279     if: ${{ github.repository == 'astral-sh/uv' && github.event.pull_request.head.repo.fork != true && needs.plan.outputs.test-publish == 'true' }}
280     environment:
281       name: uv-test-publish
282       deployment: false
283     env:
284       # No dbus in GitHub Actions
285       PYTHON_KEYRING_BACKEND: keyrings.alt.file.PlaintextKeyring
286       PYTHON_VERSION: 3.12
287     permissions:
288       # For trusted publishing
289       id-token: write
290     steps:
291       - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
292         with:
293           fetch-depth: 0
294           persist-credentials: false
295
296       - uses: actions/setup-python@a309ff8b426b58ec0e2a45f0f869d46889d02405 # v6.2.0
297         with:
298           python-version: "${{ env.PYTHON_VERSION }}"
299
300       - name: "Download binary"
301         uses: actions/download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093 # v4.3.0
302         with:
303           name: uv-linux-libc-${{ github.sha }}
304
305       - name: "Prepare binary"
306         run: chmod +x ./uv
307
308       - name: "Build astral-test-pypa-gh-action"
309         shell: bash -eo pipefail {0}
310         run: |
311           # Build a yet unused version of `astral-test-pypa-gh-action`
312           mkdir astral-test-pypa-gh-action
313           cd astral-test-pypa-gh-action
314           ../uv init --package --no-workspace
315           # Get the latest patch version
316           patch_version=$(curl https://test.pypi.org/simple/astral-test-pypa-gh-action/?format=application/vnd.pypi.simple.v1+json | jq --raw-output '[.files[].filename | select(endswith(".tar.gz"))] | last' | grep -oP '(?<=astral_test_pypa_gh_action-0\.1\.)\d+(?=\.tar\.gz)')
317           # Set the current version to one higher (which should be unused)
318           sed -i "s/0.1.0/0.1.$((patch_version + 1))/g" pyproject.toml
319           ../uv build
320
321       - name: "Publish astral-test-pypa-gh-action"
322         uses: pypa/gh-action-pypi-publish@ed0c53931b1dc9bd32cbe73a98c7f6766f8a527e # v1.13.0
323         with:
324           # With this GitHub action, we can't do as rigid checks as with our custom Python script, so we publish more
325           # leniently
326           skip-existing: "true"
327           verbose: "true"
328           repository-url: "https://test.pypi.org/legacy/"
329           packages-dir: "astral-test-pypa-gh-action/dist"
330
331       - name: "Request GitLab OIDC tokens for impersonation"
332         uses: digital-blueprint/gitlab-pipeline-trigger-action@c59b56e9d2688ab42c1304322ac8831a4ef6f7d2 # v1.4.0
333         with:
334           host: gitlab.com
335           id: astral-test-publish/astral-test-gitlab-pypi-tp
336           ref: main
337           trigger_token: ${{ secrets.GITLAB_TEST_PUBLISH_TRIGGER_TOKEN }}
338           access_token: ${{ secrets.GITLAB_TEST_PUBLISH_ACCESS_TOKEN }}
339           download_artifacts: true
340           fail_if_no_artifacts: true
341           download_path: ./gitlab-artifacts
342
343       - name: "Load GitLab OIDC tokens from GitLab job artifacts"
344         id: load-gitlab-oidc-token
345         run: |
346           # we expect ./gitlab-artifacts/*/artifacts/pypi-id-token to exist
347           pypi_id_token_file=$(find ./gitlab-artifacts -type f -name pypi-id-token | head -n 1)
348           if [ -z "${pypi_id_token_file}" ]; then
349             echo "No pypi-id-token file found in GitLab artifacts"
350             exit 1
351           fi
352           GITLAB_PYPI_OIDC_TOKEN=$(cat "${pypi_id_token_file}")
353
354           # we expect ./gitlab-artifacts/*/artifacts/pyx-id-token to exist
355           pyx_id_token_file=$(find ./gitlab-artifacts -type f -name pyx-id-token | head -n 1)
356           if [ -z "${pyx_id_token_file}" ]; then
357             echo "No pyx-id-token file found in GitLab artifacts"
358             exit 1
359           fi
360           GITLAB_PYX_OIDC_TOKEN=$(cat "${pyx_id_token_file}")
361
362           # Add secret masks for the tokens.
363           echo "::add-mask::$GITLAB_PYPI_OIDC_TOKEN"
364           echo "::add-mask::$GITLAB_PYX_OIDC_TOKEN"
365
366           echo "GITLAB_PYPI_OIDC_TOKEN=${GITLAB_PYPI_OIDC_TOKEN}" >> "${GITHUB_OUTPUT}"
367           echo "GITLAB_PYX_OIDC_TOKEN=${GITLAB_PYX_OIDC_TOKEN}" >> "${GITHUB_OUTPUT}"
368
369       - name: "Add password to keyring"
370         run: |
371           # `keyrings.alt` contains the plaintext keyring
372           ./uv tool install --with keyrings.alt keyring
373           echo $UV_TEST_PUBLISH_KEYRING | keyring set https://test.pypi.org/legacy/?astral-test-keyring __token__
374         env:
375           UV_TEST_PUBLISH_KEYRING: ${{ secrets.UV_TEST_PUBLISH_KEYRING }}
376
377       - name: "Add password to uv text store"
378         run: |
379           ./uv auth login https://test.pypi.org/legacy/?astral-test-text-store --token ${UV_TEST_PUBLISH_TEXT_STORE}
380         env:
381           UV_TEST_PUBLISH_TEXT_STORE: ${{ secrets.UV_TEST_PUBLISH_TEXT_STORE }}
382
383       - name: "Publish test packages"
384         # `-p 3.12` prefers the python we just installed over the one locked in `.python_version`.
385         run: ./uv run --no-project -p "${PYTHON_VERSION}" scripts/publish/test_publish.py --uv ./uv all
386         env:
387           RUST_LOG: uv=debug,uv_publish=trace
388           UV_TEST_PUBLISH_TOKEN: ${{ secrets.UV_TEST_PUBLISH_TOKEN }}
389           UV_TEST_PUBLISH_PASSWORD: ${{ secrets.UV_TEST_PUBLISH_PASSWORD }}
390           UV_TEST_PUBLISH_GITLAB_PAT: ${{ secrets.UV_TEST_PUBLISH_GITLAB_PAT }}
391           UV_TEST_PUBLISH_CODEBERG_TOKEN: ${{ secrets.UV_TEST_PUBLISH_CODEBERG_TOKEN }}
392           UV_TEST_PUBLISH_CLOUDSMITH_TOKEN: ${{ secrets.UV_TEST_PUBLISH_CLOUDSMITH_TOKEN }}
393           UV_TEST_PUBLISH_PYX_TOKEN: ${{ secrets.UV_TEST_PUBLISH_PYX_TOKEN }}
394           UV_TEST_PUBLISH_PYTHON_VERSION: ${{ env.PYTHON_VERSION }}
395           UV_TEST_PUBLISH_GITLAB_PYPI_OIDC_TOKEN: ${{ steps.load-gitlab-oidc-token.outputs.GITLAB_PYPI_OIDC_TOKEN }}
396           UV_TEST_PUBLISH_GITLAB_PYX_OIDC_TOKEN: ${{ steps.load-gitlab-oidc-token.outputs.GITLAB_PYX_OIDC_TOKEN }}
397
398   required-checks-passed:
399     name: "all required jobs passed"
400     if: always()
401     needs:
402       - check-fmt
403       - check-lint
404       - check-docs
405       - check-generated-files
406       - test
407       - build-dev-binaries
408     runs-on: ubuntu-slim
409     steps:
410       - name: "Check required jobs passed"
411         run: |
412           failing=$(echo "$NEEDS_JSON" | jq -r 'to_entries[] | select(.value.result != "success" and .value.result != "skipped") | "\(.key): \(.value.result)"')
413           if [ -n "$failing" ]; then
414             echo "$failing"
415             exit 1
416           fi
417         env:
418           NEEDS_JSON: ${{ toJSON(needs) }}
```

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

<!-- XLET-END -->

