# pilaf
pilaf is a simple pattern-matching library for JavaScript which provides
recursive pattern-matching in the style of Erlang.

if you're tired of writing chains of `if`, `else` and `switch` statements,
pilaf can help you structure your code in the pattern-matching style popular in
languages like Erlang and Haskell.

## Examples
here is a simple function in traditional imperative-style in JavaScript

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
      .otherwise()        .run(x => x.a * factorial(x.a - 1))
    .return();
}

```

here, the value `n` is matched on pattern `$n`. the match result is then
filtered through the callback `x => x.n < 1` filter in `when`.

if the filter returns `true`, the callback in `run` is executed. the return value
of callback in `run` is returned by `return` in the end.

if the filter returns `false`, `run` attached with `otherwise` is executed
calls the function.

there are many types of available patterns which can be recursively matched to
variables, arrays and objects.

### Variable Pattern
variable patterns begin with "$". the string after the "$" is the key which
stores the value and which can be accessed in `when` filters and `run`
callbacks.

variable pattern always matches the value.

```javascript
> match(3).case("$a").run(x => "the value was x.a").return();
the value was 3

> match("world").case("$b").run(x => "hello, " + x.b).return();
hello, world

> match

```

## Dependencies
pilaf doesn't contain any dependencies and is written in vanilla JavaScript.

## Credits
pilaf is inspired from [match-toy](https://github.com/AlfonsoFilho/match-toy).

the difference is that while match-toy takes strings as patterns and parses
them into JavaScript structures pilaf avoids parsing by taking JavaScript
literals as patterns.

## License
GNU General Public License, version 3.0
