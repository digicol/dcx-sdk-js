import '../styles/index.scss';
let sdkClient = require('../lib/dccJsSdk');


// ch020dcxsystempoolapict

$('#login__form').submit(function( event ) {
  let loginData = {
    username: $(this).find('#login__username').val(),
    password: $(this).find('#login__password').val(),
    hostUrl: $('#host__url').val()
  };
  let loginPromise = sdkClient.login(loginData);
  loginPromise.then((response) => {
    setOutput(...response);
  }).catch((response) => {
    setOutput(...response);
  });
});

$('#getobj__form').submit(function( event ) {
  let collectQuery = {};
  if( $(this).find('#getobj__alldata').is(':checked')) {
    collectQuery = {'s': '*'};
  }

  if( $(this).find('#getobj__checkexists').is(':checked')) {
    collectQuery = {
      's': {
        'properties': {
          '0' : '_modcount'
        },
        'fields': 'Headline'
      }
    };
  }

  if( '' != $(this).find('#getobj__field').val()) {
    collectQuery = {
      's': {
        'properties': {
          '0' : '_modcount'
        },
        'fields': $(this).find('#getobj__field').val()
      }
    };
  }

  sdkClient.getObject({
    requestUrl: $(this).find('#getobj__type').val() + '/',
    id: $(this).find('#getobj__id').val(),
    query: collectQuery
  }).then((response) => {
    setOutput(...[true, 'getobj',  response]);
  }).catch((response) => {
    setOutput(...[false, 'getobj',  response]);
  });
});

$('#createobj__form').submit(function( event ) {
  let createPayload, createQuery = {};

  if( '' != $(this).find('#createobj__type').val()) {
    createPayload = {
      '_type': 'dcx:' + $(this).find('#createobj__type').val(),
      'fields': {
        'Type': [ {
            '_id': 'dcxapi:tm_topic/documenttype-text',
            '_type': 'dcx:tm_topic'
          }]
      },
      'properties': {
        'pool_id': {
          '_id': '/dcx/api/pool/native',
          '_type': 'dcx:pool'
        }
      }
    };

    createQuery = {
      's' : {
        'fields': '*',
        'properties': '*'
      },
    };
  }

  sdkClient.createObject({
    requestUrl: $(this).find('#createobj__type').val(),
    query: createQuery,
    payload: createPayload
  }).then((response) => {
    setOutput(...[true, 'createobj',  response]);
  }).catch((response) => {
    setOutput(...[false, 'createobj',  response]);
  });
});

$('#setobj__form').submit(function( event ) {
  let tmpFieldValue = [];

  sdkClient.setObject({
    requestUrl: $(this).find('#setobj__type').val() + '/',
    id: $(this).find('#setobj__id').val(),
    query: {
      's': {
        'properties': ['*'],
        'fields': '*'
      }
    },
    fieldName: $(this).find('#setobj__fieldname').val(),
    fieldValue: [{
      '_label': $(this).find('#setobj__fieldname').val(),
      'value': $(this).find('#setobj__fieldvalue').val(),
    }],
  }).then((response) => {
    setOutput(...[true, 'setobj',  response]);
  }).catch((response) => {
    setOutput(...[false, 'setobj',  response]);
  });
});

$('#deleteobj__form').submit(function( event ) {
  let createPayload, createQuery = {};

  sdkClient.deleteObject({
    requestUrl: $(this).find('#deleteobj__type').val(),
    id:  $(this).find('#deleteobj__id').val(),
  }).then((response) => {
    setOutput(...[true, 'deleteobj',  response]);
  }).catch((response) => {
    setOutput(...[false, 'deleteobj',  response]);
  });
});


$('#getstream__form').submit(function( event ) {
  let createPayload, createQuery = {};
  let streamParam = {
    'requestUrl': $(this).find('#getstream__type').val(),
    'id': $(this).find('#getstream__id').val(),
    'nr': $(this).find('#getstream__nr').val(),
    'query': {
      's': {
        'properties': '*',
        'fields': '*',
      },
      'q': {
        'channel': [$(this).find('#getstream__id').val()],
        '_limit': $(this).find('#getstream__nr').val()
      }
    }
  };

  sdkClient.getStream(streamParam).then((response) => {

    let responseObj = { 'status':'-', 'message':'-', 'responseText': {}};
    response.stream.addEventListener('entry', function (event) {
      responseObj = {
        'status': 200,
        'message': 'streaming',
        'responseText': JSON.parse(event.data)
      };
      setOutput(...[true, 'getstream', responseObj]);
      }, false);

    response.stream.addEventListener('error', function (event) {
      this.close();
      }, false);

    response.stream.addEventListener('open', (event) => {
      // debugger;
      }, false);

    response.stream.addEventListener('close', (event) => {
      // debugger;
    }, false);

    $('#stream__cancel').click(function() {
      response.stream.close();
    });
  }).catch((response) => {
    setOutput(...[false, 'getstream',  response]);
  });
});


$('#getobjects__form').submit(function( event ) {

  let queryParam = {
    'requestUrl': $(this).find('#getobjects__type').val(),
    'id': $(this).find('#getobjects__id').val(),
    'query': {
      's': {
        'properties': '*',
        'fields': '*',
      },
      'q': {
        'channel': [$(this).find('#getobjects__id').val()],
        '_limit': $(this).find('#getobjects__nr').val()
      }
    }
  };

  sdkClient.getObjects(queryParam)
    .then((response) => {
    setOutput(...[true, 'getobjects',  response]);
  }).catch((response) => {
    setOutput(...[false, 'getobjects',  response]);
  });
});

$('#actioninvoke__form').submit(function( event ) {

  let tmpQuery = {};
  tmpQuery[$(this).find('#actioninvoke__key').val()] = $(this).find('#actioninvoke__value').val();

  let queryParam = {
    'requestUrl': $(this).find('#actioninvoke__type').val(),
    'id': $(this).find('#actioninvoke__id').val(),
    'method': $(this).find('#actioninvoke__method').val(),
    'payload': tmpQuery
  };

  sdkClient.invokeaction(queryParam)
    .then((response) => {
      setOutput(...[true, 'actioninvoke',  response]);
    }).catch((response) => {
    setOutput(...[false, 'actioninvoke',  response]);
  });
});


let setOutput = function (status, selector, response) {
  let outputSelector = '.' + selector + '__output__wrapper';
  let outputClass, outputTitle, outputContent= '';

  if(!status) {
    outputClass = 'alert-danger';
    outputTitle = '&#10005; ' + response.status + ' / ' + response.message;
  } else {
    outputClass = 'alert-success';
    outputTitle = '&#10003; ' + response.status + ' ' + response.message;
  }

  // HTML Icons - 10007  - https://www.w3schools.com/charsets/ref_utf_dingbats.asp
  $(outputSelector + ' .status')
    .attr('class', 'status alert')
    .addClass(outputClass)
    .html(outputTitle);
  $(outputSelector + ' .output').html(renderjson.set_icons('', '').set_show_to_level(8)(response.responseText));
};

$('form').submit(function( event ) {
  event.preventDefault();
  event.stopPropagation();
  return false;
});
