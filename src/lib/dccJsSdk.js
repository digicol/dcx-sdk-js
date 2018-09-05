export default 'dccJsSdk';

exports.init = function(init) {
  return this;
};

// exports.baseUrl = exports.bearer = '';
exports.baseUrl = '';
exports.apiUrl = 'api/';
exports.bearer = false;

exports.login = function(actionData) {
  let dataObj = {
    'grant_type': 'password',
    'username': actionData.username,
    'password': actionData.password
  };

  let requestObj = {
    'method': 'POST',
    'dataType': 'application/x-www-form-urlencoded',
    'absRequestUrl': actionData.hostUrl + 'oauth/token',
    'dataObjEncoded': exports.parseObjUrl(dataObj),
    'bearer': false
  };

  return exports.reqPromise(requestObj)
    .then((response) => {
      exports.bearer = response.responseText.access_token;
      exports.baseUrl = actionData.hostUrl + exports.apiUrl;
      return [true, 'login',  response];
    }).catch((response) => {
      return [false, 'login',  response];
  });

};


exports.getObject = function(actionData) {
  if(!exports.bearer) { return exports.loginFail(); }

  let requestObj = {
    'method': 'GET',
    'dataType': 'application/x-www-form-urlencoded',
    'bearer': exports.bearer,
    'absRequestUrl': exports.baseUrl + actionData.requestUrl + actionData.id +  '?' + exports.parseObjUrl(actionData.query),
    'dataObjEncoded': exports.parseObjUrl(actionData.query)
  };
  return exports.reqPromise(requestObj);
};


exports.createObject = function(actionData) {
  if(!exports.bearer) { return exports.loginFail(); }

  let requestObj = {
    'method': 'POST',
    'dataType': 'Content-Type: application/json; charset=UTF-8',
    'bearer': exports.bearer,
    'absRequestUrl': exports.baseUrl + actionData.requestUrl + '?' + exports.parseObjUrl(actionData.query),
    'dataObjEncoded': JSON.stringify(actionData.payload)
  };
  return exports.reqPromise(requestObj);
};

exports.setObject = function(actionData) {
  if(!exports.bearer) { return exports.loginFail(); }

  let setObjectCallback = function (object) {
    let setRequestObj = {
      'method': 'PUT',
      'dataType': 'application/json; charset=UTF-8',
      'bearer': exports.bearer,
      'absRequestUrl': exports.baseUrl + actionData.requestUrl + actionData.id + '?' + exports.parseObjUrl(actionData.query),
      'dataObjEncoded': JSON.stringify(object)
    };
    return exports.reqPromise(setRequestObj);
  };

  return exports.getObject(actionData).then((response) => {
    if ('undefined' != response.responseText.fields[actionData.fieldName]) {
      response.responseText.fields[actionData.fieldName] = actionData.fieldValue;
      return setObjectCallback(response.responseText);
    } else {
      return new Promise((resolve, reject) => {
        debugger;
        reject({
          'status': '201',
          'message': 'No changes or Field not found.'
        });
      });
    }
  }).catch((response) => {
      return new Promise((resolve, reject) => {
        debugger;
        reject({
          'status': response.status,
          'message': response.message
        });
      });
    }
  );
};

exports.deleteObject = function(actionData) {
  if(!exports.bearer) { return exports.loginFail(); }

  let requestObj = {
    'method': 'DELETE',
    'dataType': 'application/x-www-form-urlencoded',
    'bearer': exports.bearer,
    'absRequestUrl': exports.baseUrl + actionData.requestUrl + '/' + actionData.id,
    'dataObjEncoded': ''
  };
  return exports.reqPromise(requestObj);
};

exports.getStream = function(actionData) {
  if(!exports.bearer) { return exports.loginFail(); }

  if (!!window.EventSource) {
    let queryUrl = exports.baseUrl + actionData.requestUrl + '?' + exports.parseObjUrl(actionData.query);
    let evHeader = {
      headers: {
        Authorization: "Bearer " + exports.bearer,
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

};

exports.reqPromise = function (requestData) {
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
      debugger;
    }
  });
};

exports.parseObjUrl = function (obj, parent) {
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

exports.loginFail = function(objData) {
  return new Promise((resolve, reject) => {
    reject({
      'status': 403,
      'message': 'Login failed',
      'responseText': ['Login data or domain not accesible.']
    });
  });
};

