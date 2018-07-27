const twilio  = require('twilio');
const accountSid = 'AC962897a414d64dcc4d047c460286ef57';
const authToken = '2674a25f2e9d63088815788e4e144ae8';

module.exports = new twilio.Twilio(accountSid, authToken);
