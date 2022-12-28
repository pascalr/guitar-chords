<div id='music-sheet-2'></div>

<script>
import { onMount } from "svelte";
import { Vex } from 'vexflow'

onMount(() => {

  const { Renderer, Stave } = Vex.Flow;

  const div = document.getElementById('music-sheet-2');
  const renderer = new Renderer(div, Renderer.Backends.SVG);
  
  // Configure the rendering context.
  renderer.resize(500, 500);
  const context = renderer.getContext();
  context.setFont('Arial', 10);
  let color = 'blue';
  context.setStrokeStyle(color);
  context.setFillStyle(color);
  
  // Create a stave of width 400 at position 10, 40.
  const stave = new Stave(10, 40, 400);
  
  // Add a clef and time signature.
  stave.addClef('treble').addTimeSignature('4/4');
  
  // Connect it to the rendering context and draw!
  stave.setContext(context).draw();
})
</script>
