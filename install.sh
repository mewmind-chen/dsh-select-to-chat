#!/usr/bin/env bash
# dsh-select-to-chat 安装/更新脚本（幂等，可重复执行）
#
# 正确的注册路线（与 dsh-pocket 等已装插件一致）：
#   1) 包放进 <profile>/node_modules/
#   2) 包名加入 <profile>/package.json 的 dsh.profile.bundles
#   3) 包自带的 cordis.patch.yml 在启动组合时插入 loader 条目
#
# 注意：不要往 profile 的 cordis.patch.yml 里 insert 本包 —— 那条路线在
# 运行中宿主里按 loader 闭包解析裸包名会失败；且与 bundles 路线重复插入
# 会导致启动失败。
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
PROFILE="${DSH_PROFILE_DIR:-$HOME/.dsh/profiles/web}"
DEST="$PROFILE/node_modules/dsh-select-to-chat"
PKGJSON="$PROFILE/package.json"

# 防呆：本脚本必须运行在 DSH 所在环境（容器/服务器）内，且 $HOME/.dsh 指向
# 真实的 profile。在别的机器上直跑会把插件装错地方。
if [ ! -f "$PROFILE/cordis.yml" ] || [ ! -f "$PROFILE/pnpm-workspace.yaml" ]; then
  echo "错误：$PROFILE 不像一个 dsh profile（缺 cordis.yml / pnpm-workspace.yaml）。" >&2
  echo "请在 DSH 所在环境内运行本脚本，或用 DSH_PROFILE_DIR 指定正确的 profile 目录。" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST")"
rm -rf "$DEST"
cp -r "$SRC" "$DEST"
rm -rf "$DEST/.git"
rm -f "$DEST/install.sh"
echo "installed: $DEST"

DSH_PKG_JSON="$PKGJSON" node - <<'JS'
const fs = require('fs');
const path = process.env.DSH_PKG_JSON;
const p = JSON.parse(fs.readFileSync(path, 'utf8'));
p.dsh = p.dsh || {};
p.dsh.profile = p.dsh.profile || {};
p.dsh.profile.bundles = p.dsh.profile.bundles || [];
if (!p.dsh.profile.bundles.includes('dsh-select-to-chat')) {
  p.dsh.profile.bundles.push('dsh-select-to-chat');
  fs.writeFileSync(path, JSON.stringify(p, null, 2) + '\n');
  console.log('registered in dsh.profile.bundles');
} else {
  console.log('already in dsh.profile.bundles');
}
JS

echo "完成。需要重启 dsh web 后生效（例如在 dshmarket 设置里点重启，或重启容器）。"
