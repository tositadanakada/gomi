// create linux trash tree item 
import * as vscode from "vscode";
import { Tracer} from "./tracer"
import * as fs from 'fs';
import * as os from "os" ;
import * as path from "path";
import * as ini from "ini";
import {FileInfo} from "./interface";

/*  read Recycle bin specifications https://specifications.freedesktop.org/trash/latest/
    
*/

interface LinuxTrashFileInfo {
  restorePath: string;
  DeletionDate: string;
}

interface LinuxTrashFileInfo {
  restorePath: string;
  DeletionDate: string;
}

export class RecyclebinItemListLinux{
    public gomiUri = path.join(`${os.homedir}` ,".local/share/Trash");
    public gomiPhysicalRootPath = path.join( this.gomiUri, "files");
    public gomiInfoRootPath = path.join(this.gomiUri, "info");
    public files:FileInfo[] = []
    
    constructor(context: vscode.ExtensionContext){
    }

    public getFileInfo(){
        this.files = []
        let fileinfo:FileInfo
        const physicalItems = this.readPhysicalDirectory()
        if(physicalItems){
            physicalItems.forEach((abstFileName,index)=>{
                console.log('File:',abstFileName);
                const TrashInfo = this.readTrashInfoItem(abstFileName);
                const abstPath = path.join( this.gomiPhysicalRootPath ,abstFileName);

                fileinfo = {
                    type: "rootobj",
                    abstPath: abstPath,
                    relativePath: abstFileName,
                    virtualPath: abstFileName,
                    filename: abstFileName,
                    restorePath: TrashInfo!.restorePath,
                }
                this.files.push(fileinfo)
                console.log("",fileinfo)
                console.log("",this.files)
            })
        }
    }

    private readPhysicalDirectory() :string []| null |undefined{
        try {
            const physicalItems = fs.readdirSync(this.gomiPhysicalRootPath)
            return physicalItems
        }catch(err){
            console.error('Error reading directory:', err)
            return 
        }
    }

    private readTrashInfoItem(abstFileName: string): LinuxTrashFileInfo | null | undefined{
        try {
            const TrashItemInfoFiles = fs.readdirSync(this.gomiInfoRootPath)
            const TrashInfoRelativePath = abstFileName + ".trashinfo";
            const TrashInfoPath = path.join (this.gomiInfoRootPath ,TrashInfoRelativePath);
            TrashInfoRelativePath

            if (TrashItemInfoFiles.includes(TrashInfoRelativePath)){
                console.log("\t TrashInfoPath:",TrashInfoPath)
                const linuxTrashFileInfo =this.readInfoFile(TrashInfoPath)
                return linuxTrashFileInfo
            }else{
                return;
            }
        }catch(err){
            console.error('Error reading directory:', err) 
            return;
        }
    }

    private readInfoFile(infoPath: string): LinuxTrashFileInfo| null | undefined {
        
        try {
            const FileInfo = ini.parse(fs.readFileSync(infoPath,'utf-8'))
            const restorePath = FileInfo['Trash Info']['Path'];
            const DeletionDate = FileInfo['Trash Info']['DeletionDate']
            console.log("\t restorePath:",FileInfo['Trash Info']['Path'])
            console.log("\t DeletionDate:",FileInfo['Trash Info']['DeletionDate'])
            return {
                restorePath: restorePath,
                DeletionDate: DeletionDate
            }
        }catch(err){
            console.error('Error reading directory:', err)
        }
    }
}