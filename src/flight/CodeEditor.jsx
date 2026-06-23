// ---------------------------------------------------------------------------
//  CodeEditor.jsx · CodeMirror 6 Python editor for the offline coding runner.
//  Syntax highlighting, smart auto-indent (indent after `:`, maintain on Enter),
//  Tab/Shift-Tab indent, bracket matching + auto-close, line numbers.
//  Everything is bundled (no CDN) so it works on a plane. If CodeMirror ever
//  throws at runtime, an error boundary degrades to a plain textarea so you can
//  still type — nothing about the practice session is lost.
// ---------------------------------------------------------------------------

import { Component } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
// Tab/Shift-Tab indent isn't bound by default in CodeMirror 6 — add it so the
// editor behaves like LeetCode's.
const EXTENSIONS = [python(), keymap.of([indentWithTab])];

const BASIC = {
  lineNumbers: true,
  highlightActiveLine: true,
  highlightActiveLineGutter: true,
  bracketMatching: true,
  closeBrackets: true,
  autocompletion: true,
  indentOnInput: true,
  tabSize: 4,
};

function CM({ value, onChange }) {
  return (
    <CodeMirror
      value={value}
      onChange={(v) => onChange(v)}
      extensions={EXTENSIONS}
      theme={oneDark}
      minHeight="300px"
      maxHeight="600px"
      basicSetup={BASIC}
      style={{ fontSize: 13.5, fontFamily: mono }}
    />
  );
}

export default class CodeEditor extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    const { value, onChange } = this.props;
    if (this.state.failed) {
      return (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} rows={16}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const el = e.target, s = el.selectionStart, en = el.selectionEnd;
              onChange(value.slice(0, s) + "    " + value.slice(en));
              requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4; });
            }
          }}
          style={{ width: "100%", boxSizing: "border-box", border: "none", outline: "none",
            resize: "vertical", background: "#f3f4f6", color: "#1f2328", fontFamily: mono,
            fontSize: 13.5, lineHeight: 1.5, padding: "14px 16px" }}
        />
      );
    }
    return <CM value={value} onChange={onChange} />;
  }
}
