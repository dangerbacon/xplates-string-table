
var XPlates = require('xplates');
var XPlatesStringTable = require('../lib/xplates-string-table.js');



var assert = require('chai').assert;

describe('String table parsing', function()
{
  var bundle;
  
  it('Should be able to parse a bundle file', function()
  {
    //Parse
    bundle = new XPlates.bundle();
    XPlatesStringTable.parseFileIntoBundleSync(bundle, { language: 'text' }, __dirname + '/test_strings.txt');
    
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

