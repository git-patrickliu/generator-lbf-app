# Emulate CGI
You can just put your JSON file of your emulated data in this dir, all emulations jobs done!

Source data:
```bash
/project/example/dev/cgi/mod/cgi.json or /project/example/dev/cgi/mod/cgi.js
cgi.json is a pure json file, while cgi.js supports js logic. Use **returnData function** to return value to browser
if both cgi.json and cgi.js exist, only cgi.json will be read as it's the quickest return way
```

Uri:
```bash
http://local.example.com/mod/cgi
```