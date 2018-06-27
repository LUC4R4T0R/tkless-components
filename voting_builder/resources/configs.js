ccm.files[ "configs.js" ] = {
  "local": {
    "submit_button": "Submit",
    "preview": true,
    "defaults": {
      "data.store": "[ 'ccm.store',{ 'store':'voting_data' } ]",
      "user": "['ccm.instance','https://ccmjs.github.io/akless-components/user/versions/ccm.user-7.0.1.js',['ccm.get','https://ccmjs.github.io/akless-components/user/resources/configs.js','guest']]"
    },
    "onfinish": { "log": true }
  },

  "crud_app": {
    "builder": [ "ccm.component", "ccm.voting_builder.js",
      {
        "preview": true,
        "defaults": {
          "data.store": "[ 'ccm.store',{ 'store':'voting_data' } ]",
          "user": "['ccm.instance','https://ccmjs.github.io/akless-components/user/versions/ccm.user-7.0.1.js',['ccm.get','https://ccmjs.github.io/akless-components/user/resources/configs.js','guest']]"
        },
        "onfinish": { "log": true }
      }
    ],
    "store": [ "ccm.store", { "store": "voting" } ],
    "url": "../voting/ccm.voting.js"
  }
};