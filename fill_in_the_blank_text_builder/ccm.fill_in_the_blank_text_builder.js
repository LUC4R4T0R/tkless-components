/**
 * @overview ccm component for real time  Forum
 * @author Tea Kless <tea.kless@web.de>, 2017
 * @license The MIT License (MIT)
 */

( function () {

  var ccm_version = '9.0.0';
  var ccm_url     = 'https://akless.github.io/ccm/ccm.min.js';

  var component_name = 'fill_in_the_blank_text_builder';
  var component_obj  = {
    name: component_name,

    config: {
      templates: {
        "main": {
          "class": "container",
          "inner": [
            {
              "class": "page-header",
              "inner": {
                "tag": "h1",
                "class": "text-primary",
                "inner": [
                  "Build your fill in the blank-text "
                ]
              }
            },
            {
              "tag": "form",
              "class": "form-horizontal",
              "onsubmit": "%submit%",
              "inner": [
                {
                  "class": "sign-on form-group",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2",
                      "inner": "Sign-on:"
                    },
                    {
                      "class": "col-md-10",
                      "inner": {
                        "tag": "select",
                        "class": "form-control",
                        "name": "user_sign_on",
                        "inner": [
                          {
                            "tag":"option",
                            "inner": "None"
                          },
                          {
                            "tag":"option",
                            "inner": "Guest Mode",
                            "value": "['ccm.instance','https://akless.github.io/ccm-components/user/ccm.user.js',{'sign_on':'guest'}]"
                          },
                          {
                            "tag":"option",
                            "inner": "Demo Mode",
                            "value": "['ccm.instance','https://akless.github.io/ccm-components/user/ccm.user.js',{'sign_on':'demo'}]"
                          },
                          {
                            "tag":"option",
                            "inner": "H-BRS FB02",
                            "value": "['ccm.instance','https://akless.github.io/ccm-components/user/ccm.user.js',{'sign_on':'hbrsinfkaul'}]"
                          }
                        ]
                      }
                    }
                  ]
                },
                {
                  "class": "layout form-group",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2",
                      "inner": "Layout:"
                    },
                    {
                      "class": "col-md-10",
                      "inner": {
                        "tag": "select",
                        "class": "form-control",
                        "name": "css_layout",
                        "inner": [
                          {
                            "tag":"option",
                            "inner": "Default",
                            "value": "['ccm.load','https://akless.github.io/ccm-components/cloze/resources/default.css']"
                          },
                          {
                            "tag":"option",
                            "inner": "LEA-like",
                            "value": "['ccm.load','https://akless.github.io/ccm-components/cloze/resources/lea.css']"
                          }
                        ]
                      }
                    }
                  ]
                },
                {
                  "class": "solution form-group",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2",
                      "inner": "Provided answers"
                    },
                    {
                      "class": "col-md-10",
                      "inner": {
                        "tag": "select",
                        "class": "select-solution form-control",
                        "onchange": "%select%",
                        "inner": [
                          {
                            "tag":"option",
                            "inner": "None",
                            "value": "none"
                          },
                          {
                            "tag":"option",
                            "inner": "Auto generated",
                            "value": "auto"
                          },
                          {
                            "tag":"option",
                            "inner": "Manually",
                            "value": "manually"
                          }
                        ]
                      }
                    }
                  ]
                },
                {
                  "class": "manually form-group",
                  "style": "display: none",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2",
                      "inner": "Manually:"
                    },
                    {
                      "class": "col-md-10",
                      "inner": {
                        "id": "tokenfield",
                        "tag": "input",
                        "type": "text",
                        "class": "form-control",
                        "autocomplete": "false",
                        "placeholder": "type something and hit enter"
                      }
                    }

                  ]
                },
                {
                  "class": "gaps form-group",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2",
                      "inner": "Blank gaps:"
                    },
                    {
                      "class": "col-md-10",
                      "inner": {
                        "class": "checkbox",
                        "inner": {
                          "tag": "label",
                          "inner": {
                            "tag": "input",
                            "type": "checkbox",
                            "name": "blank"
                          }
                        }
                      }
                    }

                  ]
                },
                {
                  "class": "case-warming form-group",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2",
                      "inner": "Letter case warning:"
                    },
                    {
                      "class": "col-md-10",
                      "inner": {
                        "class": "checkbox",
                        "inner": {
                          "tag": "label",
                          "inner": {
                            "tag": "input",
                            "type": "checkbox",
                            "name": "ignore_case"
                          }
                        }
                      }
                    }

                  ]
                },
                {
                  "class": "gap-point form-group",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2",
                      "inner": "Points per gap:"
                    },
                    {
                      "class": "col-md-10",
                      "inner": {
                        "tag": "input",
                        "type":"number",
                        "class": "form-control",
                        "name": "points",
                        "placeholder": "points in number"
                      }
                    }
                  ]
                },
                {
                  "class": "time-limit form-group",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2",
                      "inner": "Time Limit:"
                    },
                    {
                      "class": "col-md-10",
                      "inner": {
                        "tag": "input",
                        "type":"number",
                        "class": "form-control",
                        "name": "time",
                        "placeholder": "time in seconds"
                      }
                    }
                  ]
                },
                {
                  "class": "editor form-group",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2",
                      "inner": "Your Text:"
                    },
                    {
                      "class": "col-md-10",
                      "id": "editor-container"
                    }
                  ]
                },
                {
                  "class": "submit-button form-group",
                  "inner": [
                    {
                      "tag": "label",
                      "class": "control-label col-md-2"
                    },
                    {
                      "class": "col-md-10",
                      "inner": {
                        "tag": "button",
                        "type": "submit",
                        "class": "btn btn-primary",
                        "inner": "Submit"
                      }
                    }
                  ]

                }
              ]
            }
          ]
        }

      },

      editor: [ 'ccm.component', 'https://tkless.github.io/ccm-components/editor/ccm.editor.js',
        { 'settings.modules.toolbar': [
          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          ['bold', 'italic', 'underline'],        // toggled buttons
          ['blockquote', 'code-block'],

          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent

          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          [{ 'align': [] }]
        ],
          'settings.placeholder': 'Type here...'
        }
      ],
      style: [ 'ccm.load', '../fill_in_the_blank_text_builder/style.css' ],
      bootstrap_css: [ 'ccm.load', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css', { url: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css', context:'head' } ]
    },

    Instance: function () {
      var self = this;
      var editor;

      this.start = function (callback) {

        var $ = self.ccm.helper;
        $.setContent( self.element, self.ccm.helper.html( self.templates.main, {
          submit: function ( event ) {
            event.preventDefault();
            var config_data = $.formData( this );
            config_data[ "gap_text" ] = editor.get().root.innerHTML;
            console.log( config_data );
          },
          select: function () {
            if ( self.element.querySelector( '.select-solution' ).value === 'manually' )
              self.element.querySelector( '.manually' ).style.display = 'block';
            else
              self.element.querySelector( '.manually' ).style.display = 'none';
          }
        } ) );

        self.editor.start( { root: self.element.querySelector( '#editor-container' ) }, function ( instance ) {
          editor = instance;
        } );

        if ( callback ) callback();
      };
    }
  };

  var namespace = window.ccm && ccm.components[ component_name ]; if ( namespace ) { if ( namespace.ccm_version ) ccm_version = namespace.ccm_version; if ( namespace.ccm_url ) ccm_url = namespace.ccm_url; }
  if ( !window.ccm || !ccm[ ccm_version ] ) { var tag = document.createElement( 'script' ); document.head.appendChild( tag ); tag.onload = register; tag.src = ccm_url; } else register();
  function register() { ccm[ ccm_version ].component( component_obj ); }
}() );