/**
 * @overview Data-based resources of ccmjs-based web component for a table.
 * @author André Kless <andre.kless@web.de> 2022
 * @license The MIT License (MIT)
 * @version 1
 */

/**
 * Data-based resources of <i>ccmjs</i>-based web component for a table.
 * @module DataResources
 */

/**
 * German translations.
 * @type {Object.<string,string>}
 */
export const de = {
  "add": "+ Zeile hinzufügen",
  "submit": "Abschicken"
};

/**
 * English translations.
 * @type {Object.<string,string>}
 */
export const en = {
  "add": "+ Add Row",
  "submit": "Submit"
};

/**
 * Example app state data.
 * @type {app_state}
 */
export const data = {
  "values": [
    [ "text", "a", "0045/ 12344567", "max.mustermann@mail.com"  , "2017-01-03", "", "textarea 2" ],
    [ ""    , "b", ""              , ""                         , "2017-08-03", "", ""           ],
    [ "bla" , "c", ""              , "erika.mustermann@mail.com", "2017-04-03", "", ""           ],
    [ ""    , "" , ""              , "markus.möglich@mail.com"  , "2018-01-03", "", ""           ],
    [ "text", "" , ""              , "jane.doe@mail.com"        , "2016-12-28", "", ""           ]
  ]
};

/**
 * Local configuration (relative paths)
 * @type {app_config}
 */
export const local = {
  "addable": true,
  "col_heads": [ "None", "Selecter Box", "Telephone", "Email", "Date", "Textarea with Placeholder", "Disabled Textarea" ],
  "col_settings": [
    { "type": "none" },
    { "type": "select", "options": [ "", "a", "b", "c" ] },
    { "type": "tel", "placeholder": "Tel: 049...", "required": true },
    { "type": "mail", "placeholder": "Hier steht Email" },
    { "type": "date", "bar": "baz" },
    { "type": "textarea", "placeholder": "Dies ist ein Typoblindtext. An ihm kann man sehen, ob alle Buchstaben da " +
          "sind und wie sie aussehen. Manchmal benutzt man Worte wie Hamburgefonts, Rafgenduks oder Handgloves, um " +
          "Schriften zu testen. Manchmal Sätze, die alle Buchstaben des Alphabets enthalten - man nennt diese Sätze " +
          "»Pangrams«. Sehr bekannt ist dieser: The quick brown fox jumps over the lazy old dog." },
    { "type": "textarea", "disabled": true, "placeholder": "Hier kannst du nichts schreiben." }
  ],
  "css": [ "ccm.load",
    "./../libs/bootstrap-5/css/bootstrap.min.css",
    "./../table/resources/styles.min.css"
  ],
  "data": data,
  "deletable": true,
  "helper.1": "./../libs/ccm/helper.mjs",
  "html.1": "./../table/resources/templates.mjs",
  "movable": true,
  "text": de
};

/**
 * Demo configuration (absolute paths)
 * @type {app_config}
 */
export const demo = {
  "addable": true,
  "deletable": true,
  "movable": true,
  "text": de
};
