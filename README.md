# 社内AIエージェント開発用ライブラリ

**npm 10.8.2**  
**node v18.20.8** 

# セットアップ

## 1. 依存関係のインストール
```bash
npm install
```

## 2. 設定ファイルの作成
.envファイルに各種トークンを追加してください

## 3. APIキーの取得方法

### Redmine
1. **Redmineにログイン**
2. 右上の**ユーザー名をクリック** → **My account**
3. **API access key** セクションでキーを確認
4. キーが表示されていない場合は、**"Generate API key"**をクリック
5. 生成されたキーを`.env`の`REDMINE_API_KEY`に設定

### Slack
1. **Slack Appを作成**: https://api.slack.com/apps
2. **"Create New App"** → **"From scratch"**
3. **App name**を入力し、**Workspace**を選択
4. **OAuth & Permissions** → **Scopes** → **Bot Token Scopes**
5. **Bot Token Scopes に必要な権限を追加**:
   - `channels:history` (パブリックチャンネルのメッセージ閲覧)
   - `channels:read` (パブリックチャンネル情報の読み取り)
   - `chat:write` (メッセージ送信)
   - `chat:write.customize` (カスタム名前とアバターでメッセージ送信)
   - `chat:write.public` (未参加チャンネルへのメッセージ送信)
   - `search:read.users` (ユーザー検索)
   - `users:read` (ワークスペースのユーザー情報閲覧)
6. **User Token Scopes**も設定:
   - `channels:history` (パブリックチャンネルのメッセージ閲覧)
   - `channels:read` (パブリックチャンネル情報の読み取り)
   - `chat:write` (メッセージ送信)
   - `emoji:read` (カスタム絵文字の閲覧)
   - `files:read` (ファイル読み取り)
   - `search:read` (メッセージ検索)
7. **Install App**をクリック
8. **Bot User OAuth Token**をコピー（`xoxb-`で始まる）
9. **User OAuth Token**をコピー（`xoxp-`で始まる、必要に応じて）
10. `.env`の`SLACK_USER_OAUTH_TOKEN`にUser Tokenを設定
11. `.env`の`SLACK_BOT_USER_OAUTH_TOKEN`にBot Tokenを設定
12. `.env`の`SLACK_BOT_USER_NAME`にBotの表示名を設定

**Bot Token vs User Token**:
- **Bot Token** (`xoxb-`): ボットとしての権限でアクセス（メッセージ送信等）
- **User Token** (`xoxp-`): ユーザーとしての権限でアクセス（メッセージ履歴取得等）

### AWS Bedrock (Claude)

AIモデルを使用するには2通りの方法がある
- AWSコンソールで発行したAPIキーを設定
- 自分のAWSの認証情報を設定

**APIキーを設定する場合**:
1. AWSコンソールにログイン
2. dev-adminロールに切り替え
3. Amazon Bedrock画面に移動
4. APIキーメニューから長期APIキーを選択
5. 「長期APIキーを生成」を押下
6. 「APIキーの有効期限」の「有効期限なし」を選択してトークンを生成
7. 生成したトークンを`.env`の`AWS_BEARER_TOKEN_BEDROCK`に設定

**認証情報を設定する場合**:
1. 認証情報は入社時に付与されるのでそちらを使用
2. dev-adminロールが付与されていること
3. `.env`の`AWS_ACCESS_KEY_ID`にAccessKeyを設定
4. `.env`の`AWS_SECRET_ACCESS_KEY`にSecretを設定

# 使用方法

### ヘルプの表示
```bash
# 全体のヘルプ
npm run cli help

# プラットフォーム別のヘルプ
npm run cli help redmine
npm run cli help slack

# 全プラットフォームのコマンド一覧
npm run cli all-commands
```

# テスト

### ユニットテスト
```bash
# 全テストを実行
npm test

# watchモードで実行
npm run test:watch

# カバレッジを確認
npm run test:coverage
```

### E2Eテスト
```bash
# E2Eテストを実行（実際のAPIを呼び出します）
RUN_E2E_TESTS=true npm test -- --testPathPatterns=e2e

# 特定のプラットフォームのみ
RUN_E2E_TESTS=true npm test -- --testPathPatterns=faq.e2e
```

