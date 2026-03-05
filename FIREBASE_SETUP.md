# Firebase(Realtime Database) 설정

할일이 Firebase에 반영되려면 **Realtime Database**가 켜져 있고, **규칙**에서 `todos` 경로 읽기/쓰기가 허용되어 있어야 합니다.

## 1. Realtime Database 생성 여부 확인

1. [Firebase Console](https://console.firebase.google.com) 접속 후 프로젝트 **fir-todo-backend** 선택
2. 왼쪽 메뉴에서 **Build** → **Realtime Database** 클릭
3. 데이터베이스가 없다면 **데이터베이스 만들기** → 위치 선택(예: us-central1) → **테스트 모드로 시작** 선택 후 만들기

> ⚠️ 이 앱은 **Realtime Database**를 사용합니다. Firestore가 아니라 **Realtime Database** 메뉴에서 데이터를 확인하세요.

## 2. 규칙에서 읽기/쓰기 허용

1. **Realtime Database** 화면에서 **규칙** 탭 클릭
2. 아래처럼 `todos`에 읽기/쓰기 허용 후 **게시** 클릭

```json
{
  "rules": {
    "todos": {
      ".read": true,
      ".write": true
    }
  }
}
```

> ⚠️ 위 규칙은 **테스트용**입니다. 실제 서비스에서는 인증된 사용자만 허용하는 규칙으로 바꾸세요.

## 3. 데이터 확인

- **데이터** 탭에서 루트 아래 **todos** 노드가 생기고, 할일을 추가할 때마다 그 안에 항목이 쌓이는지 확인하세요.

## 4. 문제 해결 (할일이 Realtime Database에 안 뜰 때)

1. **로컬 서버로 실행**  
   `file://`로 HTML을 열면 Firebase 요청이 막힐 수 있습니다. 반드시 로컬 서버로 띄우세요.
   ```bash
   npx serve .
   ```
   또는 VS Code **Live Server**로 `index.html` 실행 후 접속 주소로 열기.

2. **브라우저 콘솔 확인**  
   F12 → **Console** 탭에서 `Firebase 저장 실패` 또는 `permission_denied` 등 에러 메시지 확인.

3. **databaseURL 일치 여부**  
   Firebase 콘솔 → **Realtime Database** → **데이터** 탭 상단에 나오는 URL과 앱의 `databaseURL`이 같아야 합니다.  
   - 기본: `https://fir-todo-backend-default-rtdb.firebaseio.com` (끝에 `/` 없음)  
   - 다른 리전이면 예: `https://fir-todo-backend-default-rtdb.asia-northeast1.firebasedatabase.app`

4. **규칙 다시 게시**  
   **규칙** 탭에서 위 JSON으로 수정한 뒤 반드시 **게시** 버튼을 눌렀는지 확인하세요.
