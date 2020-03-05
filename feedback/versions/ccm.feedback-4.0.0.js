/**
 * @overview ccm component for feedback
 * @author Tea Kless <tea.kless@web.de>, 2019
 * @license The MIT License (MIT)
 * @version 4.0.0
 * @changes
 *  * version 4.0.0 (25.09.2019)
 * - uses click event insteed of hover to slide feedabck in or out (only with right.css )
 * version 3.0.0 (07.01.2019)
 * - uses ccm v18.0.0
 */

( function () {

  const component = {

    name: 'feedback',
    version: [ 4,0,0 ],

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.0.0.js',

    config: {
      "html": {
        "feedback": {
          "id": "slideout",
          "inner": [
            {
              "tag": "img",
              "src": "https://ccmjs.github.io/tkless-components/feedback/resources/feedback.png",
              "alt": "feedback",
              "onclick": '%slide_in_out%'
            },
            {
              "id": "slideout-inner",
              "inner":[
                {
                  "class": "row panel panel-success",
                  "inner": {
                    "tag": "form",
                    "onsubmit": "%submit%",
                    "inner": [
                      {
                        "class": "panel-body",
                        "inner": [
                          {
                          "class": "form-group",
                            "inner": [
                              {
                                "tag": "label",
                                "for": "Title",
                                "inner": "Title"
                              },
                              {
                                "tag": "input",
                                "type": "text",
                                "required": true,
                                "class": "form-control",
                                "id": "Title"
                              },
                            ]
                          },
                          {
                            "class": "form-group",
                            "inner": {
                              "tag": "textarea",
                              "required": true,
                              "rows": "5",
                              "class": "form-control",
                              "placeholder": "Your Feedback..."
                            }
                          },
                          {
                            "class": "form-group",
                            "inner": {
                              "tag": "button",
                              "class": "btn btn-info btn-sm pull-right",
                              "typ": "submit",
                              "inner": "Submit"
                            }
                          }
                        ]
                      }
                    ]
                  }
                }
             ]
            }
          ]
        }
      },
      //"data": { "store": [ "ccm.store", {} ] },
      css: [ "ccm.load", "https://ccmjs.github.io/tkless-components/feedback/resources/right.css" ], //'https://ccmjs.github.io/tkless-components/feedback/resources/left.css'
      bootstrap: [ 'ccm.load',
        { context: "head", url: "https://ccmjs.github.io/tkless-components/libs/bootstrap/css/font-face.css" },
        "https://ccmjs.github.io/tkless-components/libs/bootstrap/css/bootstrap.css"
      ]
    },

    Instance: function () {
      let $;
      let self = this;

      this.ready = async () => {
        $ = self.ccm.helper;
      };

      this.start = async () => {

          if ( self.logger ) self.logger.log( 'start' );

          let slide_out = false;

          $.setContent( self.element, self.ccm.helper.html( self.html.feedback, {
            slide_in_out: () => {
              if ( !slide_out ) {
                self.element.querySelector( '#slideout' ).style.right = '250px';
                self.element.querySelector( '#slideout-inner' ).style.right = '-0px';
                slide_out = true;
              }
              else {
                self.element.querySelector( '#slideout' ).style.right = '-0px';
                self.element.querySelector( '#slideout-inner' ).style.right = '-250px';
                slide_out = false;
              }
            },
            submit: async ( event ) => {
             event.preventDefault();

              let data = {
                "title": self.element.querySelector( 'input[type=text]' ).value,
                "content": self.element.querySelector( 'textarea' ).value
              };

              // update dataset
              await self.data.store.set( data );

              if ( self.logger ) self.logger.log( 'create', $.clone ( data ) );

              // visual effect, that the feedback was saved successfully
              if ( self.element.querySelector( '.saved' ) ) $.removeElement( self.element.querySelector( '.saved' ) );
              self.element.querySelector( '.panel-body' ).appendChild( $.html( {
                "tag": "strong",
                "class": "text-success saved",
                "inner": "Saved <span class='glyphicon glyphicon-saved'></span>"
              } ) );
              self.element.querySelector( 'form' ).reset();
            }
          } ));

          // change feedback position from above
          if ( self.from_above ) {
            self.element.querySelector( '#slideout' ).style.top = self.from_above+'%';
            self.element.querySelector( '#slideout-inner' ).style.top = self.from_above+'%';
          }

      };

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
