// store/language.store.jsx - Global language switcher (English / Khmer)
// Translates rendered DOM text + key attributes using the EN->KM dictionary.
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { translate } from "../locales/km";
import { useSettingsStore } from "./settings.store";

const LanguageContext = createContext(null);

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "CODE",
  "PRE",
  "TEXTAREA",
  "NOSCRIPT",
  "SVG",
]);

const ATTR_NAMES = ["placeholder", "title", "aria-label", "alt"];

const hasKhmer = (text) => {
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c >= 0x1780 && c <= 0x17ff) return true;
  }
  return false;
};

export const LanguageProvider = ({ children }) => {
  const { settings } = useSettingsStore();
  const applying = useRef(false);
  const lang = settings?.default_language === "Khmer" ? "km" : "en";

  const applyLanguage = useCallback((toKhmer) => {
    const body = document.body;
    if (!body) return;

    applying.current = true;

    const textWalker = document.createTreeWalker(
      body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (parent && SKIP_TAGS.has(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          const t = node.nodeValue || "";
          if (t.trim().length < 1) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    while (textWalker.nextNode()) {
      const node = textWalker.currentNode;
      const t = node.nodeValue || "";
      if (!toKhmer) {
        if (node.__orig != null) {
          node.nodeValue = node.__orig;
        }
        delete node.__orig;
        delete node.__translated;
        continue;
      }
      if (node.__translated != null && node.__translated !== t) {
        delete node.__orig;
        delete node.__translated;
      }
      if (hasKhmer(t)) continue;
      const base = node.__orig != null ? node.__orig : t;
      if (base.trim().length < 2) continue;
      const translated = translate(base);
      if (translated !== base) {
        node.__orig = base;
        node.__translated = translated;
        node.nodeValue = translated;
      }
    }

    const elWalker = document.createTreeWalker(body, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        if (SKIP_TAGS.has(node.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    while (elWalker.nextNode()) {
      const el = elWalker.currentNode;
      for (const attr of ATTR_NAMES) {
        if (!el.hasAttribute(attr)) continue;
        const val = el.getAttribute(attr) || "";
        if (val.trim().length < 2) continue;
        if (!toKhmer) {
          if (el.__origAttrs && el.__origAttrs[attr] != null) {
            el.setAttribute(attr, el.__origAttrs[attr]);
          }
          continue;
        }
        if (hasKhmer(val)) continue;
        const base = el.__origAttrs && el.__origAttrs[attr] != null
          ? el.__origAttrs[attr]
          : val;
        const translated = translate(base);
        if (translated !== base) {
          if (!el.__origAttrs) el.__origAttrs = {};
          if (el.__origAttrs[attr] == null) el.__origAttrs[attr] = val;
          el.setAttribute(attr, translated);
        }
      }
      if (!toKhmer && el.__origAttrs) {
        delete el.__origAttrs;
      }
    }

    document.documentElement.lang = toKhmer ? "km" : "en";
    document.body.classList.toggle("lang-khmer", toKhmer);

    applying.current = false;
  }, []);

  useEffect(() => {
    const toKhmer = settings?.default_language === "Khmer";
    const id = requestAnimationFrame(() => applyLanguage(toKhmer));

    let mo = null;
    if (toKhmer) {
      mo = new MutationObserver(() => {
        if (applying.current) return;
        cancelAnimationFrame(id);
        requestAnimationFrame(() => applyLanguage(true));
      });
      mo.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
    return () => {
      cancelAnimationFrame(id);
      if (mo) mo.disconnect();
    };
  }, [settings?.default_language, applyLanguage]);

  const value = useMemo(() => ({ lang, t: translate }), [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageStore = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageStore must be used within LanguageProvider");
  }
  return context;
};
