"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.State = State;
exports.mountAt = mountAt;
exports.buildUiRouterState = buildUiRouterState;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _utils = require("./utils");

var _Controller = require("./Controller");

var DEFAULT_SUFFIX = "Controller";

/*
@param {Object}  opts - The options
@param {string}  [opts.name] - The name of the state.
@param {string}  [opts.bindTo] - Bind the controller to the provided name.
@param {string}  [opts.url] - The url of the state.
@param {Boolean} [opts.abstract] - True for abstract states.
@param {string}  [opts.template] - An angular template.
@param {string}  [opts.templateUrl] - A URL to an angular template.
@param {State[]} [opts.children] - List of child states.
@param {string}  [opts.controllerName] - The name of the controller as seen by angular.
*/

function State(opts) {
  if (typeof opts === "function") {
    var _constructor = opts;opts = null;
    return register(_constructor);
  }

  opts = opts || {};

  return register;

  function register(constructor) {
    registerLock(constructor);
    (0, _Controller.Controller)(constructor, { name: opts.controllerName });

    var meta = stateMeta(constructor);
    var superMeta = stateMeta(meta.superClass) || { state: {} };

    var prototype = constructor.prototype;
    if (prototype.activate) {
      State.onActivate(prototype, "activate", { value: prototype.activate });
    }
    if (prototype.attach) {
      State.onAttach(prototype, "attach", { value: prototype.attach });
    }
    if (prototype.detach) {
      State.onDetach(prototype, "detach", { value: prototype.detach });
    }

    if (superMeta.state.callbacks) {
      meta.state.callbacks.onActivate = superMeta.state.callbacks.onActivate.concat(meta.state.callbacks.onActivate);
      meta.state.callbacks.onAttach = superMeta.state.callbacks.onAttach.concat(meta.state.callbacks.onAttach);
      meta.state.callbacks.onDetach = superMeta.state.callbacks.onDetach.concat(meta.state.callbacks.onDetach);
    }

    if (opts.children === false) {
      meta.state.children = null;
    } else if (opts.children) {
      meta.state.children = opts.children;
    } else if (superMeta.state.children) {
      meta.state.children = superMeta.state.children;
    }
    if (!meta.state.children) {
      meta.state.children = [];
    }

    var inheritedTemplated = false;
    if (opts.template === false) {
      meta.state.template = null;
    } else if (opts.template) {
      meta.state.template = opts.template;
    } else if (opts.templateUrl) {
      meta.state.templateUrl = opts.templateUrl;
    } else if (superMeta.state.template) {
      inheritedTemplated = true;
      meta.state.template = superMeta.state.template;
    } else if (superMeta.state.templateUrl) {
      inheritedTemplated = true;
      meta.state.templateUrl = superMeta.state.templateUrl;
    }
    if (!meta.state.template && !meta.state.templateUrl) {
      if (meta.state.children.length > 0) {
        meta.state.template = "<ui-view></ui-view>";
      } else {
        meta.state.template = "";
      }
    }

    if (opts.name) {
      meta.state.name = opts.name;
    } else {
      var _name = meta.name;
      _name = _name[0].toLowerCase() + _name.substr(1, _name.length - DEFAULT_SUFFIX.length - 1);
      meta.state.name = _name;
    }

    if (opts.bindTo) {
      if (inheritedTemplated) {
        throw Error("bindTo cannot be used with inherited templates");
      }
      meta.state.bindTo = opts.bindTo;
    } else {
      if (inheritedTemplated) {
        meta.state.bindTo = superMeta.state.bindTo;
      } else {
        meta.state.bindTo = meta.state.name;
      }
    }

    if (opts.url === false) {
      if (opts.url) {
        meta.state.url = opts.url;
      } else if (superMeta.state.url) {
        meta.state.url = superMeta.state.url;
      }
    }

    if (opts.abstract === undefined) {
      meta.state.abstract = superMeta.state.abstract;
    } else if (opts.abstract === true) {
      meta.state.abstract = true;
    } else if (opts.abstract === false) {
      meta.state.abstract = false;
    }
  }
}

function stateMeta(constructor) {
  if (!constructor) {
    return null;
  }

  var meta = (0, _utils.funcMeta)(constructor);

  if (meta.state) {
    return meta;
  }

  meta.state = {
    callbacks: {
      onActivate: [],
      onAttach: [],
      onDetach: []
    }
  };

  return meta;
}

function registerLock(constructor) {
  var meta = stateMeta(constructor);

  if (meta.state.registered) {
    throw "@State() can only be used once!";
  }

  meta.state.registered = true;
}

State.onActivate = function onActivate(target, name, desc) {
  if (typeof desc.value !== "function") {
    throw "@State.onActivate expects a function target";
  }

  var meta = stateMeta(target.constructor);
  meta.state.callbacks.onActivate.push(desc.value);
};

State.onAttach = function onAttach(target, name, desc) {
  if (typeof desc.value !== "function") {
    throw "@State.onAttach expects a function target";
  }

  var meta = stateMeta(target.constructor);
  meta.state.callbacks.onAttach.push(desc.value);
};

State.onDetach = function onDetach(target, name, desc) {
  if (typeof desc.value !== "function") {
    throw "@State.onDetach expects a function target";
  }

  var meta = stateMeta(target.constructor);
  meta.state.callbacks.onDetach.push(desc.value);
};

function mountAt(url) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var name = opts.name;

  return {
    state: this,
    url: url,
    name: name,
    buildUiRouterState: builder
  };

  function builder() {
    var state = buildUiRouterState(this.state);

    if (this.url) {
      state.url = url;
    }

    if (this.name) {
      state.name = name;
    }

    return state;
  }
}

function buildUiRouterState(obj) {
  console.log("buildUiRouterState: %o", obj);
  if (!obj) {
    return null;
  }

  if (obj.buildUiRouterState) {
    var _state = obj.buildUiRouterState();
    console.log("State: => %o", _state);
    return _state;
  }

  var meta = (0, _utils.funcMeta)(obj);
  if (!meta.state) {
    throw Error("provided object is not a state");
  }

  var children = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = meta.state.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var child = _step.value;

      children.push(buildUiRouterState(child));
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"]) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var state = {
    name: meta.state.name,
    template: meta.state.template,
    templateUrl: meta.state.templateUrl,
    controllerAs: meta.state.bindTo,
    url: meta.state.url,
    abstract: meta.state.abstract,
    children: children,
    controller: [meta.state.name, "$locals", "$injector", "$scope", controllerAttacher],
    resolve: _defineProperty({}, meta.state.name, ["$q", "$controller", "$locals", "$injector", controllerProvider])
  };

  console.log("State: => %o", state);
  return state;

  function controllerAttacher(ctrl, $locals, $injector, $scope) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = meta.callbacks.onAttach[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var clb = _step2.value;

        $injector.invoke(clb, ctrl, $locals);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    $scope.$on("$destroy", function () {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = meta.callbacks.onDetach[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var clb = _step3.value;

          $injector.invoke(clb, ctrl, $locals);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    });

    return ctrl;
  }

  function controllerProvider($q, $controller, $locals, $injector) {
    var ctrl = $controller(meta.controller.name, $locals);
    var p = $q.when(ctrl);

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      var _loop = function () {
        var clb = _step4.value;

        p = p.then(function () {
          return $injector.invoke(clb, ctrl, $locals);
        });
      };

      for (var _iterator4 = meta.callbacks.onActivate[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
          _iterator4["return"]();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    p = p.then(function () {
      return ctrl;
    });
    return p;
  }
}
//# sourceMappingURL=State.js.map