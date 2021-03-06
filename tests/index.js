'use strict'

var path     = require('path')
var concat   = require('..')
var expect   = require('expect.js')
var root     = process.cwd()
var fs       = require('fs')
var broccoli = require('broccoli')

var builder

describe('broccoli-concat', function(){

  function readFile(path) {
    return fs.readFileSync(path, {encoding: 'utf8'})
  }

  function chdir(path) {
    process.chdir(path)
  }

  beforeEach(function() {
    chdir(root)
  })

  afterEach(function() {
    if (builder) {
      builder.cleanup()
    }
  })

  describe('with defaults', function(){
    it('joins contents together with a newline', function(){
      var sourcePath = 'tests/fixtures'
      var tree = concat(sourcePath, {
        inputFiles: ['*.js'],
        outputFile: '/out.js',
      })

      builder = new broccoli.Builder(tree);
      return builder.build().then(function(results) {
        var dir = results.directory;
        expect(readFile(dir + '/out.js')).to.eql('var foo = "bar";\nvar bar = "baz";')
      })
    })
  })

  describe('with a custom separator', function(){
    it('joins contents together with the specified separator', function(){
      var sourcePath = 'tests/fixtures'
      var tree = concat(sourcePath, {
        inputFiles: ['*.js'],
        outputFile: '/out.js',
        separator: '\n// separator \n'
      })

      builder = new broccoli.Builder(tree);
      return builder.build().then(function(results) {
        var dir = results.directory;
        expect(readFile(dir + '/out.js')).to.eql('var foo = "bar";\n// separator \nvar bar = "baz";')
      })
    })
  })

  describe('with wrapInEval set to true', function(){
    it('wraps each file in eval with sourceURL set', function(){
      var sourcePath = 'tests/fixtures'
      var tree = concat(sourcePath, {
        inputFiles: ['*.js'],
        outputFile: '/out.js',
        wrapInEval: true
      })

      builder = new broccoli.Builder(tree);
      return builder.build().then(function(results) {
        var dir = results.directory;
        expect(readFile(dir + '/out.js')).to.eql(
          'eval("(function() {var foo = \\\"bar\\\";})();//@ sourceURL=a-file.js");\n\n'+
          'eval("(function() {var bar = \\\"baz\\\";})();//@ sourceURL=another-file.js");\n'
        )
      })
    })
  })
});
