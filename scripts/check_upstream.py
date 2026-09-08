# -*- coding: utf-8 -*-
"""check_upstream.py —— 检测 DeepSeek-Harness 上游新版本，写入【上游版本列表】表格。

- 表格列：版本号 | GitHub 发布 | npm 发布 | 更新说明(点击查看官方发布页)。
- 来源：上游 GitHub Releases + npm 包 @deepseek-ai/dsh（运行期查 registry.npmjs.org）。
- 版本匹配：GitHub tag（如 dsh-v0.1.3-alpha.1）规范化成 npm 版本（0.1.3-alpha.1）；未匹配标「—」。
- 幂等：已存在版本不重复插入；插入到表格分隔行之后（最新在上）。
- 由 GitHub Actions 定时调用；检测到新版本就提交（github token 推送，push 触发部署）。

用法：--sample 本地示例 / --apply 写入。
"""
import argparse
import datetime
import json
import os
import re
import sys

REPO = "deepseek-ai/deepseek-harness"
NPM_PKG = "@deepseek-ai/dsh"

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
STATE = os.path.join(ROOT, "state", "last_seen.json")

# 两个语言目标：zh 与 en。每个含文件路径 + 表格头 + 行模板 + "查看"列文案。
TARGETS = [
    {
        "path": os.path.join(ROOT, "docs", "upstream-version.md"),
        "lang": "zh",
        "header": ["版本号", "GitHub 发布", "npm 发布", "更新说明"],
        "view_label": "点击查看",
    },
    {
        "path": os.path.join(ROOT, "docs", "en", "upstream-version.md"),
        "lang": "en",
        "header": ["Version", "GitHub release", "npm release", "Notes"],
        "view_label": "View",
    },
]

SAMPLE = [
    {"tag_name": "dsh-v0.1.3-alpha.1", "published_at": "2026-09-02T10:00:00Z",
     "body": "新增多模态能力；改进子代理调度；修复若干问题。"},
    {"tag_name": "dsh-v0.1.2-rc.1", "published_at": "2026-08-20T10:00:00Z",
     "body": "优化插件系统；完善 Windows 运行时。"},
]
SAMPLE_NPM = {"0.1.3-alpha.1": "2026-09-02", "0.1.2-rc.1": "2026-08-21"}


def load_state():
    if os.path.exists(STATE):
        with open(STATE, encoding="utf-8-sig") as f:
            return json.load(f)
    return {"latest_tag": None, "seen_tags": []}


def save_state(state):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    with open(STATE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def fmt_date(iso):
    try:
        d = datetime.datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
        return d.strftime("%Y-%m-%d")
    except Exception:
        return str(iso)[:10]


def clean_text(text):
    """把官方 release body 净化成一行简短摘要：剥掉 HTML 标签、i18n 切换器、markdown。"""
    s = text or ""
    s = re.sub(r"<[^>]+>", " ", s)                  # HTML 标签
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", s)      # 图片
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)  # 链接 -> 文字
    s = re.sub(r"```.*?```", " ", s, flags=re.S)    # 代码块
    s = re.sub(r"^#{1,6}\s*", "", s, flags=re.M)    # 标题标记
    s = re.sub(r"[*_`~>#]", "", s)                   # 强调/代码/标题符
    s = s.replace("|", " ")                          # 竖线（含 中文|English 切换）-> 空格
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"^中文\s*English\s*", "", s)         # 去掉开头的 i18n 切换噪音
    s = s.replace("|", "\\|")                        # 保险：转义残存竖线
    if len(s) > 60:
        s = s[:60].rstrip() + "…"
    return s


def norm_version(tag):
    """GitHub tag -> npm 版本号：dsh-v0.1.3-alpha.1 -> 0.1.3-alpha.1"""
    v = tag or ""
    if v.startswith("dsh-"):
        v = v[4:]
    if v.startswith("v"):
        v = v[1:]
    return v


def get_npm_times(sample):
    if sample:
        return SAMPLE_NPM
    import requests
    try:
        r = requests.get("https://registry.npmjs.org/{0}".format(NPM_PKG), timeout=25)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print("[warn] 拉取 npm 信息失败：{0}".format(e))
        return {}
    times = data.get("time", {}) or {}
    return {v: fmt_date(t) for v, t in times.items()}


def make_row(rel, npm_times, view_label):
    tag = rel.get("tag_name", "?")
    date = fmt_date(rel.get("published_at", ""))
    link = "https://github.com/{0}/releases/tag/{1}".format(REPO, tag)
    # 匹配 npm 发布时间：优先规范化版本，其次原 tag
    npm_date = npm_times.get(norm_version(tag)) or npm_times.get(tag) or "—"
    return "| [{0}]({1}) | {2} | {3} | [{4}]({1}) |".format(tag, link, date, npm_date, view_label)


def insert_rows(path, rows, header):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    existing = set(re.findall(r"^\|\s*\[([^\]]+)\]", text, re.M))
    new_rows = [r for r in rows
                if re.match(r"^\|\s*\[([^\]]+)\]", r).group(1) not in existing]
    if not new_rows:
        return False, text
    lines = text.splitlines()
    sep_idx = next((i for i, l in enumerate(lines) if re.match(r"^\|\s*:?-{2,}", l)), None)
    if sep_idx is None:
        raise RuntimeError("upstream-version.md 找不到表格分隔行（| --- | --- |）")
    lines[sep_idx + 1:sep_idx + 1] = new_rows
    return True, "\n".join(lines)


def ensure_table(path, header, view_label, first_row):
    """若目标文件缺表格（en 页可能只有说明、无表格），则补一个含表头+分隔行+首行的表格。
    优先插入到 <!-- AUTO-INSERT-HERE --> 标记之后；无标记则追加到页面末尾。"""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    if re.search(r"^\|\s*:?-{2,}", text, re.M):
        return text  # 已有表格，不动
    head = "| {0} |".format(" | ".join(header))
    sep = "| " + " | ".join(["---"] * len(header)) + " |"
    table = head + "\n" + sep + "\n" + first_row + "\n"
    m = re.search(r"<!--\s*AUTO-INSERT-HERE[^>]*-->", text)
    if m:
        return text[:m.end()] + "\n\n" + table + text[m.end():]
    return text.rstrip() + "\n\n" + table


def get_releases(sample):
    if sample:
        return SAMPLE
    import requests
    releases = []
    page = 1
    while True:
        url = "https://api.github.com/repos/{0}/releases?per_page=100&page={1}".format(REPO, page)
        try:
            r = requests.get(url, timeout=25, headers={
                "Accept": "application/vnd.github+json",
                "User-Agent": "dsh-researcher",
            })
            r.raise_for_status()
        except Exception as e:
            print("[no-op] 抓取上游失败：{0}".format(e))
            return []
        data = r.json()
        if not isinstance(data, list) or not data:
            break
        releases.extend(data)
        if len(data) < 100:
            break
        page += 1
    if not releases:
        print("[no-op] 未获取到 release 数据")
        return []
    return releases


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="写入版本列表（缺省 dry-run）")
    ap.add_argument("--sample", action="store_true", help="用内置示例数据本地验证")
    args = ap.parse_args()

    releases = get_releases(args.sample)
    if not releases:
        return 0
    npm_times = get_npm_times(args.sample)

    state = load_state()
    seen = set(state.get("seen_tags", []))
    new = [rel for rel in releases if rel.get("tag_name") not in seen]
    latest = releases[0].get("tag_name", "?")

    if not new:
        print("[no-op] 无新版本（当前最新 {0}）".format(latest))
        return 0

    print("[detect] 发现 {0} 个新版本：{1}".format(len(new), ", ".join(r["tag_name"] for r in new)))

    if not args.apply:
        print("[dry-run] 将插入：")
        for r in new:
            row_zh = make_row(r, npm_times, TARGETS[0]["view_label"])
            print("   ", row_zh)
        print("[dry-run] 加 --apply 才会写入。")
        return 0

    any_changed = False
    for tgt in TARGETS:
        # en 目标页若是"无表格"的 stub，先补一个空表格（含首行），再正常插入
        row = make_row(new[0], npm_times, tgt["view_label"])
        clean = ensure_table(tgt["path"], tgt["header"], tgt["view_label"], row)
        if clean != open(tgt["path"], encoding="utf-8").read():
            with open(tgt["path"], "w", encoding="utf-8") as f:
                f.write(clean)
            any_changed = True
        rows = [make_row(rel, npm_times, tgt["view_label"]) for rel in new]
        changed, new_text = insert_rows(tgt["path"], rows, tgt["header"])
        if changed:
            with open(tgt["path"], "w", encoding="utf-8") as f:
                f.write(new_text)
            any_changed = True
            print("[write] {0}: 插入 {1} 行".format(tgt["lang"], len(rows)))

    if not any_changed:
        print("[no-op] 新版本已在列表中，跳过")
    else:
        state["latest_tag"] = latest
        state["seen_tags"] = sorted(seen | {r["tag_name"] for r in new})
        save_state(state)
        print("[write] 完成；latest={0}".format(latest))
    return 0


if __name__ == "__main__":
    sys.exit(main())
