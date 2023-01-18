/**
 * @overview HTML templates of ccmjs-based web component for slidecast with commentary
 * @author André Kless <andre.kless@web.de> 2021-2022
 * @version latest (v1)
 */

import { html, render } from 'https://ccmjs.github.io/tkless-components/libs/lit/lit.js';
export { render };

/**
 * returns the main HTML template
 * @param {Object} instance - ccmjs-based instance for slidecast with commentary
 * @param {Object.<string,Function>} events - contains all event handlers
 * @returns {TemplateResult} main HTML template
 */
export function main( instance, events ) {

  /**
   * slide data
   * @type {Object}
   */
  const slide_data = instance.ignore.slides[ instance.slide_nr - 1 ] || {};

  return html`
    <main class="${ instance.isFullscreen ? 'fullscreen' : '' }">
      <header ?data-hidden=${instance.isFullscreen}></header>
      <section id="viewer"></section>
      <section id="control" @mouseenter="${events.onHoverControls}" @mouseleave="${events.onLeaveControls}"  class="bar" ?data-hidden=${ !instance.description && !slide_data.audio && !instance.comment }>
        <div id="control-gap-filler"></div>
        <div title="${ instance.text.description || '' }" class="button"  data-lang="description-title" ?data-hidden=${ !instance.description || instance.isFullscreen }>
          <i class="bi bi-sticky${ instance.open === 'description' || instance.open === 'both' ? '-fill' : '' }" ?disabled=${ !slide_data.description } @click=${ events.onDescription }></i>
        </div>
        <div title="${ instance.text.comments || '' }" class="button" data-lang="comments-title" ?data-hidden=${ !instance.comment || instance.isFullscreen }>
          <i class="bi bi-chat-square-text${ instance.open === 'comments' || instance.open === 'both' ? '-fill' : '' }" ?disabled=${ slide_data.commentary === false } @click=${ events.onComments }></i>
        </div>
        <div id="audio-player"></div>
        <div id="settings">
          <div id="settings-button" class="button" @click=${events.onToggleSettings} title="Settings" role="button">
            <i class="bi bi-gear${ instance.displaySettings ? '-fill' : '' }" ></i>
          </div>
          <div id="settings-popup" ?hidden=${!instance.displaySettings}>
            <div class="row">
              <label>Playback Rate</label>
              <div  class="controls">
                <input type="range" class="form-range" value="1" min="0.5" max="2" step="0.25" @input="${events.onChangePlaybackRate}" >
                <span>&#215;${instance.audio_player.playbackRate}</span>
              </div>
            </div>
            <div class="row">
              <label>Slide-change Interval</label>
              <div class="controls">
                <input type="range" class="form-range" value="0" min="0" max="10000" step="1000" @input="${events.onChangeSlideChangeInterval}" >
                <span>${instance.slideChangeInterval / 1000} s</span>
              </div>
            </div>
          </div>
        </div>
        <div id="autoplay-on" class="button" @click=${events.onDisableAutoPlay} ?hidden=${!instance.auto_play} title="Autoplay" role="button">
          <i class="bi bi-collection-play" ></i>
        </div>
        <div id="autoplay-off" class="button" @click=${events.onEnableAutoPlay}  ?hidden=${instance.auto_play} title="Manual Playback" role="button">
          <i class="bi bi-play-btn" ></i>
        </div>
        <div id="fullscreen" class="button" @click=${events.onToggleFullscreen} title="Fullscreen" role="button">
          <i class="bi bi-fullscreen${ instance.isFullscreen ? '-exit' : '' }" ></i>
        </div>
      </section>
      <section id="recorder" class="bar" ?data-hidden=${ !instance.edit_mode || instance.isFullscreen }>
        <div id="audio-recorder"></div>
        <div id="rec-del">
          <div id="revert-recording" class="button" @click=${events.onRevertRecording} role="button"
               ?hidden="${false}" title="Revert Recording"  ?data-hidden=${ !slide_data.newAudio }>
            <i class="bi bi-arrow-counterclockwise"></i>
          </div>
          <div id="delete-recording" class="button" @click=${events.onDeleteRecording} role="button"
               ?hidden="${false}" title="Delete Recording" ?data-hidden=${ !slide_data.audio }>
            <i class="bi bi-trash"></i>
          </div>
        </div>
      </section>
      <section id="description" ?data-hidden=${ instance.isFullscreen || !instance.description || !slide_data.description || instance.open !== 'description' && instance.open !== 'both' }></section>
      <section id="comments" ?data-hidden=${ instance.isFullscreen || !instance.comment || slide_data.commentary === false || instance.open !== 'comments' && instance.open !== 'both' }></section>
    </main>
  `;
}

/**
 * returns the HTML template for an image
 * @type {string}
 */
export const image = '<img src="%%">';

/**
 * returns the HTML template for a video
 * @type {string}
 */
export const video = '<video src="%%" controls>';
