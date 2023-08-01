import * as vscode from "vscode";

const statusbar: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

const updateStatusbar = (target: vscode.Range, selections: vscode.Selection[], visibleHeight: number) => {
  const buffer = Math.ceil(visibleHeight / 2);
  if (target.start.line < selections[0].start.line + buffer) {
    statusbar.text = "Peeking FIRST cursor";
    statusbar.show();
    return;
  }
  if (selections[selections.length - 1].start.line - buffer < target.start.line) {
    statusbar.text = "Peeking LAST cursor";
    statusbar.show();
    return;
  }
  statusbar.hide();
};

class Peeker {
  private readonly _editor: vscode.TextEditor;
  constructor(editor: vscode.TextEditor) {
    this._editor = editor;
  }

  private getVisibleRange(): vscode.Range {
    return this._editor.visibleRanges[0];
  }

  private getOrderedSelections(): vscode.Selection[] {
    return this._editor.selections.slice().sort((a: vscode.Selection, b: vscode.Selection): number => {
      if (a.start.line < b.start.line) {
        return -1;
      }
      if (b.start.line < a.start.line) {
        return 1;
      }
      return 0;
    });
  }

  peekNext() {
    if (this._editor.selections.length < 2) {
      return;
    }
    const ordered = this.getOrderedSelections();
    const visible = this.getVisibleRange();
    const unseenCursors = ordered.filter((sel) => {
      return visible.end.line < sel.start.line;
    });
    const target = unseenCursors.length < 1 ? ordered[0] : unseenCursors[0];
    this._editor.revealRange(target, vscode.TextEditorRevealType.InCenter);
    const visibleHeight = visible.end.line - visible.start.line;
    updateStatusbar(target, ordered, visibleHeight);
  }

  peekPrevious() {
    if (this._editor.selections.length < 2) {
      return;
    }
    const ordered = this.getOrderedSelections();
    const visible = this.getVisibleRange();
    const pastCursors = ordered.filter((sel) => {
      return sel.end.line < visible.start.line;
    });
    const target = pastCursors.length < 1 ? ordered[ordered.length - 1] : pastCursors[pastCursors.length - 1];
    this._editor.revealRange(target, vscode.TextEditorRevealType.InCenter);
    const visibleHeight = visible.end.line - visible.start.line;
    updateStatusbar(target, ordered, visibleHeight);
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("peek-cursor.peekNext", (editor: vscode.TextEditor) => {
      const peeker = new Peeker(editor);
      peeker.peekNext();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("peek-cursor.peekPrevious", (editor: vscode.TextEditor) => {
      const peeker = new Peeker(editor);
      peeker.peekPrevious();
    })
  );
  vscode.window.onDidChangeTextEditorSelection(() => {
    statusbar.hide();
  });
}

export function deactivate() {
  statusbar.dispose();
}
