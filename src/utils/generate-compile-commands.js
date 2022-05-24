import * as fs from 'node:fs';
import { execSync } from 'node:child_process';

const INCLUDE_HEADERS = true;

const ROOT_DIR = '/home/drew/source/repos/sneezymud';
const CODE_DIR = 'code/code';

const FIND_CMD = `find ${ROOT_DIR}/${CODE_DIR} -type f -name "*.cc"${
  INCLUDE_HEADERS ? ' -o -name "*.h"' : ''
}`;

const COMPILER = '/usr/bin/clang++';

const BUILD_FLAGS = [
  '-g',
  '-O0',
  '-x c++',
  '--std=c++17',
  '--analyze',
  '-ferror-limit=0',
  '-fno-limit-debug-info',
  '-Wno-pragma-once-outside-header',
].join(' ');

const INCLUDE_DIRS = [
  'sys',
  'misc',
  'cmd',
  'disc',
  'game',
  'obj',
  'spec',
  'task',
  'tests',
];

const INCLUDE_LIBS = ['json/src'];

const INCLUDE_DIR_FLAGS = INCLUDE_DIRS.map(
  (dir) => `-I${CODE_DIR}/${dir}`
).join(' ');

const INCLUDE_LIB_FLAGS = INCLUDE_LIBS.map(
  (lib) => `-Ilibs${CODE_DIR}/${lib}`
).join(' ');

const INCLUDE_FLAGS = `${INCLUDE_DIR_FLAGS} ${INCLUDE_LIB_FLAGS}`;

const FINAL_COMMAND = `${COMPILER} ${BUILD_FLAGS} ${INCLUDE_FLAGS}`;

const files = execSync(FIND_CMD, { encoding: 'utf-8' })
  .toString()
  .trim()
  .split('\n')
  .map((file) => file.replace(ROOT_DIR + '/', ''))
  .sort();

const output = files.map((file) => ({
  directory: ROOT_DIR,
  command: `${FINAL_COMMAND} ${file}`,
  file,
}));

fs.writeFileSync(
  `${ROOT_DIR}/compile_commands_${new Date(Date.now()).toISOString()}.json`,
  JSON.stringify(output, undefined, '\t')
);
