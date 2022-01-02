"use strict";

let isObject = x => typeof(x) === "object" && x !== null;
let isArray = x => isObject(x) && x.constructor.name === "Array";
let isBigInt = x => typeof(x) === "bigint";
let isBoolean = x => typeof(x) === "boolean";
let isNumber = x => typeof(x) === "number";
let isString = x => typeof(x) === "string";

function check(pattern, value) {
  if (isString(pattern)) {
    if (pattern[0] === "_")
      return { "__match__": true };

    if (pattern[0] === "$")
      return { "__match__": true, [ pattern.slice(1) ]: value };
  }

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

  if (isArray(pattern) && isArray(value) && pattern.length === value.length) {
    let accumulator = { "__match__": true };

    pattern.forEach((x, i) => {
      if (accumulator["__match__"]) {
        let m = check(pattern[i], value[i]);

        if (m["__match__"])
          Object.assign(accumulator, m);

        else
          accumulator = { "__match__": false };
      }
    })

    return accumulator;
  }

  if (isObject(pattern) && isObject(value)) {
    const pKeys = Object.keys(pattern).sort();
    const vKeys = Object.keys(value).sort();

    if ((pKeys.length === vKeys.length && pKeys.every((x, i) => x === vKeys[i]))) {
      let accumulator = { "__match__": true };
      pKeys.forEach((x, i) => {
        if (accumulator["__match__"]) {
          let m = check(pattern[pKeys[i]], value[vKeys[i]]);
          if (m["__match__"])
            Object.assign(accumulator, m);
          else
            accumulator = { "__match__": false };
        }
      })

      return accumulator;
    }
  }

  return { "__match__": false };
}

function match(value) {
  let obj = {};

  obj.case = (pattern) => {
    if (obj.result) {
      return obj;
    }

    check(pattern, value);
    obj.match = check(pattern, value);
    obj.match["__filter__"] = true;

    return obj;
  }

  obj.when = (filter) => {
    if (obj.result) {
      return obj;
    }

    if (obj.match["__match__"]) {
      if (filter(obj.match)) {
        obj.match["__filter__"] = true;
        return obj;
      }

      obj.match["__filter__"] = false;
    }

    return obj;
  }

  obj.otherwise = (filter) => {
    if (obj.result) {
      return obj;
    }

    obj.match["__filter__"] = true;
    return obj;
  }

  obj.run = (callback) => {
    if (obj.result) {
      return obj;
    }

    if (obj.match["__match__"] && obj.match["__filter__"]) {
      obj.result = callback(obj.match);
    }

    return obj;
  }

  obj.return = () => {
    return obj.result;
  }

  return obj;
}
