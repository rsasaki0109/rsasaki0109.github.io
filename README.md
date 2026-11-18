# rsasaki0109.github.io

このリポジトリは `rsasaki0109` の自己紹介ページです。

- 主要リンク: X（旧Twitter）/ GitHub
- CloudAnalyzer のブラウザデモは `/cloudanalyzer/` に同梱（トップからの強い導線は置いていない）
- GitHub profile README の `Featured Repositories` を preview 画像/GIFつきで掲載
- AI Flow Builder など最近の TypeScript/Web 実装も掲載
- GitHub API からプロフィール統計と各リポジトリの補足情報を取得
- X の人気投稿を公開キャッシュから表示
- モバイル対応の1ページ構成（日本語 / 英語）

## 公開方法（GitHub Pages）

1. このフォルダを Git リポジトリに配置し、`main` ブランチへ Push
2. GitHub で Settings → Pages を開き、Source を `GitHub Actions` に設定
3. 必要なら、カスタムドメインを DNS で設定して独自ドメインへ向ける
4. 現在は `https://rsasaki0109.github.io/` で公開しています

## ローカル確認

```bash
cd rsasaki0109.github.io
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開く。

## X投稿の自動更新

- `/.github/workflows/update-tweets.yml` が毎日 03:00 UTC に `data/tweets.json` を更新します。
- 更新は `r.jina.ai` 経由で `x.com/rsasaki0109` のページを取得して簡易パースします。
- GitHub Actions が失敗した場合は、既存の `data/tweets.json` を維持します。

## lidar_slamの旧ドキュメントURL

検索結果や既存リンクに残る `/lidar_slam_ros2/` 配下のドキュメントを、改名後の `/lidar_slam/` へ案内する互換HTMLを配信します。対応パスは `data/lidar-slam-legacy-routes.json` で管理し、公開前に生成します。GitHubリポジトリそのものの旧名転送設定は変更しません。

```bash
python3 -m unittest discover -s tests -v
python3 scripts/build_legacy_lidar_redirects.py
python3 -m http.server 8000
```

生成された `lidar_slam_ros2/` はgit管理対象外です。JavaScript有効時はクエリ・フラグメントを保持して新URLへ移動し、無効時はmeta refreshと手動リンクを提供します。これは静的HTMLによる互換導線で、HTTP 301ではありません。検索エンジンの更新・評価の引き継ぎは保証しません。公開後は実際の旧URLを開いて確認してください。

現在のPages設定はmainブランチからの配信にも対応するため、生成済みの `lidar_slam_ros2/` HTMLをコミットしています。マッピングや生成処理を変更したら再生成し、HTMLも同じコミットに含めてください。PRのチェックで生成結果との一致を確認します。
