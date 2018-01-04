const options = (vars) => {
    return {
        "template": "checkMailWelcome",
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