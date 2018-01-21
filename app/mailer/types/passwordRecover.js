const config = require('nconf');
const path = require('path');
const options = (vars) => {
    return {
        "template": "passwordRecover",
        "message": {
            "to": vars.to,
            "attachments": [
                {   // define custom content type for the attachment
                    filename: 'logo.png',
                    path: path.join(config.get("PWD"), "app", "mailer", "layouts", "images", "logo.png"),
                    cid: 'unique@kreata.ee'
                },
                {   // define custom content type for the attachment
                    filename: 'main.png',
                    path: path.join(config.get("PWD"), "app", "mailer", "layouts", "passwordRecover", "images", "main.png"),
                    cid: 'unique2@kreata.ee'
                }
            ]
        },
        "locals": {
            "name": vars.name,
            "passurl": vars.url,
            "password": vars.password
        }
    }
}

module.exports.default = options;