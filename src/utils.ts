import { App, TFile, Notice, Vault, FileManager, MetadataCache, FrontMatterCache } from 'obsidian';
import { v4 as uuidv4 } from 'uuid';
import { ulid } from 'ulid';
import { nanoid } from 'nanoid';
import { createId as cuid2 } from '@paralleldrive/cuid2';
import { generate as ksuid } from 'xksuid';
import { UniqueIdSettings } from '../main';

export function generateId(type: string): string {
	switch (type) {
		case 'uuid': return uuidv4();
		case 'cuid': return cuid2();
		case 'nanoid': return nanoid();
		case 'ulid': return ulid();
		case 'ksuid': return ksuid();
		default: throw new Error(`Unknown ID type: ${type}`);
	}
}

export function isExcluded(file: TFile, excludePaths: string[]): boolean {
	return excludePaths.some((prefix) => file.path.startsWith(prefix));
}

export type NoteStats = Record<string, number>;

export async function getNoteStats(app: App, excludePaths: string[]): Promise<NoteStats> {
	const idTypes = ['uuid', 'cuid', 'nanoid', 'ulid', 'ksuid'];
	const stats: NoteStats = Object.fromEntries(idTypes.map(type => [type, 0]));
	stats.total = 0;
	const files = app.vault.getMarkdownFiles();
	for (const file of files) {
		if (isExcluded(file, excludePaths)) continue;
		stats.total++;
		const cache = app.metadataCache.getFileCache(file);
		const frontmatter = cache?.frontmatter;
		if (frontmatter) {
			for (const type of idTypes) {
				if (frontmatter[type]) stats[type]++;
			}
		}
	}
	return stats;
}

export async function handleBulkIdOperation(
	vault: Vault,
	fileManager: FileManager,
	metadataCache: MetadataCache,
	settings: UniqueIdSettings,
	type: string,
	updateProgressBar: (completed: number, total: number) => void,
	operation: 'add' | 'remove'
) {
	const files = vault.getMarkdownFiles()
		.filter((f: TFile) => !settings.excludePaths.some((prefix: string) => f.path.startsWith(prefix)))
		.map((file: TFile) => ({
			file,
			hasId: !!(metadataCache.getFileCache(file)?.frontmatter?.[type])
		}));
	const total = files.length;
	let changedCount = 0;
	let completed = files.filter(f => f.hasId).length;
	updateProgressBar(completed, total);

	for (const { file, hasId } of files) {
		await fileManager.processFrontMatter(file, (frontmatter: FrontMatterCache) => {
			if (operation === 'add' && !hasId && !frontmatter[type]) {
				frontmatter[type] = generateId(type);
				changedCount++;
				completed++;
				updateProgressBar(completed, total);
			}
			if (operation === 'remove' && hasId && frontmatter[type]) {
				delete frontmatter[type];
				changedCount++;
				completed--;
				updateProgressBar(completed, total);
			}
		});
	}

	if (operation === 'add') {
		new Notice(`Operation complete: '${type}' added to ${changedCount} notes.`);
	} else {
		new Notice(`Operation complete: '${type}' removed from ${changedCount} notes.`);
	}
}
