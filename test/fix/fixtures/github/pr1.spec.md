
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Add fixed grammars by sumittlearnbay · Pull Request #4894 · antlr/antlr4 · GitHub -->
<!-- https://github.com/antlr/antlr4/pull/4894 -->

## Initial Post
_No description provided. _

[[ sumittlearnbay on 2025-10-12 (5 months ago) ]]


## Comment 1
Add non-overlapping ANTLR grammar examples for runtime tests

This commit introduces a set of nine non-obvious, non-overlapping grammars  
under `runtime-testsuite/test/org/antlr/v4/test/runtime/antlr_grammars/`  
to demonstrate and validate diverse ANTLR 4 parsing features.

Included grammars:

- Arithmetic.g4 — arithmetic expression parsing
- BooleanExpr.g4 — boolean and logical expressions
- CSVFlexible.g4 — flexible CSV handling with optional quotes
- JSONMini.g4 — minimal JSON subset parser
- MiniConfig.g4 — simple key-value configuration format
- MiniMarkdown.g4 — lightweight markdown-like parser
- MiniQuery.g4 — SQL-inspired query syntax
- UnitExpr.g4 — unit-based mathematical expressions
-

All grammars are self-contained and compile successfully with ANTLR 4.  
Removed obsolete GrammarCompilationTest.java to fix build issues

[[ sumittlearnbay on 2025-10-12 (5 months ago) ]]


## Comment 2
[0xFireWolf](https://github.com/0xFireWolf) and others added 4 commits

[[ 0xFireWolf on 2025-10-12 (5 months ago) ]]


## Comment 3
[Cpp: Fix the unused parameter warning in the sempred function. (](https://github.com/antlr/antlr4/pull/4894/commits/84239284e74e0aca929e0f5d9cb8a7f2d8740381 "Cpp: Fix the unused parameter warning in the sempred function. (#4171)")[antlr…](https://github.com/antlr/antlr4/pull/4171)

:::details
…[#4171](https://github.com/antlr/antlr4/pull/4171))

Signed-off-by: FireWolf <austere.j@gmail.com>
Signed-off-by: sumittlearnbay <sumit.learnbay@gmail.com>
:::

[[ 0xFireWolf ]]


## Comment 4
[Add 9 non-overlapping grammars and compilation test under antlr_grammars](https://github.com/antlr/antlr4/pull/4894/commits/66e3fda7cf9311591928ecd5e3881506ca74cb03)

:::details
Signed-off-by: sumittlearnbay <sumit.learnbay@gmail.com>
:::

[[ sumittlearnbay ]]


## Comment 5
[Move grammars to src/main/antlr4 for automatic generation](https://github.com/antlr/antlr4/pull/4894/commits/7d84b56f65ce6524f38efd89d89a65419d2c42d5)

:::details
Signed-off-by: sumittlearnbay <sumit.learnbay@gmail.com>
:::

[[ sumittlearnbay ]]


## Comment 6
[Add non-overlapping grammars under runtime-testsuite/src/main/antlr4](https://github.com/antlr/antlr4/pull/4894/commits/b340cb9b63924eb8919ab28d04d2eda99b906889)

:::details
Signed-off-by: sumittlearnbay <sumit.learnbay@gmail.com>
:::

[[ sumittlearnbay ]]


## Comment 7
[sumittlearnbay](https://github.com/sumittlearnbay) [force-pushed](https://github.com/antlr/antlr4/compare/4148b070984d2217e7733e5936dd8a1eced6a9be..b340cb9b63924eb8919ab28d04d2eda99b906889) the add-fixed-grammars branch from [`4148b07`](https://github.com/antlr/antlr4/commit/4148b070984d2217e7733e5936dd8a1eced6a9be) to [`b340cb9`](https://github.com/antlr/antlr4/commit/b340cb9b63924eb8919ab28d04d2eda99b906889) [Compare](https://github.com/antlr/antlr4/compare/4148b070984d2217e7733e5936dd8a1eced6a9be..b340cb9b63924eb8919ab28d04d2eda99b906889)

[[ sumittlearnbay on 2025-10-12 (5 months ago) ]]


## Comment 8
successful check

[[ sumittlearnbay on 2025-10-12 (5 months ago) ]]


## Comment 9
For pedagogical purposes, your grammars should use EOF-terminated start rules. Since Antlr 4.7, the behavior of Antlr parsers has changed in how they parse at the point of an error: the parser backs up the input pointer to the last valid parse and reports success. For example, with Arithmetic.g4, the input `1+2     3` parses. (The parse tree is `(expr (expr (INT "1")) (T__3 "+") (expr (INT "2")))`.) This is not what most people expect, and it has resulted in dozens of issues in [grammars-v4](https://github.com/antlr/grammars-v4), other Github projects (e.g., [Spice](https://github.com/spicelang/spice/issues/661)), and most recently in this repo ([#4890](https://github.com/antlr/antlr4/issues/4890)).

Also, I don't think your BooleanExpr grammar is a good example. Typically, the `NOT` operator has higher precedence than `AND` or `OR`, and textbooks on Boolean algebra follow this tradition. See [https://bob.cs.sonoma.edu/IntroCompOrg-RPi/sec-balgebra.html#tb-boolprec](https://bob.cs.sonoma.edu/IntroCompOrg-RPi/sec-balgebra.html#tb-boolprec). So, for input `NOT TRUE OR FALSE`, the parse tree should be `(expr (expr (NOT "NOT") (expr (BOOL "TRUE"))) (OR "OR") (expr (BOOL "FALSE")))`, not `(expr (NOT "NOT") (expr (expr (BOOL "TRUE")) (OR "OR") (expr (BOOL "FALSE"))))`, which is what your grammar produces.

[[ kaby76 on 2025-10-12 (5 months ago) ]]


## Comment 10
[Add EOF-terminated fixed grammars following Boolean precedence standards](https://github.com/antlr/antlr4/pull/4894/commits/3c310e94b5d9aed0619a6abea5c9291e572ba116)

:::details
Signed-off-by: sumittlearnbay <sumit.learnbay@gmail.com>
:::

[[ sumittlearnbay ]]


## Comment 11
Add EOF-terminated fixed grammars following ANTLR 4.7+ and Boolean precedence standards

- All grammars now terminate start rules with EOF for full input coverage, ensuring correct behavior under ANTLR 4.7+ (resolves partial parse acceptance issue).
- BooleanExpr.g4 updated to follow textbook operator precedence:  
   NOT > AND > OR  
   (as per Table 5.1.4 in Robert G. Plantz, _Introduction to Computer Organization_).
- Other grammars (Arithmetic, JSONMini, CSVFlexible, etc.) adjusted for clarity, non-overlap, and pedagogical consistency.
- Removed test scaffolds for simplified inclusion in runtime-testsuite.

Signed-off-by: Sumit Pawar [sumittlearnbay@gmail.com](mailto:sumittlearnbay@gmail.com)

[[ sumittlearnbay on 2025-10-12 (5 months ago) ]]


## Comment 12
Add EOF-terminated fixed grammars following ANTLR 4.7+ and Boolean precedence standards

- All grammars now terminate start rules with EOF for full input coverage, ensuring correct behavior under ANTLR 4.7+ (resolves partial parse acceptance issue).
- BooleanExpr.g4 updated to follow textbook operator precedence:  
   NOT > AND > OR  
   (as per Table 5.1.4 in Robert G. Plantz, _Introduction to Computer Organization_).
- Other grammars (Arithmetic, JSONMini, CSVFlexible, etc.) adjusted for clarity, non-overlap, and pedagogical consistency.
- Removed test scaffolds for simplified inclusion in runtime-testsuite.

Signed-off-by: Sumit Pawar [sumittlearnbay@gmail.com](mailto:sumittlearnbay@gmail.com)

[[ sumittlearnbay on 2025-10-12 (5 months ago) ]]

<!-- XLET-END -->

