
var XPlates = require('xplates');
var XPlatesStringTable = require('../lib/xplates-string-table.js');



var assert = require('chai').assert;

describe('String table parsing', function()
{
  var bundle;
  
  it('Should be able to parse a bundle file', function()
  {
    //Parse
    bundle        = new XPlates.bundle();    
    XPlatesStringTable.parseFileIntoBundleSync(
      bundle,
      { language: 'text', predefined: { predef_test: "abc123" } },
      __dirname + '/test_strings.txt');    
    
    //Basic test
    assert.isFunction(bundle.hello_world);    
  });
  
  it('Should accept arguments', function()
  {
    assert.equal(bundle.hello('world'), 'Hello, world!');
  });
  
  it('Should run code', function()
  {
    assert.equal(bundle.party(), "Party like it's " + new Date().getFullYear());
    
    assert.equal(bundle.messages(0), "You have 0 messages");
    assert.equal(bundle.messages(1), "You have 1 message");
    assert.equal(bundle.messages(2), "You have 2 messages");
    assert.equal(bundle.messages(3), "You have 3 messages");
  });
  
  it('Should handle multi-line', function()
  {    
    assert.equal(bundle.poem(), "Roses are red,\nViolets are blue,\n\nXPlates is awesome,\nString tables are too!");
  });
  
  it('Should handle no-trimming mode', function()
  {
    var bundle_notrim = new XPlates.bundle();
    XPlatesStringTable.parseFileIntoBundleSync(bundle_notrim, { language: 'text', trim: false }, __dirname + '/test_strings.txt');
  
    assert.equal(bundle_notrim.poem(), "\n  Roses are red,      \n  Violets are blue,\n  \n  XPlates is awesome,      \n  String tables are too!");
  });
  
  it('Should handle comments mode', function()
  {  
    assert.equal(bundle.line_with_comments(), "Hello");
    assert.equal(bundle.line_without_comments(), "Hello");
  });
  
  it('Should handle no-comments mode', function()
  {
    var bundle_nocomments = new XPlates.bundle();
    XPlatesStringTable.parseFileIntoBundleSync(bundle_nocomments, { language: 'text', comments: false }, __dirname + '/test_strings.txt');
  
    assert.equal(bundle_nocomments.line_with_comments(), "Hello //Comment!");
    assert.equal(bundle_nocomments.line_without_comments(), "Hello");
  });
  
  it('Should handle language prefixes', function()
  {
    assert.equal(bundle.text_test("Cake > Pie"), "Cake > Pie");
    assert.equal(bundle.html_test("Cake > Pie"), "Cake &gt; Pie");
  });
  
  it('Should work without start prefixes', function()
  {
    assert.isFunction(bundle.XPLATES_prefix_test);
    assert.isFunction(bundle.nonprefixed_line);
  });
  
  
  it('Should work with start prefixes', function()
  {
    var bundle_prefix = new XPlates.bundle();
    XPlatesStringTable.parseFileIntoBundleSync(bundle_prefix, { language: 'text', prefix: "XPLATES_" }, __dirname + '/test_strings.txt');
    
    assert.isFunction(bundle_prefix.prefix_test);
    assert.isNotFunction(bundle_prefix.nonprefixed_line);
    assert.equal(bundle_prefix.prefix_test(), 'Prefixes work!\nnonprefixed_line: This should be part of it.');
  });
  
  it('Should pass through arguments', function()
  {
    assert.equal(bundle.predef_example(), "abc123");
  });
  
  it('Should use simple maps', function()
  {
    assert.equal(bundle.color("red"), "rojo");
    assert.equal(bundle.color("green"), "verde");
    assert.equal(bundle.color("blue"), "azul");
    assert.equal(bundle.color("purple"), "purple");
  });
  
  it('Should do maps with arguments', function()
  {
    var d = new Date(2004, 6, 8);
    assert.equal(bundle.date_part("year", d), "Year 2004");
    assert.equal(bundle.date_part("month", d), "Month 7");
    assert.equal(bundle.date_part("day", d), "Day 8");
    assert.equal(bundle.date_part("something_else", d), "Unknown 2004-07-08T04:00:00.000Z");
  });
  
  it('Should do bundle references', function()
  {
    assert.equal(bundle.copyright_statement(), "Copyright 2017, all right reserved.")
  });
  
  it('Should do key maps', function()
  {
    assert.deepEqual(XPlatesStringTable.getMapKeys(bundle).color, ["red","green","blue"]);
    XPlatesStringTable.addKeyFunctions(bundle);
    assert.deepEqual(bundle.color__keys(), ["red","green","blue"]);
  });
  
  it('Should to asynchronous parsing', function(done)
  {
    var async_bundle = new XPlates.bundle();
    XPlatesStringTable.parseFileIntoBundle(
      async_bundle,
      { language: 'text' },
      __dirname + '/test_strings.txt',
      function(err)
      {
        assert.isFunction(async_bundle.hello_world);    
        assert.isNull(err);
        done();
      });
  });
  
  it('Should handle sync errors correctly', function()
  {
    var sync_error_bundle = new XPlates.bundle();
    assert.throws(
      function()
      {
        XPlatesStringTable.parseFileIntoBundleSync(bundle, { language: 'text' }, __dirname + '/error_strings.txt');
      },
      /compile error/i
    );
  });
  
  it('Should handle async errors correctly', function(done)
  {
    var async_error_bundle = new XPlates.bundle();    
    XPlatesStringTable.parseFileIntoBundle(
      async_error_bundle,
      { language: 'text' },
      __dirname + '/error_strings.txt',
      function(err)
      {
        assert.isNotNull(err);
        assert.match(err.message, /compile error/i);
        done();
      });
  });
});

