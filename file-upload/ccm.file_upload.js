/**
 * @overview ccm component for saving given files as data in ccm datasore
 * @author Tea Kless <tea.kless@web.de>, 2017
 * @license The MIT License (MIT)
 */

( function () {

  var component = {

    name: 'file_upload',

    ccm: 'https://akless.github.io/ccm/ccm.js',

    config: {
      templates: {
        "file_upload": {
          "class": "container",
          "inner": {
            "tag": "form",
            "class": "box has-advanced-upload",
            "inner": [
              {
                "class": "box-input",
                "inner":[
                  {
                    "id": "preview"
                  },
                  {
                    "tag" : "span",
                    "inner": [
                      {
                        "tag": "label",
                        "for": "file",
                        "inner":[
                          {
                            "tag": "span",
                            "class": "glyphicon glyphicon-cloud-upload col-md-12"
                          },
                          {
                            "tag": "strong",
                            "inner": "Choose a file",
                          },
                          {
                            "tag": "span",
                            "class":"box-dragndrop",
                            "inner": " or drag it here."
                          },
                          {
                            "tag": "input",
                            "type":"file",
                            "id": "file",
                            "class": "box-file",
                            "name": "files[]",
                            "data-multiple-caption": "{count} files selected",
                            "multiple": true
                          },
                          {
                            "tag": "button",
                            "class": "btn btn-info btn-lg box-button",
                            "type": "submit",
                            "inner": "Upload"
                          }
                        ]
                      },
                    ]
                  }
                ]
              }
            ]
          }
        }

      },
      data: { store: [ 'ccm.store' ], key: 'demo' },
      libs: [ 'ccm.load',
       { context: 'head', url: '../../ccm-components/lib/bootstrap/css/font-face.css' },
        '../../ccm-components/lib/bootstrap/css/bootstrap.css',
        '../file-upload/resources/default.css'
      ]
    },

    Instance: function () {

      this.ready = callback => {
        $ = this.ccm.helper;
        callback();
      };


      this.start = callback  => {

        $.setContent( this.element, $.html( this.templates.file_upload ) );

        let element = this.element;
        let inputs = element.querySelector( '.box-file' );
        inputs.addEventListener( 'change', previewFiles );

        function previewFiles() {

          let preview = element.querySelector('#preview');
          let files   = element.querySelector('input[type=file]').files;

          function readAndPreview(file) {

            // Make sure `file.name` matches extensions criteria
            if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
              let reader = new FileReader();

              reader.addEventListener("load", function () {
                let image = new Image();
                image.height = 120;
                image.width = 120;
                image.title = file.name;
                image.src = this.result;
                preview.appendChild( image );
              }, false);

              reader.readAsDataURL(file);
            }

          }

          if (files) {
            [].forEach.call(files, readAndPreview);
          }

        }

        if ( callback ) callback;
      };
    }
  };

  function p(){window.ccm[v].component(component)}var f="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[f])window.ccm.files[f]=component;else{var n=window.ccm&&window.ccm.components[component.name];n&&n.ccm&&(component.ccm=n.ccm),"string"==typeof component.ccm&&(component.ccm={url:component.ccm});var v=component.ccm.url.split("/").pop().split("-");if(v.length>1?(v=v[1].split("."),v.pop(),"min"===v[v.length-1]&&v.pop(),v=v.join(".")):v="latest",window.ccm&&window.ccm[v])p();else{var e=document.createElement("script");document.head.appendChild(e),component.ccm.integrity&&e.setAttribute("integrity",component.ccm.integrity),component.ccm.crossorigin&&e.setAttribute("crossorigin",component.ccm.crossorigin),e.onload=function(){p(),document.head.removeChild(e)},e.src=component.ccm.url}}
}() );