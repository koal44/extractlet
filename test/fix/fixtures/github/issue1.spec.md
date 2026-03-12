
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Performance questions regarding C++ target -->
<!-- https://github.com/antlr/antlr4/issues/4848 -->

## Initial Post
Hello! I am using ANTLR to parse [https://github.com/gscept/GPULang](https://github.com/gscept/GPULang) which I've been using for years prior. Until recently I haven't bothered much with thinking about small optimizations, such as memory placement and being able to release the compilers resources in a swift way.

Recently I have been begun replacing the std::vector, std::strings and whatnot with my own containers that manage memory in a smarter way than doing tons of tiny mallocs.

When profiling I noticed that ANTLR does tons of tiny mallocs, and was wondering whether or not anyone considered approaching memory management in ANTLR with a smarter approach? I think it could be a great benefit to the performance, especially for the C++ target where manual memory management is possible.

Another thing that would be amazing would be to fail early if the input text isn't for example UTF8 and then allow for the user to request string_view's into the original text buffer instead of constructing tiny strings everywhere (which is also a malloc hazard). Not sure how plausible that is.

Thanks,  
Gustav

[[ Duttenheim on 2025-06-09 (9 months ago) ]]


## Comment 1
@Duttenheim, You might want to first resolve ambiguity in your grammar, [GPULang.g4](https://github.com/gscept/GPULang/blob/faa23ad6cd01abed2ff0df6f644a1d44b569d47e/code/compiler/ext/antlr4/grammar/GPULang.g4). I stripped the grammar to essential EBNF ([GPULang.g4.txt](https://github.com/user-attachments/files/20655502/GPULang.g4.txt); using [trparse](https://github.com/kaby76/Trash/tree/ff83752b4904f66198c853fd23b295bb6584677a/src/trparse) GPULang.g4 | [trquery](https://github.com/kaby76/Trash/tree/ff83752b4904f66198c853fd23b295bb6584677a/src/trquery) -c [strip.xq](https://github.com/kaby76/g4-scripts/blob/352cc1c4602e74ec6acd59ccd9c5f5c9871d62bd/strip.xq) | [trsponge](https://github.com/kaby76/Trash/tree/ff83752b4904f66198c853fd23b295bb6584677a/src/trsponge) -c), then ran diagnostics over the grammar ([trperf](https://github.com/kaby76/Trash/tree/ff83752b4904f66198c853fd23b295bb6584677a/src/trperf) _.gpul (only those files from GPULang/code/test/shaders/_.gpul that parse)). It says that you have a lot of ambiguity in the grammar, e.g., Decision 88 in suffixExpression for accesstest.gpul. No amount of optimizing C++ memory will overcome the huge inefficiency associated with an ambiguous grammar.

[[ kaby76 on 2025-06-09 (9 months ago) ]]


## Comment 2
I fixed the suffix and prefix to be direct left recursive. I run it with SLL prediction. It still tens of milliseconds to parse relatively small files (not the test ones, they are old).

I know ANTLRs C++ target has a warmup of static initialization which makes the first iteration significantly slower, which I've come to terms with. In fact I have my own warmup of static symbols which adds some small initial cost.

Mallocing all over the place and using shared pointers instead of having a more robust memory strategy will certainly not help. Not only is malloc and free slow, memory fragmentation becomes a real problem very quickly considering there are geometric properties to parse trees.

And while I understand there is an issue with knowing the UTF encoding before hand, it would certainly be more efficient to allow the user to deal with pointer ranges to the original CharStream, by first asserting its utf8/16/32 and work from that assertion.

Instead I'm forced to copy a string that already exists every time I read a token for which I need its text contents.

Thanks,  
Gustav

[[ Duttenheim on 2025-06-09 (9 months ago) ]]


## Comment 3
Yes, your grammar is _really slow_!

I grabbed the latest copy of your grammar, and it's still pretty ambiguous according to trperf.

For the grammar you just changed in the last couple of hours, the max-k for accesstest.gpul is 186, which means that it takes an enormous lookahead to work out Decision 88. Let's look at that and see what the rule is doing.

[![Image](https://private-user-images.githubusercontent.com/11389451/453113551-b72bef59-35b7-4bb7-95bb-321c76ecd45c.svg?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjE0MTY1MDUsIm5iZiI6MTc2MTQxNjIwNSwicGF0aCI6Ii8xMTM4OTQ1MS80NTMxMTM1NTEtYjcyYmVmNTktMzViNy00YmI3LTk1YmItMzIxYzc2ZWNkNDVjLnN2Zz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTEwMjUlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUxMDI1VDE4MTY0NVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWUxMzUwZGNhZDUzNWYyNWJhZmIzZmU1ZjNjZTY4YTM2YWM1MmMwZDJiY2U2Yzg3OGE5YTEwNjE5ZjlkZDhmNjImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.7559y0qcNSTCnk5rq7vAYaEQGcvT4viDpEAZgLXZmC0)](https://private-user-images.githubusercontent.com/11389451/453113551-b72bef59-35b7-4bb7-95bb-321c76ecd45c.svg?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjE0MTY1MDUsIm5iZiI6MTc2MTQxNjIwNSwicGF0aCI6Ii8xMTM4OTQ1MS80NTMxMTM1NTEtYjcyYmVmNTktMzViNy00YmI3LTk1YmItMzIxYzc2ZWNkNDVjLnN2Zz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTEwMjUlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUxMDI1VDE4MTY0NVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWUxMzUwZGNhZDUzNWYyNWJhZmIzZmU1ZjNjZTY4YTM2YWM1MmMwZDJiY2U2Yzg3OGE5YTEwNjE5ZjlkZDhmNjImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.7559y0qcNSTCnk5rq7vAYaEQGcvT4viDpEAZgLXZmC0)

We see that Decision=88 is the rectangle at the far left, and we see that there are two transitions out of that. That's not a problem, but what is a problem is that they are both on the same symbol: `binaryexpatom`! That's not good.

It's a problem because Antlr keeps track of the set of NFA states for either transition with your input. In order to make a decision and continue the parse, it needs to decide which transition to take by reading a ton of lookahead.

The problem is that Antlr does not do left factoring. (Maybe it should, but that's another discussion.) LL parsers really need a grammar that is left factored.

Minus all the tree construction code, the rule currently is this:

```
suffixExpression:
      binaryexpatom
    
    (
        '(' 
            (
                  logicalOrExpression  (linePreprocessorEntry)? (','   logicalOrExpression  | linePreprocessorEntry)* 
            )? 
        ')'
        
        | '.'   suffixExpression
        
        | '->'   suffixExpression
        
        | '[' (  expression )? ']'
        
    )*
    |   binaryexpatom (  ('++' | '--')  )* 
    
    ;
```

After left factoring, it will be this:

```
suffixExpression:
    binaryexpatom
    (
	(
	    '(' ( logicalOrExpression  (linePreprocessorEntry)? (','   logicalOrExpression  | linePreprocessorEntry)* )? ')'
	    | '.'   suffixExpression
	    | '->'   suffixExpression
	    | '[' (  expression )? ']'
	)*
	| ('++' | '--')*
    )
    ;
```

That reduces the max-k to something more reasonable, 5 tokens for accesstest.gpul. That change alone accounts for a 30% speed up. But, your grammar still contains ambiguity. My suggestion is to work with the stripped down grammar and use that in something like Intellij to fix these problems.

You can preload a warmup to help the initial startup delay. But, the grammar is the issue.

[[ kaby76 on 2025-06-09 (9 months ago) ]]


## Comment 4
I don't recommend use ANTLR for anything that requires high performance. It's slow even if grammars are optimised. If they are not, ANTLR doesn't provide assistance with performance issues (at least statically).

[[ KvanTTT on 2025-06-10 (9 months ago) ]]


## Comment 5
> I don't recommend use ANTLR for anything that requires high performance. It's slow even if grammars are optimised. If they are not, ANTLR doesn't provide assistance with performance issues (at least statically).

It was written more for functionality, for sure, but there are very few things that need absolutely blinding parsing performance - almost all tools do way more work than the parser. However, performance problems are _almost_ always in the grammar. This is the case here, though I agree with @Duttenheim that memory management will make a huge difference... but after addressing @kaby76 's comments. I did a lot of work on that for the C runtime in ANTLR 3.

All those separate xxxExpression need to be refactored as a single expression with precedence in mind. I don't like embedding code directly in the grammar as it will influence the parsing time, is difficult to read, and difficult to maintain, but that is personal preference really.

It needs:

```antlr
expression:
     LPAREN expression RPAREN #exprPrec
    | MINUS expression #unaryMinus
    | expression AND expression
    | expression OR expression
    | expression PLUS expression
     
```

And so on - the problem is almost always the `expression` rule. Fix that first, then come back to memory management. In C++ it is easy enough to slot in substitutes for allocators, even without source code.

I would also move all that code into a visitor, which allows you to optimize it separately from the parser.

Jim

[[ jimidle on 2025-06-10 (9 months ago) ]]


## Comment 6
> almost all tools do way more work than the parser

It's true. Typically, lexer/parser takes a negligible small time of the full profile in compilers. For instance, recently I tested manually-written Kotlin parser and figured out that the parsing speed is extremely high, see the following measurements:

```
Number of tested files (kt, kts): 222833
Number of files with syntax errors: 11676
Number of chars: 605370336
Number of lines: 16228163
Number of parse nodes: 219933416
Parser total time: 44765 ms
```

It takes only 44 sec to parse more than 222K files, 6M lines of Kotlin code or more than 0.6B chars! But generally the Kotlin compiler is not as fast as we would like it to be, and it's not because of the parser (the parser takes only a couple of percents of the full compiler profile). And it would be even more sad if the parser was slower. I doubt that ANTLR-generated grammars can even parse it an order of magnitude slower.

> However, performance problems are almost always in the grammar.

I believe that generator tools should warn about grammar performance problems or even prevent generating slow parsers. Actually, some time ago I started work on such a tool (based on ANTLR grammars), but there are still a lot of things to do to make it robust. But it's a topic for an another discussion.

[[ KvanTTT on 2025-06-10 (9 months ago) ]]


## Comment 7
Hello everyone!

I took what you said to heart and worked on the grammar a bit to make it less ambiguous, and you were totally right that it did improve performance.

Even so, I still find it a little bit disappointing that the parsing is the largest bottleneck in the compilation process. Unless there really are other major issues with the grammar, should I settle with this as it is right now? Would like to hear your thoughts.

Thanks,  
Gustav

[[ Duttenheim on 2025-06-23 (9 months ago) ]]


## Comment 8
I decided to dump ANTLR in favor of just writing my own lexer and parser, but thanks for the feedback regarding my language and the grammar.

Making all the function attributes and variable qualifiers into lexer tokens would also have improved the parsing performance, since ANTLR wouldn't have the need to look ahead to find functions and variables. Lessons learned when implementing the parsing yourself 🤷‍♂️.

I'm curious what machine you are using for your benchmark @KvanTTT, but I managed to squeeze out something like 200-240k+ lines of code per second on my min spec m4 mini.

The parser is still the largest single bottleneck in the compiler though, despite the compiler doing validation, symbol visibility resolution, compile time expression evaluation and branch elimination, basic type inference and type conversions, but orders of magnitude faster than the one produced by ANTLR.

Thanks,  
Gustav

[[ Duttenheim on 2025-08-09 (7 months ago) ]]


## Comment 9
Depends what your compiler does. I would still suspect that your grammar is ambiguous. Have you tutnrd on all the ambiguity reporting functionality.

[…](#)

On Sat, Aug 9, 2025 at 14:33 Gustav Sterbrant ***@***.***> wrote: *Duttenheim* left a comment ([antlr/antlr4#4848](https://github.com/antlr/antlr4/issues/4848)) <[#4848 (comment)](https://github.com/antlr/antlr4/issues/4848#issuecomment-3172081116)> I decided to dump ANTLR in favor of just writing my own lexer and parser, but thanks for the feedback regarding my language and the grammar. Making all the function attributes and variable qualifiers into lexer tokens would also have improved the parsing performance, since ANTLR wouldn't have the need to look ahead to find functions and variables. Lessons learned when implementing the parsing yourself 🤷‍♂️. I'm curious what machine you are using for your benchmark @KvanTTT <[https://github.com/KvanTTT](https://github.com/KvanTTT)>, but I managed to squeeze out something like 200-240k+ lines of code per second on my min spec m4 mini. The parser is still the largest single bottleneck in the compiler though, despite the compiler doing validation, symbol visibility resolution, compile time expression evaluation and branch elimination, basic type inference and type conversions, but orders of magnitude faster than the one produced by ANTLR. Thanks, Gustav — Reply to this email directly, view it on GitHub <[#4848 (comment)](https://github.com/antlr/antlr4/issues/4848#issuecomment-3172081116)>, or unsubscribe <[https://github.com/notifications/unsubscribe-auth/AAJ7TMDTNFCFGRALSHUY44T3MZLJVAVCNFSM6AAAAAB64WOHSOVHI2DSMVQWIX3LMV43OSLTON2WKQ3PNVWWK3TUHMZTCNZSGA4DCMJRGY](https://github.com/notifications/unsubscribe-auth/AAJ7TMDTNFCFGRALSHUY44T3MZLJVAVCNFSM6AAAAAB64WOHSOVHI2DSMVQWIX3LMV43OSLTON2WKQ3PNVWWK3TUHMZTCNZSGA4DCMJRGY)> . You are receiving this because you commented.Message ID: ***@***.***>

[[ jimidle on 2025-08-10 (7 months ago) ]]

<!-- XLET-END -->

