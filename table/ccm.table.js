/**
 * @overview ccm component for table generating
 * @see https://github.com/mozilla/pdf.js/
 * @author Tea Kless <tea.kless@web.de>, 2018
 * @license The MIT License (MIT)
 */

{
  var component = {

    /**
     * unique component name
     * @type {string}
     */
    name: 'table',

    /**
     * recommended used framework version
     * @type {string}
     */
    ccm: 'https://akless.github.io/ccm/ccm.js',

    /**
     * default instance configuration
     * @type {object}
     */
    config: {
      html: {
        "table": {
          "class": "container",
          "inner": {
            "tag": "table",
            "class": "table table-striped",
            "inner":[
              {
                "tag": "thead",
                "inner": {
                  "tag": "tr"
                }
              },
              {
                "tag": "tbody"
              }
            ]
          }
        },

        "table_row": { "tag": "tr" },

        "table_cell": { "tag": "td" },

        "table_head": { "tag": "th" }
      },
      table_row: 5,
      table_cell: 3,
      table_head: [ "header_1", "header_2", "header_3", "header_4", "header_5"],
      css: [ "ccm.load", "https://tkless.github.io/ccm-components/lib/bootstrap/css/bootstrap.css",
        { "context": "head", "url": "https://tkless.github.io/ccm-components/lib/bootstrap/css/font-face.css" }
      ]
    },

    Instance: function () {
      /**
       * own reference for inner functions
       * @type {Instance}
       */
      const self = this;

      /**
       * privatized instance members
       * @type {object}
       */
      let my;

      /**
       * shortcut to help functions
       * @type {Object.<string,function>}
       */
      let $;

      this.init = callback => {

        callback();
      };

      this.ready = callback => {
        // set shortcut to help functions
        $ = self.ccm.helper;

        // privatize all possible instance members
        my = $.privatize( self );

        callback();

      };

      /**
       * starts the instance
       * @param {function} [callback] - called after all synchronous and asynchronous operations are complete
       */
      this.start = callback => {

        const table = $.html ( my.html.table );


        if ( my.table_row ) {
          for ( let i = 0 ; i < my.table_row; i++ ) {
            const table_row = $.html ( my.html.table_row );
            if ( my.table_cell ) {
              for ( let j = 0 ; j < my.table_cell; j++ ) {
                const table_cell = $.html ( my.html.table_cell );
                table_cell.innerHTML = "cell_" + j;
                table_row.appendChild( table_cell );
              }
            }
            table.querySelector( 'tbody' ).appendChild( table_row );
          }

          $.setContent( self.element, table );
          if ( callback ) callback();
        }

        else $.setContent( self.element, "Nothig to display" );

        if ( callback ) callback();

      };

    }

  };

  function p(){window.ccm[v].component(component)}const f="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[f])window.ccm.files[f]=component;else{const n=window.ccm&&window.ccm.components[component.name];n&&n.ccm&&(component.ccm=n.ccm),"string"==typeof component.ccm&&(component.ccm={url:component.ccm});var v=component.ccm.url.split("/").pop().split("-");if(v.length>1?(v=v[1].split("."),v.pop(),"min"===v[v.length-1]&&v.pop(),v=v.join(".")):v="latest",window.ccm&&window.ccm[v])p();else{const e=document.createElement("script");document.head.appendChild(e),component.ccm.integrity&&e.setAttribute("integrity",component.ccm.integrity),component.ccm.crossorigin&&e.setAttribute("crossorigin",component.ccm.crossorigin),e.onload=function(){p(),document.head.removeChild(e)},e.src=component.ccm.url}}
}