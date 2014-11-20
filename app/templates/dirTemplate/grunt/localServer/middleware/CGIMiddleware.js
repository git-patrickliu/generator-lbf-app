/**
 * Created by amos on 14-4-12.
 */
var path = require('path'),
    url = require('url'),
    fs = require('fs'),
    async = require('async'),
    util = require('./helper/util'),
    cgiHelper = require('./helper/CGIHelper');

module.exports = function(conf){
    console.log('[connect] use cgi middleware');

    return function(req, res, next){
        var objectUrl = url.parse(req.url),
            pathname = objectUrl.pathname,
        // default, we get the json file as the cgi return value
            filePathJson = path.normalize(conf.root + '/' + pathname + '.json'),
        // but if the filePathJson doesn't exist, we use the filePathJs as the secondary input
            filePathJs = path.normalize(conf.root + '/' + pathname + '.js');


        var method = req.method.toLowerCase();
        console.log('[CGIMiddleware] the cgi method is ' + method);

        // judge whether the json file exists
        if(true == fs.existsSync(filePathJson)) {
            // json format
            // @example for filePathJson file
            // {"statusCode": 200, "body": { "YOURDATA": "YOURDATA"}}
            // filePathJson file exists. This is a quick return. use the json in example
            console.log('[CGIMiddleware]' + filePathJson + ' exists');
            fs.readFile(filePathJson, {encoding: 'utf-8'}, function(err, file) {
                if(err) {
                    next(err);
                    return;
                }

                try {
                    // remove the comment in json in case of parsing error
                    file = util.removeJsonComment(file);

                    var data = JSON.parse(file),
                        body = JSON.stringify(data.body || {});

                    res.writeHead(data.statusCode, {
                        'Content-Length': Buffer.byteLength(body),
                        'Content-Type': 'application/json'
                    });
                    res.end(body);
                } catch (err) {
                    next(err);
                    return;
                }
            })

        } else {
            // if the filePathJson file doesn't exists. We use the js as a replacement
            // the js is a self-defined file.
            console.log('[CGIMiddleware]' + filePathJson + ' doesnot exists');

            async.parallel([
                function(callback) {
                    new cgiHelper(req, callback);
                },
                function(callback) {
                    if(true == fs.existsSync(filePathJs)) {
                        fs.readFile(filePathJs, {
                            encoding: 'utf-8'
                        }, callback);
                    } else {
                        callback(true, filePathJs + ' doesnot exists!');
                    }
                }
            ], function(err, results) {
                if(!err) {
                    var helper = results[0],
                        cgiJs = results[1];

                    var func = new Function('req', 'helper', 'returnData', cgiJs);
                    func(req, helper, returnData);

                    function returnData(returnJson) {

                        var body = returnJson.body;
                        // 如果是字符串
                        // 用于支持 jsonp callback方式
                        // callback('xxxxxxxxbbbbbbzzzzzzz');
                        if(typeof body === 'string') {
                            res.writeHead(returnJson.statusCode, {
                                'Content-Length': Buffer.byteLength(body),
                                'Content-Type': 'text/html'
                            });
                        } else if(typeof body === 'object') {
                            // 如果是对象
                            body = JSON.stringify(returnJson.body);
                            res.writeHead(returnJson.statusCode, {
                                'Content-Length': Buffer.byteLength(body),
                                'Content-Type': 'application/json'
                            });
                        }

                        res.end(body);
                    }

                } else {
                    res.writeHead(404);
                    res.end('cgi file not found');
                }
            });
        }

    }
};
