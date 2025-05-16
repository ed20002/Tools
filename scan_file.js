
const { strict } = require('assert');
const fs = require('fs');
const path = require('path');

let others  = [];
let prefabs = [];
let scenes  = [];

let exit = [".DS_Store", ".meta", ".ts"]

function StartScan(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (let file of files){
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() === true) {
            StartScan(filePath, fileList);
        } else {
            //排除部分文件格式
            let enable = true;
            for (let key of exit){
                if (file.search(key) > -1){
                    enable = false;
                    break;
                }
            }
            if (enable == true){
                //分析类型
                let sType = "others";
                if (file.search(".prefab") > -1){
                    sType = "Prefab";
                }
                if (file.search(".scene") > -1){
                    sType = "Scene";
                }
                //名字去除后缀
                let fileName = file;
                let names = fileName.split(".");
                if (names.length != 1){
                    fileName = names[0];
                }
                //path处理
                let sFilePath = filePath;
                sFilePath = sFilePath.replace("assets/", "");
                sFilePath = sFilePath.replace(file, fileName);
                switch(sType){
                    case "Prefab":
                        prefabs.push(sFilePath);
                        break;
                    case "Scene":
                        scenes.push(sFilePath);
                        break;
                    case "others":
                        others.push(sFilePath);
                        break;
                }
            }
        }
    }
}

// 使用示例
const targetDir = './assets'; // 要遍历的目录
StartScan(targetDir);
const result = {Prefab:prefabs, Scene:scenes, Other:others};
fs.writeFileSync('files.json', JSON.stringify(result, null, 2));
console.log('文件列表已保存到files.json');
