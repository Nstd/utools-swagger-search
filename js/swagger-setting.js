"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const fs = require('fs');
const path = require('path');
const DBUtil = require('./db-util');
const LogUtil = require('./log-util');
const _ = require('underscore');
// const CodeMirror = require('codemirror');

const DB_KEY = "SwaggerApiSetting";

class URL_SOURCE_TYPE {
    static JSON = "json";
    static JS = "js";
}

class SwaggerSetting {

    constructor() {
        this.isDataInited = false;
    }

    async iniData(configPath) {
        if(configPath) {
            try {
                let content = await fs.readFileSync(configPath, 'utf8');
                let conf = JSON.parse(content);
                // console.log("readConfig:", content);
                let checkResult = this.isValidateConfig(conf);
                if(checkResult) {
                    LogUtil.notifyAlert("配置文件格式错误：" + checkResult);
                }
                this.settings = conf;
                DBUtil.putItem(DB_KEY, conf);
            } catch(e) {
                LogUtil.notifyError("配置文件读取失败", e);
            }
        }

        if(this.isDataInited) return ;

        // $ = require('jquery')(window);

        let defaultSetting = {
            urlSource: {
                type: URL_SOURCE_TYPE.JSON,
                json: "",
                js: ""
            },
        };
        let dbSetting = DBUtil.getItem(DB_KEY);
        this.settings = (dbSetting && dbSetting.data) || defaultSetting;
        this.codeMirror = undefined;
        this.isInited = false;
        console.log("dbSettings: ", this.settings);
        this.isDataInited = true;
    }

    isValidateConfig(conf) {
        if(!conf.hasOwnProperty("urlSource")) return "empty urlSource";
        if(!conf.urlSource.hasOwnProperty("type")) return "empty urlSource.type";
        if(![URL_SOURCE_TYPE.JSON, URL_SOURCE_TYPE.JS].includes(conf.urlSource.type)) return "unknown urlSource.type";
        if(!conf.urlSource.hasOwnProperty(conf.urlSource.type)) return "empty urlSource." + conf.urlSource.type;
        return "";
    }

    getSettingExport() {
        return {
            enter: async (action) => {
                try {
                    console.log("enter settings", action, typeof action.payload);
                    await this.iniData(typeof action.payload === "object" ? action.payload[0].path : undefined);
                    setTimeout(() => {
                        this.initSettingView();
                        utools.setExpendHeight(800);
                    }, 50);
                } catch(e) {
                    console.error(e);
                    LogUtil.notifyError("初始化异常", e)
                }
            },
            search: (action, searchWord, callbackSetList) => {
                console.log("search settings");
            },
            select: (action, data, callbackSetList) => {
                console.log("select settings");
            },
            placeholder: "设置"
        }
    }

    async initSettingView() {
        try {
            let layer = document.getElementById("setting-layer");
            if (layer) {
                layer.style.display = "flex";
            }

            if (this.isInited) return;

            async function initScript() {
                const jsLinks = [
                    path.join(__dirname, "jquery.min.js"),
                    path.join(__dirname, "clipboard.min.js"),
                    path.join(__dirname, "jszip.min.js"),
                    path.join(__dirname, "bootstrap.bundle.min.js"),
                    path.join(__dirname, "codemirror.min.js"),
                    path.join(__dirname, "javascript.min.js"),
                    path.join(__dirname, "javascript-hint.min.js"),
                    path.join(__dirname, "javascript-lint.min.js"),
                    path.join(__dirname, "json-lint.min.js"),
                ];

                for(let i in jsLinks) {
                    try {
                        let script = document.createElement('script');
                        script.src = jsLinks[i];
                        document.head.append(script);
                        await sleep(50);
                        console.log("to add js: " + script);
                    } catch(e) {
                        alert("in error:" + (e.stackTrace ? e.stackTrace : e))
                    }
                }
            }

            function sleep(milliseconds) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve("")
                    }, milliseconds);
                })
            }

            await initScript();

            const cssLinks = [
                path.join(__dirname, "..", "css", "bootstrap.css"),
                path.join(__dirname, "..", "css", "codemirror.min.css"),
                path.join(__dirname, "..", "css", "monokai.min.css"),
            ];

            for(let i in cssLinks) {
                let script = document.createElement('link');
                script.href = cssLinks[i];
                script.rel="stylesheet";
                script.type="text/css";
                document.head.append(script);
                // $("head").append(
                //     '<link href="' + cssLinks[i] + '" rel="stylesheet" type="text/css">'
                // );
            }
            let html = fs.readFileSync(path.resolve(__dirname, "../html/settings.html"), 'utf8');
            // console.log(html);
            let rootItem = document.getElementById("root");
            let settingHtml = document.createElement("div");
            settingHtml.innerHTML = html;
            rootItem.append(settingHtml);
            // $("#root").append(html);
            setTimeout(() => {
                this.initDataSourceView();
                this.updateDataSourceState();
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                });
            }, 100);

            this.isInited = true;
        } catch(e) {
            LogUtil.notifyError("init failed!", e);
        }
    }

    updateDataSourceState() {
        let val = $("input:radio[name=urlDataSource]:checked").val();
        if(val === 'json') {
            $("#source-json-tips").show();
            $("#source-js-tips").hide();
            $("#swagger-js-test-layer").hide();
        } else if(val === 'js') {
            $("#source-json-tips").hide();
            $("#source-js-tips").show();
            $("#swagger-js-test-layer").show();
        }
    }

    /**
     * 数据源界面的初始化
     */
    initDataSourceView() {
        //切换数据源类型
        $("#source-" + this.settings.urlSource.type).attr("checked", true);
        $("input:radio[name=urlDataSource]").change(() => {
            this.updateDataSourceState();
            // this.settings.urlSource[this.settings.urlSource.type] = this.codeMirror.getDoc().getValue();
            this.settings.urlSource.type = $("input:radio[name=urlDataSource]:checked").val();
            this.updateCoder();
        });

        //测试js
        $("#swagger-js-test").click(() => {
            try {
                console.log(module);
                let sourceJs = "const request = require('request'); module.exports = function(onUrlPrepared) { "
                    + this.settings.urlSource[this.settings.urlSource.type]
                    + " }";
                let sourceCallback = require("./module-helper")("swagger-url-data-source-module", sourceJs);
                sourceCallback((data) => {
                    alert(JSON.stringify(data, null, 4));
                });
            } catch (e) {
                LogUtil.notifyError("", e);
            }
        });

        //js代码编辑器
        this.codeMirror = CodeMirror.fromTextArea(document.getElementById("source-data"), {
            lineNumbers: true,
            mode: 'text/javascript',
            theme: 'monokai'
        });

        this.codeMirror.on("change", _.debounce((instance, obj) => {
            let value = this.codeMirror.getDoc().getValue();
            // console.log(value);
            this.settings.urlSource[this.settings.urlSource.type] = value;
            DBUtil.putItem(DB_KEY, this.settings);
        }, 300));

        $(() => {
            this.codeMirror.refresh();
            this.updateCoder();
        });

        //导出配置
        $("#export-config").click(async () => {
            let fileName = "utools-swagger-api-config";
            let filePath = await utools.showSaveDialog({
                title: 'config保存位置',
                defaultPath: utools.getPath("downloads") + path.sep + fileName,
                filters: [{name: "Utools Config", extensions: ['usac']}],
                buttonLabel: '保存'
            });
            if(filePath) {
                let configStr = JSON.stringify(this.settings, null, 4);
                fs.writeFile(filePath, configStr, 'utf8', (err) => {
                    if(err) {
                        LogUtil.notifyError("导出配置错误!", err);
                        return ;
                    }
                    fileName = path.basename(filePath);
                    let openPath = filePath.substring(0, filePath.length - fileName.length);
                    console.log("openPath:", openPath);
                    utools.shellOpenPath(openPath);
                });
            }
        });

        //导入配置
        $("#import-config").click(() => {

        })
    }

    updateCoder() {
        this.codeMirror.getDoc().setValue(this.settings.urlSource[this.settings.urlSource.type]);
    }
}

exports = module.exports = SwaggerSetting;
module.exports.DB_KEY = DB_KEY;
module.exports.URL_SOURCE_TYPE = URL_SOURCE_TYPE;
