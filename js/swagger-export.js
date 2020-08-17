module.exports.swaggerFileImport = swaggerFileImport;
module.exports.swaggerCodeExport = swaggerCodeExport;

function swaggerFileImport() {
    const cssLinks = [
        'https://cdn.bootcss.com/highlight.js/9.15.8/styles/androidstudio.min.css',
        'https://cdn.bootcss.com/jqueryui/1.12.1/jquery-ui.min.css'
    ];

    for(let i in cssLinks) {
        $("head").append(
            '<link '
            + 'href="' + cssLinks[i] + '" '
            + 'rel="stylesheet" type="text/css">'
        );
    }

    $("head").append(
        '<style type="text/css">'
        + ".ui-widget-overlay { opacity: 1; background: #4c4c4c99; } \n"
        + "input.ck-item, input.ck-group { float:left; font-size:110%; margin-right:10px; } \n"
        + "input.ck-item { margin-top: 6px; } \n"
        + "input.ck-group { margin-top: 12px; } \n"
        + "input.exp-btn { margin-left:10px; } \n"
        + ".swagger-section .swagger-ui-wrap ul#resources li.resource div.heading { clear: none!important; } \n"
        + ".swagger-section .swagger-ui-wrap ul#resources li.resource ul.endpoints li.endpoint ul.operations li.operation { clear: none!important; } \n"
        + "#result-dialog label { font-weight: bold; } \n"
        + ".result-div { margin-top: 20px; } \n"
        + ".inner-input, .ipt-file-name { border-radius: 30px; border: 1px solid #cccccc; padding: 3px; } \n"
        + ".inner-input { margin-left: 10px; margin-right: 10px; width: 48px; text-align: center;} \n"
        + ".nstd-code { font-family: Consolas, Monaco, monospace; border: 1px solid #cccccc; border-radius: 8px; overflow: hidden; padding: 8px; } \n"
        + "input.copy-btn { margin-left: 10px; } \n"
        + "#download-all-files { margin-left: 20px; } \n"
        + ".code-ios-head, .code-ios-protocol { margin-top: 5px; } \n"
        + "input.ipt-file-name { min-width: 400px; padding-left: 10px; }\n"
        + "input.btn-open-file { margin-left: 20px; } \n"
        + ".alert {\n" +
        "\tdisplay: none;\n" +
        "\tposition: fixed;\n" +
        "\ttop: 50%;\n" +
        "\tleft: 50%;\n" +
        "\tmin-width: 300px;\n" +
        "\tmax-width: 600px;\n" +
        "\ttransform: translate(-50%,-50%);\n" +
        "\tz-index: 99999;\n" +
        "\ttext-align: center;\n" +
        "\tpadding: 15px;\n" +
        "\tborder-radius: 3px;\n" +
        "}\n" +
        "\n" +
        ".alert-success {\n" +
        "    color: #3c763d;\n" +
        "    background-color: #dff0d8;\n" +
        "    border-color: #d6e9c6;\n" +
        "}\n" +
        "\n" +
        ".alert-info {\n" +
        "    color: #31708f;\n" +
        "    background-color: #d9edf7;\n" +
        "    border-color: #bce8f1;\n" +
        "}\n" +
        "\n" +
        ".alert-warning {\n" +
        "    color: #8a6d3b;\n" +
        "    background-color: #fcf8e3;\n" +
        "    border-color: #faebcc;\n" +
        "}\n" +
        "\n" +
        ".alert-danger {\n" +
        "    color: #a94442;\n" +
        "    background-color: #f2dede;\n" +
        "    border-color: #ebccd1;\n" +
        "}\n" +
        "\n" +
        '</style>'
    );

    async function initScript() {
        const jsLinks = [
            'https://cdn.bootcss.com/jqueryui/1.12.1/jquery-ui.min.js',
            'https://cdn.bootcss.com/underscore.js/1.9.1/underscore-min.js',
            'https://cdn.bootcss.com/yamljs/0.3.0/yaml.min.js',
            'https://cdn.bootcss.com/clipboard.js/2.0.4/clipboard.min.js',
            'https://cdn.bootcss.com/jszip/3.2.2/jszip.min.js',
            'https://cdn.bootcss.com/FileSaver.js/2014-11-29/FileSaver.min.js',
            'https://cdn.bootcss.com/highlight.js/9.15.8/highlight.min.js',
            'https://cdn.bootcss.com/highlight.js/9.15.8/languages/objectivec.min.js',
            'https://cdn.bootcss.com/highlight.js/9.15.8/languages/java.min.js',
            'https://cdn.bootcss.com/highlight.js/9.15.8/languages/kotlin.min.js'
        ];

        if(!$) {
            console.log("no jquery, to add");
            jsLinks.unshift("'https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js'");
        }

        for(let i in jsLinks) {
            let script = document.createElement('script');
            script.src = jsLinks[i];
            document.head.append(script);
            await sleep(50);
            console.log("to add js: " + script);
        }
    }

    initScript();

    function sleep(milliseconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve("")
            }, milliseconds);
        })
    }
}

function swaggerCodeExport() {

    var exportDialog;
    var yamlObj = null;
    var pathLevel = 2;  //url截取位置
    var tmpData = null; //全局缓存的解析数据
    var lang = 'java';  //解析为lang对应的格式
    var filePrefix = 'HZT'; //ios文件名前缀
    var extraComment = 'yuan'; //ios额外注释
    var removeUrlSlash = false;

    $(document).ready(function() {
        $("body").append(
            '<div class="alert"></div>'
        );
        setTimeout(toInit, 1000);
    });

    function toInit() {
        $("ul#resources li.resource").each(function() {
            var dataId = $(this).find(".heading h2 a").data("id");
            console.log("dataId=", dataId);
            //生成Group的全选框
            $(this).prepend(getCheckBox(false, 12, dataId));
            var $list = $(this)
            // 绑定全选change事件
            var checkGroupStr = "input[type='checkbox'][class='ck-group']";
            var checkItemStr  = "input[type='checkbox'][class='ck-item']";
            $(this).find(checkGroupStr).on('change', function() {
                var isCheckAll = $(this).is(":checked");
                $list.find("ul.operations " + checkItemStr).prop("checked", isCheckAll);
            });

            //生成每条协议的复选框
            $(this).find("ul.operations").each(function(index, ele) {
                $(this).prepend(getCheckBox(true, 6, "" + index + "-" + dataId));

                // 绑定单个选项change事件
                $(this).find(checkItemStr).on('change', function() {
                    var isCheckAll = true;
                    $list.find("ul.operations " + checkItemStr).each(function() {
                        if(!$(this).is(":checked")) {
                            isCheckAll = false;
                        }
                    });
                    $list.find(checkGroupStr).prop("checked", isCheckAll);
                });
            });

            //添加导出按钮
            $(this).find(".heading h2").append(getExportBtn(dataId));
            $(this).find(".heading h2 input[class='exp-btn']").on("click", function() {
                var result = [];
                $list.find("ul.operations").each(function() {
                    var isChecked = $(this).find(checkItemStr).is(":checked");
                    if(isChecked) {
                        var item = {};
                        //http method
                        item.method = $(this).find(".heading h3 .http_method a").text();
                        //url 路径
                        item.path = $(this).find(".heading h3 .path a").text();
                        //url 描述
                        item.desc = $(this).find(".heading ul.options a").text();
                        //返回值数据模型字符串
                        item.mode = $(this).find(".content .model-signature .signature-container .snippet code").text()
                        if(item.mode != "") {
                            item.modeJson = getSafeJson(item.mode);
                        }
                        var params = [];
                        //参数信息
                        $(this).find(".content form table tbody.operation-params tr").each(function() {
                            var $tds = $(this).children();
                            var p = {};
                            //参数名
                            p.name = $($tds[0]).text();
                            //参数是否必须
                            p.required = $($tds[0]).hasClass("required");
                            //参数描述
                            p.desc = $($tds[2]).find("p").text();
                            var paramMode = $($tds[4]).find(".snippet code").text();
                            //参数类型
                            if(paramMode == "") {
                                p.type_str = $($tds[4]).find("span").text();
                            } else {
                                p.type_str = "cus_obj";
                                p.cus_obj = getSafeJson(paramMode);
                            }
                            params.push(p);
                        });
                        item.params = params;
                        result.push(item);
                    }
                });
                exportData(result);
            });
        });

        var preLang = getDB().getItem("target_lang");
        if(preLang) {
            lang = preLang;
        }
        var preRemoveUrlSlash = getDB().getItem("remove_url_slash");
        if(preRemoveUrlSlash !== undefined) {
            removeUrlSlash = preRemoveUrlSlash;
        }

        initDialog();
        /*
            getYaml(false, function(data) {
                yamlObj = data;
                console.log(yamlObj);
            });
        */
    }

    /**
     * 获取数据结构的定义文件
     */
    function getYaml(isShowError, callback) {
        if(yamlObj != null) {
            callback(yamlObj);
            return ;
        }

        var url = new URL(document.location.href);
        var path = document.location.pathname;
        var yamlPath = url.searchParams.get("url");
        var newPath = document.location.origin + path.substring(0, path.lastIndexOf("/")) + "/" + yamlPath;

        if(!yamlPath) {
            showError(isShowError, "url中没有找到yaml文件名");
            return ;
        }
        console.log("yamlPath:", yamlPath);

        $.ajax({
            url: yamlPath,
            type: "GET",
            dataType: "text",
            success: function(data) {
                try {
                    var result = YAML.parse(data);
                    callback(result);
                } catch (e) {
                    showError(e);
                }
            },
            error: function(xhr,status,error) {
                showError(isShowError, xhr);
            }
        });
    }

    function showError(isShow, msg) {
        if(isShow) {
            // alert(msg);
            fail_prompt(msg, 2000);
        }
        console.error(msg);
    }

    /**
     * 初始化格式化后的URL
     */
    function initFormarttedUrls(data, pathSegIndex) {
        var urls = "";
        var maxLen = 0;
        var maxLenDart = 0;
        var idx, item;
        for(idx in data) {
            item = data[idx];
            formartUrlBySegIndex(item, pathSegIndex);
            item.constUrlName = "URL_" + item.method.toUpperCase() + "_" + item.upperUrl;
            var targetPath = removeUrlSlash && item.path.startsWith("/") ? item.path.substring(1) : item.path;
            item.formarttedUrl = "public static final String " + item.constUrlName + " = \"" + targetPath + "\";    ";
            item.dartFormarttedUrl = "static const " + item.constUrlName + " = \"" + targetPath + "\";    ";
            if(item.formarttedUrl.length > maxLen) {
                maxLen = item.formarttedUrl.length;
            }
            if(item.dartFormarttedUrl.length > maxLenDart) {
                maxLenDart = item.dartFormarttedUrl.length;
            }
        }
        for(idx in data) {
            item = data[idx]
            item.formarttedUrl = item.formarttedUrl.padEnd(maxLen) + "// " + item.desc;
            item.dartFormarttedUrl = item.dartFormarttedUrl.padEnd(maxLenDart) + "// " + item.desc;
        }
    }

    /**
     * 获取分段URL，并格式化为大写下划线的形式
     */
    function formartUrlBySegIndex(item, segIndex) {
        var str = item.path;
        var count = 0;
        var begin = 0;
        var find = false;
        var lastIndex = 0;
        for(var i = 0; i < str.length; i++) {
            if(str.charAt(i) == '/') {
                count ++;
                lastIndex = i;
                if(count >= segIndex) {
                    begin = i;
                    find = true;
                    break;
                }
            }
        }
        if(!find) begin = lastIndex;
        var slashStr = str.substring(begin + 1).replaceAll("/", "_");
        console.log("seg: ", segIndex, ", begin: ", begin, ", url: ", str, ", result: ", slashStr);
        item.upperUrl = slashStr.toUpperCase();
        item.camelName = camelize(str.substring(begin + 1).replaceAll("/", " "))
        if(!item.hasOwnProperty("iosName") || !item.hasOwnProperty("iosNameChanged") || !item.iosNameChanged) {
            item.iosName = filePrefix + item.camelName.substring(0,1).toUpperCase() + item.camelName.substring(1) + "Request";
        }
    }

    /**
     * 初始化protocol
     */
    function initProtocols(data) {
        var text = "";
        for(var idx in data) {
            var item = data[idx];
            item.protocol = {};
            item.protocol.comment = getProtocolComment(item);
            item.protocol.javaProtocol = getJavaProtocol(item);
            item.protocol.kotlinProtocol = getKotlinProtocol(item);
            item.protocol.dartProtocol = getDartProtocol(item);
            item.protocol.iosHeadFile = getIosHeadFile(item);
            item.protocol.iosProtocolFile = getIosProtocolFile(item);
            //text += item.protocol.comment + "\n" + item.protocol.kotlinProtocol + "\n\n";
        }
        //console.log(text);
    }

    /**
     * 获取ios .h 文件
     */
    function getIosHeadFile(item) {
        var content = getIosFileComment(item, true)
            + "#import \"HZTBaseRequest.h\"\n\n"
            + "@interface " + item.iosName + " : HZTBaseRequest\n\n";

        if(hasParams(item)) {
            var propertyPrefix = "@property (nonatomic, "
            var maxLen = Math.max.apply(null, item.params.map(it => {
                if(!it.hasOwnProperty("type_info")) {
                    it.type_info = getIosType(it.type_str);
                }
                return propertyPrefix.length + it.type_info.a.length + 2 + it.type_info.t.length + 1 + it.name.length + 1;
            }));
            item.params.forEach(function(it) {
                var p = propertyPrefix + it.type_info.a + ") " + it.type_info.t + " " + it.name + ";";
                content += p.padEnd(maxLen + 4) + "// " + it.desc + "\n";
            });
            content += "\n";
        }
        content += "@end\n"
        return content;
    }

    /**
     * 获取ios .m 文件
     */
    function getIosProtocolFile(item) {
        var padding = "    ";
        var content = getIosFileComment(item, false)
            + "#import \"" + item.iosName + ".h\"\n"
            + (hasArrayParams(item) ? "#import \"NSObject+YYModel.h\"\n\n" : "\n")
            + "@implementation " + item.iosName + "\n\n"
            + "- (NSString *)urlBackEnd {\n"
            + padding + "return @\"" + item.path.substring(1) + "\";\n"
            + "}\n\n"
            + "- (NSString *)method {\n"
            + padding + "return " + item.method.toUpperCase() + ";\n"
            + "}\n\n";

        if(hasParams(item)) {
            content += "- (NSDictionary *)parameters {\n"
                + padding + "NSMutableDictionary *dic = [NSMutableDictionary dictionary];\n"

            var obj = padding + "if (self.{0}) {\n"
                + getCopy(padding, 2) + "[dic setObject:self.{0} forKey:@\"{0}\"];\n"
                + padding + "}\n";

            var ary = padding + "if (self.{0}) {\n"
                + getCopy(padding, 2) + "[dic setObject:[self.{0} modelToJSONString] forKey:@\"{0}\"];\n"
                + padding + "}\n";

            var normal = padding + "[dic setObject:[NSNumber numberWith{0}:self.{1}] forKey:@\"{1}\"];\n"

            item.params.forEach(function(it) {
                if(it.type_info.a == "strong") {
                    var isArray = it.type_str.startsWith("Array[");
                    content += (isArray ? ary : obj).format(it.name);
                } else {
                    content += normal.format(it.type_info.p, it.name);
                }
            });

            content += padding + "return dic;\n"
                + "}\n\n";
        }

        content += "@end\n";
        return content;
    }

    function hasArrayParams(item) {
        var hasArray = false;
        if(hasParams(item)) {
            item.params.forEach(function(it) {
                if(it.type_str.startsWith("Array[")) {
                    hasArray = true;
                }
            });
        }
        return hasArray;
    }

    function hasParams(item) {
        return item.hasOwnProperty("params") && item.params.length > 0;
    }

    /**
     * 获取ios的文件注释
     */
    function getIosFileComment(item, isHeader) {
        var p = "// ";
        var e = "\n";
        return p + e
            + p + item.iosName + "." + (isHeader ? "h" : "m") + e
            + p + extraComment + e
            + p + e
            + (item.desc ? (p + item.desc + e + p + e) : "")
            + p + "Created by Protocol Convert Script on " + new Date().format("yyyy/MM/dd") + "." + e
            + p + e + e;
    }

    /**
     * 获取代码注释
     */
    function getProtocolComment(item) {
        var padding = "    ";
        var comment = padding + getCommentStart()
            + padding + getCommentBody() + item.desc + "\n";
        if(hasParams(item)) {
            var maxLen = Math.max.apply(null, item.params.map(it => { return it.name.length; }));
            item.params.forEach(function(it) {
                comment += padding + getCommentBody() + "@param " + it.name.padEnd(maxLen + 4) + it.desc + "\n"
            });
        }
        comment += padding + getCommentBody() + "@return " + getReturnProtocol() + "\n";
        comment += padding + getCommentEnd();
        return comment;
    }

    function getReturnProtocol() {
        if(lang == "dart") return "[RequestBuilder]";
        return "JSONProtocol";
    }

    function getCommentStart() {
        if(lang == "dart") return "///\n";
        return "/**\n"
    }

    function getCommentBody() {
        if(lang == "dart") return "/// ";
        return " * ";
    }

    function getCommentEnd() {
        if(lang == "dart") return "///";
        return " */";
    }

    /**
     * 获取java格式的protocol
     */
    function getJavaProtocol(item) {
        var padding = "    ";
        var content = padding + "public static JSONProtocol " + item.camelName + "(";
        var paddingLen = content.length;
        var paddingBlank = getCopy(" ", paddingLen);
        var typeInfo = getProtocolTypeInfo(item);
        var hasParams = _.has(item, "params") && item.params.length > 0;
        var paramsLen = hasParams ? item.params.length : 0;
        if(hasParams) {
            var needBreak = paramsLen > 3;
            item.params.forEach(function(it, idx) {
                if(idx % 3 == 0 && idx != 0) {
                    content += "\n" + paddingBlank;
                }
                content += "final " + getJavaType(it.type_str) + " " + it.name;
                if(idx != item.params.length - 1) {
                    content += ", ";
                }
            });
        }
        content += ") {\n"
            + getCopy(padding, 2) + "return new " + typeInfo.name + "(Method." + item.method.toUpperCase() + ", "
            + "UrlConstants." + item.constUrlName;

        if(typeInfo.hasResult) {
            content += ", Objects.class";
        }
        content += ")";

        if(hasParams) {
            content += " {\n"
                + getCopy(padding, 3) + "@Override\n"
                + getCopy(padding, 3) + "protected void getParams(Map<String, Object> params) {\n"
                + getProtocolParamPutString(item, padding, false)
                + getCopy(padding, 3) + "}\n"
                + getCopy(padding, 2) + "};\n";
        } else {
            content += ";\n";
        }
        content += padding + "}";
        return content;
    }

    /**
     * 获取kotlin格式的protocol
     */
    function getKotlinProtocol(item) {
        var padding = "    ";
        var content = padding + "fun " + item.camelName + "(";
        var paddingLen = content.length;
        var paddingBlank = getCopy(" ", paddingLen);
        var typeInfo = getProtocolTypeInfo(item);
        var hasParams = _.has(item, "params") && item.params.length > 0;
        var paramsLen = hasParams ? item.params.length : 0;
        if(hasParams) {
            var needBreak = paramsLen > 6;
            item.params.forEach(function(it, idx) {
                if(idx % 6 == 0 && idx != 0) {
                    content += "\n" + paddingBlank;
                }
                content += it.name + ": " + getKotlinType(it.type_str);
                if(idx != item.params.length - 1) {
                    content += ", ";
                }
            });
        }
        content += "): JSONProtocol {\n"
            + getCopy(padding, 2) + "return " + (hasParams ? "object: " : "") + typeInfo.name + "(Method." + item.method.toUpperCase() + ", "
            + "UrlConstants." + item.constUrlName;

        if(typeInfo.hasResult) {
            content += ", Objects::class.java";
        }
        content += ")";

        if(hasParams) {
            content += " {\n"
                + getCopy(padding, 3) + "override fun getParams(params: MutableMap<String, Any>?) {\n"
                + getProtocolParamPutString(item, padding, true)
                + getCopy(padding, 3) + "}\n"
                + getCopy(padding, 2) + "}\n";
        } else {
            content += "\n";
        }
        content += padding + "}";
        return content;
    }

    /**
     * 获取dart格式的protocol
     */
    function getDartProtocol(item) {
        var hasParams = _.has(item, "params") && item.params.length > 0;
        var paramsLen = hasParams ? item.params.length : 0;
        var padding = "    ";
        var content = padding + "static RequestBuilder " + item.camelName + "(";
        if(hasParams) {
            content += ",\n" + getDartParams(item, 17, true) + ") {\n";
        } else {
            content += ") {\n";
        }
        content += getCopy(padding, 2);
        content += "return RequestBuilder(UrlConstants." + item.constUrlName + ", context, method: HttpMethod." + item.method.toLocaleLowerCase();
        if(hasParams) {
            content += ", params: " + getDartParamByMap(item) + "\n";
        } else {
            content += ");\n";
        }
        content += padding + "}\n";
        return content;
    }

    /**
     * 获取 dart 协议的参数
     * @param item
     */
    function getDartParams(item, paddingLen, addPaddingToFirstLine) {
        var paddingBlank = getCopy(" ", paddingLen);
        var content = (addPaddingToFirstLine ? paddingBlank : "") + "{\n";
        item.params.forEach(function(it, idx) {
            content += paddingBlank + "    " + getDartType(it.type_str) + " " + it.name + ",\n";
        });
        content += paddingBlank + "}";
        return content;
    }

    /**
     * 获取 dart 协议的参数map
     * @param item
     * @returns {string}
     */
    function getDartParamByMap(item) {
        var content = "{\n";
        var paddingBlank = getCopy(" ", 12);
        item.params.forEach(function(it, idx) {
            content += paddingBlank + "\"" + it.name + "\": " + it.name + ",\n";
        });
        content += getCopy(" ", 8) + "});";
        return content;
    }

    /**
     * 获取协议中 getParams(Map<String, Object> params) 方法块中的代码
     */
    function getProtocolParamPutString(item, padding, isKotlin) {
        var semicolon = isKotlin ? "" : ";";
        var content = "";
        var len = item.params.length;
        item.params.forEach(function(it, idx) {
            var putType = "";
            if(it.required) {
                putType = "put";
            } else if(it.type_str == "string") {
                putType = "putIfNotEmpty";
            } else {
                putType = "putIfNotNull";
            }
            content += getCopy(padding, 4) + putType + "(params, \"" + it.name + "\", " + it.name + ")" + semicolon + "\n";
        });
        return content;
    }

    /**
     * 获取protocol的类型信息
     */
    function getProtocolTypeInfo(item) {
        var result = {
            name: "SimpleJSON",
            hasResult: false,
            isArray: false,
            hasParams: false
        };

        if(item.mode != "") {
            result.hasResult = true;
            if(item.modeJson && _.isArray(item.modeJson)) {
                result.isArray = true;
                result.name += "Array";
            }
        }

        if(hasParams(item)) {
            result.hasParams = true;
        } else {
            result.name += "NoParam";
        }

        result.name += "Protocol";
        return result;
    }

    var JAVA_TYPE_MAP = {
        "long": "Long", "integer": "Integer", "string": "String", "float": "Float", "double": "Double", "cus_obj": "Objects", "boolean": "Boolean"
    };
    var KOTLIN_TYPE_MAP = {
        "long": "Long", "integer": "Int", "string": "String", "float": "Float", "double": "Double", "cus_obj": "Anys", "boolean": "Boolean"
    };
    var DART_TYPE_MAP = {
        "long": "int", "integer": "int", "string": "String", "float": "double", "double": "double", "cus_obj": "Anys", "boolean": "bool"
    }
    var IOS_TYPE_MAP = {
        //t: real type
        //a: assing type
        //p: protocol type
        "long": {t: "long long", a: "assign", p: "LongLong"},
        "integer": {t: "int", a: "assign", p: "Int"},
        "float": {t: "float", a: "assign", p: "Float"},
        "double": {t: "double", a: "assign", p: "Double"},
        "boolean": {t: "BOOL", a: "assign", p: "Bool"},
        "string": {t: "NSString *", a: "strong"},
        "cus_obj": {t: "id", a: "strong"},
    };

    /**
     * 获取java格式的类型名
     */
    function getJavaType(type) {
        return getAndroidType(JAVA_TYPE_MAP, type);
    }

    /**
     * 获取kotlin格式的类型名
     */
    function getKotlinType(type) {
        return getAndroidType(KOTLIN_TYPE_MAP, type);
    }

    /**
     * 获取kotlin格式的类型名
     */
    function getDartType(type) {
        return getAndroidType(DART_TYPE_MAP, type);
    }

    /**
     * 获取ios格式的类型名
     */
    function getIosType(type) {
        if(IOS_TYPE_MAP.hasOwnProperty(type)) {
            return IOS_TYPE_MAP[type];
        } else if(type.startsWith("Array[")) {
            return {t: "NSArray*", a: "strong"};
        } else {
            return {t: type, a: "strong"};
        }
    }

    /**
     * 获取Android中的类型名
     */
    function getAndroidType(map, type) {
        if(map.hasOwnProperty(type)) {
            return map[type];
        } else if(type.startsWith("Array[")) {
            return "List";
        } else {
            return type;
        }
    }

    /**
     * 获取复选框的Html
     */
    function getCheckBox(isItem, marginTop, dataId) {
        var tag = (isItem ? "item" : "group");
        return "<input type='checkbox' class='ck-" + tag + "'"
            + " data-id='" + tag + "-data-" + dataId + "' />"
    }

    /**
     * 获取导出按钮的Html
     */
    function getExportBtn(dataId) {
        return "<input type='button' class='exp-btn' value='导出'"
            + " data-id='" + dataId + "' />";
    }

    /**
     * 获取初始化的Dialog html
     */
    function getInitialDialogHtml() {
        var pathLevelOnInput = "oninput=\"value=value.replace(/[^\\d]/g,'').replace(/^0+/, '')\"";
        return '\
<div id="result-dialog">\
    <div>\
        <label>url从第</label><input type="text" class="inner-input" id="ipt-path-level" ' + pathLevelOnInput + ' /><label>段开始截取</label> \
        <input type="button" id="btn-path-level" value="确定"/>\
    </div>\
    <div class="result-div custom-control custom-checkbox">\
        <input type="checkbox" class="custom-control-input" id="ck-remove-url-slash" ' + (removeUrlSlash ? "checked" : "") + ' >\
        <label class="custom-control-label" for="ck-remove-url-slash">移除Url最前面的 / </label>\
    </div>\
    <div class="result-div">\
        <label>语言：</label>\
        <input type="radio" id="lang-java" name="lang" value="java" ' + (lang == "java" ? "checked" : "") + ' >\
        <label for="lang-java">Java</label>\
        <input type="radio" id="lang-kotlin" name="lang" value="kotlin" ' + (lang == "kotlin" ? "checked" : "") + ' >\
        <label for="lang-kotlin">Kotlin</label>\
        <input type="radio" id="lang-ios" name="lang" value="ios" ' + (lang == "ios" ? "checked" : "") + ' >\
        <label for="lang-ios">ios</label>\
        <input type="radio" id="lang-dart" name="lang" value="dart" ' + (lang == "dart" ? "checked" : "") + ' >\
        <label for="lang-dart">dart</label>\
    </div>\
    <div class="result-div android-div">\
        <label>UrlConstants：</label>\
        <input type="button" class="copy-btn" id="btn-copy-url-2" value="复制 UrlConstants" data-clipboard-target="#code-url-constants" />\
        <input type="button" class="copy-btn open-btn" id="btn-open-url" value="折叠" data-target="#code-url-constants" />\
        <pre><div id="code-url-constants" class="nstd-code"></div></pre>\
    </div>\
    <div class="result-div android-div">\
        <label>Protocol：</label>\
        <input type="button" class="copy-btn" id="btn-copy-protocol-2" value="复制 Protocol" data-clipboard-target="#code-protocol" />\
        <input type="button" class="copy-btn open-btn" id="btn-open-protocol" value="折叠" data-target="#code-protocol" />\
        <pre><div id="code-protocol" class="nstd-code"></div></pre>\
    </div>\
    <div class="result-div ios-div">\
        <br/>\
        <label>文件名前缀:</label><input type="text" class="inner-input" id="ipt-file-prefix" value=\"' + filePrefix + '\" /> \
        <label>&nbsp;&nbsp;额外注释:</label><input type="text" class="inner-input" id="ipt-extra-comment" value=\"' + extraComment + '\" /> \
        <input type="button" id="btn-ios-config" value="更新"/><input type="button" id="download-all-files" value="下载所有文件"/><br/>\
        <div id="ios-files">\
        </div>\
    </div>\
</div>';
    }

    /**
     * 导出数据
     */
    function exportData(data) {
        //--- Activate the dialog.
        tmpData = data;

        var $ipt = $("#ipt-path-level");
        $ipt.val(pathLevel);
        setTimeout(function() {
            $ipt.blur();
        }, 200);

        calResult();
        exportDialog.dialog ("open");
    }



    function initDialog() {
        //--- Add our custom dialog using jQuery.
        $("body").append (getInitialDialogHtml());
        exportDialog = $("#result-dialog").dialog ( {
            modal:      true,
            title:      "导出协议",
            autoOpen:   false,
            position:   {
                my: "top",
                at: "top",
                of: document,
                collision: "none"
            },
            width:      'auto',
            height:     'auto',
            minWidth:   500,
            minHeight:  400,
            zIndex:     3666
        } )
        checkLangShowType();

        //变更 url的截取段位置
        $("#btn-path-level").on("click", function() {
            pathLevel = $("#ipt-path-level").val();
            calResult();
        })

        //切换语言
        $("input[type='radio'][name='lang']").on('change', function() {
            lang = $(this).val();
            getDB().setItem("target_lang", lang);
            checkLangShowType();
            calResult();
        });

        //ios下载所有文件
        $("#download-all-files").on("click", function() {
            downloadAllFiles();
        });

        //修改ios的配置
        $("#btn-ios-config").on("click", function() {
            filePrefix = $("#ipt-file-prefix").val();
            extraComment = $("#ipt-extra-comment").val();
            calResult();
        });

        $("#ck-remove-url-slash").on("change", function() {
            console.log("is checked: " + $(this).is(":checked"));
            removeUrlSlash = $(this).is(":checked");
            getDB().setItem("remove_url_slash", removeUrlSlash);
            calResult();
        });


        //复制按钮
        var copyBtns = ["btn-copy-url-2", "btn-copy-protocol-2"];
        for(var idx in copyBtns) {
            var clipboard = new ClipboardJS("#" + copyBtns[idx]);
            initCopyInfo(clipboard);
        }

        //折叠、展开
        $(".open-btn").on('click', function() {
            var $this = $(this);
            var target = $this.data('target');
            var value = $this.val();
            if(value == "折叠") {
                $(target).css("height", "10px");
                $this.val("展开");
            } else {
                $(target).css("height", "auto");
                $this.val("折叠");
            }
        });
    }

    /**
     * ios 下载所有文件
     */
    function downloadAllFiles() {
        var zip = new JSZip();
        for(var idx in tmpData) {
            var item = tmpData[idx];
            zip.file(item.iosName + ".h", item.protocol.iosHeadFile);
            zip.file(item.iosName + ".m", item.protocol.iosProtocolFile);
        }
        zip.generateAsync({type: "blob"})
            .then(function(content) {
                saveAs(content, "export-" + new Date().format("yyyy-MM-dd_hh-mm") + ".zip");
            });
    }

    function checkLangShowType() {
        if(lang == "ios") {
            $(".android-div").hide();
            $(".ios-div").show();
        } else {
            $(".android-div").show();
            $(".ios-div").hide();
        }
    }

    function initCopyInfo(clipboard) {
        clipboard.on('success', function(e) {
            console.info('Action:', e.action);
            console.info('Text:', e.text);
            console.info('Trigger:', e.trigger);
            e.clearSelection();
            // alert("复制成功");
            success_prompt("复制成功");
        });

        clipboard.on('error', function(e) {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
            // alert("复制失败");
            fail_prompt("复制失败");
        });
    }

    /**
     * 显示结果
     */
    function calResult() {
        initFormarttedUrls(tmpData, pathLevel);
        initProtocols(tmpData);

        console.log(tmpData);
        var idx, item;
        var urlResult = "";
        var protocolResult = "", p = "";
        var $ios = $("#ios-files");
        if(lang == "ios") {
            $ios.html("");
        }
        for(idx in tmpData) {
            item = tmpData[idx]
            urlResult += (lang == "dart" ? item.dartFormarttedUrl : item.formarttedUrl) + "\n";
            if(lang == "ios") {
                //protocolResult += item.protocol.iosHeadFile + "\n" + item.protocol.iosProtocolFile + "\n";
                appendIosFile(item, idx);
            } else {
                switch (lang) {
                    case "java": p = item.protocol.javaProtocol; break;
                    case "kotlin": p = item.protocol.kotlinProtocol; break;
                    case "dart": p = item.protocol.dartProtocol; break;
                }
                // p = lang == "java" ? item.protocol.javaProtocol : item.protocol.kotlinProtocol;
                protocolResult += item.protocol.comment + "\n" + p + "\n\n";
            }
        }
        if(lang == "ios") {
            //$("#ios-files").html("<pre><code>" + protocolResult + "</code></pre>");
            //console.log(protocolResult);
            //setTimeout(function() {
            var keyTimes = [];
            $("input.ipt-file-name").off("keyup").on("keyup", function(e) {
                var index = $(this).data("item-id");
                console.log("on text change: ", index);
                if(keyTimes[index] != undefined) {
                    clearTimeout(keyTimes[index]);
                }
                keyTimes[index] = setTimeout(function () {
                    var tItem = tmpData[index];
                    tItem.iosName = $("input.ipt-file-name[data-item-id=\"" + index + "\"]").val();
                    tItem.iosNameChanged = true;
                    tItem.protocol.iosHeadFile = getIosHeadFile(tItem);
                    tItem.protocol.iosProtocolFile = getIosProtocolFile(tItem);
                    console.log(tItem.protocol.iosHeadFile);
                    console.log(tItem.protocol.iosProtocolFile);
                    $(".code-ios-head[data-item-id=\"" + index + "\"]").text(tItem.protocol.iosHeadFile);
                    $(".code-ios-protocol[data-item-id=\"" + index + "\"]").text(tItem.protocol.iosProtocolFile);
                }, 1000);
            });
            $("input.btn-open-file").on("click", function() {
                var index = $(this).data("item-id");
                changeIosFileOpenState($(this), $(this).val(), index);
            });
            $("input.btn-open-file").each(function(index, ele) {
                changeIosFileOpenState($(ele), "收起", index);
            });
            $(".code-ios-head.nstd-code, .code-ios-protocol.nstd-code").each(function() {
                hljs.highlightBlock(this);
            });
            //}, 300);
        } else {
            $("#code-url-constants").text(urlResult);
            $("#code-protocol").text(protocolResult);

            $("#code-url-constants, #code-protocol").removeClass("java kotlin");
            $("#code-url-constants").addClass("java");
            $("#code-protocol").addClass(lang);

            $("#code-url-constants, #code-protocol").each(function() {
                hljs.highlightBlock(this);
            });
        }
    }

    function changeIosFileOpenState($item, state, index) {
        if(state == "展开") {
            $(".code-ios-head[data-item-id=\"" + index + "\"]").css("height", "auto");
            $(".code-ios-protocol[data-item-id=\"" + index + "\"]").css("height", "auto");
            $item.val("收起");
        } else {
            $(".code-ios-head[data-item-id=\"" + index + "\"]").css("height", "20px");
            $(".code-ios-protocol[data-item-id=\"" + index + "\"]").css("height", "20px");
            $item.val("展开");
        }
    }



    /**
     * 根据模板，添加ios文件
     */
    function appendIosFile(item, index) {
        var content = "<br/><input type=\"text\" class=\"ipt-file-name\" data-item-id=\"" + index + "\" value=\"" + item.iosName + "\" />"
            + "<input type=\"button\" class=\"btn-open-file\" data-item-id=\"" + index + "\" value=\"展开\" />"
            + "<pre><div class=\"nstd-code code-ios-head objectivec\" data-item-id=\"" + index + "\">" + item.protocol.iosHeadFile + "</div></pre>"
            + "<pre><div class=\"nstd-code code-ios-protocol objectivec\" data-item-id=\"" + index + "\">" + item.protocol.iosProtocolFile + "</div></pre>";
        $("#ios-files").append(content);
        return content;
    }

    function getDB() {
        // localStorage
        if (window.localStorage) {
            return window.localStorage;
        }

        // sessionStorage
        if (window.sessionStorage) {
            return window.sessionStorage;
        }
    }

    function getSafeJson(str) {
        try {
            return JSON.parse(str);
        } catch(e) {
            console.warn(e);
            console.warn("error str: ", str);
        }
    }

    function getCopy(str, len) {
        return Array(len + 1).join(str);
    }

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    /**
     * 驼峰命名格式
     */
    function camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
            if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
            return index == 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }

    /**
     * 字符串格式化
     */
    String.prototype.format = function() {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{'+i+'\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };

    /**
     * 日期格式化
     */
    Date.prototype.format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
        return fmt;
    }

    /**
     * 弹出式提示框，默认1.2秒自动消失
     * @param message 提示信息
     * @param style 提示样式，有alert-success、alert-danger、alert-warning、alert-info
     * @param time 消失时间
     */
    var prompt = function (message, style, time)
    {
        style = (style === undefined) ? 'alert-success' : style;
        time = (time === undefined) ? 1200 : time;
        $('<div>')
            .appendTo('body')
            .addClass('alert ' + style)
            .html(message)
            .show()
            .delay(time)
            .fadeOut();
    };

    // 成功提示
    var success_prompt = function(message, time)
    {
        prompt(message, 'alert-success', time);
    };

    // 失败提示
    var fail_prompt = function(message, time)
    {
        prompt(message, 'alert-danger', time);
    };

    // 提醒
    var warning_prompt = function(message, time)
    {
        prompt(message, 'alert-warning', time);
    };

    // 信息提示
    var info_prompt = function(message, time)
    {
        prompt(message, 'alert-info', time);
    };
}