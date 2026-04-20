# Pomodoro Logger

Obsidian 플러그인 — F6 키로 뽀모도로 타이머를 시작하고, 완료 기록을 현재 커서 줄 끝에 자동으로 삽입합니다.

## 기능

- **F6** 키로 25분 뽀모도로 타이머 시작
- 타이머 완료 시 현재 줄 끝에 시작/종료 시각 자동 삽입
- 기록 형식 예시: `🍅 09:00–09:25`

## 설치 방법

### BRAT으로 설치 (베타)
1. Obsidian에서 [BRAT 플러그인](https://github.com/TfTHacker/obsidian42-brat) 설치
2. BRAT 설정에서 `Add Beta Plugin` 클릭
3. `HEONO3H/obsidian-pomodoro-logger` 입력 후 추가

### 수동 설치
1. [Releases](https://github.com/HEONO3H/obsidian-pomodoro-logger/releases/latest)에서 `main.js`, `manifest.json`, `styles.css` 다운로드
2. Obsidian 볼트의 `.obsidian/plugins/obsidian-pomodoro-logger/` 폴더에 파일 복사
3. Obsidian 재시작 후 설정 → 커뮤니티 플러그인에서 활성화

## 사용법

1. 마크다운 문서에서 기록하고 싶은 줄에 커서 위치
2. **F6** 키 입력 → 타이머 시작 알림 표시
3. 25분 후 자동으로 해당 줄 끝에 완료 기록 삽입

## 단축키 변경

설정 → 단축키 → `Pomodoro Logger` 검색 후 원하는 키로 변경 가능합니다.

## 라이선스

MIT
