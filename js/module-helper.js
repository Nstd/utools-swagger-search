/**
 * 动态编译一段js代码
 * @type {function(*=, *=): *}
 */
exports = module.exports = function(name, sourceJs) {
    const Module = require("module");
    const sourceModule = new Module(name, module);
    sourceModule.paths = module.paths;
    sourceModule._compile(sourceJs, name);
    return sourceModule.exports;

};