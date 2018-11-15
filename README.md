# MvcCore - Example - File Manager

[![Latest Stable Version](https://img.shields.io/badge/In%20Progress-v5.0.0-brightgreen.svg?style=plastic)](https://github.com/mvccore/example-file-manager/releases)
[![License](https://img.shields.io/badge/Licence-BSD-brightgreen.svg?style=plastic)](https://github.com/mvccore/example-file-manager/blob/master/LICENCE.md)
[![Packager Build](https://img.shields.io/badge/Packager%20Build-passing-brightgreen.svg?style=plastic)](https://github.com/mvccore/packager)
![PHP Version](https://img.shields.io/badge/PHP->=5.3-brightgreen.svg?style=plastic)

**THIS PROJECT IS IN PROGRESS**

## Instalation
```shell
# load example
composer create-project mvccore/example-file-manager

# go to project development dir
cd example-file-manager/development

# update dependencies for app development sources
composer update
```

## Build

### 1. Prepare application
- go to `example-file-manager/development`
- clear everything in `./Var/Tmp/`
- change `$app->Run();` to `$app->Run(1);` in `./index.php`
- visit all aplication routes where are different JS/CSS bundles 
  groups to generate `./Var/Tmp/` content for result app
- run build process

### 2. Build

#### Linux:
```shell
# go to project root dir
cd example-file-manager
# run build process into single PHP file
sh make.sh
```

#### Windows:
```shell
# go to project root dir
cd example-file-manager
# run build process into single PHP file
make.cmd
```

#### Browser:
```shell
# visit script `make-php.php` in your project root directory:
http://localhost/example-file-manager/make-php.php
# now run your result in:
http://localhost/example-file-manager/release/
```
