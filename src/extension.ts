import * as vscode from "vscode";

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
    const sorted = this.getOrderedSelections();
    const visible = this.getVisibleRange();
    const unseenCursors = sorted.filter((sel) => {
      return visible.end.line < sel.start.line;
    });
    const targetLine = unseenCursors.length < 1 ? sorted[0].start.line : unseenCursors[0].start.line;
    const targetRange = this._editor.document.lineAt(targetLine).range;
    this._editor.revealRange(targetRange, vscode.TextEditorRevealType.InCenter);
  }

  peekPrevious() {
    if (this._editor.selections.length < 2) {
      return;
    }
    const sorted = this.getOrderedSelections();
    const visible = this.getVisibleRange();
    const pastCursors = sorted.filter((sel) => {
      return sel.end.line < visible.start.line;
    });
    const targetLine = pastCursors.length < 1 ? sorted[sorted.length - 1].end.line : pastCursors[pastCursors.length - 1].start.line;
    const targetRange = this._editor.document.lineAt(targetLine).range;
    this._editor.revealRange(targetRange, vscode.TextEditorRevealType.InCenter);
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
}

export function deactivate() {}
