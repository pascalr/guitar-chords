import Metronome from "./metronome.svelte";
import Guitar from "./guitar.svelte";
import RecordRythm from "./record_rythm.svelte";

const recordRythm = new RecordRythm({
  target: document.getElementById('record_rythm'),
  props: {
    name: "world",
  },
});

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
