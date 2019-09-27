"use strict";

module.exports.baseUrl = '';
module.exports.apiUrl = 'api/';
module.exports.bearerToken = false;
module.exports.username = '';
module.exports.password = '';
module.exports.bearerTokenExpiration = 0;

module.exports.useLocalStorage = false;
module.exports.useReauthentication = false;

module.exports.login = function(actionData) {
  var dataObj = {
    'grant_type': 'password',
    'username': actionData.username,
    'password': actionData.password
  };

  var requestObj = {
    'method': 'POST',
    'dataType': 'application/x-www-form-urlencoded',
    'absRequestUrl': actionData.hostUrl + 'oauth/token',
    'dataObjEncoded': exports.parseObjUrl(dataObj),
    'bearer': false
  };

  return exports.reqPromise(requestObj)
    .then((response) => {
      exports.setBearerToken(response.responseText.access_token);
      exports.setBaseUrl(actionData.hostUrl);
      if (exports.useReauthentication) {
        exports.setUsername(actionData.username);
        exports.setPassword(actionData.password);
        var expireMiliseconds = response.responseText.expires_in * 1000;
        exports.setBearerTokenExpiration(expireMiliseconds + Date.now());
      }
      return [true, 'login',  response];
    }).catch((response) => {
      return [false, 'login',  response];
  });

};

module.exports.setUseLocalStorage = function(useLocalStorage) {
  exports.useLocalStorage = useLocalStorage;
};

module.exports.setUseReauthentication = function(useReauthentication) {
  exports.useReauthentication = useReauthentication;
};

module.exports.setApiUrl = function(newApiUrl) {
  exports.apiUrl = newApiUrl;
};

module.exports.setBaseUrl = function(newBaseUrl) {
  exports.baseUrl = newBaseUrl;
  if (exports.useLocalStorage)
    window.localStorage.setItem('dc.baseUrl', newBaseUrl);
};

module.exports.getBaseUrl = function() {
  if (exports.useLocalStorage)
    exports.baseUrl = window.localStorage.getItem('dc.baseUrl');
  return exports.baseUrl;
};

module.exports.setBearerToken = function(newBearerToken) {
  exports.bearerToken = newBearerToken;
  if (exports.useLocalStorage)
    window.localStorage.setItem('dc.bearerToken', newBearerToken);
};

module.exports.getBearerToken = function() {
  if (exports.useLocalStorage)
    exports.bearerToken = window.localStorage.getItem('dc.bearerToken');
  return exports.bearerToken;
};

module.exports.setUsername = function(newUsername) {
  exports.username = newUsername;
  if (exports.useLocalStorage)
    window.localStorage.setItem('dc.username', newUsername);
};

module.exports.getUsername = function() {
  if (exports.useLocalStorage)
    exports.username = window.localStorage.getItem('dc.username');
  return exports.username;
};

module.exports.setPassword = function(newPassword) {
  exports.password = newPassword;
  if (exports.useLocalStorage)
    window.localStorage.setItem('dc.password', newPassword);
};

module.exports.getPassword = function() {
  if (exports.useLocalStorage)
    exports.password = window.localStorage.getItem('dc.password');
  return exports.password;
};

module.exports.setBearerTokenExpiration = function(newExpiration) {
  exports.bearerTokenExpiration = newExpiration;
  if (exports.useLocalStorage)
    window.localStorage.setItem('dc.expiration', newExpiration);
};

module.exports.getBearerTokenExpiration = function() {
  if (exports.useLocalStorage)
    exports.bearerTokenExpiration = Number(window.localStorage.getItem('dc.expiration'));
  return exports.bearerTokenExpiration;
};

module.exports.getObject = function(actionData) {
  let requestObj = {
    'method': 'GET',
    'dataType': 'application/x-www-form-urlencoded',
    'bearer': exports.getBearerToken(),
    'absRequestUrl': exports.getBaseUrl() + exports.apiUrl + actionData.requestUrl + '/' +  actionData.id + '?' + exports.parseObjUrl(actionData.query),
    'dataObjEncoded': ''
  };
  return exports.checkAuthAndSendRequest(requestObj);
};

module.exports.followLink = function(linkurl) {
  let requestObj = {
    'method': 'GET',
    'dataType': 'application/x-www-form-urlencoded',
    'bearer': exports.getBearerToken(),
    'absRequestUrl': linkurl,
    'dataObjEncoded': ''
  };
  return exports.checkAuthAndSendRequest(requestObj);
};

module.exports.getObjects = function(actionData) {
  let requestObj = {
    'method': 'GET',
    'dataType': 'application/x-www-form-urlencoded',
    'bearer': exports.getBearerToken(),
    'absRequestUrl': exports.getBaseUrl() + exports.apiUrl + actionData.requestUrl + '/' + '?' + exports.parseObjUrl(actionData.query),
    'dataObjEncoded': ''
  };
  return exports.checkAuthAndSendRequest(requestObj);
};

module.exports.createObject = function(actionData) {
  let requestObj = {
    'method': 'POST',
    'dataType': 'Content-Type: application/json; charset=UTF-8',
    'bearer': exports.getBearerToken(),
    'absRequestUrl': exports.getBaseUrl()  + exports.apiUrl + actionData.requestUrl + '?' + exports.parseObjUrl(actionData.query),
    'dataObjEncoded': JSON.stringify(actionData.payload)
  };
  return exports.checkAuthAndSendRequest(requestObj);
};

module.exports.setObject = function(actionData) {
  let setObjectCallback = function (object) {
    let setRequestObj = {
      'method': 'PUT',
      'dataType': 'application/json; charset=UTF-8',
      'bearer': exports.getBearerToken(),
      'absRequestUrl': exports.getBaseUrl() + exports.apiUrl + actionData.requestUrl + actionData.id + '?' + exports.parseObjUrl(actionData.query),
      'dataObjEncoded': JSON.stringify(object)
    };
    return exports.checkAuthAndSendRequest(requestObj);
  };

  return exports.getObject(actionData).then((response) => {
    if ('undefined' != response.responseText.fields[actionData.fieldName]) {
      response.responseText.fields[actionData.fieldName] = actionData.fieldValue;
      return setObjectCallback(response.responseText);
    } else {
      return new Promise((resolve, reject) => {
        reject({
          'status': '201',
          'message': 'No changes or Field not found.'
        });
      });
    }
  }).catch((response) => {
      return new Promise((resolve, reject) => {
        reject({
          'status': response.status,
          'message': response.message
        });
      });
    }
  );
};

module.exports.deleteObject = function(actionData) {
  let requestObj = {
    'method': 'DELETE',
    'dataType': 'application/x-www-form-urlencoded',
    'bearer': exports.getBearerToken(),
    'absRequestUrl': exports.getBaseUrl() + exports.apiUrl + actionData.requestUrl + '/' + actionData.id,
    'dataObjEncoded': ''
  };
  return exports.checkAuthAndSendRequest(requestObj);
};

module.exports.parseStructure = function(obj, structurePath, strict = false) {
    let activeObj = obj;
    let defaultReturn = false;

    if(typeof (structurePath) !== 'object' || typeof (structurePath.length) === 'undefined' || structurePath.length === 0) {
      return defaultReturn;
    }

    for(let countKey = 0; countKey < structurePath.length; countKey++) {
      let tmpKey = typeof (structurePath[countKey]) !== 'object' ? structurePath[countKey] : false
      if((!isNaN(parseFloat(tmpKey)) && isFinite(tmpKey))) {
        tmpKey = parseInt(tmpKey);
      }

      if(typeof (activeObj[tmpKey]) !== 'undefined') {
        activeObj = activeObj[tmpKey];
      } else if (!strict && typeof (activeObj[Object.keys(activeObj)[tmpKey]]) !== 'undefined') {
        activeObj = activeObj[Object.keys(activeObj)[tmpKey]];
      } else {
        return defaultReturn;
      }

      if(countKey === structurePath.length-1) {
        return activeObj;
      }
    }
    return defaultReturn;
};

module.exports.getStream = function(actionData) {
  let stream = function(bearerToken, actionData) {
    if (!!window.EventSource) {
      let queryUrl = exports.getBaseUrl()  + exports.apiUrl + actionData.requestUrl + '?' + exports.parseObjUrl(actionData.query);
      let evHeader = {
        headers: {
          Authorization: "Bearer " + bearerToken,
          'Accept': 'text/event-stream',
          'Cookie': 'test=test'
        },
        withCredentials: true
      };
      return new Promise((resolve, reject) => {
        resolve({
          'status': 201,
          'message': 'Streaming...',
          'responseText': 'Follow streaming events like: itemlist_item, open, error, close',
          'stream': new EventSource(queryUrl, evHeader)
        });
      });
    }
  }

  var bearerToken = exports.getBearerToken();
  if(!bearerToken) { 
    return exports.loginFail(); 
  }
  else if (exports.useReauthentication && exports.isExpired()) { 
    return exports.reAuthenticate().then(token => stream(token, actionData));
  }
  else { 
    return stream(bearerToken, actionData); 
  }
};

module.exports.invokeaction = function(actionData) {
  let requestObj = {
    'method': 'POST',
    'dataType': 'application/json; charset=UTF-8',
    'bearer': exports.getBearerToken(),
    'absRequestUrl': exports.getBaseUrl()  + exports.apiUrl + actionData.requestUrl + '/' + actionData.id + '/actions/' + actionData.method +'/invoke?' + exports.parseObjUrl(actionData.query),
    'dataObjEncoded': ''
  };
  return exports.checkAuthAndSendRequest(requestObj);
};

module.exports.checkAuthAndSendRequest = function(requestObj) {
  if(!requestObj.bearer) { 
    return exports.loginFail(); 
  }
  else if (exports.useReauthentication && exports.isExpired()) { 
    return exports.reAuthenticate()
      .then(token => requestObj.bearer = token)
      .then(() => exports.reqPromise(requestObj));
  }
  else { 
    return exports.reqPromise(requestObj) 
  }
};

module.exports.reqPromise = function (requestData) {
  let mandatoryProp = ['method', 'dataType', 'absRequestUrl', 'dataObjEncoded', 'bearer' ];
  for(let property of mandatoryProp) {
    if(typeof requestData[property] == 'undefined') {
      return new Promise((resolve, reject) => {
        reject({
          'status': 401,
          'message': 'Wrong request, missing ' + property,
          'responseText': []
        });
      });
    }
  }

  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();

    xhr.open(requestData.method, requestData.absRequestUrl, true);
    xhr.setRequestHeader('Content-type', requestData.dataType);
    if(requestData.bearer) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + requestData.bearer);
    }
    let tmpResponseObj = {};

    xhr.onload = function () {
      let responseText = JSON.stringify({});
      if(xhr.responseText != '') {
        responseText = JSON.parse(xhr.responseText);
      }

      let errorFlag = (typeof tmpResponseObj.error != 'undefined');
      if (!errorFlag && this.status >= 200 && this.status < 300) {
        resolve(
          {
            'status': xhr.status,
            'message': xhr.statusText,
            'responseText': responseText
          }
        );
      } else {
        reject({
          'status': xhr.status,
          'message': xhr.statusText,
          'responseText': responseText
        });
      }
    };

    xhr.onerror = function () {
      reject({
        'status': xhr.status,
        'message': xhr.statusText,
        'responseText': tmpResponseObj
      });
    };

    try {
      xhr.send(requestData.dataObjEncoded);
    } catch(err) {
    }
  });
};

module.exports.parseObjUrl = function (obj, parent) {
  let returnVal = [];
  if(typeof obj == 'string') {
    returnVal = parent + '=' + obj;
  } else if(typeof obj == 'object') {
    let tmpKeys = Object.keys(obj);
    let forwardParent, elKey = '';
    for(let tmpIndex in Object.keys(obj)) {
      elKey = (tmpKeys[tmpIndex] == 0) ? '' : tmpKeys[tmpIndex];
      if (typeof parent == 'undefined') {
        forwardParent = elKey;
      } else if(parent == '') {
        forwardParent = tmpKeys[tmpIndex];
      } else {
        forwardParent = parent + '[' + elKey + ']';
      }
      returnVal.push(exports.parseObjUrl (obj[tmpKeys[tmpIndex]], forwardParent) );
    }
  }
  return (typeof returnVal == 'object') ? returnVal.join('&') : returnVal;
};

module.exports.loginFail = function(objData) {
  return new Promise((resolve, reject) => {
    reject({
      'status': 403,
      'message': 'Login failed',
      'responseText': ['Login data or domain not accesible.']
    });
  });
};

module.exports.isExpired = function() {
  return exports.getBearerTokenExpiration() < Date.now();
}

module.exports.reAuthenticate = function() {
  return exports.login({
      'hostUrl': exports.getBaseUrl(),
      'password': exports.getPassword(),
      'username': exports.getUsername()
    }).then(res => {
      return res[2].responseText.access_token
    });
}

module.exports.logout = function() {
  exports.setBearerToken('');
  exports.setUsername('');
  exports.setPassword('');
  exports.setBearerTokenExpiration(0);
}
