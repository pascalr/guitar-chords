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
})
</script>
