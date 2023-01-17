/**
 * @overview HTML templates of ccmjs-based web component for table
 * @author André Kless <andre.kless@web.de> 2022
 * @version latest (v1)
 */

import { html, render, repeat } from 'https://ccmjs.github.io/tkless-components/libs/lit/lit.js';
export { render };

/**
 * Returns the main HTML template.
 * @param {object} app - ccmjs-based app instance for table.
 * @param {(string|number|boolean)[][]} values - Table values
 * @returns {TemplateResult} Main HTML template
 */
export function main( app, values ) {
  values.forEach( ( row, i ) => row.unshift( i + 1 ) );
  return html`
    <form @submit=${ app.events.onSubmit }>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead ?data-hidden=${ !app.col_heads }>
            <tr>
              ${ app.col_heads?.map( title => html`<th scope="col">${ title }</th>` ) }
              ${ app.deletable ? html`<th scope="col"></th>` : '' }
            </tr>
          </thead>
          <tbody ?data-hidden=${ !values }>
            ${ repeat( values, row => row[ 0 ], ( row, i ) => html`
              <tr>
                ${ row.slice( 1 ).map( ( cell, j ) => html`<td @click=${ () => app.events.onClick( i, j ) }>${ ( () => {
                  const col = app.col_settings[ j ];
                  const value = values[ i ][ j+1 ] || '';
                  switch ( col.type || 'none' ) {
                    case 'checkbox':
                    case 'radio':
                      return html`<input type="${ col.type }" name="${ i+1 }-${ j+1 }" .checked=${ value } @change=${ app.events.onChange }>`
                    case 'none':
                      return cell;
                    case 'select':
                      return html`
                        <select name="${ i+1 }-${ j+1 }" @change=${ app.events.onChange }>
                          ${ col.options.map( option => html`
                            <option .selected=${ value === option }>
                              ${ option }
                            </option>
                          ` ) }
                        </select>
                      `;
                    case 'textarea':
                      return html`
                        <textarea name="${ i+1 }-${ j+1 }" @change=${ app.events.onChange }>${ value }</textarea>
                      `;
                    default:
                      return html`<input type="${ col.type }" name="${ i+1 }-${ j+1 }" value="${ value }" @change=${ app.events.onChange }>`
                  }
                } )() }</td>` ) }
                ${ app.deletable ? html`
                  <td>
                    <div class="d-flex align-items-center">
                      <svg width="16" height="16" fill="red" viewBox="0 0 16 16" role="button" @click=${ () => app.events.onDeleteRow( i ) }>
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </div>
                  </td>
                ` : '' }
                ${ app.movable ? html`
                  <td>
                    <div class="d-flex flex-column justify-content-between">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" role="button" ?data-invisible=${ i <= 0 } @click=${ () => app.events.onMoveUp( i ) }>
                        <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                      </svg>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" role="button" ?data-invisible=${ i >= values.length - 1 } @click=${ () => app.events.onMoveDown( i ) }>
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                      </svg>
                    </div>
                  </td>
                ` : '' }
              </tr>
            ` ) }
          </tbody>
        </table>
      </div>
      <div class="mx-3 d-flex justify-content-between align-items-start">
        <button type="submit" class="btn btn-primary" ?data-invisible=${ !app.onfinish }>${ app.text.submit }</button>
        <button type="button" class="btn btn-success btn-sm" ?data-invisible=${ !app.addable } @click=${ app.events.onAddRow }>${ app.text.add }</button>
      </div>
    </form>
 `;
}
