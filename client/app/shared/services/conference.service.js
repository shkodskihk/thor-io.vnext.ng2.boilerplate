"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var thor_io_connection_provider_1 = require('../../providers/thor-io.connection.provider');
var models_1 = require('../../../../shared/models');
var platform_browser_1 = require('@angular/platform-browser');
var ConferenceService = (function () {
    function ConferenceService(connProvider, sanitizer) {
        var _this = this;
        this.connProvider = connProvider;
        this.sanitizer = sanitizer;
        this.proxy = connProvider.getProxy("broker");
        this.RemoteStreams = new Array();
        this.InstantMessages = new Array();
        var config = {
            iceTransports: 'all',
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]
        };
        // add your own STUN / turn servers ..
        this.rtc = new ThorIO.Client.WebRTC(this.proxy, config);
        this.rtc.onRemoteStream = function (stream) {
            var safeUrl = sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(stream));
            var participant = new models_1.Participant(stream, safeUrl, stream.id);
            _this.onParticipant(participant);
            _this.RemoteStreams.push(participant);
        };
        this.rtc.onRemoteStreamlost = function (streamId, peerId) {
            var remoteStream = _this.findMediaStream(streamId);
            _this.RemoteStreams.splice(_this.RemoteStreams.indexOf(remoteStream), 1);
        };
        this.rtc.onContextChanged = function (context) {
            _this.context = context;
            _this.rtc.connectContext();
        };
        this.rtc.onConnectTo = function (peers) {
            _this.rtc.connect(peers);
        };
        this.rtc.onContextCreated = function (p) {
            // do op 
        };
        this.proxy.On("instantMessage", function (message) {
            _this.InstantMessages.unshift(message);
        });
    }
    ConferenceService.prototype.onParticipant = function (participant) {
    };
    ConferenceService.prototype.joinConference = function (context) {
        this.proxy.Invoke("changeContext", { context: context });
    };
    ConferenceService.prototype.findMediaStream = function (streamId) {
        var match = this.RemoteStreams.find(function (pre) {
            return pre.id === streamId;
        });
        return match;
    };
    ConferenceService.prototype.addLocalMediaStream = function (stream) {
        this.rtc.addLocalStream(stream);
    };
    ;
    ConferenceService.prototype.connectContext = function (context) {
        this.proxy.Invoke("connectContext", { context: context });
    };
    ConferenceService.prototype.sendInstantMessage = function (instantMessage) {
        this.proxy.Invoke("instantMessage", instantMessage);
    };
    ConferenceService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [thor_io_connection_provider_1.ConnectionProvider, platform_browser_1.DomSanitizationService])
    ], ConferenceService);
    return ConferenceService;
}());
exports.ConferenceService = ConferenceService;
//# sourceMappingURL=conference.service.js.map