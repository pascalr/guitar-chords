import React, { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client';

import { normalizeSearchText } from './utils';

const useEventListener = (id, evtName, func) => {

  useEffect(() => {
    let elem = document.getElementById(id)
    elem.addEventListener(evtName, func)
    return () => {elem.removeEventListener(evtName, func)}
  }, [func])
}

const Search = () => {

  const [term, setTerm] = useState('')
  const [selected, setSelected] = useState(-1)
  const selectedRef = useRef(null)
  const [songs,] = useState(gon.songs)
      
  let t = normalizeSearchText(term)
  matching = !t ? [] : songs.filter(s => ~normalizeSearchText(s).indexOf(t))

  useEventListener('search-input', 'keydown', ({key}) => {
    if (key == "ArrowDown") {select(selected >= matching.length-1 ? -1 : selected+1)}
    else if (key == "ArrowUp") {select(selected < 0 ? matching.length-1 : selected-1)}
    else if (key == "Enter") {

      if (selected >= 0 && selected <= matching.length-1) {
        document.querySelector('.song-list li.active > a').click()
      }
    } else if (key == "Escape") { setSearch(''); setTerm(''); setSelected(-1) }
  })

  useEffect(() => {
    if (selectedRef.current) { selectedRef.current.scrollIntoView(false) }
  }, [selected])

  let setSearch = (val) => {
    let elem = document.getElementById('search-input')
    elem.value = val
  }

  let select = (pos) => {
    setSelected(pos)
    setSearch(pos == -1 ? '' : matching[pos])
  }

  useEffect(() => {
    let elem = document.getElementById('search-input')
    let l = elem.addEventListener('input', (e) => {setTerm(e.target.value)})
    return () => {elem.removeEventListener('input', l)}
  }, [])

  if (!matching?.length) {return null}

  return <>
    <div style={{width: '100%', height: 'calc(40vw * 2 / 3)', zIndex: '5', backgroundColor: 'rgba(0,0,0,0.8)', overflow: 'scroll'}}>
      <ul className='song-list'>
        {matching.map((song,i) => {
          let c = selected == i ? 'active' : undefined
          return <li key={song} className={c} ref={c ? selectedRef : undefined}>
            <a href={"./c/"+encodeURI(song)}>{song}</a>
          </li>
        })}
      </ul>
    </div>
  </>
}

let root = document.getElementById('search-results')
createRoot(root).render(<Search />)
