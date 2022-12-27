import Metronome from "./metronome.svelte";

const metronome = new Metronome({
  target: document.getElementById('metronome'),
  props: {
    name: "world",
  },
});

export default metronome;
