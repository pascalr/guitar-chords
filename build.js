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

function convertLink() {
}

let dependencies = []

for (let i = 0; i < pages.length; i++) {
  let page = pages[i]
  let p = await fetch('http://localhost:3000'+page.url)
  let text = await p.text()

  let root = parse(text)
  let links = root.querySelectorAll('a') || []
  links.forEach(elem => {
    dependencies.push(elem.getAttribute('href'))
  })

//def convert_html_file_links(path)
//  rel = File.dirname(path)[(OUT_DIR.length+1)..-1]
//  depth = (rel.nil? || rel == '') ? 0 : rel.count('/')+1
//  html = File.read(path)
//  doc = Nokogiri::HTML5(html)
//  links = doc.css 'a'
//  links.each do |link|
//    link['href'] = convert_link(link['href'], depth)
//  end
//  links = doc.css 'link'
//  links.each do |link|
//    link['href'] = convert_link(link['href'], depth)
//  end
//  imgs = doc.css 'img'
//  imgs.each do |img|
//    img['src'] = convert_link(img['src'], depth)
//  end
//  videos = doc.css 'video'
//  videos.each do |video|
//    video['src'] = convert_link(video['src'], depth)
//  end
//  scripts = doc.css 'script'
//  scripts.each do |script|
//    script['src'] = convert_link(script['src'], depth)
//  end
//  File.write(path, doc.to_html)
//end

  await fs.writeFile(page.out, text, function (err) {
    if (err) return console.log(err);
  })
}

dependencies = [...new Set(dependencies)]
console.log(dependencies)
