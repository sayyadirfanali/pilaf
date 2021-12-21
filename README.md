# Pilaf
Pilaf is a simple pattern-matching library for JavaScript which provides
recursive pattern-matching in the style of Erlang.

If you're tired of writing chains of `if`, `else` and `switch` statements,
Pilaf can help you structure your code in the pattern-matching style popular in
languages like Erlang and Haskell.

Pilaf is implemented in less than 200 lines of vanilla JavaScript and is a
standalone library with no any dependencies.

## Examples

Here is a simple recursive function to calculate the sum of an array written in
traditional JavaScript

```javascript

function sum(a) {
  if (a.length === 0) {
    return 0;
  }

  else if (a.length === 1) {
    return a[0];
  }

  else {
    return a[0] + sum(a.slice(0));
  }
}

```

The same function can be written using Pilaf as

```javascript

function sum(a) {
  return match(a)
    .case([])                     .run(x => 0)
    .case(["$element"])           .run(x => x.element)
    .case(["$head", "...$tail"])  .run(x => x.head + sum(x.tail))
    .return();
}

```

Pilaf provides `match` which takes a value to be matched against and
returns an objects which allows chaining of `case` and `run` calls. `case`
takes a pattern and tries to match it against the value. If the match passes,
`run` is executed which takes a callback and executes the callback on the match
result from `case`.

Even in this very simple example, it is easy to see that the declarative style
which employs patterns is more concise and clear than imperative style which
uses `if` and `else`.

Pilaf provides `when` which acts like guard in Erlang and filters the value if
the match is successful before executing `run`.

The above function can be written using `when` as

```javascript

function sum(a) {
  return match(a)
    .case([])                         .run(x => 0)
    .case(["$head", "...$tail"])
      .when(x => x.tail.length === 0) .run(x => x.head)
      .otherwise()                    .run(x => x.head + sum(x.tail))
    .return();
}


```

Pilaf also provides `check` which just matches one pattern against one value.

Pilaf features different types of patterns which can be combined arbitratily
effectively avoiding the need to use `if`, `else` and `switch` in the code.

### Variable Patterns
Variable patterns begin with `"$"`. The string after the `"$"` is the key which
stores the value which can be accessed in `when` filters and `run` callbacks.

Variable patterns always match succesfully against any value.

```javascript

> match(2).case("$a").run(x => x.a + 7).return()
9

> match("world").case("$a").run(x => "hello, " + x.b).return()
hello, world

> check("$a", [ 2, 5, 8 ])
{ __match__: true, a: [ 2, 5, 8 ] }

> check("$a", { author: "J.R.R. Tolkien", books: [ "The Hobbit", "The Lord of the Rings" ] })
{ __match__: true, a: { author: "J.R.R. Tolkien", books: [ "The Hobbit", "The Lord of the Rings" ] } }

```

### Literal Patterns
Literal patterns match literals against values. They match successfully if the
pattern is exactly equal to the value

```javascript

> check(2, 2)
{ __match__: true }

> check(2, 3)
{ __match__: false }

```


### Wildcard Patterns
Wildcard patterns begin with `"_"` and match any value just like variable
patterns but discard the result. They are used when the result is not needed in
further computation.

```javascript

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

> check([ [ "$a", [ "$b", 7 ] ], "$c" ], [ [ 2, [ "hello", 7 ] ] , "world" ])
{ __match__: true, a: 2, b: "hello", c: "world" }

```

Array patterns can also be used to match against arrays when the length of the
array is unknown. If the last element of the array pattern starts with `"...$"`,
it binds to the rest of the array.   

```javascript

> check([ 2, 3, "...$a" ], [ 2, 3, 7, true, "hello", 17, 19 ])
{ __match__: true, a: [ 7, true, "hello", 17, 19 ] }

```

### Object Patterns
Object patterns work just like array patterns, but take objects as patterns.

```javascript

> check(
>   { book: "$a", author: "Lewis Carroll" },
>   { book: "Alice in Wonderland", author: "Lewis Carroll" }
> )
{ __match__: true, a: "Alice in Wonderland" }

> check(
>   { author: "$a", books: [ "The Hobbit", "...$b" ] },
>   { author: "J.R.R. Tolkien", books: [ "The Hobbit", "The Lord of the Rings", "The Silmarillion" ] }
> )
{
  __match__: true,
  a: "J.R.R. Tolkien",
  b: [ "The Lord of the Rings", "The Silmarillion" ]
}

```

## Credits
Pilaf is heavily inspired from
[Match-Toy](https://github.com/AlfonsoFilho/match-toy). Match-Toy takes
patterns in form of strings and parses them while Pilaf avoid parsing as it
takes JavaScript literals as patterns. Hence, Match-Toy feature more patterns
than Pilaf but is also larger in size.

## Feedback
Feel free to provide feedback, report issues and request new features. You can
also mail me at irfan@irfanali.org.

## License
GNU General Public License v3.0
