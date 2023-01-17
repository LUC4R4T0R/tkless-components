import{html,render}from"https://ccmjs.github.io/tkless-components/libs/lit/lit.js";export{render};export function main(instance,events){const slide_data=instance.ignore.slides[instance.slide_nr-1]||{};return html`
    <main>
      <header></header>
      <section id="viewer"></section>
      <section id="control" ?data-hidden=${!instance.description&&!slide_data.audio&&!instance.comment}>
        <div title="${instance.text.description||""}" data-lang="description-title" ?data-hidden=${!instance.description}>
          <i class="bi bi-sticky${instance.open==="description"||instance.open==="both"?"-fill":""}" ?disabled=${!slide_data.description} @click=${events.onDescription}></i>
        </div>
        <audio src="${slide_data.audio||""}" controls ?data-invisible=${!slide_data.audio}></audio>
        <div title="${instance.text.comments||""}" data-lang="comments-title" ?data-hidden=${!instance.comment}>
          <i class="bi bi-chat-square-text${instance.open==="comments"||instance.open==="both"?"-fill":""}" ?disabled=${slide_data.commentary===false} @click=${events.onComments}></i>
        </div>
      </section>
      <section id="description" ?data-hidden=${!instance.description||!slide_data.description||instance.open!=="description"&&instance.open!=="both"}></section>
      <section id="comments" ?data-hidden=${!instance.comment||slide_data.commentary===false||instance.open!=="comments"&&instance.open!=="both"}></section>
    </main>
  `}export const image='<img src="%%">';export const video='<video src="%%" controls>';
//# sourceMappingURL=templates-v1.min.mjs.map