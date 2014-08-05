# comment package for atom

Atom package for inserting block- or single line comments via keyboard shortcut

## Installation
Until package is published to apm, clone this repo in your atom package folder. By default: ```~/.atom/packages```
or clone the repo whereever and symlink from package folder:
```ln -s /path/to/repository/folder comment```

## Usage
Select the text you want to comment, and hit ```shift-cmd-m```
If selection is empty, an empty comment block will be inserted

## Language support
...is based on file extensions and will be added incrementally.
Version 0.0.1 supports block comments and single line comments for:
* .class
* .coffee
* .cs
* .html/.htm
* .js
* .rb
