"use server";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var redis_1 = require("@upstash/redis");
require("dotenv/config");
var client_1 = require("@prisma/client");
var redis = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
var STREAM_KEY = "patient_events";
var DLQ_KEY = "patient_events:dlq";
var prisma = new client_1.PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL_DIRECT } },
});
function startWorker() {
    return __awaiter(this, void 0, void 0, function () {
        var lastId, rawRes, _i, _a, streamArr, messagesRaw, messages, _b, messages_1, message, id, fields, eventId, retries, createdataID, createPatientId, createPatient, createdata, err_1, err_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("🚀 Worker started, polling for events...");
                    lastId = "0";
                    _c.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 28];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 25, , 27]);
                    return [4 /*yield*/, redis.xread([STREAM_KEY], [lastId], { count: 1 })];
                case 3:
                    rawRes = _c.sent();
                    if (!!rawRes) return [3 /*break*/, 5];
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 5000); })];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 1];
                case 5:
                    _i = 0, _a = rawRes;
                    _c.label = 6;
                case 6:
                    if (!(_i < _a.length)) return [3 /*break*/, 24];
                    streamArr = _a[_i];
                    messagesRaw = streamArr[1];
                    messages = messagesRaw.map(function (_a) {
                        var id = _a[0], fieldsArray = _a[1];
                        var message = {};
                        for (var i = 0; i < fieldsArray.length; i += 2) {
                            message[fieldsArray[i]] = fieldsArray[i + 1];
                        }
                        return { id: id, message: message };
                    });
                    _b = 0, messages_1 = messages;
                    _c.label = 7;
                case 7:
                    if (!(_b < messages_1.length)) return [3 /*break*/, 23];
                    message = messages_1[_b];
                    id = message.id;
                    fields = message.message;
                    console.log("📥 Received:", id, fields);
                    eventId = fields.event_id;
                    if (!eventId) {
                        console.warn("⚠️ Missing event_id, skipping", id);
                        lastId = id; // still advance so we don’t block forever
                        return [3 /*break*/, 22];
                    }
                    retries = parseInt(fields.retries || "0");
                    createdataID = "";
                    createPatientId = "";
                    _c.label = 8;
                case 8:
                    _c.trys.push([8, 13, , 22]);
                    return [4 /*yield*/, prisma.patient.create({
                            data: {
                                age: fields.payload.age,
                                gender: fields.payload.gender,
                                number: fields.payload.mobile,
                                coordinatorId: fields.coordinatorId,
                                name: fields.payload.name,
                            },
                        })];
                case 9:
                    createPatient = _c.sent();
                    createPatientId = createPatient.id;
                    if (!createPatient.id) return [3 /*break*/, 11];
                    return [4 /*yield*/, prisma.questionaire.create({
                            data: {
                                alcohol: fields.payload.alcohol,
                                bmdScore: fields.payload.bmd_score,
                                copd: fields.payload.existing_medical_conditions.copd,
                                diabetes: fields.payload.existing_medical_conditions.diabetes,
                                diet: fields.payload.diet,
                                epilepsy: fields.payload.existing_medical_conditions.epilepsy,
                                height: fields.payload.height,
                                historyOfFractures: fields.payload.history_of_fractures,
                                hypertension: fields.payload.existing_medical_conditions.hypertension,
                                kneeOsteoarthritis: fields.payload.existing_medical_conditions
                                    .knee_osteoarthritis,
                                orthopaedicSurgeriesHistory: fields.payload.orthopaedic_surgeries,
                                smoking: fields.payload.smoking,
                                tobacco: fields.payload.tobacco_chewing,
                                weight: fields.payload.weight,
                                copdMedication: fields.payload.existing_medical_conditions
                                    .copd_regular_medicine,
                                epilepsyMedication: fields.payload.existing_medical_conditions
                                    .epilepsy_regular_medicine,
                                fractureAge: fields.payload.fracture_diagnosed,
                                Menopause: fields.payload.menopause,
                                patientId: createPatient.id,
                            },
                        })];
                case 10:
                    createdata = _c.sent();
                    createdataID = createdata.id;
                    _c.label = 11;
                case 11:
                    if (!createPatient) {
                        throw Error;
                    }
                    // const insertData = await prisma;
                    console.log("✅ Inserted into DB:", eventId);
                    // Remove from main stream on success
                    return [4 /*yield*/, redis.xdel(STREAM_KEY, id)];
                case 12:
                    // Remove from main stream on success
                    _c.sent();
                    // ✅ only update lastId after success
                    lastId = id;
                    return [3 /*break*/, 22];
                case 13:
                    err_1 = _c.sent();
                    console.error("❌ DB insert failed:", err_1.message);
                    if (!!createdataID) return [3 /*break*/, 15];
                    return [4 /*yield*/, prisma.patient.delete({
                            where: {
                                id: createPatientId,
                            },
                        })];
                case 14:
                    _c.sent();
                    console.log("id deleted successfully", createPatientId);
                    _c.label = 15;
                case 15:
                    if (!(retries < 4)) return [3 /*break*/, 18];
                    console.warn("\uD83D\uDD04 Retrying ".concat(eventId, ", attempt ").concat(retries + 1));
                    return [4 /*yield*/, redis.xadd(STREAM_KEY, "*", __assign(__assign({}, fields), { retries: (retries + 1).toString() }))];
                case 16:
                    _c.sent();
                    // Remove old copy
                    return [4 /*yield*/, redis.xdel(STREAM_KEY, id)];
                case 17:
                    // Remove old copy
                    _c.sent();
                    // ✅ advance lastId AFTER re-add
                    lastId = id;
                    return [3 /*break*/, 21];
                case 18:
                    console.error("⚠️ Dropping after 5 retries:", eventId);
                    return [4 /*yield*/, redis.xadd(DLQ_KEY, "*", __assign(__assign({}, fields), { original_id: id, failed_at: new Date().toISOString(), error: err_1.message || "unknown error" }))];
                case 19:
                    _c.sent();
                    return [4 /*yield*/, redis.xdel(STREAM_KEY, id)];
                case 20:
                    _c.sent();
                    // ✅ advance lastId AFTER moving to DLQ
                    lastId = id;
                    _c.label = 21;
                case 21: return [3 /*break*/, 22];
                case 22:
                    _b++;
                    return [3 /*break*/, 7];
                case 23:
                    _i++;
                    return [3 /*break*/, 6];
                case 24: return [3 /*break*/, 27];
                case 25:
                    err_2 = _c.sent();
                    console.error("❌ Worker error:", err_2.message);
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 2000); })];
                case 26:
                    _c.sent();
                    return [3 /*break*/, 27];
                case 27: return [3 /*break*/, 1];
                case 28: return [2 /*return*/];
            }
        });
    });
}
startWorker().catch(console.error);
