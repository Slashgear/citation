#!/usr/bin/env node

import meow from 'meow';
import prerender from '.';

const cli = meow();

if (!cli.flags.serverUrl) {
	throw new Error('serverUrl is mandatory');
}

if (!cli.flags.components) {
	throw new Error('components path is mandatory');
}
cli.flags.components = process.cwd() + '/' + cli.flags.components;

if (!cli.flags.buildDir) {
	cli.flags.buildDir = process.cwd() + '/build';
}

if (!cli.flags.renderDir) {
	cli.flags.renderDir = process.cwd() + '/prerender';
}

if (!cli.flags.renderDir) {
	cli.flags.renderDir = process.cwd() + '/prerender';
}

if (!cli.flags.selector) {
	cli.flags.selector = '<div id="root"></div>';
}

prerender({...cli.flags});