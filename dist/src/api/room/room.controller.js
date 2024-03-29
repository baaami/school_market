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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("../../events/chat/chat.service");
let RoomController = class RoomController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getList(userId) {
        return this.chatService.getJoinedRoomList(userId);
    }
    async getRoom(roomId) {
        return this.chatService.getRoomInfo(roomId);
    }
};
__decorate([
    (0, common_1.Get)("/list/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)("/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "getRoom", null);
RoomController = __decorate([
    (0, common_1.Controller)("room"),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], RoomController);
exports.RoomController = RoomController;
//# sourceMappingURL=room.controller.js.map