/**
 * Sanitiser + CSS scoper for the "Custom HTML + CSS" section (ported from the
 * original site). HTML loses scripts, forms and event handlers; iframes are
 * only kept for a short allow-list of hosts. Every CSS selector is prefixed
 * with the section's scope attribute so styles cannot leak.
 */

export const SCOPE_ATTR = "data-sec";

const NESTED_AT_RULES = new Set(["media", "supports", "container", "layer", "scope"]);

const VERBATIM_AT_RULES = new Set([
  "keyframes",
  "-webkit-keyframes",
  "font-face",
  "counter-style",
  "property",
  "page",
]);

const ROOT_SELECTORS = new Set([":root", "html", "body", ":host", "*"]);

const DANGEROUS_DECLARATION_SOURCE =
  "(expression\\s*\\(|behavior\\s*:|-moz-binding|javascript\\s*:|@import|@charset)";

function hasDangerousDeclaration(value: string) {
  return new RegExp(DANGEROUS_DECLARATION_SOURCE, "i").test(value);
}

export const IFRAME_ALLOWED_HOSTS = [
  "www.google.com",
  "maps.google.com",
  "www.openstreetmap.org",
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
];

const IFRAME_KEPT_ATTRS = ["width", "height", "title", "class"];

const STRIPPED_TAGS = [
  "script",
  "style",
  "object",
  "embed",
  "applet",
  "base",
  "link",
  "meta",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "noscript",
  "template",
];

export function scopeSelectorFor(id: string) {
  return `[${SCOPE_ATTR}="${cssEscape(id)}"]`;
}

export function scopeCss(css: string, id: string): string {
  const source = stripComments(String(css ?? ""));
  if (!source.trim()) return "";
  const scope = scopeSelectorFor(id);
  return processRules(stripTopLevelAtStatements(source), scope);
}

function attributeValue(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? (match[2] ?? match[3] ?? match[4] ?? "") : "";
}

function rebuildIframe(tag: string) {
  const src = attributeValue(tag, "src").trim();
  if (!src) return "";

  let host: string;
  try {
    host = new URL(src, "https://example.invalid").hostname.toLowerCase();
  } catch {
    return "";
  }

  if (!IFRAME_ALLOWED_HOSTS.includes(host)) return "";

  const attrs = IFRAME_KEPT_ATTRS.map((name) => {
    const value = attributeValue(tag, name);
    return value ? `${name}="${value.replace(/"/g, "&quot;")}"` : "";
  }).filter(Boolean);

  if (/\sallowfullscreen\b/i.test(tag)) attrs.push("allowfullscreen");

  attrs.push('loading="lazy"', 'referrerpolicy="no-referrer-when-downgrade"');

  return `<iframe src="${src.replace(/"/g, "&quot;")}" ${attrs.join(" ")}></iframe>`;
}

export function sanitizeHtml(html: string): string {
  let out = String(html ?? "");

  out = out.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>|<iframe\b[^>]*\/?>/gi, (tag) =>
    rebuildIframe(tag),
  );

  for (const tag of STRIPPED_TAGS) {
    out = out.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), "");
    out = out.replace(new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi"), "");
  }

  out = out.replace(/\son[a-z-]+\s*=\s*"[^"]*"/gi, "");
  out = out.replace(/\son[a-z-]+\s*=\s*'[^']*'/gi, "");
  out = out.replace(/\son[a-z-]+\s*=\s*[^\s>]+/gi, "");

  out = out.replace(
    /\s(href|src|xlink:href|action|formaction|poster|data)\s*=\s*("|')\s*(javascript|vbscript|data\s*:\s*text\/html)[^"']*\2/gi,
    "",
  );

  out = out.replace(/\sstyle\s*=\s*("|')([^"']*)\1/gi, (match, _quote, body) =>
    hasDangerousDeclaration(String(body)) ? "" : match,
  );

  return out.trim();
}

function cssEscape(value: string) {
  return String(value).replace(/["\\]/g, "\\$&");
}

function stripComments(css: string) {
  let out = "";
  let i = 0;
  let quote: string | null = null;

  while (i < css.length) {
    const ch = css[i];

    if (quote) {
      out += ch;
      if (ch === "\\" && i + 1 < css.length) {
        out += css[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      i += 1;
      continue;
    }

    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}

function stripTopLevelAtStatements(css: string) {
  return css.replace(/@(import|charset)\b[^;{}]*;/gi, "");
}

function matchingBrace(css: string, openIndex: number) {
  let depth = 0;
  let quote: string | null = null;

  for (let i = openIndex; i < css.length; i += 1) {
    const ch = css[i];

    if (quote) {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return css.length;
}

function processRules(css: string, scope: string): string {
  let out = "";
  let prelude = "";
  let i = 0;

  while (i < css.length) {
    const ch = css[i];

    if (ch === "{") {
      const close = matchingBrace(css, i);
      const body = css.slice(i + 1, close);
      const head = prelude.trim();
      prelude = "";
      i = close + 1;

      if (!head) continue;

      if (head.startsWith("@")) {
        const name = head.slice(1).split(/[\s(]/)[0].toLowerCase();

        if (NESTED_AT_RULES.has(name)) {
          const inner = processRules(body, scope);
          if (inner.trim()) out += `${head}{${inner}}`;
        } else if (VERBATIM_AT_RULES.has(name)) {
          out += `${head}{${cleanDeclarations(body)}}`;
        }
        continue;
      }

      out += `${scopeSelectorList(head, scope)}{${cleanDeclarations(body)}}`;
      continue;
    }

    if (ch === "}") {
      prelude = "";
      i += 1;
      continue;
    }

    prelude += ch;
    i += 1;
  }

  return out;
}

function splitTopLevelCommas(selector: string) {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let current = "";

  for (let i = 0; i < selector.length; i += 1) {
    const ch = selector[i];

    if (quote) {
      current += ch;
      if (ch === "\\" && i + 1 < selector.length) {
        current += selector[i + 1];
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }

    if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth -= 1;

    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

function scopeSelectorList(selectorList: string, scope: string) {
  const scoped = splitTopLevelCommas(selectorList).map((selector) =>
    scopeOneSelector(selector, scope),
  );
  return scoped.length ? scoped.join(",") : scope;
}

function scopeOneSelector(selector: string, scope: string) {
  if (selector.startsWith("&")) {
    const rest = selector.slice(1);
    const isDescendant = rest === "" || /^[\s>+~]/.test(rest);
    return isDescendant ? `${scope} ${rest.trim()}`.trim() : `${scope}${rest}`;
  }

  if (selector.startsWith(scope)) return selector;

  const [head, ...rest] = selector.split(/\s+/);

  if (ROOT_SELECTORS.has(head.toLowerCase())) {
    const tail = rest.join(" ").trim();
    return tail ? `${scope} ${tail}` : scope;
  }

  return `${scope} ${selector}`;
}

function cleanDeclarations(body: string): string {
  if (!body.includes("{")) return dropDangerousDeclarations(body);

  let out = "";
  let buffer = "";
  let i = 0;

  while (i < body.length) {
    const ch = body[i];

    if (ch === "{") {
      const close = matchingBrace(body, i);
      const segments = splitTopLevelSemicolons(buffer);
      const prelude = segments.length ? segments[segments.length - 1] : "";
      const declarations = segments.slice(0, -1).join(";");

      out += `${dropDangerousDeclarations(declarations)}${prelude}{${cleanDeclarations(
        body.slice(i + 1, close),
      )}}`;
      buffer = "";
      i = close + 1;
      continue;
    }

    buffer += ch;
    i += 1;
  }

  return out + dropDangerousDeclarations(buffer);
}

function dropDangerousDeclarations(body: string) {
  if (!body.trim()) return body;

  const kept = splitTopLevelSemicolons(body).filter(
    (declaration) => !hasDangerousDeclaration(declaration),
  );

  if (!kept.length) return "";

  return `${kept.join(";")};`;
}

function splitTopLevelSemicolons(body: string) {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let current = "";

  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];

    if (quote) {
      current += ch;
      if (ch === "\\" && i + 1 < body.length) {
        current += body[i + 1];
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }

    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;

    if (ch === ";" && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}
