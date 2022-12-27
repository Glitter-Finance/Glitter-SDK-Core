"use strict";
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
exports.__esModule = true;
var glitter_bridge_sdk_1 = require("glitter-bridge-sdk");
var path = require('path');
var util = require('util');
var fs = require('fs');
var Sleep = require('glitter-bridge-common').Sleep;
var resolve = require('path').resolve;
var connect_1 = require("../connect");
run();
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runMain()];
                case 1:
                    result = _a.sent();
                    console.log(result);
                    return [2 /*return*/];
            }
        });
    });
}
function runMain() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var sdk, algorandAccounts, solanaAccounts, algorand, solana, algorandAccount, solanaAccount, algorandBalance, solanaBalance, startingBalance, SolanaConf, solanaConnect, err_1;
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    return __generator(this, function (_k) {
                        switch (_k.label) {
                            case 0:
                                _k.trys.push([0, 15, , 16]);
                                sdk = new glitter_bridge_sdk_1.GlitterBridgeSDK()
                                    .setEnvironment(glitter_bridge_sdk_1.GlitterNetworks.testnet)
                                    .connect([glitter_bridge_sdk_1.BridgeNetworks.algorand, glitter_bridge_sdk_1.BridgeNetworks.solana]);
                                algorandAccounts = (_a = sdk.algorand) === null || _a === void 0 ? void 0 : _a.accounts;
                                solanaAccounts = (_b = sdk.solana) === null || _b === void 0 ? void 0 : _b.accounts;
                                algorand = sdk.algorand;
                                solana = sdk.solana;
                                if (!algorandAccounts)
                                    throw new Error("Algorand Accounts not loaded");
                                if (!solanaAccounts)
                                    throw new Error("Solana Accounts not loaded");
                                if (!algorand)
                                    throw new Error("Algorand not loaded");
                                if (!solana)
                                    throw new Error("Solana not loaded");
                                //load/create new algorand account
                                console.log();
                                console.log("==== Loading/Creating New Algorand Account ============");
                                return [4 /*yield*/, getAlgorandAccount(algorandAccounts)];
                            case 1:
                                algorandAccount = _k.sent();
                                console.log("Algorand Account: ".concat(algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr));
                                //load Create new solana account
                                console.log();
                                console.log("==== Creating New Solana Account ============");
                                return [4 /*yield*/, getSolanaAccount(solanaAccounts)];
                            case 2:
                                solanaAccount = _k.sent();
                                console.log("Solana Account: ".concat(solanaAccount.addr));
                                //fund Algorand account
                                console.log();
                                console.log("==== Funding Algorand Account  ============");
                                console.log("Here is the address of your account.  Click on the link to fund it with **6** or more testnet tokens.");
                                console.log("https://testnet.algoexplorer.io/address/".concat(algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr));
                                console.log();
                                console.log("Dispenser");
                                console.log("https://testnet.algoexplorer.io/dispenser}");
                                console.log();
                                console.log("Address: ".concat(algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr));
                                return [4 /*yield*/, algorand.waitForMinBalance((_c = algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr) !== null && _c !== void 0 ? _c : "", 6, 5 * 60)];
                            case 3:
                                _k.sent(); //You need to send 6 or more testnet algos to the account 
                                console.log();
                                return [4 /*yield*/, algorand.getBalance((_d = algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr) !== null && _d !== void 0 ? _d : "")];
                            case 4:
                                algorandBalance = _k.sent();
                                console.log("Algorand Balance: ".concat(algorandBalance));
                                //fund Solana account
                                console.log();
                                console.log("==== Funding Solana Account  ============");
                                console.log("Here is the address of your account.  Click on the link to fund it with **10** testnet tokens.");
                                console.log("https://explorer.solana.com/address/".concat(solanaAccount.addr, "?cluster=testnet"));
                                console.log();
                                console.log("Dispenser");
                                console.log("https://solfaucet.com/}");
                                console.log("Address: ".concat(solanaAccount.addr));
                                return [4 /*yield*/, solana.waitForMinBalance(solanaAccount.addr, 1, 5 * 60)];
                            case 5:
                                _k.sent(); //You need to send 1 or more testnet sol to the account 
                                console.log();
                                return [4 /*yield*/, solana.getBalance(solanaAccount.addr)];
                            case 6:
                                solanaBalance = _k.sent();
                                console.log("Solana Balance: ".concat(solanaBalance));
                                console.log();
                                console.log("====  Opting USDC To Algorand  ============");
                                return [4 /*yield*/, algorand.getBalance((_e = algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr) !== null && _e !== void 0 ? _e : "")];
                            case 7:
                                startingBalance = _k.sent();
                                return [4 /*yield*/, algorand.optinToken(algorandAccount, "USDC")];
                            case 8:
                                _k.sent();
                                return [4 /*yield*/, algorand.waitForBalanceChange((_f = algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr) !== null && _f !== void 0 ? _f : "", startingBalance)];
                            case 9:
                                _k.sent(); //Wait for balance to change
                                console.log();
                                console.log("Opted in to USDC");
                                //Opt in to USDC
                                console.log();
                                console.log("==== Opting Solana Account In to USDC ============");
                                return [4 /*yield*/, solana.getBalance(solanaAccount.addr)];
                            case 10:
                                startingBalance = _k.sent();
                                return [4 /*yield*/, solana.optinToken(solanaAccount, "USDC")];
                            case 11:
                                _k.sent();
                                // Solana to Algorand USDC
                                console.log();
                                console.log("====  Bridging xALGO to ALGO  ============");
                                return [4 /*yield*/, algorand.getBalance((_g = algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr) !== null && _g !== void 0 ? _g : "")];
                            case 12:
                                startingBalance = _k.sent();
                                SolanaConf = {
                                    name: "",
                                    server: "",
                                    programAddress: ""
                                };
                                solanaConnect = new connect_1.SolanaConnect(SolanaConf);
                                return [4 /*yield*/, solanaConnect.bridge(solanaAccount, "USDC", "algorand", (_h = algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr) !== null && _h !== void 0 ? _h : "", "USDC", 1)];
                            case 13:
                                _k.sent();
                                return [4 /*yield*/, algorand.waitForBalanceChange((_j = algorandAccount === null || algorandAccount === void 0 ? void 0 : algorandAccount.addr) !== null && _j !== void 0 ? _j : "", startingBalance, 90)];
                            case 14:
                                _k.sent();
                                console.log();
                                console.log("TRANSACTION COMPLETED");
                                resolve(true);
                                return [3 /*break*/, 16];
                            case 15:
                                err_1 = _k.sent();
                                reject(err_1);
                                return [3 /*break*/, 16];
                            case 16: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
function getAlgorandAccount(algorandAccounts) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // eslint-disable-next-line no-async-promise-executor
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var algoAccountFile, mnemonic_1, algoAccount, newAlgoAccount, mnemonic, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 4, , 5]);
                                algoAccountFile = path.join(__dirname, 'local/algoAccount.txt');
                                if (!fs.existsSync(algoAccountFile)) return [3 /*break*/, 2];
                                mnemonic_1 = fs.readFileSync(algoAccountFile, 'utf8');
                                if (!mnemonic_1) return [3 /*break*/, 2];
                                return [4 /*yield*/, algorandAccounts.add(mnemonic_1)];
                            case 1:
                                algoAccount = _a.sent();
                                resolve(algoAccount);
                                return [2 /*return*/];
                            case 2:
                                //Create new algorand account
                                console.log("Creating new Algorand Account");
                                return [4 /*yield*/, algorandAccounts.createNew()];
                            case 3:
                                newAlgoAccount = _a.sent();
                                console.log(util.inspect(newAlgoAccount, false, 5, true /* enable colors */));
                                mnemonic = algorandAccounts.getMnemonic(newAlgoAccount);
                                console.log("Algorand Mnemonic: " + mnemonic);
                                //Save algorand account to file
                                console.log("Saving Algorand Account to file " + algoAccountFile);
                                //Write account to file
                                fs.writeFile(algoAccountFile, mnemonic, 'utf8', function (err) {
                                    if (err) {
                                        console.log("An error occured while writing algorand Object to File.");
                                        return console.log(err);
                                    }
                                    console.log("algorand file has been saved.");
                                });
                                resolve(newAlgoAccount);
                                return [3 /*break*/, 5];
                            case 4:
                                error_1 = _a.sent();
                                reject(error_1);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
function getSolanaAccount(solanaAccounts) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // eslint-disable-next-line no-async-promise-executor
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var solanaAccountFile, mnemonic_2, solanaAccount, newSolanaAccount, mnemonic, error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 4, , 5]);
                                solanaAccountFile = path.join(__dirname, 'local/solanaAccount.txt');
                                if (!fs.existsSync(solanaAccountFile)) return [3 /*break*/, 2];
                                mnemonic_2 = fs.readFileSync(solanaAccountFile, 'utf8');
                                if (!mnemonic_2) return [3 /*break*/, 2];
                                return [4 /*yield*/, solanaAccounts.add(mnemonic_2)];
                            case 1:
                                solanaAccount = _a.sent();
                                resolve(solanaAccount);
                                return [2 /*return*/];
                            case 2:
                                //Create new solana account
                                console.log("Creating new Solana Account");
                                return [4 /*yield*/, solanaAccounts.createNew()];
                            case 3:
                                newSolanaAccount = _a.sent();
                                console.log(util.inspect(newSolanaAccount, false, 5, true /* enable colors */));
                                mnemonic = newSolanaAccount.mnemonic;
                                console.log("Solana Mnemonic: " + mnemonic);
                                //Save solana account to file
                                console.log("Saving Solana Account to file " + solanaAccountFile);
                                //Write account to file
                                fs.writeFile(solanaAccountFile, mnemonic, 'utf8', function (err) {
                                    if (err) {
                                        console.log("An error occured while writing solana Object to File.");
                                        return console.log(err);
                                    }
                                    console.log("Solana file has been saved.");
                                });
                                resolve(newSolanaAccount);
                                return [3 /*break*/, 5];
                            case 4:
                                error_2 = _a.sent();
                                reject(error_2);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
