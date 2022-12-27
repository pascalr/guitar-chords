import Metronome from "./metronome.svelte";
import Guitar from "./guitar.svelte";

const metronome = new Metronome({
  target: document.getElementById('metronome'),
  props: {
    name: "world",
  },
});

const guitar = new Guitar({
  target: document.getElementById('guitar'),
  props: {
    name: "world",
  },
});

//export default metronome;
