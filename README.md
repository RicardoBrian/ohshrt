# oh sh.rt

비밀번호로 보호되는 관리 페이지와 누구나 접근 가능한 단축 URL을 제공하는
Cloudflare Pages 기반 URL 단축기입니다.

## 기능

- 관리 페이지(`/`)는 비밀번호 입력 후에만 접근 가능
- 단축된 URL(`/코드`)은 누구나 접근 가능 (302 리다이렉트)
- 원본 URL 입력 시 자동 코드 생성, 또는 커스텀 코드 지정 가능
- 관리 페이지에서 링크 목록 조회 / 복사 / 삭제
- 별도 빌드 과정 없는 순수 HTML/CSS/JS + Cloudflare Pages Functions

## 로컬 개발

```bash
npm install

# KV 네임스페이스 생성 (최초 1회)
npx wrangler kv namespace create LINKS
# 출력된 id를 wrangler.toml의 id 값에 넣어주세요

# 로컬 환경변수 설정 (.dev.vars 파일 생성, git에는 커밋되지 않음)
cat <<'EOF' > .dev.vars
ADMIN_PASSWORD=여기에_원하는_비밀번호
SESSION_SECRET=여기에_임의의_긴_랜덤_문자열
EOF

npm run dev
```

`http://localhost:8788` 에서 확인할 수 있습니다.

## Cloudflare Pages 배포

1. 이 저장소를 GitHub에 push 합니다.
2. Cloudflare 대시보드 → **Workers & Pages** → **Create application** → **Pages** →
   **Connect to Git** 에서 이 저장소를 선택합니다.
3. 빌드 설정:
   - Build command: (비워둠)
   - Build output directory: `public`
4. **Settings → Functions → KV namespace bindings** 에서
   `LINKS` 라는 이름으로 위에서 만든 KV 네임스페이스를 연결합니다.
5. **Settings → Environment variables** 에서 다음 값을 **Secret**으로 추가합니다:
   - `ADMIN_PASSWORD`: 관리 페이지 비밀번호
   - `SESSION_SECRET`: 세션 쿠키 서명용 임의의 긴 랜덤 문자열
   (Production과 Preview 환경 둘 다 설정하는 것을 권장합니다.)
6. 배포가 끝나면 `프로젝트명.pages.dev` 주소가 자동으로 생성됩니다.
   이후 **Custom domains** 에서 원하는 도메인을 연결할 수 있습니다.

## 구조

```
functions/
  _utils.js          공용 세션/쿠키 유틸
  [code].js          공개 리다이렉트 (/코드)
  api/
    login.js         비밀번호 검증, 세션 쿠키 발급
    logout.js        세션 쿠키 삭제
    session.js        로그인 상태 확인
    links.js          목록 조회(GET) / 생성(POST)
    links/[code].js   삭제(DELETE)
public/
  index.html, style.css, app.js   프론트엔드 (SPA)
wrangler.toml         KV 바인딩 및 Pages 설정
```
