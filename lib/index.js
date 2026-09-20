// dsh-select-to-chat — server half.
// 本插件是纯浏览器端功能，服务端半边刻意保持为空插件：
// 仅提供 cordis loader 需要的最小导出（name / inject / apply）。
const name = "select-to-chat";
const inject = [];

function apply() {
	// no server-side behavior
}

export { apply, inject, name };
