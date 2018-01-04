
'use strict';

const Email = require('email-templates');
const nodemailer = require('nodemailer');
var inlineBase64 = require('nodemailer-plugin-inline-base64');
const path = require('path');
const fs = require('fs');
const conf = require('nconf');
const merge = require('lodash.merge');
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: conf.get('emailProvider'),
        pass: conf.get('emailProviderPass')
    }
});
transport.use('compile', inlineBase64({cidPrefix: 'inarts_'}));

let email = new Email({
    message: {
        from: conf.get('emailProvider')
    },
    views: {
        root: path.resolve('app', 'mailer', 'layouts')
    },
    // uncomment below to send emails in development/test env:
    send: true,
    preview: false,
    transport: transport
});

const mail = (type, vars) => {
    let options = {};
    if (fs.existsSync(path.resolve('app', 'mailer', 'types', type + '.js'))) {
        options = require('./types/' + type + '.js').default(vars);
    }
    if (options !== {}) {
        email.send(options).then(console.log).catch(console.error);
        return true;
    } else {
        return false;
    }
}

const mailFR = (req, res) => {
    try {

        req.checkBody("type", "Invalid type").notEmpty();

        let errors = req.validationErrors();

        if (errors) throw errors;

        let vars = req.body.vars;

        let type = req.body.type;

        let success = mail(type, vars);

        if (success === false) throw "";

        res.status(200).json({ "success": true });
    }
    catch (err){
        res.status(401).json({ "success": false });
    }


}



module.exports.mailFR = mailFR;
module.exports.mail = mail;
