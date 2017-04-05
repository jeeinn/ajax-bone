/**
 * Created by jeeinn on 16/8/24.
 * https://github.com/jeeinn/ajax-bone
 */

;(function (window) {
    /* 格式化参数 */
    function formatParams(data,cache) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        if(!cache){
            arr.push("currentTimeString=" + new Date().getTime());
        }
        return arr.join("&");
    }

    /* 设置headers */
    function setHeaders(xhr,headersObj) {
        if(Object.getOwnPropertyNames(headersObj).length === 0) return;
        for(var header in headersObj){
            xhr.setRequestHeader(header,headersObj[header]);
        }
    }

    /* xhr设置并发送数据 */
    function xhrSendData(xhr,options) {
        var params = formatParams(options.data,options.cache);
        switch (options.type) {
            case "GET":
                if(options.dataType === "jsonp" ){
                    //jsonp to do
                }
                if(/[?&]/.test(options.url)){
                    params = '&' + params;
                }else {
                    params = '?' + params;
                }
                xhr.open(options.type, options.url + params, true);
                setHeaders(xhr,options.headers);
                xhr.responseType = options.dataType;
                xhr.send();
                break;
            case "PUT":
            case "POST":
                xhr.open(options.type, options.url, true);
                setHeaders(xhr,options.headers);
                xhr.responseType = options.dataType;
                //设置表单提交时的内容类型
                xhr.setRequestHeader("Content-Type", options.contentType);
                xhr.send(params);
                break;
            default:
                break;
        }
    }

    /* ajax核心函数 - 现仅支持异步请求 */
    function Ajax(options) {
        //第零步 - 初始化配置
        options = options || {};
        options.type = (options.type || 'GET').toUpperCase();
        options.dataType = options.dataType || 'json';
        options.headers = options.headers || {};
        options.timeout = options.timeout || 60;    // 默认超时 60s
        options.cache = options.cache || false;
        options.async = true;
        if(options.dataType === 'jsonp'){
            options.type = 'GET';
        }
        var res_data = {};

        //第一步 - 创建xhr - 及非IE6
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else { //IE6及其以下版本浏览器
            var xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        if(xhr === undefined || xhr === null){
            console.warn('Ajax:Your browser does not support XMLHttpRequest.');
        }

        //第二步 - 设置 和 发送数据
        //处理同步、异步情况
        if(options.async){
            xhrSendData(xhr,options);
            xhr.timeout = options.timeout*1000;
        }else{
            xhr.timeout = 0;
            xhr.withCredentials = false;
            xhr.responseType = '';//注意必须为""
            xhrSendData(xhr,options);
        }

        //第三步 - 接收 和 处理回调

        // xhr.onreadystatechange = function () {
        //     console.log(xhr);
        //     if (xhr.readyState === 4) {
        //         var status = xhr.status;
        //         if (status >= 200 && status < 300 || status === 304) {
        //             options.success && options.success(xhr.response);
        //         } else {
        //             options.fail && options.fail(status,xhr.response || xhr.statusText);
        //         }
        //     }
        // }

        //请求成功完成处理
        xhr.onload = function () {
            // console.log('onload');
            var status = xhr.status;
            res_data.code = status;
            res_data.result = xhr.response || xhr.statusText;
            if (status >= 200 && status < 300 || status === 304) {
                options.success && options.success(res_data);
            } else {
                options.fail && options.fail(res_data);
            }
        };

        //请求超时处理
        xhr.ontimeout = function () {
            options.fail && options.fail(xhr.status,'Ajax:request timeout.');
        };

        //请求出错处理
        xhr.onerror = function () {
            options.fail && options.fail(xhr.status,'Ajax:onerror.');
        }

    }

    // 导出
    window.Ajax = Ajax;
})(window);
