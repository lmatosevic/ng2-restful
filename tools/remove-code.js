const del = require('del');
del(['dist/!(*.umd.js|*.esm.js|*.d.ts|*.umd.js.map|*.esm.js.map|*.metadata.json)']);
del(['lib/*.ngsummary.json', 'lib/*.ngfactory.ts']);