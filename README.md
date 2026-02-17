# 勤怠データ自動集計AIダッシュボード

**EARTHBRAIN エンプロイーサクセス部門向けMVP**

Claude AIを活用した勤怠データの自動エラー検知・集計・レポート生成システム

## 🎯 このプロジェクトについて

このダッシュボードは、EARTHBRAIN ES部門の勤怠データ集計業務を自動化・効率化するために開発されたデモシステムです。

### 解決する課題

- ✅ 月次勤怠集計の手作業（8時間 → 30秒に短縮）
- ✅ エラーチェックの属人化と見落とし（AIが自動検知）
- ✅ 集計レポート作成の工数（AIが自然言語で生成）
- ✅ データの可視化不足（リアルタイムダッシュボード）

### 主な機能

1. **Excelファイルのドラッグ&ドロップアップロード**
2. **Claude AIによる高精度エラー検知**
   - 欠損データ（出勤/退勤時刻の空白）
   - 論理矛盾（退勤時刻 < 出勤時刻）
   - 異常値（残業時間100時間超）
3. **自動集計**
   - 月次サマリー（総労働時間、総残業時間、平均値）
   - 部署別集計
   - 個人別集計
4. **AIレポート自動生成**
   - 自然言語での月次レポート
   - 傾向分析と推奨アクション
5. **インタラクティブダッシュボード**
   - KPIカード表示
   - 残業時間推移グラフ（折れ線グラフ）
   - 部署別残業ランキング（棒グラフ）

---

## 🚀 クイックスタート

### 1. 環境要件

- Node.js 18以上
- npm または yarn
- Anthropic API Key（[こちら](https://console.anthropic.com/)から取得）

### 2. インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd earthbrain-attendance-dashboard

# 依存関係をインストール
npm install
```

### 3. 環境変数の設定

```bash
# .env.local ファイルを作成
cp .env.example .env.local

# .env.local を編集してAPIキーを設定
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### 5. デモ用サンプルデータの使用

ブラウザでダッシュボードにアクセスすると、2種類のサンプルファイルをダウンロードできます：

1. **クリーンデータ（エラーなし）** - `attendances_sample.xlsx`
   - 320件の正常な勤怠データ
   - エラー検知結果: 0件
   - 基本的な集計機能のデモに最適

2. **デモ用データ（エラー含む）** - `attendances_with_errors.xlsx`
   - 320件の勤怠データ + 6件の意図的なエラー
   - エラー検知機能のデモに最適
   - エラー内訳: 欠損3件、論理矛盾2件、異常値1件

#### 使い方
1. ダッシュボードの「SAMPLE FILES FOR TESTING」からファイルをダウンロード
2. ダウンロードしたファイルをドラッグ&ドロップ
3. AIがデータを解析（3〜5秒）
4. ダッシュボードとレポートが表示される

---

## 📂 プロジェクト構造

```
earthbrain-attendance-dashboard/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # Excel解析・AI処理API
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # ルートレイアウト
│   └── page.tsx                  # メインページ
├── components/
│   ├── AIReport.tsx              # AIレポート表示コンポーネント
│   ├── Dashboard.tsx             # ダッシュボード・グラフ表示
│   ├── ErrorList.tsx             # エラーリスト表示
│   └── FileUpload.tsx            # ファイルアップロード
├── lib/
│   ├── claude-client.ts          # Claude API連携
│   ├── excel-parser.ts           # Excel解析・集計ロジック
│   └── types.ts                  # TypeScript型定義
├── public/
│   └── attendances_sample.xlsx   # デモ用サンプルデータ
├── scripts/
│   └── generate-sample-data.js   # サンプルデータ生成スクリプト
├── .env.example                  # 環境変数サンプル
├── .gitignore
├── package.json
├── README.md
├── tailwind.config.ts            # Tailwind CSS設定
└── tsconfig.json                 # TypeScript設定
```

---

## 🧪 サンプルデータの詳細

プロジェクトには2種類のサンプルファイルが用意されています：

### 1. クリーンデータ (`attendances_sample.xlsx`, `attendances_clean.xlsx`)
- **社員数**: 20名（開発部7名、営業部6名、管理部7名）
- **期間**: 2024年11月（22営業日）
- **総データ件数**: 320件
- **エラー**: 0件（すべて正常データ）
- **用途**: 基本的な集計機能のデモ、正常系のテスト

### 2. エラー含むデータ (`attendances_with_errors.xlsx`)
- **社員数**: 20名（開発部7名、営業部6名、管理部7名）
- **期間**: 2024年11月（22営業日）
- **総データ件数**: 320件
- **意図的に仕込んだエラー**:
  - 欠損データ: 3件（出勤時刻が空白）
  - 論理矛盾: 2件（出勤・退勤時刻の逆転）
  - 異常値: 1件（残業時間120時間超）
- **用途**: エラー検知機能のデモ、面接でのプレゼン

### 新しいサンプルデータを生成する場合

```bash
# クリーンなデータを生成
node scripts/generate-clean-sample.js

# エラーを含むデータを生成
node scripts/generate-sample-data.js
```

---

## 🔧 技術スタック

| カテゴリ           | 技術                          |
| ------------------ | ----------------------------- |
| フロントエンド     | React 18 + TypeScript         |
| フレームワーク     | Next.js 14 (App Router)       |
| スタイリング       | Tailwind CSS 3                |
| グラフ可視化       | Recharts 2                    |
| AI                 | Claude Sonnet 4.5 (Anthropic) |
| Excelファイル処理  | xlsx                          |
| デプロイ           | Vercel                        |

---

## 📊 デプロイ手順（Vercel）

### 1. Vercelアカウント作成

[https://vercel.com/](https://vercel.com/) でアカウント作成

### 2. GitHubリポジトリと連携

```bash
# GitHubにプッシュ
git init
git add .
git commit -m "Initial commit: EARTHBRAIN勤怠ダッシュボード"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 3. Vercelでプロジェクトをインポート

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. Framework Preset: **Next.js** を選択
4. 環境変数を設定:
   - `ANTHROPIC_API_KEY`: Anthropic API Key
5. 「Deploy」をクリック

### 4. デプロイ完了

数分でデプロイが完了し、URLが発行されます（例: `https://earthbrain-attendance-dashboard.vercel.app`）

---

## 🎤 面接でのデモスクリプト

### シナリオ（30秒デモ）

1. **導入**（5秒）
   「実は、御社のES部門向けにデモシステムを作ってきました」

2. **デモURL共有**（5秒）
   画面共有で `https://earthbrain-attendance-dashboard.vercel.app` を表示

3. **ファイルアップロード**（5秒）
   `attendances_sample.xlsx` をドラッグ&ドロップ

4. **AI解析**（3秒）
   「AIがデータを解析中...」と表示

5. **結果表示**（7秒）
   - エラー検知結果: 「6件のエラーを検出」
   - ダッシュボード: グラフとKPIカードが表示
   - AIレポート: 自然言語の月次レポートが表示

6. **クロージング**（5秒）
   「これ、明日から使えます。ソースコードはGitHubで公開しています」

### 期待される反応

> 「...これ、本当に一人で作ったの？入社初日から使えるレベルだ。」

---

## 🛡️ セキュリティとプライバシー

- **API Key管理**: 環境変数でセキュアに管理
- **データ保存**: アップロードされたファイルはメモリ上で処理され、サーバーに保存されません
- **HTTPS**: Vercelは自動的にHTTPSで配信
- **CORS**: 同一オリジンのみアクセス可能

---

## 📝 ライセンス

このプロジェクトは小清水晶のポートフォリオ用に作成されたデモシステムです。

---

## 👤 開発者

**小清水晶**

- **職歴**: BATジャパン（380万円コスト削減提案実績）
- **スキル**: React Native / TypeScript / Claude Code / Lovable / Bolt AI
- **専門**: プロンプトエンジニアリング / AI高速開発
- **応募先**: 株式会社EARTHBRAIN エンプロイーサクセス部門

---

## 🙏 Acknowledgments

- **Claude Sonnet 4.5** by Anthropic - AI解析・レポート生成
- **Next.js** - フレームワーク
- **Recharts** - グラフ可視化
- **Tailwind CSS** - UIデザイン

---

## 📧 お問い合わせ

面接担当者の方へ: このシステムに関するご質問は面接時にお気軽にお声がけください。
