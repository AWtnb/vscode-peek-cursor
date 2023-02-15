import * as vscode from "vscode";

const sortSelections = (editor: vscode.TextEditor): vscode.Selection[] => {
  return editor.selections.slice().sort((a: vscode.Selection, b: vscode.Selection): number => {
    if (a.start.line < b.start.line) {
      return -1;
    }
    if (b.start.line < a.start.line) {
      return 1;
    }
    return 0;
  });
};

const peekNext = (editor: vscode.TextEditor) => {
  if (editor.selections.length < 2) {
    return;
  }
  const sorted = sortSelections(editor);
  const visible = editor.visibleRanges[0];
  const unseenCursors = sorted.filter((sel) => {
    return visible.end.line < sel.start.line;
  });
  const targetLine = unseenCursors.length < 1 ? sorted[0].start.line : unseenCursors[0].start.line;
  const scrollPos = unseenCursors.length < 1 ? "center" : "top";
  vscode.commands.executeCommand("revealLine", {
    lineNumber: targetLine,
    at: scrollPos,
  });
};

const peekPrevious = (editor: vscode.TextEditor) => {
  if (editor.selections.length < 2) {
    return;
  }
  const sorted = sortSelections(editor);
  const visible = editor.visibleRanges[0];
  const pastCursors = sorted.filter((sel) => {
    return sel.end.line < visible.start.line;
  });
  const targetLine = pastCursors.length < 1 ? sorted[sorted.length - 1].end.line : pastCursors[pastCursors.length - 1].start.line;
  vscode.commands.executeCommand("revealLine", {
    lineNumber: targetLine,
    at: "top",
  });
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("peek-cursor.peekNext", (editor: vscode.TextEditor) => {
      peekNext(editor);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("peek-cursor.peekPrevious", (editor: vscode.TextEditor) => {
      peekPrevious(editor);
    })
  );
}

export function deactivate() {}
