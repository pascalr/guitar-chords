import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { exec } from "child_process";
import { parse } from 'node-html-parser';
import {createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rootDir = path.join(__dirname, 'docs')
if (fs.existsSync(rootDir)) {
  fs.rmSync(rootDir, {recursive: true})
}

let songs = fs.readdirSync(path.join(__dirname, 'views', 'chords'));

// TODO: Delete the docs folder

let pages = [
  {url: '/', out: './docs/index.html'},
]

songs.forEach(song => {
  let name = encodeURI(song)
  pages.push({url: '/c/'+name, out: './docs/c/'+song+'/index.html'})
})

  //full = File.join(OUT_DIR, _relative_path(path))
  //FileUtils.mkdir_p(full) unless File.directory?(full)
  //system("wget #{_fullpath(path)} -q -O #{full}/index.html") # -q => quiet; -O => output file name; -k => relative file path

let fetched = []
let dependencies = []

//def convert_link(link, depth)
//  $dependencies << link
//  base = link.start_with?('/') ? link[1..-1] : link
//  return depth == 0 ? base : '../'*depth+base
//end
const convertLink = (url, attr) => (elem) => {
  let link = elem.getAttribute(attr)
  let depth = url.split('/').length-1
  let base = link.startsWith('/') ? link.slice(1) : link
  dependencies.push('/'+base)
  elem.setAttribute(attr, depth <= 1 ? './'+base : '../'.repeat(depth)+base)
  //}
}

async function fetchText(url) {

  let p = await fetch('http://localhost:3000'+url)
  let text = await p.text()
  fetched.push(url)
  return text
}

function ensureDirectoryExist(out) {

  let dir = path.dirname(out)
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function save(text, out) {

  ensureDirectoryExist(out)
  await fs.writeFile(out, text, function (err) {
    if (err) return console.log(err);
  })
  return text
}

async function download(url, out) {
  //let text = await fetchText(url)
  //await save(text, out)
  ensureDirectoryExist(out)
  const streamPipeline = promisify(pipeline);
  const response = await fetch('http://localhost:3000'+url);
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(response.body, createWriteStream(out));
}

for (let i = 0; i < pages.length; i++) {
  let page = pages[i]

  let text = await fetchText(page.url)
  let root = parse(text)

  let links = root.querySelectorAll('a') || []
  links.forEach(convertLink(page.url, 'href'))
  
  let images = root.querySelectorAll('img') || []
  images.forEach(convertLink(page.url, 'src'))

  let css = root.querySelectorAll('link') || []
  css.forEach(convertLink(page.url, 'href'))

  let videos = root.querySelectorAll('video') || []
  videos.forEach(convertLink(page.url, 'src'))

  let scripts = root.querySelectorAll('script[src]') || []
  scripts.forEach(convertLink(page.url, 'src'))

  await save(root.toString(), page.out)
}

// https://stackoverflow.com/questions/39721276/remove-set-of-values-in-an-existing-set
function removeAll(originalSet, toBeRemovedSet) {
  [...toBeRemovedSet].forEach(function(v) {
    originalSet.delete(v);
  });
  return originalSet
}

let missings = [...removeAll(new Set(dependencies), fetched)]
console.log('missings', missings)

missings.forEach(missing => {
  download(missing, './docs'+missing)
})
