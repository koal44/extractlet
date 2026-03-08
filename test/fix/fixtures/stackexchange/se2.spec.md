
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- how to decompose TypeScript "Discriminated Union" switch block and keep it exhaustive at the same time -->
<!-- https://stackoverflow.com/questions/54408912/how-to-decompose-typescript-discriminated-union-switch-block-and-keep-it-exhau -->

## Question
For my app I used a "Discriminated Union" pattern with exhaustiveness check as described in the TypeScript [manual](http://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions). Time went by, and eventually my switch ended up containing 50+ cases.

So my question is: is there any good solution to decompose this switch without braking its exhaustiveness?

In other words how to split it up, if this can help I can logically divide these unions on subtypes (for ex. shapes below can be divided for equilateral and others):

```ts
interface Square {
    kind: "square";
    size: number;
}
interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}
interface Circle {
    kind: "circle";
    radius: number;
}

//... 50 more shape kinds

type Equilateral = Square | Circle /*| 25 more...*/;
type Other = Rectangle /*| 25 more...*/;

type Shape = Equilateral |  Other;

function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}
function area(s: Shape) {
    switch (s.kind) {
        case "square": return s.size * s.size;
        case "rectangle": return s.height * s.width;
        case "circle": return Math.PI * s.radius ** 2;
        /*
        ...
        ... a lot of code lines
        ...
        */
        default: return assertNever(s); 
    }
}
```

[[ WhiteKnight on 2019-01-28 (7 years ago); edited on 2019-01-28 (7 years ago) | +6 ]]


### Comment 1
Maybe a type hierarchy (with a `Shape` interface that has an `area` method) might be more appropriate than a discriminated union here

[[ Bergi on 2019-01-28 (7 years ago) | +0 ]]


### Comment 2
@Bergi this example is just for illustration and mostly borrowed from the docs. Despite this I believe DU pattern suits my real need well and I'd like to find out if there are any options before I start totally destruct my architecture.

[[ WhiteKnight on 2019-01-28 (7 years ago) | +0 ]]


### Comment 3
So what you now want to do is use two helper functions `area_equilateral` and `area_other`, right?

[[ Bergi on 2019-01-28 (7 years ago) | +0 ]]


### Comment 4
@Bergi well actually I'd like any solution that will be non the less type-safe than the current one

[[ WhiteKnight on 2019-01-28 (7 years ago) | +0 ]]


### Comment 5
@reify In Haskell at least, you would probably make a hierarchy of nested datatypes (`data Shape = E Equilateral | O Other`). I don't know how to do the same in TypeScript however

[[ Bergi on 2019-01-28 (7 years ago) | +1 ]]


## Answer 1
I just found out (through experimentation, not because it's mentioned in documentation anywhere) that you can indeed build a *type hierarchy* of discriminated unions using **multiple discriminants**:

```js
interface Square {
    shape_kind: "equilateral";
    kind: "square";
    size: number;
}
interface Circle {
    shape_kind: "equilateral";
    kind: "circle";
    radius: number;
}
interface Rectangle {
    shape_kind: "rectangle";
    width: number;
    height: number;
}

type Equilateral = Square | Circle

type Shape = Equilateral | Rectangle;

function area(s: Shape) {
    switch (s.shape_kind) { // branch on "outer" discriminant
        case "equilateral":
            // s: Equilateral in here!
            return area_root(s) ** 2;
        case "rectangle":
            return s.height * s.width;
    }
}
function area_root(e: Equiliteral) {
    switch (s.kind) { // branch on "inner" discriminant
        case "square": return s.size;
        case "circle": return Math.sqrt(Math.PI) * s.radius;
    }
}
```

[[ Bergi on 2019-01-28 (7 years ago) | +7 ]]


### Comment 1
This is awesome!

[[ user10675354 on 2019-01-28 (7 years ago) | +1 ]]

<!-- XLET-END -->

