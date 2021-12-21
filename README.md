# pilaf
pilaf is a pattern-matching micro-library for JavaScript which provides recursive
pattern-matching for variables, arrays and objects in the style of Erlang and
Haskell.

## Examples
pilaf contains two functions, `match()` and `run()`.

`match()` takes a pattern and a value and returns a match object which
indicates if the pattern matched the value.

`run()` takes an array of arrays which contain pattern, value and callback as
elements and tries patterns till one is matched and then runs the callback with
the match object returned as the input and returns the result of the callback.

### Variable Pattern
It begins with `$` and matches a variable of any type in JavaScript. The match
object creates a key with the name supplied after `$` in the pattern which
stores the value of the variable.

It always return a `{ __match__: true }` in the match object.

```javascript

match("$foo", "hello") // { "__match__": true, foo: "hello"}
match("$bar", 3) // { "__match__": true, bar: 3}
match("$baz", true) // { "__match__": true, baz: true}
match("$quux", null) // { "__match__": true, quux: null}
match("$quuz", NaN) // { "__match__": true, quuz: NaN}
match("$xyzzy", undefined) // { "__match__": true, xyzzy: undefined}

```

Note: The match object contains a key `__match__` by default to indicate the
success status of the match. If you use `$__match__` as pattern, the match
object would not contain the success status of the match but would instead
contain the value of the variable in the key `__match__`.

### Equality Pattern
It works like regular equality comparison and returns a `{ __match__: true }` match object if
the pattern is equal to the value and a `false` match object otherwise.
```
match("hello", "hello") // { "__match__": true }
match("hello", "world") // { "__match__": false }
match("hello", 2) // { "__match__": false }
match(2, 2) // { "__match__": true }
match(2, 3) // { "__match__": false }
match(undefined, undefined) // { "__match__": true }
match(null, null) // { "__match__": true }
match(NaN, NaN) // { "__match__": false}
```

### Wildcard Pattern
It works almost like a variable pattern except that it begins with a `_` and
the match object discards the value. It's normally used when the value of the
variable is not needed.

It always returns `{ __match__: true }` in the match object.

```
match("_foo", "hello") // { __match__: true }
match("_bar", 2) // { __match__: true }
match("_baz", true) // { __match__: true }
```

### Array Pattern
It recursively matches an array. It is declared exactly like an array and can
contain other patterns in elements. It is matched recursively till a variable
pattern, wildcard pattern or equality pattern is reached.

```
match([2, "$foo"], [2, 3]) // { __match__: true, foo: 3 }
match([3, "$bar"], [5, 7]) // { __match__: false }
match([2, 3, "$baz"], [2, 3, ["hello", "world"]]) // { __match__: true, baz: [ "hello", "world" ]}
match([2, 3, ["hello", "$quux"]], [2, 3, ["hello", "world"]]) // { __match__: true, baz: "world"}
match([3, "$quuz"], [3, { book: "Alice in Wonderland", author: "Lewis Carroll" }]) // { __match__: true, quux: { book: "Alice in Wonderland", author: "Lewis Carroll" }}
```

It could also be used to match an array when the length of array is not known.
If the last element of the array pattern starts with `...`, it matches the rest
of the array.

```
match([2, "...$foo"], [3, 7, "hello", true]) // { __match__: true, foo: [3, 7, "hello", true]}
match(["...$foo"], [2]) // { __match__: true, foo: [2]}
```

### Object Pattern
It recursively matches an object, just like array pattern.
```
match({ book: "$foo", author: "$bar" }, { book: "The Hobbit", author: "J.R.R. Tolkien" }) // { __match__: true, foo: "The Hobbit", bar: "J.R.R. Tolkien" }
match({ authors: [ "Lewis Carroll", "Daniel Defoe", "J.R.R. Tolkien" ] }, { authors: [ "Lewis Carroll", $baz, "J.R.R. Tolkien" }) // { __match__: true, baz: "Daniel Defoe" }
```

## License
GNU General Public License, version 3.0
