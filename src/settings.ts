import { App, PluginSettingTab, Setting, normalizePath, ProgressBarComponent, ExtraButtonComponent } from 'obsidian';
import UniqueIdPlugin from '../main';
import { idTypeList, IdType } from './id-types';
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

		new Setting(containerEl)
			.setName('Automatically add unique ID to new notes')
			.setDesc('Adds a unique identifier to the frontmatter each time a note is created.')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.autoAssignOnCreate);
				toggle.onChange(async (value) => {
					this.plugin.settings.autoAssignOnCreate = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Type of unique ID')
			.setDesc("Choose the kind of unique identifier to insert in your notes’ frontmatter.")
			.addDropdown(drop => {
				idTypeList.forEach(({ type, label, desc, url }) => {
					drop.addOption(type, type);
				});
				drop.setValue(this.plugin.settings.idType);
				drop.onChange(async (value) => {
					this.plugin.settings.idType = value as IdType;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Exclude paths')
			.setDesc('List folders or files to ignore when assigning unique IDs (one per line).')
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
			.setName('Backfill & conversion')
			.setHeading();

		// --- Per-ID-Type Progress Bars and Actions ---
		const stats = await getNoteStats(this.app, this.plugin.settings.excludePaths);
		idTypeList.forEach(({ type, label, desc, url }) => {
			const withCount = stats[type] || 0;
			const percent = stats.total > 0 ? Math.round((withCount / stats.total) * 100) : 0;


			const descFrag = createFragment()
			const descSpan = createSpan()
			descSpan.textContent = desc + " ";
			if (url) {
				const link = createEl('a');
				link.href = url;
				link.textContent = 'GitHub';
				link.target = '_blank';
				descSpan.appendChild(link);
			}
			descFrag.appendChild(descSpan);

			const setting = new Setting(containerEl)
				.setName(label)
				.setDesc(descFrag);

			let barRef: { bar: ProgressBarComponent; barEl: HTMLElement } | null = null;
			setting.addProgressBar((bar: ProgressBarComponent) => {
				bar.setValue(percent);
				const barEl = setting.settingEl.querySelector('.setting-progress-bar') as HTMLElement;
				barEl.title = `${withCount} of ${stats.total} notes (${percent}%)`;
				barRef = { bar, barEl };
			});

			let lastPercent = 0;
			const updateProgressBar = (completed: number, total: number) => {
				const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
				if (percent !== lastPercent) {
					lastPercent = percent;
					if (barRef) {
						barRef.bar.setValue(Math.round(percent));
						barRef.barEl.title = `${completed} of ${total} notes (${percent}%)`;
					}
				}
			};

			setting.addExtraButton((btn: ExtraButtonComponent) => {
				btn.setIcon('lucide-plus')
					.setTooltip('Apply to all notes')
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
			setting.addExtraButton((btn: ExtraButtonComponent) => {
				btn.setIcon('lucide-x')
					.setTooltip('Remove from all notes')
					.onClick(() => {
						new ConfirmModal(
							this.app,
							`Are you sure you want to remove the '${type}' property from all notes?`,
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
