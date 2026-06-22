var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x2, y2, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// _worker.js/index.js
import("node:buffer").then(({ Buffer: Buffer2 }) => {
  globalThis.Buffer = Buffer2;
}).catch(() => null);
var __ALSes_PROMISE__ = import("node:async_hooks").then(({ AsyncLocalStorage }) => {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
  const envAsyncLocalStorage = new AsyncLocalStorage();
  const requestContextAsyncLocalStorage = new AsyncLocalStorage();
  globalThis.process = {
    env: new Proxy(
      {},
      {
        ownKeys: /* @__PURE__ */ __name(() => Reflect.ownKeys(envAsyncLocalStorage.getStore()), "ownKeys"),
        getOwnPropertyDescriptor: /* @__PURE__ */ __name((_2, ...args) => Reflect.getOwnPropertyDescriptor(envAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
        get: /* @__PURE__ */ __name((_2, property) => Reflect.get(envAsyncLocalStorage.getStore(), property), "get"),
        set: /* @__PURE__ */ __name((_2, property, value) => Reflect.set(envAsyncLocalStorage.getStore(), property, value), "set")
      }
    )
  };
  globalThis[/* @__PURE__ */ Symbol.for("__cloudflare-request-context__")] = new Proxy(
    {},
    {
      ownKeys: /* @__PURE__ */ __name(() => Reflect.ownKeys(requestContextAsyncLocalStorage.getStore()), "ownKeys"),
      getOwnPropertyDescriptor: /* @__PURE__ */ __name((_2, ...args) => Reflect.getOwnPropertyDescriptor(requestContextAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
      get: /* @__PURE__ */ __name((_2, property) => Reflect.get(requestContextAsyncLocalStorage.getStore(), property), "get"),
      set: /* @__PURE__ */ __name((_2, property, value) => Reflect.set(requestContextAsyncLocalStorage.getStore(), property, value), "set")
    }
  );
  return { envAsyncLocalStorage, requestContextAsyncLocalStorage };
}).catch(() => null);
var se = Object.create;
var U = Object.defineProperty;
var ae = Object.getOwnPropertyDescriptor;
var ne = Object.getOwnPropertyNames;
var oe = Object.getPrototypeOf;
var ie = Object.prototype.hasOwnProperty;
var M = /* @__PURE__ */ __name((e, t) => () => (e && (t = e(e = 0)), t), "M");
var V = /* @__PURE__ */ __name((e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), "V");
var ce = /* @__PURE__ */ __name((e, t, s, r) => {
  if (t && typeof t == "object" || typeof t == "function") for (let n of ne(t)) !ie.call(e, n) && n !== s && U(e, n, { get: /* @__PURE__ */ __name(() => t[n], "get"), enumerable: !(r = ae(t, n)) || r.enumerable });
  return e;
}, "ce");
var $ = /* @__PURE__ */ __name((e, t, s) => (s = e != null ? se(oe(e)) : {}, ce(t || !e || !e.__esModule ? U(s, "default", { value: e, enumerable: true }) : s, e)), "$");
var y;
var u = M(() => {
  y = { collectedLocales: [] };
});
var _;
var d = M(() => {
  _ = { version: 3, routes: { none: [{ src: "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$", headers: { Location: "/$1" }, status: 308, continue: true }, { src: "^/_next/__private/trace$", dest: "/404", status: 404, continue: true }, { src: "^/404/?$", status: 404, continue: true, missing: [{ type: "header", key: "x-prerender-revalidate" }] }, { src: "^/500$", status: 500, continue: true }, { src: "^/?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/index.rsc", headers: { vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" }, continue: true, override: true }, { src: "^/((?!.+\\.rsc).+?)(?:/)?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/$1.rsc", headers: { vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" }, continue: true, override: true }], filesystem: [{ src: "^/index(\\.action|\\.rsc)$", dest: "/", continue: true }, { src: "^/_next/data/(.*)$", dest: "/_next/data/$1", check: true }, { src: "^/\\.prefetch\\.rsc$", dest: "/__index.prefetch.rsc", check: true }, { src: "^/(.+)/\\.prefetch\\.rsc$", dest: "/$1.prefetch.rsc", check: true }, { src: "^/\\.rsc$", dest: "/index.rsc", check: true }, { src: "^/(.+)/\\.rsc$", dest: "/$1.rsc", check: true }], miss: [{ src: "^/_next/static/.+$", status: 404, check: true, dest: "/_next/static/not-found.txt", headers: { "content-type": "text/plain; charset=utf-8" } }], rewrite: [{ src: "^/_next/data/(.*)$", dest: "/404", status: 404 }, { src: "^/api/proxy/(?<nxtPservice>[^/]+?)(?:/(?<nxtPpath>.+?))?(?:\\.rsc)(?:/)?$", dest: "/api/proxy/[service]/[[...path]].rsc?nxtPservice=$nxtPservice&nxtPpath=$nxtPpath" }, { src: "^/api/proxy/(?<nxtPservice>[^/]+?)(?:/(?<nxtPpath>.+?))?(?:/)?$", dest: "/api/proxy/[service]/[[...path]]?nxtPservice=$nxtPservice&nxtPpath=$nxtPpath" }, { src: "^/product/(?<nxtPid>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/product/[id].rsc?nxtPid=$nxtPid" }, { src: "^/product/(?<nxtPid>[^/]+?)(?:/)?$", dest: "/product/[id]?nxtPid=$nxtPid" }, { src: "^/return/(?<nxtPorderId>[^/]+?)/(?<nxtPproductId>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/return/[orderId]/[productId].rsc?nxtPorderId=$nxtPorderId&nxtPproductId=$nxtPproductId" }, { src: "^/return/(?<nxtPorderId>[^/]+?)/(?<nxtPproductId>[^/]+?)(?:/)?$", dest: "/return/[orderId]/[productId]?nxtPorderId=$nxtPorderId&nxtPproductId=$nxtPproductId" }], resource: [{ src: "^/.*$", status: 404 }], hit: [{ src: "^/_next/static/(?:[^/]+/pages|pages|chunks|runtime|css|image|media|h9LsIPTOB2D9t0SOOneri)/.+$", headers: { "cache-control": "public,max-age=31536000,immutable" }, continue: true, important: true }, { src: "^/index(?:/)?$", headers: { "x-matched-path": "/" }, continue: true, important: true }, { src: "^/((?!index$).*?)(?:/)?$", headers: { "x-matched-path": "/$1" }, continue: true, important: true }], error: [{ src: "^/.*$", dest: "/404", status: 404, headers: { "x-next-error-status": "404" } }, { src: "^/.*$", dest: "/500", status: 500, headers: { "x-next-error-status": "500" } }] }, overrides: { "404.html": { path: "404", contentType: "text/html; charset=utf-8" }, "500.html": { path: "500", contentType: "text/html; charset=utf-8" }, "_app.rsc.json": { path: "_app.rsc", contentType: "application/json" }, "_error.rsc.json": { path: "_error.rsc", contentType: "application/json" }, "_document.rsc.json": { path: "_document.rsc", contentType: "application/json" }, "404.rsc.json": { path: "404.rsc", contentType: "application/json" }, "_next/static/not-found.txt": { contentType: "text/plain" } }, framework: { slug: "nextjs", version: "14.2.15" }, crons: [] };
});
var f;
var l = M(() => {
  f = { "/404.html": { type: "override", path: "/404.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/404.rsc.json": { type: "override", path: "/404.rsc.json", headers: { "content-type": "application/json" } }, "/500.html": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/_app.rsc.json": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc.json": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } }, "/_error.rsc.json": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_next/static/chunks/216-69f0f5360ae1e7d6.js": { type: "static" }, "/_next/static/chunks/30-a93ac8abc9da4525.js": { type: "static" }, "/_next/static/chunks/469-add32ff2b57bb1f8.js": { type: "static" }, "/_next/static/chunks/522-1377873613188255.js": { type: "static" }, "/_next/static/chunks/app/_not-found/page-fc083efe1322d335.js": { type: "static" }, "/_next/static/chunks/app/cart/page-0043d1d246901e0c.js": { type: "static" }, "/_next/static/chunks/app/checkout/page-ceb46aa1f72cceb7.js": { type: "static" }, "/_next/static/chunks/app/green-credits/page-fe1f31aa37b2cdeb.js": { type: "static" }, "/_next/static/chunks/app/layout-bc61d631c1c3e6fd.js": { type: "static" }, "/_next/static/chunks/app/order-success/page-31aa5ecc062a000a.js": { type: "static" }, "/_next/static/chunks/app/orders/page-64af28cf634d32a6.js": { type: "static" }, "/_next/static/chunks/app/page-8fadf5e4dd2134d9.js": { type: "static" }, "/_next/static/chunks/app/product/[id]/page-87e35d9fa9a6288d.js": { type: "static" }, "/_next/static/chunks/app/products/page-a919738bbc3b99bf.js": { type: "static" }, "/_next/static/chunks/app/renewed/page-e1f3d4aea9b6b5ef.js": { type: "static" }, "/_next/static/chunks/app/return/[orderId]/[productId]/page-f8e73a8943dbbcb9.js": { type: "static" }, "/_next/static/chunks/app/return-decision/page-2722e343cc4eebcb.js": { type: "static" }, "/_next/static/chunks/app/return-journey/page-138130d36a69316a.js": { type: "static" }, "/_next/static/chunks/app/return-prevention/page-671ddad91ffe9d35.js": { type: "static" }, "/_next/static/chunks/fd9d1056-95c91e904dae9293.js": { type: "static" }, "/_next/static/chunks/framework-f66176bb897dc684.js": { type: "static" }, "/_next/static/chunks/main-app-b04088b56f436bba.js": { type: "static" }, "/_next/static/chunks/main-ec9ca52172c1173d.js": { type: "static" }, "/_next/static/chunks/pages/_app-72b849fbd24ac258.js": { type: "static" }, "/_next/static/chunks/pages/_error-7ba65e1336b92748.js": { type: "static" }, "/_next/static/chunks/polyfills-42372ed130431b0a.js": { type: "static" }, "/_next/static/chunks/webpack-f7cbd32035d5221e.js": { type: "static" }, "/_next/static/css/4f7c443d29eb77e2.css": { type: "static" }, "/_next/static/h9LsIPTOB2D9t0SOOneri/_buildManifest.js": { type: "static" }, "/_next/static/h9LsIPTOB2D9t0SOOneri/_ssgManifest.js": { type: "static" }, "/_next/static/media/19cfc7226ec3afaa-s.woff2": { type: "static" }, "/_next/static/media/21350d82a1f187e9-s.woff2": { type: "static" }, "/_next/static/media/8e9860b6e62d6359-s.woff2": { type: "static" }, "/_next/static/media/ba9851c3c22cd980-s.woff2": { type: "static" }, "/_next/static/media/c5fe6dc8356a8c31-s.woff2": { type: "static" }, "/_next/static/media/df0a9ae256c0569c-s.woff2": { type: "static" }, "/_next/static/media/e4af272ccee01ff0-s.p.woff2": { type: "static" }, "/_next/static/not-found.txt": { type: "static" }, "/api/proxy/[service]/[[...path]]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/proxy/[service]/[[...path]].func.js" }, "/api/proxy/[service]/[[...path]].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/proxy/[service]/[[...path]].func.js" }, "/product/[id]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/product/[id].func.js" }, "/product/[id].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/product/[id].func.js" }, "/return/[orderId]/[productId]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/return/[orderId]/[productId].func.js" }, "/return/[orderId]/[productId].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/return/[orderId]/[productId].func.js" }, "/404": { type: "override", path: "/404.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/500": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/_app.rsc": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_error.rsc": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } }, "/404.rsc": { type: "override", path: "/404.rsc.json", headers: { "content-type": "application/json" } }, "/cart.html": { type: "override", path: "/cart.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/cart/layout,_N_T_/cart/page,_N_T_/cart", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/cart": { type: "override", path: "/cart.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/cart/layout,_N_T_/cart/page,_N_T_/cart", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/cart.rsc": { type: "override", path: "/cart.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/cart/layout,_N_T_/cart/page,_N_T_/cart", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/checkout.html": { type: "override", path: "/checkout.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/checkout/layout,_N_T_/checkout/page,_N_T_/checkout", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/checkout": { type: "override", path: "/checkout.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/checkout/layout,_N_T_/checkout/page,_N_T_/checkout", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/checkout.rsc": { type: "override", path: "/checkout.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/checkout/layout,_N_T_/checkout/page,_N_T_/checkout", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/green-credits.html": { type: "override", path: "/green-credits.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/green-credits/layout,_N_T_/green-credits/page,_N_T_/green-credits", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/green-credits": { type: "override", path: "/green-credits.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/green-credits/layout,_N_T_/green-credits/page,_N_T_/green-credits", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/green-credits.rsc": { type: "override", path: "/green-credits.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/green-credits/layout,_N_T_/green-credits/page,_N_T_/green-credits", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/index.html": { type: "override", path: "/index.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/index": { type: "override", path: "/index.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/": { type: "override", path: "/index.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/index.rsc": { type: "override", path: "/index.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/order-success.html": { type: "override", path: "/order-success.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/order-success/layout,_N_T_/order-success/page,_N_T_/order-success", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/order-success": { type: "override", path: "/order-success.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/order-success/layout,_N_T_/order-success/page,_N_T_/order-success", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/order-success.rsc": { type: "override", path: "/order-success.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/order-success/layout,_N_T_/order-success/page,_N_T_/order-success", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/orders.html": { type: "override", path: "/orders.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/orders/layout,_N_T_/orders/page,_N_T_/orders", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/orders": { type: "override", path: "/orders.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/orders/layout,_N_T_/orders/page,_N_T_/orders", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/orders.rsc": { type: "override", path: "/orders.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/orders/layout,_N_T_/orders/page,_N_T_/orders", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/products.html": { type: "override", path: "/products.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/products/layout,_N_T_/products/page,_N_T_/products", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/products": { type: "override", path: "/products.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/products/layout,_N_T_/products/page,_N_T_/products", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/products.rsc": { type: "override", path: "/products.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/products/layout,_N_T_/products/page,_N_T_/products", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/renewed.html": { type: "override", path: "/renewed.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/renewed/layout,_N_T_/renewed/page,_N_T_/renewed", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/renewed": { type: "override", path: "/renewed.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/renewed/layout,_N_T_/renewed/page,_N_T_/renewed", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/renewed.rsc": { type: "override", path: "/renewed.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/renewed/layout,_N_T_/renewed/page,_N_T_/renewed", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/return-decision.html": { type: "override", path: "/return-decision.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/return-decision/layout,_N_T_/return-decision/page,_N_T_/return-decision", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/return-decision": { type: "override", path: "/return-decision.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/return-decision/layout,_N_T_/return-decision/page,_N_T_/return-decision", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/return-decision.rsc": { type: "override", path: "/return-decision.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/return-decision/layout,_N_T_/return-decision/page,_N_T_/return-decision", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/return-journey.html": { type: "override", path: "/return-journey.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/return-journey/layout,_N_T_/return-journey/page,_N_T_/return-journey", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/return-journey": { type: "override", path: "/return-journey.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/return-journey/layout,_N_T_/return-journey/page,_N_T_/return-journey", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/return-journey.rsc": { type: "override", path: "/return-journey.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/return-journey/layout,_N_T_/return-journey/page,_N_T_/return-journey", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } }, "/return-prevention.html": { type: "override", path: "/return-prevention.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/return-prevention/layout,_N_T_/return-prevention/page,_N_T_/return-prevention", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/return-prevention": { type: "override", path: "/return-prevention.html", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/return-prevention/layout,_N_T_/return-prevention/page,_N_T_/return-prevention", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" } }, "/return-prevention.rsc": { type: "override", path: "/return-prevention.rsc", headers: { "x-next-cache-tags": "_N_T_/layout,_N_T_/return-prevention/layout,_N_T_/return-prevention/page,_N_T_/return-prevention", vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch", "content-type": "text/x-component" } } };
});
var q = V((ze, F) => {
  "use strict";
  u();
  d();
  l();
  function R(e, t) {
    e = String(e || "").trim();
    let s = e, r, n = "";
    if (/^[^a-zA-Z\\\s]/.test(e)) {
      r = e[0];
      let i = e.lastIndexOf(r);
      n += e.substring(i + 1), e = e.substring(1, i);
    }
    let a = 0;
    return e = le(e, (i) => {
      if (/^\(\?[P<']/.test(i)) {
        let c = /^\(\?P?[<']([^>']+)[>']/.exec(i);
        if (!c) throw new Error(`Failed to extract named captures from ${JSON.stringify(i)}`);
        let h = i.substring(c[0].length, i.length - 1);
        return t && (t[a] = c[1]), a++, `(${h})`;
      }
      return i.substring(0, 3) === "(?:" || a++, i;
    }), e = e.replace(/\[:([^:]+):\]/g, (i, c) => R.characterClasses[c] || i), new R.PCRE(e, n, s, n, r);
  }
  __name(R, "R");
  function le(e, t) {
    let s = 0, r = 0, n = false;
    for (let o = 0; o < e.length; o++) {
      let a = e[o];
      if (n) {
        n = false;
        continue;
      }
      switch (a) {
        case "(":
          r === 0 && (s = o), r++;
          break;
        case ")":
          if (r > 0 && (r--, r === 0)) {
            let i = o + 1, c = s === 0 ? "" : e.substring(0, s), h = e.substring(i), p = String(t(e.substring(s, i)));
            e = c + p + h, o = s;
          }
          break;
        case "\\":
          n = true;
          break;
        default:
          break;
      }
    }
    return e;
  }
  __name(le, "le");
  (function(e) {
    class t extends RegExp {
      static {
        __name(this, "t");
      }
      constructor(r, n, o, a, i) {
        super(r, n), this.pcrePattern = o, this.pcreFlags = a, this.delimiter = i;
      }
    }
    e.PCRE = t, e.characterClasses = { alnum: "[A-Za-z0-9]", word: "[A-Za-z0-9_]", alpha: "[A-Za-z]", blank: "[ \\t]", cntrl: "[\\x00-\\x1F\\x7F]", digit: "\\d", graph: "[\\x21-\\x7E]", lower: "[a-z]", print: "[\\x20-\\x7E]", punct: "[\\]\\[!\"#$%&'()*+,./:;<=>?@\\\\^_`{|}~-]", space: "\\s", upper: "[A-Z]", xdigit: "[A-Fa-f0-9]" };
  })(R || (R = {}));
  R.prototype = R.PCRE.prototype;
  F.exports = R;
});
var Q = V((H) => {
  "use strict";
  u();
  d();
  l();
  H.parse = ve;
  H.serialize = we;
  var Te = Object.prototype.toString, k = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
  function ve(e, t) {
    if (typeof e != "string") throw new TypeError("argument str must be a string");
    for (var s = {}, r = t || {}, n = r.decode || Se, o = 0; o < e.length; ) {
      var a = e.indexOf("=", o);
      if (a === -1) break;
      var i = e.indexOf(";", o);
      if (i === -1) i = e.length;
      else if (i < a) {
        o = e.lastIndexOf(";", a - 1) + 1;
        continue;
      }
      var c = e.slice(o, a).trim();
      if (s[c] === void 0) {
        var h = e.slice(a + 1, i).trim();
        h.charCodeAt(0) === 34 && (h = h.slice(1, -1)), s[c] = Ce(h, n);
      }
      o = i + 1;
    }
    return s;
  }
  __name(ve, "ve");
  function we(e, t, s) {
    var r = s || {}, n = r.encode || Pe;
    if (typeof n != "function") throw new TypeError("option encode is invalid");
    if (!k.test(e)) throw new TypeError("argument name is invalid");
    var o = n(t);
    if (o && !k.test(o)) throw new TypeError("argument val is invalid");
    var a = e + "=" + o;
    if (r.maxAge != null) {
      var i = r.maxAge - 0;
      if (isNaN(i) || !isFinite(i)) throw new TypeError("option maxAge is invalid");
      a += "; Max-Age=" + Math.floor(i);
    }
    if (r.domain) {
      if (!k.test(r.domain)) throw new TypeError("option domain is invalid");
      a += "; Domain=" + r.domain;
    }
    if (r.path) {
      if (!k.test(r.path)) throw new TypeError("option path is invalid");
      a += "; Path=" + r.path;
    }
    if (r.expires) {
      var c = r.expires;
      if (!be(c) || isNaN(c.valueOf())) throw new TypeError("option expires is invalid");
      a += "; Expires=" + c.toUTCString();
    }
    if (r.httpOnly && (a += "; HttpOnly"), r.secure && (a += "; Secure"), r.priority) {
      var h = typeof r.priority == "string" ? r.priority.toLowerCase() : r.priority;
      switch (h) {
        case "low":
          a += "; Priority=Low";
          break;
        case "medium":
          a += "; Priority=Medium";
          break;
        case "high":
          a += "; Priority=High";
          break;
        default:
          throw new TypeError("option priority is invalid");
      }
    }
    if (r.sameSite) {
      var p = typeof r.sameSite == "string" ? r.sameSite.toLowerCase() : r.sameSite;
      switch (p) {
        case true:
          a += "; SameSite=Strict";
          break;
        case "lax":
          a += "; SameSite=Lax";
          break;
        case "strict":
          a += "; SameSite=Strict";
          break;
        case "none":
          a += "; SameSite=None";
          break;
        default:
          throw new TypeError("option sameSite is invalid");
      }
    }
    return a;
  }
  __name(we, "we");
  function Se(e) {
    return e.indexOf("%") !== -1 ? decodeURIComponent(e) : e;
  }
  __name(Se, "Se");
  function Pe(e) {
    return encodeURIComponent(e);
  }
  __name(Pe, "Pe");
  function be(e) {
    return Te.call(e) === "[object Date]" || e instanceof Date;
  }
  __name(be, "be");
  function Ce(e, t) {
    try {
      return t(e);
    } catch {
      return e;
    }
  }
  __name(Ce, "Ce");
});
u();
d();
l();
u();
d();
l();
u();
d();
l();
var T = "INTERNAL_SUSPENSE_CACHE_HOSTNAME.local";
u();
d();
l();
u();
d();
l();
u();
d();
l();
u();
d();
l();
var D = $(q());
function P(e, t, s) {
  if (t == null) return { match: null, captureGroupKeys: [] };
  let r = s ? "" : "i", n = [];
  return { match: (0, D.default)(`%${e}%${r}`, n).exec(t), captureGroupKeys: n };
}
__name(P, "P");
function v(e, t, s, { namedOnly: r } = {}) {
  return e.replace(/\$([a-zA-Z0-9_]+)/g, (n, o) => {
    let a = s.indexOf(o);
    return r && a === -1 ? n : (a === -1 ? t[parseInt(o, 10)] : t[a + 1]) || "";
  });
}
__name(v, "v");
function I(e, { url: t, cookies: s, headers: r, routeDest: n }) {
  switch (e.type) {
    case "host":
      return { valid: t.hostname === e.value };
    case "header":
      return e.value !== void 0 ? j(e.value, r.get(e.key), n) : { valid: r.has(e.key) };
    case "cookie": {
      let o = s[e.key];
      return o && e.value !== void 0 ? j(e.value, o, n) : { valid: o !== void 0 };
    }
    case "query":
      return e.value !== void 0 ? j(e.value, t.searchParams.get(e.key), n) : { valid: t.searchParams.has(e.key) };
  }
}
__name(I, "I");
function j(e, t, s) {
  let { match: r, captureGroupKeys: n } = P(e, t);
  return s && r && n.length ? { valid: !!r, newRouteDest: v(s, r, n, { namedOnly: true }) } : { valid: !!r };
}
__name(j, "j");
u();
d();
l();
function B(e) {
  let t = new Headers(e.headers);
  return e.cf && (t.set("x-vercel-ip-city", encodeURIComponent(e.cf.city)), t.set("x-vercel-ip-country", e.cf.country), t.set("x-vercel-ip-country-region", e.cf.regionCode), t.set("x-vercel-ip-latitude", e.cf.latitude), t.set("x-vercel-ip-longitude", e.cf.longitude)), t.set("x-vercel-sc-host", T), new Request(e, { headers: t });
}
__name(B, "B");
u();
d();
l();
function m(e, t, s) {
  let r = t instanceof Headers ? t.entries() : Object.entries(t);
  for (let [n, o] of r) {
    let a = n.toLowerCase(), i = s?.match ? v(o, s.match, s.captureGroupKeys) : o;
    a === "set-cookie" ? e.append(a, i) : e.set(a, i);
  }
}
__name(m, "m");
function w(e) {
  return /^https?:\/\//.test(e);
}
__name(w, "w");
function x(e, t) {
  for (let [s, r] of t.entries()) {
    let n = /^nxtP(.+)$/.exec(s), o = /^nxtI(.+)$/.exec(s);
    n?.[1] ? (e.set(s, r), e.set(n[1], r)) : o?.[1] ? e.set(o[1], r.replace(/(\(\.+\))+/, "")) : (!e.has(s) || !!r && !e.getAll(s).includes(r)) && e.append(s, r);
  }
}
__name(x, "x");
function O(e, t) {
  let s = new URL(t, e.url);
  return x(s.searchParams, new URL(e.url).searchParams), s.pathname = s.pathname.replace(/\/index.html$/, "/").replace(/\.html$/, ""), new Request(s, e);
}
__name(O, "O");
function S(e) {
  return new Response(e.body, e);
}
__name(S, "S");
function L(e) {
  return e.split(",").map((t) => {
    let [s, r] = t.split(";"), n = parseFloat((r ?? "q=1").replace(/q *= */gi, ""));
    return [s.trim(), isNaN(n) ? 1 : n];
  }).sort((t, s) => s[1] - t[1]).map(([t]) => t === "*" || t === "" ? [] : t).flat();
}
__name(L, "L");
u();
d();
l();
function A(e) {
  switch (e) {
    case "none":
      return "filesystem";
    case "filesystem":
      return "rewrite";
    case "rewrite":
      return "resource";
    case "resource":
      return "miss";
    default:
      return "miss";
  }
}
__name(A, "A");
async function b(e, { request: t, assetsFetcher: s, ctx: r }, { path: n, searchParams: o }) {
  let a, i = new URL(t.url);
  x(i.searchParams, o);
  let c = new Request(i, t);
  try {
    switch (e?.type) {
      case "function":
      case "middleware": {
        let h = await import(e.entrypoint);
        try {
          a = await h.default(c, r);
        } catch (p) {
          let g = p;
          throw g.name === "TypeError" && g.message.endsWith("default is not a function") ? new Error(`An error occurred while evaluating the target edge function (${e.entrypoint})`) : p;
        }
        break;
      }
      case "override": {
        a = S(await s.fetch(O(c, e.path ?? n))), e.headers && m(a.headers, e.headers);
        break;
      }
      case "static": {
        a = await s.fetch(O(c, n));
        break;
      }
      default:
        a = new Response("Not Found", { status: 404 });
    }
  } catch (h) {
    return console.error(h), new Response("Internal Server Error", { status: 500 });
  }
  return S(a);
}
__name(b, "b");
function G(e, t) {
  let s = "^//?(?:", r = ")/(.*)$";
  return !e.startsWith(s) || !e.endsWith(r) ? false : e.slice(s.length, -r.length).split("|").every((o) => t.has(o));
}
__name(G, "G");
u();
d();
l();
function he(e, { protocol: t, hostname: s, port: r, pathname: n }) {
  return !(t && e.protocol.replace(/:$/, "") !== t || !new RegExp(s).test(e.hostname) || r && !new RegExp(r).test(e.port) || n && !new RegExp(n).test(e.pathname));
}
__name(he, "he");
function pe(e, t) {
  if (e.method !== "GET") return;
  let { origin: s, searchParams: r } = new URL(e.url), n = r.get("url"), o = Number.parseInt(r.get("w") ?? "", 10), a = Number.parseInt(r.get("q") ?? "75", 10);
  if (!n || Number.isNaN(o) || Number.isNaN(a) || !t?.sizes?.includes(o) || a < 0 || a > 100) return;
  let i = new URL(n, s);
  if (i.pathname.endsWith(".svg") && !t?.dangerouslyAllowSVG) return;
  let c = n.startsWith("//"), h = n.startsWith("/") && !c;
  if (!h && !t?.domains?.includes(i.hostname) && !t?.remotePatterns?.find((N) => he(i, N))) return;
  let p = e.headers.get("Accept") ?? "", g = t?.formats?.find((N) => p.includes(N))?.replace("image/", "");
  return { isRelative: h, imageUrl: i, options: { width: o, quality: a, format: g } };
}
__name(pe, "pe");
function _e(e, t, s) {
  let r = new Headers();
  if (s?.contentSecurityPolicy && r.set("Content-Security-Policy", s.contentSecurityPolicy), s?.contentDispositionType) {
    let o = t.pathname.split("/").pop(), a = o ? `${s.contentDispositionType}; filename="${o}"` : s.contentDispositionType;
    r.set("Content-Disposition", a);
  }
  e.headers.has("Cache-Control") || r.set("Cache-Control", `public, max-age=${s?.minimumCacheTTL ?? 60}`);
  let n = S(e);
  return m(n.headers, r), n;
}
__name(_e, "_e");
async function K(e, { buildOutput: t, assetsFetcher: s, imagesConfig: r }) {
  let n = pe(e, r);
  if (!n) return new Response("Invalid image resizing request", { status: 400 });
  let { isRelative: o, imageUrl: a } = n, c = await (o && a.pathname in t ? s.fetch.bind(s) : fetch)(a);
  return _e(c, a, r);
}
__name(K, "K");
u();
d();
l();
u();
d();
l();
u();
d();
l();
async function C(e) {
  return import(e);
}
__name(C, "C");
var fe = "x-vercel-cache-tags";
var ye = "x-next-cache-soft-tags";
var ge = /* @__PURE__ */ Symbol.for("__cloudflare-request-context__");
async function J(e) {
  let t = `https://${T}/v1/suspense-cache/`;
  if (!e.url.startsWith(t)) return null;
  try {
    let s = new URL(e.url), r = await me();
    if (s.pathname === "/v1/suspense-cache/revalidate") {
      let o = s.searchParams.get("tags")?.split(",") ?? [];
      for (let a of o) await r.revalidateTag(a);
      return new Response(null, { status: 200 });
    }
    let n = s.pathname.replace("/v1/suspense-cache/", "");
    if (!n.length) return new Response("Invalid cache key", { status: 400 });
    switch (e.method) {
      case "GET": {
        let o = z(e, ye), a = await r.get(n, { softTags: o });
        return a ? new Response(JSON.stringify(a.value), { status: 200, headers: { "Content-Type": "application/json", "x-vercel-cache-state": "fresh", age: `${(Date.now() - (a.lastModified ?? Date.now())) / 1e3}` } }) : new Response(null, { status: 404 });
      }
      case "POST": {
        let o = globalThis[ge], a = /* @__PURE__ */ __name(async () => {
          let i = await e.json();
          i.data.tags === void 0 && (i.tags ??= z(e, fe) ?? []), await r.set(n, i);
        }, "a");
        return o ? o.ctx.waitUntil(a()) : await a(), new Response(null, { status: 200 });
      }
      default:
        return new Response(null, { status: 405 });
    }
  } catch (s) {
    return console.error(s), new Response("Error handling cache request", { status: 500 });
  }
}
__name(J, "J");
async function me() {
  return process.env.__NEXT_ON_PAGES__KV_SUSPENSE_CACHE ? W("kv") : W("cache-api");
}
__name(me, "me");
async function W(e) {
  let t = `./__next-on-pages-dist__/cache/${e}.js`, s = await C(t);
  return new s.default();
}
__name(W, "W");
function z(e, t) {
  return e.headers.get(t)?.split(",")?.filter(Boolean);
}
__name(z, "z");
function X() {
  globalThis[Z] || (xe(), globalThis[Z] = true);
}
__name(X, "X");
function xe() {
  let e = globalThis.fetch;
  globalThis.fetch = async (...t) => {
    let s = new Request(...t), r = await Re(s);
    return r || (r = await J(s), r) ? r : (Ne(s), e(s));
  };
}
__name(xe, "xe");
async function Re(e) {
  if (e.url.startsWith("blob:")) try {
    let s = `./__next-on-pages-dist__/assets/${new URL(e.url).pathname}.bin`, r = (await C(s)).default, n = { async arrayBuffer() {
      return r;
    }, get body() {
      return new ReadableStream({ start(o) {
        let a = Buffer.from(r);
        o.enqueue(a), o.close();
      } });
    }, async text() {
      return Buffer.from(r).toString();
    }, async json() {
      let o = Buffer.from(r);
      return JSON.stringify(o.toString());
    }, async blob() {
      return new Blob(r);
    } };
    return n.clone = () => ({ ...n }), n;
  } catch {
  }
  return null;
}
__name(Re, "Re");
function Ne(e) {
  e.headers.has("user-agent") || e.headers.set("user-agent", "Next.js Middleware");
}
__name(Ne, "Ne");
var Z = /* @__PURE__ */ Symbol.for("next-on-pages fetch patch");
u();
d();
l();
var Y = $(Q());
var E = class {
  static {
    __name(this, "E");
  }
  constructor(t, s, r, n, o) {
    this.routes = t;
    this.output = s;
    this.reqCtx = r;
    this.url = new URL(r.request.url), this.cookies = (0, Y.parse)(r.request.headers.get("cookie") || ""), this.path = this.url.pathname || "/", this.headers = { normal: new Headers(), important: new Headers() }, this.searchParams = new URLSearchParams(), x(this.searchParams, this.url.searchParams), this.checkPhaseCounter = 0, this.middlewareInvoked = [], this.wildcardMatch = o?.find((a) => a.domain === this.url.hostname), this.locales = new Set(n.collectedLocales);
  }
  url;
  cookies;
  wildcardMatch;
  path;
  status;
  headers;
  searchParams;
  body;
  checkPhaseCounter;
  middlewareInvoked;
  locales;
  checkRouteMatch(t, { checkStatus: s, checkIntercept: r }) {
    let n = P(t.src, this.path, t.caseSensitive);
    if (!n.match || t.methods && !t.methods.map((a) => a.toUpperCase()).includes(this.reqCtx.request.method.toUpperCase())) return;
    let o = { url: this.url, cookies: this.cookies, headers: this.reqCtx.request.headers, routeDest: t.dest };
    if (!t.has?.find((a) => {
      let i = I(a, o);
      return i.newRouteDest && (o.routeDest = i.newRouteDest), !i.valid;
    }) && !t.missing?.find((a) => I(a, o).valid) && !(s && t.status !== this.status)) {
      if (r && t.dest) {
        let a = /\/(\(\.+\))+/, i = a.test(t.dest), c = a.test(this.path);
        if (i && !c) return;
      }
      return { routeMatch: n, routeDest: o.routeDest };
    }
  }
  processMiddlewareResp(t) {
    let s = "x-middleware-override-headers", r = t.headers.get(s);
    if (r) {
      let c = new Set(r.split(",").map((h) => h.trim()));
      for (let h of c.keys()) {
        let p = `x-middleware-request-${h}`, g = t.headers.get(p);
        this.reqCtx.request.headers.get(h) !== g && (g ? this.reqCtx.request.headers.set(h, g) : this.reqCtx.request.headers.delete(h)), t.headers.delete(p);
      }
      t.headers.delete(s);
    }
    let n = "x-middleware-rewrite", o = t.headers.get(n);
    if (o) {
      let c = new URL(o, this.url), h = this.url.hostname !== c.hostname;
      this.path = h ? `${c}` : c.pathname, x(this.searchParams, c.searchParams), t.headers.delete(n);
    }
    let a = "x-middleware-next";
    t.headers.get(a) ? t.headers.delete(a) : !o && !t.headers.has("location") ? (this.body = t.body, this.status = t.status) : t.headers.has("location") && t.status >= 300 && t.status < 400 && (this.status = t.status), m(this.reqCtx.request.headers, t.headers), m(this.headers.normal, t.headers), this.headers.middlewareLocation = t.headers.get("location");
  }
  async runRouteMiddleware(t) {
    if (!t) return true;
    let s = t && this.output[t];
    if (!s || s.type !== "middleware") return this.status = 500, false;
    let r = await b(s, this.reqCtx, { path: this.path, searchParams: this.searchParams, headers: this.headers, status: this.status });
    return this.middlewareInvoked.push(t), r.status === 500 ? (this.status = r.status, false) : (this.processMiddlewareResp(r), true);
  }
  applyRouteOverrides(t) {
    !t.override || (this.status = void 0, this.headers.normal = new Headers(), this.headers.important = new Headers());
  }
  applyRouteHeaders(t, s, r) {
    !t.headers || (m(this.headers.normal, t.headers, { match: s, captureGroupKeys: r }), t.important && m(this.headers.important, t.headers, { match: s, captureGroupKeys: r }));
  }
  applyRouteStatus(t) {
    !t.status || (this.status = t.status);
  }
  applyRouteDest(t, s, r) {
    if (!t.dest) return this.path;
    let n = this.path, o = t.dest;
    this.wildcardMatch && /\$wildcard/.test(o) && (o = o.replace(/\$wildcard/g, this.wildcardMatch.value)), this.path = v(o, s, r);
    let a = /\/index\.rsc$/i.test(this.path), i = /^\/(?:index)?$/i.test(n), c = /^\/__index\.prefetch\.rsc$/i.test(n);
    a && !i && !c && (this.path = n);
    let h = /\.rsc$/i.test(this.path), p = /\.prefetch\.rsc$/i.test(this.path), g = this.path in this.output;
    h && !p && !g && (this.path = this.path.replace(/\.rsc/i, ""));
    let N = new URL(this.path, this.url);
    return x(this.searchParams, N.searchParams), w(this.path) || (this.path = N.pathname), n;
  }
  applyLocaleRedirects(t) {
    if (!t.locale?.redirect || !/^\^(.)*$/.test(t.src) && t.src !== this.path || this.headers.normal.has("location")) return;
    let { locale: { redirect: r, cookie: n } } = t, o = n && this.cookies[n], a = L(o ?? ""), i = L(this.reqCtx.request.headers.get("accept-language") ?? ""), p = [...a, ...i].map((g) => r[g]).filter(Boolean)[0];
    if (p) {
      !this.path.startsWith(p) && (this.headers.normal.set("location", p), this.status = 307);
      return;
    }
  }
  getLocaleFriendlyRoute(t, s) {
    return !this.locales || s !== "miss" ? t : G(t.src, this.locales) ? { ...t, src: t.src.replace(/\/\(\.\*\)\$$/, "(?:/(.*))?$") } : t;
  }
  async checkRoute(t, s) {
    let r = this.getLocaleFriendlyRoute(s, t), { routeMatch: n, routeDest: o } = this.checkRouteMatch(r, { checkStatus: t === "error", checkIntercept: t === "rewrite" }) ?? {}, a = { ...r, dest: o };
    if (!n?.match || a.middlewarePath && this.middlewareInvoked.includes(a.middlewarePath)) return "skip";
    let { match: i, captureGroupKeys: c } = n;
    if (this.applyRouteOverrides(a), this.applyLocaleRedirects(a), !await this.runRouteMiddleware(a.middlewarePath)) return "error";
    if (this.body !== void 0 || this.headers.middlewareLocation) return "done";
    this.applyRouteHeaders(a, i, c), this.applyRouteStatus(a);
    let p = this.applyRouteDest(a, i, c);
    if (a.check && !w(this.path)) if (p === this.path) {
      if (t !== "miss") return this.checkPhase(A(t));
      this.status = 404;
    } else if (t === "miss") {
      if (!(this.path in this.output) && !(this.path.replace(/\/$/, "") in this.output)) return this.checkPhase("filesystem");
      this.status === 404 && (this.status = void 0);
    } else return this.checkPhase("none");
    return !a.continue || a.status && a.status >= 300 && a.status <= 399 ? "done" : "next";
  }
  async checkPhase(t) {
    if (this.checkPhaseCounter++ >= 50) return console.error(`Routing encountered an infinite loop while checking ${this.url.pathname}`), this.status = 500, "error";
    this.middlewareInvoked = [];
    let s = true;
    for (let o of this.routes[t]) {
      let a = await this.checkRoute(t, o);
      if (a === "error") return "error";
      if (a === "done") {
        s = false;
        break;
      }
    }
    if (t === "hit" || w(this.path) || this.headers.normal.has("location") || !!this.body) return "done";
    if (t === "none") for (let o of this.locales) {
      let a = new RegExp(`/${o}(/.*)`), c = this.path.match(a)?.[1];
      if (c && c in this.output) {
        this.path = c;
        break;
      }
    }
    let r = this.path in this.output;
    if (!r && this.path.endsWith("/")) {
      let o = this.path.replace(/\/$/, "");
      r = o in this.output, r && (this.path = o);
    }
    if (t === "miss" && !r) {
      let o = !this.status || this.status < 400;
      this.status = o ? 404 : this.status;
    }
    let n = "miss";
    return r || t === "miss" || t === "error" ? n = "hit" : s && (n = A(t)), this.checkPhase(n);
  }
  async run(t = "none") {
    this.checkPhaseCounter = 0;
    let s = await this.checkPhase(t);
    return this.headers.normal.has("location") && (!this.status || this.status < 300 || this.status >= 400) && (this.status = 307), s;
  }
};
async function ee(e, t, s, r) {
  let n = new E(t.routes, s, e, r, t.wildcard), o = await te(n);
  return ke(e, o, s);
}
__name(ee, "ee");
async function te(e, t = "none", s = false) {
  return await e.run(t) === "error" || !s && e.status && e.status >= 400 ? te(e, "error", true) : { path: e.path, status: e.status, headers: e.headers, searchParams: e.searchParams, body: e.body };
}
__name(te, "te");
async function ke(e, { path: t = "/404", status: s, headers: r, searchParams: n, body: o }, a) {
  let i = r.normal.get("location");
  if (i) {
    if (i !== r.middlewareLocation) {
      let p = [...n.keys()].length ? `?${n.toString()}` : "";
      r.normal.set("location", `${i ?? "/"}${p}`);
    }
    return new Response(null, { status: s, headers: r.normal });
  }
  let c;
  if (o !== void 0) c = new Response(o, { status: s });
  else if (w(t)) {
    let p = new URL(t);
    x(p.searchParams, n), c = await fetch(p, e.request);
  } else c = await b(a[t], e, { path: t, status: s, headers: r, searchParams: n });
  let h = r.normal;
  return m(h, c.headers), m(h, r.important), c = new Response(c.body, { ...c, status: s || c.status, headers: h }), c;
}
__name(ke, "ke");
u();
d();
l();
function re() {
  globalThis.__nextOnPagesRoutesIsolation ??= { _map: /* @__PURE__ */ new Map(), getProxyFor: Ee };
}
__name(re, "re");
function Ee(e) {
  let t = globalThis.__nextOnPagesRoutesIsolation._map.get(e);
  if (t) return t;
  let s = Me();
  return globalThis.__nextOnPagesRoutesIsolation._map.set(e, s), s;
}
__name(Ee, "Ee");
function Me() {
  let e = /* @__PURE__ */ new Map();
  return new Proxy(globalThis, { get: /* @__PURE__ */ __name((t, s) => e.has(s) ? e.get(s) : Reflect.get(globalThis, s), "get"), set: /* @__PURE__ */ __name((t, s, r) => je.has(s) ? Reflect.set(globalThis, s, r) : (e.set(s, r), true), "set") });
}
__name(Me, "Me");
var je = /* @__PURE__ */ new Set(["_nextOriginalFetch", "fetch", "__incrementalCache"]);
var Ie = Object.defineProperty;
var Oe = /* @__PURE__ */ __name((...e) => {
  let t = e[0], s = e[1], r = "__import_unsupported";
  if (!(s === r && typeof t == "object" && t !== null && r in t)) return Ie(...e);
}, "Oe");
globalThis.Object.defineProperty = Oe;
globalThis.AbortController = class extends AbortController {
  constructor() {
    try {
      super();
    } catch (t) {
      if (t instanceof Error && t.message.includes("Disallowed operation called within global scope")) return { signal: { aborted: false, reason: null, onabort: /* @__PURE__ */ __name(() => {
      }, "onabort"), throwIfAborted: /* @__PURE__ */ __name(() => {
      }, "throwIfAborted") }, abort() {
      } };
      throw t;
    }
  }
};
var Sr = { async fetch(e, t, s) {
  re(), X();
  let r = await __ALSes_PROMISE__;
  if (!r) {
    let a = new URL(e.url), i = await t.ASSETS.fetch(`${a.protocol}//${a.host}/cdn-cgi/errors/no-nodejs_compat.html`), c = i.ok ? i.body : "Error: Could not access built-in Node.js modules. Please make sure that your Cloudflare Pages project has the 'nodejs_compat' compatibility flag set.";
    return new Response(c, { status: 503 });
  }
  let { envAsyncLocalStorage: n, requestContextAsyncLocalStorage: o } = r;
  return n.run({ ...t, NODE_ENV: "production", SUSPENSE_CACHE_URL: T }, async () => o.run({ env: t, ctx: s, cf: e.cf }, async () => {
    if (new URL(e.url).pathname.startsWith("/_next/image")) return K(e, { buildOutput: f, assetsFetcher: t.ASSETS, imagesConfig: _.images });
    let i = B(e);
    return ee({ request: i, ctx: s, assetsFetcher: t.ASSETS }, _, f, y);
  }));
} };
export {
  Sr as default
};
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
//# sourceMappingURL=bundledWorker-0.21451927401648496.mjs.map
