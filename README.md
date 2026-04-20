# Pomodoro Logger

An Obsidian plugin that starts a Pomodoro timer via a configurable hotkey and records start/end times inline at the cursor position in your markdown document.

## Features

- Start/cancel a Pomodoro timer with a single command (hotkey assignable in Obsidian settings)
- Inserts a timestamp at the cursor line; the end time automatically replaces a placeholder when the timer completes
- Customizable start/end text templates with tokens: `YYYY`, `MM`, `DD`, `HH`, `mm`
- Optional cycle mode with short breaks and long breaks (4-cycle Pomodoro technique)
- Status bar display of remaining time

## Usage

1. Place the cursor on the line where you want to log
2. Run the **"Pomodoro 시작/취소"** command (assign a hotkey via Settings → Hotkeys)
3. A start marker (e.g., `🍅 [2026-04-20 14:30 ~ ⏳]`) is inserted at the end of the line
4. When the timer ends, the `⏳]` placeholder is replaced with the end time (e.g., `14:55]`)

## Installation

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/HEONO3H/pomodoro-logger/releases/latest)
2. Copy them to your vault's `.obsidian/plugins/pomodoro-logger/` folder
3. Reload Obsidian → Settings → Community plugins → Enable

### BRAT (beta)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. BRAT settings → `Add Beta Plugin` → enter `HEONO3H/pomodoro-logger`

## Settings

- **Timer duration (minutes)**: default 25
- **Start text template**: default `🍅 [YYYY-MM-DD HH:mm ~ ⏳]`
- **End text template**: default `HH:mm]`
- **Cycle mode**: enable/disable automatic short/long breaks
- **Short break / Long break duration**
- **Cycles before long break**: default 4

## License

MIT

---

## 한국어 (Korean)

Obsidian 플러그인 — 단축키로 뽀모도로 타이머를 시작하고, 현재 커서 줄 끝에 시작·종료 시각을 자동으로 기록합니다.

### 기능
- 명령어 하나로 타이머 시작/취소 (단축키는 Obsidian 설정에서 직접 지정)
- 시작 시 현재 줄 끝에 타임스탬프 삽입, 타이머 완료 시 자리표시자(`⏳]`)가 종료 시각으로 자동 치환
- 시작/종료 글귀 형식 커스터마이즈 (`YYYY`, `MM`, `DD`, `HH`, `mm` 토큰)
- 사이클 모드 (짧은 휴식 + 4회 완료 후 긴 휴식)
- 상태 바에 남은 시간 표시

### 사용법
1. 기록할 줄에 커서를 두고
2. **"Pomodoro 시작/취소"** 명령 실행 (Settings → Hotkeys에서 단축키 지정 가능)
3. 줄 끝에 시작 기록이 삽입됨 (예: `🍅 [2026-04-20 14:30 ~ ⏳]`)
4. 타이머 종료 시 `⏳]`가 종료 시각으로 자동 교체됨 (예: `14:55]`)

### 설치
수동 설치: [최신 릴리스](https://github.com/HEONO3H/pomodoro-logger/releases/latest)에서 `main.js`, `manifest.json`, `styles.css`를 볼트의 `.obsidian/plugins/pomodoro-logger/`에 복사 후 재시작.

BRAT: `Add Beta Plugin` → `HEONO3H/pomodoro-logger` 입력.
