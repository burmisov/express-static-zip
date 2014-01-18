express-static-zip
==================

Serve static files out of a ZIP without unpacking.

Adding client-side dependency libraries to the repository is good, but
adding huge libraries like DOJO with thousands of small files is a mess.

This module provides means to serving such libraries or arbitrary static 
file packages right out of a ZIP without unpacking.

1. npm install express-static-zip
2. var staticZip = require('express-static-zip');
3. app.use(staticZip('./path/to/somelib.zip'));
