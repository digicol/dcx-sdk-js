import '../styles/index.scss';
let sdkClient = require('../lib/client');
let requestUrl = 'api/';

// ch020dcxsystempoolapict

$('#login__form').submit(function( event ) {
  let loginData = {
    username: $(this).find('#login__username').val(),
    password: $(this).find('#login__password').val(),
    url: $('#api__url').val() +  $(this).find('#login__url').val()
  };

  sdkClient.loginActionPromise(loginData)
    .then((response) => {
      setOutput({
        'selector': '.login__output__wrapper',
        'status' : {
          'class': 'alert-success',
          'messages': [
            '&#10003; Authorisation OK'
          ]
        },
        'output': [
          'Token: ' + JSON.parse(response).access_token
        ]
      });
    }).catch((response) => {
      setOutput({
        'selector': '.login__output__wrapper',
        'status' : {
          'class': 'alert-danger',
          'messages': [
            '&#10007; Failed due - ' + response.message
          ]
        },
        'output': [
          '-'
        ]
      });
    });
});

$('#getobj__form').submit(function( event ) {
  let tmpQuery = [];
  if( $(this).find('#getobj__alldata').is(':checked')) {
    tmpQuery = ['s=*'];
  }

  if( $(this).find('#getobj__checkexists').is(':checked')) {
    tmpQuery = ['s[properties][]=_modcount&s[fields]=Headline'];
  }

  if( $(this).find('#getobj__checkexists').is(':checked')) {
    tmpQuery = ['s[]='];
  }

  if( '' != $(this).find('#getobj__field').val()) {
    tmpQuery = ['s[properties][]=_modcount&s[fields]=' + $(this).find('#getobj__field').val()];
  }

  sdkClient.getObject({
    url: $('#api__url').val() + requestUrl + $(this).find('#getobj__type').val() + '/',
    id: $(this).find('#getobj__id').val(),
    query: tmpQuery
  }).then((response) => {
    setOutput({
      'selector': '.getobj__output__wrapper',
      'status' : {
        'class': 'alert-success',
        'messages': [
          '&#10003; Get Document - OK'
        ]
      },
      'output': [
        response
        // ('undefined' != response && undefined != typeof response) ? JSON.parse(response) : ''
      ]
    });
  }).catch((response) => {
    setOutput({
      'selector': '.getobj__output__wrapper',
      'status' : {
        'class': 'alert-danger',
        'messages': [
          '&#10007; Failed due - ' + response.message
        ]
      },
      'output': [
        '-'
      ]
    });
  });
});

$('#setobj__form').submit(function( event ) {
  let tmpFieldValue = [];

  sdkClient.setObject({
    url: $('#api__url').val() + requestUrl + $(this).find('#setobj__type').val() + '/',
    id: $(this).find('#setobj__id').val(),
    query: [
      's[properties][]=*',
      's[fields]=*'
    ],
    fieldName: $(this).find('#setobj__fieldname').val(),
    fieldValue: [{
      '_label': $(this).find('#setobj__fieldname').val(),
      'value': $(this).find('#setobj__fieldvalue').val(),
    }],
  }).then((response) => {
    setOutput({
      'selector': '.setobj__output__wrapper',
      'status' : {
        'class': 'alert-success',
        'messages': [
          '&#10003; Document Set - OK'
        ]
      },
      'output': [
        (undefined != response && 'undefined' == typeof response != typeof response) ? JSON.stringify(response) : '-'
      ]
    });
  }).catch((response) => {
    setOutput({
      'selector': '.setobj__output__wrapper',
      'status' : {
        'class': 'alert-danger',
        'messages': [
          '&#10007; Failed due - ' + response.message
        ]
      },
      'output': [
        '-'
      ]
    });
  });
});

let setOutput = function (outputParam) {
  // HTML Icons - 10007  - https://www.w3schools.com/charsets/ref_utf_dingbats.asp
  if(typeof outputParam.status.class != undefined) {
    // Set default class
    $(outputParam.selector + ' .status').attr('class', 'status alert');
    $(outputParam.selector + ' .status').addClass(outputParam.status.class);
  }

  if(typeof outputParam.status.messages != undefined) {
    $(outputParam.status.messages).each(function () {
      $(outputParam.selector + ' .status').html(this);
    });
  }

  if(typeof outputParam.output != undefined) {
    $(outputParam.selector + ' .output').html(outputParam.output);
  }



};

$('form').submit(function( event ) {
  event.preventDefault();
  event.stopPropagation();
  return false;
});


/*


let username = 'dc_fleginsky';
let password = 'Welcome2DC';
let loginData = {
  username: 'dc_fleginsky',
  password: 'Welcome2DC',
  url: 'https://dcxtrunk.digicol.de/dcx_trunk/oauth/token',
};
let bearer = false;


let oneDocument = function (getobjuments) {

  let callbackFunc = ( (bearer) => {
  let documentPromise = sdkClient.getobjuments({
      url: 'https://dcxtrunk.digicol.de/dcx_trunk/api/document/',
      docIds: 'monroex5xdx7s0q9gok9b9ap2x',
      bearer: bearer
    }).then((ajaxResponse) => {
     console.log(JSON.parse(ajaxResponse).fields.Headline[0].value);
    }).catch((ajaxResponse) => console.error(ajaxResponse));
  });

  sdkClient.loginActionPromise(loginData, callbackFunc)
    .then((ajaxResponse) => {
      bearer = JSON.parse(ajaxResponse).access_token;
      // displayResult(ajaxResponse);
    }).then(() => {
    callbackFunc(bearer);
  }).catch((ajaxResponse) => console.error(ajaxResponse));
};

oneDocument();




let displayResult = function (resultContent) {
  console.log('Response:', resultContent);
};
*/

