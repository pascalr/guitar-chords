import React, { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client';

import { normalizeSearchText } from './utils';

const Search = () => {

  //// Search is the text shown in the input field
  //// Term is the term currently used to filter the search
  //const [search, setSearch] = useState('')
  //const [term, setTerm] = useState('')
  const [selected, setSelected] = useState(-1)
  const selectedRef = useRef(null)
  const [songs,] = useState(gon.songs)
  const [matching, setMatching] = useState([])

  useEffect(() => {
    if (selectedRef.current) { selectedRef.current.scrollIntoView(false) }
  }, [selected])

  let setSearch = (val) => {
    let elem = document.getElementById('search-input')
    elem.value = val
  }

  let select = (pos) => {
    console.log('matching length', matching.length)
    console.log('pos', pos)
    console.log('val', matching[pos])
    setSelected(pos)
    setSearch(pos == -1 ? '' : matching[pos])
  }

  useEffect(() => {
    let elem = document.getElementById('search-input')

    let listener1 = elem.addEventListener('input', (e) => {
      let term = normalizeSearchText(e.target.value)

      if (!term) { setMatching([]) }
      else {setMatching(songs.filter(s => ~normalizeSearchText(s).indexOf(term)))}
    })

    let listener2 = elem.addEventListener('keydown', ({key}) => {
      if (key == "ArrowDown") {select(selected >= matching.length-1 ? -1 : selected+1)}
      else if (key == "ArrowUp") {select(selected < 0 ? matching.length-1 : selected-1)}
      else if (key == "Enter") {

        if (selected >= 0 && selected <= matching.length-1) {
          window.location.href = '/c/'+encodeURI(matching[selected])
        }
      } else if (key == "Escape") { setSearch('') }
    })

    return () => {
      elem.removeEventListener('input', listener1)
      elem.removeEventListener('keydown', listener2)
    }
  }, [selected, matching])

  if (!matching?.length) {return null}

  return <>
    <div style={{width: '100%', height: 'calc(40vw * 2 / 3)', zIndex: '5', backgroundColor: 'black', opacity: '0.8', overflow: 'scroll'}}>
      <ul>
        {matching.map(song => {
          return <li key={song}>{song}</li>
        })}
      </ul>
    </div>
  </>
}

let root = document.getElementById('search-results')
createRoot(root).render(<Search />)
