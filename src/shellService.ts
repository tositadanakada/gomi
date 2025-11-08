// execute shellscript change for platform
import * as vscode from "vscode";
import { Tracer } from "./tracer";
import { execSync, execFileSync } from "child_process";
import path from "path";
import * as fs from "fs";
import * as iconv from "iconv-lite";

export interface FileInfo {
  type: string;
  abstPath: string;
  relativePath: string;
  virtualPath: string;
  filename: string;
  restorePath: string;
}

export function getsid(): string {
  const getSidCommand = "(GET-LocalUser -Name $env:USERNAME).SID.Value";
  let sid: string = "";
  if (process.platform === "win32") {
    const stdout = execSync(getSidCommand, {
      shell: "powershell.exe",
      maxBuffer: 1024 * 1024 * 50,
    });
    const sid = stdout.toString().trim();
    return sid;
  }
  return sid;
}

export function getExecutionPolicy(): Boolean {
  const getExecutionPolicyCommand = "Get-ExecutionPolicy";
  let is_execution = false;
  if (process.platform === "win32") {
    const stdout = execSync(getExecutionPolicyCommand, {
      shell: "powershell.exe",
    });
    const executionPolicy = stdout.toString().trim();
    Tracer.verbose("ExecutionPolicy: " + executionPolicy);
    const regex =/Restricted|Undefined/;
    is_execution = regex.test(executionPolicy);
    return !is_execution;
  }
  return is_execution;
}

export function createUri(): string {
  const sid = getsid();
  const recycleBinPath = "C:\\\\$Recycle.Bin\\\\" + sid; // escape string \\→\ \$→$
  return recycleBinPath;
}

export class ShellService {
  public gomiUri: string;
  public files: FileInfo[] = [];
  private context: vscode.ExtensionContext;
  private is_execution: Boolean;

  constructor(context: vscode.ExtensionContext) {
    this.is_execution = getExecutionPolicy();
    if (!this.is_execution){           
      vscode.window.showErrorMessage(
        '[GOMI] PSSecurityException. Allow execution powershell script.',
      );
    }
    this.gomiUri = createUri();
    this.context = context;
  }

  parse_json(info: any): FileInfo {
    return {
      type: info.type,
      abstPath: info.abstPath,
      filename: info.filename,
      relativePath: info.relativePath,
      restorePath: info.restorePath,
      virtualPath: info.virtualPath,
    };
  }

  public getFileInfo() {
    Tracer.verbose("getFileInfo");

    if(!this.is_execution) {
      Tracer.verbose("Allow execution powershell script");
      return;
    }
    
    this.files = [];

    let stdout: string="";
    try {
      let stdoutbuffer = execFileSync(
        this.context.extensionPath + "\\script\\cmd\\ps1\\recyclebinItemList.ps1",
        { shell: "powershell.exe",}
      );
      stdout = iconv.decode(stdoutbuffer, "shift_JIS");
    } catch(error){
      if(error instanceof Error){
        Tracer.error(error.message);
      }
    }
    Tracer.verbose(`stdout:${stdout}`);
    const splitstdout = stdout.split(/\r\n/g).forEach((value, index) => {
      Tracer.verbose(`${value}`);
      if (value !== "") {
        const json = JSON.parse(value);
        if (json.type==="notfound"){
          return;
        }
        this.files.push(this.parse_json(json));
      }
      return;
    });
    Tracer.verbose(`${this.files}`);
  }
}
