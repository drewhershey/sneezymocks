import fs from 'node:fs';
import path from 'node:path';
import { rimraf } from 'rimraf';
import simpleGit from 'simple-git';

export async function updateSourceZonefiles() {
	const git = simpleGit();

	console.log('Cloning repo...');
	await git.clone('https://github.com/sneezymud/sneezymud.git', './data/repo');
	console.log('Repo cloned.');

	console.log('Copying zonefiles...');
	fs.readdir('./data/repo/lib/zonefiles', (err, files) => {
		if (err) throw err;

		for (const file of files)
			fs.copyFileSync(
				path.join('./data/repo/lib/zonefiles', file),
				path.join('./data/zonefiles/original', file),
			);

		console.log('Zonefiles copied.');
	});

	console.log('Removing repo...');
	await rimraf('./data/repo');
	console.log('Repo removed.');
}
