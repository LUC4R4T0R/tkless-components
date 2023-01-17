/*----------------------------------------------------- DEPRECATED ---------------------------------------------------*/

/**
 * @overview Data-based resources of <i>ccmjs</i>-based web component for PDF viewer.
 * @author André Kless <andre.kless@web.de> 2021-2022
 * @license The MIT License (MIT)
 */

/**
 * Data-based resources of <i>ccmjs</i>-based web component for PDF viewer.
 * @module DataResources
 */

/**
 * German translations.
 * @type {Object.<string,string>}
 */
export const de = {
  "denied": "Zugriff verweigert",
  "download": "PDF herunterladen",
  "first": "Erste Seite",
  "jump": "Zu einer bestimmten Seite springen",
  "last": "Letzte Seite",
  "next": "Nächste Seite",
  "prev": "Vorherige Seite",
  "protected": "Dieses Dokument ist passwortgeschützt. Geben Sie ein Passwort ein."
};

/**
 * English translations.
 * @type {Object.<string,string>}
 */
export const en = {
  "denied": "Access Denied",
  "download": "Download PDF",
  "first": "First Page",
  "jump": "Jump to specific Page",
  "last": "Last Page",
  "next": "Next Page",
  "prev": "Previous Page",
  "protected": "This document is password protected. Enter a password.",
};

/**
 * Local configuration (relative paths)
 * @type {object}
 */
export const local = {
  "css": [ "ccm.load",
    "./../pdf_viewer/resources/styles-latest.css",
    "./../libs/bootstrap-5/css/bootstrap-icons.css",
    { "url": "./../libs/bootstrap-5/css/bootstrap-fonts.css", "context": "head" }
  ],
  "dark": "auto",
  "helper.1": "./../libs/ccm/helper.mjs",
  "html.1": "./../pdf_viewer/resources/templates-latest.mjs",
  "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/ccm.lang.js", {
    "translations": { "de": de, "en": en }
  } ],
//"onchange": event => console.log( 'onchange', event ),
//"onready": event => console.log( 'onready', event ),
//"onstart": event => console.log( 'onstart', event ),
  "pdf": "./../pdf_viewer/resources/demo/de/slides.pdf",
  "pdfjs.lib.1": "./../libs/pdfjs-2/pdf.js",
  "pdfjs.worker.1": "./../libs/pdfjs-2/pdf.worker.js",
  "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/ccm.routing.js" ],
  "text": de
};

/**
 * Demo configuration (absolute paths)
 * @type {object}
 */
export const demo = {
  "dark": "auto",
  "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/versions/ccm.lang-1.1.0.min.js", {
    "translations": { "de": de, "en": en }
  } ],
  "pdf": "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/demo/de/slides.pdf",
  "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-3.0.0.min.js" ],
  "text": de
};
