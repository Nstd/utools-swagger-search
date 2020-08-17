"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const request = require('request');
const YAML = require('yaml');
const LogUtil = require("./log-util");
const DBUtil = require("./db-util");
const SwaggerSetting = require("./swagger-setting");
const ExportHelper = require("./swagger-export.js");

require("./utils.js");

class SwaggerSearch {
    constructor() {
        this.yamlDB = [];
        this.checkSize = 0;
        this.dataUpdateTime = new Date();
    }

    loadData(afterInitCallback) {
        let config = DBUtil.getItem(SwaggerSetting.DB_KEY);
        if(!config || !config.data || !config.data.urlSource) {
            LogUtil.notification("请先配置SwaggerSetting");
            return;
        }

        let settings = config.data.urlSource;
        console.log("dbConfig:", config);
        if(settings.type === SwaggerSetting.URL_SOURCE_TYPE.JSON) {
            try {
                let data = JSON.parse(settings[settings.type]);
                this.handleURLs(data, afterInitCallback);
            } catch (e) {
                LogUtil.notifyError("", e);
                return ;
            }
        } else if(settings.type === SwaggerSetting.URL_SOURCE_TYPE.JS) {
            try {
                console.log(module);
                let sourceJs = "const request = require('request'); module.exports = function(onUrlPrepared) { " + settings[settings.type] + " }";
                let sourceCallback = require("./module-helper")("swagger-url-data-source-module", sourceJs);
                sourceCallback((data) => {
                    this.handleURLs(data, afterInitCallback);
                });
            } catch (e) {
                LogUtil.notifyError("", e);
            }
        } else {
            LogUtil.notification("未知数据源类型：" + settings.type);
        }
        // request('http://mdev.haizitong.com/2/api/swagger-config.js', (err, res, body) => {
        //     if (err) {
        //         utools.showNotification(err);
        //         return;
        //     }
        //     console.log("body: ", body);
        //     let config;
        //     try {
        //         const Module = require('module');
        //         const confModule = new Module("swagger-conf-module");
        //         let js = body + "; module.exports = config;";
        //         confModule._compile(js, 'swagger-conf-module');
        //         config = confModule.exports;
        //         // config = eval(js);
        //     } catch (e) {
        //         LogUtil.alert("", e);
        //         utools.showNotification("解析配置文件出错");
        //         return;
        //     }
        //     console.log("config: ", config);
        //     this.yamlDB = [];
        //     this.checkSize = 0;
        //     for (let i in config) {
        //         let item = config[i];
        //         for (let j in item.list) {
        //             let url = item.base + item.list[j].filePath;
        //             if (url.startsWith("/2/api")) {
        //                 url = "http://mdev.haizitong.com" + url;
        //             }
        //             let title = item.list[j].name;
        //             console.log("url=" + url + ", title=" + title);
        //             this.checkSize++;
        //             this.getYaml(url, title, false, (result) => {
        //                 this.checkSize--;
        //                 if (result == null) {
        //                     this.checkInitResult(afterInitCallback);
        //                     return;
        //                 }
        //                 let obj = result.obj;
        //                 let urls = [];
        //                 console.log("url=" + result.url, "title=" + result.title, obj);
        //                 let infoTitle = obj.info ? obj.info.title : "";
        //                 let infoVersion = obj.info ? obj.info.version : "";
        //                 let yamObj = {
        //                     url: result.url,
        //                     title: infoTitle,
        //                     version: infoVersion,
        //                     urls: urls,
        //                 };
        //                 for (let path in obj.paths) {
        //                     let urlObj = this.getUrlObj(path, obj.paths[path]);
        //                     urlObj.docUrl = result.url;
        //                     urlObj.docTitle = infoTitle;
        //                     urlObj.docVersion = infoVersion;
        //                     urlObj.curTitle = result.title;
        //
        //                     // console.log("urlObj:", urlObj);
        //                     urls.push(urlObj);
        //                     this.yamlDB.push(urlObj);
        //                 }
        //                 this.checkInitResult(afterInitCallback);
        //             })
        //         }
        //     }
        // });
    }

    handleURLs(config, afterInitCallback) {
        this.yamlDB = [];
        this.checkSize = 0;
        for (let i in config) {
            let item = config[i];
            let url = item.url;
            let title = item.title;
            this.checkSize++;
            this.getYaml(url, title, false, (result) => {
                this.checkSize--;
                if (result == null) {
                    this.checkInitResult(afterInitCallback);
                    return;
                }
                let obj = result.obj;
                let urls = [];
                console.log("url=" + result.url, "title=" + result.title, obj);
                let infoTitle = obj.info ? obj.info.title : "";
                let infoVersion = obj.info ? obj.info.version : "";
                let yamObj = {
                    url: result.url,
                    title: infoTitle,
                    version: infoVersion,
                    urls: urls,
                };
                for (let path in obj.paths) {
                    let urlObj = this.getUrlObj(path, obj.paths[path]);
                    urlObj.docUrl = result.url;
                    urlObj.docTitle = infoTitle;
                    urlObj.docVersion = infoVersion;
                    urlObj.curTitle = result.title;

                    // console.log("urlObj:", urlObj);
                    urls.push(urlObj);
                    this.yamlDB.push(urlObj);
                }
                this.checkInitResult(afterInitCallback);
            })
        }
    }

    checkInitResult(callback) {
        if (this.checkSize === 0) {
            console.log(this.yamlDB);
            this.dataUpdateTime = new Date();
            if (callback) {
                callback();
            }
        }
    }

    /**
     * 获取数据结构的定义文件
     */
    getYaml(docUrl, title, isShowError, callback) {

        console.log("docUrl:" + docUrl);
        var url = new URL(docUrl);
        var path = url.pathname;
        var yamlName = url.searchParams.get("url");
        var yamlPath = url.origin + path.substring(0, path.lastIndexOf("/")) + "/" + yamlName;

        if (!yamlName) {
            console.log(isShowError, "url中没有找到yaml文件名");
            return;
        }
        console.log("yamlName:" + yamlName);
        console.log("yamlPath:" + yamlPath);

        request(yamlPath, (err, res, body) => {
            if (err) {
                callback(null);
            } else {
                try {
                    var result = YAML.parse(body);
                    console.log("yaml:", result);
                    callback({
                        url: docUrl,
                        title: title,
                        obj: result
                    });
                } catch (e) {
                    console.log("error: " + yamlPath, e);
                    callback(null);
                }
            }
        });
    }

    getUrlObj(path, obj) {
        let type = "";
        if (obj.hasOwnProperty("get")) {
            type = "get"
        } else if (obj.hasOwnProperty("post")) {
            type = "post"
        } else if (obj.hasOwnProperty("delete")) {
            type = "delete"
        } else if (obj.hasOwnProperty("put")) {
            type = "put"
        }

        var slashPath = path.replaceAll("/", "_");
        var slash = obj[type].tags[0].trim().replaceAll(" ", "_") + "/" + type + slashPath;

        return {
            url: path,
            method: type,
            desc: obj[type].summary,
            tags: obj[type].tags,
            slash: slash
        }
    }

    /**
     * 搜索输入的url
     * @param text
     */
    makeSearch(text) {
        console.log("search: " + text);
        let result = [];
        if (text === "") {
            return result;
        }
        for (let idx in this.yamlDB) {
            let item = this.yamlDB[idx];
            let url = item.url;
            if (url.indexOf(text) >= 0 || item.desc.indexOf(text) >= 0) {
                result.push({
                    title: item.method.toUpperCase() + " : " + item.url,
                    description: item.desc,
                    url: item.docUrl,
                    other: item.curTitle,
                    obj: item
                })
            }
        }
        if (result.length === 0) {
            result.push({
                title: "未搜索到相关协议",
                description: "<点击当前选项，重新初始化协议数据> (最后更新时间: " + this.dataUpdateTime.format("yyyy-MM-dd hh:mm:ss") + ")",
                icon: "logo.png",
                obj: text
            })
        }
        return result;
    }

    getSearchExport() {
        return {
            enter: (action, callbackSetList) => {
                var layer = document.getElementById("setting-layer");
                if(layer) {
                    layer.style.display = "none";
                }
            },
            search: (action, searchWord, callbackSetList) => {
                if (this.checkSize !== 0) {
                    callbackSetList([
                        {
                            title: "正在初始化: (剩余:" + this.checkSize + ")",
                            "description": "请稍等.."
                        }
                    ])
                } else {
                    callbackSetList(this.makeSearch(searchWord));
                }
            },
            select: (action, data, callbackSetList) => {
                console.log(action);
                if (typeof data.obj === 'string') {
                    this.loadData(function () {
                        // utools.redirect("搜索协议", data.obj)
                        utools.setSubInputValue(data.obj)
                    });
                    return;
                }
                if (action.payload === "api") {
                    this.showApiAsLocal(data)
                } else if (action.payload === "apiWeb") {
                    this.showApiAsWeb(data)
                }
            },
            placeholder: "搜索"
        }
    }

    showApiAsLocal(data) {
        window.utools.hideMainWindow();
        let seg = data.obj.slash.split("/");
        let ps = seg[0];
        let cs = data.obj.slash.replaceAll("/", "_");
        console.log("ps = " + ps, "cs = " + cs);
        let parentSelector = "[id='resource_" + ps + "'] div.heading h2 a.toggleEndpointList";
        let selector = "[id='" + cs + "'] div.heading h3 span.path a.toggleOperation";
        let ub = window.utools.ubrowser.goto(data.obj.docUrl + "#" + data.obj.slash)
            .click(parentSelector)
            .click(selector)
            .devTools()
            .evaluate(ExportHelper.swaggerFileImport)
            .wait(1000)
            .evaluate(ExportHelper.swaggerCodeExport);
        ub.run({
                width: 1200,
                height: 1000,
                center: true
            });
        // setTimeout(function() {
        //     ub.devTools()
        // }, 3000);
        window.utools.outPlugin();
    }

    showApiAsWeb(data) {
        require('electron').shell.openExternal(data.obj.docUrl + "#" + data.obj.slash)
    }
}

exports = module.exports = SwaggerSearch;