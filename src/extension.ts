import * as vscode from "vscode";
import { Model } from "./model";
import { Tracer } from "./tracer";
import { ExplorerViewProvider } from "./explorerViewProvider";
import { ShellService } from "./shellService";
import { RecyclebinItemListLinux } from "./recyclebinItemListLinux";

export function activate(context: vscode.ExtensionContext) {
  const model = new Model(context);
  const shellService = new ShellService(context);
  const recyclebinItemListLinux = new RecyclebinItemListLinux(context)
  const viewProvider = new ExplorerViewProvider(model, shellService,recyclebinItemListLinux );
  vscode.window.registerTreeDataProvider("gomiTree", viewProvider);

  const gomiTreeRefreshdisposable = vscode.commands.registerCommand(
    "gomi.refresh",
    () => viewProvider.refresh()
  );

  const hellodisposable = vscode.commands.registerCommand(
    "gomi.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from gomi!");
    }
  );
  const messagedisposable = vscode.commands.registerCommand(
    "gomi.infoMessage",
    () => {
      Tracer.info("info message");
    }
  );
  context.subscriptions.push(hellodisposable);
  context.subscriptions.push(messagedisposable);
  context.subscriptions.push(gomiTreeRefreshdisposable);
}

export function deactivate() {}
