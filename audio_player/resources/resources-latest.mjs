/**
 * @overview data-based resources of ccmjs-based web component for audio player
 * @author Luca Ringhausen <luca.ringhausen@h-brs.de> 2022-2023
 * @license The MIT License (MIT)
 * @version latest (v1)
 */

/**
 * german texts and labels for Q&A Slidecast
 * @type {Object}
 */
export const text_de = {
};

/**
 * english texts and labels for Q&A Slidecast
 * @type {Object}
 */
export const text_en = {
};

/**
 * local configuration (relative paths)
 * @type {Object}
 */
export const local = {
  "css": [ "ccm.load",
    "./../audio_player/resources/styles-latest.css",
    "./../libs/bootstrap-5/css/bootstrap-icons.css",
    { "url": "./../libs/bootstrap-5/css/bootstrap-fonts.css", "context": "head" },
  ],
  "dark": "auto",
  "helper.1": "./../libs/ccm/helper.mjs",
  "html.1": "./../audio_player/resources/templates-latest.mjs",
  "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/ccm.lang.js", {
    "translations": { "de": text_de, "en": text_en }
  } ],
//"onchange": event => console.log( 'onchange', event ),
//"onready": event => console.log( 'onready', event ),
//"onstart": event => console.log( 'onstart', event ),
};
