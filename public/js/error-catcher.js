function Logger(_options) {

  var defaults = {
    "url": "/logs/log",
    "interval": 10
  }

  var options = $.extend(defaults, _options || {});

  var logBuffer = [];
  var hashHistory = []; // TODO : Local Storage
  var timer = null;

  var sendLogs = function() {
    if (logBuffer.length > 0) {
      var logsToSend = logBuffer;
      logBuffer = [];

      $.ajax({
        type: "POST",
        url: options.url,
        data: JSON.stringify(logsToSend),
        contentType: "application/json; charset=utf-8",
        dataType: 'json'
      });
    }
  };

  /**
   * Handler which receive all errors
   * @param message
   * @param url
   * @param line
   */
  window.onerror = function(message, url, line) {
    var error = {
      "useragent": navigator.userAgent,
      "message": message,
      "url": url,
      "line": line,
      "level": "error"
    };
    pushError(error);
  };

  var hashObject = function(o) {
    var hash = "";
    for (k in o) {
      hash += o[k] + "///";
    }
    return hash;
  };

  var on = function() {
    if (timer == null) {
      timer = setInterval(sendLogs, options.interval * 1000);
    }
  };

  var off = function() {
    if (timer != null) {
      clearInterval(timer);
    }
  };

  var addLog = function(level, message, ex) {
    var error = {
      "level": level,
      "message": message,
      "url": document.location.href,
      "stack": (ex !== undefined && ex.stack !== undefined) ? ex.stack : null,
      "useragent": navigator.userAgent
    };
    pushError(error);
  }

  var pushError = function(error) {
    var hash = hashObject(error);
    if (hashHistory.indexOf(hash) < 0) {
      console.log(error);
      logBuffer.push(error);
      hashHistory.push(hash);
    }
  }

  return {
    start: function() {
      on();
    },
    stop: function() {
      off();
    },
    error: function(message, ex) {
      addLog("error", message, ex);
    },
    debug: function(message, ex) {
      addLog("debug", message, ex);
    }
  };

};

var logger = new Logger({
  interval: 1
});
logger.start();
