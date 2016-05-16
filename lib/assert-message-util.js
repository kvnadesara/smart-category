var debug = require('debug')('utils:assert')

function assertRequiredMessage(field) {
  return getMessage('REQUIRED', 10001, field);
}

function assertTypeMismatchMessage(field) {
  return getMessage('TYPE_MISMATCH', 10002, field);
}

function getMessage(type, code, field) {
  return 'ASSERT|' + type + '|' + code + '|' + (field||'undefined');
}

function parse(message) {
  if (message.indexOf('ASSERT|') != 0) {
    debug('Invalid assert message');
    return null;
  }

  debug('assertion message found');
  var messageParts = message.split('|');
  if(messageParts.length != 4) {
    debug('Assert message should have 4 parts. But currently it contains ', messageParts);
    return null
  }

  return {
    type: messageParts[1],
    code: messageParts[2],
    message: messageParts[3]
  };
}

module.exports = {
  requiredMessage: assertRequiredMessage,
  typeMismatchMessage: assertTypeMismatchMessage,
  parse: parse
}
