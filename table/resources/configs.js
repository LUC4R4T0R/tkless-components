ccm.files[ "configs.js" ] = {
  "demo": {
    "key": "demo",
    "table_row": 2,
    "table_col": 7,
    "add_row": true,
    "table_head": [ "Checkbox", "Selecter Box", "Telephone", "Email", "Date", "Textarea with Placeholder", "Disabled Textarea" ],
    /*"col_settings": [
      { "type": "checkbox" },
      { "type": "select", "options": [ "a", "b", "c" ] },
      { "type": "tel", "placeholder": "Tel: 049...", "required": true },
      { "type": "mail", "placeholder": "Hier steht Email" },
      { "type": "date", "bar": "baz" },
      { "type": "textarea", "placeholder": "Dies ist ein Typoblindtext. An ihm kann man sehen, ob alle Buchstaben da " +
        "sind und wie sie aussehen. Manchmal benutzt man Worte wie Hamburgefonts, Rafgenduks oder Handgloves, um " +
        "Schriften zu testen. Manchmal Sätze, die alle Buchstaben des Alphabets enthalten - man nennt diese Sätze " +
        "»Pangrams«. Sehr bekannt ist dieser: The quick brown fox jumps over the lazy old dog. " },
      { "type": "textarea", "disabled": "true", "placeholder": "Hier kannst du nichts schreiben." }
    ],*/
    "data": {
      "values": [
        [ true, "a", "0045/ 12344567", "max.mustermann@mail.com", "2017-01-03",  "", "textarea 2"],
        [ "", "b", "", "", "2017-08-03", "", ""],
        [ false, "c", "", "erika.mustermann@mail.com", "2017-04-03", "", ""],
        [ "", "", "", "markus.möglich@mail.com", "2018-01-03", "", ""],
        [ true, "", "", "jane.doe@mail.com", "2016-12-28", "", ""]
      ]
    },
    //"cell_onclick": function ( target, value, self  ){ console.log( target, value, self ); },
    //"cell_onrender": function ( event ) { console.log( this, event ); },
    "filter_values": true,
    "submit": true,
    "onchange": function ( result, value, self ) { console.log( result, value, self ); },
    "onfinish": {
      log: true
    }
  }
};