var roleModel = require('../models/role'),
    User = require('../models/user');

const _getRole = function (req, res, next) {
    try {
        req.checkParams("roleId", "roleId invalid").notEmpty().withMessage("roleId can't be empty").isAlphanumeric().withMessage('roleId must contain letters and numbers only');
        let errors = req.validationErrors();
        if (errors) throw errors;

        if (req.user && req.user.privileges == "admin") {
            const role = roleModel.findById(req.params.roleId, (err, role) => {
                if (err) {
                    res.status(401).json({ message: 'Error on function' });
                    next();
                } else if (role) {
                    res.status(200).json({ message: 'Role found', role });
                    next();
                } else {
                    res.status(401).json({ message: 'Role not found' });
                    next();
                }
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
            next();
        }
    } catch (err) {
        res.status(401).json({ "message": "Invalid request", "errors": err });
        next();
    }

}

const _newRole = function (req, res, next) {

    try {
        req.checkBody("name", "name invalid").notEmpty().withMessage("name can't be empty").isAlphanumeric().withMessage('name must contain letters and numbers only');
        const nameParam = (req.body.name).toLowerCase();
        let errors = req.validationErrors();
        if (errors) throw errors;

        if (req.user && req.user.privileges == "admin") {
            const newRole = new roleModel({
                name: nameParam
            });

            newRole.save(function (err) {
                if (err) {
                    res.status(401).json({ message: 'Error on function' });
                    next();
                } else {
                    res.status(200).json({ message: 'Role correctly created', newRole });
                    next();
                }
            });

        } else {
            res.status(401).json({ message: "Invalid credentials" });
            next();
        }

    } catch (err) {
        res.status(401).json({ "message": "Invalid request", "errors": err });
        next();
    }
}

const _updateRole = function (req, res, next) {
    try {
        req.checkParams("roleId", "roleId invalid").notEmpty().withMessage("roleId can't be empty").isAlphanumeric().withMessage('roleId must contain letters and numbers only');
        req.checkBody("name", "name invalid").notEmpty().withMessage("name can't be empty").isAlphanumeric().withMessage('name must contain letters and numbers only');
        const nameParam = (req.body.name).toLowerCase();
        let errors = req.validationErrors();
        if (errors) throw errors;

        if (req.user && req.user.privileges == "admin") {

            const query = { name: nameParam }
            roleModel.findByIdAndUpdate(req.params.roleId, { $set: query }, (err, role) => {
                if (err) {
                    res.status(401).json({ message: 'Error on function', err });
                    next();
                } else {
                    res.status(200).json({ message: 'Role correctly updated', role });
                    next();
                }
            });

        } else {
            res.status(401).json({ message: "Invalid credentials" });
            next();
        }

    } catch (err) {
        res.status(401).json({ "message": "Invalid request", "errors": err });
        next();
    }
}

const _deleteRole = function (req, res, next) {
    try {
        req.checkParams("roleId", "roleId invalid").notEmpty().withMessage("roleId can't be empty").isAlphanumeric().withMessage('roleId must contain letters and numbers only');
        let errors = req.validationErrors();
        if (errors) throw errors;

        if (req.user && req.user.privileges == "admin") {
            roleModel.findByIdAndRemove({ _id: req.params.roleId }, function (err, role) {
                if (err) {
                    res.status(401).json({ message: 'Error on function', err });
                    next();
                } else if (role) {
                    res.status(200).json({ message: 'Role correctly deleted' });
                    next();
                } else {
                    res.status(401).json({ message: 'Role not found' });
                    next();
                }
            });
        } else {
            res.status(401).json({ message: 'Role not found' });
            next();
        }

    } catch (err) {
        res.status(401).json({ message: "Invalid request" });
        next();
    }
}

const _getAllRoles = function (req, res, next) {
    roleModel.find({}, function (err, roles) {
        if (err) {
            res.status(401).json({ message: 'Failed to list roles' + err });
            next();
        } else if (roles.length > 0) {
            res.status(200).json({ message: 'Roles', roles });
            next();
        } else {
            res.status(401).json({ message: 'No roles to list' });
            next();
        }
    });
}



module.exports.getRole = _getRole;
module.exports.newRole = _newRole;
module.exports.updateRole = _updateRole;
module.exports.deleteRole = _deleteRole;
module.exports.getAllRoles = _getAllRoles;