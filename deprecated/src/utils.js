// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
export function normalizeSearchText(text) {
  if (text == null) {return null}
  if (text == '') {return ''}
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}
