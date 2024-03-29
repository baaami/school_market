"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFileName = exports.imageFileFilter = void 0;
const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return callback(new Error("Only image files are allowed!"), false);
    }
    callback(null, true);
};
exports.imageFileFilter = imageFileFilter;
const editFileName = (req, file, callback) => {
    const name = file.originalname.split(".")[0];
    const fileExtName = file.originalname.slice(file.originalname.lastIndexOf(".") - 1 + 2);
    const time = Date.now();
    const randomName = `${name}-${time}`;
    callback(null, `${randomName}.${fileExtName}`);
};
exports.editFileName = editFileName;
//# sourceMappingURL=multerOption.js.map