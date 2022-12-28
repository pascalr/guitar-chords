<h1>Record rythm</h1>

<textarea value={rythm} on:keypress={tap} on:keyup={release} rows="15" cols="80"></textarea>
<br/>
<button type='button' on:click="{startRecordRythm}">Start</button>
<button type='button' on:click="{stopRecordRythm}">Stop</button>

<script>
let rythm = ''
let recordInterval;
let delayMs = 500
let first;
let taps = []
let releases = []

function tap(e) {
  e.preventDefault()
  if (first && taps.length - releases.length < 1) {
    let now = Date.now()
    console.log('tap', now-first)
    taps.push(now-first)
  }
}

/**
 * Calculate the interval between every tap.
 */
function calcIntervals() {
  let intervals = []
  for (let i = 1; i < taps.length; i++) {
    intervals.push(taps[i]-taps[i-1])
  }
  console.log('intervals', intervals)
  return intervals
}

function mean(ary) {
  if (ary.length == 0) {return 0}
  let sum = 0;
  for (let i = 0; i < ary.length; i++) {
    sum += ary[i]
  }
  return sum/ary.length
}

function guessMinimalInterval(intervals, initialGuess) {
  let guesses = []
  for (let i = 0; i < intervals.length; i++) {
    let r = intervals[i]/initialGuess
    let mul = Math.round(r)
    guesses.push(intervals[i]/mul)
  }
  return mean(guesses)
}

function analyze() {
  if (taps.length >= 2) {
    let intervals = calcIntervals()
    let guess = Math.min(...intervals)
    console.log('initial', guess)
    for (let i = 0; i < 10; i++) {
      guess = guessMinimalInterval(intervals, guess)
    }
    let interval = guess
    let nbNotes = Math.round(taps.at(-1) / interval)
    rythm = '-'.repeat(nbNotes)
  }
}

function release() {
  if (!first) {
    console.log('first')
    first = Date.now()
  } else {
    let now = Date.now()
    console.log('release', now-first)
    releases.push(now-first)
    analyze()
  }
}

function startRecordRythm() {
  if (!recordInterval) {
    recordInterval = setInterval(() => {
    }, delayMs)
  }
}
function stopRecordRythm() {
  if (recordInterval) {clearInterval(recordInterval)}
}
</script>
