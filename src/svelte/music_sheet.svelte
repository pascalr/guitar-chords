<div id='music-sheet-2'></div>

<script>
import { onMount } from "svelte";
import { Vex } from 'vexflow'

onMount(() => {

  const { Renderer, Stave } = Vex.Flow;

  const div = document.getElementById('music-sheet-2');
  const renderer = new Renderer(div, Renderer.Backends.SVG);
  
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
