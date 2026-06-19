# guitar-chords

A minimilastic website to store personal guitar chords sheets.

# todo wip

Write a python script "update_index" that opens "./data/index.json". At the top level it is an object where every key is the file name found in "./data/chords". Check if it already exists. If it is missing, then it extracts the data. It should create a value which is an object with the properties author, name. The filename is by convention like this "AUTHOR - SONG NAME" so split by minus sign. Then it should look for 