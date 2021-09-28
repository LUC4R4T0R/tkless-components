/**
 * @overview data-based resources of ccmjs-based web component for slidecast with commentary
 * @author André Kless <andre.kless@web.de> 2021
 * @license The MIT License (MIT)
 */

/**
 * example slides data
 * @type {Object}
 */
export const slides = [
  {
    "content": 1,
    "audio": "./../qa_slidecast/resources/slide1.mp3",
    "description": "Hello World! This is the first slide of my presentation."
  },
  {
    "content": "./../qa_slidecast/resources/slide4.jpg",
    "audio": "./../qa_slidecast/resources/slide2.mp3"
  },
  {
    "content": 2,
    "audio": "./../qa_slidecast/resources/slide3.mp3",
    "description": "Welcome! The teacher can add a specific description to a slide."
  },
  {
    "content": "./../qa_slidecast/resources/video.mp4"
  },
  {
    "content": [ "ccm.proxy", "https://ccmjs.github.io/akless-components/quiz/versions/ccm.quiz-4.1.2.js" ]
  },
  {
    "content": 3,
    "commentary": false
  }
];

/**
 * test configuration (relative paths)
 * @type {Object}
 */
export const local = {
  "comment": [ "ccm.component", "./../comment/ccm.comment.js", [ "ccm.load", "./../comment/resources/resources.mjs#local" ] ],
  "css": [ "ccm.load",
    "./../qa_slidecast/resources/styles.css",
    "./../libs/bootstrap-5/css/bootstrap-icons.css",
    { "url": "./../libs/bootstrap-5/css/bootstrap-fonts.css", "context": "head" },
  ],
  "helper.1": "./../libs/ccm/helper.mjs",
  "html.1": "./../qa_slidecast/resources/templates.mjs",
  "ignore": {
    "slides": slides
  },
  "open": "comments",
  "pdf_viewer": [ "ccm.start", "./../pdf_viewer/ccm.pdf_viewer.js", [ "ccm.load", "./../pdf_viewer/resources/resources.mjs#local" ] ]
};

/**
 * demo configuration (absolute paths)
 * @type {Object}
 */
export const demo = {

};