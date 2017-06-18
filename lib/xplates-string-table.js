


var XPlatesStringTable = module.exports;


//Parse string/buffer into a bundle
XPlatesStringTable.parseIntoBundleSync = function(arg_bundle, arg_options, arg_text)
{
  //Parse options
  var prefix = arg_options.prefix || "";
  var trim = (typeof arg_options.trim === 'undefined' ? true : arg_options.trim);
  var comments = (typeof arg_options.comments === 'undefined' ? true : arg_options.comments);
  var lang = (arg_options||{}).language || 'text';
  var text = (typeof Buffer !== 'undefined' && arg_text instanceof Buffer ? arg_text.toString() : arg_text);
  if (typeof text !== 'string') throw new Error("Can only parse a string or Buffer object!");
  
  //Parse out comments that are at the beginning of a line OR preceded by a space
  if (comments) text = text.replace(/(^|\s+)\/\/.*/g, '');  
  
  //Template
  var active_name, active_body, active_key, active_args, active_lang;
  function add_active()
  {
    //Nothing to do here
    if (!active_name) return;
    
    //Adjustments
    if (trim) active_body = active_body.trim();
    active_args = active_args ? active_args.split(',') : [];
    
    //Key function?  Add it too.
    if (active_key)
    {
      arg_bundle(
        active_lang,
        '<% var a=arguments,p="'+active_key+'$",f=p+k,out=this[f]?this[f].apply(this,Array.prototype.slice.call(a,1)):this[p+"__default"].apply(this,a); %>',
        ['k'],
        active_key,
        arg_options);
    }
    
    //Add it
    arg_bundle(active_lang, active_body, active_args, active_name, arg_options);
    
    //Reset all trackers
    active_name = active_body = active_key = active_args = active_lang = null;
  }
  
  //Split and walk
  var lines = text.split(/\r?\n/);
  var template = null;
  for (var i = 0; i < lines.length; i++)
  {
    //Start of a new template?
    var prefixed = false;
    var line = lines[i];
    if (prefix && line.substr(0,prefix.length) === prefix) { prefixed = true; line = line.substr(prefix.length); }
    var start = line.match(/^(([\w\d]+):)?(([\w\d]+)(\$([\w\d]+))?)(\(([^)]*)\))?:(.*)/);
    if (start && (!prefix || prefixed))
    {
      //Add active
      add_active()
      
      //Start a new template
      active_lang = start[2] || lang;
      active_name = start[3];
      active_key = start[5] ? start[4] : null;
      active_body = start[9].trim();
      active_args = start[8];
    }
    //Prefixed, but invalid?
    else if (prefix && prefixed && !start)
    {
      throw new Error("XPlatesStringTable parse error, bad template on line "+(i+1));
    }    
    //Continuation of the previous one!
    else if (active_name)
    {
      if (trim) line = line.trim();
      active_body += '\n' + line;  
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

