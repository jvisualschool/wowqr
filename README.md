# WOWQR

<p align="center">
  <img src="public/QR.png" alt="WOWQR Logo" width="120" />
</p>

<p align="center">
  <strong>빠르고 아름다운 QR 코드 생성기</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

---

## ✨ 주요 기능

### 🎨 QR 코드 생성
- **URL 입력**: 웹사이트 주소를 입력하여 즉시 QR 코드 생성
- **크기 조절**: 128px ~ 1024px 범위에서 자유롭게 크기 설정
- **색상 커스터마이징**: QR 코드 색상과 배경색을 자유롭게 변경
- **다운로드**: PNG, JPG, SVG 형식으로 다운로드 가능
- **실시간 미리보기**: 설정 변경 시 즉시 결과 확인

### 📷 QR 코드 스캔
- **이미지 업로드**: QR 코드 이미지 파일 업로드로 내용 확인
- **드래그 앤 드롭**: 간편한 드래그 앤 드롭 지원
- **URL 감지**: 스캔된 내용이 URL인 경우 바로 이동 가능
- **복사 기능**: 스캔 결과를 클립보드에 복사

### 🎭 다양한 테마
- **라이트 테마**: 밝고 깔끔한 기본 테마 ☀️
- **다크 테마**: 눈이 편안한 어두운 테마 🌙
- **블루 테마**: 화사하고 상쾌한 블루 테마 ⭐

### 🚀 파티클 애니메이션
- URL 입력 시 도트들이 화면에서 날아와 QR 코드로 조립되는 역동적인 애니메이션

---

## 🖼️ 스크린샷

<p align="center">
  <img src="public/splash.jpg" alt="WOWQR Splash" width="600" />
</p>

---

## 🛠️ 기술 스택

| 기술 | 설명 |
|------|------|
| **React** | UI 컴포넌트 라이브러리 |
| **Vite** | 빠른 빌드 도구 |
| **TypeScript** | 타입 안정성 |
| **Tailwind CSS** | 유틸리티 기반 CSS |
| **Framer Motion** | 애니메이션 라이브러리 |
| **qrcode.react** | QR 코드 생성 |
| **jsQR** | QR 코드 스캔 |
| **Lucide Icons** | 아이콘 라이브러리 |

---

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/wowqr.git

# 디렉토리 이동
cd wowqr

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

---

## 📁 프로젝트 구조

```
QR_Master/
├── public/
│   ├── QR.png          # 로고 아이콘
│   ├── splash.jpg      # 스플래시 이미지
│   └── favicon.svg     # 파비콘
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── tabs.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── QRApp.tsx       # 메인 앱 컴포넌트
│   ├── index.css       # 글로벌 스타일
│   └── main.tsx        # 엔트리 포인트
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🎯 사용법

1. **QR 코드 생성**
   - "코드 생성" 탭 선택
   - URL 입력란에 원하는 주소 입력
   - 슬라이더로 크기 조절
   - 색상 선택
   - 원하는 형식으로 다운로드

2. **QR 코드 스캔**
   - "코드 스캔" 탭 선택
   - QR 코드 이미지를 드래그하거나 파일 선택
   - 스캔 결과 확인 및 복사/이동

3. **테마 변경**
   - 헤더 우측의 테마 아이콘 클릭
   - ☀️ 라이트 → 🌙 다크 → ⭐ 블루 순환

4. **스플래시 모달**
   - 헤더의 QR 아이콘 클릭으로 앱 정보 확인

---

## 📝 라이선스

© 2026 Jinho Jung. All rights reserved.

---

## 🤝 기여하기

이슈와 풀 리퀘스트를 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ and Framer Motion
</p>
