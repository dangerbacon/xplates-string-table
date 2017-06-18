


# XPlates String Table

## What is this?

This is a string table reader for XPlates, for use in internationalization.

It reads easy-to-use string tables that have the full power of JavaScript and XPlates.

## String Table Format

    //Very simple string map:  call bundle.hello_world()
    hello_world: Hello, World!    

    //Comments are supported with double slashes
    welcome_msg:  Welcome! //At the ends of lines too.
    
    //Arguments are fully supported, call bundle.hello("World")
    hello(name): Hello, <%= name %>!
    
    //Full code execution example
    party: Party like it's <%= new Date().getFullYear() %>
    
    //Conditional example for pluralization
    messages(count):  You have <%= count %> <%? count === 1 %>message<%??%>messages<%?%>
    
    //Multi-line example.
    poem:
      Roses are red,      
      Violets are blue,
      
      XPlates is awesome,      
      String tables are too!      
      
    //Map example, with a "__default" fallback
    //  bundle.color("red") -> "rojo"
    //  bundle.color("purple") -> "purple"   (will fall back on __default function)
    color$red:          rojo
    color$green:        verde
    color$blue:         azul
    color$__default(c): <%= c %>
    
    //Maps can have arguments too!    
    date_part$year(d):        Year <%= d.getFullYear() %>
    date_part$month(d):       Month <%= d.getMonth()+1 %>
    date_part$day(d):         Day <%= d.getDate() %>
    date_part$__default(k,d): Unknown <%= d.toISOString() %>
    
    //It's an XPlate bundle, so you can use the full logic of other pieces too!
    copyright_year: 2017
    copyright_statement:  Copyright <%% copyright_year() %>, all right reserved.
    
    //You can override the default language by adding it as a prefix.  Any XPlates-supported language works.
    html:greeting(name): <b>Hello, <i><%= name %></i>!</b>
    
    
Usage:

    //Require
    var XPlatesStringTable = require('xplates-string-table');

    //Create a bundle
    var bundle = new XPlates.bundle;
    
    //Read a file synchronously
    XPlatesStringTable.parseFileIntoBundleSync(bundle, { language: "text" }, "/path/to/file.txt");
    
    //Read a file asynchronously
    XPlatesStringTable.parseFileIntoBundle(bundle, { language: "text" }, "/path/to/file.txt", function(err) { ... });
    
    //Read a buffer or string synchronously
    XPlatesStringTable.parseIntoBundleSync(bundle, { language: "text" }, my_string_table_buffer);
    
    //Read a buffer or string asynchronously
    XPlatesStringTable.parseIntoBundle(bundle, { language: "text" }, my_string_table_buffer, function(err) { ... });
    
    //It automatically trims every line, but you can turn that off.
    XPlatesStringTable.parseFileIntoBundleSync(bundle, { language: "text", trim: false }, "/path/to/file.txt");
    
    //JavaScript style //comments will be automatically removed - but you can turn that off too:
    XPlatesStringTable.parseFileIntoBundleSync(bundle, { language: "text", comments: false }, "/path/to/file.txt");
    
    //Additional paramaters that XPlates processes will be passed along, such as "predefined":
    XPlatesStringTable.parseFileIntoBundleSync(bundle, { language: "text", predefined: { abc: 123 } }, "/path/to/file.txt");
    
    //Get map keys
    //Example:  if you had a string table with this:
    //  color$red:          rojo
    //  color$green:        verde
    //  color$blue:         azul
    //  color$__default(c): <%= c %>
    //.. then calling it would give you the keys defined, not including __default
    //  XPlatesStringTable.getMapKeys(bundle) -> { "color": ["red","green","blue"] }
    
    //This adds additional functions to the bundle named "map__keys" that return the set of keys
    //Example:  using the same as above,
    //  bundle.color__keys() --> ["red","green","blue"]
    XPlatesStringTable.addKeyFunctions(bundle);
    
    //You can also require all new templates to start with a prefix you're worried about bad matches.
    //For example, this makes line "TEMPLATE:foo:" start a template, and line "bar:" not start a template.
    XPlatesStringTable.parseFileIntoBundleSync(bundle, { language: "text", prefix: "TEMPLATE:" }, "/path/to/file.txt");
    