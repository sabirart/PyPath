// Tiny Python tokenizer for read-only code blocks. Output is rendered as
// React text nodes, so lesson code can never inject HTML.
const KW = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "));
const BUILTIN = new Set("print input int float str bool list dict set tuple len range type sum min max abs sorted reversed enumerate zip map filter open next super isinstance round".split(" "));
const RE = /(#[^\n]*)|([fFrRbB]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g;

export function tokenize(src) {
  const out = [];
  let last = 0;
  let prev = "";
  let m;
  RE.lastIndex = 0;
  while ((m = RE.exec(src))) {
    if (m.index > last) out.push({ t: "", s: src.slice(last, m.index) });
    const s = m[0];
    let t = "";
    if (m[1]) { t = "com"; prev = ""; }
    else if (m[2]) { t = "str"; prev = ""; }
    else if (m[3]) { t = "num"; prev = ""; }
    else {
      if (KW.has(s)) t = "kw";
      else if (prev === "def" || prev === "class") t = "fn";
      else if (BUILTIN.has(s)) t = "bi";
      prev = s;
    }
    out.push({ t, s });
    last = m.index + s.length;
  }
  if (last < src.length) out.push({ t: "", s: src.slice(last) });
  return out;
}
