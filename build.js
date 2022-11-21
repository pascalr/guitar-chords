import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let songs = fs.readdirSync(path.join(__dirname, 'views', 'chords'));

let pages = [
  {url: '/', out: '/docs/index.html'},
]

songs.forEach(song => {
  let name = encodeURI(song)
  pages.push({url: '/c/'+name, out: '/docs/'+name+'.html'})
})

  //full = File.join(OUT_DIR, _relative_path(path))
  //FileUtils.mkdir_p(full) unless File.directory?(full)
  //system("wget #{_fullpath(path)} -q -O #{full}/index.html") # -q => quiet; -O => output file name; -k => relative file path

pages.forEach(page => {
  // -q => quiet; -O => output file name; -k => relative file path
  exec("wget http://localhost:3000"+page.url+" -q -O "+page.out)
})
