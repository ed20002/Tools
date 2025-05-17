
const { strict } = require('assert');
const fs = require('fs');
const path = require('path');

/**
 * 生成Bundle的名字列表
 * PS：路径下的一级目录的第一层文件夹名字
 * @returns 
 */
function generateBundleNames(url){
    let files = fs.readdirSync(url);
    let names = [];
    for (let item of files){
        const filePath = path.join(url, item);
        const state    = fs.statSync(filePath);
        if (state.isDirectory() === true) {
            names.push(item);
        }
    }
    return names;
}

/**
 * 过滤文件类型
 * @param name 
 * @returns 
 */
function filteFileType(name){
    let enable = true;
    for (let item of exclude){
        if (name.search(item) > -1){
            enable = false;
            break;
        }
    }
    return enable;
}

/**
 * 生成JSON文件
 * @param url 
 */
function generateJSON(url) {
    const files = fs.readdirSync(url);
    for (let file of files){
        const filePath = path.join(url, file);
        const state    = fs.statSync(filePath);
        if (state.isDirectory() === true) {
            generateJSON(filePath);
        } else {
            //排除部分文件格式
            if (filteFileType(file) == false){
                continue;
            }
            //分析类型
            let sType = "Other";
            if (file.search(".prefab") > -1){
                sType = "Prefab";
            }
            if (file.search(".scene") > -1){
                sType = "Scene";
            }
            //名字去除后缀
            let fileName = file;
            let names = fileName.split(".");
            if (names.length > 1){
                fileName = names[0];
            }
            //生成正式的使用路径
            let sFilePath = filePath;
            sFilePath     = sFilePath.replace("assets/AssetPackage/", ""); //去除路头部
            sFilePath     = sFilePath.replace(file, fileName);            //去除文件后缀
            switch(sType){
                case "Prefab":
                    prefabs.push(sFilePath);
                    break;
                case "Scene":
                    scenes.push(sFilePath);
                    break;
                case "Other":
                    others.push(sFilePath);
                    break;
            }
        }
    }
}

let others  = [];
let prefabs = [];
let scenes  = [];

/** Bundle根目录 */
let baseUrl = "./assets/AssetPackage/";
/** 排除的文件类型 */
let exclude = [".DS_Store", ".meta", ".ts"];

console.log('【 ****** RES开始分析 ****** 】');
let jsonResult = {};
let bundleFile = generateBundleNames(baseUrl);
//以Bundle名为KEY, 后成对应配置
for (let name of bundleFile){
    generateJSON(baseUrl + name);
    jsonResult[name] = {Prefab:prefabs, Scene:scenes, Other:others};
    //清空数据
    prefabs = [];
    scenes  = [];
    others  = [];
}
console.log("【 ****** 配置文件对象 ****** 】\n", jsonResult);
fs.writeFileSync('RES.json', JSON.stringify(jsonResult, null, 2));
console.log('【 ****** RES文件生成成功 ****** 】');
