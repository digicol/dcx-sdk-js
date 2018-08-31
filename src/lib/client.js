exports.init = function(init) {
  return this;
};

// exports.bearer = false;
exports.bearer = 'q9iumebc3eogdcjn3tnolh7jo0';

exports.loginActionPromise = function(loginData) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', loginData.url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
      let tmpResponseObj = JSON.parse(xhr.response);
      let errorFlag = typeof tmpResponseObj.error != 'undefined';

      if (!errorFlag && this.status >= 200 && this.status < 300) {
        exports.bearer = tmpResponseObj.access_token;
        resolve(xhr.response);
      } else {
        reject({
          status: 403,
          message: tmpResponseObj.error
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        message: xhr.statusText
      });
    };

    let params = 'grant_type=password&username=' + loginData.username + '&password=' + loginData.password;
    xhr.send(params);
  });
};


exports.getObject = function(objData) {
  let id = objData.id;

  if(!exports.bearer) {
    return exports.loginFail();
  }

  let queryParam = (typeof objData.query != 'undefined') ? '?' + objData.query.join('&') : '';
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    let objectUrl = objData.url + objData.id;
    xhr.open('GET', objectUrl + queryParam, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Bearer ' + exports.bearer);

    xhr.onload = function () {
      let tmpResponseObj = JSON.parse(xhr.response);
      let errorFlag = typeof tmpResponseObj.error != 'undefined';

      if (!errorFlag && this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: 403,
          message: tmpResponseObj.error
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        message: xhr.statusText
      });
    };
    xhr.send(queryParam);
  });
};

exports.setObject = function(objData) {
  if(!exports.bearer) {
    return exports.loginFail();
  }

  let setObjectCallback = function (object) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let objectUrl = objData.url + objData.id;
      let queryParam = (typeof objData.query != 'undefined') ? '?' + objData.query.join('&') : '';

      xhr.open('PUT', objectUrl + queryParam, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhr.setRequestHeader('Authorization', 'Bearer ' + exports.bearer);

      xhr.onload = function () {
        let tmpResponseObj = JSON.parse(xhr.response);
        let errorFlag = typeof tmpResponseObj.error != 'undefined';

        if (!errorFlag && this.status >= 200 && this.status < 300) {
          resolve(tmpResponseObj);
        } else {
          reject({
            status: 403,
            message: tmpResponseObj.error
          });
        }
      };

      xhr.onerror = function () {
        reject({
          status: this.status,
          message: xhr.statusText
        });
      };

      try {
        xhr.send(JSON.stringify(object));
      } catch(err) {
        // debugger;
      }


    });
  };

  return exports.getObject({
    url: objData.url,
    id: objData.id,
    query:['s[properties]=*', 's[fields]=*']
  }).then((response) => {
    let tmpObject = JSON.parse(response);
    if('undefined' != tmpObject.fields[objData.fieldName]) {
      tmpObject.fields[objData.fieldName] = objData.fieldValue;
      return setObjectCallback(tmpObject);
    } else {
        return new Promise((resolve, reject) => {
          reject({
            status: 201,
            message: 'Processed - no changes.'
          });
        });
      }
    }).catch((response) => {
      // debugger;
      // console.log(response);
    }
  );
};

exports.loginFail = function(objData) {
  return new Promise((resolve, reject) => {
    reject({
      status: 403,
      message: 'Login failed'
    });
  });
};


