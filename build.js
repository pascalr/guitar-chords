import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { exec } from "child_process";
import { parse } from 'node-html-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let songs = fs.readdirSync(path.join(__dirname, 'views', 'chords'));

let pages = [
  {url: '/', out: './docs/index.html'},
]

songs.forEach(song => {
  let name = encodeURI(song)
  pages.push({url: '/c/'+name, out: './docs/c/'+name+'.html'})
})

  //full = File.join(OUT_DIR, _relative_path(path))
  //FileUtils.mkdir_p(full) unless File.directory?(full)
  //system("wget #{_fullpath(path)} -q -O #{full}/index.html") # -q => quiet; -O => output file name; -k => relative file path

for (let i = 0; i < pages.length; i++) {
  let page = pages[i]
  let p = await fetch('http://localhost:3000'+page.url)
  let text = await p.text()
  await fs.writeFile(page.out, text, function (err) {
    if (err) return console.log(err);
  })
}
