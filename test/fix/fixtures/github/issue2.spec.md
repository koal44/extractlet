
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- typing.io deprecated and removed with python3.13 -->
<!-- https://github.com/antlr/antlr4/issues/4896 -->

## Initial Post
I see that this was a concern in the past [#2611](https://github.com/antlr/antlr4/issues/2611).

I use:

- python 3.13.7
- antlr4-python3-runtime 4.7

In line 12 of Lexer.py and line 6 of Parser.py `from typing.io import TextIO` causes a ModuleNotFoundError.

Correcting this to `from typing import TextIO` solves this issue, but I don't know where to make that change or I would create a pull request.

Thank you in advance :)

[[ tillo-eaux on 2025-10-19 (5 months ago) ]]

<!-- XLET-END -->

