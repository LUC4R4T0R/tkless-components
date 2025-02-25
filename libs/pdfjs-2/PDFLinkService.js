"use strict";

/*
 * The following section is an excerpt of the sourcecode of pdf.js by the Mozilla foundation.
 * It was slightly modified to fit the needs of ccm.
 */

/* Copyright 2012-2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

( () => {
  const DEFAULT_LINK_REL = "noopener noreferrer nofollow";

  const LinkTarget = {
    NONE: 0, // Default value.
    SELF: 1,
    BLANK: 2,
    PARENT: 3,
    TOP: 4,
  };

  const NullCharactersRegExp = /\x00/g;
  const InvisibleCharactersRegExp = /[\x01-\x1F]/g;

  /**
   * @param {string} str
   * @param {boolean} [replaceInvisible]
   */
  function removeNullCharacters(str, replaceInvisible = false) {
    if (typeof str !== "string") {
      console.error(`The argument must be a string.`);
      return str;
    }
    if (replaceInvisible) {
      str = str.replace(InvisibleCharactersRegExp, " ");
    }
    return str.replace(NullCharactersRegExp, "");
  }

  /**
   * Helper function to parse query string (e.g. ?param1=value&param2=...).
   * @param {string} query
   * @returns {Map}
   */
  function parseQueryString(query) {
    const params = new Map();
    for (const [key, value] of new URLSearchParams(query)) {
      params.set(key.toLowerCase(), value);
    }
    return params;
  }

  const addLinkAttributes = (link, { url, target = "", rel, enabled = true } = {}) =>  {
    if (!url || typeof url !== "string") {
      throw new Error('A valid "url" parameter must provided.');
    }

    const urlNullRemoved = removeNullCharacters(url);
    if (enabled) {
      link.href = link.title = urlNullRemoved;
    } else {
      link.href = "";
      link.title = `Disabled: ${urlNullRemoved}`;
      link.onclick = () => {
        return false;
      };
    }

    let targetStr = ""; // LinkTarget.NONE
    switch (target) {
      case LinkTarget.NONE:
        break;
      case LinkTarget.SELF:
        targetStr = "_self";
        break;
      case LinkTarget.BLANK:
        targetStr = "_blank";
        break;
      case LinkTarget.PARENT:
        targetStr = "_parent";
        break;
      case LinkTarget.TOP:
        targetStr = "_top";
        break;
    }
    link.target = targetStr;

    link.rel = typeof rel === "string" ? rel : DEFAULT_LINK_REL;
  };

  ccm.files[ "PDFLinkService.js" ] = class PDFLinkService {
    #pagesRefCache = new Map();

    /**
     * @param {object} options
     */
    constructor({
                  eventBus,
                  externalLinkTarget = null,
                  externalLinkRel = null,
                  ignoreDestinationZoom = false,
                } = {}) {
      this.eventBus = eventBus;
      this.externalLinkTarget = externalLinkTarget;
      this.externalLinkRel = externalLinkRel;
      this.externalLinkEnabled = true;
      this._ignoreDestinationZoom = ignoreDestinationZoom;

      this.baseUrl = null;
      this.pdfDocument = null;
      this.pdfViewer = null;
      this.pdfHistory = null;
    }

    setCcmInstance(instance){
      this.ccmInstance = instance;
    }

    setDocument(pdfDocument, baseUrl = null) {
      this.baseUrl = baseUrl;
      this.pdfDocument = pdfDocument;
      this.#pagesRefCache.clear();
    }

    /**
     * @type {number}
     */
    get pagesCount() {
      return this.pdfDocument ? this.pdfDocument.numPages : 0;
    }

    /**
     * @type {number}
     */
    get page() {
      return this.ccmInstance?.getPage();
    }

    /**
     * @param {number} value
     */
    set page(value) {
      this.ccmInstance?.events.onJump({target:{value}});
    }

    /**
     * @type {number}
     */
    get rotation() {
      console.info('pdf rotation not implemented!');
    }

    /**
     * @param {number} value
     */
    set rotation(value) {
      console.info('pdf rotation not implemented!');
    }

    #goToDestinationHelper(rawDest, namedDest = null, explicitDest) {
      // Dest array looks like that: <page-ref> </XYZ|/FitXXX> <args..>
      const destRef = explicitDest[0];
      let pageNumber;

      if (typeof destRef === "object" && destRef !== null) {
        pageNumber = this._cachedPageNumber(destRef);

        if (!pageNumber) {
          // Fetch the page reference if it's not yet available. This could
          // only occur during loading, before all pages have been resolved.
          this.pdfDocument
              .getPageIndex(destRef)
              .then(pageIndex => {
                this.cachePageRef(pageIndex + 1, destRef);
                this.#goToDestinationHelper(rawDest, namedDest, explicitDest);
              })
              .catch( () => {
                console.error(
                    `PDFLinkService.#goToDestinationHelper: "${destRef}" is not ` +
                    `a valid page reference, for dest="${rawDest}".`
                );
              });
          return;
        }
      } else if (Number.isInteger(destRef)) {
        pageNumber = destRef + 1;
      } else {
        console.error(
            `PDFLinkService.#goToDestinationHelper: "${destRef}" is not ` +
            `a valid destination reference, for dest="${rawDest}".`
        );
        return;
      }
      if (!pageNumber || pageNumber < 1 || pageNumber > this.pagesCount) {
        console.error(
            `PDFLinkService.#goToDestinationHelper: "${pageNumber}" is not ` +
            `a valid page number, for dest="${rawDest}".`
        );
        return;
      }

      this.ccmInstance?.events.onJump({target:{value:pageNumber}});
    }

    /**
     * This method will, when available, also update the browser history.
     *
     * @param {string|Array} dest - The named, or explicit, PDF destination.
     */
    async goToDestination(dest) {
      if (!this.pdfDocument) {
        return;
      }
      let namedDest, explicitDest;
      if (typeof dest === "string") {
        namedDest = dest;
        explicitDest = await this.pdfDocument.getDestination(dest);
      } else {
        namedDest = null;
        explicitDest = await dest;
      }
      if (!Array.isArray(explicitDest)) {
        console.error(
            `PDFLinkService.goToDestination: "${explicitDest}" is not ` +
            `a valid destination array, for dest="${dest}".`
        );
        return;
      }
      this.#goToDestinationHelper(dest, namedDest, explicitDest);
    }

    /**
     * This method will, when available, also update the browser history.
     *
     * @param {number} val - The page number.
     */
    goToPage(val) {
      if (!this.pdfDocument) {
        return;
      }
      const pageNumber = val | 0;
      if (
          !(
              Number.isInteger(pageNumber) &&
              pageNumber > 0 &&
              pageNumber <= this.pagesCount
          )
      ) {
        console.error(`PDFLinkService.goToPage: "${val}" is not a valid page.`);
        return;
      }

      this.ccmInstance?.events.onJump({target:{value:pageNumber}});
    }

    /**
     * Wrapper around the `addLinkAttributes` helper function.
     * @param {HTMLAnchorElement} link
     * @param {string} url
     * @param {boolean} [newWindow]
     */
    addLinkAttributes(link, url, newWindow = false) {
      addLinkAttributes(link, {
        url,
        target: (this.ccmInstance?.force_target_blank || newWindow) ? LinkTarget.BLANK : this.externalLinkTarget,
        rel: this.externalLinkRel,
        enabled: this.externalLinkEnabled,
      });
    }

    /**
     * @param {string|Array} dest - The PDF destination object.
     * @returns {string} The hyperlink to the PDF object.
     */
    getDestinationHash(dest) {
      if (typeof dest === "string") {
        if (dest.length > 0) {
          return this.getAnchorUrl("#" + escape(dest));
        }
      } else if (Array.isArray(dest)) {
        const str = JSON.stringify(dest);
        if (str.length > 0) {
          return this.getAnchorUrl("#" + escape(str));
        }
      }
      return this.getAnchorUrl("");
    }

    /**
     * Prefix the full url on anchor links to make sure that links are resolved
     * relative to the current URL instead of the one defined in <base href>.
     * @param {string} anchor - The anchor hash, including the #.
     * @returns {string} The hyperlink to the PDF object.
     */
    getAnchorUrl(anchor) {
      return (this.baseUrl || "") + anchor;
    }

    /**
     * @param {string} hash
     */
    setHash(hash) {
      if (!this.pdfDocument) {
        return;
      }
      let pageNumber, dest;
      if (hash.includes("=")) {
        const params = parseQueryString(hash);
        if (params.has("search")) {
          this.eventBus.dispatch("findfromurlhash", {
            source: this,
            query: params.get("search").replace(/"/g, ""),
            phraseSearch: params.get("phrase") === "true",
          });
        }
        // borrowing syntax from "Parameters for Opening PDF Files"
        if (params.has("page")) {
          pageNumber = params.get("page") | 0 || 1;
        }
        if (params.has("zoom")) {
          // Build the destination array.
          const zoomArgs = params.get("zoom").split(","); // scale,left,top
          const zoomArg = zoomArgs[0];
          const zoomArgNumber = parseFloat(zoomArg);

          if (!zoomArg.includes("Fit")) {
            // If the zoomArg is a number, it has to get divided by 100. If it's
            // a string, it should stay as it is.
            dest = [
              null,
              { name: "XYZ" },
              zoomArgs.length > 1 ? zoomArgs[1] | 0 : null,
              zoomArgs.length > 2 ? zoomArgs[2] | 0 : null,
              zoomArgNumber ? zoomArgNumber / 100 : zoomArg,
            ];
          } else {
            if (zoomArg === "Fit" || zoomArg === "FitB") {
              dest = [null, { name: zoomArg }];
            } else if (
                zoomArg === "FitH" ||
                zoomArg === "FitBH" ||
                zoomArg === "FitV" ||
                zoomArg === "FitBV"
            ) {
              dest = [
                null,
                { name: zoomArg },
                zoomArgs.length > 1 ? zoomArgs[1] | 0 : null,
              ];
            } else if (zoomArg === "FitR") {
              if (zoomArgs.length !== 5) {
                console.error(
                    'PDFLinkService.setHash: Not enough parameters for "FitR".'
                );
              } else {
                dest = [
                  null,
                  { name: zoomArg },
                  zoomArgs[1] | 0,
                  zoomArgs[2] | 0,
                  zoomArgs[3] | 0,
                  zoomArgs[4] | 0,
                ];
              }
            } else {
              console.error(
                  `PDFLinkService.setHash: "${zoomArg}" is not a valid zoom value.`
              );
            }
          }
        }
        if (dest) {
          this.ccmInstance.events.onJump({target:{value:pageNumber||this.page}});
        } else if (pageNumber) {
          this.page = pageNumber; // simple page
        }
        if (params.has("pagemode")) {
          this.eventBus.dispatch("pagemode", {
            source: this,
            mode: params.get("pagemode"),
          });
        }
        // Ensure that this parameter is *always* handled last, in order to
        // guarantee that it won't be overridden (e.g. by the "page" parameter).
        if (params.has("nameddest")) {
          this.goToDestination(params.get("nameddest"));
        }
      } else {
        // Named (or explicit) destination.
        dest = unescape(hash);
        try {
          dest = JSON.parse(dest);

          if (!Array.isArray(dest)) {
            // Avoid incorrectly rejecting a valid named destination, such as
            // e.g. "4.3" or "true", because `JSON.parse` converted its type.
            dest = dest.toString();
          }
        } catch (ex) {}

        if (
            typeof dest === "string" ||
            PDFLinkService.#isValidExplicitDestination(dest)
        ) {
          this.goToDestination(dest);
          return;
        }
        console.error(
            `PDFLinkService.setHash: "${unescape(
                hash
            )}" is not a valid destination.`
        );
      }
    }

    /**
     * @param {string} action
     */
    executeNamedAction(action) {
      // See PDF reference, table 8.45 - Named action
      switch (action) {
        case "GoBack":
          this.pdfHistory?.back();
          break;

        case "GoForward":
          this.pdfHistory?.forward();
          break;

        case "NextPage":
          this.ccmInstance?.events.onJump({target:{value:this.ccmInstance.getPage() + 1}});
          break;

        case "PrevPage":
          this.ccmInstance?.events.onJump({target:{value:this.ccmInstance.getPage() - 1}});
          break;

        case "LastPage":
          this.page = this.pagesCount;
          break;

        case "FirstPage":
          this.page = 1;
          break;

        default:
          break; // No action according to spec
      }

      this.eventBus.dispatch("namedaction", {
        source: this,
        action,
      });
    }

    /**
     * @param {number} pageNum - page number.
     * @param {Object} pageRef - reference to the page.
     */
    cachePageRef(pageNum, pageRef) {
      if (!pageRef) {
        return;
      }
      const refStr =
          pageRef.gen === 0 ? `${pageRef.num}R` : `${pageRef.num}R${pageRef.gen}`;
      this.#pagesRefCache.set(refStr, pageNum);
    }

    /**
     * @ignore
     */
    _cachedPageNumber(pageRef) {
      if (!pageRef) {
        return null;
      }
      const refStr =
          pageRef.gen === 0 ? `${pageRef.num}R` : `${pageRef.num}R${pageRef.gen}`;
      return this.#pagesRefCache.get(refStr) || null;
    }

    /**
     * @param {number} pageNumber
     */
    isPageVisible(pageNumber) {
      return this.pdfViewer.isPageVisible(pageNumber);
    }

    /**
     * @param {number} pageNumber
     */
    isPageCached(pageNumber) {
      return this.pdfViewer.isPageCached(pageNumber);
    }

    static #isValidExplicitDestination(dest) {
      if (!Array.isArray(dest)) {
        return false;
      }
      const destLength = dest.length;
      if (destLength < 2) {
        return false;
      }
      const page = dest[0];
      if (
          !(
              typeof page === "object" &&
              Number.isInteger(page.num) &&
              Number.isInteger(page.gen)
          ) &&
          !(Number.isInteger(page) && page >= 0)
      ) {
        return false;
      }
      const zoom = dest[1];
      if (!(typeof zoom === "object" && typeof zoom.name === "string")) {
        return false;
      }
      let allowNull = true;
      switch (zoom.name) {
        case "XYZ":
          if (destLength !== 5) {
            return false;
          }
          break;
        case "Fit":
        case "FitB":
          return destLength === 2;
        case "FitH":
        case "FitBH":
        case "FitV":
        case "FitBV":
          if (destLength !== 3) {
            return false;
          }
          break;
        case "FitR":
          if (destLength !== 6) {
            return false;
          }
          allowNull = false;
          break;
        default:
          return false;
      }
      for (let i = 2; i < destLength; i++) {
        const param = dest[i];
        if (!(typeof param === "number" || (allowNull && param === null))) {
          return false;
        }
      }
      return true;
    }
  };
} )();