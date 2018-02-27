# Write Course
### *Package Name*: write-course
### *Child Type*: Shell
### *Platform*: All
### *Required*: Required

This child module is built to be used by the Brigham Young University - Idaho D2L to Canvas Conversion Tool. It utilizes the standard `module.exports => (course, stepCallback)` signature and uses the Conversion Tool's standard logging functions. You can view extended documentation [Here](https://github.com/byuitechops/d2l-to-canvas-conversion-tool/tree/master/documentation).

## Purpose
This shell module saves changes made to course files in the course object to the hard drive so they can be zipped and uploaded to Canvas.

## How to Install

```
npm install write-course
```

## Run Requirements
Course must be indexed successfully for this shell module to work.

## Options
None

## Outputs
None

## Process

Describe in steps how the module accomplishes its goals.

1. Build array of filepaths
2. Write all directories
3. Write all files
4. Copy all files

## Log Categories

List the categories used in logging data in your module.

- Files Written
- Files Copied
- Directories Written

## Requirements
Save changes made to course.content to hard drive so it can be uploaded to Canvas.