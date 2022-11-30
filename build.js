import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {buildWebsite} from './src/builder.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rootDir = path.join(__dirname, 'docs')

let pages = [
  {url: '/', out: './docs/index.html'},
]

let songs = fs.readdirSync(path.join(__dirname, 'views', 'chords'));
songs.forEach(song => {
  let name = encodeURI(song)
  pages.push({url: '/c/'+name, out: './docs/c/'+song+'/index.html'})
})

buildWebsite(rootDir, pages)
