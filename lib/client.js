/**
 * dsh-select-to-chat — 浏览器半边（手写 __ModuleLoader__ bundle，无构建步骤）。
 *
 * Codex 风格的「划词添加到对话」：
 *   1. 在对话区（或页面任意非输入区）划选文本 → 原地弹出评论输入框（可留空）
 *   2. 回车 / 点 ✓ 添加 → 选区上方出现蓝色编号角标，可无限添加
 *   3. 输入框上方出现「N 条注释」清单：每条含「所选文本 / 用户评论」，支持 ✎ 编辑、🗑 删除
 *   4. 添加时同步把「引用块 + 评论」追加到输入框末尾，随下一条消息一起发出
 *
 * 数据模型：annotation = { 编号, 所选文本, 用户评论, 选区 Range }
 * 输入框中的块以「> 【注N】所选文本：」开头，删除/编辑靠该标记在编辑器中定位。
 */
window.__ModuleLoader__.load({
	id: "dsh-select-to-chat",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const PLUGIN_ID = "dsh-select-to-chat";
		const CSS_TAG = "dsh-select-to-chat/style";
		const Z = 2147483000;

		//#region css
		const css = [
			`.stc_layer{position:fixed;inset:0;pointer-events:none;z-index:${Z}}`,
			`.stc_badge{position:fixed;pointer-events:auto;cursor:pointer;box-sizing:border-box;`,
				`min-width:22px;height:22px;padding:0 5px;border-radius:11px;display:flex;align-items:center;justify-content:center;`,
				`background:#2f6fed;color:#fff;border:2px solid #fff;font:600 12px/18px var(--dsw-font-family,system-ui);`,
				`box-shadow:0 2px 8px #00000059;user-select:none}`,
			`.stc_badge:hover{filter:brightness(1.1)}`,
			`.stc_pill{position:fixed;z-index:${Z};box-sizing:border-box;width:360px;`,
				`background:var(--dsw-alias-bg-layer-2,#26262b);border:1px solid var(--dsw-alias-border-l2,#3d3d44);`,
				`border-radius:12px;box-shadow:0 10px 34px #000000a6;padding:6px;pointer-events:auto}`,
			`.stc_pillrow{display:flex;align-items:center;gap:6px}`,
			`.stc_input{flex:1;min-width:0;height:auto;min-height:32px;max-height:96px;background:var(--dsw-alias-bg-layer-1,#1d1d21);`,
				`color:var(--dsw-alias-label-primary,#ececf0);border:1px solid var(--dsw-alias-border-l1,#37373e);`,
				`border-radius:8px;padding:6px 10px;font:13px/20px var(--dsw-font-family,system-ui);outline:none;resize:none;overflow-y:auto;font-family:var(--dsw-font-family,system-ui)}`,
			`.stc_input:focus{border-color:var(--dsw-alias-state-business-primary,#2f6fed)}`,
			`.stc_ok{flex:none;width:32px;height:32px;border-radius:16px;border:none;cursor:pointer;`,
				`background:var(--dsw-alias-state-business-primary,#2f6fed);color:#fff;font-size:15px;display:flex;align-items:center;justify-content:center}`,
			`.stc_ok:hover{filter:brightness(1.12)}`,
			`.stc_hint{margin:5px 2px 0;color:var(--dsw-alias-label-tertiary,#8e8e96);`,
				`font:11px/16px var(--dsw-font-family,system-ui);white-space:nowrap}`,
			`.stc_hint b{color:var(--dsw-alias-label-secondary,#b6b6be);font-weight:600}`,
			`.stc_chip{position:fixed;z-index:${Z};display:flex;align-items:center;gap:6px;height:30px;`,
				`padding:0 10px;border-radius:9px;cursor:pointer;user-select:none;pointer-events:auto;`,
				`background:var(--dsw-alias-bg-layer-2,#26262b);border:1px solid var(--dsw-alias-border-l2,#3d3d44);`,
				`color:var(--dsw-alias-label-primary,#ececf0);font:500 12px/28px var(--dsw-font-family,system-ui);`,
				`box-shadow:0 6px 20px #00000073}`,
			`.stc_chip:hover{background:var(--dsw-alias-interactive-bg-hover-solid,#303038)}`,
			`.stc_chip .stc_clear{margin-left:4px;color:var(--dsw-alias-label-tertiary,#8e8e96);cursor:pointer;`,
				`border:none;background:none;font:600 12px/1 var(--dsw-font-family,system-ui);padding:2px 4px;border-radius:4px}`,
			`.stc_chip .stc_clear:hover{color:var(--dsw-alias-label-primary,#ececf0);background:#ffffff14}`,
			`.stc_panel{position:fixed;z-index:${Z};box-sizing:border-box;width:min(560px,calc(100vw - 32px));`,
				`max-height:min(340px,45vh);overflow:auto;background:var(--dsw-alias-bg-layer-2,#26262b);`,
				`border:1px solid var(--dsw-alias-border-l2,#3d3d44);border-radius:14px;`,
				`box-shadow:0 14px 44px #000000a6;padding:4px 0;pointer-events:auto}`,
			`.stc_row{display:grid;grid-template-columns:30px 1fr auto;gap:2px 8px;padding:9px 12px 9px 8px;`,
				`border-bottom:1px solid var(--dsw-alias-border-l1,#33333a);font:13px/19px var(--dsw-font-family,system-ui)}`,
			`.stc_row:last-child{border-bottom:none}`,
			`.stc_row.stc_flash{background:var(--dsw-alias-interactive-bg-hover,#ffffff0d)}`,
			`.stc_num{color:var(--dsw-alias-label-tertiary,#8e8e96);text-align:right;font-weight:600}`,
			`.stc_label{color:var(--dsw-alias-label-tertiary,#8e8e96);font-size:12px}`,
			`.stc_text{color:var(--dsw-alias-label-primary,#ececf0);white-space:pre-wrap;overflow-wrap:anywhere}`,
			`.stc_text.stc_empty{color:var(--dsw-alias-label-tertiary,#8e8e96);font-style:italic}`,
			`.stc_rowbtns{grid-column:3;grid-row:1 / span 4;display:flex;flex-direction:column;gap:6px;align-items:center;justify-content:center}`,
			`.stc_rowbtns button{width:26px;height:26px;border-radius:6px;border:none;cursor:pointer;`,
				`background:none;color:var(--dsw-alias-label-secondary,#b6b6be);font-size:13px;line-height:1;padding:0}`,
			`.stc_rowbtns button:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff14);color:var(--dsw-alias-label-primary,#ececf0)}`,
			`.stc_foot{padding:7px 14px 8px;color:var(--dsw-alias-label-tertiary,#8e8e96);font:11px/16px var(--dsw-font-family,system-ui)}`,
			`.stc_toast{position:fixed;z-index:${Z};left:50%;bottom:88px;transform:translateX(-50%);`,
				`background:var(--dsw-alias-bg-layer-3,#303038);color:var(--dsw-alias-label-primary,#ececf0);`,
				`border:1px solid var(--dsw-alias-border-l2,#3d3d44);border-radius:10px;padding:8px 14px;`,
				`font:12px/18px var(--dsw-font-family,system-ui);box-shadow:0 8px 26px #0000008c;pointer-events:none;`,
				`opacity:0;transition:opacity .18s ease}`,
			`.stc_toast.stc_show{opacity:1}`,
		].join("");
		if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`) === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = PLUGIN_ID;
			tag.dataset.pluginCss = CSS_TAG;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region state
		const anns = []; // { n, text, comment, range, badge }
		let nextN = 1;
		let pendingRange = null; // 划词中的 Range 克隆
		let pill = null, pillInput = null;
		let layer = null;
		let chip = null, panel = null, expanded = false, hoverOpen = false, hoverCloseTimer = 0, clearArmed = 0;
		let toast = null, toastTimer = 0;
		let rafId = 0;
		let lastTick = 0;
		//#endregion

		//#region utils
		const sel = () => (typeof window !== "undefined" ? window.getSelection() : null);

		function showToast(msg) {
			if (!toast) {
				toast = document.createElement("div");
				toast.className = "stc_toast";
				document.body.appendChild(toast);
			}
			toast.textContent = msg;
			toast.classList.add("stc_show");
			clearTimeout(toastTimer);
			toastTimer = setTimeout(() => toast.classList.remove("stc_show"), 2600);
		}

		function inOurUi(node) {
			return !!(node && node.nodeType === 1
				? node.closest && node.closest(".stc_pill,.stc_chip,.stc_panel,.stc_badge")
				: node && node.parentElement && node.parentElement.closest && node.parentElement.closest(".stc_pill,.stc_chip,.stc_panel,.stc_badge"));
		}

		function inEditable(node) {
			let el = node && node.nodeType === 1 ? node : node && node.parentElement;
			while (el) {
				if (el.isContentEditable) return true;
				const tag = el.tagName;
				if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
				el = el.parentElement;
			}
			return false;
		}

		function usableSelection() {
			const s = sel();
			if (!s || s.rangeCount === 0 || s.isCollapsed) return null;
			const range = s.getRangeAt(0);
			const text = range.toString().replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/^\n+|\n+$/g, "");
			if (!text.trim()) return null;
			const anchor = s.anchorNode;
			if (!anchor || inOurUi(anchor) || inEditable(anchor)) return null;
			return { range: range.cloneRange(), text };
		}
		//#endregion

		//#region composer (Lexical) 读写
		function findComposer() {
			if (typeof document === "undefined") return null;
			const nodes = document.querySelectorAll('[contenteditable="true"]');
			let best = null, bestTop = -Infinity;
			for (const el of nodes) {
				if (el.closest(".stc_pill")) continue;
				const rect = el.getBoundingClientRect();
				if (rect.width < 40 || rect.height < 20) continue; // 隐藏或极小
				if (rect.top > bestTop) { bestTop = rect.top; best = el; }
			}
			return best; // 输入框固定在界面最底部
		}

		function blockText(ann) {
			const lines = ann.text.split("\n");
			const out = [`> 【注${ann.n}】所选文本：`];
			for (const l of lines) out.push("> " + l);
			if (ann.comment) out.push(`> 用户评论：${ann.comment}`);
			return out.join("\n");
		}

		function insertIntoComposer(text) {
			const ed = findComposer();
			if (!ed) return false;
			const before = ed.textContent.length;
			ed.focus({ preventScroll: true });
			const s = sel();
			const r = document.createRange();
			r.selectNodeContents(ed);
			r.collapse(false);
			s.removeAllRanges();
			s.addRange(r);
			try {
				const dt = new DataTransfer();
				dt.setData("text/plain", text + "\n");
				ed.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
			} catch (e) { /* fall through */ }
			setTimeout(() => {
				if (ed.isConnected && ed.textContent.length > before) return;
				// 回退方案：逐行 execCommand
				try {
					ed.focus({ preventScroll: true });
					const s2 = sel(); const r2 = document.createRange();
					r2.selectNodeContents(ed); r2.collapse(false);
					s2.removeAllRanges(); s2.addRange(r2);
					const lines = (text + "\n").split("\n");
					for (let i = 0; i < lines.length; i++) {
						if (i > 0) document.execCommand("insertParagraph");
						if (lines[i]) document.execCommand("insertText", false, lines[i]);
					}
					if (ed.textContent.length <= before) showToast("未能写入输入框（编辑器无响应）");
				} catch (e) {
					showToast("未能写入输入框（编辑器无响应）");
				}
			}, 80);
			return true;
		}

		// 在编辑器虚拟文本中定位「块」的范围：块首 = 「> 【注N】」，块尾 = 连续「> 」行结束处
		function locateBlock(ed, n) {
			const segs = []; // { node, start, end } 在虚拟文本中的区间
			const blocks = ed.children; // 顶层段落
			let vtext = "";
			let voff = 0;
			const walk = (root, isBlock) => {
				for (const child of root.childNodes) {
					if (child.nodeType === 3) {
						const t = child.nodeValue || "";
						if (t) { segs.push({ node: child, start: voff, end: voff + t.length }); voff += t.length; vtext += t; }
					} else if (child.nodeType === 1) {
						walk(child, false);
					}
				}
				if (isBlock) { voff += 1; vtext += "\n"; } // 段落边界视作 \n
			};
			for (const b of blocks) walk(b, true);
			const marker = `【注${n}】`;
			const mi = vtext.indexOf(marker);
			if (mi < 0) return null;
			// 块首：包含 marker 的行首（把 "> 【注N】…" 一起删掉）
			let ls = vtext.lastIndexOf("\n", mi - 1) + 1; // 行首
			// 块尾：从 marker 行开始向后，收集连续以 "> " 开头的行；遇下一个 marker 行即止
			const lines = vtext.slice(ls).split("\n");
			let len = 0;
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (i > 0 && (!line.startsWith("> ") || /^> 【注\d+】/.test(line))) break;
				len += line.length + 1; // 含 \n
			}
			const le = ls + Math.max(0, len - 1); // 不含末尾换行
			if (le <= ls) return null;
			const map = (vpos) => {
				for (const sgm of segs) {
					if (vpos >= sgm.start && vpos <= sgm.end) return { node: sgm.node, offset: vpos - sgm.start };
				}
				const last = segs[segs.length - 1];
				return { node: last.node, offset: last.node.length };
			};
			const a = map(ls), b = map(le);
			try {
				const r = document.createRange();
				r.setStart(a.node, a.offset);
				r.setEnd(b.node, b.offset);
				return r;
			} catch (e) { return null; }
		}

		function removeBlock(ann) {
			const ed = findComposer();
			if (!ed) return false;
			const r = locateBlock(ed, ann.n);
			if (!r) return false;
			ed.focus({ preventScroll: true });
			const s = sel();
			s.removeAllRanges();
			s.addRange(r);
			let ok = false;
			try { ok = document.execCommand("delete"); } catch (e) { ok = false; }
			return ok && !ed.textContent.includes(`【注${ann.n}】`);
		}
		//#endregion

		//#region 角标层
		function ensureLayer() {
			if (layer && layer.isConnected) return layer;
			layer = document.createElement("div");
			layer.className = "stc_layer";
			document.body.appendChild(layer);
			return layer;
		}

		function placeBadge(ann) {
			const el = ann.badge;
			if (!el) return;
			// 选区失效或量不到位置：角标先隐藏，但**不丢弃批注**，清单里仍然保留
			try {
				if (!ann.range.startContainer.isConnected) { el.style.display = "none"; return; }
				const rect = ann.range.getBoundingClientRect();
				if (rect.width === 0 && rect.height === 0) { el.style.display = "none"; return; }
				const x = Math.min(Math.max(4, rect.right + 1), window.innerWidth - 26);
				const y = Math.min(Math.max(4, rect.top - 24), window.innerHeight - 26);
				el.style.display = "flex";
				el.style.left = x + "px";
				el.style.top = y + "px";
			} catch (err) { el.style.display = "none"; }
		}

		function makeBadge(ann) {
			ensureLayer();
			const el = document.createElement("div");
			el.className = "stc_badge";
			el.textContent = String(ann.n);
			el.title = "点击查看这条注释";
			el.addEventListener("mousedown", (e) => e.preventDefault());
			el.addEventListener("click", () => {
				expanded = true;
				renderBar();
				const row = panel && panel.querySelector(`[data-stc-row="${ann.n}"]`);
				if (row) {
					row.scrollIntoView({ block: "nearest" });
					row.classList.add("stc_flash");
					setTimeout(() => row.classList.remove("stc_flash"), 900);
				}
			});
			layer.appendChild(el);
			return el;
		}
		//#endregion

		//#region 划词弹窗
		function ensurePill() {
			if (pill && pill.isConnected) return;
			pill = document.createElement("div");
			pill.className = "stc_pill";
			const row = document.createElement("div");
			row.className = "stc_pillrow";
			pillInput = document.createElement("textarea");
			pillInput.rows = 1;
			pillInput.className = "stc_input";
			pillInput.placeholder = "写下对这段的评论（可留空，Enter 添加）";
			pillInput.spellcheck = false;
			const ok = document.createElement("button");
			ok.className = "stc_ok";
			ok.textContent = "✓";
			ok.title = "添加注释（Enter）";
			ok.addEventListener("click", () => addFromPill());
			row.appendChild(pillInput);
			row.appendChild(ok);
			const hint = document.createElement("div");
			hint.className = "stc_hint";
			hint.innerHTML = "<b>Enter</b> 添加 · <b>Shift+Enter</b> 换行 · <b>Esc</b> 关闭 · 可继续划词添加多条";
			pill.appendChild(row);
			pill.appendChild(hint);
			pillInput.addEventListener("input", () => {
				pillInput.style.height = "auto";
				pillInput.style.height = Math.min(pillInput.scrollHeight, 96) + "px";
			});
			pillInput.addEventListener("keydown", (e) => {
				if (e.isComposing || e.keyCode === 229) return; // 输入法组词中的 Enter/Esc 属于 IME，不拦截
				if (e.key === "Enter") {
					if (e.shiftKey) return; // Shift+Enter 换行
					e.preventDefault(); addFromPill();
				}
				else if (e.key === "Escape") { e.preventDefault(); hidePill(); }
				else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === "c" || e.key === "C")) {
					// stc-copy-bridge：焦点在评论框里时 Ctrl+C 只会作用于输入框空选区。
					// 兜底：把原生选区恢复成划词的那段，再走原生复制。
					const own = pillInput.selectionEnd - pillInput.selectionStart > 0;
					if (!own && pendingRange) {
						e.preventDefault();
						try {
							const s = sel();
							s.removeAllRanges();
							s.addRange(pendingRange);
							clearHighlight();
							document.execCommand("copy");
						} catch (err) { /* 忽略 */ }
					}
				}
			});
			pillInput.addEventListener("focus", () => {
				// 输入框获焦会塌掉原生选区——此时改由插件自绘高亮保持视觉
				if (pendingRange) drawHighlight(pendingRange);
			});
			// 只在弹窗的非输入区域阻止默认（保住选区）；点输入框要正常获焦
			pill.addEventListener("mousedown", (e) => {
				if (e.target === pillInput) return;
				e.preventDefault();
			});
			ok.addEventListener("mousedown", (e) => e.preventDefault());
			document.body.appendChild(pill);
		}

		function showPill(entry) {
			ensurePill();
			pendingRange = entry.range;
			if (pill.__editN) pill.__editN = 0;
			const rect = entry.range.getBoundingClientRect();
			pill.style.visibility = "hidden";
			pill.style.display = "block";
			const pw = pill.offsetWidth, ph = pill.offsetHeight;
			let x = rect.left + rect.width / 2 - pw / 2;
			x = Math.min(Math.max(8, x), window.innerWidth - pw - 8);
			let y = rect.bottom + 8;
			if (y + ph > window.innerHeight - 8) y = rect.top - ph - 8;
			y = Math.min(Math.max(8, y), window.innerHeight - ph - 8);
			pill.style.left = x + "px";
			pill.style.top = y + "px";
			pill.style.visibility = "visible";
			pillInput.value = "";
			pillInput.style.height = "auto";
			// 不抢焦点：保持原生选区，Ctrl+C / 右键复制照常可用；
			// 用户点入输入框才进入输入模式（focus 时由插件接管高亮）。
		}

		function hidePill() {
			pendingRange = null;
			clearHighlight();
			if (pill && pill.isConnected) {
				if (document.activeElement === pillInput) pillInput.blur();
				pill.style.display = "none";
			}
		}

		// 输入框抢焦点会吃掉页面原生选区高亮——自己画一层，保证"划词后高亮仍在"
		let hl = null;
		function drawHighlight(range) {
			clearHighlight();
			if (!range || !range.getClientRects) return;
			hl = document.createElement("div");
			hl.className = "stc_layer";
			for (const r of range.getClientRects()) {
				if (r.width < 1 || r.height < 1) continue;
				const d = document.createElement("div");
				d.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background:#2f6fed40;border-radius:2px;`;
				hl.appendChild(d);
			}
			document.body.appendChild(hl);
		}
		function clearHighlight() {
			if (hl && hl.isConnected) hl.remove();
			hl = null;
		}

		function addFromPill() {
			if (!pendingRange) { hidePill(); return; }
			const comment = (pillInput.value || "").trim();
			const editN = pill && pill.__editN;
			if (editN) {
				pill.__editN = 0;
				const ann = anns.find((a) => a.n === editN);
				hidePill();
				if (ann) {
					ann.comment = comment;
					showToast(`已更新注${ann.n}的评论`);
					expanded = false;
					renderBar();
				}
				return;
			}
			const text = pendingRange.toString().replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/^\n+|\n+$/g, "");
			if (!text.trim()) { hidePill(); return; }
			expanded = false; // 添加后清单收起为小条，不遮挡正文
			addAnnotation(pendingRange, comment);
			hidePill();
			const s = sel();
			if (s) s.removeAllRanges();
		}

		function addAnnotation(range, comment) {
			const text = range.toString().replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/^\n+|\n+$/g, "");
			if (!text.trim()) return;
			const ann = { n: nextN++, text, comment, range: range.cloneRange(), badge: null };
			ann.badge = makeBadge(ann);
			placeBadge(ann);
			anns.push(ann);
			renderBar();
			/* 批注不写进输入框：发送时由插件自动拼接 */
			ensureLoop();
		}
		//#endregion

		//#region 注释清单（角标编号 ↔ 清单行）
		function cancelHoverClose() {
			if (!hoverCloseTimer) return;
			clearTimeout(hoverCloseTimer);
			hoverCloseTimer = 0;
		}

		function openOnHover() {
			cancelHoverClose();
			if (hoverOpen) return;
			hoverOpen = true;
			renderBar();
		}

		function scheduleHoverClose() {
			cancelHoverClose();
			hoverCloseTimer = setTimeout(() => {
				hoverCloseTimer = 0;
				if ((chip && chip.matches(":hover")) || (panel && panel.matches(":hover"))) return;
				hoverOpen = false;
				renderBar();
			}, 180);
		}

		function ensureBar() {
			if (!chip || !chip.isConnected) {
				chip = document.createElement("div");
				chip.className = "stc_chip";
				chip.addEventListener("mousedown", (e) => e.stopPropagation());
				panel = document.createElement("div");
				panel.className = "stc_panel";
				panel.addEventListener("mousedown", (e) => e.stopPropagation());
				chip.addEventListener("mouseenter", openOnHover);
				chip.addEventListener("mouseleave", scheduleHoverClose);
				panel.addEventListener("mouseenter", openOnHover);
				panel.addEventListener("mouseleave", scheduleHoverClose);
				document.body.appendChild(chip);
				document.body.appendChild(panel);
				chip.addEventListener("click", (e) => {
					if (e.target.closest(".stc_clear")) return;
					expanded = !expanded;
					renderBar();
				});
			}
			return chip;
		}

		function renderBar() {
			ensureBar();
			if (anns.length === 0) {
				chip.style.display = "none";
				panel.style.display = "none";
				return;
			}
			// chip
			chip.style.display = "flex";
			chip.textContent = "";
			const icon = document.createElement("span");
			icon.textContent = "💬";
			const label = document.createElement("span");
			label.textContent = `${anns.length} 条注释`;
			const clear = document.createElement("button");
			clear.className = "stc_clear";
			clear.textContent = "✕";
			clear.title = "清空全部注释（同时从输入框移除对应引用块）";
			clear.addEventListener("click", () => {
				while (anns.length) {
					const a = anns[anns.length - 1];
					dropAnnotation(a, false);
				}
				renderBar();
			});
			chip.appendChild(icon);
			chip.appendChild(label);
			chip.appendChild(clear);
			// panel
			if (!expanded && !hoverOpen) { panel.style.display = "none"; return; }
			panel.style.display = "block";
			panel.textContent = "";
			for (const ann of anns) {
				const row = document.createElement("div");
				row.className = "stc_row";
				row.dataset.stcRow = String(ann.n);
				const num = document.createElement("div");
				num.className = "stc_num";
				num.textContent = `${ann.n}.`;
				const body = document.createElement("div");
				body.style.gridColumn = "2";
				const l1 = document.createElement("div"); l1.className = "stc_label"; l1.textContent = "所选文本:";
				const t1 = document.createElement("div"); t1.className = "stc_text"; t1.textContent = ann.text;
				const l2 = document.createElement("div"); l2.className = "stc_label"; l2.textContent = "用户评论:";
				const t2 = document.createElement("div");
				t2.className = "stc_text" + (ann.comment ? "" : " stc_empty");
				t2.textContent = ann.comment || "（无）";
				body.appendChild(l1); body.appendChild(t1); body.appendChild(l2); body.appendChild(t2);
				const btns = document.createElement("div");
				btns.className = "stc_rowbtns";
				const edit = document.createElement("button");
				edit.textContent = "✎"; edit.title = "编辑这条评论";
				edit.addEventListener("mousedown", (e) => e.preventDefault());
				edit.addEventListener("click", () => startEdit(ann));
				const del = document.createElement("button");
				del.textContent = "🗑"; del.title = "删除这条注释";
				del.addEventListener("click", () => {
					dropAnnotation(ann, false);
					renderBar();
				});
				btns.appendChild(edit); btns.appendChild(del);
				row.appendChild(num); row.appendChild(body); row.appendChild(btns);
				panel.appendChild(row);
			}
			const foot = document.createElement("div");
			foot.className = "stc_foot";
			foot.textContent = "以上注释已按序追加到输入框末尾，随下一条消息一起发送；✎ 改评论、🗑 删整条。";
			panel.appendChild(foot);
			positionBar();
		}

		function positionBar() {
			const ed = findComposer();
			if (!ed || anns.length === 0) return;
			const rect = ed.getBoundingClientRect();
			const cw = chip.offsetWidth, ch = chip.offsetHeight;
			let cx = rect.left + 10;
			let cy = rect.top - ch - 8;
			if (cy < 8) cy = 8;
			chip.style.left = Math.max(8, cx) + "px";
			chip.style.top = cy + "px";
			if (panel.style.display !== "none") {
				const pw = panel.offsetWidth, ph = panel.offsetHeight;
				let px = cx, py = cy - ph - 6;
				px = Math.min(Math.max(8, px), window.innerWidth - pw - 8);
				if (py < 8) py = Math.min(cy + ch + 6, window.innerHeight - ph - 8);
				panel.style.left = px + "px";
				panel.style.top = py + "px";
			}
		}

		function startEdit(ann) {
			if (!ann.range.startContainer.isConnected) { showToast("原文位置已失效，请删除后重新划词"); return; }
			const entry = { range: ann.range };
			showPill(entry);
			pillInput.value = ann.comment || "";
			// 编辑是用户显式点击 ✎ 触发的，这里主动聚焦进入输入模式
			pillInput.focus({ preventScroll: true });
			pillInput.select();
			// 编辑模式下：确认后替换原块
			pendingRange = ann.range;
			pill.__editN = ann.n;
		}

		function dropAnnotation(ann, render = true) {
			const i = anns.indexOf(ann);
			if (i >= 0) anns.splice(i, 1);
			if (ann.badge && ann.badge.isConnected) ann.badge.remove();
			if (anns.length === 0) { nextN = 1; expanded = false; hoverOpen = false; cancelHoverClose(); }
			if (render) renderBar();
		}
		//#endregion

		//#region 事件与循环
		function onMouseUp(e) {
			const inPill = (t) => pill && pill.style.display !== "none" && t && pill.contains(t);
			setTimeout(() => {
				if (inPill(e.target) || (pill && pillInput === document.activeElement)) return; // 弹窗内部的 mouseup 不处理
				const entry = usableSelection();
				if (entry) showPill(entry); else hidePill();
			}, 0);
		}

		let selTimer = 0;
		function onSelectionChange() {
			clearTimeout(selTimer);
			selTimer = setTimeout(() => {
				if (pillInput && document.activeElement === pillInput) return;
				if (!pendingRange) return;
				const s = sel();
				if (!s || s.isCollapsed) { if (!pill || document.activeElement !== pillInput) hidePill(); }
			}, 160);
		}

		// 评论框 focus() 时浏览器会吃掉页面原生选区（这正是下面自绘高亮层存在的原因），
		// 副作用是 Cmd+C / 右键复制全部落空 —— 复制到的是空的评论框。
		// 用户表现出「要复制原文」的意图时，先把选区还给页面，再放行原生行为。
		function restorePendingSelection() {
			if (!pendingRange) return false;
			const s = sel();
			if (!s) return false;
			try { s.removeAllRanges(); s.addRange(pendingRange); } catch (err) { return false; }
			if (pillInput && document.activeElement === pillInput) pillInput.blur();
			return true;
		}

		function onDocMouseDown(e) {
			if (pill && pill.style.display !== "none" && !pill.contains(e.target)) {
				// 右键（复制/查词）：原生菜单读的是页面选区，不还回去就复制不到东西
				if (e.button === 2) restorePendingSelection();
				// 点外部：关闭弹窗，选区自然流动
				hidePill();
			}
			// 点面板外：清单收起为小条（chip 保留），不遮挡正文
			if (expanded && chip && chip.style.display !== "none" && !chip.contains(e.target) && !(panel && panel.contains(e.target))) {
				expanded = false;
				renderBar();
			}
			if (clearArmed && Date.now() >= clearArmed) { clearArmed = 0; renderBar(); }
		}

		function allBlocksText() {
			if (!anns.length) return "";
			return anns.map((a) => blockText(a)).join("\n\n");
		}

		// 发送前把批注拼进输入框（输入框平时保持干净）
		let injecting = false;
		function injectBeforeSend(done) {
			if (!anns.length || injecting) { done(); return; }
			const ed = findComposer();
			if (!ed) { done(); return; }
			if ((ed.textContent || "").includes("【注")) { done(); return; }
			injecting = true;
			const before = ed.textContent.length;
			const s2 = sel();
			const r2 = document.createRange();
			r2.selectNodeContents(ed);
			r2.collapse(false);
			s2.removeAllRanges();
			s2.addRange(r2);
			try {
				const dt = new DataTransfer();
				dt.setData("text/plain", "\n" + allBlocksText() + "\n");
				ed.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
			} catch (err) { /* fall through */ }
			setTimeout(() => {
				if (!(ed.isConnected && ed.textContent.length > before)) {
					try {
						ed.focus({ preventScroll: true });
						const s3 = sel(); const r3 = document.createRange();
						r3.selectNodeContents(ed); r3.collapse(false);
						s3.removeAllRanges(); s3.addRange(r3);
						const lines = ("\n" + allBlocksText() + "\n").split("\n");
						for (let i = 0; i < lines.length; i++) {
							if (i > 0) document.execCommand("insertParagraph");
							if (lines[i]) document.execCommand("insertText", false, lines[i]);
						}
					} catch (e2) { /* 忽略 */ }
				}
				injecting = false;
				done();
			}, 60);
		}

		// 发送后自动清空：输入框变空 = 消息已发出，无需手动删除批注
		function scheduleClearAfterSend() {
			if (!anns.length) return;
			const ed0 = findComposer();
			if (!ed0) return;
			const baseline = (ed0.textContent || "").trim();
			if (!baseline) return;
			let tries = 0;
			const timer = setInterval(() => {
				tries += 1;
				const ed = findComposer();
				const now = ed ? (ed.textContent || "").trim() : "";
				const sent = !now || now !== baseline;
				if (sent && !now) {
					clearInterval(timer);
					while (anns.length) dropAnnotation(anns[anns.length - 1], false);
					renderBar();
					return;
				}
				if (tries > 40) clearInterval(timer);
			}, 250);
		}

		// 点发送按钮：也安排发送后自动清空
		function onDocClickSend(e) {
			if (!anns.length) return;
			const btn = e.target && e.target.closest && e.target.closest("button, [role='button']");
			if (!btn || inOurUi(btn)) return;
			const ed = findComposer();
			if (!ed) return;
			const label = ((btn.getAttribute("aria-label") || "") + " " + (btn.title || "") + " " + (btn.textContent || "")).toLowerCase();
			if (!/send|发送|submit/.test(label)) return;
			if ((ed.textContent || "").includes("【注")) return;
			e.preventDefault();
			e.stopPropagation();
			scheduleClearAfterSend();
			injectBeforeSend(() => {
				try {
					btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, composed: true, view: window }));
				} catch (err) { /* 忽略 */ }
			});
		}

		function onKeyDown(e) {
			// 焦点在我们的弹窗里（评论框等）：一律不拦，交回原生处理
			if (e.target && inOurUi(e.target)) {
				if (e.key === "Escape" && pendingRange) hidePill();
				return;
			}
			// 回车发送：先拼接批注，再重放回车，发出后自动清除
			if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229 && anns.length) {
				const ed = findComposer();
				const t = e.target;
				const inComposer = ed && t && (t === ed || ed.contains(t));
				if (inComposer && !injecting && !(ed.textContent || "").includes("【注")) {
					e.preventDefault();
					e.stopPropagation();
					const target = t;
					scheduleClearAfterSend();
					injectBeforeSend(() => {
						try {
							target.dispatchEvent(new KeyboardEvent("keydown", {
								key: "Enter", code: "Enter", keyCode: 13, which: 13,
								bubbles: true, cancelable: true, composed: true
							}));
						} catch (err) { /* 忽略 */ }
					});
					return;
				}
			}
			if (e.key === "Escape" && pendingRange) hidePill();
			// Cmd/Ctrl+C：还没开始写评论时，把选区还给页面，让原生复制拿到划中的原文
			if (pendingRange && (e.metaKey || e.ctrlKey) && (e.key === "c" || e.key === "C")) {
				if (pillInput && document.activeElement === pillInput && !pillInput.value) restorePendingSelection();
			}
		}

		function onScroll(e) {
			// 评论框自身的滚动（长评论自适应增高后）不算页面滚动，不关弹窗
			if (pill && pill.style.display !== "none" && e && e.target && pill.contains(e.target)) return;
			hidePill();
		}

		function loop(ts) {
			rafId = 0;
			let alive = anns.length > 0;
			if (alive || (chip && chip.style.display !== "none")) {
				const before = anns.length;
				for (const ann of anns.slice()) placeBadge(ann);
				if (anns.length) positionBar();
				if (anns.length !== before) renderBar();
				// 周期性体检：输入框里块还在吗
				if (ts - lastTick > 1200) {
					lastTick = ts;
					const ed = findComposer();
					const text = ed ? ed.textContent : "";
					// v0.1.4 起批注不再写进输入框，体检只看原文是否还在文档里；
					// 原文被重渲染或滚没了，只隐藏角标，批注本身保留在清单里
					for (const ann of anns.slice()) {
						if (!ann.range.startContainer.isConnected) {
							if (ann.badge) ann.badge.style.display = "none";
						}
					}
				}
				alive = anns.length > 0;
			}
			if (alive) rafId = requestAnimationFrame(loop);
		}

		function ensureLoop() {
			if (!rafId) rafId = requestAnimationFrame(loop);
		}
		//#endregion

		//#region plugin body
		let wired = false;

		/** 本客户端插件依赖的内核服务：无（纯 DOM）。 */
		const inject = [];

		/**
		 * 客户端插件体：挂 DOM 监听与浮层。
		 * @param ctx - 客户端根上下文（可用 ctx.effect 注册清理函数）。
		 */
		function apply(ctx) {
			if (wired || typeof document === "undefined") return;
			wired = true;
			document.addEventListener("mouseup", onMouseUp, true);
			document.addEventListener("selectionchange", onSelectionChange, true);
			document.addEventListener("mousedown", onDocMouseDown, true);
			document.addEventListener("click", onDocClickSend, true);
			document.addEventListener("keydown", onKeyDown, true);
			window.addEventListener("scroll", onScroll, true);
			window.addEventListener("resize", onScroll, true);
			const dispose = () => {
				document.removeEventListener("mouseup", onMouseUp, true);
				document.removeEventListener("selectionchange", onSelectionChange, true);
				document.removeEventListener("mousedown", onDocMouseDown, true);
				document.removeEventListener("click", onDocClickSend, true);
				document.removeEventListener("keydown", onKeyDown, true);
				window.removeEventListener("scroll", onScroll, true);
				window.removeEventListener("resize", onScroll, true);
				if (rafId) cancelAnimationFrame(rafId);
				cancelHoverClose();
				hidePill();
				while (anns.length) dropAnnotation(anns[0], false);
				if (chip) chip.remove();
				if (panel) panel.remove();
				if (toast) toast.remove();
				wired = false;
			};
			if (ctx && typeof ctx.effect === "function") ctx.effect(() => dispose, "select-to-chat: dom wiring");
			if (typeof console !== "undefined") console.debug("[dsh-select-to-chat] ready — 划词任意文本即可添加注释");
		}
		//#endregion

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	},
});
