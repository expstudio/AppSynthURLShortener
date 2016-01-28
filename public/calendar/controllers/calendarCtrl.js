APP.controller('calendarController', function($scope, $http, $q, $compile, _, eventService, toastr, identityService,
                                              $filter, uiCalendarConfig, $modal, $log, $rootScope) {
    /**** date picker ****/
    $scope.newlyAddedEvents = new Array();
    $rootScope.$watch('lang', function() {
        $scope.uiConfig.calendar.lang = $rootScope.lang;
    });

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.inputChanged = function(event, tobeUpdated) {
        event.startDate.setHours(event.startTime.getHours());
        event.startDate.setMinutes(event.startTime.getMinutes());

        event.endDate.setHours(event.endTime.getHours());
        event.endDate.setMinutes(event.endTime.getMinutes());
        if (event.startDate > event.endDate) {
            //event.endDate = event.startDate; // this is WRONG!!! Use angular.copy!!!
            event.endDate = angular.copy(event.startDate);
            event.endTime = angular.copy(event.startTime);
        }

        var eventToUpdate = uiCalendarConfig.calendars['myCalendar'].fullCalendar('clientEvents', event._id)[0];
        /*if do not set to utc(), eventToUpdate will set time to GMT +0 => default behaviour*/
        eventToUpdate.title = event.title;
        eventToUpdate.isPublished = event.isPublished;
        eventToUpdate.color = event.isPublished ? '#3a87ad' : '#24C27A';

        eventToUpdate.start = moment(event.startDate);
        eventToUpdate.end = moment(event.endDate);
        eventToUpdate.allDay = event.allDay;

        if (!event.allDay) {
            eventToUpdate.start = moment(event.startDate);
            eventToUpdate.end = moment(event.endDate);
        }

        uiCalendarConfig.calendars['myCalendar'].fullCalendar('updateEvent', eventToUpdate);
        /*is applied when edit event*/
        if (tobeUpdated) {
            delete eventToUpdate.source;
            eventToUpdate.$update().then(function(response) {
                if (response.success) {
                    console.log('event updated');
                } else {
                    console.log('event is not updated');
                }
            });
        }
    };

    $scope.changed = function(event) {
    };

    $scope.open = function(event, which) {
        //$event.preventDefault();
        //$event.stopPropagation();
        //$scope.newlyAddedEvents[index][which] = !$scope.newlyAddedEvents[index][which];
        event[which] = !event[which];
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.format = 'MMM d, y H:mm';
    /**** time picker ****/
    $scope.hstep = 1;
    $scope.mstep = 15;
    $scope.ismeridian = false;

    /********/
    /* config object */
    $scope.uiConfig = {
        calendar:{
            editable: true,
            eventLimit: 4,
            timezone: 'local',
            timeFormat: 'H:mm', // uppercase H for 24-hour clock
            firstDay: 1,
            header:{
                left: 'prevYear, prev',
                center: 'title',
                right: 'today, next, nextYear'
            },
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender,
            lang: $rootScope.lang
        }
    };
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.eventSource = {
        url: "www.google.com/calendar/en.finnish#holiday@group.v.calendar.google.com",
        className: 'gcal-event'           // an option
    };

    $scope.eventsDB = eventService.query();
    eventService.query().$promise.then(function (doc) {});

    $scope.calEventsExt = {
        color: '#f00',
        textColor: 'yellow',
        events: [
            {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false, editable: false},
            {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
            {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( event, jsEvent, view){
        //console.log(event, jsEvent, view);
    };
    /* alert on Drop */
    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
        //uiCalendarConfig.calendars['myCalendar'].fullCalendar('updateEvent', event);
        if (!event.isNewEvent) {
            delete event.source;
            event.$update().then(function(response) {
                if (response.success) {
                    console.log('event updated');
                } else {
                    console.log('event is not updated');
                }
            });
        };
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
        if (!event.isNewEvent) {
            delete event.source;
            event.$update();
        };
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
        var canAdd = 0;
        angular.forEach(sources,function(value, key){
            if(sources[key] === source){
                sources.splice(key,1);
                canAdd = 1;
            }
        });
        if(canAdd === 0){
            sources.push(source);
        }
    };
    /* add custom event*/
    $scope.addEvent = function() {
        var startTime = new Date();
        startTime.setMinutes(0);
        var endTime = new Date();
        endTime.setMinutes(0);
        endTime.setHours(startTime.getHours() + 1);
        var startDate = angular.copy(startTime);
        var endDate = angular.copy(endTime);
        /*start and end must be different, otherwise, end will be null*/
        $scope.newlyAddedEvents.push({
            title: 'New Event',
            start: moment(startDate),
            end: moment(endDate),
            className: ['newEvent'],
            startTime: startTime,
            endTime: endTime,
            startDate: startDate,
            endDate: endDate,
            isNewEvent: true,
            editable: false,
            allDay: false,
            isPublished: false,
            color: "#24C27A"
        });
    };
    /* remove event */
    $scope.remove = function(index) {
        $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view, calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };

    $scope.renderCalender = function(calendar) {
        if(uiCalendarConfig.calendars[calendar]){
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) {
        if (event.allDay) {
            var popupBody = '<div>All day</div>';
        } else {
            var start = event.start ? event.start.format('MMM DD, YYYY H:mm') : '';
            var end = event.end ? event.end.format('MMM DD, YYYY H:mm') : '';
            var popupBody =  '<div>Start: ' + start + '</div>'
                            +'<div>End:&nbsp; ' + end + '</div>';
        };
        var eventMenuHTML = '<div class="eventMenu">'
                        +'<ul>'
                        +    '<li class="editEventBtn" data-toggle="modal" data-target="#editEventModal"><i class="fa fa-pencil"></i></li>'
                        +    '<li class="deleteEvent"><i class="fa fa-trash"></i></li>'
                        +'</ul>'
                        +'</div>';

        /*element.attr({
            //'tooltip': event.title,
            'popover-title': event.title,
            'popover-html-unsafe': popupBody,
            'popover-placement' : 'left'
            //'popover-trigger' : "mouseenter"
        });*/
        //element.attr({'tooltip': event.title});
        if (identityService.isAuthorized('teacher')) {
            popupBody += eventMenuHTML;
        } else {
            event.editable = false;
        }

        /*this way is much much better than the popover-html-unsafe method
        * don't even need the directive*/
        element.popover({
            trigger:'click',
            animation: false,
            placement: 'top',
            title: event.title,
            html: true,
            content: popupBody
        });
        element.click(function(){
            element.siblings('.eventMenu').toggle('fast');
            //console.log(element.position());
            //console.log(element.siblings('.popover'));
            /*have to put these 2 function inside click event because they only work
            * when the popover is rendered (by click event)
            * */
            element.siblings('.popover').on('click', '.deleteEvent', function() {
                if (!event.isNewEvent) {
                    delete event.source;
                    event.$remove({_id: event._id});
                    uiCalendarConfig.calendars['myCalendar'].fullCalendar('removeEvents', event._id);
                }
            });

            element.siblings('.popover').find('.editEventBtn').click(function () {
                $scope.editEvent(event);
            });
        });

        $compile(element)($scope);
    };

    $scope.editEvent = function(event) {
        var edit = angular.copy(event);
        delete edit.source;
        $scope.$apply(function() {
            $scope.editingEvent = angular.copy(edit);

            if (!$scope.editingEvent.allDay) {
                $scope.editingEvent.startDate = new Date($scope.editingEvent.start.format());
                $scope.editingEvent.startTime = new Date($scope.editingEvent.start.format());
                $scope.editingEvent.endDate = new Date($scope.editingEvent.end.format());
                $scope.editingEvent.endTime = new Date($scope.editingEvent.end.format());
            } else {
                var start = new Date($scope.editingEvent.start);
                start.setHours(0,0,0,0);

                if ($scope.editingEvent.end) {
                    end = new Date($scope.editingEvent.end);
                } else {
                    var end = new Date(start.getDate() + 1);
                }
                end.setHours(0,0,0,0);

                $scope.editingEvent.startDate = start;
                $scope.editingEvent.startTime = start;
                $scope.editingEvent.endDate = end;
                $scope.editingEvent.endTime = end;
            }

            //$scope.openModal();
            /*
            * changes made by this function to the newlyAddedEvents is only detected outside the div that specify the controller
            * in this case: <div class="calendarEvents" ng-controller="calendarController">
            * */
        });
    };
    $scope.deleteEvent = function (event) {
    };

    $scope.saveEvent = function (event, index) {
        var nativeEvent = uiCalendarConfig.calendars['myCalendar'].fullCalendar('clientEvents', event._id)[0];
        nativeEvent.editable = true;
        nativeEvent.isPublished = event.isPublished;

        delete nativeEvent.source;
        /*event.start = nativeEvent.start;
        event.end = nativeEvent.end;
        event.editable = true;*/

        var deferred = $q.defer();
        $http.post('/saveEvent', {data: nativeEvent}).then(function(response) {
            if (response.data.success) {
                $scope.newlyAddedEvents.splice(index,1);
                //$scope.editingEvent = {}; // very dangerous to do this, it doesn't keep the reference to the old object

                /*remove all  the events in eventsDB and push events from database to eventSouces
                * has problem when create more than 1 event*/
                $scope.eventsDB.splice(0, $scope.eventsDB.length);
                $scope.eventSources.splice(1, 1);
                eventService.query().$promise.then(function(doc) {
                    $scope.eventSources.push(doc);
                    uiCalendarConfig.calendars['myCalendar'].fullCalendar('removeEvents');
                    $scope.renderCalender('myCalendar');
                });
                /* doesn't work
                $scope.eventSources.push(response.data.event);
                $scope.renderCalender('myCalendar');*/
                toastr.success($filter('translate')('EVENT_SAVED_NOTI'));
                deferred.resolve(true);
            } else {
                toastr.error(response.reason);
                deferred.resolve(false);
            }
        })
    };

    $scope.cancelEvent = function (index) {
        $scope.newlyAddedEvents.splice(index, 1);
    };

    /* event sources array*/
    $scope.eventSources = [$scope.newlyAddedEvents, $scope.eventsDB];

    $scope.items = ['item1', 'item2', 'item3'];
    $scope.openModal = function (size) {
        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                items: function () {
                    return $scope.items;
                },
                editingEvent: function () {
                    return $scope.editingEvent;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
});

APP.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items, editingEvent) {

    $scope.items = items;
    $scope.editingEvent = editingEvent;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
