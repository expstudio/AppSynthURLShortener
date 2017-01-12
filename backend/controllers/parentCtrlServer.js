var ObjectID 	= require('mongodb').ObjectID;
var async       = require('async');
var _           = require('underscore');
var i18n        = require('i18n');

function addRepresentative (db, sender, child, callback) {
    var childID = child._id;
    var representativeEmailArr = new Array();
    //child.personalInfo.newRepresentatives = [{}] by default
    if (child.personalInfo && child.personalInfo.newRepresentatives && !_.isEmpty(child.personalInfo.newRepresentatives[0])) {

        _.each(child.personalInfo.newRepresentatives, function (item) {
            if (item.email !== undefined) {
                representativeEmailArr.push(item.email);
            }
        });
        db.collection('users').find({'local.email': {$in : representativeEmailArr}}).toArray(function (err, doc) {
            if (err)
                throw err;
            if (doc.length < representativeEmailArr.length) {
                callback('Cannot find partner', null, null);
            } else {
                if (!child.personalInfo.representatives) {
                    child.personalInfo.representatives = new Array();
                };

                var message = {};
                var foundEmailArr = new Array();
                message.receivers   = new Array();
                message.sender      = sender._id.toString();
                _.each(doc, function (user) {
                    if (child.personalInfo.representatives.indexOf(user.local.email) < 0) {
                        message.receivers.push(user._id.toHexString());
                        foundEmailArr.push(user.local.email);
                    }
                });

                i18n.setLocale(sender.lang);
                message.title       = i18n.__("Invitation to be a representative");
                message.body        = sender.fullName + ' ' + i18n.__('has sent you an invitation to be a representative of his/her child in TinyApp.')
                + '<br>'
                + i18n.__('Please reply to the invitation by clicking the buttons below.') + '<br>'
                + '<a id="'+ childID +'" class="btn btn-success acceptBtn" ng-click="addRepresentative($event)">' + i18n.__('Accept')+ '</a>';
                message.sentAtTime  = new Date();
                message.seenBy = new Array();

                db.collection('messages').insert(message, function (err, doc) {
                    if (err)
                        throw err;
                });
                child.personalInfo.representatives = child.personalInfo.representatives.concat(foundEmailArr);
                child.personalInfo.newRepresentatives = [{}];
                callback(null, child, message.receivers);
            }

        });
    } else {
        callback(null, child, null);
    }

}
/*this method is for the first time parent create child profile*/
exports.updateProfile = function(db) {
    return function(req, res) {
        var data = req.body.data;
        console.log(req.user);
        var userID = new ObjectID(req.user._id);
        var sentTo = new Array();

        data._id = new ObjectID(data._id);
        //data.groupID = new ObjectID(data.groupID);
        data.parents = new Array(req.user._id.toString());
        delete data['hasInfo'];
        /*for now, just allow to add only one representative*/
        async.series([function(callback) {
            addRepresentative(db, req.user, data, function(error, child, listeners) {
                if (error) {
                    console.log(error);
                    res.json({success: false, error: error})
                }
                data = child;
                sentTo = listeners;
                callback(null);
            });

        }, function(callback) {
            data._id = new ObjectID("" + data._id);
            /*add req.user as child's parent, add child as req.user's child*/
            db.collection('students').update({_id: data._id}, data, function (err, response) {
                if (err)
                    return res.json({success: false, err: err.toString()});
                callback(null);
            });
        }, function (callback) {
            db.collection('users').update({_id: userID}, {$push: {myChildren: data._id.toString()}}, function(err, response) {
                if (err)
                    return res.json({success: false, err: err.toString()});
                return res.json({success: true, listeners: sentTo});
                callback(null);
            });

        }])

    }
};

/*This method is for later update from parents*/
exports.updateChildProfile = function(db) {
    return function(req, res) {
        var profile = req.body;

        addRepresentative(db, req.user, profile, function(error, child, listeners) {
            if (error) {
                res.json({success: false, error: error});
            } else {
                profile = child;
                profile._id = ObjectID(profile._id);

                //db.collection('students').update({_id: objID}, {$set: {personalInfo: profile.personalInfo}}, function(err, response) {
                db.collection('students').update({_id: profile._id}, profile, function(err, response) {
                    if (err)
                        throw err;
                    res.json({success: true, child: profile, listeners: listeners});
                })
            }

        });

    }
};

exports.addParent = function(db) {
    return function(req, res) {
        var userID = new ObjectID(req.user._id);
        var childID = new ObjectID(req.body.target);
        async.parallel([function(callback) {
            db.collection('students').findAndModify(
                {_id: childID},
                [],
                {$addToSet: {parents: req.user._id}},
                {new: true},
                function(err, doc) {
                    callback(null, doc);
                })
        }, function(callback) {
            db.collection('users').update({_id: userID}, {$addToSet: {myChildren: req.body.target} }, function(err, numOfDoc) {
                if (err)
                    throw err;
                callback(null);
            })
        }], function(err, result) {
            res.json({success: true, child: result[0]});
        })

    }
};

exports.joinGroup = function (db) {
    return function (req, res) {
        var groupCode = req.body.code;
        async.waterfall([
            function (callback) {
                db.collection('groups').findOne({code: groupCode}, function (err, doc) {
                    if (err) callback('Couldn\'t find the group');
                    callback(null, doc);
                })
            },
            function (group, callback) {
                db.collection('users').findAndModify(
                    {_id: new ObjectID(req.user._id)},
                    [],
                    {$addToSet: {groupID: group._id.toString()}},
                    {new: true},
                    function (err, doc) {
                        if (err) callback('Error: ' + err.toString());
                        callback(null, group, doc)
                    }
                )
            }
        ], function (err, results) {
            console.log('results', results);
            if (err) throw err;
            res.json({success: true, results: results});
        });

    }
}
