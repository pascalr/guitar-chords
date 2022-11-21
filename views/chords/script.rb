Dir.glob("./*").each do |f|
  #data = File.open(f, 'r').read
  puts f
  data = File.read(f)
  data = data.split('</pre>')[0]
  File.write(f, data)
end
