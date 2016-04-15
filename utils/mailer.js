var loggers = require('../initializers/loggers');
var nodemailer = require("nodemailer");

function sendMail(bcc, subject, body){
  process.nextTick(() => {
    var transporter = nodemailer.createTransport('smtps://ermesmailer@gmail.com:fp7ermes@smtp.gmail.com');
    var mailOptions = {
      from: 'ERMES <ermesmailer@gmail.com>', // sender address
      bcc,
      subject,
      html: body,
      generateTextFromHtml: true
    };

    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.error('[EMAIL]: '+ JSON.stringify(error));
        loggers.error.write('[' + new Date() + ' EMAIL]: '+ JSON.stringify(error) + '\n');
      } else {
        console.log('[EMAIL]: '+ JSON.stringify(info));
        loggers.info.write('[' + new Date() + ' EMAIL]: '+ JSON.stringify(info) + '\n');
      }
    });
  });
}

module.exports = {
  sendMail
};