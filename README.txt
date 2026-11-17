LapStock 개인용 재고 관리 - Render 배포 안내

구성 파일
- index.html : 화면
- styles.css : 디자인
- app.js : 재고/이력/발주/위치 및 저장 기능
- manifest.json, sw.js, icon-192.png, icon-512.png : 모바일 홈 화면 및 캐시

Render 배포
1. GitHub에서 새 Public 또는 Private 저장소를 만듭니다. 예: LapStock
2. 이 폴더 안의 파일 7개를 저장소 최상위(root)에 업로드합니다.
3. Render에 로그인하고 New + -> Static Site를 선택합니다.
4. 방금 만든 GitHub 저장소를 연결합니다.
5. 설정은 Build Command 비워두기, Publish Directory는 . 로 입력합니다.
6. Create Static Site를 눌러 배포합니다.
7. 배포가 끝나면 Render가 제공하는 onrender.com 주소로 접속합니다.

사용 및 데이터 주의
- 로그인이나 Supabase 설정은 필요 없습니다.
- 데이터는 사용 중인 브라우저의 localStorage에 저장됩니다.
- 같은 기기의 같은 브라우저에서 데이터가 유지됩니다. 다른 기기/브라우저와 자동 동기화되지 않습니다.
- 브라우저 데이터 삭제, 시크릿 모드 사용, 기기 변경 시 데이터가 사라질 수 있습니다.
- 상단 다운로드 버튼으로 JSON 백업을 자주 저장하세요. 백업 복원 기능은 추후 추가할 수 있습니다.
- 엑셀 가져오기는 첫 번째 시트의 첫 행에 '품목명' 열이 있어야 합니다. 지원 열: 분류, 수량/재고, 단위, 최소 재고, 제조사, 제품 번호, 보관 위치, 유효기간, 메모.
