@bloomreach/et
==============

Bloomreach Engineering Tooling

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@bloomreach/et.svg)](https://npmjs.org/package/@bloomreach/et)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/abogaart/et?branch=master&svg=true)](https://ci.appveyor.com/project/abogaart/et/branch/master)
[![Codecov](https://codecov.io/gh/abogaart/et/branch/master/graph/badge.svg)](https://codecov.io/gh/abogaart/et)
[![Downloads/week](https://img.shields.io/npm/dw/@bloomreach/et.svg)](https://npmjs.org/package/@bloomreach/et)
[![License](https://img.shields.io/npm/l/@bloomreach/et.svg)](https://github.com/abogaart/et/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @bloomreach/et
$ et COMMAND
running command...
$ et (-v|--version|version)
@bloomreach/et/0.0.0 darwin-x64 node-v12.10.0
$ et --help [COMMAND]
USAGE
  $ et COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`et hello [FILE]`](#et-hello-file)
* [`et help [COMMAND]`](#et-help-command)

## `et hello [FILE]`

describe the command here

```
USAGE
  $ et hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ et hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/abogaart/et/blob/v0.0.0/src/commands/hello.ts)_

## `et help [COMMAND]`

display help for et

```
USAGE
  $ et help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_
<!-- commandsstop -->
