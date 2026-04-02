# rsasaki0109.github.io

このリポジトリは `rsasaki0109` の自己紹介ページです。

- 主要リンク: X（旧Twitter）/ GitHub
- GitHub profile README の `Selected Repositories` を中心に掲載
- GitHub API からプロフィール統計と各リポジトリの補足情報を取得
- モバイル対応のシンプルな1ページ構成

## 公開方法（GitHub Pages）

1. このフォルダを Git リポジトリに配置し、`main` ブランチへ Push
2. GitHub で Settings → Pages を開き、Source を `GitHub Actions` に設定
3. 必要なら、カスタムドメインを DNS で設定して独自ドメインへ向ける
4. 現在は `https://rsasaki0109.github.io/` で公開しています

## ローカル確認

```bash
cd /workspace/ai_coding_ws/rsasaki0109_jp_ws
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開く。

## X投稿の自動更新

- `/.github/workflows/update-tweets.yml` が毎日 03:00 UTC に `data/tweets.json` を更新します。
- 更新は `r.jina.ai` 経由で `x.com/rsasaki0109` のページを取得して簡易パースします。
- GitHub Actions が失敗した場合は、既存の `data/tweets.json` を維持します。
