# Pilaf
Pilaf is a simple pattern-matching library for JavaScript which provides
recursive pattern-matching in the style of Erlang.

If you're tired of writing chains of `if`, `else` and `switch` statements,
Pilaf can help you structure your code in the pattern-matching style popular in
languages like Erlang and Haskell.

## Examples

Here is a simple recursive function to calculate the sum of an array written in
traditional imperative style in JavaScript

```javascript

function sum(a) {
  if (a.length === 0) {
    return a[0];
  }

  else {
    return a[0] + sum(a.slice(0));
  }
}

```

The same function be returned using Pilaf like

```javascript

function sum(a) {
  match(a)
    .case(["$a"])             .run(x => x.a)
    .case(["$a", "...$rest"]) .run(x => x.a + sum(rest))
    .return();
}

```

Pilaf provides function `match` which takes a value to be matched against and
returns an objects which allows chaining of `case` and `run` calls. `case`
takes a pattern and tries to match it against the value. If the match passes,
`run` is executed which takes a callback and executes the callback on the match
result from `case`.

Even in this very simple example, it is easy to see that the pattern-matching declarative
style is more concise and clear than traditional JavaScript.

Pilaf also provides function `check` which just matches one pattern against one value.

Pilaf features many different types of patterns which can be combined
arbitratily effectively removing the need to use `if`, `else` and `switch` in
the code.

### Variable Patterns
Variable patterns begin with `"$"`. The string after the `"$"` is the key which
stores the value which can be accessed in `when` filters and `run` callbacks.

Variable patterns always match succesfully against any value.

```javascript

> match(2).case("$a").run(x => x.a + 7).return()
9

> check("$a", "hello")
{ __match__: true, a: "hello" }

> match("world").case("$a").run(x => "hello, " + x.b).return()
hello, world

> check("$a", [ 2, 5, 8 ])
{ __match__: true, a: [ 2, 5, 8 ]}

> check("$a", { author: "J.R.R. Tolkien", books: [ "The Hobbit", "The Lord of the Rings" ] })
{ __match__: true, a: { author: "J.R.R. Tolkien", books: [ "The Hobbit", "The Lord of the Rings" ] })

> check("$a", false)
{ __match__: true, a: false }

> match(false).case("$a").run(x => x.a).return();
false

> check("$a", null)
{ __match__: true, a: null }

> match(null).case("$a").run(x => x.a === null).return()
true

> check("$a", undefined)
{ __match__: true, a: undefined }

```

### Literal Patterns
Literal patterns match literals against values. They match successfully if the
pattern is exactly equal to the value

```javascript

> check(2, 2)
{ __match__: true }

> check(2, 3)
{ __match__: false }

> check(null, null)
{ __match__: true }

> check(undefined, undefined)
{ __match__: true }

> check(NaN, NaN)
{ __match__: false }

```


### Wildcard Patterns
Wildcard patterns begin with `"_"` and match any value just like variable
patterns but discard the result. They are used when the result is not needed in
further computation.

```javascript

> check("_a", 3)
{ __match__: true }

> check("_a", "hello")
{ __match__: true }

> check("_a", [ 3, 7, "world", true ])
{ __match__: true }

```

### Array Patterns
Array patterns are patterns which recursively match against arrays.

```javascript

> check([ 2, 7, "$a" ], [ 2, 7, 11 ])
{ __match__: true, a: 11 }

> check([ 2, 7, "$a" ], [ 3, 5, 11 ])
{ __match__: false }

> check([ "$a" ], [ 5 ])
{ __match__: true, a: 5 }

> check([ [ "$a", true ], "$b" ], [ [ 3, true ], "hello" ])
{ __match__: true, a: 3, b: "hello" }

> check([ [ "$a", [ "$b", 7 ] ], "$c" ], [ [ 2, [ "hello", 7 ] ] , "world" ])
{ __match__: true, a: 2, b: "hello", c: "world"}

```

Array patterns can also be used to match against arrays when the length of the
array is unknown. If the last element of the array pattern starts with `"...$"`,
it binds to the rest of the array.   

```javascript

> check([ 2, 3, "...$a" ], [ 2, 3, 7, true, "hello", 17, 19 ])
{ __match__: true, a: [ 7, true, "hello", 17, 19 ]}

```

### Object Patterns
Object patterns work just like array patterns, but take objects as patterns.

```javascript

> check({ value: "$a" }, { value: 3 } )
{ __match__: true, a: 3 }

> check(
>   { book: "$a", author: "Lewis Carroll" },
>   { book: "Alice in Wonderland", author: "Lewis Carroll" }
> )
{ __match__: true, a: 3 }

> check(
>   { author: "$a", books: [ "The Hobbit", "...$b" ] },
>   { author: "J.R.R. Tolkien", books: [ "The Hobbit", "The Lord of the Rings", "The Silmarilion" ] }
> )
{
  __match__: true,
  a: "J.R.R. Tolkien",
  b: [ "The Lord of the Rings", "The Silmarilion" ]
}

```

## Dependencies
Pilaf is written in vanilla JavaScript and doesn't feature any dependencies.

## Credits
Pilaf is heavily inspired from [Match-Toy](https://github.com/AlfonsoFilho/match-toy).

## License
GNU General Public License v3.0
