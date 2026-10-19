import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const verifyOnly = args.includes('--verify-only');
const rootArg = args.find((arg) => arg !== '--verify-only') ?? '.';
const root = path.resolve(rootArg);

const menusPath = path.join(root, 'drawio/src/main/webapp/js/diagramly/Menus.js');
const bundlePath = path.join(root, 'drawio/src/main/webapp/js/app.min.js');
const versionPath = path.join(root, 'drawio/VERSION');
const disableUpdatePath = path.join(root, 'src/main/disableUpdate.js');

function read(file)
{
	if (!fs.existsSync(file))
	{
		throw new Error(`Required file not found: ${file}`);
	}

	return fs.readFileSync(file, 'utf8');
}

function replaceOnce(text, pattern, replacement, description)
{
	const matches = text.match(pattern);

	if (matches == null)
	{
		throw new Error(`Could not find expected v32.5.5 code for: ${description}`);
	}

	return text.replace(pattern, replacement);
}

function assert(condition, message)
{
	if (!condition)
	{
		throw new Error(message);
	}
}

function applyReadableSourcePatch()
{
	let text = read(menusPath);

	text = replaceOnce(text,
		/\t+editorUi\.actions\.addAction\('website\.\.\.', function\(\)\s*\{\s*editorUi\.openLink\('https:\/\/www\.drawio\.com'\);\s*\}\);\s*editorUi\.actions\.addAction\('check4Updates', function\(\)\s*\{\s*editorUi\.checkForUpdates\(\);\s*\}\);\s*editorUi\.actions\.addAction\('restartToUpdate', function\(\)\s*\{\s*editorUi\.installUpdate\(\);\s*\}\);/,
		"\t\t\t\t\teditorUi.actions.put('developmentTeam', new Action('开发团队', function()\n\t\t\t\t\t{\n\t\t\t\t\t\tmxUtils.alert('LP ITS');\n\t\t\t\t\t}));",
		'Help website/update actions');

	text = replaceOnce(text,
		/'website', 'support', '-'/,
		"'developmentTeam', 'support', '-'",
		'Help menu website item');

	text = replaceOnce(text,
		/\s*if \(urlParams\['disableUpdate'\] != '1'\)\s*\{\s*this\.addMenuItems\(menu, \[\(editorUi\.updateState != null &&\s*editorUi\.updateState\.status == 'downloaded'\) \?\s*'restartToUpdate' : 'check4Updates', '-'\], parent\);\s*\}/,
		'',
		'Help update menu block');

	fs.writeFileSync(menusPath, text, 'utf8');
}

function applyReleaseBundlePatch()
{
	let text = read(bundlePath);

	text = replaceOnce(text,
		/c\.actions\.addAction\("website\.\.\.",function\(\)\{c\.openLink\("https:\/\/www\.drawio\.com"\)\}\),c\.actions\.addAction\("check4Updates",function\(\)\{c\.checkForUpdates\(\)\}\),\s*c\.actions\.addAction\("restartToUpdate",function\(\)\{c\.installUpdate\(\)\}\),/,
		'c.actions.put("developmentTeam",new Action("开发团队",function(){mxUtils.alert("LP ITS")})),',
		'minified Help website/update actions');

	text = replaceOnce(text,
		/"- keyboardShortcuts quickStart website support -"/,
		'"- keyboardShortcuts quickStart developmentTeam support -"',
		'minified Help menu website item');

	text = replaceOnce(text,
		/"1"!=urlParams\.disableUpdate&&this\.addMenuItems\(h,\[null!=c\.updateState&&"downloaded"==c\.updateState\.status\?\s*"restartToUpdate":"check4Updates","-"\],r\),/,
		'',
		'minified Help update menu block');

	fs.writeFileSync(bundlePath, text, 'utf8');
}

function verify(requireUpdatesDisabled)
{
	const version = read(versionPath).trim();
	const menus = read(menusPath);
	const bundle = read(bundlePath);

	assert(version === '32.5.5', `Expected draw.io 32.5.5, found ${version}`);
	assert(menus.includes("actions.put('developmentTeam', new Action('开发团队'"),
		'Menus.js is missing the 开发团队 action');
	assert(menus.includes("mxUtils.alert('LP ITS')"),
		'Menus.js is missing the LP ITS dialog');
	assert(menus.includes("'developmentTeam', 'support', '-'"),
		'Menus.js is missing the developmentTeam menu item');
	assert(!menus.includes("actions.addAction('website...'"),
		'Menus.js still contains the desktop website action');
	assert(!menus.includes("actions.addAction('check4Updates'"),
		'Menus.js still contains the Help update action');
	assert(bundle.includes('actions.put("developmentTeam",new Action("开发团队"'),
		'app.min.js is missing the 开发团队 action');
	assert(bundle.includes('mxUtils.alert("LP ITS")'),
		'app.min.js is missing the LP ITS dialog');
	assert(bundle.includes('quickStart developmentTeam support'),
		'app.min.js is missing the developmentTeam menu item');
	assert(!bundle.includes('actions.addAction("website..."'),
		'app.min.js still contains the desktop website action');
	assert(!bundle.includes('actions.addAction("check4Updates"'),
		'app.min.js still contains the Help update action');

	if (requireUpdatesDisabled)
	{
		const disableUpdate = read(disableUpdatePath);
		assert(disableUpdate.includes('return true'),
			'src/main/disableUpdate.js is not set to true; run npm run sync -- disableUpdate');
	}

	console.log('LP ITS customization verified for draw.io Desktop 32.5.5.');
}

if (!verifyOnly)
{
	applyReadableSourcePatch();
	applyReleaseBundlePatch();
}

verify(verifyOnly);
