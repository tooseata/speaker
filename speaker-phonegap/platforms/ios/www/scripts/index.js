/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var gapApp = {
    // Application Constructor
    initialize: function() {
        console.log('initialize was called');
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        angular.element(document).ready(function () {
            angular.bootstrap(document);
        })

//        var apiKey = "39238222";
//
//        $.ajax({
//            url: 'http://10.0.1.29:3000/testPost',
//            type: 'GET',
//            success: function(data) {
//                var parsed = JSON.parse(data);
//                var sessionId = parsed.sessionId;
//                var token = parsed.token;
//               
//                // Enable console logs for debugging
//                TB.setLogLevel(TB.DEBUG);
//
//                // Initialize session, set up event listeners, and connect
//                var session = TB.initSession(sessionId);
//                session.addEventListener('sessionConnected', sessionConnectedHandler);
//                session.addEventListener('streamCreated', streamCreatedHandler);
//                session.connect(apiKey, token);
//                function sessionConnectedHandler(event) {
//                    var publisher = TB.initPublisher(apiKey);
//                    session.publish(publisher);
//                }
//            
//                function streamCreatedHandler(event) {
//
//                }
//            }
//        });
        
//        gapApp.receivedEvent('deviceready');
    }
    // Update DOM on a Received Event
//    receivedEvent: function(id) {
//        var parentElement = document.getElementById(id);
//        var listeningElement = parentElement.querySelector('.listening');
//        var receivedElement = parentElement.querySelector('.received');
//
//        listeningElement.setAttribute('style', 'display:none;');
//        receivedElement.setAttribute('style', 'display:block;');
//
//        console.log('Received Event: ' + id);
//    }
};

