_ = require('underscore');
var repl = require('repl');
var binary = require('binary');

repl.start({
  prompt: "→ ",
  input: process.stdin,
  output: process.stdout
});
