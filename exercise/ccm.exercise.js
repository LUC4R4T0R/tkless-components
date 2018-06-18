/**
 * @overview ccm component for exercise
 * @author Tea Kless <tea.kless@web.de>, 2018
 * @license The MIT License (MIT)
 */
( function () {

  var component = {

    name: 'exercise',

    ccm: 'https://ccmjs.github.io/ccm/ccm.js',

    config: {
      html: {
        "main": {
          "class": "container-fluid",
          "inner": [
            {
              "id": "task"
            },
            {
              "id": "input",
              "style": "margin-top: 1.5rem;",
            }
          ]
        },
        "submit": {
          "tag": "input",
          "type": "button",
          "id": "button-submit",
          "class": "btn btn-default pull-right",
          "style": "margin-top: 1.0rem;",
          "onclick": "%submit%"
        }
      },

      //"task": "<h1>Einleitung</h1>",
      //"submit_button": true,
      //onfinish
      "editor": [ "ccm.component", "https://ccmjs.github.io/tkless-components/editor/versions/ccm.editor-2.0.0.js", {
        "settings.modules.toolbar": false
      } ],

      "content": [ "ccm.component", "https://ccmjs.github.io/akless-components/content/versions/ccm.content-4.0.0.js" ],
      "libs": [ 'ccm.load',
        { "context": "head", "url": "../libs/bootstrap/css/font-face.css" },
        "../libs/bootstrap/css/bootstrap.css"
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

      let editor;

      this.ready = callback => {

        // set shortcut to help functions
        $ = self.ccm.helper;

        // privatize all possible instance members
        my = $.privatize( self );

        if ( self.logger ) self.logger.log( 'ready', my );

        callback();

      };

      /**
       * starts the instance
       * @param {function} [callback] - called after all synchronous and asynchronous operations are complete
       */
      this.start = callback => {

        let main_elem = $.html( my.html.main );

        my.content.start( { inner: ( my.inner && my.inner.innerHTML.trim() !== "" ) ? my.inner : my.task }, instance => {
          $.setContent( main_elem.querySelector( "#task" ), instance.root  );
          getEditor();
        } );

        if ( my.submit_button ) {
          const submit_button = $.html ( my.html.submit, {
            submit: event  => {
              if ( event ) event.preventDefault();
              $.onFinish( self );
            }
          } );
          main_elem.appendChild( submit_button );

          // individual caption for submit button? => set caption of submit button
          if ( typeof my.submit_button === 'string' ) main_elem.querySelector( '#button-submit' ).value = my.submit_button;

        }

        $.setContent( self.element, main_elem );

        if ( callback ) callback();

        function getEditor () {

          my.editor.start( function ( instance ) {
            main_elem.querySelector( '#input' ).appendChild( instance.root );
            editor = instance;
          } );
        }
      };

      this.getValue = () => editor.get().root.innerHTML;
    }
  };

  function p(){window.ccm[v].component(component)}var f="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[f])window.ccm.files[f]=component;else{var n=window.ccm&&window.ccm.components[component.name];n&&n.ccm&&(component.ccm=n.ccm),"string"==typeof component.ccm&&(component.ccm={url:component.ccm});var v=component.ccm.url.split("/").pop().split("-");if(v.length>1?(v=v[1].split("."),v.pop(),"min"===v[v.length-1]&&v.pop(),v=v.join(".")):v="latest",window.ccm&&window.ccm[v])p();else{var e=document.createElement("script");document.head.appendChild(e),component.ccm.integrity&&e.setAttribute("integrity",component.ccm.integrity),component.ccm.crossorigin&&e.setAttribute("crossorigin",component.ccm.crossorigin),e.onload=function(){p(),document.head.removeChild(e)},e.src=component.ccm.url}}
}() );