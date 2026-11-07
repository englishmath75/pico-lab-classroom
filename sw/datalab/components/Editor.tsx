"use client";
import { useEffect, useRef } from "react";
import {
  EditorView,
  keymap,
  Decoration,
  ViewPlugin,
  DecorationSet,
} from "@codemirror/view";
import { EditorState, Prec } from "@codemirror/state";
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
  executedLine = 0,
}: {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  line: number;
  dark: boolean;
  executedLine?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const props = useRef({ onChange, onRun, line, executedLine });
  useEffect(() => {
    props.current = { onChange, onRun, line, executedLine };
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
          const marks = [];
          for (const [row, cls] of [[props.current.executedLine, 'executed-python-line'],[n,'active-python-line']] as const) {
            if(row>0&&row<=v.state.doc.lines) marks.push(Decoration.line({class:cls}).range(v.state.doc.line(row).from));
          }
          this.decorations = Decoration.set(marks,true);
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
          Prec.highest(keymap.of([
            {
              key: "Mod-Enter",
              run: () => {
                props.current.onRun();
                return true;
              },
            },
            indentWithTab,
          ])),
          EditorView.contentAttributes.of({
            "aria-label": "Python 코드 편집기",
            "aria-keyshortcuts": "Control+Enter Meta+Enter",
            "aria-description": "Ctrl+Enter로 실행합니다. 편집기를 벗어나려면 Escape를 누른 다음 Tab을 누르세요.",
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
  }, [line, executedLine]);
  return <div className="editor-host" ref={host} />;
}
