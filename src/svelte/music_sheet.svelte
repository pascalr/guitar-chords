<div id='test'></div>

<script>
import { onMount } from "svelte";
import { Vex } from 'vexflow'

console.log('here')
onMount(() => {
  console.log('there')
  const { Factory, EasyScore, System } = Vex.Flow;

  const vf = new Factory({
    renderer: { elementId: 'test', width: 500, height: 200 },
  });
  
  const score = vf.EasyScore();
  const system = vf.System();
  
  system
    .addStave({
      voices: [
        score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
        score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
      ],
    })
    .addClef('treble')
    .addTimeSignature('4/4');

  //ctx.setStrokeStyle('blue');
  //ctx.setFillStyle('blue');
  
  vf.draw();
})
</script>
