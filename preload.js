
try {
    const SwaggerSetting = require("./js/swagger-setting");
    const SwaggerSearch = require("./js/swagger-search");

    // loadData();

    let settingHelper = new SwaggerSetting();
    let searchHelper = new SwaggerSearch();

    window.exports = {
        "api": {
            mode: "list",
            args: searchHelper.getSearchExport()
        },
        "apiSettings": {
            mode: "none",
            args: settingHelper.getSettingExport()
        }
    };
} catch (e) {
    alert(e.stackTrace ? e.stackTrace : e)
}