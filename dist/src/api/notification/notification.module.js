"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("./entity/notification.entity");
const user_service_1 = require("../user/user.service");
const user_entity_1 = require("../user/entities/user.entity");
const profileimage_entity_1 = require("../../common/entities/profileimage.entity");
const auth_shared_service_1 = require("../auth/auth.shared.service");
const notification_controller_1 = require("./notification.controller");
let NotificationModule = class NotificationModule {
};
NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notificaitions, user_entity_1.Users, profileimage_entity_1.ProfileImages])],
        controllers: [notification_controller_1.NotificationController],
        providers: [notification_service_1.NotificationService, user_service_1.UserService, auth_shared_service_1.AuthSharedService],
        exports: [notification_service_1.NotificationService],
    })
], NotificationModule);
exports.NotificationModule = NotificationModule;
//# sourceMappingURL=notification.module.js.map