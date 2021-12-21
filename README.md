# pilaf
pilaf is a simple pattern-matching library for JavaScript which provides
recursive pattern-matching in the style of Erlang.

if you're tired of writing chains of `if`, `else` and `switch` statements,
pilaf can help you structure your code in the pattern-matching style popular in
languages like Erlang and Haskell.

## Examples
here is a function in traditional imperative-style in JavaScript

```javascript
function factorial(n) {
  if (n < 2)
    return 1;
  else
    return n * factorial(n - 1);
}
```

here is how one would write it using pilaf in pattern-matching style in JavaScript

```javascript

function factorial(n) {
  return match(n)
    .case("$a")
      .when(x => x.a < 1) .run(() => 1)
      .otherwise()        .run((x) => x.a * factorial(x.a - 1))
    .return();
}

```

here, the value `n` is matched against pattern `$n` and returns an object which
contains the match result. the match result indicates if the match was
successful.

if the match is successful, it is passed through the filter in `when`.

if the match is unsuccessful, the next `case` is checked.

if the filter in `when` returns `true`, the callback in `run` is executed. the
output of callback in `run` is returned by call to `return` in the end.

if the filter returns `false`, `run` attached with `otherwise` is executed
calls the function.

Pilaf also provides `check` which just matches a pattern against a variable and
returns the match result as shown below.

```javascript

> check("$a", 3)
{ __match__: true, a: 3}

```

the returned object is the same match result which was described above.

there are many types of available patterns which can be recursively matched to
variables, arrays and objects.

### Variable Patterns
variable patterns begin with `"$"`. the string after the `"$"` is the key which
stores the value which can be accessed in `when` filters and `run` callbacks.

variable patterns always match succesfully against any value.

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
literal patterns match literals against values. they match successfully if the
pattern is exactly equal to the value

```javascript

> check(2, 2)
{ __match__: true }

> check(2, 3)
{ __match__: false }

> check("hello", "hello")
{ __match__: true }

> check(null, null)
{ __match__: true }

> check(undefined, undefined)
{ __match__: true }

> check(NaN, NaN)
{ __match__: false }

```


### Wildcard Patterns
wildcard patterns begin with `"_"` and match any value just like variable
patterns but discard the result. they are used when the result is not needed in
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
array patterns are patterns which recursively match against arrays.

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

array patterns can also be used to match against arrays when the length of the
array is unknown. if the last element of the array pattern starts with "...$",
it binds to the rest of the array.   

```javascript

> check([ 2, 3, "...$a" ], [ 2, 3, 7, true, "hello", 17, 19 ])
{ __match__: true, a: [ 7, true, "hello", 17, 19 ]}

```

### Object Patterns
object patterns work just like array patterns, but take objects as patterns.

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
Pilaf is heavily inspired from
[match-toy](https://github.com/AlfonsoFilho/match-toy).

the main difference is that while Match-Toy takes strings as patterns and
parses them into JavaScript structures, Pilaf avoids parsing by taking
JavaScript literals as patterns.

this means that Match-Toy covers more patterns than Pilaf but is little larger
in size because it is more complex.

## License
GNU General Public License, version 3.0
