ccm.files[ "configs.js" ] = {
  "demo": {
    data: { store: [ 'ccm.store', { 'store': 'comment', 'url': 'https://ccm.inf.h-brs.de' } ], key: 'demo' },
  },

  "localhost": {
    "from_above": "30%",
    data: { store: [ 'ccm.store', { 'store': 'comment', 'url': 'http://localhost:8080' } ], key: 'demo' }
  }
};