import {
	App,
	Editor,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

interface PomodoroSettings {
	durationMinutes: number;
	startTemplate: string;
	endTemplate: string;
	cycleEnabled: boolean;
	shortBreakMinutes: number;
	longBreakMinutes: number;
	cyclesBeforeLongBreak: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
	durationMinutes: 25,
	startTemplate: "🍅 [YYYY-MM-DD HH:mm ~ ⏳]",
	endTemplate: "HH:mm]",
	cycleEnabled: false,
	shortBreakMinutes: 5,
	longBreakMinutes: 15,
	cyclesBeforeLongBreak: 4,
};

const PLACEHOLDER = "⏳]";

type PomodoroState =
	| "idle"
	| "working"
	| "shortBreak"
	| "longBreak"
	| "waiting";

function applyDateFormat(template: string, date: Date): string {
	const pad = (n: number) => n.toString().padStart(2, "0");
	return template
		.replace("YYYY", date.getFullYear().toString())
		.replace("MM", pad(date.getMonth() + 1))
		.replace("DD", pad(date.getDate()))
		.replace("HH", pad(date.getHours()))
		.replace("mm", pad(date.getMinutes()));
}

export default class PomodoroLoggerPlugin extends Plugin {
	settings!: PomodoroSettings;
	private statusBarEl!: HTMLElement;
	private timerInterval: number | null = null;
	private remainingSeconds = 0;
	private state: PomodoroState = "idle";
	private targetEditor: Editor | null = null;
	private completedCycles = 0;

	async onload() {
		await this.loadSettings();
		this.statusBarEl = this.addStatusBarItem();

		this.addCommand({
			id: "toggle-pomodoro",
			name: "뽀모도로 시작/취소",
			editorCallback: (editor: Editor) => this.handleHotkey(editor),
			hotkeys: [{ modifiers: [], key: "F6" }],
		});

		this.addSettingTab(new PomodoroSettingTab(this.app, this));
	}

	onunload() {
		this.clearTimer();
	}

	private handleHotkey(editor: Editor) {
		switch (this.state) {
			case "idle":
			case "waiting":
				this.startWorking(editor);
				break;
			case "working":
				this.cancelWorking();
				break;
			case "shortBreak":
			case "longBreak":
				this.cancelAll();
				break;
		}
	}

	private startWorking(editor: Editor) {
		this.state = "working";
		this.targetEditor = editor;
		this.remainingSeconds = this.settings.durationMinutes * 60;

		const line = editor.getCursor().line;
		const lineContent = editor.getLine(line);
		const needsSpace =
			lineContent.length > 0 && !lineContent.endsWith(" ");
		const startText =
			(needsSpace ? " " : "") +
			applyDateFormat(this.settings.startTemplate, new Date());
		editor.replaceRange(startText, { line, ch: lineContent.length });

		this.updateStatusBar();
		this.startTick();
	}

	private startShortBreak() {
		this.state = "shortBreak";
		this.remainingSeconds = this.settings.shortBreakMinutes * 60;
		new Notice(
			`🍅 완료! ☕ ${this.settings.shortBreakMinutes}분 휴식 시작`,
			5000
		);
		this.updateStatusBar();
		this.startTick();
	}

	private startLongBreak() {
		this.state = "longBreak";
		this.remainingSeconds = this.settings.longBreakMinutes * 60;
		new Notice(
			`🍅 사이클 완료! 🌙 ${this.settings.longBreakMinutes}분 긴 휴식 시작`,
			5000
		);
		this.updateStatusBar();
		this.startTick();
	}

	private startTick() {
		this.clearTimer();
		this.timerInterval = this.registerInterval(
			window.setInterval(() => {
				this.remainingSeconds--;
				this.updateStatusBar();
				if (this.remainingSeconds <= 0) {
					this.onTickComplete();
				}
			}, 1000)
		);
	}

	private onTickComplete() {
		this.clearTimer();

		if (this.state === "working") {
			this.replacePlaceholder(
				applyDateFormat(this.settings.endTemplate, new Date())
			);
			this.completedCycles++;

			if (!this.settings.cycleEnabled) {
				new Notice("🍅 뽀모도로 완료!", 5000);
				this.resetAll();
				return;
			}

			if (this.completedCycles >= this.settings.cyclesBeforeLongBreak) {
				this.startLongBreak();
			} else {
				this.startShortBreak();
			}
		} else if (this.state === "shortBreak") {
			new Notice("☕ 휴식 완료. F6로 다음 뽀모도로를 시작하세요.", 5000);
			this.state = "waiting";
			this.updateStatusBar();
		} else if (this.state === "longBreak") {
			new Notice("🌙 긴 휴식 완료. F6로 새 사이클을 시작하세요.", 5000);
			this.completedCycles = 0;
			this.state = "waiting";
			this.updateStatusBar();
		}
	}

	private updateStatusBar() {
		const min = Math.floor(this.remainingSeconds / 60);
		const sec = this.remainingSeconds % 60;
		const timeStr = `${min.toString().padStart(2, "0")}:${sec
			.toString()
			.padStart(2, "0")}`;

		switch (this.state) {
			case "idle":
				this.statusBarEl.setText("");
				break;
			case "working":
				if (this.settings.cycleEnabled) {
					const current = this.completedCycles + 1;
					const total = this.settings.cyclesBeforeLongBreak;
					this.statusBarEl.setText(`🍅 ${current}/${total} ${timeStr}`);
				} else {
					this.statusBarEl.setText(`🍅 ${timeStr}`);
				}
				break;
			case "shortBreak":
				this.statusBarEl.setText(
					`☕ ${timeStr} (${this.completedCycles}/${this.settings.cyclesBeforeLongBreak})`
				);
				break;
			case "longBreak":
				this.statusBarEl.setText(`🌙 ${timeStr}`);
				break;
			case "waiting":
				this.statusBarEl.setText("🍅 대기 · F6로 시작");
				break;
		}
	}

	private cancelWorking() {
		this.clearTimer();
		this.replacePlaceholder("취소]");
		new Notice("🍅 뽀모도로 취소");
		this.resetAll();
	}

	private cancelAll() {
		this.clearTimer();
		new Notice("🍅 사이클 취소");
		this.resetAll();
	}

	private replacePlaceholder(replacement: string) {
		if (!this.targetEditor) return;
		const lineCount = this.targetEditor.lineCount();
		for (let i = 0; i < lineCount; i++) {
			const content = this.targetEditor.getLine(i);
			const idx = content.lastIndexOf(PLACEHOLDER);
			if (idx === -1) continue;
			this.targetEditor.replaceRange(
				replacement,
				{ line: i, ch: idx },
				{ line: i, ch: idx + PLACEHOLDER.length }
			);
			return;
		}
	}

	private resetAll() {
		this.state = "idle";
		this.targetEditor = null;
		this.completedCycles = 0;
		this.statusBarEl.setText("");
	}

	private clearTimer() {
		if (this.timerInterval !== null) {
			window.clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class PomodoroSettingTab extends PluginSettingTab {
	plugin: PomodoroLoggerPlugin;

	constructor(app: App, plugin: PomodoroLoggerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "뽀모도로 설정" });

		new Setting(containerEl)
			.setName("타이머 시간 (분)")
			.setDesc("뽀모도로 세션 시간 (최소: 1분, 기본: 25분, 최대: 120분)")
			.addText((text) =>
				text
					.setPlaceholder("25")
					.setValue(this.plugin.settings.durationMinutes.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num >= 1 && num <= 120) {
							this.plugin.settings.durationMinutes = num;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("시작 글귀 형식")
			.setDesc(
				"F6 누를 때 줄 끝에 삽입. ⏳]는 완료 시각이 들어갈 자리표시자입니다. 토큰: YYYY, MM, DD, HH, mm"
			)
			.addText((text) =>
				text
					.setPlaceholder("🍅 [YYYY-MM-DD HH:mm ~ ⏳]")
					.setValue(this.plugin.settings.startTemplate)
					.onChange(async (value) => {
						this.plugin.settings.startTemplate =
							value || "🍅 [YYYY-MM-DD HH:mm ~ ⏳]";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("완료 글귀 형식")
			.setDesc("완료 시 ⏳]를 대체할 텍스트. 토큰: YYYY, MM, DD, HH, mm")
			.addText((text) =>
				text
					.setPlaceholder("HH:mm]")
					.setValue(this.plugin.settings.endTemplate)
					.onChange(async (value) => {
						this.plugin.settings.endTemplate = value || "HH:mm]";
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "사이클 모드" });

		new Setting(containerEl)
			.setName("사이클 모드 활성화")
			.setDesc(
				"작업→휴식은 자동, 휴식→작업은 F6 수동. 4회 완료 후 긴 휴식. (기본: 비활성)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.cycleEnabled)
					.onChange(async (value) => {
						this.plugin.settings.cycleEnabled = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("짧은 휴식 (분)")
			.setDesc("작업 완료 후 짧은 휴식 시간 (기본: 5분)")
			.addText((text) =>
				text
					.setPlaceholder("5")
					.setValue(this.plugin.settings.shortBreakMinutes.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num >= 1 && num <= 60) {
							this.plugin.settings.shortBreakMinutes = num;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("긴 휴식 (분)")
			.setDesc("사이클 완료 후 긴 휴식 시간 (기본: 15분)")
			.addText((text) =>
				text
					.setPlaceholder("15")
					.setValue(this.plugin.settings.longBreakMinutes.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num >= 1 && num <= 120) {
							this.plugin.settings.longBreakMinutes = num;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("사이클당 작업 횟수")
			.setDesc("긴 휴식 전 반복할 작업 횟수 (기본: 4)")
			.addText((text) =>
				text
					.setPlaceholder("4")
					.setValue(this.plugin.settings.cyclesBeforeLongBreak.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num >= 1 && num <= 10) {
							this.plugin.settings.cyclesBeforeLongBreak = num;
							await this.plugin.saveSettings();
						}
					})
			);
	}
}
