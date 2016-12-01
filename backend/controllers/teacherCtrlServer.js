var ObjectID 	= require('mongodb').ObjectID;

exports.createStudents = function(db) {
    return function (req, res) {
        var students = req.body.students;
        var groupID = new ObjectID(req.body.groupID);
        for (var i=0; i < students.length; i++) {
            //students[i].groupID = groupID;
            students[i].groupID = req.body.groupID;
            students[i].hasInfo = "false";
            students[i].status = new Array('outcare');
        }
        db.collection('students').insert(students, function (err, doc) {
            if (err)
                throw err;

            if (doc) {
                var idArray = [];
                doc.forEach(function (item) {
                    //idArray.push(item._id);
                    idArray.push(item._id.toHexString());
                });

                db.collection('groups').update({_id: groupID}, { $push: {students: { $each: idArray}}}, function (err, response) {
                    if (err)
                        throw err;

                });

                return res.json({success:true, amount: doc.length});
            } else {
                return res.json({success:false});
            }

        })
    }
};

exports.saveTodayStatus = function (db) {
    return function (req, res) {
        var obj = req.body.data;
        obj.status._id = new ObjectID(obj.status._id);
        db.collection('historyRecords').update({date: obj.date, groupID: obj.groupID}, obj, {upsert: true}, function (err, response) {
            if (err)
                throw err;
            if (response) {
                res.json({success: true});
            } else {
                res.json({success: false});
            }
        })
    }
};

exports.getStatusReport = function (db) {
    return function (req, res) {
        var groupID = req.user.groupID[0];
        var query = {groupID: groupID};

        if (req.query.date) {
            query.date = req.query.date;
        } else {
            var start = req.query.start,
                end = req.query.end;

            if (start !== undefined && end !== undefined && start < end) {
                query = {groupID: groupID, date: {$gte: start, $lte: end}};
            } else if (start !== undefined && end !== undefined && start == end) {
                start = new Date(req.query.start.substr(0,10)),
                end = new Date(req.query.end.substr(0,10));
                start.setUTCHours(0,0,0,0);
                
                console.log(start, end);
            
                query = {groupID: groupID, date: {$gte: start.toISOString(), $lte: end.toISOString()}};
            }
        }
        console.log(query);
        db.collection('historyRecords').find(query).toArray(function(err, doc) {
            if (err) {
                throw err;
            };
            console.log(doc);
            if (doc) {
                res.send(doc);
            }
        });
    }
};
