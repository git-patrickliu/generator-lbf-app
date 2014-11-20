/**
 * Created by patrickliu on 14/11/11.
 */

// this is a helper for cgi

var path = require('path'),
    url = require('url'),
    queryString = require('querystring'),
    fs = require('fs'),
    underscore = require('underscore');

var helper = function(req, callback) {
    var method = req.method.toLowerCase(),
        objectUrl = url.parse(req.url),
        queryStringObj = {},
        self = this;

    console.log('[CGIHelper] enter helper init');
    this.tools = {};
    // add underscore helper
    this.tools._ = underscore;

    // 如果是get方法
    if(method === 'get') {
        console.log('[CGIHelper] this is a get method');
        // 获取get请求 http://qq.com?a=hi -> {"a": "hi"}
        queryStringObj = queryString.parse(objectUrl.query);
        this.tools.body = queryStringObj;
        callback && callback(null, this.tools);
    } else if(method === 'post') {
        console.log('[CGIHelper] this is a post method');
        // 如果是post方法
        var chunks = [],
            size = 0;

        req.on('data', function(buf){
            chunks.push(buf);
            size += buf.length;
        });

        req.on('end', function(){
            if(chunks.length === 0){
                self.tools.body = {};
                callback && callback(null, self.tools);

            } else {
                var body = self.tools.body = Buffer.concat(chunks, size).toString();
                try{
                    self.tools.body = queryString.parse(body);
                    callback && callback(null, self.tools);

                } catch(err){
                    console.error('[%s] non-JSON data incoming\n%s', req.url, body);
                    callback && callback(true);
                }
            }

        });
    }
};


module.exports = exports = helper;
