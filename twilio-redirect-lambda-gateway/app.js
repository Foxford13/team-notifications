'use strict';

exports.handler = async (event, context, callback) => {

    var responseBody =  `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice" language="en-GB">Thank you for calling Re-com-bix Limited.</Say><Dial callerId="${event.To}">+447949523641</Dial><Hangup/></Response>`;

    callback(null, responseBody);
};
