import Metronome from "./metronome.svelte";
import Guitar from "./guitar.svelte";
import RecordRythm from "./record_rythm.svelte";
import MusicSheet from "./music_sheet.svelte";

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

const musicSheet = new MusicSheet({
  target: document.getElementById('music_sheet'),
  props: {
    name: "world",
  },
});

//export default metronome;
