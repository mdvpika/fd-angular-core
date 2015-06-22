var test = require('unit.js');
var Featherhead = require('../lib/index').Featherhead;

describe('Featherhead', function() {
  var fh;

  before(function(){
    fh = new Featherhead({
      commit: "cbc88e4013f93e0b15f70e8fa8441a8921519e55",
      assets: "6a713fccf0bd691422ab91675fa005e1b052e45f"
    });
  });

  describe('.commit', function(){

    it('should be set by the constructor', function() {
      test.object(fh)
        .hasOwnProperty('commit', 'cbc88e4013f93e0b15f70e8fa8441a8921519e55');
    });

    it('is required by the constructor', function() {
      test.exception(function() { new Featherhead({ assets: "6a713fccf0bd691422ab91675fa005e1b052e45f" }) })
        .match('Featherhead: invalid commit option passed to constructor.');
    });

  });

  describe('.assets', function(){

    it('should be set by the constructor', function() {
      test.object(fh)
        .hasOwnProperty('assets', '6a713fccf0bd691422ab91675fa005e1b052e45f');
    });

    it('is required by the constructor', function() {
      test.exception(function() { new Featherhead({ commit: "cbc88e4013f93e0b15f70e8fa8441a8921519e55" }) })
        .match('Featherhead: invalid assets option passed to constructor.');
    });

  });

  describe('.assetURL()', function(){

    it('works with relative paths', function() {
      test.string(fh.assetURL("path/to/file"))
        .is('/_asset/6a713fccf0bd691422ab91675fa005e1b052e45f/path/to/file');
    });

    it('works with absolute paths', function() {
      test.string(fh.assetURL("/path/to/file"))
        .is('/_asset/6a713fccf0bd691422ab91675fa005e1b052e45f/path/to/file');
    });

  });

  describe('.dataURL()', function(){

    it('works with relative paths', function() {
      test.string(fh.dataURL("path/to/file"))
        .is('/_data/fetch/cbc88e4013f93e0b15f70e8fa8441a8921519e55/path/to/file');
    });

    it('works with absolute paths', function() {
      test.string(fh.dataURL("/path/to/file"))
        .is('/_data/fetch/cbc88e4013f93e0b15f70e8fa8441a8921519e55/path/to/file');
    });

    it('strips .json', function() {
      test.string(fh.dataURL("/path/to/file.json"))
        .is('/_data/fetch/cbc88e4013f93e0b15f70e8fa8441a8921519e55/path/to/file');
    });

  });


  describe('.commitURL()', function(){

    it('always returns a single value', function() {
      test.string(fh.dataURL("path/to/file"))
        .is('/_data/commit');
    });

  });
});
