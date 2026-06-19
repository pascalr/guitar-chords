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

/**
 * Build a website given an output directory and a list of pages.
 */
export async function buildWebsite(outDir, pages) {

  if (fs.existsSync(outDir)) {
    console.log('Removing previous docs...')
    fs.rmSync(outDir, {recursive: true})
  }

  let fetched = []
  let dependencies = []

  for (let i = 0; i < pages.length; i++) {
    let page = pages[i]
  
    let text = await fetchText(page.url)
    fetched.push(page.url)
    let root = parse(text)
  
    let links = root.querySelectorAll('a') || []
    links.forEach(convertLink(page.url, 'href', dependencies))
    
    let images = root.querySelectorAll('img') || []
    images.forEach(convertLink(page.url, 'src', dependencies))
  
    let css = root.querySelectorAll('link') || []
    css.forEach(convertLink(page.url, 'href', dependencies))
  
    let videos = root.querySelectorAll('video') || []
    videos.forEach(convertLink(page.url, 'src', dependencies))
  
    let scripts = root.querySelectorAll('script[src]') || []
    scripts.forEach(convertLink(page.url, 'src', dependencies))
 
    //let out = path.join(__dirname, outDir, page.url, 'index.html')
    await save(root.toString(), page.out)
  }
  
  let missings = [...removeAll(new Set(dependencies), fetched)]
  console.log('missings', missings)
  
  missings.forEach(missing => {
    download(missing, './docs'+missing)
  })

}

/**
 * Convert links to relative paths so it works on github pages.
 */
const convertLink = (url, attr, dependencies) => (elem) => {
  
  let link = elem.getAttribute(attr)
  // Don't convert absolute links
  if (link.startsWith('http')) {return;}
  let depth = url.split('/').length-1
  let base = link.startsWith('/') ? link.slice(1) : link
  dependencies.push('/'+base)
  elem.setAttribute(attr, depth <= 1 ? './'+base : '../'.repeat(depth)+base)
  //}
}

async function fetchText(url) {

  let p = await fetch('http://localhost:3000'+url)
  let text = await p.text()
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

// https://stackoverflow.com/questions/39721276/remove-set-of-values-in-an-existing-set
function removeAll(originalSet, toBeRemovedSet) {
  [...toBeRemovedSet].forEach(function(v) {
    originalSet.delete(v);
  });
  return originalSet
}

