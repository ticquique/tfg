const options = (vars) => {
    return {
        "template": "confirmMail",
        "message": {
            "to": vars.to
        },
        "locals": {
            "name": vars.name,
            "passurl": vars.url
        }
    }
}

module.exports.default = options;