
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Commit search results · GitHub -->
<!-- https://github.com/search?q=foo&type=commits&ref=advsearch&s=&o=desc -->

## Search

44M results · Page 1 of 100

- Query: `foo`
- Type: `commits`
- Order: `desc`

## Filter by

- Code (...)
- Repositories (750k)
- Issues (1M)
- Pull requests (2M)
- Discussions (32k)
- Users (30k)
- Commits (44M)
- Packages (1k)
- Wikis (81k)
- Topics (2k)
- Marketplace (7)

## Results

### [Improve /vars command with flag-based scoping](https://github.com/aristidebm/httpclient/commit/051a16e874ce2cb4e4cf375f6dcec71f74c7f469)  
`aristidebm/httpclient`  
```
Improve /vars command with flag-based scoping

- /vars foo - get foo value
- /vars foo bar - set foo=bar (session scope, default)
/vars --session foo bar - set foo=bar in session
- /vars --env foo bar - set foo=bar in environment
- /vars --shell foo bar - set foo=bar in shell
- /vars --unset foo - unset foo
- /vars - list all variables
```  
aristidebm committed 5 days ago

### [feat: use callback form for property access and method calls](https://github.com/bigmistqke/harvestry/commit/9abb12443a957bc6d394cff9ec11f8e22436e618)  
`bigmistqke/harvestry`  
```
feat: use callback form for property access and method calls

Transform `Foo.prop` → `guardFromHarvestRegistry(['key'], ([Foo]) => Foo.prop)`
Transform `Foo.method(args)` → `guardFromHarvestRegistry(['key'], ([Foo]) => Foo.method(args))`
```  
bigmistqke committed 11 hours ago

### [feat: favorites, sharing, time selector, and conversational food edit…](https://github.com/lucaswall/food-scanner/commit/7258e8632c08dc4a80a5f8f7ad06f020c9504972)  
`lucaswall/food-scanner`  
```
feat: favorites, sharing, time selector, and conversational food editing (#105)

* plan(FOO-703): add implementation plan for favorites, sharing, time selector, and food editing

Issues: FOO-703, FOO-704, FOO-705, FOO-706, FOO-707, FOO-708, FOO-709, FOO-710, FOO-711, FOO-712, FOO-713, FOO-714, FOO-715, FOO-716, FOO-717, FOO-718, FOO-719
Status: Todo in Linear

* feat: add isFavorite and shareToken columns to custom_foods (FOO-703, FOO-707)

* feat: TimeSelector component, integration, and report_nutrition time/mealType fields (FOO-712, FOO-713, FOO-714, FOO-715)

* feat: favorites toggle, star UI, and suggested tab pinning (FOO-704, FOO-705, FOO-706)

* feat: share food, shared log page, OAuth returnTo (FOO-708, FOO-709, FOO-710, FOO-711)

* feat: implement edit food flow (FOO-716, FOO-717, FOO-718, FOO-719)

* fix: post-merge test fixes - add missing FoodLogEntryDetail fields, fix fetch stub lifecycle

* fix: bug-hunter findings - atomic share token, pagination fix, edit time fallback, error handling

* plan: implement iteration 1 - favorites, sharing, time selector, food editing

* plan: review iteration 1 - 5 issues found, fix plan created

* fix: review iteration 2 - 5 bugs fixed (metadata loss, pagination, share errors, token logging, UTC date)

* plan: review iteration 2 - 1 bug fixed inline (shareToken unique constraint)
```  
lucaswall committed 18 days ago

### [fix(emitter): expand shorthand properties when import substitution ap…](https://github.com/mohsen1/tsz/commit/485b129e2318d309e6dfd96111ec755fb80bf411)  
`mohsen1/tsz`  
```
fix(emitter): expand shorthand properties when import substitution applies (+44 JS)

When CJS import substitution transforms an identifier (e.g., foo → foo_1.foo),
shorthand property syntax { foo } becomes invalid { foo_1.foo }. Now detect
this case and expand to full form { foo: foo_1.foo } for both
PROPERTY_ASSIGNMENT and SHORTHAND_PROPERTY_ASSIGNMENT node types.
```  
mohsen1 committed 15 days ago

### [fix: Sentry hardening, edit mode fixes, and chat unification (_FOO_-731…](https://github.com/lucaswall/food-scanner/commit/fae4192b2d2caf8cae4f296491fc24c53962dd6a)  
`lucaswall/food-scanner`  
```
fix: Sentry hardening, edit mode fixes, and chat unification (FOO-731) (#107)

* plan(FOO-731): add implementation plan for sentry and edit mode fixes

Issues: FOO-731, FOO-732, FOO-733, FOO-734, FOO-735, FOO-736, FOO-737, FOO-738, FOO-740, FOO-741, FOO-742, FOO-743, FOO-744, FOO-745, FOO-746, FOO-747
Status: Todo in Linear

* worker-2: enable pino Sentry errors, fix PII exposure, add user context

Tasks: Task 4 (FOO-742), Task 5 (FOO-745/746/747), Task 6 (FOO-744)
Files: src/instrumentation.ts, src/components/sentry-user-context.tsx, src/app/app/layout.tsx

* worker-4: optimize edit-food route for metadata-only edits

Tasks: Task 11 (FOO-741)
Files: src/app/api/edit-food/route.ts, src/lib/food-log.ts, src/types/index.ts

* worker-3: add Sentry error reporting, handleSave Fitbit errors, reader.cancel, maxLength fix

Tasks: Task 7 (FOO-743), Task 8 (FOO-733), Task 9 (FOO-735), Task 10 (FOO-734)
Files: src/components/food-analyzer.tsx, src/components/food-chat.tsx, src/components/food-history.tsx

* worker-1: fix runToolLoop multi-report, editAnalysis context, edit prompts, unify chat

Tasks: Task 1 (FOO-738), Task 2 (FOO-731), Task 3 (FOO-732/737/736), Task 12 (FOO-740)

* plan: implement iteration 1 - sentry hardening, edit fixes, chat unification

* plan: mark sentry-and-edit-fixes complete
```  
lucaswall committed 18 days ago

### [`constdef` inference through binary expressions: `_Foo_ f = _Foo_.AUDIO | _F…_](https://github.com/c3lang/c3c/commit/87768e50dee2d1ab9494a0dbaeb3643160f98929)  
`c3lang/c3c`  
```
`constdef` inference through binary expressions: `Foo f = Foo.AUDIO | Foo.VIDEO` can be written `Foo f = AUDIO | VIDEO;`
```  
lerno committed 13 days ago

### [[Concurrency] nonsending+typed-throw: with(Checked/Unsafe)(Throwing)C…](https://github.com/swiftlang/swift/commit/19c914ef3fb4c76eff1ab8c07ebdfb1dc2257135)  
`swiftlang/swift`  
````
[Concurrency] nonsending+typed-throw: with(Checked/Unsafe)(Throwing)Continuation (#84944)

This is the minimal set of changes from
https://github.com/swiftlang/swift/pull/80753 to specifically address
the with...Continuation APIs re-enqueueing tasks when they need not have
to.

Resolves rdar://162192512

---

Before, 10 enqueues in total in the task executor case:

```
         1: === foo() async
         2: ---------------------------------------
         3: [executor][task-executor] Enqueue (1)
         4: foo - withTaskExecutorPreference
         5: [executor][task-executor] Enqueue (2)
         6: foo - withTaskExecutorPreference - withCheckedContinuation
         7: [executor][task-executor] Enqueue (3)
         8: foo - withTaskExecutorPreference - withCheckedContinuation done
         9: [executor][task-executor] Enqueue (4)
        10: foo - withTaskExecutorPreference - withUnsafeContinuation
        11: [executor][task-executor] Enqueue (5)
        12: foo - withTaskExecutorPreference - withUnsafeContinuation done
        13: [executor][task-executor] Enqueue (6)
        14: foo - withTaskExecutorPreference - withCheckedThrowingContinuation
        15: [executor][task-executor] Enqueue (7)
        16: foo - withTaskExecutorPreference - withCheckedThrowingContinuation done
        17: [executor][task-executor] Enqueue (8)
        18: foo - withTaskExecutorPreference - withUnsafeThrowingContinuation
        19: [executor][task-executor] Enqueue (9)
        20: foo - withTaskExecutorPreference - withUnsafeThrowingContinuation done
        21: [executor][task-executor] Enqueue (10)
        22: foo - withTaskExecutorPreference done
        23: == Make: actor Foo
        24: ---------------------------------------
        25: [executor][actor-executor] Enqueue (1)
        26: actor.foo
        27: actor.foo - withCheckedContinuation
        28: actor.foo - withCheckedContinuation done
        29: actor.foo - withUnsafeContinuation
        30: actor.foo - withUnsafeContinuation done
        31: actor.foo - withCheckedThrowingContinuation
        32: actor.foo - withCheckedThrowingContinuation done
        33: actor.foo - withUnsafeThrowingContinuation
        34: actor.foo - withUnsafeThrowingContinuation done
        35: actor.foo done
        36: done
```

After, two total enqueues in the task executor:

```
    1: === foo() async
    2: ---------------------------------------
    3: [executor][task-executor] Enqueue (1)
    4: foo - withTaskExecutorPreference
    5: foo - withTaskExecutorPreference - withCheckedContinuation
    6: foo - withTaskExecutorPreference - withCheckedContinuation done
    7: foo - withTaskExecutorPreference - withUnsafeContinuation
    8: foo - withTaskExecutorPreference - withUnsafeContinuation done
    9: foo - withTaskExecutorPreference - withCheckedThrowingContinuation
   10: foo - withTaskExecutorPreference - withCheckedThrowingContinuation done
   11: foo - withTaskExecutorPreference - withUnsafeThrowingContinuation
   12: foo - withTaskExecutorPreference - withUnsafeThrowingContinuation done
   13: [executor][task-executor] Enqueue (2)
   14: foo - withTaskExecutorPreference done
   15: == Make: actor Foo
   16: ---------------------------------------
   17: [executor][actor-executor] Enqueue (1)
   18: actor.foo
   19: actor.foo - withCheckedContinuation
   20: actor.foo - withCheckedContinuation done
   21: actor.foo - withUnsafeContinuation
   22: actor.foo - withUnsafeContinuation done
   23: actor.foo - withCheckedThrowingContinuation
   24: actor.foo - withCheckedThrowingContinuation done
   25: actor.foo - withUnsafeThrowingContinuation
   26: actor.foo - withUnsafeThrowingContinuation done
   27: actor.foo done
   28: done
```
````  
ktoso committed 20 days ago

### [_foo_](https://github.com/chicagoedt/suas-2026/commit/41d2c32289601a08ba751e1023a02ae5a2d11296)  
`chicagoedt/suas-2026`  
```
foo

foo
```  
adrtse committed 14 days ago

### [`script _foo_() -> t {e}` => `define _foo_() ->> t {e}`](https://github.com/vekatze/neut/commit/153b6887b6df3f8df34bef8bc9d5719cd1f963a5)  
`vekatze/neut`  
```
`script foo() -> t {e}` => `define foo() ->> t {e}`
```  
vekatze committed 3 days ago

### [[K/JS] Make exported interfaces with a hidden member not-implementable](https://github.com/akridl/kotlin/commit/ebefc86e1b9aa71e12a07c931b54b8e157fa64cb)  
`akridl/kotlin`  
````
[K/JS] Make exported interfaces with a hidden member not-implementable

This change prevents TypeScript-side implementation of exported Kotlin
interfaces that contain @JsExport.Ignore members, as such implementation
would be incomplete and potentially unsafe.

Example:
```kotlin
@JsExport
interface Foo {
  @JsExport.Ignore
  fun foo(): String
}

@JsExport
fun acceptFoo(foo: Foo) = foo.foo()
```

```typescript
// Without this changes and with -Xenable-implementing-interfaces-from-typescript
import { acceptFoo, Foo } from "..."

class FooImpl implements Foo {
  readonly [Foo.Symbol] = true
}

acceptFoo(new FooImpl()) // Uncaught TypeError: foo.foo is not a function
```

Related to:
- ^KT-80733
- ^KT-69353
- ^KT-65802
````  
JSMonk authored and Space Team committed 23 days ago

<!-- XLET-END -->

