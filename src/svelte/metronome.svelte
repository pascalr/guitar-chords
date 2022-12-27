<h1>Metronome</h1>

<button type="button" on:click="{() => {if (!interval) {interval = setInterval(() => note('A4', 0.5), delayMs)}}}">Start</button>
<button type="button" on:click="{() => {clearInterval(interval); interval = null}}">Stop</button>

<script>

export let interval = null;
export let delayMs = 1000;

import {note} from '../music'

</script>
