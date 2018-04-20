"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createSagas;

var _effects = require("redux-saga/effects");

/*
	Syntactic sugar for easily accessing sagas
*/
function createSagas(saga_list) {
  var arr = [];
  var GeneratorFunction = Object.getPrototypeOf( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })).constructor;
  var saga_keys = Object.keys(saga_list);
  saga_keys.forEach(function (key) {
    var action = key.split(".")[0];
    var worker_saga = saga_list[key];
    var mode = key.split(".")[1] || "latest";
    var watcher = null;
    if (mode == "latest") {
      watcher = /*#__PURE__*/regeneratorRuntime.mark(function watcher() {
        return regeneratorRuntime.wrap(function watcher$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _effects.takeLatest)(action, worker_saga);

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, watcher, this);
      });
    } else if (mode == "every") {
      watcher = /*#__PURE__*/regeneratorRuntime.mark(function watcher() {
        return regeneratorRuntime.wrap(function watcher$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _effects.takeEvery)(action, worker_saga);

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, watcher, this);
      });
    }
    arr.push(watcher());
  });
  return arr;
};