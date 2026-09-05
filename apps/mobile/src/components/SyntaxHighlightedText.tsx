import React from "react";
import { Text, ScrollView, StyleSheet, View } from "react-native";

interface Token {
  text: string;
  color: string;
}

interface SyntaxHighlightedTextProps {
  code: string;
  language: string;
  style?: object;
  contentStyle?: object;
  showLineNumbers?: boolean;
  wordWrap?: boolean;
}

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "class", "import", "export", "default", "from", "async", "await", "try",
  "catch", "finally", "throw", "new", "this", "extends", "super", "static",
  "get", "set", "of", "in", "instanceof", "typeof", "void", "delete",
  "switch", "case", "break", "continue", "do", "yield", "as", "type",
  "interface", "enum", "implements", "public", "private", "protected",
  "readonly", "abstract", "declare", "module", "namespace", "require",
]);

const BUILTINS = new Set([
  "console", "window", "document", "Array", "Object", "String", "Number",
  "Boolean", "Symbol", "Map", "Set", "Promise", "async", "await", "fetch",
  "JSON", "Math", "Date", "RegExp", "Error", "Proxy", "Reflect", "WeakMap",
  "WeakSet", "DataView", "Intl", "React", "Component", "useState", "useEffect",
  "useContext", "useRef", "useMemo", "useCallback", "useReducer", "useLayoutEffect",
  "useImperativeHandle", "useDebugValue", "useDeferredValue", "useTransition",
  "useId", "useSyncExternalStore", "useInsertionEffect",
]);

const TYPES = new Set([
  "string", "number", "boolean", "any", "void", "null", "undefined", "never",
  "unknown", "object", "symbol", "bigint", "literal", "tuple", "record",
  "partial", "required", "readonly", "pick", "omit", "exclude", "extract",
  "nonnullable", "parameters", "returnType", "instanceType", "this", "type",
]);

const COLORS = {
  keyword: "#C084FC",
  builtin: "#60A5FA",
  type: "#34D399",
  string: "#86EFAC",
  number: "#FCA5A5",
  comment: "#64748B",
  punctuation: "#94A3B8",
  operator: "#F472B6",
  plain: "#E2E8F0",
};

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRegex(languages: string[]): RegExp | null {
  if (languages.length === 0) return null;

  const patterns: string[] = [];

  if (languages.some(lang => ["css", "html", "xml"].includes(lang))) {
    patterns.push("(<!--[\\s\\S]*?-->)");
  }
  if (languages.some(lang => ["js", "ts", "jsx", "tsx", "json", "md", "markdown", "python", "java", "go", "rust", "sql", "sh", "bash", "shell", "php", "rb", "ruby", "yaml", "yml"].includes(lang))) {
    patterns.push("(//.*$|#.*$)");
  }
  patterns.push('("(?:[^"\\n]|\\.)*"|\'(?:[^\'\\n]|\\.)*\'|`(?:[^`\\n]|\\.)*`)');
  patterns.push("\\b(\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)\\b");
  patterns.push(`\\b(${[...KEYWORDS, ...TYPES].map(escapeRegExp).join("|")})\\b`);
  patterns.push(`\\b(${[...BUILTINS].map(escapeRegExp).join("|")})\\b`);
  patterns.push("([+\\-*/%=<>!&|^~?:]+)");
  patterns.push("([{}()\\[\\];,.])");

  return new RegExp(patterns.map(p => `(${p})`).join("|"), "gm");
}

function highlightCode(code: string, language: string): Token[] {
  const lang = (language || "").toLowerCase();
  const tokens: Token[] = [];

  const supportedLanguages = [
    "js", "javascript", "jsx", "ts", "typescript", "tsx", "css", "html", "xml",
    "json", "yaml", "yml", "md", "markdown", "python", "java", "c", "cpp", "go",
    "rust", "sql", "sh", "bash", "shell", "php", "rb", "ruby",
  ];
  const normalizedLang = supportedLanguages.includes(lang) ? lang : "";

  const regex = buildRegex(normalizedLang ? [normalizedLang] : ["js", "ts"]);
  if (!regex) {
    return [{ text: code, color: COLORS.plain }];
  }

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, match.index), color: COLORS.plain });
    }

    const matchedText = match[0];
    const keywordMatch = match[3];
    const builtinMatch = match[4];
    const stringMatch = match[2];
    const numberMatch = match[1];
    const commentMatch = matchedText.startsWith("//") || matchedText.startsWith("#") || matchedText.startsWith("/*") || matchedText.startsWith("<!--");

    if (commentMatch) {
      tokens.push({ text: matchedText, color: COLORS.comment });
    } else if (stringMatch) {
      tokens.push({ text: matchedText, color: COLORS.string });
    } else if (numberMatch) {
      tokens.push({ text: matchedText, color: COLORS.number });
    } else if (keywordMatch) {
      if (TYPES.has(keywordMatch)) {
        tokens.push({ text: matchedText, color: COLORS.type });
      } else {
        tokens.push({ text: matchedText, color: COLORS.keyword });
      }
    } else if (builtinMatch) {
      tokens.push({ text: matchedText, color: COLORS.builtin });
    } else if (/[+\-*/%=<>!&|^~?:]+/.test(matchedText)) {
      tokens.push({ text: matchedText, color: COLORS.operator });
    } else if (/[{}()\[\];,.]/.test(matchedText)) {
      tokens.push({ text: matchedText, color: COLORS.punctuation });
    } else {
      tokens.push({ text: matchedText, color: COLORS.plain });
    }

    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex), color: COLORS.plain });
  }

  return tokens.length > 0 ? tokens : [{ text: code, color: COLORS.plain }];
}

export const SyntaxHighlightedText: React.FC<SyntaxHighlightedTextProps> = ({
  code,
  language,
  style,
  contentStyle,
  showLineNumbers,
  wordWrap = true,
}) => {
  const tokens = highlightCode(code, language);
  const lines = code.split("\n");

  const codeContent = (
    <Text style={[styles.text, !wordWrap && styles.textNoWrap]}>
      {tokens.map((token, index) => (
        <Text key={index} style={{ color: token.color }}>
          {token.text}
        </Text>
      ))}
    </Text>
  );

  const highlightedCode = showLineNumbers ? (
    <View style={styles.codeRow}>
      <View style={styles.lineNumbersContainer}>
        {lines.map((_, index) => (
          <Text key={index} style={styles.lineNumber}>
            {index + 1}
          </Text>
        ))}
      </View>
      <View style={styles.codeContainer}>{codeContent}</View>
    </View>
  ) : (
    codeContent
  );

  return (
    <ScrollView style={[styles.container, style]} contentContainerStyle={contentStyle}>
      {showLineNumbers || !wordWrap ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
          {highlightedCode}
        </ScrollView>
      ) : (
        highlightedCode
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
  textNoWrap: {
    flexShrink: 1,
  },
  codeRow: {
    flexDirection: "row",
  },
  codeContainer: {
    flex: 1,
  },
  lineNumbersContainer: {
    marginRight: 12,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#334155",
  },
  lineNumber: {
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "right",
  },
});
