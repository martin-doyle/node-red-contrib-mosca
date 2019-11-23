var should = require("should");
var helper = require('node-red-node-test-helper');
var moscaNode = require('../mosca.js');
// Node-Red Version 0.20
//var mqttNode = require('../node_modules/@node-red/nodes/core/io/10-mqtt.js');
// Node-Red Version 1.0
var mqttNode = require('../node_modules/node-red/node_modules/@node-red/nodes/core/network/10-mqtt.js');

helper.init(require.resolve('node-red'));

describe('MQTT Broker Node', function () {
    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{
            id: 'n1',
            type: 'mosca in',
            mqtt_port: '1883',
            mqtt_ws_port: '8080',
            name: 'Mosca 1883'
        }];
        helper.load(moscaNode, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'Mosca 1883');
            done();
        });
    });
    it('should connect an mqtt client', function (done) {
        this.timeout(10000); // have to wait for the inject with delay of two seconds

        helper.load([moscaNode, mqttNode], [
                {
                    id: 'n1',
                    type: 'mosca in',
                    mqtt_port: '1883',
                    mqtt_ws_port: '8080',
                    name: 'Mosca 1883',
                    wires: [
                        ['n2']
                    ]
                },
                {
                    id: 'n2',
                    type: 'helper'
                }, {
                    id: 'n3',
                    type: 'mqtt in',
                    name: 'Mosca 1883',
                    topic: 'test1883',
                    broker: 'b1'
                }, {
                    id: 'b1',
                    type: 'mqtt-broker',
                    name: 'Broker',
                    broker: 'localhost',
                    port: '1883'
                }
            ],
            function () {
                var n2 = helper.getNode('n2');
                n2.on('input', function (msg) {
                    msg.should.have.property('topic', 'clientConnected');
                    done();
                });
            });
    });
    it('should connect 2 mqtt clients on 2 servers', function (done) {
        this.timeout(10000); // have to wait for the inject with delay of two seconds

        helper.load([moscaNode, mqttNode], [
                {
                    id: 'n1',
                    type: 'mosca in',
                    mqtt_port: '1883',
                    mqtt_ws_port: '8080',
                    name: 'Mosca 1883',
                    wires: [
                        ['n2']
                    ]
                },
                {
                    id: 'n2',
                    type: 'helper'
                }, {
                    id: 'n3',
                    type: 'mqtt in',
                    name: 'Mosca 1883',
                    topic: 'test1883',
                    broker: 'b1'
                }, {
                    id: 'b1',
                    type: 'mqtt-broker',
                    name: 'Broker',
                    broker: 'localhost',
                    port: '1883'
                }, {
                    id: 'n11',
                    type: 'mosca in',
                    mqtt_port: '1884',
                    mqtt_ws_port: '8081',
                    name: 'Mosca 1884',
                    wires: [
                        ['n12']
                    ]
                }, {
                    id: 'n12',
                    type: 'helper'
                }, {
                    id: 'n13',
                    type: 'mqtt in',
                    name: 'Mosca 1884',
                    topic: 'test1884',
                    broker: 'b11'
                }, {
                    id: 'b11',
                    type: 'mqtt-broker',
                    name: 'Broker',
                    broker: 'localhost',
                    port: '1884'
                }
            ],
            function () {
                var i = 0;
                var n2 = helper.getNode('n2');
                n2.on('input', function (msg) {
                    msg.should.have.property('topic', 'clientConnected');
                    i++;
                    if (i === 2) {
                        done();
                    }
                });
                var n12 = helper.getNode('n12');
                n12.on('input', function (msg) {
                    msg.should.have.property('topic', 'clientConnected');
                    i++;
                    if (i === 2) {
                        done();
                    }
                });
            });
    });
    it('should not throw an exception with 2 servers on the same mqtt port', function (done) {
        this.timeout(10000); // have to wait for the inject with delay of two seconds

        helper.load([moscaNode, mqttNode], [
                {
                    id: 'n1',
                    type: 'mosca in',
                    mqtt_port: '1883',
                    mqtt_ws_port: '8080',
                    name: 'Mosca 1883'
                }, {
                    id: 'n11',
                    type: 'mosca in',
                    mqtt_port: '1883',
                    mqtt_ws_port: '8081',
                    name: 'Mosca 1883 2'
                }
            ],
            function () {
                var n1 = helper.getNode('n1');
                n1.should.have.property('name', 'Mosca 1883');
                var n11 = helper.getNode('n11');
                n11.should.have.property('name', 'Mosca 1883 2');
                done();
            });
    });
    it('should not throw an exception with 2 servers on the same ws port', function (done) {
        this.timeout(10000); // have to wait for the inject with delay of two seconds

        helper.load([moscaNode, mqttNode], [
                {
                    id: 'n1',
                    type: 'mosca in',
                    mqtt_port: '1883',
                    name: 'Mosca 1883',
                    mqtt_ws_port: '8080'
                }, {
                    id: 'n11',
                    type: 'mosca in',
                    mqtt_port: '1884',
                    name: 'Mosca 1884',
                    mqtt_ws_port: '8080'
                }
            ],
            function () {
                var n1 = helper.getNode('n1');
                n1.should.have.property('name', 'Mosca 1883');
                var n11 = helper.getNode('n11');
                n11.should.have.property('name', 'Mosca 1884');
                done();
            });
    });
});
