# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git運用ルール

### コード変更後は必ずGitHubにプッシュする

コードに変更を加えるたびに、以下の手順でGitHubにプッシュすること。

```bash
git add <変更ファイル>
git commit -m "変更内容を端的に説明するメッセージ"
git push origin <ブランチ名>
```

- `git add .` や `git add -A` は使わず、変更したファイルを明示的に指定する
- コミットメッセージは変更の「なぜ」を意識して書く
- プッシュはコード変更のたびに行う（まとめてプッシュしない）
- mainブランチへの直接プッシュは避け、featureブランチ経由でPRを作成する

### ブランチ命名規則

```
feature/<機能名>
fix/<バグ内容>
refactor/<対象>
```
