ccm.files[ 'configs.js' ] = {
  "demo": {
    "buttons": true,
    "user":  [ "ccm.instance", "https://akless.github.io/ccm-components/user/ccm.user.min.js"],
    "data":  {
      "store": [ "ccm.store", "https://tkless.github.io/ccm-components/thumb_rating/resources/datastore.js" ],
      "key": "demo"
    }
  },

  "local": {
    "buttons": true,
    "user":  [ "ccm.instance", "https://akless.github.io/ccm-components/user/ccm.user.min.js"],
    "data":  {
      "store": [ "ccm.store", "resources/datastore.js" ],
      "key": "demo"
    },
    "logger": [ "ccm.instance", "https://akless.github.io/ccm-components/log/ccm.log.min.js",
      [ "ccm.get", "https://akless.github.io/ccm-components/log/resources/configs.min.js", "greedy" ]
    ]
  }
};