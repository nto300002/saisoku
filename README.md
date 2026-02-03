# 催促文面添削アプリ

ビジネスシーンで使える丁寧な催促・リマインド文面にAIが添削するWebアプリケーション。

## 概要

ビジネスメールやチャットでの催促・リマインドは、伝え方次第で相手との関係性に影響を与えます。本アプリは、ユーザーが入力した催促文面をAIが添削し、相手に配慮しつつも要件が伝わる文面に変換します。

## 機能要件

### コア機能

| 機能 | 説明 |
|------|------|
| 文面入力 | ユーザーが催促・リマインド文面を入力 |
| AI添削 | 入力文面をAIが添削し、改善版を生成 |
| 改善ポイント表示 | 添削のポイントをMarkdown形式の箇条書きで解説 |
| コピー機能 | 添削結果をワンクリックでクリップボードにコピー |

### トーン設定

ユーザーの状況に応じて3段階のトーンを選択可能：

| トーン | 用途 | 特徴 |
|--------|------|------|
| やわらかめ | 関係維持重視 | 非常に丁寧、お願いベース、申し訳なさを前面に |
| ふつう | バランス型 | 標準的なビジネスマナー、礼儀正しく明確 |
| しっかり | 緊急性重視 | 期限・影響を具体的に、失礼にならない範囲で強め |

### サンプル文面

ワンクリックで入力できるサンプルを用意：

- **支払い催促**: 請求書の入金確認
- **返信催促**: メールの返信依頼
- **資料提出催促**: 期限超過の資料提出依頼

## UI/UXデザイン要件

### デザインコンセプト

**「ビジネスらしさを残しつつ、柔らかい雰囲気」**

参考: おかもと歯科医院のWebサイト（淡いコーラルピンク、丸みのあるUI、余白を活かしたデザイン）

### カラーパレット

```
Primary Background:  #FAF0ED (淡いコーラルピンク)
Card Background:     #FDF8F6 (オフホワイト)
Accent Color:        #E8A598 (コーラル)
Button Color:        #D4847A (ダークコーラル)
Text Primary:        #5A4A42 (ダークブラウン)
Text Secondary:      #8B7B73 (グレーブラウン)
Success:             #D5EAD8 / #F0F7F1 (ミントグリーン系)
Warning:             #FDF0DC / #FDF6ED (クリーム系)
```

### UIコンポーネント

| 要素 | スタイル |
|------|----------|
| カード | `rounded-3xl` 大きな角丸、薄いシャドウ |
| ボタン | `rounded-full` 完全な角丸、ホバー時にスケールアップ |
| テキストエリア | `rounded-2xl` 角丸、2px境界線 |
| 装飾テキスト | 縦書き（`writing-mode: vertical-rl`）、低透明度で背景に配置 |

### レイアウト

- 最大幅: `max-w-3xl`（768px）
- 中央配置、十分な余白（`px-6 py-12`）
- カード内パディング: `p-8 md:p-12`

### コピーライティング

- ヘッダー: 「やさしく、でも、きちんと伝わる文面に。」
- フッター: 「やさしい言葉は、やさしい関係をつくる。」
- 装飾テキスト: 「ふんわり」「やさしく」

## 技術スタック

| 技術 | 用途 |
|------|------|
| React | UIフレームワーク |
| TypeScript | 型安全な開発 |
| Vite | ビルドツール・開発サーバー |
| Tailwind CSS | スタイリング |
| react-markdown | Markdownレンダリング |
| react-ga4 | Google Analytics 4 統合 |
| pnpm | パッケージマネージャー |
| Gemini 2.5 Flash API | AI文面添削エンジン |
| Vercel | デプロイ・ホスティング |

## API仕様

### Gemini 2.5 API連携

**モデル**: `gemini-2.5-flash` (高速・汎用・推奨)

**エンドポイント**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

### リクエスト

AIへのプロンプト構造：

```
あなたはビジネス文書の添削専門家です。以下の催促・リマインド文面を添削してください。

【トーン設定】
{選択されたトーンの指示}

【添削対象の文面】
{ユーザー入力}

以下のJSON形式で回答してください（JSONのみ、他のテキストは不要）：
{
  "revised": "添削後の文面（改行は\\nで表現）",
  "feedback": "改善ポイントの説明（箇条書きで3-5点、改行は\\nで表現）"
}
```

### レスポンス

JSON形式で返却：

```json
{
  "revised": "添削後の文面",
  "feedback": "改善ポイントの説明（Markdown形式の箇条書き）"
}
```

**feedbackフィールド例**:
```markdown
- **クッション言葉の追加**: 「恐れ入りますが」を冒頭に追加し、柔らかい印象に
- **具体的な期限の明示**: 「○月○日まで」と具体的な日付を記載
- **感謝の表現**: 文末に「ご協力いただけますと幸いです」を追加
```

## ファイル構成

```
催促文面添削アプリ/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── page.tsx            # メインアプリケーション
```

## セットアップ

### 1. 依存関係インストール

```bash
pnpm install
```

### 2. 環境変数設定

`.env` ファイルを作成：

```env
# 必須: Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# 任意: Google Analytics Measurement ID
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

- **Gemini API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey) から取得
- **Google Analytics ID**: [Google Analytics](https://analytics.google.com/) で取得（任意）

### 3. 開発サーバー起動

```bash
pnpm dev
```

### 4. ビルド

```bash
pnpm build
```

### 5. Vercelへのデプロイ

```bash
# Vercel CLIをインストール（初回のみ）
pnpm add -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

または、GitHubリポジトリと連携して自動デプロイも可能です。

## Google Analytics 連携

アプリケーションには Google Analytics 4 が統合されており、以下のイベントをトラッキングします:

### トラッキングイベント

| イベント | カテゴリ | アクション | ラベル | 説明 |
|----------|----------|------------|--------|------|
| ページビュー | - | pageview | - | アプリ訪問時 |
| 添削成功 | Revision | revision_success | トーン種類 | 添削完了時 |
| サンプル使用 | User | use_sample | サンプル名 | サンプル文面クリック時 |
| トーン選択 | User | select_tone | トーン種類 | トーン変更時 |
| テキストコピー | User | copy_text | revised_text | コピーボタンクリック時 |
| APIエラー | Error | api_error | エラーメッセージ | API呼び出し失敗時 |
| 添削エラー | Error | revision_error | エラーメッセージ | 添削処理エラー時 |

### セットアップ方法

1. [Google Analytics](https://analytics.google.com/) でプロパティを作成
2. Measurement ID (形式: `G-XXXXXXXXXX`) を取得
3. `.env` ファイルに `VITE_GA_MEASUREMENT_ID` を設定

Google Analytics を使用しない場合は、環境変数を設定しなければトラッキングは無効化されます。

## 今後の拡張案

- [ ] 添削履歴の保存機能
- [ ] テンプレート機能（よく使う文面の登録）
- [ ] 多言語対応（英語催促文の添削）
- [ ] Slack/Teams連携
- [ ] ブラウザ拡張機能

## ライセンス

MIT License