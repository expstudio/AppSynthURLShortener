APP.controller('statusReportController', function ($scope, getStatuses) {
    getStatuses.query().$promise.then(function(doc) {
        editStatusData(doc, function(result) {
            if (result !== null) {
                $scope.statusReport = result;
            } else {
                $scope.statusReport = {};
            }
        });
    });

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.pickers = {};
    $scope.picker1 = false;
    $scope.format = 'dd/MM/yyyy';
    $scope.open = function(which) {
        //$scope.pickers[which] = !$scope.pickers[which];
        $scope.pickers[which] = true;
    };

    $scope.searchReport = function (filter) {
        getStatuses.query({start: filter.start, end: filter.end}).$promise.then(function (doc) {
            editStatusData(doc, function(result) {
                $scope.statusReport = result;
            });
        })
    };

    $scope.printTable = function () {
        //var name = 'report-table' + '.xls';
        //angular.element('#reportTable').tableExport({type: 'excel', tableName: 'table'});
        $scope.$broadcast('export-table');
    };
});

function editStatusData (doc, callback) {
    if (doc.length == 0) {
        callback(null);
    } else {
        var currentStudents = doc[doc.length - 1].status;
        var i;
        for (i = 0; i < doc.length - 1; i++) {
            var comparingArr = doc[i].status;
            var s1 = 0, s2 = 0;
            while (s1 < currentStudents.length || s2 < comparingArr.length) {
                if (s1 == currentStudents.length) {
                    doc[i].status.splice(s2, comparingArr.length - s2);
                    break;
                }
                if (s2 == comparingArr.length) {
                    for (var j = s1; j < currentStudents.length; j++) {
                        doc[i].status.push({name: currentStudents[j].name, status: ''});
                    }
                    //doc[i].status = doc[i].status.concat(currentStudents.slice(s1));
                    break;
                }
                if (currentStudents[s1].name < comparingArr[s2].name) {
                    doc[i].status.splice(s2, 0, {name: currentStudents[s1].name, status: ''});
                    s1++;
                    s2++
                } else
                if (currentStudents[s1].name > comparingArr[s2].name) {
                    doc[i].status.splice(s2, 1);
                    //s2++;
                } else {
                    s1++;
                    s2++;
                }
            }

        };
        if (i === doc.length - 1) {
            var result = doc;
            callback(result);
        };
    }

}

