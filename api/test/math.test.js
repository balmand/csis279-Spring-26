const test = require("node:test");
const assert = require("node:assert");
const {add, multiply} = require("../math");

test('adds two numbers', () =>{
    assert.strictEqual(add(3, 3), 6);
})

test('multiply two numbers', () =>{
    assert.strictEqual(multiply(1, 1), 1);
})