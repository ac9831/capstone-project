(function(annyang) {
    'use strict';

    function BelongingService($q){

        var mysql = require('mysql');

        var connection = mysql.createConnection({
            host    :'localhost',
            port : 3306,
            user : 'mirror',
            password : 'mirror1234',
            database:'mirror'
        });

        var service = {};

        service.getCustomers = function() {
            var deferred = $q.defer();
            var query = "SELECT * FROM belonging";
            connection.query(query, function (err, rows) {
                if (err) deferred.reject(err);
                deferred.resolve(rows);
            });
            return deferred.promise;
        }

        return service;

    }

    angular.module('SmartMirror')
        .factory('BelongingService', BelongingService);


}(window.annyang));