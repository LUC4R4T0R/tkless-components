/*----------------------------------------------------- DEPRECATED ---------------------------------------------------*/

/**
 * @overview data-based resources of ccmjs-based web component for slidecast with commentary
 * @author André Kless <andre.kless@web.de> 2021-2022
 * @license The MIT License (MIT)
 */

/**
 * quiz config (used in example slides data)
 * @type {Object}
 */
export const quiz = {
  "questions": [
    {
      "text": "What is HTML?",
      "input": "radio",
      "answers": [
        "Programming Language",
        { "text": "Hypertext Markup Language", "correct": true },
        "Something to eat"
      ]
    }
  ],
  "feedback": true,
  "progress_bar": false,
  "placeholder.submit": "Finish"
};

/**
 * german texts and labels for Q&A Slidecast
 * @type {Object}
 */
export const text_de = {
  "comments": "Ein-/Ausblenden der Folienkommentare",
  "description": "Ein-/Ausblenden der Foliebeschreibung"
};

/**
 * english texts and labels for Q&A Slidecast
 * @type {Object}
 */
export const text_en = {
  "comments": "Shows/Hides Slide Comments",
  "description": "Shows/Hides Slide Description"
};

/**
 * german demo slides for Q&A Slidecast
 * @type {Object}
 */
export const slides_de = [
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/de/slide1.m4a",
    "content": 1,
    "description": "Willkommen! Der Lehrende kann für eine Folie eine optionale Beschreibung hinterlegen."
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/de/slide2.m4a",
    "content": 2,
    "description": "Die Beschreibung zu einer Folie kann auch eine separate App sein (siehe nächste Folie)."
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/de/extra.m4a",
    "content": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/de/extra.jpg",
    "description": [ "ccm.instance", "https://ccmjs.github.io/akless-components/quiz/versions/ccm.quiz-4.1.2.js", quiz ]
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/de/video.m4a",
    "content": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/video.mp4",
    "description": "Zwischen zwei Folien kann auch ein kleines Video platziert werden."
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/de/app.m4a",
    "content": [ "ccm.instance", "https://ccmjs.github.io/akless-components/quiz/versions/ccm.quiz-4.1.2.js", quiz ],
    "description": "Auch eine separate App kann zwischen Folien platziert werden."
  },
  {
    "content": "https://youtu.be/aqz-KE-bpKQ",
    "description": "Auch ein YouTube-Video kann zwischen Folien platziert werden."
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/de/slide3.m4a",
    "content": 3,
    "description": "Für diese Folie ist die Kommentierung ausgeschaltet.",
    "commentary": false
  }
];

/**
 * english demo slides for Q&A Slidecast
 * @type {Object}
 */
export const slides_en = [
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/en/slide1.m4a",
    "content": 1,
    "description": "Welcome! The teacher can add an optional description to a slide."
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/en/slide2.m4a",
    "content": 2,
    "description": "The description of a slide can also be a separate app (see next slide)."
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/en/extra.m4a",
    "content": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/en/extra.jpg",
    "description": [ "ccm.instance", "https://ccmjs.github.io/akless-components/quiz/versions/ccm.quiz-4.1.2.js", quiz ]
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/en/video.m4a",
    "content": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/video.mp4",
    "description": "A little video can be placed instead of a slide."
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/en/app.m4a",
    "content": [ "ccm.instance", "https://ccmjs.github.io/akless-components/quiz/versions/ccm.quiz-4.1.2.js", quiz ],
    "description": "A separate app can also be placed instead of a slide."
  },
  {
    "content": "https://youtu.be/aqz-KE-bpKQ",
    "description": "A YouTube video can also be placed between slides."
  },
  {
    "audio": "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/demo/en/slide3.m4a",
    "content": 3,
    "description": "Commenting is disabled for this slide.",
    "commentary": false
  }
];

/**
 * local configuration (relative paths)
 * @type {Object}
 */
export const local = {
  "comment": [ "ccm.component", "./../comment/ccm.comment.js", {
    "data": { "store": [ "ccm.store" ] },
    "src": [ "ccm.load", "./../comment/resources/resources.mjs#test" ]
  } ],
  "css": [ "ccm.load",
    "./../qa_slidecast/resources/styles-latest.css",
    "./../libs/bootstrap-5/css/bootstrap-icons.css",
    { "url": "./../libs/bootstrap-5/css/bootstrap-fonts.css", "context": "head" },
  ],
  "dark": "auto",
  "description": true,
  "helper.1": "./../libs/ccm/helper.mjs",
  "html.1": "./../qa_slidecast/resources/templates-latest.mjs",
  "ignore": {
    "slides": slides_de
  },
  "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/ccm.lang.js", {
    "translations": { "de": text_de, "en": text_en }
  } ],
//"onchange": event => console.log( 'onchange', event ),
//"onready": event => console.log( 'onready', event ),
//"onstart": event => console.log( 'onstart', event ),
  "pdf_viewer": [ "ccm.instance", "./../pdf_viewer/ccm.pdf_viewer.js", [ "ccm.load", "./../pdf_viewer/resources/resources.mjs#local" ] ],
  "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/ccm.routing.js" ],
  "text": text_de,
  "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/ccm.user.js" ],
  "youtube": [ "ccm.component", "https://ccmjs.github.io/akless-components/youtube/versions/ccm.youtube-2.1.1.js" ]
};

/**
 * demo configuration (absolute paths)
 * @type {Object}
 */
export const demo = {
  "comment": [ "ccm.component", "https://ccmjs.github.io/tkless-components/comment/versions/ccm.comment-7.2.0.min.js", {
    "data": { "store": [ "ccm.store" ] },
    "src": [ "ccm.load", "https://ccmjs.github.io/tkless-components/comment/resources/resources.mjs#demo" ]
  } ],
  "description": true,
  "ignore": {
    "slides": slides_de
  },
  "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/versions/ccm.lang-1.1.0.min.js", {
    "translations": { "de": text_de, "en": text_en }
  } ],
  "pdf_viewer": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/pdf_viewer/versions/ccm.pdf_viewer-7.3.0.min.js", [ "ccm.load", "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/resources.mjs#demo" ] ],
  "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-3.0.0.min.js" ],
  "text": text_de,
  "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.7.2.min.js" ]
};
