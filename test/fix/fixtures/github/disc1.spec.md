
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Possibility of grammars transpilation · antlr/antlr4 · Discussion #4889 · GitHub -->
<!-- https://github.com/antlr/antlr4/discussions/4889 -->

## Initial Post
Hello,
I have a task to transpile code from language grammar A to grammar B.
If, lets say, I have g4 files with grammar of both languages, can I generate AST of grammar B using AST of A?
More specific, can I build ANTLR syntax tree by code?

[[ GreedIsGood10000 on 2025-09-17 (6 months ago) ]]


## Comment 1
Have you tried using LLM-based solutions for this?

[[ KvanTTT on 2025-09-18 (6 months ago) ]]


## Comment 2
No, LLMs will be overkill for my task. Grammars of mentioned languages are not very complex, so in the worst case I could write transpilation algorithm by hand.
Another restriction is that transpile algorithm must generate predictable result code and make some edits in AST, like adding variable's values checks.
I just think of simplifying my task by generating both grammars and using pregenerated code.
Maybe, in future I'll have to make transpile from grammar B to A, so building AST will be even more useful

[[ GreedIsGood10000 on 2025-09-18 (6 months ago) ]]


## Comment 3
You generate an IR of your own choosing that represents a generic form but can represent both. After generating an IR, then you run transformations on the IR/AST to convert concepts for A to their representation in B. Usually you execute rules one at a time on the IR, replacing/moving nodes until done. Then you walk the IR and generate the B text code. If very simple, then you might be able to just build the IR for B directly while walking the parse tree from grammar A. Then just walk the IR you produce and generate B output. A 100% conversion requires that semantics and constructs in A can be represented by B.

[…](#)

On Thu, Sep 18, 2025 at 08:00 GreedIsGood10000 ***@***.***> wrote: No, LLMs will be overkill for my task. Grammars of mentioned languages are not very complex, so in the worst case I could write transpilation algorithm by hand. Another restriction is that transpile algorithm must generate predictable result code and make some edits in AST, like adding variable's values checks. I just think of simplifying my task by generating both grammars and using pregenerated code. Maybe, in future I'll have to make transpile from grammar B to A, so building AST will be even more useful — Reply to this email directly, view it on GitHub <[#4889 (reply in thread)](https://github.com/antlr/antlr4/discussions/4889#discussioncomment-14444008)>, or unsubscribe <[https://github.com/notifications/unsubscribe-auth/AAJ7TMGGLQHL3PQL76RXDG33TK3IBAVCNFSM6AAAAACGYGEH5OVHI2DSMVQWIX3LMV43URDJONRXK43TNFXW4Q3PNVWWK3TUHMYTINBUGQYDAOA](https://github.com/notifications/unsubscribe-auth/AAJ7TMGGLQHL3PQL76RXDG33TK3IBAVCNFSM6AAAAACGYGEH5OVHI2DSMVQWIX3LMV43URDJONRXK43TNFXW4Q3PNVWWK3TUHMYTINBUGQYDAOA)> . You are receiving this because you are subscribed to this thread.Message ID: ***@***.***>

[[ jimidle on 2025-09-18 (6 months ago) ]]


## Comment 4
Ok, to clarify, best choice for me is to manually write classes for nodes of IR code tree and visitor, that generates code text from it?

[[ GreedIsGood10000 on 2025-09-19 (6 months ago) ]]

<!-- XLET-END -->

