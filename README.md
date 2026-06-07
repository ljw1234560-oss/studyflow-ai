# StudyFlow AI

StudyFlow AI는 대학생을 위한 AI 보조 학습 플래너 웹사이트입니다.
과제, 시험, 프로젝트 마감일을 관리하고 우선순위에 따라 오늘 집중할 공부를 추천합니다.

## 주요 기능

- 학습 할 일 추가, 완료, 삭제, 필터링
- 마감일까지 남은 날짜 자동 계산
- 전체, 완료, 진행 중, 긴급 항목 요약
- 진행률 퍼센트와 진행 바 표시
- 일정 상태에 따른 AI 스타일 학습 추천
- localStorage를 이용한 브라우저 저장
- 데스크톱과 모바일 반응형 화면 지원

## 페이지 구성

- `index.html`: 홈 화면과 전체 학습 현황
- `planner.html`: 학습 할 일 입력, 목록, 필터, 진행률 관리
- `assistant.html`: 현재 일정 기반 학습 추천
- `about.html`: 서비스 소개와 핵심 가치

## 기술 스택

- HTML
- CSS
- JavaScript
- localStorage
- GitHub Pages
- Vercel

## 로컬 실행

```bash
python3 -m http.server 8000
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:8000
```

## 프로젝트 구조

```text
studyflow-ai/
├── index.html
├── planner.html
├── assistant.html
├── about.html
├── style.css
├── script.js
├── README.md
├── .nojekyll
└── .github/
    └── workflows/
        └── pages.yml
```

## 배포 주소

GitHub Pages: https://ljw1234560-oss.github.io/studyflow-ai/

Vercel: https://studyflow-ai-zeta-brown.vercel.app
