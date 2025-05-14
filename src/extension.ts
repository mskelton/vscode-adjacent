import * as vscode from "vscode"
import * as path from "node:path"
import * as fs from "node:fs"

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "adjacent.quickOpen",
    async function () {
      const activeEditor = vscode.window.activeTextEditor
      if (!activeEditor) {
        vscode.window.showInformationMessage("No active editor found")
        return
      }

      const currentFilePath = activeEditor.document.uri.fsPath
      const currentDirPath = path.dirname(currentFilePath)

      try {
        // Read all files in the current directory
        const files = fs.readdirSync(currentDirPath)

        // Filter out the current file and non-file entries
        const adjacentFiles = files
          .filter((file) => {
            const filePath = path.join(currentDirPath, file)
            return (
              fs.statSync(filePath).isFile() && filePath !== currentFilePath
            )
          })
          .sort() // Sort alphabetically

        if (adjacentFiles.length === 0) {
          vscode.window.showInformationMessage(
            "No adjacent files found in this directory",
          )
          return
        }

        // Show quick pick with files in the current directory
        const selectedFile = await vscode.window.showQuickPick(adjacentFiles, {
          placeHolder: "Select an adjacent file",
        })

        if (selectedFile) {
          const selectedFilePath = path.join(currentDirPath, selectedFile)
          const document =
            await vscode.workspace.openTextDocument(selectedFilePath)
          await vscode.window.showTextDocument(document, { preview: false })
        }
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(
            `Error opening adjacent file: ${error.message}`,
          )
        }
      }
    },
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
