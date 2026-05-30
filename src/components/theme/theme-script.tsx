// Inline script that runs before hydration to apply the user's saved theme,
// preventing a flash of the default theme. Mirrors the token->cssvar mapping
// in lib/themes.ts and the base themes; kept intentionally dependency-free.
import { THEMES, TOKEN_TO_CSSVAR, DEFAULT_THEME_ID } from "@/lib/themes";

const STORAGE_KEY = "libroapp:theme";

export function ThemeScript() {
  const payload = JSON.stringify({
    themes: Object.fromEntries(THEMES.map((t) => [t.id, t.tokens])),
    map: TOKEN_TO_CSSVAR,
    fallback: DEFAULT_THEME_ID,
    key: STORAGE_KEY,
  });

  const js = `(function(){try{
    var D=${payload};
    var raw=localStorage.getItem(D.key);
    var s=raw?JSON.parse(raw):null;
    var baseId=(s&&s.baseId)||D.fallback;
    var base=D.themes[baseId]||D.themes[D.fallback];
    var tokens=Object.assign({},base,(s&&s.overrides)||{});
    var root=document.documentElement;
    for(var k in tokens){var v=D.map[k];if(v)root.style.setProperty(v,tokens[k]);}
  }catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: js }} suppressHydrationWarning />;
}
