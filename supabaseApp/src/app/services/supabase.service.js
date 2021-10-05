"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
exports.SupabaseService = exports.FILE_DB = void 0;
var core_1 = require("@angular/core");
var supabase_js_1 = require("@supabase/supabase-js");
var rxjs_1 = require("rxjs");
var environment_1 = require("src/environments/environment");
var core_2 = require("@capacitor/core");
var FileSystem = core_2.Plugins.FileSystem;
exports.FILE_DB = 'files';
var SupabaseService = /** @class */ (function () {
    function SupabaseService(router, sanitizer) {
        var _this = this;
        this.router = router;
        this.sanitizer = sanitizer;
        this.privateFiles = new rxjs_1.BehaviorSubject([]);
        this.publicFiles = new rxjs_1.BehaviorSubject([]);
        this.currentUser = new rxjs_1.BehaviorSubject(null);
        this.supabase = (0, supabase_js_1.createClient)(environment_1.environment.supabaseUrl, environment_1.environment.supabaseKey, {
            autoRefreshToken: true,
            persistSession: true
        });
        //Load user from storage
        this.loadUser();
        //Also listen to all auth changes
        this.supabase.auth.onAuthStateChange(function (event, session) {
            console.log('AUTH CHANGED: ', event);
            if (event == 'SIGNED_IN') {
                _this.currentUser.next(session.user);
                _this.loadFiles();
                _this.handleDbChanged();
            }
            else {
                _this.currentUser.next(false);
            }
        });
    }
    SupabaseService.prototype.loadUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase.auth.user()];
                    case 1:
                        user = _a.sent();
                        if (user) {
                            this.currentUser.next(user);
                            this.loadFiles();
                            this.handleDbChanged();
                        }
                        else {
                            this.currentUser.next(false);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SupabaseService.prototype.getCurrentUser = function () {
        return this.currentUser.asObservable();
    };
    SupabaseService.prototype.signUp = function (credentials) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, error, data;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, this.supabase.auth.signUp(credentials)];
                                case 1:
                                    _a = _b.sent(), error = _a.error, data = _a.data;
                                    if (error) {
                                        reject(error);
                                    }
                                    else {
                                        resolve(data);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    SupabaseService.prototype.signIn = function (credentials) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _a, error, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase.auth.signIn(credentials)];
                    case 1:
                        _a = _b.sent(), error = _a.error, data = _a.data;
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(data);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    SupabaseService.prototype.signOut = function () {
        var _this = this;
        this.supabase.auth.signOut().then(function (_) {
            _this.publicFiles.next([]);
            _this.privateFiles.next([]);
            //Clear up and end all active subscriptions
            _this.supabase.getSubscriptions().map(function (sub) {
                _this.supabase.removeSubscription(sub);
            });
            _this.router.navigateByUrl('/');
        });
    };
    SupabaseService.prototype.loadFiles = function () {
        //TODO: Later
    };
    SupabaseService.prototype.handleDbChanged = function () {
        //TODO: Later
    };
    SupabaseService = __decorate([
        (0, core_1.Injectable)({
            providedIn: 'root'
        })
    ], SupabaseService);
    return SupabaseService;
}());
exports.SupabaseService = SupabaseService;
