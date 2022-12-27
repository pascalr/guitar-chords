var context = new AudioContext()

export function note(str) {
  console.log('note', str)
  let o = context.createOscillator()
  let g = context.createGain()
  o.connect(g)
  g.connect(context.destination)
  o.frequency.value = freqForNote(str)
  o.start(0)
  //o.type = 'sine' // square, triangle, sawtooth
  g.gain.exponentialRampToValueAtTime(
    0.00001, context.currentTime + 5
  )
}

export function freqForNote(str) {
  console.log('freqForNote', str)
  // A: 440Hz
  let A0 = 440 / 16
  str = str.toUpperCase()
  let letter = str[0]
  let map = {A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10}
  let mod = str[1] == 'B' ? -1 : (str[1] == '#' ? 1 : 0)
  let nb = str.at(-1)
  // Each note is 2^(1/12) higher than the previous one in equal temperament music
  let base = Math.pow(2,1/12)
  let exp = nb*12 + map[letter] + mod
  let freq = A0 * Math.pow(base, exp)
  return freq
}
