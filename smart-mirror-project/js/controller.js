(function(angular) {
    'use strict';


    function MirrorCtrl(
            AnnyangService,
            GeolocationService,
            SubwayService,
            MapService,
            HueService,
            CalendarService,
            TimerService,
            BelongingService,
            WeatherService,
            $rootScope, $scope, $timeout, $interval, tmhDynamicLocale, $translate, $sce, $q) {
        var _this = this;
        $scope.listening = false;
        $scope.debug = false;
        $scope.focus = "default";
        $scope.user = {};
        $scope.commands = [];

        var promise = BelongingService.getCustomers();
        promise.then(function(rows){
            console.log("rows : ", rows);
            $scope.belonging = rows;
        })

        /*$translate('home.commands').then(function (translation) {
            $scope.interimResult = translation;
        });*/
        $scope.interimResult = $translate.instant('home.commands');
        $scope.layoutName = 'main';


        //set lang
        $scope.locale = config.language;
        tmhDynamicLocale.set(config.language.toLowerCase());
        moment.locale(config.language);
        console.log('moment local', moment.locale());
        
        //Update the time
        function updateTime(){
            $scope.date = new moment();
        }

        // Reset the command text
        var restCommand = function(){
            $translate('home.commands').then(function (translation) {
                $scope.interimResult = translation;
            });
        };

        _this.init = function() {
            var tick = $interval(updateTime, 1000);
            updateTime();
            GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                console.log("Geoposition", geoposition);
                $scope.map = $sce.trustAsResourceUrl(MapService.generateMap(geoposition.coords.latitude+','+geoposition.coords.longitude));
            });
            restCommand();




            var refreshMirrorData = function() {
                //Get our location and then get the weather for our location
                GeolocationService.getLocation({enableHighAccuracy: true}).then(function(geoposition){
                    console.log("Geoposition", geoposition);
                    WeatherService.init(geoposition).then(function(){
                        $scope.currentForcast = WeatherService.currentForcast();
                        $scope.weeklyForcast = WeatherService.weeklyForcast();
                        $scope.hourlyForcast = WeatherService.hourlyForcast();
                        console.log("Current", $scope.currentForcast);
                        console.log("Weekly", $scope.weeklyForcast);
                        console.log("Hourly", $scope.hourlyForcast);

                        var skycons = new Skycons({"color": "#aaa"});
                        skycons.add("icon_weather_current", $scope.currentForcast.iconAnimation);

                        skycons.play();

                        $scope.iconLoad = function (elementId, iconAnimation){
                            skycons.add(document.getElementById(elementId), iconAnimation);
                            skycons.play();
                        };

                    });
                }, function(error){
                    console.log(error);
                });

                CalendarService.getCalendarEvents().then(function(response) {
                    $scope.calendar = CalendarService.getFutureEvents();
                }, function(error) {
                    console.log(error);
                });


            };

            refreshMirrorData();
            $interval(refreshMirrorData, 1500000);

            var greetingUpdater = function () {
                if(!Array.isArray(config.greeting) && typeof config.greeting.midday != 'undefined') {
                    var hour = moment().hour();
                    var geetingTime = "midday";

                    if (hour > 4 && hour < 11) {
                        geetingTime = "morning";
                    } else if (hour > 18 && hour < 23) {
                        geetingTime = "evening";
                    } else if (hour >= 23 || hour < 4) {
                        geetingTime = "night";
                    }

                    $scope.greeting = config.greeting[geetingTime][Math.floor(Math.random() * config.greeting.morning.length)];
                }else if(Array.isArray(config.greeting)){
                    $scope.greeting = config.greeting[Math.floor(Math.random() * config.greeting.length)];
                }
            };
            greetingUpdater();
            $interval(greetingUpdater, 120000);


            var defaultView = function() {
                console.debug("Ok, going to default view...");
                $scope.focus = "default";
            }

            var addCommand = function(commandId, commandFunction){
                var voiceId = 'commands.'+commandId+'.voice';
                var textId = 'commands.'+commandId+'.text';
                var descId = 'commands.'+commandId+'.description';
                $translate([voiceId, textId, descId]).then(function (translations) {
                    AnnyangService.addCommand(translations[voiceId], commandFunction);
                    if (translations[textId] != '') {
                        var command = {"text": translations[textId], "description": translations[descId]};
                        $scope.commands.push(command);
                    }
                });
            };


            /** Subway */
                // 지하철 도착 정보
            var subwayFunction = function(station,linenumber,updown) {
                SubwayService.init(station).then(function(){
                    SubwayService.getArriveTime(linenumber,updown).then(function(data){
                        if(data != null){
                            $scope.subwayinfo1 = data[1].ARRIVETIME + "에 " + data[1].SUBWAYNAME + "행 열차";
                            $scope.subwayinfo2 = data[2].ARRIVETIME + "에 " + data[2].SUBWAYNAME + "행 열차";
                            $scope.subwayinfo3 = data[3].ARRIVETIME + "에 " + data[3].SUBWAYNAME + "행 열차";
                            $scope.subwayinfo4 = data[4].ARRIVETIME + "에 " + data[4].SUBWAYNAME + "행 열차";

                        }else{
                            $scope.subwayinfo = "운행하는 열차가 존재 하지 않습니다.";
                        }
                    });
                });
            };


            addCommand('subway', subwayFunction);

            addCommand("close",function(){
                self.close();
            });

            // List commands
            addCommand('list', function() {
                console.debug("Here is a list of commands...");
                //console.log(AnnyangService.commands);
                $scope.focus = "commands";
            });

            
            // Go back to default view
            addCommand('home', defaultView);

            // Hide everything and "sleep"
            addCommand('sleep', function() {
                console.debug("Ok, going to sleep...");
                $scope.focus = "sleep";
            });

            // Go back to default view
            addCommand('wake_up', defaultView);



            // Check the time
            addCommand('time_show', function(task) {
                 console.debug("It is", moment().format('h:mm:ss a'));
            });


            // calendar show
            addCommand('calendar_show',function(){
                if($scope.focus != "calendar"){
                    $scope.focus = "calendar";
                }else{
                    $scope.focus = "default";
                }
            });


            var resetCommandTimeout;
            //Track when the Annyang is listening to us
            AnnyangService.start(function(listening){
                $scope.listening = listening;
            }, function(interimResult){
                $scope.interimResult = interimResult;
                $timeout.cancel(resetCommandTimeout);
            }, function(result){
                if(typeof result != 'undefined'){
                    $scope.interimResult = result[0];
                    resetCommandTimeout = $timeout(restCommand, 5000);
                }
            }, function(error){
                console.log(error);
                if(error.error == "network"){
                    $scope.speechError = "Google Speech Recognizer is down :(";
                    AnnyangService.abort();
                }
            });

            $scope.subway = function(){
                if($scope.focus != "subway"){
                    subwayFunction(2,'2',"상행성");
                    $scope.focus = "subway";
                }else{
                    $scope.focus = "default";
                }
            }

            $scope.weather = function(){
                if($scope.focus != "weather"){
                    $scope.focus = "weather";
                }else{
                    $scope.focus = "default";
                }
            }


            $scope.showCalendar = function(){
                if($scope.focus != "calendar"){
                    $scope.focus = "calendar";
                }else{
                    $scope.focus = "default";
                }
            }


        };

        _this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);

    function themeController($scope) {
        $scope.layoutName = (typeof config.layout != 'undefined' && config.layout)?config.layout:'main';
    }

    angular.module('SmartMirror')
        .controller('Theme', themeController);

}(window.angular));
