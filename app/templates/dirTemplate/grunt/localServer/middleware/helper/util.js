/**
 * Created by patrickliu on 11/20/14.
 */

exports.removeJsonComment = function(data) {

// 这里将json文件中的注释去掉，以免json.parse出错
    var REMOVING_COMMENT_EXP = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g;
    return data.replace(REMOVING_COMMENT_EXP, function (word) {
        return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
    });
}
