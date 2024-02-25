<div bind:this={divElem} id='music-sheet-2'></div>

<script>
import { onMount } from "svelte";
import { Vex } from 'vexflow'
let divElem;

onMount(() => {

  const { Renderer, Stave } = Vex.Flow;

  const renderer = new Renderer(divElem, Renderer.Backends.SVG);
  
  renderer.resize(500, 500);
  const context = renderer.getContext();
  context.setFont('Arial', 10);
  let color = 'yellow';
  context.setStrokeStyle(color);
  context.setFillStyle(color);
  
  const stave = new Stave(10, 40, 400);
  stave.addClef('treble').addTimeSignature('4/4');
  stave.setContext(context).draw();

  // This does not work I don't know why...
  //const notes = [
  //    // A quarter-note C.
  //    new StaveNote({ keys: ["c/4"], duration: "q" }),
  //
  //    // A quarter-note D.
  //    new StaveNote({ keys: ["d/4"], duration: "q" }),
  //
  //    // A quarter-note rest. Note that the key (b/4) specifies the vertical
  //    // position of the rest.
  //    new StaveNote({ keys: ["b/4"], duration: "qr" }),
  //
  //    // A C-Major chord.
  //    new StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
  //];
  //
  //// Create a voice in 4/4 and add above notes
  //const voice = new Voice({ num_beats: 4, beat_value: 4 });
  //voice.addTickables(notes);
  //
  //// Format and justify the notes to 400 pixels.
  //new Formatter().joinVoices([voice]).format([voice], 350);
  //
  //// Render voice
  //voice.draw(context, stave);
})
</script>
