# rsasaki0109.jp

このリポジトリは `rsasaki0109` の自己紹介ページです。

- 主要リンク: X（旧Twitter）/ GitHub
- GitHub API から公開リポジトリ情報を読み込み、スター数順で表示
- モバイル対応のシンプルな1ページ構成

## 公開方法（GitHub Pages）

1. このフォルダを Git リポジトリに配置し、`main` ブランチへ Push
2. GitHub で Settings → Pages を開き、Source を `GitHub Actions` に設定
3. DNS で `rsasaki0109.jp`（と必要なら `www.rsasaki0109.jp`）を Pages のIPへ向ける
4. `CNAME` を置いてあるため、デフォルトで `rsasaki0109.jp` で公開されます

## ローカル確認

```bash
cd /media/sasaki/aiueo/ai_coding_ws/rsasaki0109_jp_ws
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開く。

## X投稿の自動更新

- `/.github/workflows/update-tweets.yml` が毎日 03:00 UTC に `data/tweets.json` を更新します。
- 更新は `r.jina.ai` 経由で `x.com/rsasaki0109` のページを取得して簡易パースします。
- GitHub Actions が失敗した場合は、既存の `data/tweets.json` を維持します。
