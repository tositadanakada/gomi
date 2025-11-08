$recycleBin = (New-Object -ComObject Shell.Application).NameSpace(0x0a) # open fileobject $Recycle.Bin
$maxfileCount = 30
$recycleBinItems = $recycleBin.Items() | Select-Object -First $maxfileCount
$maxfileCount -= $recycleBinItems.Count
# C:\\$Recycle.Bin\\S-1-5-21-userSid\\failehash.extend  ex) C:\\$Recycle.Bin\\S-1-5-21-xxxx\\$RVOP46T\\aaadir\\aaa.txt

if ($recycleBinItems.Count -eq 0){
  $noneobj=@{
    type = "notfound"
  }
  convertTo-Json $noneobj # return $Recycle.Bin none
}else{

  foreach ($recycleBinItem in $recycleBinItems)
  {
    if (!$recycleBinItem.IsFolder){
      $restorePath = $recycleBinItem.ExtendedProperty("System.Recycle.DeletedFrom")
      $abstPath = $recycleBinItem.Path
      $splitabstPath = $recycleBinItem.Path.split("\\",4)
      $relativePath = $splitabstPath[$splitabstPath.length-1]
      $filename = $recycleBinItem.Name
      $rootobj = @{
        type = "rootobj"
        filename = $filename
        restorePath = $restorePath
        abstPath = $abstPath
        relativePath = $relativePath
        virtualPath = $filename
        roothash = $relativePath
      }
      convertTo-Json $rootobj -Compress
      #echo $recycleBinItem | Get-Member
    }
  
    if ($recycleBinItem.IsFolder){
      $filepath = $recycleBinItem.Path
      $rootfolderName = $recycleBinItem.Name
      $rootfolderrestorepath = $recycleBinItem.ExtendedProperty("System.Recycle.DeletedFrom")
      $splitrootpath = $filepath.split("\\",4)
      $roothash = $splitrootpath[$splitrootpath.length-1]
      $chiledlen = Get-ChildItem -Path $filepath -File -Force -Recurse  | Select-Object -First $maxfileCount
      $maxfileCount -= $chiledlen.Count
      foreach ($childItem in $chiledlen){
        $abstPath = $childItem.FullName
        $splitabstPath = $childItem.FullName.split("\\",4)
        $relativePath = $splitabstPath[$splitabstPath.length-1]
        $virtualPath = $relativePath.Replace($roothash,$rootfolderName)
        $filename = $childItem.Name
      
        $childobj=@{
          type = "childobj"
          rootfolderrestorepath= $rootfolderrestorepath;
          rootfolderName= $rootfolderName;
          filename=$filename;
          abstPath=$abstPath;
          relativePath = $relativePath
          virtualPath = $virtualPath ;
          restorePath = $rootfolderrestorepath;
          roothash = $roothash
        }
        convertTo-Json $childobj -Compress
      }
      #echo $chiledlen | Get-Member
    }
    if ($maxfileCount -le 0){
      return
    }
  }
}