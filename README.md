# normal-distribution-visualizer

😴😴😴 正規分布の可視化ツールです！  

[![ci](https://github.com/osawa-koki/normal-distribution-visualizer/actions/workflows/ci.yml/badge.svg)](https://github.com/osawa-koki/normal-distribution-visualizer/actions/workflows/ci.yml)
[![cd](https://github.com/osawa-koki/normal-distribution-visualizer/actions/workflows/cd.yml/badge.svg)](https://github.com/osawa-koki/normal-distribution-visualizer/actions/workflows/cd.yml)
[![Dependabot Updates](https://github.com/osawa-koki/normal-distribution-visualizer/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/osawa-koki/normal-distribution-visualizer/actions/workflows/dependabot/dependabot-updates)

## 実行方法

```shell
# モジュールのインストール
npm install

# 開発用実行
npm run dev

# ビルド
npm run build
```

Dockerを使用する場合は以下のコマンドを実行してください。  

```shell
# Dockerイメージのビルド
docker build -t normal-distribution-visualizer .

# Dockerコンテナの実行
docker run --rm -d -p 80:80 --name normal-distribution-visualizer normal-distribution-visualizer
```
