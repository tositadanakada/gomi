import * as vscode from "vscode";
import { createUri, ShellService } from "./shellService";
import { FileInfo, Model } from "./model";
import { Tracer } from "./tracer";

class InfoItem extends vscode.TreeItem {
  constructor(
    abstPath: string, //Item label
    description: string,
    file: FileInfo
  ) {
    super(abstPath);
    this.id = abstPath; //uniq key
    let uri = vscode.Uri.file(abstPath);
    this.tooltip = description; // hover text
    this.description = file.virtualPath;
    this.label = file.filename;
    this.command = {
      command: "vscode.open",
      title: "",
      arguments: [uri],
    };
  }
  readonly parent = undefined;
}

export class ExplorerViewProvider implements vscode.TreeDataProvider<InfoItem> {
  private readonly _ondDidChangeTreeDate = new vscode.EventEmitter<
    InfoItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._ondDidChangeTreeDate.event;

  folderList: InfoItem[] = [];

  constructor(private _model: Model, private _shellService: ShellService) {
    Tracer.verbose("explorerViewProvider");
  }

  refresh(): void {
    this._ondDidChangeTreeDate.fire();
  }

  getTreeItem(element: InfoItem): vscode.TreeItem {
    Tracer.verbose("getTreeItem");
    return element;
  }

  getChildren(element?: any): vscode.ProviderResult<InfoItem[]> {
    Tracer.verbose("getChildren");
    this.folderList = [];
    this.getInfoItem();
    return this.folderList;
  }

  private getInfoItem() {
    this._shellService.getFileInfo();
    const files = this._shellService.files;
    files.forEach((value, index) => {
      let restorePath = value.restorePath + value.virtualPath;
      let description = {
        filename: value.filename,
        restorepath: restorePath,
        virtualPath: value.virtualPath,
      };
      this.folderList.push(
        new InfoItem(value.abstPath, JSON.stringify(description), value)
      );
    });
  }
}
