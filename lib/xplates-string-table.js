


var XPlatesStringTable = module.exports;


//Parse string/buffer into a bundle
XPlatesStringTable.parseIntoBundleSync = function(arg_bundle, arg_options, arg_text)
{
  //Parse text
  var lang = (arg_options||{}).language || 'text';
  var text = (typeof Buffer !== 'undefined' && arg_text instanceof Buffer ? arg_text.toString() : arg_text);
  if (typeof text !== 'string') throw new Error("Can only parse a string or Buffer object!");
  
  //Parse out comments that are at the beginning of a line OR preceded by a space
  text = text.replace(/(^|\s+)\/\/.*/g, '');
  var lines = text.split(/\r?\n/);
  
  //Template
  var active_name, active_body, active_key, active_args;
  function add_active()
  {
    //Nothing to do here
    if (!active_name) return;
    
    //Adjustments
    active_body = active_body.trim();
    active_args = active_args ? active_args.split(',') : [];
    
    //Key function?  Add it too.
    if (active_key)
    {
      arg_bundle(
        lang,
        '<% var a=arguments,p="'+active_key+'$",f=p+k,out=this[f]?this[f].apply(this,Array.prototype.slice.call(a,1)):this[p+"__default"].apply(this,a); %>',
        ['k'],
        active_key);
    }
    
    //Add it
    arg_bundle(lang, active_body, active_args, active_name);    
    
    //Reset all trackers
    active_name = active_body = active_key = active_args = null;
  }
  var template = null;
  for (var i = 0; i < lines.length; i++)
  {
    //Start of a new template?
    var line = lines[i];
    var start = line.match(/^(([\w\d]+)(\$([\w\d]+))?)(\(([^)]*)\))?:(.*)/);
    if (start)
    {
      //Add active
      add_active()
      
      //Start a new template
      active_name = start[1];
      active_key = start[3] ? start[2] : null;
      active_body = start[7].trim();
      active_args = start[6];
    }
    //Continuation of the previous one!
    else if (active_name)
    {
      active_body += '\n' + line.trim();  
    }   
  }
  add_active(); //Final add
}

//Parse into bundle
XPlatesStringTable.parseIntoBundle = function(arg_bundle, arg_options, arg_text, arg_callback)
{
  setImmediate(function()
  {
    try { XPlatesStringTable.parseIntoBundleSync(arg_bundle, arg_options, arg_text); }
    catch(e) { arg_callback(e); return; }
    arg_callback(null);
  });
}

//Read file into bundle
XPlatesStringTable.parseFileIntoBundle = function(arg_bundle, arg_options, arg_path, arg_callback)
{
  require('fs').readFile(
    arg_path,
    function(e,buffer)
    {
      if (e) return arg_callback(e);
      XPlatesStringTable.parseIntoBundle(arg_bundle, arg_options, buffer, arg_callback);
    }
  );  
}

//Read file into bundle, sync version
XPlatesStringTable.parseFileIntoBundleSync = function(arg_bundle, arg_options, arg_path)
{
  var buffer = require('fs').readFileSync(arg_path);
  return XPlatesStringTable.parseIntoBundleSync(arg_bundle, arg_options, buffer);
}

//Get key maps
XPlatesStringTable.getMapKeys = function(arg_bundle)
{
  var keys = {};
  for (var k in arg_bundle)
  {
    var match = k.match(/^([\w\d]+)\$([\w\d]+)$/);
    if (match)
    {
      keys[match[1]] = keys[match[1]] || [];
      if (match[2] !== '__default') keys[match[1]].push(match[2]);  
    }
  }
  return keys;
}

//Add key functions
XPlatesStringTable.addKeyFunctions = function(arg_bundle)
{  
  //Add functions for keys
  var keys = XPlatesStringTable.getMapKeys(arg_bundle);
  for (var k in keys) arg_bundle("text", "<% out="+JSON.stringify(keys[k])+"%>", [], k+"__keys");
}

