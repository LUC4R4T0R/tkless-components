ccm.files[ "configs.js" ] = {
  "local": {
    "data":  {
      "store": [ "ccm.store", { "name": "star_rating" } ],
      "key": "demo"
    },
    "star_title": [ "Gefällt mir gar nicht", "Gefällt mir nicht",
       "Ist Ok", "Gefällt mir", "Gefällt mir sehr" ],
    "user":  [ "ccm.instance", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-8.0.0.js",
      [ "ccm.get", "https://ccmjs.github.io/akless-components/user/resources/configs.js", "guest" ]
    ],
  }
};