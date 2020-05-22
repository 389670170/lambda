let fs = require('fs');
let archiver = require('archiver');

let packageLock = require('./package-lock');
let zipName = 'Lambda-Deployment';
let stage = 'Release';
(() => {

    let zipFile = fs.createWriteStream(`./${zipName}-${stage}.zip`);
    let archive = archiver('zip', {
        zlib: {level: 9}
    });

    zipFile.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    zipFile.on('end', function() {
        console.log('Data has been drained');
    });


    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(zipFile);

    for (let key in packageLock.dependencies) {
        if (!packageLock.dependencies[key].dev) {
            archive.directory(`./node_modules/${key}/`, `node_modules/${key}/`);
        }
    }


    archive.file(`./index.js`, { name: `index.js` });

    archive.directory(`./common/`, `common/`);
    archive.directory(`./entities/`, `entities/`);

    archive.finalize();
})();
