id = x => x;
not = x => !x;
isObject = x => typeof x === "object" && x !== null;
isArray = x => isObject(x) && x.constructor.name === "Array";
isBigInt = x => typeof x === "bigint";
isBoolean = x => typeof x === "boolean";
isNumber = x => typeof x === "number";
isString = x => typeof x === "string";

function check(pattern, value) {
  if (isString(pattern)) {
    // Wildcard Pattern
    if (pattern[0] === "_")
      return { "__match__": true };

    // Variable Pattern
    if (pattern[0] === "$")
      return { "__match__": true, [ pattern.slice(1) ]: value };
  }

  // Primitive Pattern
  if (
    (isString(pattern) && isString(value)) ||
    (isNumber(pattern) && isNumber(value)) ||
    (isBoolean(pattern) && isBoolean(value)) ||
    (isBigInt(pattern) && isBigInt(value))
  ) {
    return { "__match__": pattern === value };
  }

  if (
    ((pattern === undefined) && (value === undefined)) ||
    ((pattern === null) && (value === null)) ||
    ((pattern === NaN) && (value === NaN))
  ) {
    return { "__match__": true };
  }

  // Tail Pattern
  if (
    isArray(pattern) &&
    isArray(value) &&
    (isString(pattern[pattern.length - 1])) &&
    (pattern[pattern.length - 1].slice(0, 4) === "...$")
  ) {
    const pLength = pattern.length;
    const vLength = value.length;
    const pLast = pattern[pattern.length - 1];

    let accumulator = { "__match__": true };

    pattern.forEach((x, i) => {
      if (i < pLength - 1) {
        if (accumulator["__match__"]) {
          let m = check(pattern[i], value[i]);

          if (m["__match__"]) {
            Object.assign(accumulator, m);
          }

          else {
            accumulator = { "__match__": false };
          }
        }
      }

      if (i === pLength - 1) {
        if (accumulator["__match__"]) {
          if (pLength <= vLength) {
            let m = { "__match__": true, [ pLast.slice(4) ]: value.slice(i) };
            Object.assign(accumulator, m);
          }
          if (pLength === vLength + 1) {
            let m = { "__match__": true, [ pLast.slice(4) ]: [ ] };
            Object.assign(accumulator, m);
          }
          if (pLength > vLength + 1) {
            accumulator = { "__match__": false };
          }
        }
      }
    })

    return accumulator;
  }

  // Array Pattern
  if (isArray(pattern) && isArray(value) && pattern.length === value.length) {
    let accumulator = { "__match__": true };

    pattern.forEach((x, i) => {
      if (accumulator["__match__"]) {
        let m = check(pattern[i], value[i]);
        if (m["__match__"]) {
          Object.assign(accumulator, m);
        }
        if (not(m["__match__"])) {
          accumulator = { "__match__": false };
        }
      }
    })

    return accumulator;
  }

  // Object Pattern
  if (isObject(pattern) && isObject(value)) {
    const pKeys = Object.keys(pattern).sort();
    const pLength = pKeys.length;

    const vKeys = Object.keys(value).sort();
    const vLength = vKeys.length;

    if (pLength === vLength && pKeys.every((x, i) => x === vKeys[i])) {
      let accumulator = { "__match__": true };

      pKeys.forEach((x, i) => {
        if (accumulator["__match__"]) {
          let m = check(pattern[pKeys[i]], value[vKeys[i]]);
          if (m["__match__"]) {
            Object.assign(accumulator, m);
          }
          if (not(m["__match__"])) {
            accumulator = { "__match__": false };
          }
        }
      })

      return accumulator;
    }
  }

  return { "__match__": false };
}

function match(value) {
  this.case = (pattern) => {
    if (this.result) {
      return this;
    }

    check(pattern, value);
    this.match = check(pattern, value);
    this.match["__filter__"] = true;

    return this;
  }

  this.when = (filter) => {
    if (this.result) {
      return this;
    }

    if (this.match["__match__"]) {
      if (filter(this.match)) {
        this.match["__filter__"] = true;
        return this;
      }

      this.match["__filter__"] = false;
    }

    return this;
  }

  this.otherwise = (filter) => {
    if (this.result) {
      return this;
    }

    this.match["__filter__"] = true;
    return this;
  }

  this.run = (callback) => {
    if (this.result) {
      return this;
    }

    if (this.match["__match__"] && this.match["__filter__"]) {
      this.result = callback(this.match);
    }

    console.log(this);
    return this;
  }

  this.return = () => {
    return this.result;
  }

  return this;
}
