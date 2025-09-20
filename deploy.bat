@echo off
echo GitHub Pages 배포 시작...

REM 현재 브랜치 확인
git branch

REM gh-pages 브랜치로 전환 (없으면 생성)
git checkout -b gh-pages 2>nul || git checkout gh-pages

REM 모든 파일 삭제 (git 추적 파일만)
git rm -rf .

REM dist 폴더 내용을 루트로 복사
xcopy /E /Y dist\* .

REM supabase-config.js 복사
copy supabase-config.js .

REM 변경사항 추가 및 커밋
git add .
git commit -m "Deploy to GitHub Pages"

REM GitHub에 푸시
git push origin gh-pages

REM 메인 브랜치로 돌아가기
git checkout main

echo 배포 완료!
echo https://beeper9-source.github.io/AQUA/ 에서 확인하세요.
pause
