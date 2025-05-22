import { App, PluginSettingTab, Setting, normalizePath } from 'obsidian';
import UniqueIdPlugin from './main';
import { idTypeList } from './id-types';
import { getNoteStats, handleBulkIdOperation } from './utils';
import { ConfirmModal } from './modals';

export class UniqueIdSettingTab extends PluginSettingTab {
	plugin: UniqueIdPlugin;

	constructor(app: App, plugin: UniqueIdPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {

		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h1', { text: 'Unique Identifiers' });

		// new Setting(containerEl)
		// 	.setName('Settings')
		// 	.setHeading();

		new Setting(containerEl)
			.setName('Automatically Add to New Notes')
			.setDesc('Add a unique ID to the frontmatter whenever a new note is created')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.autoAssignOnCreate);
				toggle.onChange(async (value) => {
					this.plugin.settings.autoAssignOnCreate = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Type of Unique Identifier to Add')
			.setDesc('Choose which type of unique ID to add to your notes\' frontmatter.')
			.addDropdown(drop => {
				idTypeList.forEach(({ type, label, desc, url }) => {
					drop.addOption(type, type);
				});
				drop.setValue(this.plugin.settings.idType);
				drop.onChange(async (value) => {
					this.plugin.settings.idType = value as any;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Exclude Paths')
			.setDesc('List of folders or files to exclude (one per line)')
			.addTextArea(text => {
				text.setValue(this.plugin.settings.excludePaths.join('\n'));
				text.inputEl.rows = 4;
				text.onChange(async (value) => {
					this.plugin.settings.excludePaths = value
						.split('\n')
						.map(s => s.trim())
						.filter(Boolean)
						.map(normalizePath);
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Backfill & Conversion')
			.setHeading();

		// --- Per-ID-Type Progress Bars and Actions ---
		const stats = await getNoteStats(this.app, this.plugin.settings.excludePaths);
		idTypeList.forEach(({ type, label, desc, url }) => {
			const withCount = stats[type] || 0;
			const percent = stats.total > 0 ? Math.round((withCount / stats.total) * 100) : 0;


			const descFrag = document.createDocumentFragment();
			const descSpan = document.createElement('span');
			descSpan.textContent = desc + " ";
			if (url) {
				const link = document.createElement('a');
				link.href = url;
				link.textContent = 'GitHub';
				link.target = '_blank';
				descSpan.appendChild(link);
			}
			descFrag.appendChild(descSpan);

			const setting = new Setting(containerEl)
				.setName(label)
				.setDesc(descFrag);

			// @ts-ignore
			let barRef: any = null;
			setting.addProgressBar(bar => {
				bar.setValue(percent);
				const barEl = setting.settingEl.querySelector('.setting-progress-bar') as HTMLElement;
				if (barEl) {
					barEl.style.width = '100px';
					barEl.title = `${withCount} of ${stats.total} notes (${percent}%)`;
				}
				barRef = { bar, barEl };
			});

			let lastPercent = 0;
			const updateProgressBar = (completed: number, total: number) => {
				const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
				if (percent !== lastPercent) {
					lastPercent = percent;
					if (barRef) {
						barRef.bar.setValue(Math.round(percent));
						if (barRef.barEl) {
							barRef.barEl.title = `${completed} of ${total} notes (${percent}%)`;
						}
					}
				}
			};

			// @ts-ignore
			setting.addExtraButton(btn => {
				btn.setIcon('lucide-plus')
					.setTooltip('Apply to All Notes')
					.onClick(() => {
						new ConfirmModal(
							this.app,
							`Are you sure you want to add the '${type}' property to all notes that do not already have it? Notes in excluded paths will not be affected.`,
							() => handleBulkIdOperation(
								this.app.vault,
								this.app.fileManager,
								this.app.metadataCache,
								this.plugin.settings,
								type,
								updateProgressBar,
								'add'
							)
						).open();
					});
			});
			// @ts-ignore
			setting.addExtraButton(btn => {
				btn.setIcon('lucide-x')
					.setTooltip('Remove from All Notes')
					.onClick(() => {
						new ConfirmModal(
							this.app,
							`Are you sure you want to remove the ${type} property from all notes?`,
							() => handleBulkIdOperation(
								this.app.vault,
								this.app.fileManager,
								this.app.metadataCache,
								this.plugin.settings,
								type,
								updateProgressBar,
								'remove'
							)
						).open();
					});
				btn.extraSettingsEl.classList.add('mod-warning');
			});
		});
	}
}
