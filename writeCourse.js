/*eslint-env node, es6*/

/* Put dependencies here */
var path = require('path'),
    fs = require('fs'),
    asyncLib = require('async'),
    cp = require('cp'),
    mkdirp = require('mkdirp');

var writeCount = 0;
var copyCount = 0;

module.exports = (course, stepCallback) => {

    function writeAllFiles(files, cb1) {

        var checkWriteCount = (error, results) => {
            writeCount++;
            if (writeCount < 10 && results.length > 0) {
                writeAllFiles(results, cb1);
                return;
            }
            if (writeCount === 10) {
                course.error('Reached write file attempt limit (10).');
                results.forEach(file => {
                    course.error(`File not written: ${file.name}`);
                });
            }
            if (results.length === 0) {
                course.message('All editable files successfully written.');
            }
            /* Errors are never passed through from the filter, since it is a filter */
            cb1(null);
        };

        function writeFile(file, cb2) {
            var writePath = file.path.replace('unzipped', 'processed');
            if (file.newPath) {
                writePath = file.newPath;
            }
            fs.writeFile(writePath, file.dom.xml(), 'utf8', writeError => {
                if (writeError) {
                    course.error(writeError);
                    cb2(null, true);
                } else {
                    course.log('Files Written', {
                        'Name': file.name,
                        'Path': writePath
                    });
                    cb2(null, false);
                }
            });
        }
        asyncLib.filter(files, writeFile, checkWriteCount);
    }

    function copyAllFiles(files, cb1) {

        var checkCopyCount = (error, results) => {
            copyCount++;
            if (copyCount < 10 && results.length > 0) {
                copyAllFiles(results, cb1);
                return;
            }
            if (copyCount === 10) {
                course.error('Reached copy file attempt limit (10).');
                results.forEach(file => {
                    course.error(`File not copied: ${file.name}`);
                });
            }
            if (results.length === 0) {
                course.message('All binary files successfully copied.');
            }
            /* Errors are never passed through from the filter, since it is a filter */
            cb1(null);
        };

        function copyFile(file, cb2) {
            var writePath = file.path.replace('unzipped', 'processed');
            if (file.newPath) {
                writePath = file.newPath;
            }
            cp(file.path, writePath, (err) => {
                if (err) {
                    course.error(err);
                } else {
                    course.log('Files Copied', {
                        'Name': file.name,
                        'From': file.path,
                        'To': writePath
                    });
                    cb2(null, false);
                }
            });
        }
        asyncLib.filter(files, copyFile, checkCopyCount);
    }

    function createDir(dirPath, callback) {
        mkdirp(dirPath, (err) => {
            if (err) {
                course.error(err);
                callback(err);
            } else {
                course.log('Directories Written', {
                    'Directory Path': dirPath
                });
                callback(null);
            }
        });
    }

    /* Start Here */
    /* Return array of just our files paths */
    var pathsToBuild = course.content.map(file => {
        if (file.newPath) {
            return path.dirname(file.newPath);
        } else {
            return path.dirname(file.path).replace('unzipped', 'processed');
        }
    });

    /* Unique the array */
    pathsToBuild = [...new Set(pathsToBuild)];

    /* Sort them alphabetically so we make sure we
    create the right folders first */
    var pathArray = pathsToBuild.sort();
    /* Create the directories we need, one at a time */
    asyncLib.eachSeries(pathArray, createDir, createDirErr => {
        if (createDirErr) {
            course.fatalError(createDirErr);
            stepCallback(createDirErr, course);
        } else {
            var writableFiles = course.content.filter(file => file.canEdit);
            var binaryFiles = course.content.filter(file => !file.canEdit);
            writeAllFiles(writableFiles, function (nullError1) {
                copyAllFiles(binaryFiles, (nullError2) => {
                    stepCallback(null, course);
                });
            });
        }
    });
};