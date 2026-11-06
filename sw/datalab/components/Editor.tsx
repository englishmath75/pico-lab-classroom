"use client";
import { useEffect, useRef } from "react";
import {
  EditorView,
  keymap,
  Decoration,
  ViewPlugin,
  DecorationSet,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { indentWithTab } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
export default function Editor({
  code,
  onChange,
  onRun,
  line,
  dark,
}: {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  line: number;
  dark: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const props = useRef({ onChange, onRun, line });
  useEffect(() => {
    props.current = { onChange, onRun, line };
  });
  useEffect(() => {
    if (!host.current) return;
    const mark = ViewPlugin.fromClass(
      class {
        decorations: DecorationSet = Decoration.none;
        update() {
          const v = view.current;
          if (!v) return;
          const n = props.current.line;
          this.decorations =
            n > 0 && n <= v.state.doc.lines
              ? Decoration.set([
                  Decoration.line({ class: "active-python-line" }).range(
                    v.state.doc.line(n).from,
                  ),
                ])
              : Decoration.none;
        }
      },
      { decorations: (v) => v.decorations },
    );
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          python(),
          ...(dark ? [oneDark] : []),
          mark,
          keymap.of([
            {
              key: "Mod-Enter",
              run: () => {
                props.current.onRun();
                return true;
              },
            },
            indentWithTab,
          ]),
          EditorView.contentAttributes.of({
            "aria-label": "Python 코드 편집기",
            spellcheck: "false",
          }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) props.current.onChange(u.state.doc.toString());
          }),
          EditorView.theme({
            "&": { height: "100%", fontSize: "14px" },
            ".cm-scroller": {
              overflow: "auto",
              fontFamily: "ui-monospace,Consolas,monospace",
            },
            ".cm-content": { padding: "18px 0" },
            ".cm-line": { padding: "0 16px" },
          }),
        ],
      }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // Recreate only when the theme changes; code synchronization is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);
  useEffect(() => {
    const v = view.current;
    if (v && code !== v.state.doc.toString())
      v.dispatch({
        changes: { from: 0, to: v.state.doc.length, insert: code },
      });
  }, [code]);
  useEffect(() => {
    view.current?.dispatch({});
  }, [line]);
  return <div className="editor-host" ref={host} />;
}
