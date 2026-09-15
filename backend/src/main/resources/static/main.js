var Yf = Object.defineProperty,
  Kf = Object.defineProperties;
var Jf = Object.getOwnPropertyDescriptors;
var sl = Object.getOwnPropertySymbols;
var Xf = Object.prototype.hasOwnProperty,
  ep = Object.prototype.propertyIsEnumerable;
var al = (e, n, t) =>
    n in e ? Yf(e, n, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (e[n] = t),
  Z = (e, n) => {
    for (var t in (n ||= {})) Xf.call(n, t) && al(e, t, n[t]);
    if (sl) for (var t of sl(n)) ep.call(n, t) && al(e, t, n[t]);
    return e;
  },
  ee = (e, n) => Kf(e, Jf(n));
var Ae = (e, n, t) =>
  new Promise((i, r) => {
    var o = (d) => {
        try {
          a(t.next(d));
        } catch (p) {
          r(p);
        }
      },
      s = (d) => {
        try {
          a(t.throw(d));
        } catch (p) {
          r(p);
        }
      },
      a = (d) => (d.done ? i(d.value) : Promise.resolve(d.value).then(o, s));
    a((t = t.apply(e, n)).next());
  });
function ll(e, n) {
  return Object.is(e, n);
}
var ue = null,
  Ei = !1,
  Di = 1,
  at = Symbol('SIGNAL');
function W(e) {
  let n = ue;
  return ((ue = e), n);
}
function cl() {
  return ue;
}
var On = {
  version: 0,
  lastCleanEpoch: 0,
  dirty: !1,
  producerNode: void 0,
  producerLastReadVersion: void 0,
  producerIndexOfThis: void 0,
  nextProducerIndex: 0,
  liveConsumerNode: void 0,
  liveConsumerIndexOfThis: void 0,
  consumerAllowSignalWrites: !1,
  consumerIsAlwaysLive: !1,
  producerMustRecompute: () => !1,
  producerRecomputeValue: () => {},
  consumerMarkedDirty: () => {},
  consumerOnSignalRead: () => {},
};
function To(e) {
  if (Ei) throw new Error('');
  if (ue === null) return;
  ue.consumerOnSignalRead(e);
  let n = ue.nextProducerIndex++;
  if ((xi(ue), n < ue.producerNode.length && ue.producerNode[n] !== e && Rn(ue))) {
    let t = ue.producerNode[n];
    Ii(t, ue.producerIndexOfThis[n]);
  }
  (ue.producerNode[n] !== e &&
    ((ue.producerNode[n] = e), (ue.producerIndexOfThis[n] = Rn(ue) ? pl(e, ue, n) : 0)),
    (ue.producerLastReadVersion[n] = e.version));
}
function tp() {
  Di++;
}
function ul(e) {
  if (!(Rn(e) && !e.dirty) && !(!e.dirty && e.lastCleanEpoch === Di)) {
    if (!e.producerMustRecompute(e) && !No(e)) {
      ((e.dirty = !1), (e.lastCleanEpoch = Di));
      return;
    }
    (e.producerRecomputeValue(e), (e.dirty = !1), (e.lastCleanEpoch = Di));
  }
}
function dl(e) {
  if (e.liveConsumerNode === void 0) return;
  let n = Ei;
  Ei = !0;
  try {
    for (let t of e.liveConsumerNode) t.dirty || np(t);
  } finally {
    Ei = n;
  }
}
function fl() {
  return ue?.consumerAllowSignalWrites !== !1;
}
function np(e) {
  ((e.dirty = !0), dl(e), e.consumerMarkedDirty?.(e));
}
function wi(e) {
  return (e && (e.nextProducerIndex = 0), W(e));
}
function Ao(e, n) {
  if (
    (W(n),
    !(
      !e ||
      e.producerNode === void 0 ||
      e.producerIndexOfThis === void 0 ||
      e.producerLastReadVersion === void 0
    ))
  ) {
    if (Rn(e))
      for (let t = e.nextProducerIndex; t < e.producerNode.length; t++)
        Ii(e.producerNode[t], e.producerIndexOfThis[t]);
    for (; e.producerNode.length > e.nextProducerIndex;)
      (e.producerNode.pop(), e.producerLastReadVersion.pop(), e.producerIndexOfThis.pop());
  }
}
function No(e) {
  xi(e);
  for (let n = 0; n < e.producerNode.length; n++) {
    let t = e.producerNode[n],
      i = e.producerLastReadVersion[n];
    if (i !== t.version || (ul(t), i !== t.version)) return !0;
  }
  return !1;
}
function Ro(e) {
  if ((xi(e), Rn(e)))
    for (let n = 0; n < e.producerNode.length; n++) Ii(e.producerNode[n], e.producerIndexOfThis[n]);
  ((e.producerNode.length = e.producerLastReadVersion.length = e.producerIndexOfThis.length = 0),
    e.liveConsumerNode && (e.liveConsumerNode.length = e.liveConsumerIndexOfThis.length = 0));
}
function pl(e, n, t) {
  if ((hl(e), e.liveConsumerNode.length === 0 && ml(e)))
    for (let i = 0; i < e.producerNode.length; i++)
      e.producerIndexOfThis[i] = pl(e.producerNode[i], e, i);
  return (e.liveConsumerIndexOfThis.push(t), e.liveConsumerNode.push(n) - 1);
}
function Ii(e, n) {
  if ((hl(e), e.liveConsumerNode.length === 1 && ml(e)))
    for (let i = 0; i < e.producerNode.length; i++) Ii(e.producerNode[i], e.producerIndexOfThis[i]);
  let t = e.liveConsumerNode.length - 1;
  if (
    ((e.liveConsumerNode[n] = e.liveConsumerNode[t]),
    (e.liveConsumerIndexOfThis[n] = e.liveConsumerIndexOfThis[t]),
    e.liveConsumerNode.length--,
    e.liveConsumerIndexOfThis.length--,
    n < e.liveConsumerNode.length)
  ) {
    let i = e.liveConsumerIndexOfThis[n],
      r = e.liveConsumerNode[n];
    (xi(r), (r.producerIndexOfThis[i] = n));
  }
}
function Rn(e) {
  return e.consumerIsAlwaysLive || (e?.liveConsumerNode?.length ?? 0) > 0;
}
function xi(e) {
  ((e.producerNode ??= []), (e.producerIndexOfThis ??= []), (e.producerLastReadVersion ??= []));
}
function hl(e) {
  ((e.liveConsumerNode ??= []), (e.liveConsumerIndexOfThis ??= []));
}
function ml(e) {
  return e.producerNode !== void 0;
}
function gl(e) {
  let n = Object.create(ip);
  n.computation = e;
  let t = () => {
    if ((ul(n), To(n), n.value === bi)) throw n.error;
    return n.value;
  };
  return ((t[at] = n), t);
}
var So = Symbol('UNSET'),
  Mo = Symbol('COMPUTING'),
  bi = Symbol('ERRORED'),
  ip = ee(Z({}, On), {
    value: So,
    dirty: !0,
    error: null,
    equal: ll,
    producerMustRecompute(e) {
      return e.value === So || e.value === Mo;
    },
    producerRecomputeValue(e) {
      if (e.value === Mo) throw new Error('Detected cycle in computations.');
      let n = e.value;
      e.value = Mo;
      let t = wi(e),
        i;
      try {
        i = e.computation();
      } catch (r) {
        ((i = bi), (e.error = r));
      } finally {
        Ao(e, t);
      }
      if (n !== So && n !== bi && i !== bi && e.equal(n, i)) {
        e.value = n;
        return;
      }
      ((e.value = i), e.version++);
    },
  });
function rp() {
  throw new Error();
}
var _l = rp;
function yl() {
  _l();
}
function vl(e) {
  _l = e;
}
var op = null;
function Cl(e) {
  let n = Object.create(Dl);
  n.value = e;
  let t = () => (To(n), n.value);
  return ((t[at] = n), t);
}
function Oo(e, n) {
  (fl() || yl(), e.equal(e.value, n) || ((e.value = n), sp(e)));
}
function El(e, n) {
  (fl() || yl(), Oo(e, n(e.value)));
}
var Dl = ee(Z({}, On), { equal: ll, value: void 0 });
function sp(e) {
  (e.version++, tp(), dl(e), op?.());
}
function B(e) {
  return typeof e == 'function';
}
function Si(e) {
  let t = e((i) => {
    (Error.call(i), (i.stack = new Error().stack));
  });
  return ((t.prototype = Object.create(Error.prototype)), (t.prototype.constructor = t), t);
}
var Mi = Si(
  (e) =>
    function (t) {
      (e(this),
        (this.message = t
          ? `${t.length} errors occurred during unsubscription:
${t.map((i, r) => `${r + 1}) ${i.toString()}`).join(`
  `)}`
          : ''),
        (this.name = 'UnsubscriptionError'),
        (this.errors = t));
    },
);
function Pn(e, n) {
  if (e) {
    let t = e.indexOf(n);
    0 <= t && e.splice(t, 1);
  }
}
var ge = class e {
  constructor(n) {
    ((this.initialTeardown = n),
      (this.closed = !1),
      (this._parentage = null),
      (this._finalizers = null));
  }
  unsubscribe() {
    let n;
    if (!this.closed) {
      this.closed = !0;
      let { _parentage: t } = this;
      if (t)
        if (((this._parentage = null), Array.isArray(t))) for (let o of t) o.remove(this);
        else t.remove(this);
      let { initialTeardown: i } = this;
      if (B(i))
        try {
          i();
        } catch (o) {
          n = o instanceof Mi ? o.errors : [o];
        }
      let { _finalizers: r } = this;
      if (r) {
        this._finalizers = null;
        for (let o of r)
          try {
            bl(o);
          } catch (s) {
            ((n = n ?? []), s instanceof Mi ? (n = [...n, ...s.errors]) : n.push(s));
          }
      }
      if (n) throw new Mi(n);
    }
  }
  add(n) {
    var t;
    if (n && n !== this)
      if (this.closed) bl(n);
      else {
        if (n instanceof e) {
          if (n.closed || n._hasParent(this)) return;
          n._addParent(this);
        }
        (this._finalizers = (t = this._finalizers) !== null && t !== void 0 ? t : []).push(n);
      }
  }
  _hasParent(n) {
    let { _parentage: t } = this;
    return t === n || (Array.isArray(t) && t.includes(n));
  }
  _addParent(n) {
    let { _parentage: t } = this;
    this._parentage = Array.isArray(t) ? (t.push(n), t) : t ? [t, n] : n;
  }
  _removeParent(n) {
    let { _parentage: t } = this;
    t === n ? (this._parentage = null) : Array.isArray(t) && Pn(t, n);
  }
  remove(n) {
    let { _finalizers: t } = this;
    (t && Pn(t, n), n instanceof e && n._removeParent(this));
  }
};
ge.EMPTY = (() => {
  let e = new ge();
  return ((e.closed = !0), e);
})();
var Po = ge.EMPTY;
function Ti(e) {
  return e instanceof ge || (e && 'closed' in e && B(e.remove) && B(e.add) && B(e.unsubscribe));
}
function bl(e) {
  B(e) ? e() : e.unsubscribe();
}
var $e = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1,
};
var Kt = {
  setTimeout(e, n, ...t) {
    let { delegate: i } = Kt;
    return i?.setTimeout ? i.setTimeout(e, n, ...t) : setTimeout(e, n, ...t);
  },
  clearTimeout(e) {
    let { delegate: n } = Kt;
    return (n?.clearTimeout || clearTimeout)(e);
  },
  delegate: void 0,
};
function Ai(e) {
  Kt.setTimeout(() => {
    let { onUnhandledError: n } = $e;
    if (n) n(e);
    else throw e;
  });
}
function Fo() {}
var wl = ko('C', void 0, void 0);
function Il(e) {
  return ko('E', void 0, e);
}
function xl(e) {
  return ko('N', e, void 0);
}
function ko(e, n, t) {
  return { kind: e, value: n, error: t };
}
var Pt = null;
function Jt(e) {
  if ($e.useDeprecatedSynchronousErrorHandling) {
    let n = !Pt;
    if ((n && (Pt = { errorThrown: !1, error: null }), e(), n)) {
      let { errorThrown: t, error: i } = Pt;
      if (((Pt = null), t)) throw i;
    }
  } else e();
}
function Sl(e) {
  $e.useDeprecatedSynchronousErrorHandling && Pt && ((Pt.errorThrown = !0), (Pt.error = e));
}
var Ft = class extends ge {
    constructor(n) {
      (super(),
        (this.isStopped = !1),
        n ? ((this.destination = n), Ti(n) && n.add(this)) : (this.destination = cp));
    }
    static create(n, t, i) {
      return new Xt(n, t, i);
    }
    next(n) {
      this.isStopped ? Lo(xl(n), this) : this._next(n);
    }
    error(n) {
      this.isStopped ? Lo(Il(n), this) : ((this.isStopped = !0), this._error(n));
    }
    complete() {
      this.isStopped ? Lo(wl, this) : ((this.isStopped = !0), this._complete());
    }
    unsubscribe() {
      this.closed || ((this.isStopped = !0), super.unsubscribe(), (this.destination = null));
    }
    _next(n) {
      this.destination.next(n);
    }
    _error(n) {
      try {
        this.destination.error(n);
      } finally {
        this.unsubscribe();
      }
    }
    _complete() {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    }
  },
  ap = Function.prototype.bind;
function Vo(e, n) {
  return ap.call(e, n);
}
var jo = class {
    constructor(n) {
      this.partialObserver = n;
    }
    next(n) {
      let { partialObserver: t } = this;
      if (t.next)
        try {
          t.next(n);
        } catch (i) {
          Ni(i);
        }
    }
    error(n) {
      let { partialObserver: t } = this;
      if (t.error)
        try {
          t.error(n);
        } catch (i) {
          Ni(i);
        }
      else Ni(n);
    }
    complete() {
      let { partialObserver: n } = this;
      if (n.complete)
        try {
          n.complete();
        } catch (t) {
          Ni(t);
        }
    }
  },
  Xt = class extends Ft {
    constructor(n, t, i) {
      super();
      let r;
      if (B(n) || !n) r = { next: n ?? void 0, error: t ?? void 0, complete: i ?? void 0 };
      else {
        let o;
        this && $e.useDeprecatedNextContext
          ? ((o = Object.create(n)),
            (o.unsubscribe = () => this.unsubscribe()),
            (r = {
              next: n.next && Vo(n.next, o),
              error: n.error && Vo(n.error, o),
              complete: n.complete && Vo(n.complete, o),
            }))
          : (r = n);
      }
      this.destination = new jo(r);
    }
  };
function Ni(e) {
  $e.useDeprecatedSynchronousErrorHandling ? Sl(e) : Ai(e);
}
function lp(e) {
  throw e;
}
function Lo(e, n) {
  let { onStoppedNotification: t } = $e;
  t && Kt.setTimeout(() => t(e, n));
}
var cp = { closed: !0, next: Fo, error: lp, complete: Fo };
var en = (typeof Symbol == 'function' && Symbol.observable) || '@@observable';
function Ml(e) {
  return e;
}
function Tl(e) {
  return e.length === 0
    ? Ml
    : e.length === 1
      ? e[0]
      : function (t) {
          return e.reduce((i, r) => r(i), t);
        };
}
var ne = (() => {
  class e {
    constructor(t) {
      t && (this._subscribe = t);
    }
    lift(t) {
      let i = new e();
      return ((i.source = this), (i.operator = t), i);
    }
    subscribe(t, i, r) {
      let o = dp(t) ? t : new Xt(t, i, r);
      return (
        Jt(() => {
          let { operator: s, source: a } = this;
          o.add(s ? s.call(o, a) : a ? this._subscribe(o) : this._trySubscribe(o));
        }),
        o
      );
    }
    _trySubscribe(t) {
      try {
        return this._subscribe(t);
      } catch (i) {
        t.error(i);
      }
    }
    forEach(t, i) {
      return (
        (i = Al(i)),
        new i((r, o) => {
          let s = new Xt({
            next: (a) => {
              try {
                t(a);
              } catch (d) {
                (o(d), s.unsubscribe());
              }
            },
            error: o,
            complete: r,
          });
          this.subscribe(s);
        })
      );
    }
    _subscribe(t) {
      var i;
      return (i = this.source) === null || i === void 0 ? void 0 : i.subscribe(t);
    }
    [en]() {
      return this;
    }
    pipe(...t) {
      return Tl(t)(this);
    }
    toPromise(t) {
      return (
        (t = Al(t)),
        new t((i, r) => {
          let o;
          this.subscribe(
            (s) => (o = s),
            (s) => r(s),
            () => i(o),
          );
        })
      );
    }
  }
  return ((e.create = (n) => new e(n)), e);
})();
function Al(e) {
  var n;
  return (n = e ?? $e.Promise) !== null && n !== void 0 ? n : Promise;
}
function up(e) {
  return e && B(e.next) && B(e.error) && B(e.complete);
}
function dp(e) {
  return (e && e instanceof Ft) || (up(e) && Ti(e));
}
function fp(e) {
  return B(e?.lift);
}
function we(e) {
  return (n) => {
    if (fp(n))
      return n.lift(function (t) {
        try {
          return e(t, this);
        } catch (i) {
          this.error(i);
        }
      });
    throw new TypeError('Unable to lift unknown Observable type');
  };
}
function Ie(e, n, t, i, r) {
  return new Bo(e, n, t, i, r);
}
var Bo = class extends Ft {
  constructor(n, t, i, r, o, s) {
    (super(n),
      (this.onFinalize = o),
      (this.shouldUnsubscribe = s),
      (this._next = t
        ? function (a) {
            try {
              t(a);
            } catch (d) {
              n.error(d);
            }
          }
        : super._next),
      (this._error = r
        ? function (a) {
            try {
              r(a);
            } catch (d) {
              n.error(d);
            } finally {
              this.unsubscribe();
            }
          }
        : super._error),
      (this._complete = i
        ? function () {
            try {
              i();
            } catch (a) {
              n.error(a);
            } finally {
              this.unsubscribe();
            }
          }
        : super._complete));
  }
  unsubscribe() {
    var n;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      let { closed: t } = this;
      (super.unsubscribe(), !t && ((n = this.onFinalize) === null || n === void 0 || n.call(this)));
    }
  }
};
var Nl = Si(
  (e) =>
    function () {
      (e(this), (this.name = 'ObjectUnsubscribedError'), (this.message = 'object unsubscribed'));
    },
);
var Ye = (() => {
    class e extends ne {
      constructor() {
        (super(),
          (this.closed = !1),
          (this.currentObservers = null),
          (this.observers = []),
          (this.isStopped = !1),
          (this.hasError = !1),
          (this.thrownError = null));
      }
      lift(t) {
        let i = new Ri(this, this);
        return ((i.operator = t), i);
      }
      _throwIfClosed() {
        if (this.closed) throw new Nl();
      }
      next(t) {
        Jt(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            this.currentObservers || (this.currentObservers = Array.from(this.observers));
            for (let i of this.currentObservers) i.next(t);
          }
        });
      }
      error(t) {
        Jt(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            ((this.hasError = this.isStopped = !0), (this.thrownError = t));
            let { observers: i } = this;
            for (; i.length;) i.shift().error(t);
          }
        });
      }
      complete() {
        Jt(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            this.isStopped = !0;
            let { observers: t } = this;
            for (; t.length;) t.shift().complete();
          }
        });
      }
      unsubscribe() {
        ((this.isStopped = this.closed = !0), (this.observers = this.currentObservers = null));
      }
      get observed() {
        var t;
        return ((t = this.observers) === null || t === void 0 ? void 0 : t.length) > 0;
      }
      _trySubscribe(t) {
        return (this._throwIfClosed(), super._trySubscribe(t));
      }
      _subscribe(t) {
        return (this._throwIfClosed(), this._checkFinalizedStatuses(t), this._innerSubscribe(t));
      }
      _innerSubscribe(t) {
        let { hasError: i, isStopped: r, observers: o } = this;
        return i || r
          ? Po
          : ((this.currentObservers = null),
            o.push(t),
            new ge(() => {
              ((this.currentObservers = null), Pn(o, t));
            }));
      }
      _checkFinalizedStatuses(t) {
        let { hasError: i, thrownError: r, isStopped: o } = this;
        i ? t.error(r) : o && t.complete();
      }
      asObservable() {
        let t = new ne();
        return ((t.source = this), t);
      }
    }
    return ((e.create = (n, t) => new Ri(n, t)), e);
  })(),
  Ri = class extends Ye {
    constructor(n, t) {
      (super(), (this.destination = n), (this.source = t));
    }
    next(n) {
      var t, i;
      (i = (t = this.destination) === null || t === void 0 ? void 0 : t.next) === null ||
        i === void 0 ||
        i.call(t, n);
    }
    error(n) {
      var t, i;
      (i = (t = this.destination) === null || t === void 0 ? void 0 : t.error) === null ||
        i === void 0 ||
        i.call(t, n);
    }
    complete() {
      var n, t;
      (t = (n = this.destination) === null || n === void 0 ? void 0 : n.complete) === null ||
        t === void 0 ||
        t.call(n);
    }
    _subscribe(n) {
      var t, i;
      return (i = (t = this.source) === null || t === void 0 ? void 0 : t.subscribe(n)) !== null &&
        i !== void 0
        ? i
        : Po;
    }
  };
var Fn = class extends Ye {
  constructor(n) {
    (super(), (this._value = n));
  }
  get value() {
    return this.getValue();
  }
  _subscribe(n) {
    let t = super._subscribe(n);
    return (!t.closed && n.next(this._value), t);
  }
  getValue() {
    let { hasError: n, thrownError: t, _value: i } = this;
    if (n) throw t;
    return (this._throwIfClosed(), i);
  }
  next(n) {
    super.next((this._value = n));
  }
};
function Rl(e) {
  return e && B(e.schedule);
}
function Ol(e) {
  return e[e.length - 1];
}
function Pl(e) {
  return B(Ol(e)) ? e.pop() : void 0;
}
function Fl(e) {
  return Rl(Ol(e)) ? e.pop() : void 0;
}
function Vl(e, n, t, i) {
  function r(o) {
    return o instanceof t
      ? o
      : new t(function (s) {
          s(o);
        });
  }
  return new (t || (t = Promise))(function (o, s) {
    function a(h) {
      try {
        p(i.next(h));
      } catch (g) {
        s(g);
      }
    }
    function d(h) {
      try {
        p(i.throw(h));
      } catch (g) {
        s(g);
      }
    }
    function p(h) {
      h.done ? o(h.value) : r(h.value).then(a, d);
    }
    p((i = i.apply(e, n || [])).next());
  });
}
function kl(e) {
  var n = typeof Symbol == 'function' && Symbol.iterator,
    t = n && e[n],
    i = 0;
  if (t) return t.call(e);
  if (e && typeof e.length == 'number')
    return {
      next: function () {
        return (e && i >= e.length && (e = void 0), { value: e && e[i++], done: !e });
      },
    };
  throw new TypeError(n ? 'Object is not iterable.' : 'Symbol.iterator is not defined.');
}
function kt(e) {
  return this instanceof kt ? ((this.v = e), this) : new kt(e);
}
function Ll(e, n, t) {
  if (!Symbol.asyncIterator) throw new TypeError('Symbol.asyncIterator is not defined.');
  var i = t.apply(e, n || []),
    r,
    o = [];
  return (
    (r = Object.create((typeof AsyncIterator == 'function' ? AsyncIterator : Object).prototype)),
    a('next'),
    a('throw'),
    a('return', s),
    (r[Symbol.asyncIterator] = function () {
      return this;
    }),
    r
  );
  function s(C) {
    return function (w) {
      return Promise.resolve(w).then(C, g);
    };
  }
  function a(C, w) {
    i[C] &&
      ((r[C] = function (x) {
        return new Promise(function (N, H) {
          o.push([C, x, N, H]) > 1 || d(C, x);
        });
      }),
      w && (r[C] = w(r[C])));
  }
  function d(C, w) {
    try {
      p(i[C](w));
    } catch (x) {
      b(o[0][3], x);
    }
  }
  function p(C) {
    C.value instanceof kt ? Promise.resolve(C.value.v).then(h, g) : b(o[0][2], C);
  }
  function h(C) {
    d('next', C);
  }
  function g(C) {
    d('throw', C);
  }
  function b(C, w) {
    (C(w), o.shift(), o.length && d(o[0][0], o[0][1]));
  }
}
function jl(e) {
  if (!Symbol.asyncIterator) throw new TypeError('Symbol.asyncIterator is not defined.');
  var n = e[Symbol.asyncIterator],
    t;
  return n
    ? n.call(e)
    : ((e = typeof kl == 'function' ? kl(e) : e[Symbol.iterator]()),
      (t = {}),
      i('next'),
      i('throw'),
      i('return'),
      (t[Symbol.asyncIterator] = function () {
        return this;
      }),
      t);
  function i(o) {
    t[o] =
      e[o] &&
      function (s) {
        return new Promise(function (a, d) {
          ((s = e[o](s)), r(a, d, s.done, s.value));
        });
      };
  }
  function r(o, s, a, d) {
    Promise.resolve(d).then(function (p) {
      o({ value: p, done: a });
    }, s);
  }
}
var Oi = (e) => e && typeof e.length == 'number' && typeof e != 'function';
function Pi(e) {
  return B(e?.then);
}
function Fi(e) {
  return B(e[en]);
}
function ki(e) {
  return Symbol.asyncIterator && B(e?.[Symbol.asyncIterator]);
}
function Vi(e) {
  return new TypeError(
    `You provided ${e !== null && typeof e == 'object' ? 'an invalid object' : `'${e}'`} where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`,
  );
}
function pp() {
  return typeof Symbol != 'function' || !Symbol.iterator ? '@@iterator' : Symbol.iterator;
}
var Li = pp();
function ji(e) {
  return B(e?.[Li]);
}
function Bi(e) {
  return Ll(this, arguments, function* () {
    let t = e.getReader();
    try {
      for (;;) {
        let { value: i, done: r } = yield kt(t.read());
        if (r) return yield kt(void 0);
        yield yield kt(i);
      }
    } finally {
      t.releaseLock();
    }
  });
}
function Ui(e) {
  return B(e?.getReader);
}
function xe(e) {
  if (e instanceof ne) return e;
  if (e != null) {
    if (Fi(e)) return hp(e);
    if (Oi(e)) return mp(e);
    if (Pi(e)) return gp(e);
    if (ki(e)) return Bl(e);
    if (ji(e)) return _p(e);
    if (Ui(e)) return yp(e);
  }
  throw Vi(e);
}
function hp(e) {
  return new ne((n) => {
    let t = e[en]();
    if (B(t.subscribe)) return t.subscribe(n);
    throw new TypeError('Provided object does not correctly implement Symbol.observable');
  });
}
function mp(e) {
  return new ne((n) => {
    for (let t = 0; t < e.length && !n.closed; t++) n.next(e[t]);
    n.complete();
  });
}
function gp(e) {
  return new ne((n) => {
    e.then(
      (t) => {
        n.closed || (n.next(t), n.complete());
      },
      (t) => n.error(t),
    ).then(null, Ai);
  });
}
function _p(e) {
  return new ne((n) => {
    for (let t of e) if ((n.next(t), n.closed)) return;
    n.complete();
  });
}
function Bl(e) {
  return new ne((n) => {
    vp(e, n).catch((t) => n.error(t));
  });
}
function yp(e) {
  return Bl(Bi(e));
}
function vp(e, n) {
  var t, i, r, o;
  return Vl(this, void 0, void 0, function* () {
    try {
      for (t = jl(e); (i = yield t.next()), !i.done;) {
        let s = i.value;
        if ((n.next(s), n.closed)) return;
      }
    } catch (s) {
      r = { error: s };
    } finally {
      try {
        i && !i.done && (o = t.return) && (yield o.call(t));
      } finally {
        if (r) throw r.error;
      }
    }
    n.complete();
  });
}
function Pe(e, n, t, i = 0, r = !1) {
  let o = n.schedule(function () {
    (t(), r ? e.add(this.schedule(null, i)) : this.unsubscribe());
  }, i);
  if ((e.add(o), !r)) return o;
}
function $i(e, n = 0) {
  return we((t, i) => {
    t.subscribe(
      Ie(
        i,
        (r) => Pe(i, e, () => i.next(r), n),
        () => Pe(i, e, () => i.complete(), n),
        (r) => Pe(i, e, () => i.error(r), n),
      ),
    );
  });
}
function Hi(e, n = 0) {
  return we((t, i) => {
    i.add(e.schedule(() => t.subscribe(i), n));
  });
}
function Ul(e, n) {
  return xe(e).pipe(Hi(n), $i(n));
}
function $l(e, n) {
  return xe(e).pipe(Hi(n), $i(n));
}
function Hl(e, n) {
  return new ne((t) => {
    let i = 0;
    return n.schedule(function () {
      i === e.length ? t.complete() : (t.next(e[i++]), t.closed || this.schedule());
    });
  });
}
function Wl(e, n) {
  return new ne((t) => {
    let i;
    return (
      Pe(t, n, () => {
        ((i = e[Li]()),
          Pe(
            t,
            n,
            () => {
              let r, o;
              try {
                ({ value: r, done: o } = i.next());
              } catch (s) {
                t.error(s);
                return;
              }
              o ? t.complete() : t.next(r);
            },
            0,
            !0,
          ));
      }),
      () => B(i?.return) && i.return()
    );
  });
}
function Wi(e, n) {
  if (!e) throw new Error('Iterable cannot be null');
  return new ne((t) => {
    Pe(t, n, () => {
      let i = e[Symbol.asyncIterator]();
      Pe(
        t,
        n,
        () => {
          i.next().then((r) => {
            r.done ? t.complete() : t.next(r.value);
          });
        },
        0,
        !0,
      );
    });
  });
}
function Gl(e, n) {
  return Wi(Bi(e), n);
}
function ql(e, n) {
  if (e != null) {
    if (Fi(e)) return Ul(e, n);
    if (Oi(e)) return Hl(e, n);
    if (Pi(e)) return $l(e, n);
    if (ki(e)) return Wi(e, n);
    if (ji(e)) return Wl(e, n);
    if (Ui(e)) return Gl(e, n);
  }
  throw Vi(e);
}
function Vt(e, n) {
  return n ? ql(e, n) : xe(e);
}
function Gi(...e) {
  let n = Fl(e);
  return Vt(e, n);
}
function Se(e, n) {
  return we((t, i) => {
    let r = 0;
    t.subscribe(
      Ie(i, (o) => {
        i.next(e.call(n, o, r++));
      }),
    );
  });
}
var { isArray: Cp } = Array;
function Ep(e, n) {
  return Cp(n) ? e(...n) : e(n);
}
function zl(e) {
  return Se((n) => Ep(e, n));
}
var { isArray: Dp } = Array,
  { getPrototypeOf: bp, prototype: wp, keys: Ip } = Object;
function Zl(e) {
  if (e.length === 1) {
    let n = e[0];
    if (Dp(n)) return { args: n, keys: null };
    if (xp(n)) {
      let t = Ip(n);
      return { args: t.map((i) => n[i]), keys: t };
    }
  }
  return { args: e, keys: null };
}
function xp(e) {
  return e && typeof e == 'object' && bp(e) === wp;
}
function Ql(e, n) {
  return e.reduce((t, i, r) => ((t[i] = n[r]), t), {});
}
function Yl(e, n, t, i, r, o, s, a) {
  let d = [],
    p = 0,
    h = 0,
    g = !1,
    b = () => {
      g && !d.length && !p && n.complete();
    },
    C = (x) => (p < i ? w(x) : d.push(x)),
    w = (x) => {
      (o && n.next(x), p++);
      let N = !1;
      xe(t(x, h++)).subscribe(
        Ie(
          n,
          (H) => {
            (r?.(H), o ? C(H) : n.next(H));
          },
          () => {
            N = !0;
          },
          void 0,
          () => {
            if (N)
              try {
                for (p--; d.length && p < i;) {
                  let H = d.shift();
                  s ? Pe(n, s, () => w(H)) : w(H);
                }
                b();
              } catch (H) {
                n.error(H);
              }
          },
        ),
      );
    };
  return (
    e.subscribe(
      Ie(n, C, () => {
        ((g = !0), b());
      }),
    ),
    () => {
      a?.();
    }
  );
}
function qi(e, n, t = 1 / 0) {
  return B(n)
    ? qi((i, r) => Se((o, s) => n(i, o, r, s))(xe(e(i, r))), t)
    : (typeof n == 'number' && (t = n), we((i, r) => Yl(i, r, e, t)));
}
function Uo(...e) {
  let n = Pl(e),
    { args: t, keys: i } = Zl(e),
    r = new ne((o) => {
      let { length: s } = t;
      if (!s) {
        o.complete();
        return;
      }
      let a = new Array(s),
        d = s,
        p = s;
      for (let h = 0; h < s; h++) {
        let g = !1;
        xe(t[h]).subscribe(
          Ie(
            o,
            (b) => {
              (g || ((g = !0), p--), (a[h] = b));
            },
            () => d--,
            void 0,
            () => {
              (!d || !g) && (p || o.next(i ? Ql(i, a) : a), o.complete());
            },
          ),
        );
      }
    });
  return n ? r.pipe(zl(n)) : r;
}
function $o(e, n) {
  return we((t, i) => {
    let r = 0;
    t.subscribe(Ie(i, (o) => e.call(n, o, r++) && i.next(o)));
  });
}
function Ho(e, n) {
  return B(n) ? qi(e, n, 1) : qi(e, 1);
}
function Wo(e) {
  return we((n, t) => {
    try {
      n.subscribe(t);
    } finally {
      t.add(e);
    }
  });
}
function Go(e, n) {
  return we((t, i) => {
    let r = null,
      o = 0,
      s = !1,
      a = () => s && !r && i.complete();
    t.subscribe(
      Ie(
        i,
        (d) => {
          r?.unsubscribe();
          let p = 0,
            h = o++;
          xe(e(d, h)).subscribe(
            (r = Ie(
              i,
              (g) => i.next(n ? n(d, g, h, p++) : g),
              () => {
                ((r = null), a());
              },
            )),
          );
        },
        () => {
          ((s = !0), a());
        },
      ),
    );
  });
}
var Sp = 'https://g.co/ng/security#xss',
  F = class extends Error {
    constructor(n, t) {
      (super(xr(n, t)), (this.code = n));
    }
  };
function xr(e, n) {
  return `${`NG0${Math.abs(e)}`}${n ? ': ' + n : ''}`;
}
function Zn(e) {
  return { toString: e }.toString();
}
var zi = '__parameters__';
function Mp(e) {
  return function (...t) {
    if (e) {
      let i = e(...t);
      for (let r in i) this[r] = i[r];
    }
  };
}
function kc(e, n, t) {
  return Zn(() => {
    let i = Mp(n);
    function r(...o) {
      if (this instanceof r) return (i.apply(this, o), this);
      let s = new r(...o);
      return ((a.annotation = s), a);
      function a(d, p, h) {
        let g = d.hasOwnProperty(zi) ? d[zi] : Object.defineProperty(d, zi, { value: [] })[zi];
        for (; g.length <= h;) g.push(null);
        return ((g[h] = g[h] || []).push(s), d);
      }
    }
    return (
      t && (r.prototype = Object.create(t.prototype)),
      (r.prototype.ngMetadataName = e),
      (r.annotationCls = r),
      r
    );
  });
}
var kn = globalThis;
function X(e) {
  for (let n in e) if (e[n] === X) return n;
  throw Error('Could not find renamed property on target object.');
}
function Tp(e, n) {
  for (let t in n) n.hasOwnProperty(t) && !e.hasOwnProperty(t) && (e[t] = n[t]);
}
function Ne(e) {
  if (typeof e == 'string') return e;
  if (Array.isArray(e)) return '[' + e.map(Ne).join(', ') + ']';
  if (e == null) return '' + e;
  if (e.overriddenName) return `${e.overriddenName}`;
  if (e.name) return `${e.name}`;
  let n = e.toString();
  if (n == null) return '' + n;
  let t = n.indexOf(`
`);
  return t === -1 ? n : n.substring(0, t);
}
function Kl(e, n) {
  return e == null || e === '' ? (n === null ? '' : n) : n == null || n === '' ? e : e + ' ' + n;
}
var Ap = X({ __forward_ref__: X });
function Re(e) {
  return (
    (e.__forward_ref__ = Re),
    (e.toString = function () {
      return Ne(this());
    }),
    e
  );
}
function _e(e) {
  return Vc(e) ? e() : e;
}
function Vc(e) {
  return typeof e == 'function' && e.hasOwnProperty(Ap) && e.__forward_ref__ === Re;
}
function Q(e) {
  return { token: e.token, providedIn: e.providedIn || null, factory: e.factory, value: void 0 };
}
function zt(e) {
  return { providers: e.providers || [], imports: e.imports || [] };
}
function qs(e) {
  return Jl(e, Lc) || Jl(e, jc);
}
function Jl(e, n) {
  return e.hasOwnProperty(n) ? e[n] : null;
}
function Np(e) {
  let n = e && (e[Lc] || e[jc]);
  return n || null;
}
function Xl(e) {
  return e && (e.hasOwnProperty(ec) || e.hasOwnProperty(Rp)) ? e[ec] : null;
}
var Lc = X({ ɵprov: X }),
  ec = X({ ɵinj: X }),
  jc = X({ ngInjectableDef: X }),
  Rp = X({ ngInjectorDef: X }),
  P = class {
    constructor(n, t) {
      ((this._desc = n),
        (this.ngMetadataName = 'InjectionToken'),
        (this.ɵprov = void 0),
        typeof t == 'number'
          ? (this.__NG_ELEMENT_ID__ = t)
          : t !== void 0 &&
            (this.ɵprov = Q({
              token: this,
              providedIn: t.providedIn || 'root',
              factory: t.factory,
            })));
    }
    get multi() {
      return this;
    }
    toString() {
      return `InjectionToken ${this._desc}`;
    }
  };
function Bc(e) {
  return e && !!e.ɵproviders;
}
var Op = X({ ɵcmp: X }),
  Pp = X({ ɵdir: X }),
  Fp = X({ ɵpipe: X });
var nr = X({ ɵfac: X }),
  jn = X({ __NG_ELEMENT_ID__: X }),
  tc = X({ __NG_ENV_ID__: X });
function pe(e) {
  return typeof e == 'string' ? e : e == null ? '' : String(e);
}
function kp(e) {
  return typeof e == 'function'
    ? e.name || e.toString()
    : typeof e == 'object' && e != null && typeof e.type == 'function'
      ? e.type.name || e.type.toString()
      : pe(e);
}
function Vp(e, n) {
  let t = n ? `. Dependency path: ${n.join(' > ')} > ${e}` : '';
  throw new F(-200, e);
}
function zs(e, n) {
  throw new F(-201, !1);
}
var U = (function (e) {
    return (
      (e[(e.Default = 0)] = 'Default'),
      (e[(e.Host = 1)] = 'Host'),
      (e[(e.Self = 2)] = 'Self'),
      (e[(e.SkipSelf = 4)] = 'SkipSelf'),
      (e[(e.Optional = 8)] = 'Optional'),
      e
    );
  })(U || {}),
  ss;
function Uc() {
  return ss;
}
function Me(e) {
  let n = ss;
  return ((ss = e), n);
}
function $c(e, n, t) {
  let i = qs(e);
  if (i && i.providedIn == 'root') return i.value === void 0 ? (i.value = i.factory()) : i.value;
  if (t & U.Optional) return null;
  if (n !== void 0) return n;
  zs(e, 'Injector');
}
var Lp = {},
  Bn = Lp,
  as = '__NG_DI_FLAG__',
  ir = 'ngTempTokenPath',
  jp = 'ngTokenPath',
  Bp = /\n/gm,
  Up = '\u0275',
  nc = '__source',
  on;
function $p() {
  return on;
}
function Et(e) {
  let n = on;
  return ((on = e), n);
}
function Hp(e, n = U.Default) {
  if (on === void 0) throw new F(-203, !1);
  return on === null ? $c(e, void 0, n) : on.get(e, n & U.Optional ? null : void 0, n);
}
function $(e, n = U.Default) {
  return (Uc() || Hp)(_e(e), n);
}
function k(e, n = U.Default) {
  return $(e, Sr(n));
}
function Sr(e) {
  return typeof e > 'u' || typeof e == 'number'
    ? e
    : 0 | (e.optional && 8) | (e.host && 1) | (e.self && 2) | (e.skipSelf && 4);
}
function ls(e) {
  let n = [];
  for (let t = 0; t < e.length; t++) {
    let i = _e(e[t]);
    if (Array.isArray(i)) {
      if (i.length === 0) throw new F(900, !1);
      let r,
        o = U.Default;
      for (let s = 0; s < i.length; s++) {
        let a = i[s],
          d = Wp(a);
        typeof d == 'number' ? (d === -1 ? (r = a.token) : (o |= d)) : (r = a);
      }
      n.push($(r, o));
    } else n.push($(i));
  }
  return n;
}
function Hc(e, n) {
  return ((e[as] = n), (e.prototype[as] = n), e);
}
function Wp(e) {
  return e[as];
}
function Gp(e, n, t, i) {
  let r = e[ir];
  throw (
    n[nc] && r.unshift(n[nc]),
    (e.message = qp(
      `
` + e.message,
      r,
      t,
      i,
    )),
    (e[jp] = r),
    (e[ir] = null),
    e
  );
}
function qp(e, n, t, i = null) {
  e =
    e &&
    e.charAt(0) ===
      `
` &&
    e.charAt(1) == Up
      ? e.slice(2)
      : e;
  let r = Ne(n);
  if (Array.isArray(n)) r = n.map(Ne).join(' -> ');
  else if (typeof n == 'object') {
    let o = [];
    for (let s in n)
      if (n.hasOwnProperty(s)) {
        let a = n[s];
        o.push(s + ':' + (typeof a == 'string' ? JSON.stringify(a) : Ne(a)));
      }
    r = `{${o.join(', ')}}`;
  }
  return `${t}${i ? '(' + i + ')' : ''}[${r}]: ${e.replace(
    Bp,
    `
  `,
  )}`;
}
var Wc = Hc(kc('Optional'), 8);
var zp = Hc(kc('SkipSelf'), 4);
function Bt(e, n) {
  let t = e.hasOwnProperty(nr);
  return t ? e[nr] : null;
}
function Zs(e, n) {
  e.forEach((t) => (Array.isArray(t) ? Zs(t, n) : n(t)));
}
function Gc(e, n, t) {
  n >= e.length ? e.push(t) : e.splice(n, 0, t);
}
function rr(e, n) {
  return n >= e.length - 1 ? e.pop() : e.splice(n, 1)[0];
}
function Zp(e, n, t, i) {
  let r = e.length;
  if (r == n) e.push(t, i);
  else if (r === 1) (e.push(i, e[0]), (e[0] = t));
  else {
    for (r--, e.push(e[r - 1], e[r]); r > n;) {
      let o = r - 2;
      ((e[r] = e[o]), r--);
    }
    ((e[n] = t), (e[n + 1] = i));
  }
}
function Qp(e, n, t) {
  let i = Qn(e, n);
  return (i >= 0 ? (e[i | 1] = t) : ((i = ~i), Zp(e, i, n, t)), i);
}
function qo(e, n) {
  let t = Qn(e, n);
  if (t >= 0) return e[t | 1];
}
function Qn(e, n) {
  return Yp(e, n, 1);
}
function Yp(e, n, t) {
  let i = 0,
    r = e.length >> t;
  for (; r !== i;) {
    let o = i + ((r - i) >> 1),
      s = e[o << t];
    if (n === s) return o << t;
    s > n ? (r = o) : (i = o + 1);
  }
  return ~(r << t);
}
var an = {},
  Fe = [],
  Un = new P(''),
  qc = new P('', -1),
  zc = new P(''),
  or = class {
    get(n, t = Bn) {
      if (t === Bn) {
        let i = new Error(`NullInjectorError: No provider for ${Ne(n)}!`);
        throw ((i.name = 'NullInjectorError'), i);
      }
      return t;
    }
  },
  Zc = (function (e) {
    return ((e[(e.OnPush = 0)] = 'OnPush'), (e[(e.Default = 1)] = 'Default'), e);
  })(Zc || {}),
  Xe = (function (e) {
    return (
      (e[(e.Emulated = 0)] = 'Emulated'),
      (e[(e.None = 2)] = 'None'),
      (e[(e.ShadowDom = 3)] = 'ShadowDom'),
      e
    );
  })(Xe || {}),
  wt = (function (e) {
    return (
      (e[(e.None = 0)] = 'None'),
      (e[(e.SignalBased = 1)] = 'SignalBased'),
      (e[(e.HasDecoratorInputTransform = 2)] = 'HasDecoratorInputTransform'),
      e
    );
  })(wt || {});
function Kp(e, n, t) {
  let i = e.length;
  for (;;) {
    let r = e.indexOf(n, t);
    if (r === -1) return r;
    if (r === 0 || e.charCodeAt(r - 1) <= 32) {
      let o = n.length;
      if (r + o === i || e.charCodeAt(r + o) <= 32) return r;
    }
    t = r + 1;
  }
}
function cs(e, n, t) {
  let i = 0;
  for (; i < t.length;) {
    let r = t[i];
    if (typeof r == 'number') {
      if (r !== 0) break;
      i++;
      let o = t[i++],
        s = t[i++],
        a = t[i++];
      e.setAttribute(n, s, a, o);
    } else {
      let o = r,
        s = t[++i];
      (Xp(o) ? e.setProperty(n, o, s) : e.setAttribute(n, o, s), i++);
    }
  }
  return i;
}
function Jp(e) {
  return e === 3 || e === 4 || e === 6;
}
function Xp(e) {
  return e.charCodeAt(0) === 64;
}
function $n(e, n) {
  if (!(n === null || n.length === 0))
    if (e === null || e.length === 0) e = n.slice();
    else {
      let t = -1;
      for (let i = 0; i < n.length; i++) {
        let r = n[i];
        typeof r == 'number'
          ? (t = r)
          : t === 0 || (t === -1 || t === 2 ? ic(e, t, r, null, n[++i]) : ic(e, t, r, null, null));
      }
    }
  return e;
}
function ic(e, n, t, i, r) {
  let o = 0,
    s = e.length;
  if (n === -1) s = -1;
  else
    for (; o < e.length;) {
      let a = e[o++];
      if (typeof a == 'number') {
        if (a === n) {
          s = -1;
          break;
        } else if (a > n) {
          s = o - 1;
          break;
        }
      }
    }
  for (; o < e.length;) {
    let a = e[o];
    if (typeof a == 'number') break;
    if (a === t) {
      if (i === null) {
        r !== null && (e[o + 1] = r);
        return;
      } else if (i === e[o + 1]) {
        e[o + 2] = r;
        return;
      }
    }
    (o++, i !== null && o++, r !== null && o++);
  }
  (s !== -1 && (e.splice(s, 0, n), (o = s + 1)),
    e.splice(o++, 0, t),
    i !== null && e.splice(o++, 0, i),
    r !== null && e.splice(o++, 0, r));
}
var Qc = 'ng-template';
function eh(e, n, t, i) {
  let r = 0;
  if (i) {
    for (; r < n.length && typeof n[r] == 'string'; r += 2)
      if (n[r] === 'class' && Kp(n[r + 1].toLowerCase(), t, 0) !== -1) return !0;
  } else if (Qs(e)) return !1;
  if (((r = n.indexOf(1, r)), r > -1)) {
    let o;
    for (; ++r < n.length && typeof (o = n[r]) == 'string';) if (o.toLowerCase() === t) return !0;
  }
  return !1;
}
function Qs(e) {
  return e.type === 4 && e.value !== Qc;
}
function th(e, n, t) {
  let i = e.type === 4 && !t ? Qc : e.value;
  return n === i;
}
function nh(e, n, t) {
  let i = 4,
    r = e.attrs,
    o = r !== null ? oh(r) : 0,
    s = !1;
  for (let a = 0; a < n.length; a++) {
    let d = n[a];
    if (typeof d == 'number') {
      if (!s && !He(i) && !He(d)) return !1;
      if (s && He(d)) continue;
      ((s = !1), (i = d | (i & 1)));
      continue;
    }
    if (!s)
      if (i & 4) {
        if (((i = 2 | (i & 1)), (d !== '' && !th(e, d, t)) || (d === '' && n.length === 1))) {
          if (He(i)) return !1;
          s = !0;
        }
      } else if (i & 8) {
        if (r === null || !eh(e, r, d, t)) {
          if (He(i)) return !1;
          s = !0;
        }
      } else {
        let p = n[++a],
          h = ih(d, r, Qs(e), t);
        if (h === -1) {
          if (He(i)) return !1;
          s = !0;
          continue;
        }
        if (p !== '') {
          let g;
          if ((h > o ? (g = '') : (g = r[h + 1].toLowerCase()), i & 2 && p !== g)) {
            if (He(i)) return !1;
            s = !0;
          }
        }
      }
  }
  return He(i) || s;
}
function He(e) {
  return (e & 1) === 0;
}
function ih(e, n, t, i) {
  if (n === null) return -1;
  let r = 0;
  if (i || !t) {
    let o = !1;
    for (; r < n.length;) {
      let s = n[r];
      if (s === e) return r;
      if (s === 3 || s === 6) o = !0;
      else if (s === 1 || s === 2) {
        let a = n[++r];
        for (; typeof a == 'string';) a = n[++r];
        continue;
      } else {
        if (s === 4) break;
        if (s === 0) {
          r += 4;
          continue;
        }
      }
      r += o ? 1 : 2;
    }
    return -1;
  } else return sh(n, e);
}
function rh(e, n, t = !1) {
  for (let i = 0; i < n.length; i++) if (nh(e, n[i], t)) return !0;
  return !1;
}
function oh(e) {
  for (let n = 0; n < e.length; n++) {
    let t = e[n];
    if (Jp(t)) return n;
  }
  return e.length;
}
function sh(e, n) {
  let t = e.indexOf(4);
  if (t > -1)
    for (t++; t < e.length;) {
      let i = e[t];
      if (typeof i == 'number') return -1;
      if (i === n) return t;
      t++;
    }
  return -1;
}
function rc(e, n) {
  return e ? ':not(' + n.trim() + ')' : n;
}
function ah(e) {
  let n = e[0],
    t = 1,
    i = 2,
    r = '',
    o = !1;
  for (; t < e.length;) {
    let s = e[t];
    if (typeof s == 'string')
      if (i & 2) {
        let a = e[++t];
        r += '[' + s + (a.length > 0 ? '="' + a + '"' : '') + ']';
      } else i & 8 ? (r += '.' + s) : i & 4 && (r += ' ' + s);
    else (r !== '' && !He(s) && ((n += rc(o, r)), (r = '')), (i = s), (o = o || !He(i)));
    t++;
  }
  return (r !== '' && (n += rc(o, r)), n);
}
function lh(e) {
  return e.map(ah).join(',');
}
function ch(e) {
  let n = [],
    t = [],
    i = 1,
    r = 2;
  for (; i < e.length;) {
    let o = e[i];
    if (typeof o == 'string') r === 2 ? o !== '' && n.push(o, e[++i]) : r === 8 && t.push(o);
    else {
      if (!He(r)) break;
      r = o;
    }
    i++;
  }
  return { attrs: n, classes: t };
}
function Yc(e) {
  return Zn(() => {
    let n = eu(e),
      t = ee(Z({}, n), {
        decls: e.decls,
        vars: e.vars,
        template: e.template,
        consts: e.consts || null,
        ngContentSelectors: e.ngContentSelectors,
        onPush: e.changeDetection === Zc.OnPush,
        directiveDefs: null,
        pipeDefs: null,
        dependencies: (n.standalone && e.dependencies) || null,
        getStandaloneInjector: null,
        signals: e.signals ?? !1,
        data: e.data || {},
        encapsulation: e.encapsulation || Xe.Emulated,
        styles: e.styles || Fe,
        _: null,
        schemas: e.schemas || null,
        tView: null,
        id: '',
      });
    tu(t);
    let i = e.dependencies;
    return ((t.directiveDefs = sc(i, !1)), (t.pipeDefs = sc(i, !0)), (t.id = ph(t)), t);
  });
}
function uh(e) {
  return ln(e) || Jc(e);
}
function dh(e) {
  return e !== null;
}
function Zt(e) {
  return Zn(() => ({
    type: e.type,
    bootstrap: e.bootstrap || Fe,
    declarations: e.declarations || Fe,
    imports: e.imports || Fe,
    exports: e.exports || Fe,
    transitiveCompileScopes: null,
    schemas: e.schemas || null,
    id: e.id || null,
  }));
}
function oc(e, n) {
  if (e == null) return an;
  let t = {};
  for (let i in e)
    if (e.hasOwnProperty(i)) {
      let r = e[i],
        o,
        s,
        a = wt.None;
      (Array.isArray(r) ? ((a = r[0]), (o = r[1]), (s = r[2] ?? o)) : ((o = r), (s = r)),
        n ? ((t[o] = a !== wt.None ? [i, a] : i), (n[o] = s)) : (t[o] = i));
    }
  return t;
}
function ie(e) {
  return Zn(() => {
    let n = eu(e);
    return (tu(n), n);
  });
}
function Kc(e) {
  return {
    type: e.type,
    name: e.name,
    factory: null,
    pure: e.pure !== !1,
    standalone: e.standalone === !0,
    onDestroy: e.type.prototype.ngOnDestroy || null,
  };
}
function ln(e) {
  return e[Op] || null;
}
function Jc(e) {
  return e[Pp] || null;
}
function Xc(e) {
  return e[Fp] || null;
}
function fh(e) {
  let n = ln(e) || Jc(e) || Xc(e);
  return n !== null ? n.standalone : !1;
}
function eu(e) {
  let n = {};
  return {
    type: e.type,
    providersResolver: null,
    factory: null,
    hostBindings: e.hostBindings || null,
    hostVars: e.hostVars || 0,
    hostAttrs: e.hostAttrs || null,
    contentQueries: e.contentQueries || null,
    declaredInputs: n,
    inputTransforms: null,
    inputConfig: e.inputs || an,
    exportAs: e.exportAs || null,
    standalone: e.standalone === !0,
    signals: e.signals === !0,
    selectors: e.selectors || Fe,
    viewQuery: e.viewQuery || null,
    features: e.features || null,
    setInput: null,
    findHostDirectiveDefs: null,
    hostDirectives: null,
    inputs: oc(e.inputs, n),
    outputs: oc(e.outputs),
    debugInfo: null,
  };
}
function tu(e) {
  e.features?.forEach((n) => n(e));
}
function sc(e, n) {
  if (!e) return null;
  let t = n ? Xc : uh;
  return () => (typeof e == 'function' ? e() : e).map((i) => t(i)).filter(dh);
}
function ph(e) {
  let n = 0,
    t = [
      e.selectors,
      e.ngContentSelectors,
      e.hostVars,
      e.hostAttrs,
      e.consts,
      e.vars,
      e.decls,
      e.encapsulation,
      e.standalone,
      e.signals,
      e.exportAs,
      JSON.stringify(e.inputs),
      JSON.stringify(e.outputs),
      Object.getOwnPropertyNames(e.type.prototype),
      !!e.contentQueries,
      !!e.viewQuery,
    ].join('|');
  for (let r of t) n = (Math.imul(31, n) + r.charCodeAt(0)) << 0;
  return ((n += 2147483648), 'c' + n);
}
function Ys(e) {
  return { ɵproviders: e };
}
function hh(...e) {
  return { ɵproviders: nu(!0, e), ɵfromNgModule: !0 };
}
function nu(e, ...n) {
  let t = [],
    i = new Set(),
    r,
    o = (s) => {
      t.push(s);
    };
  return (
    Zs(n, (s) => {
      let a = s;
      us(a, o, [], i) && ((r ||= []), r.push(a));
    }),
    r !== void 0 && iu(r, o),
    t
  );
}
function iu(e, n) {
  for (let t = 0; t < e.length; t++) {
    let { ngModule: i, providers: r } = e[t];
    Ks(r, (o) => {
      n(o, i);
    });
  }
}
function us(e, n, t, i) {
  if (((e = _e(e)), !e)) return !1;
  let r = null,
    o = Xl(e),
    s = !o && ln(e);
  if (!o && !s) {
    let d = e.ngModule;
    if (((o = Xl(d)), o)) r = d;
    else return !1;
  } else {
    if (s && !s.standalone) return !1;
    r = e;
  }
  let a = i.has(r);
  if (s) {
    if (a) return !1;
    if ((i.add(r), s.dependencies)) {
      let d = typeof s.dependencies == 'function' ? s.dependencies() : s.dependencies;
      for (let p of d) us(p, n, t, i);
    }
  } else if (o) {
    if (o.imports != null && !a) {
      i.add(r);
      let p;
      try {
        Zs(o.imports, (h) => {
          us(h, n, t, i) && ((p ||= []), p.push(h));
        });
      } finally {
      }
      p !== void 0 && iu(p, n);
    }
    if (!a) {
      let p = Bt(r) || (() => new r());
      (n({ provide: r, useFactory: p, deps: Fe }, r),
        n({ provide: zc, useValue: r, multi: !0 }, r),
        n({ provide: Un, useValue: () => $(r), multi: !0 }, r));
    }
    let d = o.providers;
    if (d != null && !a) {
      let p = e;
      Ks(d, (h) => {
        n(h, p);
      });
    }
  } else return !1;
  return r !== e && e.providers !== void 0;
}
function Ks(e, n) {
  for (let t of e) (Bc(t) && (t = t.ɵproviders), Array.isArray(t) ? Ks(t, n) : n(t));
}
var mh = X({ provide: String, useValue: X });
function ru(e) {
  return e !== null && typeof e == 'object' && mh in e;
}
function gh(e) {
  return !!(e && e.useExisting);
}
function _h(e) {
  return !!(e && e.useFactory);
}
function cn(e) {
  return typeof e == 'function';
}
function yh(e) {
  return !!e.useClass;
}
var Mr = new P(''),
  Ki = {},
  vh = {},
  zo;
function Js() {
  return (zo === void 0 && (zo = new or()), zo);
}
var et = class {},
  Hn = class extends et {
    get destroyed() {
      return this._destroyed;
    }
    constructor(n, t, i, r) {
      (super(),
        (this.parent = t),
        (this.source = i),
        (this.scopes = r),
        (this.records = new Map()),
        (this._ngOnDestroyHooks = new Set()),
        (this._onDestroyHooks = []),
        (this._destroyed = !1),
        fs(n, (s) => this.processProvider(s)),
        this.records.set(qc, tn(void 0, this)),
        r.has('environment') && this.records.set(et, tn(void 0, this)));
      let o = this.records.get(Mr);
      (o != null && typeof o.value == 'string' && this.scopes.add(o.value),
        (this.injectorDefTypes = new Set(this.get(zc, Fe, U.Self))));
    }
    destroy() {
      (this.assertNotDestroyed(), (this._destroyed = !0));
      let n = W(null);
      try {
        for (let i of this._ngOnDestroyHooks) i.ngOnDestroy();
        let t = this._onDestroyHooks;
        this._onDestroyHooks = [];
        for (let i of t) i();
      } finally {
        (this.records.clear(), this._ngOnDestroyHooks.clear(), this.injectorDefTypes.clear(), W(n));
      }
    }
    onDestroy(n) {
      return (
        this.assertNotDestroyed(),
        this._onDestroyHooks.push(n),
        () => this.removeOnDestroy(n)
      );
    }
    runInContext(n) {
      this.assertNotDestroyed();
      let t = Et(this),
        i = Me(void 0),
        r;
      try {
        return n();
      } finally {
        (Et(t), Me(i));
      }
    }
    get(n, t = Bn, i = U.Default) {
      if ((this.assertNotDestroyed(), n.hasOwnProperty(tc))) return n[tc](this);
      i = Sr(i);
      let r,
        o = Et(this),
        s = Me(void 0);
      try {
        if (!(i & U.SkipSelf)) {
          let d = this.records.get(n);
          if (d === void 0) {
            let p = wh(n) && qs(n);
            (p && this.injectableDefInScope(p) ? (d = tn(ds(n), Ki)) : (d = null),
              this.records.set(n, d));
          }
          if (d != null) return this.hydrate(n, d);
        }
        let a = i & U.Self ? Js() : this.parent;
        return ((t = i & U.Optional && t === Bn ? null : t), a.get(n, t));
      } catch (a) {
        if (a.name === 'NullInjectorError') {
          if (((a[ir] = a[ir] || []).unshift(Ne(n)), o)) throw a;
          return Gp(a, n, 'R3InjectorError', this.source);
        } else throw a;
      } finally {
        (Me(s), Et(o));
      }
    }
    resolveInjectorInitializers() {
      let n = W(null),
        t = Et(this),
        i = Me(void 0),
        r;
      try {
        let o = this.get(Un, Fe, U.Self);
        for (let s of o) s();
      } finally {
        (Et(t), Me(i), W(n));
      }
    }
    toString() {
      let n = [],
        t = this.records;
      for (let i of t.keys()) n.push(Ne(i));
      return `R3Injector[${n.join(', ')}]`;
    }
    assertNotDestroyed() {
      if (this._destroyed) throw new F(205, !1);
    }
    processProvider(n) {
      n = _e(n);
      let t = cn(n) ? n : _e(n && n.provide),
        i = Eh(n);
      if (!cn(n) && n.multi === !0) {
        let r = this.records.get(t);
        (r || ((r = tn(void 0, Ki, !0)), (r.factory = () => ls(r.multi)), this.records.set(t, r)),
          (t = n),
          r.multi.push(n));
      }
      this.records.set(t, i);
    }
    hydrate(n, t) {
      let i = W(null);
      try {
        return (
          t.value === Ki && ((t.value = vh), (t.value = t.factory())),
          typeof t.value == 'object' &&
            t.value &&
            bh(t.value) &&
            this._ngOnDestroyHooks.add(t.value),
          t.value
        );
      } finally {
        W(i);
      }
    }
    injectableDefInScope(n) {
      if (!n.providedIn) return !1;
      let t = _e(n.providedIn);
      return typeof t == 'string'
        ? t === 'any' || this.scopes.has(t)
        : this.injectorDefTypes.has(t);
    }
    removeOnDestroy(n) {
      let t = this._onDestroyHooks.indexOf(n);
      t !== -1 && this._onDestroyHooks.splice(t, 1);
    }
  };
function ds(e) {
  let n = qs(e),
    t = n !== null ? n.factory : Bt(e);
  if (t !== null) return t;
  if (e instanceof P) throw new F(204, !1);
  if (e instanceof Function) return Ch(e);
  throw new F(204, !1);
}
function Ch(e) {
  if (e.length > 0) throw new F(204, !1);
  let t = Np(e);
  return t !== null ? () => t.factory(e) : () => new e();
}
function Eh(e) {
  if (ru(e)) return tn(void 0, e.useValue);
  {
    let n = ou(e);
    return tn(n, Ki);
  }
}
function ou(e, n, t) {
  let i;
  if (cn(e)) {
    let r = _e(e);
    return Bt(r) || ds(r);
  } else if (ru(e)) i = () => _e(e.useValue);
  else if (_h(e)) i = () => e.useFactory(...ls(e.deps || []));
  else if (gh(e)) i = () => $(_e(e.useExisting));
  else {
    let r = _e(e && (e.useClass || e.provide));
    if (Dh(e)) i = () => new r(...ls(e.deps));
    else return Bt(r) || ds(r);
  }
  return i;
}
function tn(e, n, t = !1) {
  return { factory: e, value: n, multi: t ? [] : void 0 };
}
function Dh(e) {
  return !!e.deps;
}
function bh(e) {
  return e !== null && typeof e == 'object' && typeof e.ngOnDestroy == 'function';
}
function wh(e) {
  return typeof e == 'function' || (typeof e == 'object' && e instanceof P);
}
function fs(e, n) {
  for (let t of e) Array.isArray(t) ? fs(t, n) : t && Bc(t) ? fs(t.ɵproviders, n) : n(t);
}
function su(e, n) {
  e instanceof Hn && e.assertNotDestroyed();
  let t,
    i = Et(e),
    r = Me(void 0);
  try {
    return n();
  } finally {
    (Et(i), Me(r));
  }
}
function Ih() {
  return Uc() !== void 0 || $p() != null;
}
function xh(e) {
  return typeof e == 'function';
}
var ft = 0,
  j = 1,
  O = 2,
  ye = 3,
  We = 4,
  ze = 5,
  sr = 6,
  ar = 7,
  Ge = 8,
  un = 9,
  lt = 10,
  se = 11,
  Wn = 12,
  ac = 13,
  Cn = 14,
  tt = 15,
  dn = 16,
  nn = 17,
  fn = 18,
  Tr = 19,
  au = 20,
  Dt = 21,
  Zo = 22,
  ke = 23,
  qe = 25,
  lu = 1;
var Ut = 7,
  lr = 8,
  cr = 9,
  Ve = 10,
  ur = (function (e) {
    return (
      (e[(e.None = 0)] = 'None'),
      (e[(e.HasTransplantedViews = 2)] = 'HasTransplantedViews'),
      e
    );
  })(ur || {});
function bt(e) {
  return Array.isArray(e) && typeof e[lu] == 'object';
}
function pt(e) {
  return Array.isArray(e) && e[lu] === !0;
}
function Xs(e) {
  return (e.flags & 4) !== 0;
}
function Ar(e) {
  return e.componentOffset > -1;
}
function Nr(e) {
  return (e.flags & 1) === 1;
}
function It(e) {
  return !!e.template;
}
function ps(e) {
  return (e[O] & 512) !== 0;
}
var hs = class {
  constructor(n, t, i) {
    ((this.previousValue = n), (this.currentValue = t), (this.firstChange = i));
  }
  isFirstChange() {
    return this.firstChange;
  }
};
function cu(e, n, t, i) {
  n !== null ? n.applyValueToInputSignal(n, i) : (e[t] = i);
}
function Yn() {
  return uu;
}
function uu(e) {
  return (e.type.prototype.ngOnChanges && (e.setInput = Mh), Sh);
}
Yn.ngInherit = !0;
function Sh() {
  let e = fu(this),
    n = e?.current;
  if (n) {
    let t = e.previous;
    if (t === an) e.previous = n;
    else for (let i in n) t[i] = n[i];
    ((e.current = null), this.ngOnChanges(n));
  }
}
function Mh(e, n, t, i, r) {
  let o = this.declaredInputs[i],
    s = fu(e) || Th(e, { previous: an, current: null }),
    a = s.current || (s.current = {}),
    d = s.previous,
    p = d[o];
  ((a[o] = new hs(p && p.currentValue, t, d === an)), cu(e, n, r, t));
}
var du = '__ngSimpleChanges__';
function fu(e) {
  return e[du] || null;
}
function Th(e, n) {
  return (e[du] = n);
}
var lc = null;
var Ke = function (e, n, t) {
    lc?.(e, n, t);
  },
  Ah = 'svg',
  Nh = 'math';
function nt(e) {
  for (; Array.isArray(e);) e = e[ft];
  return e;
}
function pu(e, n) {
  return nt(n[e]);
}
function Le(e, n) {
  return nt(n[e.index]);
}
function hu(e, n) {
  return e.data[n];
}
function Rh(e, n) {
  return e[n];
}
function St(e, n) {
  let t = n[e];
  return bt(t) ? t : t[ft];
}
function ea(e) {
  return (e[O] & 128) === 128;
}
function Oh(e) {
  return pt(e[ye]);
}
function pn(e, n) {
  return n == null ? null : e[n];
}
function mu(e) {
  e[nn] = 0;
}
function gu(e) {
  e[O] & 1024 || ((e[O] |= 1024), ea(e) && Or(e));
}
function Ph(e, n) {
  for (; e > 0;) ((n = n[Cn]), e--);
  return n;
}
function Rr(e) {
  return !!(e[O] & 9216 || e[ke]?.dirty);
}
function ms(e) {
  (e[lt].changeDetectionScheduler?.notify(8), e[O] & 64 && (e[O] |= 1024), Rr(e) && Or(e));
}
function Or(e) {
  e[lt].changeDetectionScheduler?.notify(0);
  let n = $t(e);
  for (; n !== null && !(n[O] & 8192 || ((n[O] |= 8192), !ea(n)));) n = $t(n);
}
function _u(e, n) {
  if ((e[O] & 256) === 256) throw new F(911, !1);
  (e[Dt] === null && (e[Dt] = []), e[Dt].push(n));
}
function Fh(e, n) {
  if (e[Dt] === null) return;
  let t = e[Dt].indexOf(n);
  t !== -1 && e[Dt].splice(t, 1);
}
function $t(e) {
  let n = e[ye];
  return pt(n) ? n[ye] : n;
}
var V = { lFrame: xu(null), bindingsEnabled: !0, skipHydrationRootTNode: null };
var yu = !1;
function kh() {
  return V.lFrame.elementDepthCount;
}
function Vh() {
  V.lFrame.elementDepthCount++;
}
function Lh() {
  V.lFrame.elementDepthCount--;
}
function vu() {
  return V.bindingsEnabled;
}
function jh() {
  return V.skipHydrationRootTNode !== null;
}
function Bh(e) {
  return V.skipHydrationRootTNode === e;
}
function Uh() {
  V.skipHydrationRootTNode = null;
}
function G() {
  return V.lFrame.lView;
}
function he() {
  return V.lFrame.tView;
}
function y(e) {
  return ((V.lFrame.contextLView = e), e[Ge]);
}
function v(e) {
  return ((V.lFrame.contextLView = null), e);
}
function ve() {
  let e = Cu();
  for (; e !== null && e.type === 64;) e = e.parent;
  return e;
}
function Cu() {
  return V.lFrame.currentTNode;
}
function $h() {
  let e = V.lFrame,
    n = e.currentTNode;
  return e.isParent ? n : n.parent;
}
function Qt(e, n) {
  let t = V.lFrame;
  ((t.currentTNode = e), (t.isParent = n));
}
function ta() {
  return V.lFrame.isParent;
}
function Eu() {
  V.lFrame.isParent = !1;
}
function Du() {
  return yu;
}
function cc(e) {
  yu = e;
}
function Hh() {
  let e = V.lFrame,
    n = e.bindingRootIndex;
  return (n === -1 && (n = e.bindingRootIndex = e.tView.bindingStartIndex), n);
}
function Pr() {
  return V.lFrame.bindingIndex;
}
function Wh(e) {
  return (V.lFrame.bindingIndex = e);
}
function Fr() {
  return V.lFrame.bindingIndex++;
}
function Kn(e) {
  let n = V.lFrame,
    t = n.bindingIndex;
  return ((n.bindingIndex = n.bindingIndex + e), t);
}
function Gh() {
  return V.lFrame.inI18n;
}
function qh(e, n) {
  let t = V.lFrame;
  ((t.bindingIndex = t.bindingRootIndex = e), gs(n));
}
function zh() {
  return V.lFrame.currentDirectiveIndex;
}
function gs(e) {
  V.lFrame.currentDirectiveIndex = e;
}
function Zh(e) {
  let n = V.lFrame.currentDirectiveIndex;
  return n === -1 ? null : e[n];
}
function bu(e) {
  V.lFrame.currentQueryIndex = e;
}
function Qh(e) {
  let n = e[j];
  return n.type === 2 ? n.declTNode : n.type === 1 ? e[ze] : null;
}
function wu(e, n, t) {
  if (t & U.SkipSelf) {
    let r = n,
      o = e;
    for (; (r = r.parent), r === null && !(t & U.Host);)
      if (((r = Qh(o)), r === null || ((o = o[Cn]), r.type & 10))) break;
    if (r === null) return !1;
    ((n = r), (e = o));
  }
  let i = (V.lFrame = Iu());
  return ((i.currentTNode = n), (i.lView = e), !0);
}
function na(e) {
  let n = Iu(),
    t = e[j];
  ((V.lFrame = n),
    (n.currentTNode = t.firstChild),
    (n.lView = e),
    (n.tView = t),
    (n.contextLView = e),
    (n.bindingIndex = t.bindingStartIndex),
    (n.inI18n = !1));
}
function Iu() {
  let e = V.lFrame,
    n = e === null ? null : e.child;
  return n === null ? xu(e) : n;
}
function xu(e) {
  let n = {
    currentTNode: null,
    isParent: !0,
    lView: null,
    tView: null,
    selectedIndex: -1,
    contextLView: null,
    elementDepthCount: 0,
    currentNamespace: null,
    currentDirectiveIndex: -1,
    bindingRootIndex: -1,
    bindingIndex: -1,
    currentQueryIndex: 0,
    parent: e,
    child: null,
    inI18n: !1,
  };
  return (e !== null && (e.child = n), n);
}
function Su() {
  let e = V.lFrame;
  return ((V.lFrame = e.parent), (e.currentTNode = null), (e.lView = null), e);
}
var Mu = Su;
function ia() {
  let e = Su();
  ((e.isParent = !0),
    (e.tView = null),
    (e.selectedIndex = -1),
    (e.contextLView = null),
    (e.elementDepthCount = 0),
    (e.currentDirectiveIndex = -1),
    (e.currentNamespace = null),
    (e.bindingRootIndex = -1),
    (e.bindingIndex = -1),
    (e.currentQueryIndex = 0));
}
function Yh(e) {
  return (V.lFrame.contextLView = Ph(e, V.lFrame.contextLView))[Ge];
}
function it() {
  return V.lFrame.selectedIndex;
}
function Ht(e) {
  V.lFrame.selectedIndex = e;
}
function ra() {
  let e = V.lFrame;
  return hu(e.tView, e.selectedIndex);
}
function Kh() {
  return V.lFrame.currentNamespace;
}
var Tu = !0;
function kr() {
  return Tu;
}
function Vr(e) {
  Tu = e;
}
function Jh(e, n, t) {
  let { ngOnChanges: i, ngOnInit: r, ngDoCheck: o } = n.type.prototype;
  if (i) {
    let s = uu(n);
    ((t.preOrderHooks ??= []).push(e, s), (t.preOrderCheckHooks ??= []).push(e, s));
  }
  (r && (t.preOrderHooks ??= []).push(0 - e, r),
    o && ((t.preOrderHooks ??= []).push(e, o), (t.preOrderCheckHooks ??= []).push(e, o)));
}
function Lr(e, n) {
  for (let t = n.directiveStart, i = n.directiveEnd; t < i; t++) {
    let o = e.data[t].type.prototype,
      {
        ngAfterContentInit: s,
        ngAfterContentChecked: a,
        ngAfterViewInit: d,
        ngAfterViewChecked: p,
        ngOnDestroy: h,
      } = o;
    (s && (e.contentHooks ??= []).push(-t, s),
      a && ((e.contentHooks ??= []).push(t, a), (e.contentCheckHooks ??= []).push(t, a)),
      d && (e.viewHooks ??= []).push(-t, d),
      p && ((e.viewHooks ??= []).push(t, p), (e.viewCheckHooks ??= []).push(t, p)),
      h != null && (e.destroyHooks ??= []).push(t, h));
  }
}
function Ji(e, n, t) {
  Au(e, n, 3, t);
}
function Xi(e, n, t, i) {
  (e[O] & 3) === t && Au(e, n, t, i);
}
function Qo(e, n) {
  let t = e[O];
  (t & 3) === n && ((t &= 16383), (t += 1), (e[O] = t));
}
function Au(e, n, t, i) {
  let r = i !== void 0 ? e[nn] & 65535 : 0,
    o = i ?? -1,
    s = n.length - 1,
    a = 0;
  for (let d = r; d < s; d++)
    if (typeof n[d + 1] == 'number') {
      if (((a = n[d]), i != null && a >= i)) break;
    } else
      (n[d] < 0 && (e[nn] += 65536),
        (a < o || o == -1) && (Xh(e, t, n, d), (e[nn] = (e[nn] & 4294901760) + d + 2)),
        d++);
}
function uc(e, n) {
  Ke(4, e, n);
  let t = W(null);
  try {
    n.call(e);
  } finally {
    (W(t), Ke(5, e, n));
  }
}
function Xh(e, n, t, i) {
  let r = t[i] < 0,
    o = t[i + 1],
    s = r ? -t[i] : t[i],
    a = e[s];
  r ? e[O] >> 14 < e[nn] >> 16 && (e[O] & 3) === n && ((e[O] += 16384), uc(a, o)) : uc(a, o);
}
var sn = -1,
  Wt = class {
    constructor(n, t, i) {
      ((this.factory = n),
        (this.resolving = !1),
        (this.canSeeViewProviders = t),
        (this.injectImpl = i));
    }
  };
function em(e) {
  return e instanceof Wt;
}
function tm(e) {
  return (e.flags & 8) !== 0;
}
function nm(e) {
  return (e.flags & 16) !== 0;
}
var Yo = {},
  _s = class {
    constructor(n, t) {
      ((this.injector = n), (this.parentInjector = t));
    }
    get(n, t, i) {
      i = Sr(i);
      let r = this.injector.get(n, Yo, i);
      return r !== Yo || t === Yo ? r : this.parentInjector.get(n, t, i);
    }
  };
function Nu(e) {
  return e !== sn;
}
function dr(e) {
  return e & 32767;
}
function im(e) {
  return e >> 16;
}
function fr(e, n) {
  let t = im(e),
    i = n;
  for (; t > 0;) ((i = i[Cn]), t--);
  return i;
}
var ys = !0;
function pr(e) {
  let n = ys;
  return ((ys = e), n);
}
var rm = 256,
  Ru = rm - 1,
  Ou = 5,
  om = 0,
  Je = {};
function sm(e, n, t) {
  let i;
  (typeof t == 'string' ? (i = t.charCodeAt(0) || 0) : t.hasOwnProperty(jn) && (i = t[jn]),
    i == null && (i = t[jn] = om++));
  let r = i & Ru,
    o = 1 << r;
  n.data[e + (r >> Ou)] |= o;
}
function hr(e, n) {
  let t = Pu(e, n);
  if (t !== -1) return t;
  let i = n[j];
  i.firstCreatePass &&
    ((e.injectorIndex = n.length), Ko(i.data, e), Ko(n, null), Ko(i.blueprint, null));
  let r = oa(e, n),
    o = e.injectorIndex;
  if (Nu(r)) {
    let s = dr(r),
      a = fr(r, n),
      d = a[j].data;
    for (let p = 0; p < 8; p++) n[o + p] = a[s + p] | d[s + p];
  }
  return ((n[o + 8] = r), o);
}
function Ko(e, n) {
  e.push(0, 0, 0, 0, 0, 0, 0, 0, n);
}
function Pu(e, n) {
  return e.injectorIndex === -1 ||
    (e.parent && e.parent.injectorIndex === e.injectorIndex) ||
    n[e.injectorIndex + 8] === null
    ? -1
    : e.injectorIndex;
}
function oa(e, n) {
  if (e.parent && e.parent.injectorIndex !== -1) return e.parent.injectorIndex;
  let t = 0,
    i = null,
    r = n;
  for (; r !== null;) {
    if (((i = ju(r)), i === null)) return sn;
    if ((t++, (r = r[Cn]), i.injectorIndex !== -1)) return i.injectorIndex | (t << 16);
  }
  return sn;
}
function vs(e, n, t) {
  sm(e, n, t);
}
function Fu(e, n, t) {
  if (t & U.Optional || e !== void 0) return e;
  zs(n, 'NodeInjector');
}
function ku(e, n, t, i) {
  if ((t & U.Optional && i === void 0 && (i = null), !(t & (U.Self | U.Host)))) {
    let r = e[un],
      o = Me(void 0);
    try {
      return r ? r.get(n, i, t & U.Optional) : $c(n, i, t & U.Optional);
    } finally {
      Me(o);
    }
  }
  return Fu(i, n, t);
}
function Vu(e, n, t, i = U.Default, r) {
  if (e !== null) {
    if (n[O] & 2048 && !(i & U.Self)) {
      let s = dm(e, n, t, i, Je);
      if (s !== Je) return s;
    }
    let o = Lu(e, n, t, i, Je);
    if (o !== Je) return o;
  }
  return ku(n, t, i, r);
}
function Lu(e, n, t, i, r) {
  let o = cm(t);
  if (typeof o == 'function') {
    if (!wu(n, e, i)) return i & U.Host ? Fu(r, t, i) : ku(n, t, i, r);
    try {
      let s;
      if (((s = o(i)), s == null && !(i & U.Optional))) zs(t);
      else return s;
    } finally {
      Mu();
    }
  } else if (typeof o == 'number') {
    let s = null,
      a = Pu(e, n),
      d = sn,
      p = i & U.Host ? n[tt][ze] : null;
    for (
      (a === -1 || i & U.SkipSelf) &&
      ((d = a === -1 ? oa(e, n) : n[a + 8]),
      d === sn || !fc(i, !1) ? (a = -1) : ((s = n[j]), (a = dr(d)), (n = fr(d, n))));
      a !== -1;
    ) {
      let h = n[j];
      if (dc(o, a, h.data)) {
        let g = am(a, n, t, s, i, p);
        if (g !== Je) return g;
      }
      ((d = n[a + 8]),
        d !== sn && fc(i, n[j].data[a + 8] === p) && dc(o, a, n)
          ? ((s = h), (a = dr(d)), (n = fr(d, n)))
          : (a = -1));
    }
  }
  return r;
}
function am(e, n, t, i, r, o) {
  let s = n[j],
    a = s.data[e + 8],
    d = i == null ? Ar(a) && ys : i != s && (a.type & 3) !== 0,
    p = r & U.Host && o === a,
    h = lm(a, s, t, d, p);
  return h !== null ? hn(n, s, h, a) : Je;
}
function lm(e, n, t, i, r) {
  let o = e.providerIndexes,
    s = n.data,
    a = o & 1048575,
    d = e.directiveStart,
    p = e.directiveEnd,
    h = o >> 20,
    g = i ? a : a + h,
    b = r ? a + h : p;
  for (let C = g; C < b; C++) {
    let w = s[C];
    if ((C < d && t === w) || (C >= d && w.type === t)) return C;
  }
  if (r) {
    let C = s[d];
    if (C && It(C) && C.type === t) return d;
  }
  return null;
}
function hn(e, n, t, i) {
  let r = e[t],
    o = n.data;
  if (em(r)) {
    let s = r;
    s.resolving && Vp(kp(o[t]));
    let a = pr(s.canSeeViewProviders);
    s.resolving = !0;
    let d,
      p = s.injectImpl ? Me(s.injectImpl) : null,
      h = wu(e, i, U.Default);
    try {
      ((r = e[t] = s.factory(void 0, o, e, i)),
        n.firstCreatePass && t >= i.directiveStart && Jh(t, o[t], n));
    } finally {
      (p !== null && Me(p), pr(a), (s.resolving = !1), Mu());
    }
  }
  return r;
}
function cm(e) {
  if (typeof e == 'string') return e.charCodeAt(0) || 0;
  let n = e.hasOwnProperty(jn) ? e[jn] : void 0;
  return typeof n == 'number' ? (n >= 0 ? n & Ru : um) : n;
}
function dc(e, n, t) {
  let i = 1 << e;
  return !!(t[n + (e >> Ou)] & i);
}
function fc(e, n) {
  return !(e & U.Self) && !(e & U.Host && n);
}
var jt = class {
  constructor(n, t) {
    ((this._tNode = n), (this._lView = t));
  }
  get(n, t, i) {
    return Vu(this._tNode, this._lView, n, Sr(i), t);
  }
};
function um() {
  return new jt(ve(), G());
}
function ht(e) {
  return Zn(() => {
    let n = e.prototype.constructor,
      t = n[nr] || Cs(n),
      i = Object.prototype,
      r = Object.getPrototypeOf(e.prototype).constructor;
    for (; r && r !== i;) {
      let o = r[nr] || Cs(r);
      if (o && o !== t) return o;
      r = Object.getPrototypeOf(r);
    }
    return (o) => new o();
  });
}
function Cs(e) {
  return Vc(e)
    ? () => {
        let n = Cs(_e(e));
        return n && n();
      }
    : Bt(e);
}
function dm(e, n, t, i, r) {
  let o = e,
    s = n;
  for (; o !== null && s !== null && s[O] & 2048 && !(s[O] & 512);) {
    let a = Lu(o, s, t, i | U.Self, Je);
    if (a !== Je) return a;
    let d = o.parent;
    if (!d) {
      let p = s[au];
      if (p) {
        let h = p.get(t, Je, i);
        if (h !== Je) return h;
      }
      ((d = ju(s)), (s = s[Cn]));
    }
    o = d;
  }
  return r;
}
function ju(e) {
  let n = e[j],
    t = n.type;
  return t === 2 ? n.declTNode : t === 1 ? e[ze] : null;
}
function pc(e, n = null, t = null, i) {
  let r = fm(e, n, t, i);
  return (r.resolveInjectorInitializers(), r);
}
function fm(e, n = null, t = null, i, r = new Set()) {
  let o = [t || Fe, hh(e)];
  return ((i = i || (typeof e == 'object' ? void 0 : Ne(e))), new Hn(o, n || Js(), i || null, r));
}
var mn = class e {
  static {
    this.THROW_IF_NOT_FOUND = Bn;
  }
  static {
    this.NULL = new or();
  }
  static create(n, t) {
    if (Array.isArray(n)) return pc({ name: '' }, t, n, '');
    {
      let i = n.name ?? '';
      return pc({ name: i }, n.parent, n.providers, i);
    }
  }
  static {
    this.ɵprov = Q({ token: e, providedIn: 'any', factory: () => $(qc) });
  }
  static {
    this.__NG_ELEMENT_ID__ = -1;
  }
};
var pm = new P('');
pm.__NG_ELEMENT_ID__ = (e) => {
  let n = ve();
  if (n === null) throw new F(204, !1);
  if (n.type & 2) return n.value;
  if (e & U.Optional) return null;
  throw new F(204, !1);
};
var hm = 'ngOriginalError';
function Jo(e) {
  return e[hm];
}
var Bu = !0,
  Uu = (() => {
    class e {
      static {
        this.__NG_ELEMENT_ID__ = mm;
      }
      static {
        this.__NG_ENV_ID__ = (t) => t;
      }
    }
    return e;
  })(),
  Es = class extends Uu {
    constructor(n) {
      (super(), (this._lView = n));
    }
    onDestroy(n) {
      return (_u(this._lView, n), () => Fh(this._lView, n));
    }
  };
function mm() {
  return new Es(G());
}
var En = (() => {
  class e {
    constructor() {
      ((this.taskId = 0), (this.pendingTasks = new Set()), (this.hasPendingTasks = new Fn(!1)));
    }
    get _hasPendingTasks() {
      return this.hasPendingTasks.value;
    }
    add() {
      this._hasPendingTasks || this.hasPendingTasks.next(!0);
      let t = this.taskId++;
      return (this.pendingTasks.add(t), t);
    }
    remove(t) {
      (this.pendingTasks.delete(t),
        this.pendingTasks.size === 0 && this._hasPendingTasks && this.hasPendingTasks.next(!1));
    }
    ngOnDestroy() {
      (this.pendingTasks.clear(), this._hasPendingTasks && this.hasPendingTasks.next(!1));
    }
    static {
      this.ɵprov = Q({ token: e, providedIn: 'root', factory: () => new e() });
    }
  }
  return e;
})();
var Ds = class extends Ye {
    constructor(n = !1) {
      (super(),
        (this.destroyRef = void 0),
        (this.pendingTasks = void 0),
        (this.__isAsync = n),
        Ih() &&
          ((this.destroyRef = k(Uu, { optional: !0 }) ?? void 0),
          (this.pendingTasks = k(En, { optional: !0 }) ?? void 0)));
    }
    emit(n) {
      let t = W(null);
      try {
        super.next(n);
      } finally {
        W(t);
      }
    }
    subscribe(n, t, i) {
      let r = n,
        o = t || (() => null),
        s = i;
      if (n && typeof n == 'object') {
        let d = n;
        ((r = d.next?.bind(d)), (o = d.error?.bind(d)), (s = d.complete?.bind(d)));
      }
      this.__isAsync &&
        ((o = this.wrapInTimeout(o)),
        r && (r = this.wrapInTimeout(r)),
        s && (s = this.wrapInTimeout(s)));
      let a = super.subscribe({ next: r, error: o, complete: s });
      return (n instanceof ge && n.add(a), a);
    }
    wrapInTimeout(n) {
      return (t) => {
        let i = this.pendingTasks?.add();
        setTimeout(() => {
          (n(t), i !== void 0 && this.pendingTasks?.remove(i));
        });
      };
    }
  },
  Te = Ds;
function mr(...e) {}
function $u(e) {
  let n, t;
  function i() {
    e = mr;
    try {
      (t !== void 0 && typeof cancelAnimationFrame == 'function' && cancelAnimationFrame(t),
        n !== void 0 && clearTimeout(n));
    } catch {}
  }
  return (
    (n = setTimeout(() => {
      (e(), i());
    })),
    typeof requestAnimationFrame == 'function' &&
      (t = requestAnimationFrame(() => {
        (e(), i());
      })),
    () => i()
  );
}
function hc(e) {
  return (
    queueMicrotask(() => e()),
    () => {
      e = mr;
    }
  );
}
var sa = 'isAngularZone',
  gr = sa + '_ID',
  gm = 0,
  oe = class e {
    constructor(n) {
      ((this.hasPendingMacrotasks = !1),
        (this.hasPendingMicrotasks = !1),
        (this.isStable = !0),
        (this.onUnstable = new Te(!1)),
        (this.onMicrotaskEmpty = new Te(!1)),
        (this.onStable = new Te(!1)),
        (this.onError = new Te(!1)));
      let {
        enableLongStackTrace: t = !1,
        shouldCoalesceEventChangeDetection: i = !1,
        shouldCoalesceRunChangeDetection: r = !1,
        scheduleInRootZone: o = Bu,
      } = n;
      if (typeof Zone > 'u') throw new F(908, !1);
      Zone.assertZonePatched();
      let s = this;
      ((s._nesting = 0),
        (s._outer = s._inner = Zone.current),
        Zone.TaskTrackingZoneSpec && (s._inner = s._inner.fork(new Zone.TaskTrackingZoneSpec())),
        t && Zone.longStackTraceZoneSpec && (s._inner = s._inner.fork(Zone.longStackTraceZoneSpec)),
        (s.shouldCoalesceEventChangeDetection = !r && i),
        (s.shouldCoalesceRunChangeDetection = r),
        (s.callbackScheduled = !1),
        (s.scheduleInRootZone = o),
        vm(s));
    }
    static isInAngularZone() {
      return typeof Zone < 'u' && Zone.current.get(sa) === !0;
    }
    static assertInAngularZone() {
      if (!e.isInAngularZone()) throw new F(909, !1);
    }
    static assertNotInAngularZone() {
      if (e.isInAngularZone()) throw new F(909, !1);
    }
    run(n, t, i) {
      return this._inner.run(n, t, i);
    }
    runTask(n, t, i, r) {
      let o = this._inner,
        s = o.scheduleEventTask('NgZoneEvent: ' + r, n, _m, mr, mr);
      try {
        return o.runTask(s, t, i);
      } finally {
        o.cancelTask(s);
      }
    }
    runGuarded(n, t, i) {
      return this._inner.runGuarded(n, t, i);
    }
    runOutsideAngular(n) {
      return this._outer.run(n);
    }
  },
  _m = {};
function aa(e) {
  if (e._nesting == 0 && !e.hasPendingMicrotasks && !e.isStable)
    try {
      (e._nesting++, e.onMicrotaskEmpty.emit(null));
    } finally {
      if ((e._nesting--, !e.hasPendingMicrotasks))
        try {
          e.runOutsideAngular(() => e.onStable.emit(null));
        } finally {
          e.isStable = !0;
        }
    }
}
function ym(e) {
  if (e.isCheckStableRunning || e.callbackScheduled) return;
  e.callbackScheduled = !0;
  function n() {
    $u(() => {
      ((e.callbackScheduled = !1),
        bs(e),
        (e.isCheckStableRunning = !0),
        aa(e),
        (e.isCheckStableRunning = !1));
    });
  }
  (e.scheduleInRootZone
    ? Zone.root.run(() => {
        n();
      })
    : e._outer.run(() => {
        n();
      }),
    bs(e));
}
function vm(e) {
  let n = () => {
      ym(e);
    },
    t = gm++;
  e._inner = e._inner.fork({
    name: 'angular',
    properties: { [sa]: !0, [gr]: t, [gr + t]: !0 },
    onInvokeTask: (i, r, o, s, a, d) => {
      if (Cm(d)) return i.invokeTask(o, s, a, d);
      try {
        return (mc(e), i.invokeTask(o, s, a, d));
      } finally {
        (((e.shouldCoalesceEventChangeDetection && s.type === 'eventTask') ||
          e.shouldCoalesceRunChangeDetection) &&
          n(),
          gc(e));
      }
    },
    onInvoke: (i, r, o, s, a, d, p) => {
      try {
        return (mc(e), i.invoke(o, s, a, d, p));
      } finally {
        (e.shouldCoalesceRunChangeDetection && !e.callbackScheduled && !Em(d) && n(), gc(e));
      }
    },
    onHasTask: (i, r, o, s) => {
      (i.hasTask(o, s),
        r === o &&
          (s.change == 'microTask'
            ? ((e._hasPendingMicrotasks = s.microTask), bs(e), aa(e))
            : s.change == 'macroTask' && (e.hasPendingMacrotasks = s.macroTask)));
    },
    onHandleError: (i, r, o, s) => (
      i.handleError(o, s),
      e.runOutsideAngular(() => e.onError.emit(s)),
      !1
    ),
  });
}
function bs(e) {
  e._hasPendingMicrotasks ||
  ((e.shouldCoalesceEventChangeDetection || e.shouldCoalesceRunChangeDetection) &&
    e.callbackScheduled === !0)
    ? (e.hasPendingMicrotasks = !0)
    : (e.hasPendingMicrotasks = !1);
}
function mc(e) {
  (e._nesting++, e.isStable && ((e.isStable = !1), e.onUnstable.emit(null)));
}
function gc(e) {
  (e._nesting--, aa(e));
}
var ws = class {
  constructor() {
    ((this.hasPendingMicrotasks = !1),
      (this.hasPendingMacrotasks = !1),
      (this.isStable = !0),
      (this.onUnstable = new Te()),
      (this.onMicrotaskEmpty = new Te()),
      (this.onStable = new Te()),
      (this.onError = new Te()));
  }
  run(n, t, i) {
    return n.apply(t, i);
  }
  runGuarded(n, t, i) {
    return n.apply(t, i);
  }
  runOutsideAngular(n) {
    return n();
  }
  runTask(n, t, i, r) {
    return n.apply(t, i);
  }
};
function Cm(e) {
  return Hu(e, '__ignore_ng_zone__');
}
function Em(e) {
  return Hu(e, '__scheduler_tick__');
}
function Hu(e, n) {
  return !Array.isArray(e) || e.length !== 1 ? !1 : e[0]?.data?.[n] === !0;
}
var ct = class {
    constructor() {
      this._console = console;
    }
    handleError(n) {
      let t = this._findOriginalError(n);
      (this._console.error('ERROR', n), t && this._console.error('ORIGINAL ERROR', t));
    }
    _findOriginalError(n) {
      let t = n && Jo(n);
      for (; t && Jo(t);) t = Jo(t);
      return t || null;
    }
  },
  Dm = new P('', {
    providedIn: 'root',
    factory: () => {
      let e = k(oe),
        n = k(ct);
      return (t) => e.runOutsideAngular(() => n.handleError(t));
    },
  });
function bm() {
  return jr(ve(), G());
}
function jr(e, n) {
  return new Mt(Le(e, n));
}
var Mt = (() => {
  class e {
    constructor(t) {
      this.nativeElement = t;
    }
    static {
      this.__NG_ELEMENT_ID__ = bm;
    }
  }
  return e;
})();
function Wu(e) {
  return (e.flags & 128) === 128;
}
var Gu = new Map(),
  wm = 0;
function Im() {
  return wm++;
}
function xm(e) {
  Gu.set(e[Tr], e);
}
function Is(e) {
  Gu.delete(e[Tr]);
}
var _c = '__ngContext__';
function xt(e, n) {
  bt(n) ? ((e[_c] = n[Tr]), xm(n)) : (e[_c] = n);
}
function qu(e) {
  return Zu(e[Wn]);
}
function zu(e) {
  return Zu(e[We]);
}
function Zu(e) {
  for (; e !== null && !pt(e);) e = e[We];
  return e;
}
var xs;
function Qu(e) {
  xs = e;
}
function Sm() {
  if (xs !== void 0) return xs;
  if (typeof document < 'u') return document;
  throw new F(210, !1);
}
var la = new P('', { providedIn: 'root', factory: () => Mm }),
  Mm = 'ng',
  ca = new P(''),
  Tt = new P('', { providedIn: 'platform', factory: () => 'unknown' });
var ua = new P('', {
  providedIn: 'root',
  factory: () => Sm().body?.querySelector('[ngCspNonce]')?.getAttribute('ngCspNonce') || null,
});
var Tm = 'h',
  Am = 'b';
var Nm = () => null;
function da(e, n, t = !1) {
  return Nm(e, n, t);
}
var Yu = !1,
  Rm = new P('', { providedIn: 'root', factory: () => Yu });
var Ss = class {
  constructor(n) {
    this.changingThisBreaksApplicationSecurity = n;
  }
  toString() {
    return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${Sp})`;
  }
};
function fa(e) {
  return e instanceof Ss ? e.changingThisBreaksApplicationSecurity : e;
}
var Om = /^>|^->|<!--|-->|--!>|<!-$/g,
  Pm = /(<|>)/g,
  Fm = '\u200B$1\u200B';
function km(e) {
  return e.replace(Om, (n) => n.replace(Pm, Fm));
}
var ut = (function (e) {
    return ((e[(e.Important = 1)] = 'Important'), (e[(e.DashCase = 2)] = 'DashCase'), e);
  })(ut || {}),
  Vm;
function pa(e, n) {
  return Vm(e, n);
}
function rn(e, n, t, i, r) {
  if (i != null) {
    let o,
      s = !1;
    pt(i) ? (o = i) : bt(i) && ((s = !0), (i = i[ft]));
    let a = nt(i);
    (e === 0 && t !== null
      ? r == null
        ? td(n, t, a)
        : _r(n, t, a, r || null, !0)
      : e === 1 && t !== null
        ? _r(n, t, a, r || null, !0)
        : e === 2
          ? Xm(n, a, s)
          : e === 3 && n.destroyNode(a),
      o != null && tg(n, e, o, t, r));
  }
}
function Lm(e, n) {
  return e.createText(n);
}
function jm(e, n, t) {
  e.setValue(n, t);
}
function Bm(e, n) {
  return e.createComment(km(n));
}
function Ku(e, n, t) {
  return e.createElement(n, t);
}
function Um(e, n) {
  (Ju(e, n), (n[ft] = null), (n[ze] = null));
}
function $m(e, n, t, i, r, o) {
  ((i[ft] = r), (i[ze] = n), Ur(e, i, t, 1, r, o));
}
function Ju(e, n) {
  (n[lt].changeDetectionScheduler?.notify(9), Ur(e, n, n[se], 2, null, null));
}
function Hm(e) {
  let n = e[Wn];
  if (!n) return Xo(e[j], e);
  for (; n;) {
    let t = null;
    if (bt(n)) t = n[Wn];
    else {
      let i = n[Ve];
      i && (t = i);
    }
    if (!t) {
      for (; n && !n[We] && n !== e;) (bt(n) && Xo(n[j], n), (n = n[ye]));
      (n === null && (n = e), bt(n) && Xo(n[j], n), (t = n && n[We]));
    }
    n = t;
  }
}
function Wm(e, n, t, i) {
  let r = Ve + i,
    o = t.length;
  (i > 0 && (t[r - 1][We] = n),
    i < o - Ve ? ((n[We] = t[r]), Gc(t, Ve + i, n)) : (t.push(n), (n[We] = null)),
    (n[ye] = t));
  let s = n[dn];
  s !== null && t !== s && Xu(s, n);
  let a = n[fn];
  (a !== null && a.insertView(e), ms(n), (n[O] |= 128));
}
function Xu(e, n) {
  let t = e[cr],
    i = n[ye];
  if (bt(i)) e[O] |= ur.HasTransplantedViews;
  else {
    let r = i[ye][tt];
    n[tt] !== r && (e[O] |= ur.HasTransplantedViews);
  }
  t === null ? (e[cr] = [n]) : t.push(n);
}
function ha(e, n) {
  let t = e[cr],
    i = t.indexOf(n);
  t.splice(i, 1);
}
function Ms(e, n) {
  if (e.length <= Ve) return;
  let t = Ve + n,
    i = e[t];
  if (i) {
    let r = i[dn];
    (r !== null && r !== e && ha(r, i), n > 0 && (e[t - 1][We] = i[We]));
    let o = rr(e, Ve + n);
    Um(i[j], i);
    let s = o[fn];
    (s !== null && s.detachView(o[j]), (i[ye] = null), (i[We] = null), (i[O] &= -129));
  }
  return i;
}
function ed(e, n) {
  if (!(n[O] & 256)) {
    let t = n[se];
    (t.destroyNode && Ur(e, n, t, 3, null, null), Hm(n));
  }
}
function Xo(e, n) {
  if (n[O] & 256) return;
  let t = W(null);
  try {
    ((n[O] &= -129),
      (n[O] |= 256),
      n[ke] && Ro(n[ke]),
      qm(e, n),
      Gm(e, n),
      n[j].type === 1 && n[se].destroy());
    let i = n[dn];
    if (i !== null && pt(n[ye])) {
      i !== n[ye] && ha(i, n);
      let r = n[fn];
      r !== null && r.detachView(e);
    }
    Is(n);
  } finally {
    W(t);
  }
}
function Gm(e, n) {
  let t = e.cleanup,
    i = n[ar];
  if (t !== null)
    for (let o = 0; o < t.length - 1; o += 2)
      if (typeof t[o] == 'string') {
        let s = t[o + 3];
        (s >= 0 ? i[s]() : i[-s].unsubscribe(), (o += 2));
      } else {
        let s = i[t[o + 1]];
        t[o].call(s);
      }
  i !== null && (n[ar] = null);
  let r = n[Dt];
  if (r !== null) {
    n[Dt] = null;
    for (let o = 0; o < r.length; o++) {
      let s = r[o];
      s();
    }
  }
}
function qm(e, n) {
  let t;
  if (e != null && (t = e.destroyHooks) != null)
    for (let i = 0; i < t.length; i += 2) {
      let r = n[t[i]];
      if (!(r instanceof Wt)) {
        let o = t[i + 1];
        if (Array.isArray(o))
          for (let s = 0; s < o.length; s += 2) {
            let a = r[o[s]],
              d = o[s + 1];
            Ke(4, a, d);
            try {
              d.call(a);
            } finally {
              Ke(5, a, d);
            }
          }
        else {
          Ke(4, r, o);
          try {
            o.call(r);
          } finally {
            Ke(5, r, o);
          }
        }
      }
    }
}
function zm(e, n, t) {
  return Zm(e, n.parent, t);
}
function Zm(e, n, t) {
  let i = n;
  for (; i !== null && i.type & 168;) ((n = i), (i = n.parent));
  if (i === null) return t[ft];
  {
    let { componentOffset: r } = i;
    if (r > -1) {
      let { encapsulation: o } = e.data[i.directiveStart + r];
      if (o === Xe.None || o === Xe.Emulated) return null;
    }
    return Le(i, t);
  }
}
function _r(e, n, t, i, r) {
  e.insertBefore(n, t, i, r);
}
function td(e, n, t) {
  e.appendChild(n, t);
}
function yc(e, n, t, i, r) {
  i !== null ? _r(e, n, t, i, r) : td(e, n, t);
}
function nd(e, n) {
  return e.parentNode(n);
}
function Qm(e, n) {
  return e.nextSibling(n);
}
function Ym(e, n, t) {
  return Jm(e, n, t);
}
function Km(e, n, t) {
  return e.type & 40 ? Le(e, t) : null;
}
var Jm = Km,
  vc;
function Br(e, n, t, i) {
  let r = zm(e, i, n),
    o = n[se],
    s = i.parent || n[ze],
    a = Ym(s, i, n);
  if (r != null)
    if (Array.isArray(t)) for (let d = 0; d < t.length; d++) yc(o, r, t[d], a, !1);
    else yc(o, r, t, a, !1);
  vc !== void 0 && vc(o, i, n, t, r);
}
function Vn(e, n) {
  if (n !== null) {
    let t = n.type;
    if (t & 3) return Le(n, e);
    if (t & 4) return Ts(-1, e[n.index]);
    if (t & 8) {
      let i = n.child;
      if (i !== null) return Vn(e, i);
      {
        let r = e[n.index];
        return pt(r) ? Ts(-1, r) : nt(r);
      }
    } else {
      if (t & 128) return Vn(e, n.next);
      if (t & 32) return pa(n, e)() || nt(e[n.index]);
      {
        let i = id(e, n);
        if (i !== null) {
          if (Array.isArray(i)) return i[0];
          let r = $t(e[tt]);
          return Vn(r, i);
        } else return Vn(e, n.next);
      }
    }
  }
  return null;
}
function id(e, n) {
  if (n !== null) {
    let i = e[tt][ze],
      r = n.projection;
    return i.projection[r];
  }
  return null;
}
function Ts(e, n) {
  let t = Ve + e + 1;
  if (t < n.length) {
    let i = n[t],
      r = i[j].firstChild;
    if (r !== null) return Vn(i, r);
  }
  return n[Ut];
}
function Xm(e, n, t) {
  e.removeChild(null, n, t);
}
function ma(e, n, t, i, r, o, s) {
  for (; t != null;) {
    if (t.type === 128) {
      t = t.next;
      continue;
    }
    let a = i[t.index],
      d = t.type;
    if ((s && n === 0 && (a && xt(nt(a), i), (t.flags |= 2)), (t.flags & 32) !== 32))
      if (d & 8) (ma(e, n, t.child, i, r, o, !1), rn(n, e, r, a, o));
      else if (d & 32) {
        let p = pa(t, i),
          h;
        for (; (h = p());) rn(n, e, r, h, o);
        rn(n, e, r, a, o);
      } else d & 16 ? eg(e, n, i, t, r, o) : rn(n, e, r, a, o);
    t = s ? t.projectionNext : t.next;
  }
}
function Ur(e, n, t, i, r, o) {
  ma(t, i, e.firstChild, n, r, o, !1);
}
function eg(e, n, t, i, r, o) {
  let s = t[tt],
    d = s[ze].projection[i.projection];
  if (Array.isArray(d))
    for (let p = 0; p < d.length; p++) {
      let h = d[p];
      rn(n, e, r, h, o);
    }
  else {
    let p = d,
      h = s[ye];
    (Wu(i) && (p.flags |= 128), ma(e, n, p, h, r, o, !0));
  }
}
function tg(e, n, t, i, r) {
  let o = t[Ut],
    s = nt(t);
  o !== s && rn(n, e, i, o, r);
  for (let a = Ve; a < t.length; a++) {
    let d = t[a];
    Ur(d[j], d, e, n, i, o);
  }
}
function ng(e, n, t, i, r) {
  if (n) r ? e.addClass(t, i) : e.removeClass(t, i);
  else {
    let o = i.indexOf('-') === -1 ? void 0 : ut.DashCase;
    r == null
      ? e.removeStyle(t, i, o)
      : (typeof r == 'string' &&
          r.endsWith('!important') &&
          ((r = r.slice(0, -10)), (o |= ut.Important)),
        e.setStyle(t, i, r, o));
  }
}
function ig(e, n, t) {
  e.setAttribute(n, 'style', t);
}
function rd(e, n, t) {
  t === '' ? e.removeAttribute(n, 'class') : e.setAttribute(n, 'class', t);
}
function od(e, n, t) {
  let { mergedAttrs: i, classes: r, styles: o } = t;
  (i !== null && cs(e, n, i), r !== null && rd(e, n, r), o !== null && ig(e, n, o));
}
var Ce = {};
function f(e = 1) {
  sd(he(), G(), it() + e, !1);
}
function sd(e, n, t, i) {
  if (!i)
    if ((n[O] & 3) === 3) {
      let o = e.preOrderCheckHooks;
      o !== null && Ji(n, o, t);
    } else {
      let o = e.preOrderHooks;
      o !== null && Xi(n, o, 0, t);
    }
  Ht(t);
}
function L(e, n = U.Default) {
  let t = G();
  if (t === null) return $(e, n);
  let i = ve();
  return Vu(i, t, _e(e), n);
}
function ad(e, n, t, i, r, o) {
  let s = W(null);
  try {
    let a = null;
    (r & wt.SignalBased && (a = n[i][at]),
      a !== null && a.transformFn !== void 0 && (o = a.transformFn(o)),
      r & wt.HasDecoratorInputTransform && (o = e.inputTransforms[i].call(n, o)),
      e.setInput !== null ? e.setInput(n, a, o, t, i) : cu(n, a, i, o));
  } finally {
    W(s);
  }
}
function rg(e, n) {
  let t = e.hostBindingOpCodes;
  if (t !== null)
    try {
      for (let i = 0; i < t.length; i++) {
        let r = t[i];
        if (r < 0) Ht(~r);
        else {
          let o = r,
            s = t[++i],
            a = t[++i];
          qh(s, o);
          let d = n[o];
          a(2, d);
        }
      }
    } finally {
      Ht(-1);
    }
}
function $r(e, n, t, i, r, o, s, a, d, p, h) {
  let g = n.blueprint.slice();
  return (
    (g[ft] = r),
    (g[O] = i | 4 | 128 | 8 | 64),
    (p !== null || (e && e[O] & 2048)) && (g[O] |= 2048),
    mu(g),
    (g[ye] = g[Cn] = e),
    (g[Ge] = t),
    (g[lt] = s || (e && e[lt])),
    (g[se] = a || (e && e[se])),
    (g[un] = d || (e && e[un]) || null),
    (g[ze] = o),
    (g[Tr] = Im()),
    (g[sr] = h),
    (g[au] = p),
    (g[tt] = n.type == 2 ? e[tt] : g),
    g
  );
}
function Jn(e, n, t, i, r) {
  let o = e.data[n];
  if (o === null) ((o = og(e, n, t, i, r)), Gh() && (o.flags |= 32));
  else if (o.type & 64) {
    ((o.type = t), (o.value = i), (o.attrs = r));
    let s = $h();
    o.injectorIndex = s === null ? -1 : s.injectorIndex;
  }
  return (Qt(o, !0), o);
}
function og(e, n, t, i, r) {
  let o = Cu(),
    s = ta(),
    a = s ? o : o && o.parent,
    d = (e.data[n] = ug(e, a, t, n, i, r));
  return (
    e.firstChild === null && (e.firstChild = d),
    o !== null &&
      (s
        ? o.child == null && d.parent !== null && (o.child = d)
        : o.next === null && ((o.next = d), (d.prev = o))),
    d
  );
}
function ld(e, n, t, i) {
  if (t === 0) return -1;
  let r = n.length;
  for (let o = 0; o < t; o++) (n.push(i), e.blueprint.push(i), e.data.push(null));
  return r;
}
function cd(e, n, t, i, r) {
  let o = it(),
    s = i & 2;
  try {
    (Ht(-1), s && n.length > qe && sd(e, n, qe, !1), Ke(s ? 2 : 0, r), t(i, r));
  } finally {
    (Ht(o), Ke(s ? 3 : 1, r));
  }
}
function ga(e, n, t) {
  if (Xs(n)) {
    let i = W(null);
    try {
      let r = n.directiveStart,
        o = n.directiveEnd;
      for (let s = r; s < o; s++) {
        let a = e.data[s];
        if (a.contentQueries) {
          let d = t[s];
          a.contentQueries(1, d, s);
        }
      }
    } finally {
      W(i);
    }
  }
}
function _a(e, n, t) {
  vu() && (gg(e, n, t, Le(t, n)), (t.flags & 64) === 64 && pd(e, n, t));
}
function ya(e, n, t = Le) {
  let i = n.localNames;
  if (i !== null) {
    let r = n.index + 1;
    for (let o = 0; o < i.length; o += 2) {
      let s = i[o + 1],
        a = s === -1 ? t(n, e) : e[s];
      e[r++] = a;
    }
  }
}
function ud(e) {
  let n = e.tView;
  return n === null || n.incompleteFirstPass
    ? (e.tView = va(
        1,
        null,
        e.template,
        e.decls,
        e.vars,
        e.directiveDefs,
        e.pipeDefs,
        e.viewQuery,
        e.schemas,
        e.consts,
        e.id,
      ))
    : n;
}
function va(e, n, t, i, r, o, s, a, d, p, h) {
  let g = qe + i,
    b = g + r,
    C = sg(g, b),
    w = typeof p == 'function' ? p() : p;
  return (C[j] = {
    type: e,
    blueprint: C,
    template: t,
    queries: null,
    viewQuery: a,
    declTNode: n,
    data: C.slice().fill(null, g),
    bindingStartIndex: g,
    expandoStartIndex: b,
    hostBindingOpCodes: null,
    firstCreatePass: !0,
    firstUpdatePass: !0,
    staticViewQueries: !1,
    staticContentQueries: !1,
    preOrderHooks: null,
    preOrderCheckHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    cleanup: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof o == 'function' ? o() : o,
    pipeRegistry: typeof s == 'function' ? s() : s,
    firstChild: null,
    schemas: d,
    consts: w,
    incompleteFirstPass: !1,
    ssrId: h,
  });
}
function sg(e, n) {
  let t = [];
  for (let i = 0; i < n; i++) t.push(i < e ? null : Ce);
  return t;
}
function ag(e, n, t, i) {
  let o = i.get(Rm, Yu) || t === Xe.ShadowDom,
    s = e.selectRootElement(n, o);
  return (lg(s), s);
}
function lg(e) {
  cg(e);
}
var cg = () => null;
function ug(e, n, t, i, r, o) {
  let s = n ? n.injectorIndex : -1,
    a = 0;
  return (
    jh() && (a |= 128),
    {
      type: t,
      index: i,
      insertBeforeIndex: null,
      injectorIndex: s,
      directiveStart: -1,
      directiveEnd: -1,
      directiveStylingLast: -1,
      componentOffset: -1,
      propertyBindings: null,
      flags: a,
      providerIndexes: 0,
      value: r,
      attrs: o,
      mergedAttrs: null,
      localNames: null,
      initialInputs: void 0,
      inputs: null,
      outputs: null,
      tView: null,
      next: null,
      prev: null,
      projectionNext: null,
      child: null,
      parent: n,
      projection: null,
      styles: null,
      stylesWithoutHost: null,
      residualStyles: void 0,
      classes: null,
      classesWithoutHost: null,
      residualClasses: void 0,
      classBindings: 0,
      styleBindings: 0,
    }
  );
}
function Cc(e, n, t, i, r) {
  for (let o in n) {
    if (!n.hasOwnProperty(o)) continue;
    let s = n[o];
    if (s === void 0) continue;
    i ??= {};
    let a,
      d = wt.None;
    Array.isArray(s) ? ((a = s[0]), (d = s[1])) : (a = s);
    let p = o;
    if (r !== null) {
      if (!r.hasOwnProperty(o)) continue;
      p = r[o];
    }
    e === 0 ? Ec(i, t, p, a, d) : Ec(i, t, p, a);
  }
  return i;
}
function Ec(e, n, t, i, r) {
  let o;
  (e.hasOwnProperty(t) ? (o = e[t]).push(n, i) : (o = e[t] = [n, i]), r !== void 0 && o.push(r));
}
function dg(e, n, t) {
  let i = n.directiveStart,
    r = n.directiveEnd,
    o = e.data,
    s = n.attrs,
    a = [],
    d = null,
    p = null;
  for (let h = i; h < r; h++) {
    let g = o[h],
      b = t ? t.get(g) : null,
      C = b ? b.inputs : null,
      w = b ? b.outputs : null;
    ((d = Cc(0, g.inputs, h, d, C)), (p = Cc(1, g.outputs, h, p, w)));
    let x = d !== null && s !== null && !Qs(n) ? Sg(d, h, s) : null;
    a.push(x);
  }
  (d !== null &&
    (d.hasOwnProperty('class') && (n.flags |= 8), d.hasOwnProperty('style') && (n.flags |= 16)),
    (n.initialInputs = a),
    (n.inputs = d),
    (n.outputs = p));
}
function fg(e) {
  return e === 'class'
    ? 'className'
    : e === 'for'
      ? 'htmlFor'
      : e === 'formaction'
        ? 'formAction'
        : e === 'innerHtml'
          ? 'innerHTML'
          : e === 'readonly'
            ? 'readOnly'
            : e === 'tabindex'
              ? 'tabIndex'
              : e;
}
function dd(e, n, t, i, r, o, s, a) {
  let d = Le(n, t),
    p = n.inputs,
    h;
  !a && p != null && (h = p[i])
    ? (Ea(e, t, h, i, r), Ar(n) && pg(t, n.index))
    : n.type & 3
      ? ((i = fg(i)), (r = s != null ? s(r, n.value || '', i) : r), o.setProperty(d, i, r))
      : n.type & 12;
}
function pg(e, n) {
  let t = St(n, e);
  t[O] & 16 || (t[O] |= 64);
}
function Ca(e, n, t, i) {
  if (vu()) {
    let r = i === null ? null : { '': -1 },
      o = yg(e, t),
      s,
      a;
    (o === null ? (s = a = null) : ([s, a] = o),
      s !== null && fd(e, n, t, s, r, a),
      r && vg(t, i, r));
  }
  t.mergedAttrs = $n(t.mergedAttrs, t.attrs);
}
function fd(e, n, t, i, r, o) {
  for (let p = 0; p < i.length; p++) vs(hr(t, n), e, i[p].type);
  Eg(t, e.data.length, i.length);
  for (let p = 0; p < i.length; p++) {
    let h = i[p];
    h.providersResolver && h.providersResolver(h);
  }
  let s = !1,
    a = !1,
    d = ld(e, n, i.length, null);
  for (let p = 0; p < i.length; p++) {
    let h = i[p];
    ((t.mergedAttrs = $n(t.mergedAttrs, h.hostAttrs)),
      Dg(e, t, n, d, h),
      Cg(d, h, r),
      h.contentQueries !== null && (t.flags |= 4),
      (h.hostBindings !== null || h.hostAttrs !== null || h.hostVars !== 0) && (t.flags |= 64));
    let g = h.type.prototype;
    (!s &&
      (g.ngOnChanges || g.ngOnInit || g.ngDoCheck) &&
      ((e.preOrderHooks ??= []).push(t.index), (s = !0)),
      !a &&
        (g.ngOnChanges || g.ngDoCheck) &&
        ((e.preOrderCheckHooks ??= []).push(t.index), (a = !0)),
      d++);
  }
  dg(e, t, o);
}
function hg(e, n, t, i, r) {
  let o = r.hostBindings;
  if (o) {
    let s = e.hostBindingOpCodes;
    s === null && (s = e.hostBindingOpCodes = []);
    let a = ~n.index;
    (mg(s) != a && s.push(a), s.push(t, i, o));
  }
}
function mg(e) {
  let n = e.length;
  for (; n > 0;) {
    let t = e[--n];
    if (typeof t == 'number' && t < 0) return t;
  }
  return 0;
}
function gg(e, n, t, i) {
  let r = t.directiveStart,
    o = t.directiveEnd;
  (Ar(t) && bg(n, t, e.data[r + t.componentOffset]), e.firstCreatePass || hr(t, n), xt(i, n));
  let s = t.initialInputs;
  for (let a = r; a < o; a++) {
    let d = e.data[a],
      p = hn(n, e, a, t);
    if ((xt(p, n), s !== null && xg(n, a - r, p, d, t, s), It(d))) {
      let h = St(t.index, n);
      h[Ge] = hn(n, e, a, t);
    }
  }
}
function pd(e, n, t) {
  let i = t.directiveStart,
    r = t.directiveEnd,
    o = t.index,
    s = zh();
  try {
    Ht(o);
    for (let a = i; a < r; a++) {
      let d = e.data[a],
        p = n[a];
      (gs(a), (d.hostBindings !== null || d.hostVars !== 0 || d.hostAttrs !== null) && _g(d, p));
    }
  } finally {
    (Ht(-1), gs(s));
  }
}
function _g(e, n) {
  e.hostBindings !== null && e.hostBindings(1, n);
}
function yg(e, n) {
  let t = e.directiveRegistry,
    i = null,
    r = null;
  if (t)
    for (let o = 0; o < t.length; o++) {
      let s = t[o];
      if (rh(n, s.selectors, !1))
        if ((i || (i = []), It(s)))
          if (s.findHostDirectiveDefs !== null) {
            let a = [];
            ((r = r || new Map()), s.findHostDirectiveDefs(s, a, r), i.unshift(...a, s));
            let d = a.length;
            As(e, n, d);
          } else (i.unshift(s), As(e, n, 0));
        else ((r = r || new Map()), s.findHostDirectiveDefs?.(s, i, r), i.push(s));
    }
  return i === null ? null : [i, r];
}
function As(e, n, t) {
  ((n.componentOffset = t), (e.components ??= []).push(n.index));
}
function vg(e, n, t) {
  if (n) {
    let i = (e.localNames = []);
    for (let r = 0; r < n.length; r += 2) {
      let o = t[n[r + 1]];
      if (o == null) throw new F(-301, !1);
      i.push(n[r], o);
    }
  }
}
function Cg(e, n, t) {
  if (t) {
    if (n.exportAs) for (let i = 0; i < n.exportAs.length; i++) t[n.exportAs[i]] = e;
    It(n) && (t[''] = e);
  }
}
function Eg(e, n, t) {
  ((e.flags |= 1), (e.directiveStart = n), (e.directiveEnd = n + t), (e.providerIndexes = n));
}
function Dg(e, n, t, i, r) {
  e.data[i] = r;
  let o = r.factory || (r.factory = Bt(r.type, !0)),
    s = new Wt(o, It(r), L);
  ((e.blueprint[i] = s), (t[i] = s), hg(e, n, i, ld(e, t, r.hostVars, Ce), r));
}
function bg(e, n, t) {
  let i = Le(n, e),
    r = ud(t),
    o = e[lt].rendererFactory,
    s = 16;
  t.signals ? (s = 4096) : t.onPush && (s = 64);
  let a = Hr(e, $r(e, r, null, s, i, n, null, o.createRenderer(i, t), null, null, null));
  e[n.index] = a;
}
function wg(e, n, t, i, r, o) {
  let s = Le(e, n);
  Ig(n[se], s, o, e.value, t, i, r);
}
function Ig(e, n, t, i, r, o, s) {
  if (o == null) e.removeAttribute(n, r, t);
  else {
    let a = s == null ? pe(o) : s(o, i || '', r);
    e.setAttribute(n, r, a, t);
  }
}
function xg(e, n, t, i, r, o) {
  let s = o[n];
  if (s !== null)
    for (let a = 0; a < s.length;) {
      let d = s[a++],
        p = s[a++],
        h = s[a++],
        g = s[a++];
      ad(i, t, d, p, h, g);
    }
}
function Sg(e, n, t) {
  let i = null,
    r = 0;
  for (; r < t.length;) {
    let o = t[r];
    if (o === 0) {
      r += 4;
      continue;
    } else if (o === 5) {
      r += 2;
      continue;
    }
    if (typeof o == 'number') break;
    if (e.hasOwnProperty(o)) {
      i === null && (i = []);
      let s = e[o];
      for (let a = 0; a < s.length; a += 3)
        if (s[a] === n) {
          i.push(o, s[a + 1], s[a + 2], t[r + 1]);
          break;
        }
    }
    r += 2;
  }
  return i;
}
function hd(e, n, t, i) {
  return [e, !0, 0, n, null, i, null, t, null, null];
}
function md(e, n) {
  let t = e.contentQueries;
  if (t !== null) {
    let i = W(null);
    try {
      for (let r = 0; r < t.length; r += 2) {
        let o = t[r],
          s = t[r + 1];
        if (s !== -1) {
          let a = e.data[s];
          (bu(o), a.contentQueries(2, n[s], s));
        }
      }
    } finally {
      W(i);
    }
  }
}
function Hr(e, n) {
  return (e[Wn] ? (e[ac][We] = n) : (e[Wn] = n), (e[ac] = n), n);
}
function Ns(e, n, t) {
  bu(0);
  let i = W(null);
  try {
    n(e, t);
  } finally {
    W(i);
  }
}
function Mg(e) {
  return (e[ar] ??= []);
}
function Tg(e) {
  return (e.cleanup ??= []);
}
function gd(e, n) {
  let t = e[un],
    i = t ? t.get(ct, null) : null;
  i && i.handleError(n);
}
function Ea(e, n, t, i, r) {
  for (let o = 0; o < t.length;) {
    let s = t[o++],
      a = t[o++],
      d = t[o++],
      p = n[s],
      h = e.data[s];
    ad(h, p, i, a, d, r);
  }
}
function Xn(e, n, t) {
  let i = pu(n, e);
  jm(e[se], i, t);
}
function Ag(e, n) {
  let t = St(n, e),
    i = t[j];
  Ng(i, t);
  let r = t[ft];
  (r !== null && t[sr] === null && (t[sr] = da(r, t[un])), Da(i, t, t[Ge]));
}
function Ng(e, n) {
  for (let t = n.length; t < e.blueprint.length; t++) n.push(e.blueprint[t]);
}
function Da(e, n, t) {
  na(n);
  try {
    let i = e.viewQuery;
    i !== null && Ns(1, i, t);
    let r = e.template;
    (r !== null && cd(e, n, r, 1, t),
      e.firstCreatePass && (e.firstCreatePass = !1),
      n[fn]?.finishViewCreation(e),
      e.staticContentQueries && md(e, n),
      e.staticViewQueries && Ns(2, e.viewQuery, t));
    let o = e.components;
    o !== null && Rg(n, o);
  } catch (i) {
    throw (e.firstCreatePass && ((e.incompleteFirstPass = !0), (e.firstCreatePass = !1)), i);
  } finally {
    ((n[O] &= -5), ia());
  }
}
function Rg(e, n) {
  for (let t = 0; t < n.length; t++) Ag(e, n[t]);
}
function Og(e, n, t, i) {
  let r = W(null);
  try {
    let o = n.tView,
      a = e[O] & 4096 ? 4096 : 16,
      d = $r(
        e,
        o,
        t,
        a,
        null,
        n,
        null,
        null,
        i?.injector ?? null,
        i?.embeddedViewInjector ?? null,
        i?.dehydratedView ?? null,
      ),
      p = e[n.index];
    d[dn] = p;
    let h = e[fn];
    return (h !== null && (d[fn] = h.createEmbeddedView(o)), Da(o, d, t), d);
  } finally {
    W(r);
  }
}
function Dc(e, n) {
  return !n || n.firstChild === null || Wu(e);
}
function Pg(e, n, t, i = !0) {
  let r = n[j];
  if ((Wm(r, n, e, t), i)) {
    let s = Ts(t, e),
      a = n[se],
      d = nd(a, e[Ut]);
    d !== null && $m(r, e[ze], a, n, d, s);
  }
  let o = n[sr];
  o !== null && o.firstChild !== null && (o.firstChild = null);
}
function yr(e, n, t, i, r = !1) {
  for (; t !== null;) {
    if (t.type === 128) {
      t = r ? t.projectionNext : t.next;
      continue;
    }
    let o = n[t.index];
    (o !== null && i.push(nt(o)), pt(o) && Fg(o, i));
    let s = t.type;
    if (s & 8) yr(e, n, t.child, i);
    else if (s & 32) {
      let a = pa(t, n),
        d;
      for (; (d = a());) i.push(d);
    } else if (s & 16) {
      let a = id(n, t);
      if (Array.isArray(a)) i.push(...a);
      else {
        let d = $t(n[tt]);
        yr(d[j], d, a, i, !0);
      }
    }
    t = r ? t.projectionNext : t.next;
  }
  return i;
}
function Fg(e, n) {
  for (let t = Ve; t < e.length; t++) {
    let i = e[t],
      r = i[j].firstChild;
    r !== null && yr(i[j], i, r, n);
  }
  e[Ut] !== e[ft] && n.push(e[Ut]);
}
var _d = [];
function kg(e) {
  return e[ke] ?? Vg(e);
}
function Vg(e) {
  let n = _d.pop() ?? Object.create(jg);
  return ((n.lView = e), n);
}
function Lg(e) {
  e.lView[ke] !== e && ((e.lView = null), _d.push(e));
}
var jg = ee(Z({}, On), {
  consumerIsAlwaysLive: !0,
  consumerMarkedDirty: (e) => {
    Or(e.lView);
  },
  consumerOnSignalRead() {
    this.lView[ke] = this;
  },
});
function Bg(e) {
  let n = e[ke] ?? Object.create(Ug);
  return ((n.lView = e), n);
}
var Ug = ee(Z({}, On), {
  consumerIsAlwaysLive: !0,
  consumerMarkedDirty: (e) => {
    let n = $t(e.lView);
    for (; n && !yd(n[j]);) n = $t(n);
    n && gu(n);
  },
  consumerOnSignalRead() {
    this.lView[ke] = this;
  },
});
function yd(e) {
  return e.type !== 2;
}
var $g = 100;
function vd(e, n = !0, t = 0) {
  let i = e[lt],
    r = i.rendererFactory,
    o = !1;
  o || r.begin?.();
  try {
    Hg(e, t);
  } catch (s) {
    throw (n && gd(e, s), s);
  } finally {
    o || (r.end?.(), i.inlineEffectRunner?.flush());
  }
}
function Hg(e, n) {
  let t = Du();
  try {
    (cc(!0), Rs(e, n));
    let i = 0;
    for (; Rr(e);) {
      if (i === $g) throw new F(103, !1);
      (i++, Rs(e, 1));
    }
  } finally {
    cc(t);
  }
}
function Wg(e, n, t, i) {
  let r = n[O];
  if ((r & 256) === 256) return;
  let o = !1,
    s = !1;
  (!o && n[lt].inlineEffectRunner?.flush(), na(n));
  let a = !0,
    d = null,
    p = null;
  o ||
    (yd(e)
      ? ((p = kg(n)), (d = wi(p)))
      : cl() === null
        ? ((a = !1), (p = Bg(n)), (d = wi(p)))
        : n[ke] && (Ro(n[ke]), (n[ke] = null)));
  try {
    (mu(n), Wh(e.bindingStartIndex), t !== null && cd(e, n, t, 2, i));
    let h = (r & 3) === 3;
    if (!o)
      if (h) {
        let C = e.preOrderCheckHooks;
        C !== null && Ji(n, C, null);
      } else {
        let C = e.preOrderHooks;
        (C !== null && Xi(n, C, 0, null), Qo(n, 0));
      }
    if ((s || Gg(n), Cd(n, 0), e.contentQueries !== null && md(e, n), !o))
      if (h) {
        let C = e.contentCheckHooks;
        C !== null && Ji(n, C);
      } else {
        let C = e.contentHooks;
        (C !== null && Xi(n, C, 1), Qo(n, 1));
      }
    rg(e, n);
    let g = e.components;
    g !== null && Dd(n, g, 0);
    let b = e.viewQuery;
    if ((b !== null && Ns(2, b, i), !o))
      if (h) {
        let C = e.viewCheckHooks;
        C !== null && Ji(n, C);
      } else {
        let C = e.viewHooks;
        (C !== null && Xi(n, C, 2), Qo(n, 2));
      }
    if ((e.firstUpdatePass === !0 && (e.firstUpdatePass = !1), n[Zo])) {
      for (let C of n[Zo]) C();
      n[Zo] = null;
    }
    o || (n[O] &= -73);
  } catch (h) {
    throw (o || Or(n), h);
  } finally {
    (p !== null && (Ao(p, d), a && Lg(p)), ia());
  }
}
function Cd(e, n) {
  for (let t = qu(e); t !== null; t = zu(t))
    for (let i = Ve; i < t.length; i++) {
      let r = t[i];
      Ed(r, n);
    }
}
function Gg(e) {
  for (let n = qu(e); n !== null; n = zu(n)) {
    if (!(n[O] & ur.HasTransplantedViews)) continue;
    let t = n[cr];
    for (let i = 0; i < t.length; i++) {
      let r = t[i];
      gu(r);
    }
  }
}
function qg(e, n, t) {
  let i = St(n, e);
  Ed(i, t);
}
function Ed(e, n) {
  ea(e) && Rs(e, n);
}
function Rs(e, n) {
  let i = e[j],
    r = e[O],
    o = e[ke],
    s = !!(n === 0 && r & 16);
  if (
    ((s ||= !!(r & 64 && n === 0)),
    (s ||= !!(r & 1024)),
    (s ||= !!(o?.dirty && No(o))),
    (s ||= !1),
    o && (o.dirty = !1),
    (e[O] &= -9217),
    s)
  )
    Wg(i, e, i.template, e[Ge]);
  else if (r & 8192) {
    Cd(e, 1);
    let a = i.components;
    a !== null && Dd(e, a, 1);
  }
}
function Dd(e, n, t) {
  for (let i = 0; i < n.length; i++) qg(e, n[i], t);
}
function ba(e, n) {
  let t = Du() ? 64 : 1088;
  for (e[lt].changeDetectionScheduler?.notify(n); e;) {
    e[O] |= t;
    let i = $t(e);
    if (ps(e) && !i) return e;
    e = i;
  }
  return null;
}
var Gt = class {
    get rootNodes() {
      let n = this._lView,
        t = n[j];
      return yr(t, n, t.firstChild, []);
    }
    constructor(n, t, i = !0) {
      ((this._lView = n),
        (this._cdRefInjectingView = t),
        (this.notifyErrorHandler = i),
        (this._appRef = null),
        (this._attachedToViewContainer = !1));
    }
    get context() {
      return this._lView[Ge];
    }
    set context(n) {
      this._lView[Ge] = n;
    }
    get destroyed() {
      return (this._lView[O] & 256) === 256;
    }
    destroy() {
      if (this._appRef) this._appRef.detachView(this);
      else if (this._attachedToViewContainer) {
        let n = this._lView[ye];
        if (pt(n)) {
          let t = n[lr],
            i = t ? t.indexOf(this) : -1;
          i > -1 && (Ms(n, i), rr(t, i));
        }
        this._attachedToViewContainer = !1;
      }
      ed(this._lView[j], this._lView);
    }
    onDestroy(n) {
      _u(this._lView, n);
    }
    markForCheck() {
      ba(this._cdRefInjectingView || this._lView, 4);
    }
    detach() {
      this._lView[O] &= -129;
    }
    reattach() {
      (ms(this._lView), (this._lView[O] |= 128));
    }
    detectChanges() {
      ((this._lView[O] |= 1024), vd(this._lView, this.notifyErrorHandler));
    }
    checkNoChanges() {}
    attachToViewContainerRef() {
      if (this._appRef) throw new F(902, !1);
      this._attachedToViewContainer = !0;
    }
    detachFromAppRef() {
      this._appRef = null;
      let n = ps(this._lView),
        t = this._lView[dn];
      (t !== null && !n && ha(t, this._lView), Ju(this._lView[j], this._lView));
    }
    attachToAppRef(n) {
      if (this._attachedToViewContainer) throw new F(902, !1);
      this._appRef = n;
      let t = ps(this._lView),
        i = this._lView[dn];
      (i !== null && !t && Xu(i, this._lView), ms(this._lView));
    }
  },
  Wr = (() => {
    class e {
      static {
        this.__NG_ELEMENT_ID__ = Qg;
      }
    }
    return e;
  })(),
  zg = Wr,
  Zg = class extends zg {
    constructor(n, t, i) {
      (super(),
        (this._declarationLView = n),
        (this._declarationTContainer = t),
        (this.elementRef = i));
    }
    get ssrId() {
      return this._declarationTContainer.tView?.ssrId || null;
    }
    createEmbeddedView(n, t) {
      return this.createEmbeddedViewImpl(n, t);
    }
    createEmbeddedViewImpl(n, t, i) {
      let r = Og(this._declarationLView, this._declarationTContainer, n, {
        embeddedViewInjector: t,
        dehydratedView: i,
      });
      return new Gt(r);
    }
  };
function Qg() {
  return Yg(ve(), G());
}
function Yg(e, n) {
  return e.type & 4 ? new Zg(n, e, jr(e, n)) : null;
}
var uI = new RegExp(`^(\\d+)*(${Am}|${Tm})*(.*)`);
var Kg = () => null;
function bc(e, n) {
  return Kg(e, n);
}
var gn = class {},
  wa = new P('', { providedIn: 'root', factory: () => !1 });
var bd = new P(''),
  wd = new P(''),
  Os = class {},
  vr = class {};
function Jg(e) {
  let n = Error(`No component factory found for ${Ne(e)}.`);
  return ((n[Xg] = e), n);
}
var Xg = 'ngComponent';
var Ps = class {
    resolveComponentFactory(n) {
      throw Jg(n);
    }
  },
  Gn = class {
    static {
      this.NULL = new Ps();
    }
  },
  _n = class {},
  Yt = (() => {
    class e {
      constructor() {
        this.destroyNode = null;
      }
      static {
        this.__NG_ELEMENT_ID__ = () => e0();
      }
    }
    return e;
  })();
function e0() {
  let e = G(),
    n = ve(),
    t = St(n.index, e);
  return (bt(t) ? t : e)[se];
}
var t0 = (() => {
  class e {
    static {
      this.ɵprov = Q({ token: e, providedIn: 'root', factory: () => null });
    }
  }
  return e;
})();
function Cr(e, n, t) {
  let i = t ? e.styles : null,
    r = t ? e.classes : null,
    o = 0;
  if (n !== null)
    for (let s = 0; s < n.length; s++) {
      let a = n[s];
      if (typeof a == 'number') o = a;
      else if (o == 1) r = Kl(r, a);
      else if (o == 2) {
        let d = a,
          p = n[++s];
        i = Kl(i, d + ': ' + p + ';');
      }
    }
  (t ? (e.styles = i) : (e.stylesWithoutHost = i),
    t ? (e.classes = r) : (e.classesWithoutHost = r));
}
var Fs = class extends Gn {
  constructor(n) {
    (super(), (this.ngModule = n));
  }
  resolveComponentFactory(n) {
    let t = ln(n);
    return new Er(t, this.ngModule);
  }
};
function wc(e, n) {
  let t = [];
  for (let i in e) {
    if (!e.hasOwnProperty(i)) continue;
    let r = e[i];
    if (r === void 0) continue;
    let o = Array.isArray(r),
      s = o ? r[0] : r,
      a = o ? r[1] : wt.None;
    n
      ? t.push({ propName: s, templateName: i, isSignal: (a & wt.SignalBased) !== 0 })
      : t.push({ propName: s, templateName: i });
  }
  return t;
}
function n0(e) {
  let n = e.toLowerCase();
  return n === 'svg' ? Ah : n === 'math' ? Nh : null;
}
var Er = class extends vr {
    get inputs() {
      let n = this.componentDef,
        t = n.inputTransforms,
        i = wc(n.inputs, !0);
      if (t !== null)
        for (let r of i) t.hasOwnProperty(r.propName) && (r.transform = t[r.propName]);
      return i;
    }
    get outputs() {
      return wc(this.componentDef.outputs, !1);
    }
    constructor(n, t) {
      (super(),
        (this.componentDef = n),
        (this.ngModule = t),
        (this.componentType = n.type),
        (this.selector = lh(n.selectors)),
        (this.ngContentSelectors = n.ngContentSelectors ? n.ngContentSelectors : []),
        (this.isBoundToModule = !!t));
    }
    create(n, t, i, r) {
      let o = W(null);
      try {
        r = r || this.ngModule;
        let s = r instanceof et ? r : r?.injector;
        s &&
          this.componentDef.getStandaloneInjector !== null &&
          (s = this.componentDef.getStandaloneInjector(s) || s);
        let a = s ? new _s(n, s) : n,
          d = a.get(_n, null);
        if (d === null) throw new F(407, !1);
        let p = a.get(t0, null),
          h = a.get(gn, null),
          g = {
            rendererFactory: d,
            sanitizer: p,
            inlineEffectRunner: null,
            changeDetectionScheduler: h,
          },
          b = d.createRenderer(null, this.componentDef),
          C = this.componentDef.selectors[0][0] || 'div',
          w = i ? ag(b, i, this.componentDef.encapsulation, a) : Ku(b, C, n0(C)),
          x = 512;
        this.componentDef.signals ? (x |= 4096) : this.componentDef.onPush || (x |= 16);
        let N = null;
        w !== null && (N = da(w, a, !0));
        let H = va(0, null, null, 1, 0, null, null, null, null, null, null),
          le = $r(null, H, null, x, null, null, g, b, a, null, N);
        na(le);
        let Y,
          fe,
          be = null;
        try {
          let ce = this.componentDef,
            st,
            xo = null;
          ce.findHostDirectiveDefs
            ? ((st = []), (xo = new Map()), ce.findHostDirectiveDefs(ce, st, xo), st.push(ce))
            : (st = [ce]);
          let Qf = i0(le, w);
          ((be = r0(Qf, w, ce, st, le, g, b)),
            (fe = hu(H, qe)),
            w && a0(b, ce, w, i),
            t !== void 0 && l0(fe, this.ngContentSelectors, t),
            (Y = s0(be, ce, st, xo, le, [c0])),
            Da(H, le, null));
        } catch (ce) {
          throw (be !== null && Is(be), Is(le), ce);
        } finally {
          ia();
        }
        return new ks(this.componentType, Y, jr(fe, le), le, fe);
      } finally {
        W(o);
      }
    }
  },
  ks = class extends Os {
    constructor(n, t, i, r, o) {
      (super(),
        (this.location = i),
        (this._rootLView = r),
        (this._tNode = o),
        (this.previousInputValues = null),
        (this.instance = t),
        (this.hostView = this.changeDetectorRef = new Gt(r, void 0, !1)),
        (this.componentType = n));
    }
    setInput(n, t) {
      let i = this._tNode.inputs,
        r;
      if (i !== null && (r = i[n])) {
        if (
          ((this.previousInputValues ??= new Map()),
          this.previousInputValues.has(n) && Object.is(this.previousInputValues.get(n), t))
        )
          return;
        let o = this._rootLView;
        (Ea(o[j], o, r, n, t), this.previousInputValues.set(n, t));
        let s = St(this._tNode.index, o);
        ba(s, 1);
      }
    }
    get injector() {
      return new jt(this._tNode, this._rootLView);
    }
    destroy() {
      this.hostView.destroy();
    }
    onDestroy(n) {
      this.hostView.onDestroy(n);
    }
  };
function i0(e, n) {
  let t = e[j],
    i = qe;
  return ((e[i] = n), Jn(t, i, 2, '#host', null));
}
function r0(e, n, t, i, r, o, s) {
  let a = r[j];
  o0(i, e, n, s);
  let d = null;
  n !== null && (d = da(n, r[un]));
  let p = o.rendererFactory.createRenderer(n, t),
    h = 16;
  t.signals ? (h = 4096) : t.onPush && (h = 64);
  let g = $r(r, ud(t), null, h, r[e.index], e, o, p, null, null, d);
  return (a.firstCreatePass && As(a, e, i.length - 1), Hr(r, g), (r[e.index] = g));
}
function o0(e, n, t, i) {
  for (let r of e) n.mergedAttrs = $n(n.mergedAttrs, r.hostAttrs);
  n.mergedAttrs !== null && (Cr(n, n.mergedAttrs, !0), t !== null && od(i, t, n));
}
function s0(e, n, t, i, r, o) {
  let s = ve(),
    a = r[j],
    d = Le(s, r);
  fd(a, r, s, t, null, i);
  for (let h = 0; h < t.length; h++) {
    let g = s.directiveStart + h,
      b = hn(r, a, g, s);
    xt(b, r);
  }
  (pd(a, r, s), d && xt(d, r));
  let p = hn(r, a, s.directiveStart + s.componentOffset, s);
  if (((e[Ge] = r[Ge] = p), o !== null)) for (let h of o) h(p, n);
  return (ga(a, s, r), p);
}
function a0(e, n, t, i) {
  if (i) cs(e, t, ['ng-version', '18.2.14']);
  else {
    let { attrs: r, classes: o } = ch(n.selectors[0]);
    (r && cs(e, t, r), o && o.length > 0 && rd(e, t, o.join(' ')));
  }
}
function l0(e, n, t) {
  let i = (e.projection = []);
  for (let r = 0; r < n.length; r++) {
    let o = t[r];
    i.push(o != null ? Array.from(o) : null);
  }
}
function c0() {
  let e = ve();
  Lr(G()[j], e);
}
var Gr = (() => {
  class e {
    static {
      this.__NG_ELEMENT_ID__ = u0;
    }
  }
  return e;
})();
function u0() {
  let e = ve();
  return f0(e, G());
}
var d0 = Gr,
  Id = class extends d0 {
    constructor(n, t, i) {
      (super(), (this._lContainer = n), (this._hostTNode = t), (this._hostLView = i));
    }
    get element() {
      return jr(this._hostTNode, this._hostLView);
    }
    get injector() {
      return new jt(this._hostTNode, this._hostLView);
    }
    get parentInjector() {
      let n = oa(this._hostTNode, this._hostLView);
      if (Nu(n)) {
        let t = fr(n, this._hostLView),
          i = dr(n),
          r = t[j].data[i + 8];
        return new jt(r, t);
      } else return new jt(null, this._hostLView);
    }
    clear() {
      for (; this.length > 0;) this.remove(this.length - 1);
    }
    get(n) {
      let t = Ic(this._lContainer);
      return (t !== null && t[n]) || null;
    }
    get length() {
      return this._lContainer.length - Ve;
    }
    createEmbeddedView(n, t, i) {
      let r, o;
      typeof i == 'number' ? (r = i) : i != null && ((r = i.index), (o = i.injector));
      let s = bc(this._lContainer, n.ssrId),
        a = n.createEmbeddedViewImpl(t || {}, o, s);
      return (this.insertImpl(a, r, Dc(this._hostTNode, s)), a);
    }
    createComponent(n, t, i, r, o) {
      let s = n && !xh(n),
        a;
      if (s) a = t;
      else {
        let w = t || {};
        ((a = w.index),
          (i = w.injector),
          (r = w.projectableNodes),
          (o = w.environmentInjector || w.ngModuleRef));
      }
      let d = s ? n : new Er(ln(n)),
        p = i || this.parentInjector;
      if (!o && d.ngModule == null) {
        let x = (s ? p : this.parentInjector).get(et, null);
        x && (o = x);
      }
      let h = ln(d.componentType ?? {}),
        g = bc(this._lContainer, h?.id ?? null),
        b = g?.firstChild ?? null,
        C = d.create(p, r, b, o);
      return (this.insertImpl(C.hostView, a, Dc(this._hostTNode, g)), C);
    }
    insert(n, t) {
      return this.insertImpl(n, t, !0);
    }
    insertImpl(n, t, i) {
      let r = n._lView;
      if (Oh(r)) {
        let a = this.indexOf(n);
        if (a !== -1) this.detach(a);
        else {
          let d = r[ye],
            p = new Id(d, d[ze], d[ye]);
          p.detach(p.indexOf(n));
        }
      }
      let o = this._adjustIndex(t),
        s = this._lContainer;
      return (Pg(s, r, o, i), n.attachToViewContainerRef(), Gc(es(s), o, n), n);
    }
    move(n, t) {
      return this.insert(n, t);
    }
    indexOf(n) {
      let t = Ic(this._lContainer);
      return t !== null ? t.indexOf(n) : -1;
    }
    remove(n) {
      let t = this._adjustIndex(n, -1),
        i = Ms(this._lContainer, t);
      i && (rr(es(this._lContainer), t), ed(i[j], i));
    }
    detach(n) {
      let t = this._adjustIndex(n, -1),
        i = Ms(this._lContainer, t);
      return i && rr(es(this._lContainer), t) != null ? new Gt(i) : null;
    }
    _adjustIndex(n, t = 0) {
      return n ?? this.length + t;
    }
  };
function Ic(e) {
  return e[lr];
}
function es(e) {
  return e[lr] || (e[lr] = []);
}
function f0(e, n) {
  let t,
    i = n[e.index];
  return (
    pt(i) ? (t = i) : ((t = hd(i, n, null, e)), (n[e.index] = t), Hr(n, t)),
    h0(t, n, e, i),
    new Id(t, e, n)
  );
}
function p0(e, n) {
  let t = e[se],
    i = t.createComment(''),
    r = Le(n, e),
    o = nd(t, r);
  return (_r(t, o, i, Qm(t, r), !1), i);
}
var h0 = _0,
  m0 = () => !1;
function g0(e, n, t) {
  return m0(e, n, t);
}
function _0(e, n, t, i) {
  if (e[Ut]) return;
  let r;
  (t.type & 8 ? (r = nt(i)) : (r = p0(n, t)), (e[Ut] = r));
}
var xc = new Set();
function ei(e) {
  xc.has(e) || (xc.add(e), performance?.mark?.('mark_feature_usage', { detail: { feature: e } }));
}
function y0(e) {
  return typeof e == 'function' && e[at] !== void 0;
}
function ti(e, n) {
  ei('NgSignals');
  let t = Cl(e),
    i = t[at];
  return (
    n?.equal && (i.equal = n.equal),
    (t.set = (r) => Oo(i, r)),
    (t.update = (r) => El(i, r)),
    (t.asReadonly = v0.bind(t)),
    t
  );
}
function v0() {
  let e = this[at];
  if (e.readonlyFn === void 0) {
    let n = () => this();
    ((n[at] = e), (e.readonlyFn = n));
  }
  return e.readonlyFn;
}
function xd(e) {
  return y0(e) && typeof e.set == 'function';
}
function C0(e) {
  return Object.getPrototypeOf(e.prototype).constructor;
}
function Ee(e) {
  let n = C0(e.type),
    t = !0,
    i = [e];
  for (; n;) {
    let r;
    if (It(e)) r = n.ɵcmp || n.ɵdir;
    else {
      if (n.ɵcmp) throw new F(903, !1);
      r = n.ɵdir;
    }
    if (r) {
      if (t) {
        i.push(r);
        let s = e;
        ((s.inputs = Zi(e.inputs)),
          (s.inputTransforms = Zi(e.inputTransforms)),
          (s.declaredInputs = Zi(e.declaredInputs)),
          (s.outputs = Zi(e.outputs)));
        let a = r.hostBindings;
        a && I0(e, a);
        let d = r.viewQuery,
          p = r.contentQueries;
        if (
          (d && b0(e, d),
          p && w0(e, p),
          E0(e, r),
          Tp(e.outputs, r.outputs),
          It(r) && r.data.animation)
        ) {
          let h = e.data;
          h.animation = (h.animation || []).concat(r.data.animation);
        }
      }
      let o = r.features;
      if (o)
        for (let s = 0; s < o.length; s++) {
          let a = o[s];
          (a && a.ngInherit && a(e), a === Ee && (t = !1));
        }
    }
    n = Object.getPrototypeOf(n);
  }
  D0(i);
}
function E0(e, n) {
  for (let t in n.inputs) {
    if (!n.inputs.hasOwnProperty(t) || e.inputs.hasOwnProperty(t)) continue;
    let i = n.inputs[t];
    if (
      i !== void 0 &&
      ((e.inputs[t] = i), (e.declaredInputs[t] = n.declaredInputs[t]), n.inputTransforms !== null)
    ) {
      let r = Array.isArray(i) ? i[0] : i;
      if (!n.inputTransforms.hasOwnProperty(r)) continue;
      ((e.inputTransforms ??= {}), (e.inputTransforms[r] = n.inputTransforms[r]));
    }
  }
}
function D0(e) {
  let n = 0,
    t = null;
  for (let i = e.length - 1; i >= 0; i--) {
    let r = e[i];
    ((r.hostVars = n += r.hostVars), (r.hostAttrs = $n(r.hostAttrs, (t = $n(t, r.hostAttrs)))));
  }
}
function Zi(e) {
  return e === an ? {} : e === Fe ? [] : e;
}
function b0(e, n) {
  let t = e.viewQuery;
  t
    ? (e.viewQuery = (i, r) => {
        (n(i, r), t(i, r));
      })
    : (e.viewQuery = n);
}
function w0(e, n) {
  let t = e.contentQueries;
  t
    ? (e.contentQueries = (i, r, o) => {
        (n(i, r, o), t(i, r, o));
      })
    : (e.contentQueries = n);
}
function I0(e, n) {
  let t = e.hostBindings;
  t
    ? (e.hostBindings = (i, r) => {
        (n(i, r), t(i, r));
      })
    : (e.hostBindings = n);
}
var yn = class {};
var Dr = class extends yn {
  constructor(n) {
    (super(), (this.componentFactoryResolver = new Fs(this)), (this.instance = null));
    let t = new Hn(
      [
        ...n.providers,
        { provide: yn, useValue: this },
        { provide: Gn, useValue: this.componentFactoryResolver },
      ],
      n.parent || Js(),
      n.debugName,
      new Set(['environment']),
    );
    ((this.injector = t), n.runEnvironmentInitializers && t.resolveInjectorInitializers());
  }
  destroy() {
    this.injector.destroy();
  }
  onDestroy(n) {
    this.injector.onDestroy(n);
  }
};
function x0(e, n, t = null) {
  return new Dr({ providers: e, parent: n, debugName: t, runEnvironmentInitializers: !0 }).injector;
}
function Sd(e) {
  return M0(e) ? Array.isArray(e) || (!(e instanceof Map) && Symbol.iterator in e) : !1;
}
function S0(e, n) {
  if (Array.isArray(e)) for (let t = 0; t < e.length; t++) n(e[t]);
  else {
    let t = e[Symbol.iterator](),
      i;
    for (; !(i = t.next()).done;) n(i.value);
  }
}
function M0(e) {
  return e !== null && (typeof e == 'function' || typeof e == 'object');
}
function T0(e, n, t) {
  return (e[n] = t);
}
function dt(e, n, t) {
  let i = e[n];
  return Object.is(i, t) ? !1 : ((e[n] = t), !0);
}
function qn(e, n, t, i) {
  let r = dt(e, n, t);
  return dt(e, n + 1, i) || r;
}
function A0(e, n, t, i, r) {
  let o = qn(e, n, t, i);
  return dt(e, n + 2, r) || o;
}
function Md(e, n, t, i, r, o) {
  let s = qn(e, n, t, i);
  return qn(e, n + 2, r, o) || s;
}
function N0(e) {
  return (e.flags & 32) === 32;
}
function R0(e, n, t, i, r, o, s, a, d) {
  let p = n.consts,
    h = Jn(n, e, 4, s || null, a || null);
  (Ca(n, t, h, pn(p, d)), Lr(n, h));
  let g = (h.tView = va(
    2,
    h,
    i,
    r,
    o,
    n.directiveRegistry,
    n.pipeRegistry,
    null,
    n.schemas,
    p,
    null,
  ));
  return (
    n.queries !== null && (n.queries.template(n, h), (g.queries = n.queries.embeddedTView(h))),
    h
  );
}
function O0(e, n, t, i, r, o, s, a, d, p) {
  let h = t + qe,
    g = n.firstCreatePass ? R0(h, n, e, i, r, o, s, a, d) : n.data[h];
  Qt(g, !1);
  let b = P0(n, e, g, t);
  (kr() && Br(n, e, b, g), xt(b, e));
  let C = hd(b, e, b, g);
  return ((e[h] = C), Hr(e, C), g0(C, g, e), Nr(g) && _a(n, e, g), d != null && ya(e, g, p), g);
}
function I(e, n, t, i, r, o, s, a) {
  let d = G(),
    p = he(),
    h = pn(p.consts, o);
  return (O0(d, p, e, n, t, i, r, h, s, a), I);
}
var P0 = F0;
function F0(e, n, t, i) {
  return (Vr(!0), n[se].createComment(''));
}
var Ln = (function (e) {
    return (
      (e[(e.EarlyRead = 0)] = 'EarlyRead'),
      (e[(e.Write = 1)] = 'Write'),
      (e[(e.MixedReadWrite = 2)] = 'MixedReadWrite'),
      (e[(e.Read = 3)] = 'Read'),
      e
    );
  })(Ln || {}),
  k0 = (() => {
    class e {
      constructor() {
        this.impl = null;
      }
      execute() {
        this.impl?.execute();
      }
      static {
        this.ɵprov = Q({ token: e, providedIn: 'root', factory: () => new e() });
      }
    }
    return e;
  })(),
  Sc = class e {
    constructor() {
      ((this.ngZone = k(oe)),
        (this.scheduler = k(gn)),
        (this.errorHandler = k(ct, { optional: !0 })),
        (this.sequences = new Set()),
        (this.deferredRegistrations = new Set()),
        (this.executing = !1));
    }
    static {
      this.PHASES = [Ln.EarlyRead, Ln.Write, Ln.MixedReadWrite, Ln.Read];
    }
    execute() {
      this.executing = !0;
      for (let n of e.PHASES)
        for (let t of this.sequences)
          if (!(t.erroredOrDestroyed || !t.hooks[n]))
            try {
              t.pipelinedValue = this.ngZone.runOutsideAngular(() => t.hooks[n](t.pipelinedValue));
            } catch (i) {
              ((t.erroredOrDestroyed = !0), this.errorHandler?.handleError(i));
            }
      this.executing = !1;
      for (let n of this.sequences)
        (n.afterRun(), n.once && (this.sequences.delete(n), n.destroy()));
      for (let n of this.deferredRegistrations) this.sequences.add(n);
      (this.deferredRegistrations.size > 0 && this.scheduler.notify(7),
        this.deferredRegistrations.clear());
    }
    register(n) {
      this.executing
        ? this.deferredRegistrations.add(n)
        : (this.sequences.add(n), this.scheduler.notify(6));
    }
    unregister(n) {
      this.executing && this.sequences.has(n)
        ? ((n.erroredOrDestroyed = !0), (n.pipelinedValue = void 0), (n.once = !0))
        : (this.sequences.delete(n), this.deferredRegistrations.delete(n));
    }
    static {
      this.ɵprov = Q({ token: e, providedIn: 'root', factory: () => new e() });
    }
  };
function ni(e, n, t, i) {
  let r = G(),
    o = Fr();
  if (dt(r, o, n)) {
    let s = he(),
      a = ra();
    wg(a, r, e, n, t, i);
  }
  return ni;
}
function V0(e, n, t, i) {
  return dt(e, Fr(), t) ? n + pe(t) + i : Ce;
}
function L0(e, n, t, i, r, o) {
  let s = Pr(),
    a = qn(e, s, t, r);
  return (Kn(2), a ? n + pe(t) + i + pe(r) + o : Ce);
}
function j0(e, n, t, i, r, o, s, a) {
  let d = Pr(),
    p = A0(e, d, t, r, s);
  return (Kn(3), p ? n + pe(t) + i + pe(r) + o + pe(s) + a : Ce);
}
function B0(e, n, t, i, r, o, s, a, d, p) {
  let h = Pr(),
    g = Md(e, h, t, r, s, d);
  return (Kn(4), g ? n + pe(t) + i + pe(r) + o + pe(s) + a + pe(d) + p : Ce);
}
function U0(e, n, t, i, r, o, s, a, d, p, h, g) {
  let b = Pr(),
    C = Md(e, b, t, r, s, d);
  return (
    (C = dt(e, b + 4, h) || C),
    Kn(5),
    C ? n + pe(t) + i + pe(r) + o + pe(s) + a + pe(d) + p + pe(h) + g : Ce
  );
}
function Qi(e, n) {
  return (e << 17) | (n << 2);
}
function qt(e) {
  return (e >> 17) & 32767;
}
function $0(e) {
  return (e & 2) == 2;
}
function H0(e, n) {
  return (e & 131071) | (n << 17);
}
function Vs(e) {
  return e | 2;
}
function vn(e) {
  return (e & 131068) >> 2;
}
function ts(e, n) {
  return (e & -131069) | (n << 2);
}
function W0(e) {
  return (e & 1) === 1;
}
function Ls(e) {
  return e | 1;
}
function G0(e, n, t, i, r, o) {
  let s = o ? n.classBindings : n.styleBindings,
    a = qt(s),
    d = vn(s);
  e[i] = t;
  let p = !1,
    h;
  if (Array.isArray(t)) {
    let g = t;
    ((h = g[1]), (h === null || Qn(g, h) > 0) && (p = !0));
  } else h = t;
  if (r)
    if (d !== 0) {
      let b = qt(e[a + 1]);
      ((e[i + 1] = Qi(b, a)),
        b !== 0 && (e[b + 1] = ts(e[b + 1], i)),
        (e[a + 1] = H0(e[a + 1], i)));
    } else ((e[i + 1] = Qi(a, 0)), a !== 0 && (e[a + 1] = ts(e[a + 1], i)), (a = i));
  else ((e[i + 1] = Qi(d, 0)), a === 0 ? (a = i) : (e[d + 1] = ts(e[d + 1], i)), (d = i));
  (p && (e[i + 1] = Vs(e[i + 1])),
    Mc(e, h, i, !0),
    Mc(e, h, i, !1),
    q0(n, h, e, i, o),
    (s = Qi(a, d)),
    o ? (n.classBindings = s) : (n.styleBindings = s));
}
function q0(e, n, t, i, r) {
  let o = r ? e.residualClasses : e.residualStyles;
  o != null && typeof n == 'string' && Qn(o, n) >= 0 && (t[i + 1] = Ls(t[i + 1]));
}
function Mc(e, n, t, i) {
  let r = e[t + 1],
    o = n === null,
    s = i ? qt(r) : vn(r),
    a = !1;
  for (; s !== 0 && (a === !1 || o);) {
    let d = e[s],
      p = e[s + 1];
    (z0(d, n) && ((a = !0), (e[s + 1] = i ? Ls(p) : Vs(p))), (s = i ? qt(p) : vn(p)));
  }
  a && (e[t + 1] = i ? Vs(r) : Ls(r));
}
function z0(e, n) {
  return e === null || n == null || (Array.isArray(e) ? e[1] : e) === n
    ? !0
    : Array.isArray(e) && typeof n == 'string'
      ? Qn(e, n) >= 0
      : !1;
}
function _(e, n, t) {
  let i = G(),
    r = Fr();
  if (dt(i, r, n)) {
    let o = he(),
      s = ra();
    dd(o, s, i, e, n, i[se], t, !1);
  }
  return _;
}
function Tc(e, n, t, i, r) {
  let o = n.inputs,
    s = r ? 'class' : 'style';
  Ea(e, t, o[s], s, i);
}
function je(e, n, t) {
  return (Td(e, n, t, !1), je);
}
function de(e, n) {
  return (Td(e, n, null, !0), de);
}
function Td(e, n, t, i) {
  let r = G(),
    o = he(),
    s = Kn(2);
  if ((o.firstUpdatePass && Q0(o, e, s, i), n !== Ce && dt(r, s, n))) {
    let a = o.data[it()];
    e_(o, a, r, r[se], e, (r[s + 1] = t_(n, t)), i, s);
  }
}
function Z0(e, n) {
  return n >= e.expandoStartIndex;
}
function Q0(e, n, t, i) {
  let r = e.data;
  if (r[t + 1] === null) {
    let o = r[it()],
      s = Z0(e, t);
    (n_(o, i) && n === null && !s && (n = !1), (n = Y0(r, o, n, i)), G0(r, o, n, t, s, i));
  }
}
function Y0(e, n, t, i) {
  let r = Zh(e),
    o = i ? n.residualClasses : n.residualStyles;
  if (r === null)
    (i ? n.classBindings : n.styleBindings) === 0 &&
      ((t = ns(null, e, n, t, i)), (t = zn(t, n.attrs, i)), (o = null));
  else {
    let s = n.directiveStylingLast;
    if (s === -1 || e[s] !== r)
      if (((t = ns(r, e, n, t, i)), o === null)) {
        let d = K0(e, n, i);
        d !== void 0 &&
          Array.isArray(d) &&
          ((d = ns(null, e, n, d[1], i)), (d = zn(d, n.attrs, i)), J0(e, n, i, d));
      } else o = X0(e, n, i);
  }
  return (o !== void 0 && (i ? (n.residualClasses = o) : (n.residualStyles = o)), t);
}
function K0(e, n, t) {
  let i = t ? n.classBindings : n.styleBindings;
  if (vn(i) !== 0) return e[qt(i)];
}
function J0(e, n, t, i) {
  let r = t ? n.classBindings : n.styleBindings;
  e[qt(r)] = i;
}
function X0(e, n, t) {
  let i,
    r = n.directiveEnd;
  for (let o = 1 + n.directiveStylingLast; o < r; o++) {
    let s = e[o].hostAttrs;
    i = zn(i, s, t);
  }
  return zn(i, n.attrs, t);
}
function ns(e, n, t, i, r) {
  let o = null,
    s = t.directiveEnd,
    a = t.directiveStylingLast;
  for (
    a === -1 ? (a = t.directiveStart) : a++;
    a < s && ((o = n[a]), (i = zn(i, o.hostAttrs, r)), o !== e);
  )
    a++;
  return (e !== null && (t.directiveStylingLast = a), i);
}
function zn(e, n, t) {
  let i = t ? 1 : 2,
    r = -1;
  if (n !== null)
    for (let o = 0; o < n.length; o++) {
      let s = n[o];
      typeof s == 'number'
        ? (r = s)
        : r === i &&
          (Array.isArray(e) || (e = e === void 0 ? [] : ['', e]), Qp(e, s, t ? !0 : n[++o]));
    }
  return e === void 0 ? null : e;
}
function e_(e, n, t, i, r, o, s, a) {
  if (!(n.type & 3)) return;
  let d = e.data,
    p = d[a + 1],
    h = W0(p) ? Ac(d, n, t, r, vn(p), s) : void 0;
  if (!br(h)) {
    br(o) || ($0(p) && (o = Ac(d, null, t, r, a, s)));
    let g = pu(it(), t);
    ng(i, s, g, r, o);
  }
}
function Ac(e, n, t, i, r, o) {
  let s = n === null,
    a;
  for (; r > 0;) {
    let d = e[r],
      p = Array.isArray(d),
      h = p ? d[1] : d,
      g = h === null,
      b = t[r + 1];
    b === Ce && (b = g ? Fe : void 0);
    let C = g ? qo(b, i) : h === i ? b : void 0;
    if ((p && !br(C) && (C = qo(d, i)), br(C) && ((a = C), s))) return a;
    let w = e[r + 1];
    r = s ? qt(w) : vn(w);
  }
  if (n !== null) {
    let d = o ? n.residualClasses : n.residualStyles;
    d != null && (a = qo(d, i));
  }
  return a;
}
function br(e) {
  return e !== void 0;
}
function t_(e, n) {
  return (
    e == null ||
      e === '' ||
      (typeof n == 'string' ? (e = e + n) : typeof e == 'object' && (e = Ne(fa(e)))),
    e
  );
}
function n_(e, n) {
  return (e.flags & (n ? 8 : 16)) !== 0;
}
function i_(e, n, t, i, r, o) {
  let s = n.consts,
    a = pn(s, r),
    d = Jn(n, e, 2, i, a);
  return (
    Ca(n, t, d, pn(s, o)),
    d.attrs !== null && Cr(d, d.attrs, !1),
    d.mergedAttrs !== null && Cr(d, d.mergedAttrs, !0),
    n.queries !== null && n.queries.elementStart(n, d),
    d
  );
}
function l(e, n, t, i) {
  let r = G(),
    o = he(),
    s = qe + e,
    a = r[se],
    d = o.firstCreatePass ? i_(s, o, r, n, t, i) : o.data[s],
    p = r_(o, r, d, a, n, e);
  r[s] = p;
  let h = Nr(d);
  return (
    Qt(d, !0),
    od(a, p, d),
    !N0(d) && kr() && Br(o, r, p, d),
    kh() === 0 && xt(p, r),
    Vh(),
    h && (_a(o, r, d), ga(o, d, r)),
    i !== null && ya(r, d),
    l
  );
}
function c() {
  let e = ve();
  ta() ? Eu() : ((e = e.parent), Qt(e, !1));
  let n = e;
  (Bh(n) && Uh(), Lh());
  let t = he();
  return (
    t.firstCreatePass && (Lr(t, e), Xs(e) && t.queries.elementEnd(e)),
    n.classesWithoutHost != null && tm(n) && Tc(t, n, G(), n.classesWithoutHost, !0),
    n.stylesWithoutHost != null && nm(n) && Tc(t, n, G(), n.stylesWithoutHost, !1),
    c
  );
}
function te(e, n, t, i) {
  return (l(e, n, t, i), c(), te);
}
var r_ = (e, n, t, i, r, o) => (Vr(!0), Ku(i, r, Kh()));
function o_(e, n, t, i, r) {
  let o = n.consts,
    s = pn(o, i),
    a = Jn(n, e, 8, 'ng-container', s);
  s !== null && Cr(a, s, !0);
  let d = pn(o, r);
  return (Ca(n, t, a, d), n.queries !== null && n.queries.elementStart(n, a), a);
}
function mt(e, n, t) {
  let i = G(),
    r = he(),
    o = e + qe,
    s = r.firstCreatePass ? o_(o, r, i, n, t) : r.data[o];
  Qt(s, !0);
  let a = s_(r, i, s, e);
  return (
    (i[o] = a),
    kr() && Br(r, i, a, s),
    xt(a, i),
    Nr(s) && (_a(r, i, s), ga(r, s, i)),
    t != null && ya(i, s),
    mt
  );
}
function gt() {
  let e = ve(),
    n = he();
  return (
    ta() ? Eu() : ((e = e.parent), Qt(e, !1)),
    n.firstCreatePass && (Lr(n, e), Xs(e) && n.queries.elementEnd(e)),
    gt
  );
}
var s_ = (e, n, t, i) => (Vr(!0), Bm(n[se], ''));
function R() {
  return G();
}
var Lt = void 0;
function a_(e) {
  let n = e,
    t = Math.floor(Math.abs(e)),
    i = e.toString().replace(/^[^.]*\.?/, '').length;
  return t === 1 && i === 0 ? 1 : 5;
}
var l_ = [
    'en',
    [['a', 'p'], ['AM', 'PM'], Lt],
    [['AM', 'PM'], Lt, Lt],
    [
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    ],
    Lt,
    [
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    ],
    Lt,
    [
      ['B', 'A'],
      ['BC', 'AD'],
      ['Before Christ', 'Anno Domini'],
    ],
    0,
    [6, 0],
    ['M/d/yy', 'MMM d, y', 'MMMM d, y', 'EEEE, MMMM d, y'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1}, {0}', Lt, "{1} 'at' {0}", Lt],
    ['.', ',', ';', '%', '+', '-', 'E', '\xD7', '\u2030', '\u221E', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '\xA4#,##0.00', '#E0'],
    'USD',
    '$',
    'US Dollar',
    {},
    'ltr',
    a_,
  ],
  is = {};
function Be(e) {
  let n = c_(e),
    t = Nc(n);
  if (t) return t;
  let i = n.split('-')[0];
  if (((t = Nc(i)), t)) return t;
  if (i === 'en') return l_;
  throw new F(701, !1);
}
function Nc(e) {
  return (
    e in is || (is[e] = kn.ng && kn.ng.common && kn.ng.common.locales && kn.ng.common.locales[e]),
    is[e]
  );
}
var re = (function (e) {
  return (
    (e[(e.LocaleId = 0)] = 'LocaleId'),
    (e[(e.DayPeriodsFormat = 1)] = 'DayPeriodsFormat'),
    (e[(e.DayPeriodsStandalone = 2)] = 'DayPeriodsStandalone'),
    (e[(e.DaysFormat = 3)] = 'DaysFormat'),
    (e[(e.DaysStandalone = 4)] = 'DaysStandalone'),
    (e[(e.MonthsFormat = 5)] = 'MonthsFormat'),
    (e[(e.MonthsStandalone = 6)] = 'MonthsStandalone'),
    (e[(e.Eras = 7)] = 'Eras'),
    (e[(e.FirstDayOfWeek = 8)] = 'FirstDayOfWeek'),
    (e[(e.WeekendRange = 9)] = 'WeekendRange'),
    (e[(e.DateFormat = 10)] = 'DateFormat'),
    (e[(e.TimeFormat = 11)] = 'TimeFormat'),
    (e[(e.DateTimeFormat = 12)] = 'DateTimeFormat'),
    (e[(e.NumberSymbols = 13)] = 'NumberSymbols'),
    (e[(e.NumberFormats = 14)] = 'NumberFormats'),
    (e[(e.CurrencyCode = 15)] = 'CurrencyCode'),
    (e[(e.CurrencySymbol = 16)] = 'CurrencySymbol'),
    (e[(e.CurrencyName = 17)] = 'CurrencyName'),
    (e[(e.Currencies = 18)] = 'Currencies'),
    (e[(e.Directionality = 19)] = 'Directionality'),
    (e[(e.PluralCase = 20)] = 'PluralCase'),
    (e[(e.ExtraData = 21)] = 'ExtraData'),
    e
  );
})(re || {});
function c_(e) {
  return e.toLowerCase().replace(/_/g, '-');
}
var wr = 'en-US';
var u_ = wr;
function d_(e) {
  typeof e == 'string' && (u_ = e.toLowerCase().replace(/_/g, '-'));
}
var f_ = (e, n, t) => {};
function E(e, n, t, i) {
  let r = G(),
    o = he(),
    s = ve();
  return (Ad(o, r, r[se], s, e, n, i), E);
}
function p_(e, n, t, i) {
  let r = e.cleanup;
  if (r != null)
    for (let o = 0; o < r.length - 1; o += 2) {
      let s = r[o];
      if (s === t && r[o + 1] === i) {
        let a = n[ar],
          d = r[o + 2];
        return a.length > d ? a[d] : null;
      }
      typeof s == 'string' && (o += 2);
    }
  return null;
}
function Ad(e, n, t, i, r, o, s) {
  let a = Nr(i),
    p = e.firstCreatePass && Tg(e),
    h = n[Ge],
    g = Mg(n),
    b = !0;
  if (i.type & 3 || s) {
    let x = Le(i, n),
      N = s ? s(x) : x,
      H = g.length,
      le = s ? (fe) => s(nt(fe[i.index])) : i.index,
      Y = null;
    if ((!s && a && (Y = p_(e, n, r, i.index)), Y !== null)) {
      let fe = Y.__ngLastListenerFn__ || Y;
      ((fe.__ngNextListenerFn__ = o), (Y.__ngLastListenerFn__ = o), (b = !1));
    } else {
      ((o = Oc(i, n, h, o)), f_(x, r, o));
      let fe = t.listen(N, r, o);
      (g.push(o, fe), p && p.push(r, le, H, H + 1));
    }
  } else o = Oc(i, n, h, o);
  let C = i.outputs,
    w;
  if (b && C !== null && (w = C[r])) {
    let x = w.length;
    if (x)
      for (let N = 0; N < x; N += 2) {
        let H = w[N],
          le = w[N + 1],
          be = n[H][le].subscribe(o),
          ce = g.length;
        (g.push(o, be), p && p.push(r, i.index, ce, -(ce + 1)));
      }
  }
}
function Rc(e, n, t, i) {
  let r = W(null);
  try {
    return (Ke(6, n, t), t(i) !== !1);
  } catch (o) {
    return (gd(e, o), !1);
  } finally {
    (Ke(7, n, t), W(r));
  }
}
function Oc(e, n, t, i) {
  return function r(o) {
    if (o === Function) return i;
    let s = e.componentOffset > -1 ? St(e.index, n) : n;
    ba(s, 5);
    let a = Rc(n, t, i, o),
      d = r.__ngNextListenerFn__;
    for (; d;) ((a = Rc(n, t, d, o) && a), (d = d.__ngNextListenerFn__));
    return a;
  };
}
function m(e = 1) {
  return Yh(e);
}
function h_(e, n, t, i) {
  (t >= e.data.length && ((e.data[t] = null), (e.blueprint[t] = null)), (n[t] = i));
}
function u(e, n = '') {
  let t = G(),
    i = he(),
    r = e + qe,
    o = i.firstCreatePass ? Jn(i, r, 1, n, null) : i.data[r],
    s = m_(i, t, o, n, e);
  ((t[r] = s), kr() && Br(i, t, s, o), Qt(o, !1));
}
var m_ = (e, n, t, i, r) => (Vr(!0), Lm(n[se], i));
function D(e) {
  return (A('', e, ''), D);
}
function A(e, n, t) {
  let i = G(),
    r = V0(i, e, n, t);
  return (r !== Ce && Xn(i, it(), r), A);
}
function me(e, n, t, i, r) {
  let o = G(),
    s = L0(o, e, n, t, i, r);
  return (s !== Ce && Xn(o, it(), s), me);
}
function rt(e, n, t, i, r, o, s) {
  let a = G(),
    d = j0(a, e, n, t, i, r, o, s);
  return (d !== Ce && Xn(a, it(), d), rt);
}
function qr(e, n, t, i, r, o, s, a, d) {
  let p = G(),
    h = B0(p, e, n, t, i, r, o, s, a, d);
  return (h !== Ce && Xn(p, it(), h), qr);
}
function Ia(e, n, t, i, r, o, s, a, d, p, h) {
  let g = G(),
    b = U0(g, e, n, t, i, r, o, s, a, d, p, h);
  return (b !== Ce && Xn(g, it(), b), Ia);
}
function S(e, n, t) {
  xd(n) && (n = n());
  let i = G(),
    r = Fr();
  if (dt(i, r, n)) {
    let o = he(),
      s = ra();
    dd(o, s, i, e, n, i[se], t, !1);
  }
  return S;
}
function T(e, n) {
  let t = xd(e);
  return (t && e.set(n), t);
}
function M(e, n) {
  let t = G(),
    i = he(),
    r = ve();
  return (Ad(i, t, t[se], r, e, n), M);
}
function g_(e, n, t) {
  let i = he();
  if (i.firstCreatePass) {
    let r = It(e);
    (js(t, i.data, i.blueprint, r, !0), js(n, i.data, i.blueprint, r, !1));
  }
}
function js(e, n, t, i, r) {
  if (((e = _e(e)), Array.isArray(e))) for (let o = 0; o < e.length; o++) js(e[o], n, t, i, r);
  else {
    let o = he(),
      s = G(),
      a = ve(),
      d = cn(e) ? e : _e(e.provide),
      p = ou(e),
      h = a.providerIndexes & 1048575,
      g = a.directiveStart,
      b = a.providerIndexes >> 20;
    if (cn(e) || !e.multi) {
      let C = new Wt(p, r, L),
        w = os(d, n, r ? h : h + b, g);
      w === -1
        ? (vs(hr(a, s), o, d),
          rs(o, e, n.length),
          n.push(d),
          a.directiveStart++,
          a.directiveEnd++,
          r && (a.providerIndexes += 1048576),
          t.push(C),
          s.push(C))
        : ((t[w] = C), (s[w] = C));
    } else {
      let C = os(d, n, h + b, g),
        w = os(d, n, h, h + b),
        x = C >= 0 && t[C],
        N = w >= 0 && t[w];
      if ((r && !N) || (!r && !x)) {
        vs(hr(a, s), o, d);
        let H = v_(r ? y_ : __, t.length, r, i, p);
        (!r && N && (t[w].providerFactory = H),
          rs(o, e, n.length, 0),
          n.push(d),
          a.directiveStart++,
          a.directiveEnd++,
          r && (a.providerIndexes += 1048576),
          t.push(H),
          s.push(H));
      } else {
        let H = Nd(t[r ? w : C], p, !r && i);
        rs(o, e, C > -1 ? C : w, H);
      }
      !r && i && N && t[w].componentProviders++;
    }
  }
}
function rs(e, n, t, i) {
  let r = cn(n),
    o = yh(n);
  if (r || o) {
    let d = (o ? _e(n.useClass) : n).prototype.ngOnDestroy;
    if (d) {
      let p = e.destroyHooks || (e.destroyHooks = []);
      if (!r && n.multi) {
        let h = p.indexOf(t);
        h === -1 ? p.push(t, [i, d]) : p[h + 1].push(i, d);
      } else p.push(t, d);
    }
  }
}
function Nd(e, n, t) {
  return (t && e.componentProviders++, e.multi.push(n) - 1);
}
function os(e, n, t, i) {
  for (let r = t; r < i; r++) if (n[r] === e) return r;
  return -1;
}
function __(e, n, t, i) {
  return Bs(this.multi, []);
}
function y_(e, n, t, i) {
  let r = this.multi,
    o;
  if (this.providerFactory) {
    let s = this.providerFactory.componentProviders,
      a = hn(t, t[j], this.providerFactory.index, i);
    ((o = a.slice(0, s)), Bs(r, o));
    for (let d = s; d < a.length; d++) o.push(a[d]);
  } else ((o = []), Bs(r, o));
  return o;
}
function Bs(e, n) {
  for (let t = 0; t < e.length; t++) {
    let i = e[t];
    n.push(i());
  }
  return n;
}
function v_(e, n, t, i, r) {
  let o = new Wt(e, t, L);
  return ((o.multi = []), (o.index = n), (o.componentProviders = 0), Nd(o, r, i && !t), o);
}
function Ze(e, n = []) {
  return (t) => {
    t.providersResolver = (i, r) => g_(i, r ? r(e) : e, n);
  };
}
var C_ = (() => {
  class e {
    constructor(t) {
      ((this._injector = t), (this.cachedInjectors = new Map()));
    }
    getOrCreateStandaloneInjector(t) {
      if (!t.standalone) return null;
      if (!this.cachedInjectors.has(t)) {
        let i = nu(!1, t.type),
          r = i.length > 0 ? x0([i], this._injector, `Standalone[${t.type.name}]`) : null;
        this.cachedInjectors.set(t, r);
      }
      return this.cachedInjectors.get(t);
    }
    ngOnDestroy() {
      try {
        for (let t of this.cachedInjectors.values()) t !== null && t.destroy();
      } finally {
        this.cachedInjectors.clear();
      }
    }
    static {
      this.ɵprov = Q({ token: e, providedIn: 'environment', factory: () => new e($(et)) });
    }
  }
  return e;
})();
function Rd(e) {
  (ei('NgStandalone'),
    (e.getStandaloneInjector = (n) => n.get(C_).getOrCreateStandaloneInjector(e)));
}
function E_(e, n) {
  let t = e[n];
  return t === Ce ? void 0 : t;
}
function D_(e, n, t, i, r, o, s) {
  let a = n + t;
  return qn(e, a, r, o) ? T0(e, a + 2, s ? i.call(s, r, o) : i(r, o)) : E_(e, a + 2);
}
function Dn(e, n) {
  let t = he(),
    i,
    r = e + qe;
  t.firstCreatePass
    ? ((i = b_(n, t.pipeRegistry)),
      (t.data[r] = i),
      i.onDestroy && (t.destroyHooks ??= []).push(r, i.onDestroy))
    : (i = t.data[r]);
  let o = i.factory || (i.factory = Bt(i.type, !0)),
    s,
    a = Me(L);
  try {
    let d = pr(!1),
      p = o();
    return (pr(d), h_(t, G(), r, p), p);
  } finally {
    Me(a);
  }
}
function b_(e, n) {
  if (n)
    for (let t = n.length - 1; t >= 0; t--) {
      let i = n[t];
      if (e === i.name) return i;
    }
}
function bn(e, n, t, i) {
  let r = e + qe,
    o = G(),
    s = Rh(o, r);
  return w_(o, r) ? D_(o, Hh(), n, s.transform, t, i, s) : s.transform(t, i);
}
function w_(e, n) {
  return e[j].data[n].pure;
}
var Od = new P('');
function ii(e) {
  return !!e && typeof e.then == 'function';
}
function Pd(e) {
  return !!e && typeof e.subscribe == 'function';
}
var I_ = new P(''),
  Fd = (() => {
    class e {
      constructor() {
        ((this.initialized = !1),
          (this.done = !1),
          (this.donePromise = new Promise((t, i) => {
            ((this.resolve = t), (this.reject = i));
          })),
          (this.appInits = k(I_, { optional: !0 }) ?? []));
      }
      runInitializers() {
        if (this.initialized) return;
        let t = [];
        for (let r of this.appInits) {
          let o = r();
          if (ii(o)) t.push(o);
          else if (Pd(o)) {
            let s = new Promise((a, d) => {
              o.subscribe({ complete: a, error: d });
            });
            t.push(s);
          }
        }
        let i = () => {
          ((this.done = !0), this.resolve());
        };
        (Promise.all(t)
          .then(() => {
            i();
          })
          .catch((r) => {
            this.reject(r);
          }),
          t.length === 0 && i(),
          (this.initialized = !0));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac, providedIn: 'root' });
      }
    }
    return e;
  })(),
  kd = new P('');
function x_() {
  vl(() => {
    throw new F(600, !1);
  });
}
function S_(e) {
  return e.isBoundToModule;
}
var M_ = 10;
function T_(e, n, t) {
  try {
    let i = t();
    return ii(i)
      ? i.catch((r) => {
          throw (n.runOutsideAngular(() => e.handleError(r)), r);
        })
      : i;
  } catch (i) {
    throw (n.runOutsideAngular(() => e.handleError(i)), i);
  }
}
var wn = (() => {
  class e {
    constructor() {
      ((this._bootstrapListeners = []),
        (this._runningTick = !1),
        (this._destroyed = !1),
        (this._destroyListeners = []),
        (this._views = []),
        (this.internalErrorHandler = k(Dm)),
        (this.afterRenderManager = k(k0)),
        (this.zonelessEnabled = k(wa)),
        (this.dirtyFlags = 0),
        (this.deferredDirtyFlags = 0),
        (this.externalTestViews = new Set()),
        (this.beforeRender = new Ye()),
        (this.afterTick = new Ye()),
        (this.componentTypes = []),
        (this.components = []),
        (this.isStable = k(En).hasPendingTasks.pipe(Se((t) => !t))),
        (this._injector = k(et)));
    }
    get allViews() {
      return [...this.externalTestViews.keys(), ...this._views];
    }
    get destroyed() {
      return this._destroyed;
    }
    whenStable() {
      let t;
      return new Promise((i) => {
        t = this.isStable.subscribe({
          next: (r) => {
            r && i();
          },
        });
      }).finally(() => {
        t.unsubscribe();
      });
    }
    get injector() {
      return this._injector;
    }
    bootstrap(t, i) {
      let r = t instanceof vr;
      if (!this._injector.get(Fd).done) {
        let b = !r && fh(t),
          C = !1;
        throw new F(405, C);
      }
      let s;
      (r ? (s = t) : (s = this._injector.get(Gn).resolveComponentFactory(t)),
        this.componentTypes.push(s.componentType));
      let a = S_(s) ? void 0 : this._injector.get(yn),
        d = i || s.selector,
        p = s.create(mn.NULL, [], d, a),
        h = p.location.nativeElement,
        g = p.injector.get(Od, null);
      return (
        g?.registerApplication(h),
        p.onDestroy(() => {
          (this.detachView(p.hostView), er(this.components, p), g?.unregisterApplication(h));
        }),
        this._loadComponent(p),
        p
      );
    }
    tick() {
      (this.zonelessEnabled || (this.dirtyFlags |= 1), this._tick());
    }
    _tick() {
      if (this._runningTick) throw new F(101, !1);
      let t = W(null);
      try {
        ((this._runningTick = !0), this.synchronize());
      } catch (i) {
        this.internalErrorHandler(i);
      } finally {
        ((this._runningTick = !1), W(t), this.afterTick.next());
      }
    }
    synchronize() {
      let t = null;
      (this._injector.destroyed || (t = this._injector.get(_n, null, { optional: !0 })),
        (this.dirtyFlags |= this.deferredDirtyFlags),
        (this.deferredDirtyFlags = 0));
      let i = 0;
      for (; this.dirtyFlags !== 0 && i++ < M_;) this.synchronizeOnce(t);
    }
    synchronizeOnce(t) {
      if (
        ((this.dirtyFlags |= this.deferredDirtyFlags),
        (this.deferredDirtyFlags = 0),
        this.dirtyFlags & 7)
      ) {
        let i = !!(this.dirtyFlags & 1);
        ((this.dirtyFlags &= -8), (this.dirtyFlags |= 8), this.beforeRender.next(i));
        for (let { _lView: r, notifyErrorHandler: o } of this._views)
          A_(r, o, i, this.zonelessEnabled);
        if (((this.dirtyFlags &= -5), this.syncDirtyFlagsWithViews(), this.dirtyFlags & 7)) return;
      } else (t?.begin?.(), t?.end?.());
      (this.dirtyFlags & 8 && ((this.dirtyFlags &= -9), this.afterRenderManager.execute()),
        this.syncDirtyFlagsWithViews());
    }
    syncDirtyFlagsWithViews() {
      if (this.allViews.some(({ _lView: t }) => Rr(t))) {
        this.dirtyFlags |= 2;
        return;
      } else this.dirtyFlags &= -8;
    }
    attachView(t) {
      let i = t;
      (this._views.push(i), i.attachToAppRef(this));
    }
    detachView(t) {
      let i = t;
      (er(this._views, i), i.detachFromAppRef());
    }
    _loadComponent(t) {
      (this.attachView(t.hostView), this.tick(), this.components.push(t));
      let i = this._injector.get(kd, []);
      [...this._bootstrapListeners, ...i].forEach((r) => r(t));
    }
    ngOnDestroy() {
      if (!this._destroyed)
        try {
          (this._destroyListeners.forEach((t) => t()),
            this._views.slice().forEach((t) => t.destroy()));
        } finally {
          ((this._destroyed = !0),
            (this._views = []),
            (this._bootstrapListeners = []),
            (this._destroyListeners = []));
        }
    }
    onDestroy(t) {
      return (this._destroyListeners.push(t), () => er(this._destroyListeners, t));
    }
    destroy() {
      if (this._destroyed) throw new F(406, !1);
      let t = this._injector;
      t.destroy && !t.destroyed && t.destroy();
    }
    get viewCount() {
      return this._views.length;
    }
    warnIfDestroyed() {}
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵprov = Q({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
  }
  return e;
})();
function er(e, n) {
  let t = e.indexOf(n);
  t > -1 && e.splice(t, 1);
}
function A_(e, n, t, i) {
  if (!t && !Rr(e)) return;
  vd(e, n, t && !i ? 0 : 1);
}
var N_ = (() => {
  class e {
    constructor() {
      ((this.zone = k(oe)), (this.changeDetectionScheduler = k(gn)), (this.applicationRef = k(wn)));
    }
    initialize() {
      this._onMicrotaskEmptySubscription ||
        (this._onMicrotaskEmptySubscription = this.zone.onMicrotaskEmpty.subscribe({
          next: () => {
            this.changeDetectionScheduler.runningTick ||
              this.zone.run(() => {
                this.applicationRef.tick();
              });
          },
        }));
    }
    ngOnDestroy() {
      this._onMicrotaskEmptySubscription?.unsubscribe();
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵprov = Q({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
  }
  return e;
})();
function R_({ ngZoneFactory: e, ignoreChangesOutsideZone: n, scheduleInRootZone: t }) {
  return (
    (e ??= () => new oe(ee(Z({}, O_()), { scheduleInRootZone: t }))),
    [
      { provide: oe, useFactory: e },
      {
        provide: Un,
        multi: !0,
        useFactory: () => {
          let i = k(N_, { optional: !0 });
          return () => i.initialize();
        },
      },
      {
        provide: Un,
        multi: !0,
        useFactory: () => {
          let i = k(P_);
          return () => {
            i.initialize();
          };
        },
      },
      n === !0 ? { provide: bd, useValue: !0 } : [],
      { provide: wd, useValue: t ?? Bu },
    ]
  );
}
function O_(e) {
  return {
    enableLongStackTrace: !1,
    shouldCoalesceEventChangeDetection: e?.eventCoalescing ?? !1,
    shouldCoalesceRunChangeDetection: e?.runCoalescing ?? !1,
  };
}
var P_ = (() => {
  class e {
    constructor() {
      ((this.subscription = new ge()),
        (this.initialized = !1),
        (this.zone = k(oe)),
        (this.pendingTasks = k(En)));
    }
    initialize() {
      if (this.initialized) return;
      this.initialized = !0;
      let t = null;
      (!this.zone.isStable &&
        !this.zone.hasPendingMacrotasks &&
        !this.zone.hasPendingMicrotasks &&
        (t = this.pendingTasks.add()),
        this.zone.runOutsideAngular(() => {
          this.subscription.add(
            this.zone.onStable.subscribe(() => {
              (oe.assertNotInAngularZone(),
                queueMicrotask(() => {
                  t !== null &&
                    !this.zone.hasPendingMacrotasks &&
                    !this.zone.hasPendingMicrotasks &&
                    (this.pendingTasks.remove(t), (t = null));
                }));
            }),
          );
        }),
        this.subscription.add(
          this.zone.onUnstable.subscribe(() => {
            (oe.assertInAngularZone(), (t ??= this.pendingTasks.add()));
          }),
        ));
    }
    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵprov = Q({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
  }
  return e;
})();
var F_ = (() => {
  class e {
    constructor() {
      ((this.appRef = k(wn)),
        (this.taskService = k(En)),
        (this.ngZone = k(oe)),
        (this.zonelessEnabled = k(wa)),
        (this.disableScheduling = k(bd, { optional: !0 }) ?? !1),
        (this.zoneIsDefined = typeof Zone < 'u' && !!Zone.root.run),
        (this.schedulerTickApplyArgs = [{ data: { __scheduler_tick__: !0 } }]),
        (this.subscriptions = new ge()),
        (this.angularZoneId = this.zoneIsDefined ? this.ngZone._inner?.get(gr) : null),
        (this.scheduleInRootZone =
          !this.zonelessEnabled && this.zoneIsDefined && (k(wd, { optional: !0 }) ?? !1)),
        (this.cancelScheduledCallback = null),
        (this.useMicrotaskScheduler = !1),
        (this.runningTick = !1),
        (this.pendingRenderTaskId = null),
        this.subscriptions.add(
          this.appRef.afterTick.subscribe(() => {
            this.runningTick || this.cleanup();
          }),
        ),
        this.subscriptions.add(
          this.ngZone.onUnstable.subscribe(() => {
            this.runningTick || this.cleanup();
          }),
        ),
        (this.disableScheduling ||=
          !this.zonelessEnabled && (this.ngZone instanceof ws || !this.zoneIsDefined)));
    }
    notify(t) {
      if (!this.zonelessEnabled && t === 5) return;
      switch (t) {
        case 0: {
          this.appRef.dirtyFlags |= 2;
          break;
        }
        case 3:
        case 2:
        case 4:
        case 5:
        case 1: {
          this.appRef.dirtyFlags |= 4;
          break;
        }
        case 7: {
          this.appRef.deferredDirtyFlags |= 8;
          break;
        }
        case 9:
        case 8:
        case 6:
        case 10:
        default:
          this.appRef.dirtyFlags |= 8;
      }
      if (!this.shouldScheduleTick()) return;
      let i = this.useMicrotaskScheduler ? hc : $u;
      ((this.pendingRenderTaskId = this.taskService.add()),
        this.scheduleInRootZone
          ? (this.cancelScheduledCallback = Zone.root.run(() => i(() => this.tick())))
          : (this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() =>
              i(() => this.tick()),
            )));
    }
    shouldScheduleTick() {
      return !(
        this.disableScheduling ||
        this.pendingRenderTaskId !== null ||
        this.runningTick ||
        this.appRef._runningTick ||
        (!this.zonelessEnabled && this.zoneIsDefined && Zone.current.get(gr + this.angularZoneId))
      );
    }
    tick() {
      if (this.runningTick || this.appRef.destroyed) return;
      !this.zonelessEnabled && this.appRef.dirtyFlags & 7 && (this.appRef.dirtyFlags |= 1);
      let t = this.taskService.add();
      try {
        this.ngZone.run(
          () => {
            ((this.runningTick = !0), this.appRef._tick());
          },
          void 0,
          this.schedulerTickApplyArgs,
        );
      } catch (i) {
        throw (this.taskService.remove(t), i);
      } finally {
        this.cleanup();
      }
      ((this.useMicrotaskScheduler = !0),
        hc(() => {
          ((this.useMicrotaskScheduler = !1), this.taskService.remove(t));
        }));
    }
    ngOnDestroy() {
      (this.subscriptions.unsubscribe(), this.cleanup());
    }
    cleanup() {
      if (
        ((this.runningTick = !1),
        this.cancelScheduledCallback?.(),
        (this.cancelScheduledCallback = null),
        this.pendingRenderTaskId !== null)
      ) {
        let t = this.pendingRenderTaskId;
        ((this.pendingRenderTaskId = null), this.taskService.remove(t));
      }
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵprov = Q({ token: e, factory: e.ɵfac, providedIn: 'root' });
    }
  }
  return e;
})();
function k_() {
  return (typeof $localize < 'u' && $localize.locale) || wr;
}
var zr = new P('', { providedIn: 'root', factory: () => k(zr, U.Optional | U.SkipSelf) || k_() });
var Us = new P('');
function Yi(e) {
  return !e.moduleRef;
}
function V_(e) {
  let n = Yi(e) ? e.r3Injector : e.moduleRef.injector,
    t = n.get(oe);
  return t.run(() => {
    Yi(e) ? e.r3Injector.resolveInjectorInitializers() : e.moduleRef.resolveInjectorInitializers();
    let i = n.get(ct, null),
      r;
    if (
      (t.runOutsideAngular(() => {
        r = t.onError.subscribe({
          next: (o) => {
            i.handleError(o);
          },
        });
      }),
      Yi(e))
    ) {
      let o = () => n.destroy(),
        s = e.platformInjector.get(Us);
      (s.add(o),
        n.onDestroy(() => {
          (r.unsubscribe(), s.delete(o));
        }));
    } else {
      let o = () => e.moduleRef.destroy(),
        s = e.platformInjector.get(Us);
      (s.add(o),
        e.moduleRef.onDestroy(() => {
          (er(e.allPlatformModules, e.moduleRef), r.unsubscribe(), s.delete(o));
        }));
    }
    return T_(i, t, () => {
      let o = n.get(Fd);
      return (
        o.runInitializers(),
        o.donePromise.then(() => {
          let s = n.get(zr, wr);
          if ((d_(s || wr), Yi(e))) {
            let a = n.get(wn);
            return (e.rootComponent !== void 0 && a.bootstrap(e.rootComponent), a);
          } else return (L_(e.moduleRef, e.allPlatformModules), e.moduleRef);
        })
      );
    });
  });
}
function L_(e, n) {
  let t = e.injector.get(wn);
  if (e._bootstrapComponents.length > 0) e._bootstrapComponents.forEach((i) => t.bootstrap(i));
  else if (e.instance.ngDoBootstrap) e.instance.ngDoBootstrap(t);
  else throw new F(-403, !1);
  n.push(e);
}
var tr = null,
  Vd = new P('');
function j_(e = [], n) {
  return mn.create({
    name: n,
    providers: [
      { provide: Mr, useValue: 'platform' },
      { provide: Us, useValue: new Set([() => (tr = null)]) },
      ...e,
    ],
  });
}
function B_(e = []) {
  if (tr) return tr;
  let n = j_(e);
  return (n.get(Vd, !1) || (tr = n), x_(), U_(n), n);
}
function U_(e) {
  e.get(ca, null)?.forEach((t) => t());
}
var Zr = (() => {
  class e {
    static {
      this.__NG_ELEMENT_ID__ = $_;
    }
  }
  return e;
})();
function $_(e) {
  return H_(ve(), G(), (e & 16) === 16);
}
function H_(e, n, t) {
  if (Ar(e) && !t) {
    let i = St(e.index, n);
    return new Gt(i, i);
  } else if (e.type & 175) {
    let i = n[tt];
    return new Gt(i, n);
  }
  return null;
}
var $s = class {
    constructor() {}
    supports(n) {
      return Sd(n);
    }
    create(n) {
      return new Hs(n);
    }
  },
  W_ = (e, n) => n,
  Hs = class {
    constructor(n) {
      ((this.length = 0),
        (this._linkedRecords = null),
        (this._unlinkedRecords = null),
        (this._previousItHead = null),
        (this._itHead = null),
        (this._itTail = null),
        (this._additionsHead = null),
        (this._additionsTail = null),
        (this._movesHead = null),
        (this._movesTail = null),
        (this._removalsHead = null),
        (this._removalsTail = null),
        (this._identityChangesHead = null),
        (this._identityChangesTail = null),
        (this._trackByFn = n || W_));
    }
    forEachItem(n) {
      let t;
      for (t = this._itHead; t !== null; t = t._next) n(t);
    }
    forEachOperation(n) {
      let t = this._itHead,
        i = this._removalsHead,
        r = 0,
        o = null;
      for (; t || i;) {
        let s = !i || (t && t.currentIndex < Pc(i, r, o)) ? t : i,
          a = Pc(s, r, o),
          d = s.currentIndex;
        if (s === i) (r--, (i = i._nextRemoved));
        else if (((t = t._next), s.previousIndex == null)) r++;
        else {
          o || (o = []);
          let p = a - r,
            h = d - r;
          if (p != h) {
            for (let b = 0; b < p; b++) {
              let C = b < o.length ? o[b] : (o[b] = 0),
                w = C + b;
              h <= w && w < p && (o[b] = C + 1);
            }
            let g = s.previousIndex;
            o[g] = h - p;
          }
        }
        a !== d && n(s, a, d);
      }
    }
    forEachPreviousItem(n) {
      let t;
      for (t = this._previousItHead; t !== null; t = t._nextPrevious) n(t);
    }
    forEachAddedItem(n) {
      let t;
      for (t = this._additionsHead; t !== null; t = t._nextAdded) n(t);
    }
    forEachMovedItem(n) {
      let t;
      for (t = this._movesHead; t !== null; t = t._nextMoved) n(t);
    }
    forEachRemovedItem(n) {
      let t;
      for (t = this._removalsHead; t !== null; t = t._nextRemoved) n(t);
    }
    forEachIdentityChange(n) {
      let t;
      for (t = this._identityChangesHead; t !== null; t = t._nextIdentityChange) n(t);
    }
    diff(n) {
      if ((n == null && (n = []), !Sd(n))) throw new F(900, !1);
      return this.check(n) ? this : null;
    }
    onDestroy() {}
    check(n) {
      this._reset();
      let t = this._itHead,
        i = !1,
        r,
        o,
        s;
      if (Array.isArray(n)) {
        this.length = n.length;
        for (let a = 0; a < this.length; a++)
          ((o = n[a]),
            (s = this._trackByFn(a, o)),
            t === null || !Object.is(t.trackById, s)
              ? ((t = this._mismatch(t, o, s, a)), (i = !0))
              : (i && (t = this._verifyReinsertion(t, o, s, a)),
                Object.is(t.item, o) || this._addIdentityChange(t, o)),
            (t = t._next));
      } else
        ((r = 0),
          S0(n, (a) => {
            ((s = this._trackByFn(r, a)),
              t === null || !Object.is(t.trackById, s)
                ? ((t = this._mismatch(t, a, s, r)), (i = !0))
                : (i && (t = this._verifyReinsertion(t, a, s, r)),
                  Object.is(t.item, a) || this._addIdentityChange(t, a)),
              (t = t._next),
              r++);
          }),
          (this.length = r));
      return (this._truncate(t), (this.collection = n), this.isDirty);
    }
    get isDirty() {
      return (
        this._additionsHead !== null ||
        this._movesHead !== null ||
        this._removalsHead !== null ||
        this._identityChangesHead !== null
      );
    }
    _reset() {
      if (this.isDirty) {
        let n;
        for (n = this._previousItHead = this._itHead; n !== null; n = n._next)
          n._nextPrevious = n._next;
        for (n = this._additionsHead; n !== null; n = n._nextAdded)
          n.previousIndex = n.currentIndex;
        for (
          this._additionsHead = this._additionsTail = null, n = this._movesHead;
          n !== null;
          n = n._nextMoved
        )
          n.previousIndex = n.currentIndex;
        ((this._movesHead = this._movesTail = null),
          (this._removalsHead = this._removalsTail = null),
          (this._identityChangesHead = this._identityChangesTail = null));
      }
    }
    _mismatch(n, t, i, r) {
      let o;
      return (
        n === null ? (o = this._itTail) : ((o = n._prev), this._remove(n)),
        (n = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(i, null)),
        n !== null
          ? (Object.is(n.item, t) || this._addIdentityChange(n, t), this._reinsertAfter(n, o, r))
          : ((n = this._linkedRecords === null ? null : this._linkedRecords.get(i, r)),
            n !== null
              ? (Object.is(n.item, t) || this._addIdentityChange(n, t), this._moveAfter(n, o, r))
              : (n = this._addAfter(new Ws(t, i), o, r))),
        n
      );
    }
    _verifyReinsertion(n, t, i, r) {
      let o = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(i, null);
      return (
        o !== null
          ? (n = this._reinsertAfter(o, n._prev, r))
          : n.currentIndex != r && ((n.currentIndex = r), this._addToMoves(n, r)),
        n
      );
    }
    _truncate(n) {
      for (; n !== null;) {
        let t = n._next;
        (this._addToRemovals(this._unlink(n)), (n = t));
      }
      (this._unlinkedRecords !== null && this._unlinkedRecords.clear(),
        this._additionsTail !== null && (this._additionsTail._nextAdded = null),
        this._movesTail !== null && (this._movesTail._nextMoved = null),
        this._itTail !== null && (this._itTail._next = null),
        this._removalsTail !== null && (this._removalsTail._nextRemoved = null),
        this._identityChangesTail !== null &&
          (this._identityChangesTail._nextIdentityChange = null));
    }
    _reinsertAfter(n, t, i) {
      this._unlinkedRecords !== null && this._unlinkedRecords.remove(n);
      let r = n._prevRemoved,
        o = n._nextRemoved;
      return (
        r === null ? (this._removalsHead = o) : (r._nextRemoved = o),
        o === null ? (this._removalsTail = r) : (o._prevRemoved = r),
        this._insertAfter(n, t, i),
        this._addToMoves(n, i),
        n
      );
    }
    _moveAfter(n, t, i) {
      return (this._unlink(n), this._insertAfter(n, t, i), this._addToMoves(n, i), n);
    }
    _addAfter(n, t, i) {
      return (
        this._insertAfter(n, t, i),
        this._additionsTail === null
          ? (this._additionsTail = this._additionsHead = n)
          : (this._additionsTail = this._additionsTail._nextAdded = n),
        n
      );
    }
    _insertAfter(n, t, i) {
      let r = t === null ? this._itHead : t._next;
      return (
        (n._next = r),
        (n._prev = t),
        r === null ? (this._itTail = n) : (r._prev = n),
        t === null ? (this._itHead = n) : (t._next = n),
        this._linkedRecords === null && (this._linkedRecords = new Ir()),
        this._linkedRecords.put(n),
        (n.currentIndex = i),
        n
      );
    }
    _remove(n) {
      return this._addToRemovals(this._unlink(n));
    }
    _unlink(n) {
      this._linkedRecords !== null && this._linkedRecords.remove(n);
      let t = n._prev,
        i = n._next;
      return (
        t === null ? (this._itHead = i) : (t._next = i),
        i === null ? (this._itTail = t) : (i._prev = t),
        n
      );
    }
    _addToMoves(n, t) {
      return (
        n.previousIndex === t ||
          (this._movesTail === null
            ? (this._movesTail = this._movesHead = n)
            : (this._movesTail = this._movesTail._nextMoved = n)),
        n
      );
    }
    _addToRemovals(n) {
      return (
        this._unlinkedRecords === null && (this._unlinkedRecords = new Ir()),
        this._unlinkedRecords.put(n),
        (n.currentIndex = null),
        (n._nextRemoved = null),
        this._removalsTail === null
          ? ((this._removalsTail = this._removalsHead = n), (n._prevRemoved = null))
          : ((n._prevRemoved = this._removalsTail),
            (this._removalsTail = this._removalsTail._nextRemoved = n)),
        n
      );
    }
    _addIdentityChange(n, t) {
      return (
        (n.item = t),
        this._identityChangesTail === null
          ? (this._identityChangesTail = this._identityChangesHead = n)
          : (this._identityChangesTail = this._identityChangesTail._nextIdentityChange = n),
        n
      );
    }
  },
  Ws = class {
    constructor(n, t) {
      ((this.item = n),
        (this.trackById = t),
        (this.currentIndex = null),
        (this.previousIndex = null),
        (this._nextPrevious = null),
        (this._prev = null),
        (this._next = null),
        (this._prevDup = null),
        (this._nextDup = null),
        (this._prevRemoved = null),
        (this._nextRemoved = null),
        (this._nextAdded = null),
        (this._nextMoved = null),
        (this._nextIdentityChange = null));
    }
  },
  Gs = class {
    constructor() {
      ((this._head = null), (this._tail = null));
    }
    add(n) {
      this._head === null
        ? ((this._head = this._tail = n), (n._nextDup = null), (n._prevDup = null))
        : ((this._tail._nextDup = n),
          (n._prevDup = this._tail),
          (n._nextDup = null),
          (this._tail = n));
    }
    get(n, t) {
      let i;
      for (i = this._head; i !== null; i = i._nextDup)
        if ((t === null || t <= i.currentIndex) && Object.is(i.trackById, n)) return i;
      return null;
    }
    remove(n) {
      let t = n._prevDup,
        i = n._nextDup;
      return (
        t === null ? (this._head = i) : (t._nextDup = i),
        i === null ? (this._tail = t) : (i._prevDup = t),
        this._head === null
      );
    }
  },
  Ir = class {
    constructor() {
      this.map = new Map();
    }
    put(n) {
      let t = n.trackById,
        i = this.map.get(t);
      (i || ((i = new Gs()), this.map.set(t, i)), i.add(n));
    }
    get(n, t) {
      let i = n,
        r = this.map.get(i);
      return r ? r.get(n, t) : null;
    }
    remove(n) {
      let t = n.trackById;
      return (this.map.get(t).remove(n) && this.map.delete(t), n);
    }
    get isEmpty() {
      return this.map.size === 0;
    }
    clear() {
      this.map.clear();
    }
  };
function Pc(e, n, t) {
  let i = e.previousIndex;
  if (i === null) return i;
  let r = 0;
  return (t && i < t.length && (r = t[i]), i + n + r);
}
function Fc() {
  return new xa([new $s()]);
}
var xa = (() => {
  class e {
    static {
      this.ɵprov = Q({ token: e, providedIn: 'root', factory: Fc });
    }
    constructor(t) {
      this.factories = t;
    }
    static create(t, i) {
      if (i != null) {
        let r = i.factories.slice();
        t = t.concat(r);
      }
      return new e(t);
    }
    static extend(t) {
      return {
        provide: e,
        useFactory: (i) => e.create(t, i || Fc()),
        deps: [[e, new zp(), new Wc()]],
      };
    }
    find(t) {
      let i = this.factories.find((r) => r.supports(t));
      if (i != null) return i;
      throw new F(901, !1);
    }
  }
  return e;
})();
function Ld(e) {
  let { rootComponent: n, appProviders: t, platformProviders: i, platformRef: r } = e;
  try {
    let o = r?.injector ?? B_(i);
    if (o.get(Vd, !1) === !0 && !e.platformRef) throw new F(401, !1);
    let s = [R_({}), { provide: gn, useExisting: F_ }, ...(t || [])],
      a = new Dr({ providers: s, parent: o, debugName: '', runEnvironmentInitializers: !1 });
    return V_({ r3Injector: a.injector, platformInjector: o, rootComponent: n });
  } catch (o) {
    return Promise.reject(o);
  }
}
function Qr(e) {
  return typeof e == 'boolean' ? e : e != null && e !== 'false';
}
function ri(e, n) {
  ei('NgSignals');
  let t = gl(e);
  return (n?.equal && (t[at].equal = n.equal), t);
}
function _t(e) {
  let n = W(null);
  try {
    return e();
  } finally {
    W(n);
  }
}
var Hd = null;
function xn() {
  return Hd;
}
function Wd(e) {
  Hd ??= e;
}
var ro = class {};
var ot = new P('');
var De = (function (e) {
    return ((e[(e.Format = 0)] = 'Format'), (e[(e.Standalone = 1)] = 'Standalone'), e);
  })(De || {}),
  K = (function (e) {
    return (
      (e[(e.Narrow = 0)] = 'Narrow'),
      (e[(e.Abbreviated = 1)] = 'Abbreviated'),
      (e[(e.Wide = 2)] = 'Wide'),
      (e[(e.Short = 3)] = 'Short'),
      e
    );
  })(K || {}),
  Oe = (function (e) {
    return (
      (e[(e.Short = 0)] = 'Short'),
      (e[(e.Medium = 1)] = 'Medium'),
      (e[(e.Long = 2)] = 'Long'),
      (e[(e.Full = 3)] = 'Full'),
      e
    );
  })(Oe || {}),
  At = {
    Decimal: 0,
    Group: 1,
    List: 2,
    PercentSign: 3,
    PlusSign: 4,
    MinusSign: 5,
    Exponential: 6,
    SuperscriptingExponent: 7,
    PerMille: 8,
    Infinity: 9,
    NaN: 10,
    TimeSeparator: 11,
    CurrencyDecimal: 12,
    CurrencyGroup: 13,
  };
function q_(e) {
  return Be(e)[re.LocaleId];
}
function z_(e, n, t) {
  let i = Be(e),
    r = [i[re.DayPeriodsFormat], i[re.DayPeriodsStandalone]],
    o = Ue(r, n);
  return Ue(o, t);
}
function Z_(e, n, t) {
  let i = Be(e),
    r = [i[re.DaysFormat], i[re.DaysStandalone]],
    o = Ue(r, n);
  return Ue(o, t);
}
function Q_(e, n, t) {
  let i = Be(e),
    r = [i[re.MonthsFormat], i[re.MonthsStandalone]],
    o = Ue(r, n);
  return Ue(o, t);
}
function Y_(e, n) {
  let i = Be(e)[re.Eras];
  return Ue(i, n);
}
function Yr(e, n) {
  let t = Be(e);
  return Ue(t[re.DateFormat], n);
}
function Kr(e, n) {
  let t = Be(e);
  return Ue(t[re.TimeFormat], n);
}
function Jr(e, n) {
  let i = Be(e)[re.DateTimeFormat];
  return Ue(i, n);
}
function so(e, n) {
  let t = Be(e),
    i = t[re.NumberSymbols][n];
  if (typeof i > 'u') {
    if (n === At.CurrencyDecimal) return t[re.NumberSymbols][At.Decimal];
    if (n === At.CurrencyGroup) return t[re.NumberSymbols][At.Group];
  }
  return i;
}
function Gd(e) {
  if (!e[re.ExtraData])
    throw new Error(
      `Missing extra locale data for the locale "${e[re.LocaleId]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`,
    );
}
function K_(e) {
  let n = Be(e);
  return (
    Gd(n),
    (n[re.ExtraData][2] || []).map((i) => (typeof i == 'string' ? Sa(i) : [Sa(i[0]), Sa(i[1])]))
  );
}
function J_(e, n, t) {
  let i = Be(e);
  Gd(i);
  let r = [i[re.ExtraData][0], i[re.ExtraData][1]],
    o = Ue(r, n) || [];
  return Ue(o, t) || [];
}
function Ue(e, n) {
  for (let t = n; t > -1; t--) if (typeof e[t] < 'u') return e[t];
  throw new Error('Locale data API: locale data undefined');
}
function Sa(e) {
  let [n, t] = e.split(':');
  return { hours: +n, minutes: +t };
}
var X_ =
    /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/,
  Xr = {},
  ey =
    /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/,
  vt = (function (e) {
    return (
      (e[(e.Short = 0)] = 'Short'),
      (e[(e.ShortGMT = 1)] = 'ShortGMT'),
      (e[(e.Long = 2)] = 'Long'),
      (e[(e.Extended = 3)] = 'Extended'),
      e
    );
  })(vt || {}),
  z = (function (e) {
    return (
      (e[(e.FullYear = 0)] = 'FullYear'),
      (e[(e.Month = 1)] = 'Month'),
      (e[(e.Date = 2)] = 'Date'),
      (e[(e.Hours = 3)] = 'Hours'),
      (e[(e.Minutes = 4)] = 'Minutes'),
      (e[(e.Seconds = 5)] = 'Seconds'),
      (e[(e.FractionalSeconds = 6)] = 'FractionalSeconds'),
      (e[(e.Day = 7)] = 'Day'),
      e
    );
  })(z || {}),
  q = (function (e) {
    return (
      (e[(e.DayPeriods = 0)] = 'DayPeriods'),
      (e[(e.Days = 1)] = 'Days'),
      (e[(e.Months = 2)] = 'Months'),
      (e[(e.Eras = 3)] = 'Eras'),
      e
    );
  })(q || {});
function ty(e, n, t, i) {
  let r = uy(e);
  n = yt(t, n) || n;
  let s = [],
    a;
  for (; n;)
    if (((a = ey.exec(n)), a)) {
      s = s.concat(a.slice(1));
      let h = s.pop();
      if (!h) break;
      n = h;
    } else {
      s.push(n);
      break;
    }
  let d = r.getTimezoneOffset();
  i && ((d = zd(i, d)), (r = cy(r, i, !0)));
  let p = '';
  return (
    s.forEach((h) => {
      let g = ay(h);
      p += g ? g(r, t, d) : h === "''" ? "'" : h.replace(/(^'|'$)/g, '').replace(/''/g, "'");
    }),
    p
  );
}
function oo(e, n, t) {
  let i = new Date(0);
  return (i.setFullYear(e, n, t), i.setHours(0, 0, 0), i);
}
function yt(e, n) {
  let t = q_(e);
  if (((Xr[t] ??= {}), Xr[t][n])) return Xr[t][n];
  let i = '';
  switch (n) {
    case 'shortDate':
      i = Yr(e, Oe.Short);
      break;
    case 'mediumDate':
      i = Yr(e, Oe.Medium);
      break;
    case 'longDate':
      i = Yr(e, Oe.Long);
      break;
    case 'fullDate':
      i = Yr(e, Oe.Full);
      break;
    case 'shortTime':
      i = Kr(e, Oe.Short);
      break;
    case 'mediumTime':
      i = Kr(e, Oe.Medium);
      break;
    case 'longTime':
      i = Kr(e, Oe.Long);
      break;
    case 'fullTime':
      i = Kr(e, Oe.Full);
      break;
    case 'short':
      let r = yt(e, 'shortTime'),
        o = yt(e, 'shortDate');
      i = eo(Jr(e, Oe.Short), [r, o]);
      break;
    case 'medium':
      let s = yt(e, 'mediumTime'),
        a = yt(e, 'mediumDate');
      i = eo(Jr(e, Oe.Medium), [s, a]);
      break;
    case 'long':
      let d = yt(e, 'longTime'),
        p = yt(e, 'longDate');
      i = eo(Jr(e, Oe.Long), [d, p]);
      break;
    case 'full':
      let h = yt(e, 'fullTime'),
        g = yt(e, 'fullDate');
      i = eo(Jr(e, Oe.Full), [h, g]);
      break;
  }
  return (i && (Xr[t][n] = i), i);
}
function eo(e, n) {
  return (
    n &&
      (e = e.replace(/\{([^}]+)}/g, function (t, i) {
        return n != null && i in n ? n[i] : t;
      })),
    e
  );
}
function Qe(e, n, t = '-', i, r) {
  let o = '';
  (e < 0 || (r && e <= 0)) && (r ? (e = -e + 1) : ((e = -e), (o = t)));
  let s = String(e);
  for (; s.length < n;) s = '0' + s;
  return (i && (s = s.slice(s.length - n)), o + s);
}
function ny(e, n) {
  return Qe(e, 3).substring(0, n);
}
function ae(e, n, t = 0, i = !1, r = !1) {
  return function (o, s) {
    let a = iy(e, o);
    if (((t > 0 || a > -t) && (a += t), e === z.Hours)) a === 0 && t === -12 && (a = 12);
    else if (e === z.FractionalSeconds) return ny(a, n);
    let d = so(s, At.MinusSign);
    return Qe(a, n, d, i, r);
  };
}
function iy(e, n) {
  switch (e) {
    case z.FullYear:
      return n.getFullYear();
    case z.Month:
      return n.getMonth();
    case z.Date:
      return n.getDate();
    case z.Hours:
      return n.getHours();
    case z.Minutes:
      return n.getMinutes();
    case z.Seconds:
      return n.getSeconds();
    case z.FractionalSeconds:
      return n.getMilliseconds();
    case z.Day:
      return n.getDay();
    default:
      throw new Error(`Unknown DateType value "${e}".`);
  }
}
function J(e, n, t = De.Format, i = !1) {
  return function (r, o) {
    return ry(r, o, e, n, t, i);
  };
}
function ry(e, n, t, i, r, o) {
  switch (t) {
    case q.Months:
      return Q_(n, r, i)[e.getMonth()];
    case q.Days:
      return Z_(n, r, i)[e.getDay()];
    case q.DayPeriods:
      let s = e.getHours(),
        a = e.getMinutes();
      if (o) {
        let p = K_(n),
          h = J_(n, r, i),
          g = p.findIndex((b) => {
            if (Array.isArray(b)) {
              let [C, w] = b,
                x = s >= C.hours && a >= C.minutes,
                N = s < w.hours || (s === w.hours && a < w.minutes);
              if (C.hours < w.hours) {
                if (x && N) return !0;
              } else if (x || N) return !0;
            } else if (b.hours === s && b.minutes === a) return !0;
            return !1;
          });
        if (g !== -1) return h[g];
      }
      return z_(n, r, i)[s < 12 ? 0 : 1];
    case q.Eras:
      return Y_(n, i)[e.getFullYear() <= 0 ? 0 : 1];
    default:
      let d = t;
      throw new Error(`unexpected translation type ${d}`);
  }
}
function to(e) {
  return function (n, t, i) {
    let r = -1 * i,
      o = so(t, At.MinusSign),
      s = r > 0 ? Math.floor(r / 60) : Math.ceil(r / 60);
    switch (e) {
      case vt.Short:
        return (r >= 0 ? '+' : '') + Qe(s, 2, o) + Qe(Math.abs(r % 60), 2, o);
      case vt.ShortGMT:
        return 'GMT' + (r >= 0 ? '+' : '') + Qe(s, 1, o);
      case vt.Long:
        return 'GMT' + (r >= 0 ? '+' : '') + Qe(s, 2, o) + ':' + Qe(Math.abs(r % 60), 2, o);
      case vt.Extended:
        return i === 0 ? 'Z' : (r >= 0 ? '+' : '') + Qe(s, 2, o) + ':' + Qe(Math.abs(r % 60), 2, o);
      default:
        throw new Error(`Unknown zone width "${e}"`);
    }
  };
}
var oy = 0,
  io = 4;
function sy(e) {
  let n = oo(e, oy, 1).getDay();
  return oo(e, 0, 1 + (n <= io ? io : io + 7) - n);
}
function qd(e) {
  let n = e.getDay(),
    t = n === 0 ? -3 : io - n;
  return oo(e.getFullYear(), e.getMonth(), e.getDate() + t);
}
function Ma(e, n = !1) {
  return function (t, i) {
    let r;
    if (n) {
      let o = new Date(t.getFullYear(), t.getMonth(), 1).getDay() - 1,
        s = t.getDate();
      r = 1 + Math.floor((s + o) / 7);
    } else {
      let o = qd(t),
        s = sy(o.getFullYear()),
        a = o.getTime() - s.getTime();
      r = 1 + Math.round(a / 6048e5);
    }
    return Qe(r, e, so(i, At.MinusSign));
  };
}
function no(e, n = !1) {
  return function (t, i) {
    let o = qd(t).getFullYear();
    return Qe(o, e, so(i, At.MinusSign), n);
  };
}
var Ta = {};
function ay(e) {
  if (Ta[e]) return Ta[e];
  let n;
  switch (e) {
    case 'G':
    case 'GG':
    case 'GGG':
      n = J(q.Eras, K.Abbreviated);
      break;
    case 'GGGG':
      n = J(q.Eras, K.Wide);
      break;
    case 'GGGGG':
      n = J(q.Eras, K.Narrow);
      break;
    case 'y':
      n = ae(z.FullYear, 1, 0, !1, !0);
      break;
    case 'yy':
      n = ae(z.FullYear, 2, 0, !0, !0);
      break;
    case 'yyy':
      n = ae(z.FullYear, 3, 0, !1, !0);
      break;
    case 'yyyy':
      n = ae(z.FullYear, 4, 0, !1, !0);
      break;
    case 'Y':
      n = no(1);
      break;
    case 'YY':
      n = no(2, !0);
      break;
    case 'YYY':
      n = no(3);
      break;
    case 'YYYY':
      n = no(4);
      break;
    case 'M':
    case 'L':
      n = ae(z.Month, 1, 1);
      break;
    case 'MM':
    case 'LL':
      n = ae(z.Month, 2, 1);
      break;
    case 'MMM':
      n = J(q.Months, K.Abbreviated);
      break;
    case 'MMMM':
      n = J(q.Months, K.Wide);
      break;
    case 'MMMMM':
      n = J(q.Months, K.Narrow);
      break;
    case 'LLL':
      n = J(q.Months, K.Abbreviated, De.Standalone);
      break;
    case 'LLLL':
      n = J(q.Months, K.Wide, De.Standalone);
      break;
    case 'LLLLL':
      n = J(q.Months, K.Narrow, De.Standalone);
      break;
    case 'w':
      n = Ma(1);
      break;
    case 'ww':
      n = Ma(2);
      break;
    case 'W':
      n = Ma(1, !0);
      break;
    case 'd':
      n = ae(z.Date, 1);
      break;
    case 'dd':
      n = ae(z.Date, 2);
      break;
    case 'c':
    case 'cc':
      n = ae(z.Day, 1);
      break;
    case 'ccc':
      n = J(q.Days, K.Abbreviated, De.Standalone);
      break;
    case 'cccc':
      n = J(q.Days, K.Wide, De.Standalone);
      break;
    case 'ccccc':
      n = J(q.Days, K.Narrow, De.Standalone);
      break;
    case 'cccccc':
      n = J(q.Days, K.Short, De.Standalone);
      break;
    case 'E':
    case 'EE':
    case 'EEE':
      n = J(q.Days, K.Abbreviated);
      break;
    case 'EEEE':
      n = J(q.Days, K.Wide);
      break;
    case 'EEEEE':
      n = J(q.Days, K.Narrow);
      break;
    case 'EEEEEE':
      n = J(q.Days, K.Short);
      break;
    case 'a':
    case 'aa':
    case 'aaa':
      n = J(q.DayPeriods, K.Abbreviated);
      break;
    case 'aaaa':
      n = J(q.DayPeriods, K.Wide);
      break;
    case 'aaaaa':
      n = J(q.DayPeriods, K.Narrow);
      break;
    case 'b':
    case 'bb':
    case 'bbb':
      n = J(q.DayPeriods, K.Abbreviated, De.Standalone, !0);
      break;
    case 'bbbb':
      n = J(q.DayPeriods, K.Wide, De.Standalone, !0);
      break;
    case 'bbbbb':
      n = J(q.DayPeriods, K.Narrow, De.Standalone, !0);
      break;
    case 'B':
    case 'BB':
    case 'BBB':
      n = J(q.DayPeriods, K.Abbreviated, De.Format, !0);
      break;
    case 'BBBB':
      n = J(q.DayPeriods, K.Wide, De.Format, !0);
      break;
    case 'BBBBB':
      n = J(q.DayPeriods, K.Narrow, De.Format, !0);
      break;
    case 'h':
      n = ae(z.Hours, 1, -12);
      break;
    case 'hh':
      n = ae(z.Hours, 2, -12);
      break;
    case 'H':
      n = ae(z.Hours, 1);
      break;
    case 'HH':
      n = ae(z.Hours, 2);
      break;
    case 'm':
      n = ae(z.Minutes, 1);
      break;
    case 'mm':
      n = ae(z.Minutes, 2);
      break;
    case 's':
      n = ae(z.Seconds, 1);
      break;
    case 'ss':
      n = ae(z.Seconds, 2);
      break;
    case 'S':
      n = ae(z.FractionalSeconds, 1);
      break;
    case 'SS':
      n = ae(z.FractionalSeconds, 2);
      break;
    case 'SSS':
      n = ae(z.FractionalSeconds, 3);
      break;
    case 'Z':
    case 'ZZ':
    case 'ZZZ':
      n = to(vt.Short);
      break;
    case 'ZZZZZ':
      n = to(vt.Extended);
      break;
    case 'O':
    case 'OO':
    case 'OOO':
    case 'z':
    case 'zz':
    case 'zzz':
      n = to(vt.ShortGMT);
      break;
    case 'OOOO':
    case 'ZZZZ':
    case 'zzzz':
      n = to(vt.Long);
      break;
    default:
      return null;
  }
  return ((Ta[e] = n), n);
}
function zd(e, n) {
  e = e.replace(/:/g, '');
  let t = Date.parse('Jan 01, 1970 00:00:00 ' + e) / 6e4;
  return isNaN(t) ? n : t;
}
function ly(e, n) {
  return ((e = new Date(e.getTime())), e.setMinutes(e.getMinutes() + n), e);
}
function cy(e, n, t) {
  let i = t ? -1 : 1,
    r = e.getTimezoneOffset(),
    o = zd(n, r);
  return ly(e, i * (o - r));
}
function uy(e) {
  if (jd(e)) return e;
  if (typeof e == 'number' && !isNaN(e)) return new Date(e);
  if (typeof e == 'string') {
    if (((e = e.trim()), /^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(e))) {
      let [r, o = 1, s = 1] = e.split('-').map((a) => +a);
      return oo(r, o - 1, s);
    }
    let t = parseFloat(e);
    if (!isNaN(e - t)) return new Date(t);
    let i;
    if ((i = e.match(X_))) return dy(i);
  }
  let n = new Date(e);
  if (!jd(n)) throw new Error(`Unable to convert "${e}" into a date`);
  return n;
}
function dy(e) {
  let n = new Date(0),
    t = 0,
    i = 0,
    r = e[8] ? n.setUTCFullYear : n.setFullYear,
    o = e[8] ? n.setUTCHours : n.setHours;
  (e[9] && ((t = Number(e[9] + e[10])), (i = Number(e[9] + e[11]))),
    r.call(n, Number(e[1]), Number(e[2]) - 1, Number(e[3])));
  let s = Number(e[4] || 0) - t,
    a = Number(e[5] || 0) - i,
    d = Number(e[6] || 0),
    p = Math.floor(parseFloat('0.' + (e[7] || 0)) * 1e3);
  return (o.call(n, s, a, d, p), n);
}
function jd(e) {
  return e instanceof Date && !isNaN(e.valueOf());
}
function ao(e, n) {
  n = encodeURIComponent(n);
  for (let t of e.split(';')) {
    let i = t.indexOf('='),
      [r, o] = i == -1 ? [t, ''] : [t.slice(0, i), t.slice(i + 1)];
    if (r.trim() === n) return decodeURIComponent(o);
  }
  return null;
}
var Aa = class {
    constructor(n, t, i, r) {
      ((this.$implicit = n), (this.ngForOf = t), (this.index = i), (this.count = r));
    }
    get first() {
      return this.index === 0;
    }
    get last() {
      return this.index === this.count - 1;
    }
    get even() {
      return this.index % 2 === 0;
    }
    get odd() {
      return !this.even;
    }
  },
  Zd = (() => {
    class e {
      set ngForOf(t) {
        ((this._ngForOf = t), (this._ngForOfDirty = !0));
      }
      set ngForTrackBy(t) {
        this._trackByFn = t;
      }
      get ngForTrackBy() {
        return this._trackByFn;
      }
      constructor(t, i, r) {
        ((this._viewContainer = t),
          (this._template = i),
          (this._differs = r),
          (this._ngForOf = null),
          (this._ngForOfDirty = !0),
          (this._differ = null));
      }
      set ngForTemplate(t) {
        t && (this._template = t);
      }
      ngDoCheck() {
        if (this._ngForOfDirty) {
          this._ngForOfDirty = !1;
          let t = this._ngForOf;
          if (!this._differ && t)
            if (0)
              try {
              } catch {}
            else this._differ = this._differs.find(t).create(this.ngForTrackBy);
        }
        if (this._differ) {
          let t = this._differ.diff(this._ngForOf);
          t && this._applyChanges(t);
        }
      }
      _applyChanges(t) {
        let i = this._viewContainer;
        t.forEachOperation((r, o, s) => {
          if (r.previousIndex == null)
            i.createEmbeddedView(
              this._template,
              new Aa(r.item, this._ngForOf, -1, -1),
              s === null ? void 0 : s,
            );
          else if (s == null) i.remove(o === null ? void 0 : o);
          else if (o !== null) {
            let a = i.get(o);
            (i.move(a, s), Bd(a, r));
          }
        });
        for (let r = 0, o = i.length; r < o; r++) {
          let a = i.get(r).context;
          ((a.index = r), (a.count = o), (a.ngForOf = this._ngForOf));
        }
        t.forEachIdentityChange((r) => {
          let o = i.get(r.currentIndex);
          Bd(o, r);
        });
      }
      static ngTemplateContextGuard(t, i) {
        return !0;
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(Gr), L(Wr), L(xa));
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [['', 'ngFor', '', 'ngForOf', '']],
          inputs: {
            ngForOf: 'ngForOf',
            ngForTrackBy: 'ngForTrackBy',
            ngForTemplate: 'ngForTemplate',
          },
          standalone: !0,
        });
      }
    }
    return e;
  })();
function Bd(e, n) {
  e.context.$implicit = n.item;
}
var Qd = (() => {
    class e {
      constructor(t, i) {
        ((this._viewContainer = t),
          (this._context = new Na()),
          (this._thenTemplateRef = null),
          (this._elseTemplateRef = null),
          (this._thenViewRef = null),
          (this._elseViewRef = null),
          (this._thenTemplateRef = i));
      }
      set ngIf(t) {
        ((this._context.$implicit = this._context.ngIf = t), this._updateView());
      }
      set ngIfThen(t) {
        (Ud('ngIfThen', t),
          (this._thenTemplateRef = t),
          (this._thenViewRef = null),
          this._updateView());
      }
      set ngIfElse(t) {
        (Ud('ngIfElse', t),
          (this._elseTemplateRef = t),
          (this._elseViewRef = null),
          this._updateView());
      }
      _updateView() {
        this._context.$implicit
          ? this._thenViewRef ||
            (this._viewContainer.clear(),
            (this._elseViewRef = null),
            this._thenTemplateRef &&
              (this._thenViewRef = this._viewContainer.createEmbeddedView(
                this._thenTemplateRef,
                this._context,
              )))
          : this._elseViewRef ||
            (this._viewContainer.clear(),
            (this._thenViewRef = null),
            this._elseTemplateRef &&
              (this._elseViewRef = this._viewContainer.createEmbeddedView(
                this._elseTemplateRef,
                this._context,
              )));
      }
      static ngTemplateContextGuard(t, i) {
        return !0;
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(Gr), L(Wr));
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [['', 'ngIf', '']],
          inputs: { ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse' },
          standalone: !0,
        });
      }
    }
    return e;
  })(),
  Na = class {
    constructor() {
      ((this.$implicit = null), (this.ngIf = null));
    }
  };
function Ud(e, n) {
  if (!!!(!n || n.createEmbeddedView))
    throw new Error(`${e} must be a TemplateRef, but received '${Ne(n)}'.`);
}
function fy(e, n) {
  return new F(2100, !1);
}
var py = 'mediumDate',
  hy = new P(''),
  my = new P(''),
  Yd = (() => {
    class e {
      constructor(t, i, r) {
        ((this.locale = t), (this.defaultTimezone = i), (this.defaultOptions = r));
      }
      transform(t, i, r, o) {
        if (t == null || t === '' || t !== t) return null;
        try {
          let s = i ?? this.defaultOptions?.dateFormat ?? py,
            a = r ?? this.defaultOptions?.timezone ?? this.defaultTimezone ?? void 0;
          return ty(t, s, o || this.locale, a);
        } catch (s) {
          throw fy(e, s.message);
        }
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(zr, 16), L(hy, 24), L(my, 24));
        };
      }
      static {
        this.ɵpipe = Kc({ name: 'date', type: e, pure: !0, standalone: !0 });
      }
    }
    return e;
  })();
var Ra = (() => {
    class e {
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵmod = Zt({ type: e });
      }
      static {
        this.ɵinj = zt({});
      }
    }
    return e;
  })(),
  Kd = 'browser',
  gy = 'server';
function lo(e) {
  return e === gy;
}
var In = class {};
var ai = class {},
  uo = class {},
  Ct = class e {
    constructor(n) {
      ((this.normalizedNames = new Map()),
        (this.lazyUpdate = null),
        n
          ? typeof n == 'string'
            ? (this.lazyInit = () => {
                ((this.headers = new Map()),
                  n
                    .split(
                      `
`,
                    )
                    .forEach((t) => {
                      let i = t.indexOf(':');
                      if (i > 0) {
                        let r = t.slice(0, i),
                          o = r.toLowerCase(),
                          s = t.slice(i + 1).trim();
                        (this.maybeSetNormalizedName(r, o),
                          this.headers.has(o)
                            ? this.headers.get(o).push(s)
                            : this.headers.set(o, [s]));
                      }
                    }));
              })
            : typeof Headers < 'u' && n instanceof Headers
              ? ((this.headers = new Map()),
                n.forEach((t, i) => {
                  this.setHeaderEntries(i, t);
                }))
              : (this.lazyInit = () => {
                  ((this.headers = new Map()),
                    Object.entries(n).forEach(([t, i]) => {
                      this.setHeaderEntries(t, i);
                    }));
                })
          : (this.headers = new Map()));
    }
    has(n) {
      return (this.init(), this.headers.has(n.toLowerCase()));
    }
    get(n) {
      this.init();
      let t = this.headers.get(n.toLowerCase());
      return t && t.length > 0 ? t[0] : null;
    }
    keys() {
      return (this.init(), Array.from(this.normalizedNames.values()));
    }
    getAll(n) {
      return (this.init(), this.headers.get(n.toLowerCase()) || null);
    }
    append(n, t) {
      return this.clone({ name: n, value: t, op: 'a' });
    }
    set(n, t) {
      return this.clone({ name: n, value: t, op: 's' });
    }
    delete(n, t) {
      return this.clone({ name: n, value: t, op: 'd' });
    }
    maybeSetNormalizedName(n, t) {
      this.normalizedNames.has(t) || this.normalizedNames.set(t, n);
    }
    init() {
      this.lazyInit &&
        (this.lazyInit instanceof e ? this.copyFrom(this.lazyInit) : this.lazyInit(),
        (this.lazyInit = null),
        this.lazyUpdate &&
          (this.lazyUpdate.forEach((n) => this.applyUpdate(n)), (this.lazyUpdate = null)));
    }
    copyFrom(n) {
      (n.init(),
        Array.from(n.headers.keys()).forEach((t) => {
          (this.headers.set(t, n.headers.get(t)),
            this.normalizedNames.set(t, n.normalizedNames.get(t)));
        }));
    }
    clone(n) {
      let t = new e();
      return (
        (t.lazyInit = this.lazyInit && this.lazyInit instanceof e ? this.lazyInit : this),
        (t.lazyUpdate = (this.lazyUpdate || []).concat([n])),
        t
      );
    }
    applyUpdate(n) {
      let t = n.name.toLowerCase();
      switch (n.op) {
        case 'a':
        case 's':
          let i = n.value;
          if ((typeof i == 'string' && (i = [i]), i.length === 0)) return;
          this.maybeSetNormalizedName(n.name, t);
          let r = (n.op === 'a' ? this.headers.get(t) : void 0) || [];
          (r.push(...i), this.headers.set(t, r));
          break;
        case 'd':
          let o = n.value;
          if (!o) (this.headers.delete(t), this.normalizedNames.delete(t));
          else {
            let s = this.headers.get(t);
            if (!s) return;
            ((s = s.filter((a) => o.indexOf(a) === -1)),
              s.length === 0
                ? (this.headers.delete(t), this.normalizedNames.delete(t))
                : this.headers.set(t, s));
          }
          break;
      }
    }
    setHeaderEntries(n, t) {
      let i = (Array.isArray(t) ? t : [t]).map((o) => o.toString()),
        r = n.toLowerCase();
      (this.headers.set(r, i), this.maybeSetNormalizedName(n, r));
    }
    forEach(n) {
      (this.init(),
        Array.from(this.normalizedNames.keys()).forEach((t) =>
          n(this.normalizedNames.get(t), this.headers.get(t)),
        ));
    }
  };
var Pa = class {
  encodeKey(n) {
    return Xd(n);
  }
  encodeValue(n) {
    return Xd(n);
  }
  decodeKey(n) {
    return decodeURIComponent(n);
  }
  decodeValue(n) {
    return decodeURIComponent(n);
  }
};
function _y(e, n) {
  let t = new Map();
  return (
    e.length > 0 &&
      e
        .replace(/^\?/, '')
        .split('&')
        .forEach((r) => {
          let o = r.indexOf('='),
            [s, a] =
              o == -1
                ? [n.decodeKey(r), '']
                : [n.decodeKey(r.slice(0, o)), n.decodeValue(r.slice(o + 1))],
            d = t.get(s) || [];
          (d.push(a), t.set(s, d));
        }),
    t
  );
}
var yy = /%(\d[a-f0-9])/gi,
  vy = { 40: '@', '3A': ':', 24: '$', '2C': ',', '3B': ';', '3D': '=', '3F': '?', '2F': '/' };
function Xd(e) {
  return encodeURIComponent(e).replace(yy, (n, t) => vy[t] ?? n);
}
function co(e) {
  return `${e}`;
}
var Rt = class e {
  constructor(n = {}) {
    if (
      ((this.updates = null),
      (this.cloneFrom = null),
      (this.encoder = n.encoder || new Pa()),
      n.fromString)
    ) {
      if (n.fromObject) throw new Error('Cannot specify both fromString and fromObject.');
      this.map = _y(n.fromString, this.encoder);
    } else
      n.fromObject
        ? ((this.map = new Map()),
          Object.keys(n.fromObject).forEach((t) => {
            let i = n.fromObject[t],
              r = Array.isArray(i) ? i.map(co) : [co(i)];
            this.map.set(t, r);
          }))
        : (this.map = null);
  }
  has(n) {
    return (this.init(), this.map.has(n));
  }
  get(n) {
    this.init();
    let t = this.map.get(n);
    return t ? t[0] : null;
  }
  getAll(n) {
    return (this.init(), this.map.get(n) || null);
  }
  keys() {
    return (this.init(), Array.from(this.map.keys()));
  }
  append(n, t) {
    return this.clone({ param: n, value: t, op: 'a' });
  }
  appendAll(n) {
    let t = [];
    return (
      Object.keys(n).forEach((i) => {
        let r = n[i];
        Array.isArray(r)
          ? r.forEach((o) => {
              t.push({ param: i, value: o, op: 'a' });
            })
          : t.push({ param: i, value: r, op: 'a' });
      }),
      this.clone(t)
    );
  }
  set(n, t) {
    return this.clone({ param: n, value: t, op: 's' });
  }
  delete(n, t) {
    return this.clone({ param: n, value: t, op: 'd' });
  }
  toString() {
    return (
      this.init(),
      this.keys()
        .map((n) => {
          let t = this.encoder.encodeKey(n);
          return this.map
            .get(n)
            .map((i) => t + '=' + this.encoder.encodeValue(i))
            .join('&');
        })
        .filter((n) => n !== '')
        .join('&')
    );
  }
  clone(n) {
    let t = new e({ encoder: this.encoder });
    return (
      (t.cloneFrom = this.cloneFrom || this),
      (t.updates = (this.updates || []).concat(n)),
      t
    );
  }
  init() {
    (this.map === null && (this.map = new Map()),
      this.cloneFrom !== null &&
        (this.cloneFrom.init(),
        this.cloneFrom.keys().forEach((n) => this.map.set(n, this.cloneFrom.map.get(n))),
        this.updates.forEach((n) => {
          switch (n.op) {
            case 'a':
            case 's':
              let t = (n.op === 'a' ? this.map.get(n.param) : void 0) || [];
              (t.push(co(n.value)), this.map.set(n.param, t));
              break;
            case 'd':
              if (n.value !== void 0) {
                let i = this.map.get(n.param) || [],
                  r = i.indexOf(co(n.value));
                (r !== -1 && i.splice(r, 1),
                  i.length > 0 ? this.map.set(n.param, i) : this.map.delete(n.param));
              } else {
                this.map.delete(n.param);
                break;
              }
          }
        }),
        (this.cloneFrom = this.updates = null)));
  }
};
var Fa = class {
  constructor() {
    this.map = new Map();
  }
  set(n, t) {
    return (this.map.set(n, t), this);
  }
  get(n) {
    return (this.map.has(n) || this.map.set(n, n.defaultValue()), this.map.get(n));
  }
  delete(n) {
    return (this.map.delete(n), this);
  }
  has(n) {
    return this.map.has(n);
  }
  keys() {
    return this.map.keys();
  }
};
function Cy(e) {
  switch (e) {
    case 'DELETE':
    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
    case 'JSONP':
      return !1;
    default:
      return !0;
  }
}
function ef(e) {
  return typeof ArrayBuffer < 'u' && e instanceof ArrayBuffer;
}
function tf(e) {
  return typeof Blob < 'u' && e instanceof Blob;
}
function nf(e) {
  return typeof FormData < 'u' && e instanceof FormData;
}
function Ey(e) {
  return typeof URLSearchParams < 'u' && e instanceof URLSearchParams;
}
var si = class e {
    constructor(n, t, i, r) {
      ((this.url = t),
        (this.body = null),
        (this.reportProgress = !1),
        (this.withCredentials = !1),
        (this.responseType = 'json'),
        (this.method = n.toUpperCase()));
      let o;
      if (
        (Cy(this.method) || r ? ((this.body = i !== void 0 ? i : null), (o = r)) : (o = i),
        o &&
          ((this.reportProgress = !!o.reportProgress),
          (this.withCredentials = !!o.withCredentials),
          o.responseType && (this.responseType = o.responseType),
          o.headers && (this.headers = o.headers),
          o.context && (this.context = o.context),
          o.params && (this.params = o.params),
          (this.transferCache = o.transferCache)),
        (this.headers ??= new Ct()),
        (this.context ??= new Fa()),
        !this.params)
      )
        ((this.params = new Rt()), (this.urlWithParams = t));
      else {
        let s = this.params.toString();
        if (s.length === 0) this.urlWithParams = t;
        else {
          let a = t.indexOf('?'),
            d = a === -1 ? '?' : a < t.length - 1 ? '&' : '';
          this.urlWithParams = t + d + s;
        }
      }
    }
    serializeBody() {
      return this.body === null
        ? null
        : typeof this.body == 'string' ||
            ef(this.body) ||
            tf(this.body) ||
            nf(this.body) ||
            Ey(this.body)
          ? this.body
          : this.body instanceof Rt
            ? this.body.toString()
            : typeof this.body == 'object' ||
                typeof this.body == 'boolean' ||
                Array.isArray(this.body)
              ? JSON.stringify(this.body)
              : this.body.toString();
    }
    detectContentTypeHeader() {
      return this.body === null || nf(this.body)
        ? null
        : tf(this.body)
          ? this.body.type || null
          : ef(this.body)
            ? null
            : typeof this.body == 'string'
              ? 'text/plain'
              : this.body instanceof Rt
                ? 'application/x-www-form-urlencoded;charset=UTF-8'
                : typeof this.body == 'object' ||
                    typeof this.body == 'number' ||
                    typeof this.body == 'boolean'
                  ? 'application/json'
                  : null;
    }
    clone(n = {}) {
      let t = n.method || this.method,
        i = n.url || this.url,
        r = n.responseType || this.responseType,
        o = n.transferCache ?? this.transferCache,
        s = n.body !== void 0 ? n.body : this.body,
        a = n.withCredentials ?? this.withCredentials,
        d = n.reportProgress ?? this.reportProgress,
        p = n.headers || this.headers,
        h = n.params || this.params,
        g = n.context ?? this.context;
      return (
        n.setHeaders !== void 0 &&
          (p = Object.keys(n.setHeaders).reduce((b, C) => b.set(C, n.setHeaders[C]), p)),
        n.setParams && (h = Object.keys(n.setParams).reduce((b, C) => b.set(C, n.setParams[C]), h)),
        new e(t, i, s, {
          params: h,
          headers: p,
          context: g,
          reportProgress: d,
          responseType: r,
          withCredentials: a,
          transferCache: o,
        })
      );
    }
  },
  Ot = (function (e) {
    return (
      (e[(e.Sent = 0)] = 'Sent'),
      (e[(e.UploadProgress = 1)] = 'UploadProgress'),
      (e[(e.ResponseHeader = 2)] = 'ResponseHeader'),
      (e[(e.DownloadProgress = 3)] = 'DownloadProgress'),
      (e[(e.Response = 4)] = 'Response'),
      (e[(e.User = 5)] = 'User'),
      e
    );
  })(Ot || {}),
  li = class {
    constructor(n, t = 200, i = 'OK') {
      ((this.headers = n.headers || new Ct()),
        (this.status = n.status !== void 0 ? n.status : t),
        (this.statusText = n.statusText || i),
        (this.url = n.url || null),
        (this.ok = this.status >= 200 && this.status < 300));
    }
  },
  fo = class e extends li {
    constructor(n = {}) {
      (super(n), (this.type = Ot.ResponseHeader));
    }
    clone(n = {}) {
      return new e({
        headers: n.headers || this.headers,
        status: n.status !== void 0 ? n.status : this.status,
        statusText: n.statusText || this.statusText,
        url: n.url || this.url || void 0,
      });
    }
  },
  ci = class e extends li {
    constructor(n = {}) {
      (super(n), (this.type = Ot.Response), (this.body = n.body !== void 0 ? n.body : null));
    }
    clone(n = {}) {
      return new e({
        body: n.body !== void 0 ? n.body : this.body,
        headers: n.headers || this.headers,
        status: n.status !== void 0 ? n.status : this.status,
        statusText: n.statusText || this.statusText,
        url: n.url || this.url || void 0,
      });
    }
  },
  Nt = class extends li {
    constructor(n) {
      (super(n, 0, 'Unknown Error'),
        (this.name = 'HttpErrorResponse'),
        (this.ok = !1),
        this.status >= 200 && this.status < 300
          ? (this.message = `Http failure during parsing for ${n.url || '(unknown url)'}`)
          : (this.message = `Http failure response for ${n.url || '(unknown url)'}: ${n.status} ${n.statusText}`),
        (this.error = n.error || null));
    }
  },
  af = 200,
  Dy = 204;
function Oa(e, n) {
  return {
    body: n,
    headers: e.headers,
    context: e.context,
    observe: e.observe,
    params: e.params,
    reportProgress: e.reportProgress,
    responseType: e.responseType,
    withCredentials: e.withCredentials,
    transferCache: e.transferCache,
  };
}
var La = (() => {
    class e {
      constructor(t) {
        this.handler = t;
      }
      request(t, i, r = {}) {
        let o;
        if (t instanceof si) o = t;
        else {
          let d;
          r.headers instanceof Ct ? (d = r.headers) : (d = new Ct(r.headers));
          let p;
          (r.params &&
            (r.params instanceof Rt ? (p = r.params) : (p = new Rt({ fromObject: r.params }))),
            (o = new si(t, i, r.body !== void 0 ? r.body : null, {
              headers: d,
              context: r.context,
              params: p,
              reportProgress: r.reportProgress,
              responseType: r.responseType || 'json',
              withCredentials: r.withCredentials,
              transferCache: r.transferCache,
            })));
        }
        let s = Gi(o).pipe(Ho((d) => this.handler.handle(d)));
        if (t instanceof si || r.observe === 'events') return s;
        let a = s.pipe($o((d) => d instanceof ci));
        switch (r.observe || 'body') {
          case 'body':
            switch (o.responseType) {
              case 'arraybuffer':
                return a.pipe(
                  Se((d) => {
                    if (d.body !== null && !(d.body instanceof ArrayBuffer))
                      throw new Error('Response is not an ArrayBuffer.');
                    return d.body;
                  }),
                );
              case 'blob':
                return a.pipe(
                  Se((d) => {
                    if (d.body !== null && !(d.body instanceof Blob))
                      throw new Error('Response is not a Blob.');
                    return d.body;
                  }),
                );
              case 'text':
                return a.pipe(
                  Se((d) => {
                    if (d.body !== null && typeof d.body != 'string')
                      throw new Error('Response is not a string.');
                    return d.body;
                  }),
                );
              case 'json':
              default:
                return a.pipe(Se((d) => d.body));
            }
          case 'response':
            return a;
          default:
            throw new Error(`Unreachable: unhandled observe type ${r.observe}}`);
        }
      }
      delete(t, i = {}) {
        return this.request('DELETE', t, i);
      }
      get(t, i = {}) {
        return this.request('GET', t, i);
      }
      head(t, i = {}) {
        return this.request('HEAD', t, i);
      }
      jsonp(t, i) {
        return this.request('JSONP', t, {
          params: new Rt().append(i, 'JSONP_CALLBACK'),
          observe: 'body',
          responseType: 'json',
        });
      }
      options(t, i = {}) {
        return this.request('OPTIONS', t, i);
      }
      patch(t, i, r = {}) {
        return this.request('PATCH', t, Oa(r, i));
      }
      post(t, i, r = {}) {
        return this.request('POST', t, Oa(r, i));
      }
      put(t, i, r = {}) {
        return this.request('PUT', t, Oa(r, i));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)($(ai));
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  by = /^\)\]\}',?\n/,
  wy = 'X-Request-URL';
function rf(e) {
  if (e.url) return e.url;
  let n = wy.toLocaleLowerCase();
  return e.headers.get(n);
}
var Iy = (() => {
    class e {
      constructor() {
        ((this.fetchImpl = k(ka, { optional: !0 })?.fetch ?? ((...t) => globalThis.fetch(...t))),
          (this.ngZone = k(oe)));
      }
      handle(t) {
        return new ne((i) => {
          let r = new AbortController();
          return (
            this.doRequest(t, r.signal, i).then(Va, (o) => i.error(new Nt({ error: o }))),
            () => r.abort()
          );
        });
      }
      doRequest(t, i, r) {
        return Ae(this, null, function* () {
          let o = this.createRequestInit(t),
            s;
          try {
            let C = this.ngZone.runOutsideAngular(() =>
              this.fetchImpl(t.urlWithParams, Z({ signal: i }, o)),
            );
            (xy(C), r.next({ type: Ot.Sent }), (s = yield C));
          } catch (C) {
            r.error(
              new Nt({
                error: C,
                status: C.status ?? 0,
                statusText: C.statusText,
                url: t.urlWithParams,
                headers: C.headers,
              }),
            );
            return;
          }
          let a = new Ct(s.headers),
            d = s.statusText,
            p = rf(s) ?? t.urlWithParams,
            h = s.status,
            g = null;
          if (
            (t.reportProgress && r.next(new fo({ headers: a, status: h, statusText: d, url: p })),
            s.body)
          ) {
            let C = s.headers.get('content-length'),
              w = [],
              x = s.body.getReader(),
              N = 0,
              H,
              le,
              Y = typeof Zone < 'u' && Zone.current;
            yield this.ngZone.runOutsideAngular(() =>
              Ae(this, null, function* () {
                for (;;) {
                  let { done: be, value: ce } = yield x.read();
                  if (be) break;
                  if ((w.push(ce), (N += ce.length), t.reportProgress)) {
                    le =
                      t.responseType === 'text'
                        ? (le ?? '') + (H ??= new TextDecoder()).decode(ce, { stream: !0 })
                        : void 0;
                    let st = () =>
                      r.next({
                        type: Ot.DownloadProgress,
                        total: C ? +C : void 0,
                        loaded: N,
                        partialText: le,
                      });
                    Y ? Y.run(st) : st();
                  }
                }
              }),
            );
            let fe = this.concatChunks(w, N);
            try {
              let be = s.headers.get('Content-Type') ?? '';
              g = this.parseBody(t, fe, be);
            } catch (be) {
              r.error(
                new Nt({
                  error: be,
                  headers: new Ct(s.headers),
                  status: s.status,
                  statusText: s.statusText,
                  url: rf(s) ?? t.urlWithParams,
                }),
              );
              return;
            }
          }
          (h === 0 && (h = g ? af : 0),
            h >= 200 && h < 300
              ? (r.next(new ci({ body: g, headers: a, status: h, statusText: d, url: p })),
                r.complete())
              : r.error(new Nt({ error: g, headers: a, status: h, statusText: d, url: p })));
        });
      }
      parseBody(t, i, r) {
        switch (t.responseType) {
          case 'json':
            let o = new TextDecoder().decode(i).replace(by, '');
            return o === '' ? null : JSON.parse(o);
          case 'text':
            return new TextDecoder().decode(i);
          case 'blob':
            return new Blob([i], { type: r });
          case 'arraybuffer':
            return i.buffer;
        }
      }
      createRequestInit(t) {
        let i = {},
          r = t.withCredentials ? 'include' : void 0;
        if (
          (t.headers.forEach((o, s) => (i[o] = s.join(','))),
          t.headers.has('Accept') || (i.Accept = 'application/json, text/plain, */*'),
          !t.headers.has('Content-Type'))
        ) {
          let o = t.detectContentTypeHeader();
          o !== null && (i['Content-Type'] = o);
        }
        return { body: t.serializeBody(), method: t.method, headers: i, credentials: r };
      }
      concatChunks(t, i) {
        let r = new Uint8Array(i),
          o = 0;
        for (let s of t) (r.set(s, o), (o += s.length));
        return r;
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  ka = class {};
function Va() {}
function xy(e) {
  e.then(Va, Va);
}
function Sy(e, n) {
  return n(e);
}
function My(e, n, t) {
  return (i, r) => su(t, () => n(i, (o) => e(o, r)));
}
var lf = new P(''),
  Ty = new P(''),
  Ay = new P('', { providedIn: 'root', factory: () => !0 });
var of = (() => {
  class e extends ai {
    constructor(t, i) {
      (super(),
        (this.backend = t),
        (this.injector = i),
        (this.chain = null),
        (this.pendingTasks = k(En)),
        (this.contributeToStability = k(Ay)));
    }
    handle(t) {
      if (this.chain === null) {
        let i = Array.from(new Set([...this.injector.get(lf), ...this.injector.get(Ty, [])]));
        this.chain = i.reduceRight((r, o) => My(r, o, this.injector), Sy);
      }
      if (this.contributeToStability) {
        let i = this.pendingTasks.add();
        return this.chain(t, (r) => this.backend.handle(r)).pipe(
          Wo(() => this.pendingTasks.remove(i)),
        );
      } else return this.chain(t, (i) => this.backend.handle(i));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)($(uo), $(et));
      };
    }
    static {
      this.ɵprov = Q({ token: e, factory: e.ɵfac });
    }
  }
  return e;
})();
var Ny = /^\)\]\}',?\n/;
function Ry(e) {
  return 'responseURL' in e && e.responseURL
    ? e.responseURL
    : /^X-Request-URL:/m.test(e.getAllResponseHeaders())
      ? e.getResponseHeader('X-Request-URL')
      : null;
}
var sf = (() => {
    class e {
      constructor(t) {
        this.xhrFactory = t;
      }
      handle(t) {
        if (t.method === 'JSONP') throw new F(-2800, !1);
        let i = this.xhrFactory;
        return (i.ɵloadImpl ? Vt(i.ɵloadImpl()) : Gi(null)).pipe(
          Go(
            () =>
              new ne((o) => {
                let s = i.build();
                if (
                  (s.open(t.method, t.urlWithParams),
                  t.withCredentials && (s.withCredentials = !0),
                  t.headers.forEach((x, N) => s.setRequestHeader(x, N.join(','))),
                  t.headers.has('Accept') ||
                    s.setRequestHeader('Accept', 'application/json, text/plain, */*'),
                  !t.headers.has('Content-Type'))
                ) {
                  let x = t.detectContentTypeHeader();
                  x !== null && s.setRequestHeader('Content-Type', x);
                }
                if (t.responseType) {
                  let x = t.responseType.toLowerCase();
                  s.responseType = x !== 'json' ? x : 'text';
                }
                let a = t.serializeBody(),
                  d = null,
                  p = () => {
                    if (d !== null) return d;
                    let x = s.statusText || 'OK',
                      N = new Ct(s.getAllResponseHeaders()),
                      H = Ry(s) || t.url;
                    return (
                      (d = new fo({ headers: N, status: s.status, statusText: x, url: H })),
                      d
                    );
                  },
                  h = () => {
                    let { headers: x, status: N, statusText: H, url: le } = p(),
                      Y = null;
                    (N !== Dy && (Y = typeof s.response > 'u' ? s.responseText : s.response),
                      N === 0 && (N = Y ? af : 0));
                    let fe = N >= 200 && N < 300;
                    if (t.responseType === 'json' && typeof Y == 'string') {
                      let be = Y;
                      Y = Y.replace(Ny, '');
                      try {
                        Y = Y !== '' ? JSON.parse(Y) : null;
                      } catch (ce) {
                        ((Y = be), fe && ((fe = !1), (Y = { error: ce, text: Y })));
                      }
                    }
                    fe
                      ? (o.next(
                          new ci({
                            body: Y,
                            headers: x,
                            status: N,
                            statusText: H,
                            url: le || void 0,
                          }),
                        ),
                        o.complete())
                      : o.error(
                          new Nt({
                            error: Y,
                            headers: x,
                            status: N,
                            statusText: H,
                            url: le || void 0,
                          }),
                        );
                  },
                  g = (x) => {
                    let { url: N } = p(),
                      H = new Nt({
                        error: x,
                        status: s.status || 0,
                        statusText: s.statusText || 'Unknown Error',
                        url: N || void 0,
                      });
                    o.error(H);
                  },
                  b = !1,
                  C = (x) => {
                    b || (o.next(p()), (b = !0));
                    let N = { type: Ot.DownloadProgress, loaded: x.loaded };
                    (x.lengthComputable && (N.total = x.total),
                      t.responseType === 'text' &&
                        s.responseText &&
                        (N.partialText = s.responseText),
                      o.next(N));
                  },
                  w = (x) => {
                    let N = { type: Ot.UploadProgress, loaded: x.loaded };
                    (x.lengthComputable && (N.total = x.total), o.next(N));
                  };
                return (
                  s.addEventListener('load', h),
                  s.addEventListener('error', g),
                  s.addEventListener('timeout', g),
                  s.addEventListener('abort', g),
                  t.reportProgress &&
                    (s.addEventListener('progress', C),
                    a !== null && s.upload && s.upload.addEventListener('progress', w)),
                  s.send(a),
                  o.next({ type: Ot.Sent }),
                  () => {
                    (s.removeEventListener('error', g),
                      s.removeEventListener('abort', g),
                      s.removeEventListener('load', h),
                      s.removeEventListener('timeout', g),
                      t.reportProgress &&
                        (s.removeEventListener('progress', C),
                        a !== null && s.upload && s.upload.removeEventListener('progress', w)),
                      s.readyState !== s.DONE && s.abort());
                  }
                );
              }),
          ),
        );
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)($(In));
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  cf = new P(''),
  Oy = 'XSRF-TOKEN',
  Py = new P('', { providedIn: 'root', factory: () => Oy }),
  Fy = 'X-XSRF-TOKEN',
  ky = new P('', { providedIn: 'root', factory: () => Fy }),
  po = class {},
  Vy = (() => {
    class e {
      constructor(t, i, r) {
        ((this.doc = t),
          (this.platform = i),
          (this.cookieName = r),
          (this.lastCookieString = ''),
          (this.lastToken = null),
          (this.parseCount = 0));
      }
      getToken() {
        if (this.platform === 'server') return null;
        let t = this.doc.cookie || '';
        return (
          t !== this.lastCookieString &&
            (this.parseCount++,
            (this.lastToken = ao(t, this.cookieName)),
            (this.lastCookieString = t)),
          this.lastToken
        );
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)($(ot), $(Tt), $(Py));
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })();
function Ly(e, n) {
  let t = e.url.toLowerCase();
  if (
    !k(cf) ||
    e.method === 'GET' ||
    e.method === 'HEAD' ||
    t.startsWith('http://') ||
    t.startsWith('https://')
  )
    return n(e);
  let i = k(po).getToken(),
    r = k(ky);
  return (i != null && !e.headers.has(r) && (e = e.clone({ headers: e.headers.set(r, i) })), n(e));
}
function uf(...e) {
  let n = [
    La,
    sf,
    of,
    { provide: ai, useExisting: of },
    { provide: uo, useFactory: () => k(Iy, { optional: !0 }) ?? k(sf) },
    { provide: lf, useValue: Ly, multi: !0 },
    { provide: cf, useValue: !0 },
    { provide: po, useClass: Vy },
  ];
  for (let t of e) n.push(...t.ɵproviders);
  return Ys(n);
}
var Ua = class extends ro {
    constructor() {
      (super(...arguments), (this.supportsDOMEvents = !0));
    }
  },
  $a = class e extends Ua {
    static makeCurrent() {
      Wd(new e());
    }
    onAndCancel(n, t, i) {
      return (
        n.addEventListener(t, i),
        () => {
          n.removeEventListener(t, i);
        }
      );
    }
    dispatchEvent(n, t) {
      n.dispatchEvent(t);
    }
    remove(n) {
      n.remove();
    }
    createElement(n, t) {
      return ((t = t || this.getDefaultDocument()), t.createElement(n));
    }
    createHtmlDocument() {
      return document.implementation.createHTMLDocument('fakeTitle');
    }
    getDefaultDocument() {
      return document;
    }
    isElementNode(n) {
      return n.nodeType === Node.ELEMENT_NODE;
    }
    isShadowRoot(n) {
      return n instanceof DocumentFragment;
    }
    getGlobalEventTarget(n, t) {
      return t === 'window' ? window : t === 'document' ? n : t === 'body' ? n.body : null;
    }
    getBaseHref(n) {
      let t = Uy();
      return t == null ? null : $y(t);
    }
    resetBaseElement() {
      ui = null;
    }
    getUserAgent() {
      return window.navigator.userAgent;
    }
    getCookie(n) {
      return ao(document.cookie, n);
    }
  },
  ui = null;
function Uy() {
  return ((ui = ui || document.querySelector('base')), ui ? ui.getAttribute('href') : null);
}
function $y(e) {
  return new URL(e, document.baseURI).pathname;
}
var Hy = (() => {
    class e {
      build() {
        return new XMLHttpRequest();
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  Ha = new P(''),
  hf = (() => {
    class e {
      constructor(t, i) {
        ((this._zone = i),
          (this._eventNameToPlugin = new Map()),
          t.forEach((r) => {
            r.manager = this;
          }),
          (this._plugins = t.slice().reverse()));
      }
      addEventListener(t, i, r) {
        return this._findPluginFor(i).addEventListener(t, i, r);
      }
      getZone() {
        return this._zone;
      }
      _findPluginFor(t) {
        let i = this._eventNameToPlugin.get(t);
        if (i) return i;
        if (((i = this._plugins.find((o) => o.supports(t))), !i)) throw new F(5101, !1);
        return (this._eventNameToPlugin.set(t, i), i);
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)($(Ha), $(oe));
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  ho = class {
    constructor(n) {
      this._doc = n;
    }
  },
  ja = 'ng-app-id',
  mf = (() => {
    class e {
      constructor(t, i, r, o = {}) {
        ((this.doc = t),
          (this.appId = i),
          (this.nonce = r),
          (this.platformId = o),
          (this.styleRef = new Map()),
          (this.hostNodes = new Set()),
          (this.styleNodesInDOM = this.collectServerRenderedStyles()),
          (this.platformIsServer = lo(o)),
          this.resetHostNodes());
      }
      addStyles(t) {
        for (let i of t) this.changeUsageCount(i, 1) === 1 && this.onStyleAdded(i);
      }
      removeStyles(t) {
        for (let i of t) this.changeUsageCount(i, -1) <= 0 && this.onStyleRemoved(i);
      }
      ngOnDestroy() {
        let t = this.styleNodesInDOM;
        t && (t.forEach((i) => i.remove()), t.clear());
        for (let i of this.getAllStyles()) this.onStyleRemoved(i);
        this.resetHostNodes();
      }
      addHost(t) {
        this.hostNodes.add(t);
        for (let i of this.getAllStyles()) this.addStyleToHost(t, i);
      }
      removeHost(t) {
        this.hostNodes.delete(t);
      }
      getAllStyles() {
        return this.styleRef.keys();
      }
      onStyleAdded(t) {
        for (let i of this.hostNodes) this.addStyleToHost(i, t);
      }
      onStyleRemoved(t) {
        let i = this.styleRef;
        (i.get(t)?.elements?.forEach((r) => r.remove()), i.delete(t));
      }
      collectServerRenderedStyles() {
        let t = this.doc.head?.querySelectorAll(`style[${ja}="${this.appId}"]`);
        if (t?.length) {
          let i = new Map();
          return (
            t.forEach((r) => {
              r.textContent != null && i.set(r.textContent, r);
            }),
            i
          );
        }
        return null;
      }
      changeUsageCount(t, i) {
        let r = this.styleRef;
        if (r.has(t)) {
          let o = r.get(t);
          return ((o.usage += i), o.usage);
        }
        return (r.set(t, { usage: i, elements: [] }), i);
      }
      getStyleElement(t, i) {
        let r = this.styleNodesInDOM,
          o = r?.get(i);
        if (o?.parentNode === t) return (r.delete(i), o.removeAttribute(ja), o);
        {
          let s = this.doc.createElement('style');
          return (
            this.nonce && s.setAttribute('nonce', this.nonce),
            (s.textContent = i),
            this.platformIsServer && s.setAttribute(ja, this.appId),
            t.appendChild(s),
            s
          );
        }
      }
      addStyleToHost(t, i) {
        let r = this.getStyleElement(t, i),
          o = this.styleRef,
          s = o.get(i)?.elements;
        s ? s.push(r) : o.set(i, { elements: [r], usage: 1 });
      }
      resetHostNodes() {
        let t = this.hostNodes;
        (t.clear(), t.add(this.doc.head));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)($(ot), $(la), $(ua, 8), $(Tt));
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  Ba = {
    svg: 'http://www.w3.org/2000/svg',
    xhtml: 'http://www.w3.org/1999/xhtml',
    xlink: 'http://www.w3.org/1999/xlink',
    xml: 'http://www.w3.org/XML/1998/namespace',
    xmlns: 'http://www.w3.org/2000/xmlns/',
    math: 'http://www.w3.org/1998/Math/MathML',
  },
  Ga = /%COMP%/g,
  gf = '%COMP%',
  Wy = `_nghost-${gf}`,
  Gy = `_ngcontent-${gf}`,
  qy = !0,
  zy = new P('', { providedIn: 'root', factory: () => qy });
function Zy(e) {
  return Gy.replace(Ga, e);
}
function Qy(e) {
  return Wy.replace(Ga, e);
}
function _f(e, n) {
  return n.map((t) => t.replace(Ga, e));
}
var df = (() => {
    class e {
      constructor(t, i, r, o, s, a, d, p = null) {
        ((this.eventManager = t),
          (this.sharedStylesHost = i),
          (this.appId = r),
          (this.removeStylesOnCompDestroy = o),
          (this.doc = s),
          (this.platformId = a),
          (this.ngZone = d),
          (this.nonce = p),
          (this.rendererByCompId = new Map()),
          (this.platformIsServer = lo(a)),
          (this.defaultRenderer = new di(t, s, d, this.platformIsServer)));
      }
      createRenderer(t, i) {
        if (!t || !i) return this.defaultRenderer;
        this.platformIsServer &&
          i.encapsulation === Xe.ShadowDom &&
          (i = ee(Z({}, i), { encapsulation: Xe.Emulated }));
        let r = this.getOrCreateRenderer(t, i);
        return (r instanceof mo ? r.applyToHost(t) : r instanceof fi && r.applyStyles(), r);
      }
      getOrCreateRenderer(t, i) {
        let r = this.rendererByCompId,
          o = r.get(i.id);
        if (!o) {
          let s = this.doc,
            a = this.ngZone,
            d = this.eventManager,
            p = this.sharedStylesHost,
            h = this.removeStylesOnCompDestroy,
            g = this.platformIsServer;
          switch (i.encapsulation) {
            case Xe.Emulated:
              o = new mo(d, p, i, this.appId, h, s, a, g);
              break;
            case Xe.ShadowDom:
              return new Wa(d, p, t, i, s, a, this.nonce, g);
            default:
              o = new fi(d, p, i, h, s, a, g);
              break;
          }
          r.set(i.id, o);
        }
        return o;
      }
      ngOnDestroy() {
        this.rendererByCompId.clear();
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)($(hf), $(mf), $(la), $(zy), $(ot), $(Tt), $(oe), $(ua));
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  di = class {
    constructor(n, t, i, r) {
      ((this.eventManager = n),
        (this.doc = t),
        (this.ngZone = i),
        (this.platformIsServer = r),
        (this.data = Object.create(null)),
        (this.throwOnSyntheticProps = !0),
        (this.destroyNode = null));
    }
    destroy() {}
    createElement(n, t) {
      return t ? this.doc.createElementNS(Ba[t] || t, n) : this.doc.createElement(n);
    }
    createComment(n) {
      return this.doc.createComment(n);
    }
    createText(n) {
      return this.doc.createTextNode(n);
    }
    appendChild(n, t) {
      (ff(n) ? n.content : n).appendChild(t);
    }
    insertBefore(n, t, i) {
      n && (ff(n) ? n.content : n).insertBefore(t, i);
    }
    removeChild(n, t) {
      t.remove();
    }
    selectRootElement(n, t) {
      let i = typeof n == 'string' ? this.doc.querySelector(n) : n;
      if (!i) throw new F(-5104, !1);
      return (t || (i.textContent = ''), i);
    }
    parentNode(n) {
      return n.parentNode;
    }
    nextSibling(n) {
      return n.nextSibling;
    }
    setAttribute(n, t, i, r) {
      if (r) {
        t = r + ':' + t;
        let o = Ba[r];
        o ? n.setAttributeNS(o, t, i) : n.setAttribute(t, i);
      } else n.setAttribute(t, i);
    }
    removeAttribute(n, t, i) {
      if (i) {
        let r = Ba[i];
        r ? n.removeAttributeNS(r, t) : n.removeAttribute(`${i}:${t}`);
      } else n.removeAttribute(t);
    }
    addClass(n, t) {
      n.classList.add(t);
    }
    removeClass(n, t) {
      n.classList.remove(t);
    }
    setStyle(n, t, i, r) {
      r & (ut.DashCase | ut.Important)
        ? n.style.setProperty(t, i, r & ut.Important ? 'important' : '')
        : (n.style[t] = i);
    }
    removeStyle(n, t, i) {
      i & ut.DashCase ? n.style.removeProperty(t) : (n.style[t] = '');
    }
    setProperty(n, t, i) {
      n != null && (n[t] = i);
    }
    setValue(n, t) {
      n.nodeValue = t;
    }
    listen(n, t, i) {
      if (typeof n == 'string' && ((n = xn().getGlobalEventTarget(this.doc, n)), !n))
        throw new Error(`Unsupported event target ${n} for event ${t}`);
      return this.eventManager.addEventListener(n, t, this.decoratePreventDefault(i));
    }
    decoratePreventDefault(n) {
      return (t) => {
        if (t === '__ngUnwrap__') return n;
        (this.platformIsServer ? this.ngZone.runGuarded(() => n(t)) : n(t)) === !1 &&
          t.preventDefault();
      };
    }
  };
function ff(e) {
  return e.tagName === 'TEMPLATE' && e.content !== void 0;
}
var Wa = class extends di {
    constructor(n, t, i, r, o, s, a, d) {
      (super(n, o, s, d),
        (this.sharedStylesHost = t),
        (this.hostEl = i),
        (this.shadowRoot = i.attachShadow({ mode: 'open' })),
        this.sharedStylesHost.addHost(this.shadowRoot));
      let p = _f(r.id, r.styles);
      for (let h of p) {
        let g = document.createElement('style');
        (a && g.setAttribute('nonce', a), (g.textContent = h), this.shadowRoot.appendChild(g));
      }
    }
    nodeOrShadowRoot(n) {
      return n === this.hostEl ? this.shadowRoot : n;
    }
    appendChild(n, t) {
      return super.appendChild(this.nodeOrShadowRoot(n), t);
    }
    insertBefore(n, t, i) {
      return super.insertBefore(this.nodeOrShadowRoot(n), t, i);
    }
    removeChild(n, t) {
      return super.removeChild(null, t);
    }
    parentNode(n) {
      return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(n)));
    }
    destroy() {
      this.sharedStylesHost.removeHost(this.shadowRoot);
    }
  },
  fi = class extends di {
    constructor(n, t, i, r, o, s, a, d) {
      (super(n, o, s, a),
        (this.sharedStylesHost = t),
        (this.removeStylesOnCompDestroy = r),
        (this.styles = d ? _f(d, i.styles) : i.styles));
    }
    applyStyles() {
      this.sharedStylesHost.addStyles(this.styles);
    }
    destroy() {
      this.removeStylesOnCompDestroy && this.sharedStylesHost.removeStyles(this.styles);
    }
  },
  mo = class extends fi {
    constructor(n, t, i, r, o, s, a, d) {
      let p = r + '-' + i.id;
      (super(n, t, i, o, s, a, d, p), (this.contentAttr = Zy(p)), (this.hostAttr = Qy(p)));
    }
    applyToHost(n) {
      (this.applyStyles(), this.setAttribute(n, this.hostAttr, ''));
    }
    createElement(n, t) {
      let i = super.createElement(n, t);
      return (super.setAttribute(i, this.contentAttr, ''), i);
    }
  },
  Yy = (() => {
    class e extends ho {
      constructor(t) {
        super(t);
      }
      supports(t) {
        return !0;
      }
      addEventListener(t, i, r) {
        return (t.addEventListener(i, r, !1), () => this.removeEventListener(t, i, r));
      }
      removeEventListener(t, i, r) {
        return t.removeEventListener(i, r);
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)($(ot));
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  pf = ['alt', 'control', 'meta', 'shift'],
  Ky = {
    '\b': 'Backspace',
    '	': 'Tab',
    '\x7F': 'Delete',
    '\x1B': 'Escape',
    Del: 'Delete',
    Esc: 'Escape',
    Left: 'ArrowLeft',
    Right: 'ArrowRight',
    Up: 'ArrowUp',
    Down: 'ArrowDown',
    Menu: 'ContextMenu',
    Scroll: 'ScrollLock',
    Win: 'OS',
  },
  Jy = {
    alt: (e) => e.altKey,
    control: (e) => e.ctrlKey,
    meta: (e) => e.metaKey,
    shift: (e) => e.shiftKey,
  },
  Xy = (() => {
    class e extends ho {
      constructor(t) {
        super(t);
      }
      supports(t) {
        return e.parseEventName(t) != null;
      }
      addEventListener(t, i, r) {
        let o = e.parseEventName(i),
          s = e.eventCallback(o.fullKey, r, this.manager.getZone());
        return this.manager
          .getZone()
          .runOutsideAngular(() => xn().onAndCancel(t, o.domEventName, s));
      }
      static parseEventName(t) {
        let i = t.toLowerCase().split('.'),
          r = i.shift();
        if (i.length === 0 || !(r === 'keydown' || r === 'keyup')) return null;
        let o = e._normalizeKey(i.pop()),
          s = '',
          a = i.indexOf('code');
        if (
          (a > -1 && (i.splice(a, 1), (s = 'code.')),
          pf.forEach((p) => {
            let h = i.indexOf(p);
            h > -1 && (i.splice(h, 1), (s += p + '.'));
          }),
          (s += o),
          i.length != 0 || o.length === 0)
        )
          return null;
        let d = {};
        return ((d.domEventName = r), (d.fullKey = s), d);
      }
      static matchEventFullKeyCode(t, i) {
        let r = Ky[t.key] || t.key,
          o = '';
        return (
          i.indexOf('code.') > -1 && ((r = t.code), (o = 'code.')),
          r == null || !r
            ? !1
            : ((r = r.toLowerCase()),
              r === ' ' ? (r = 'space') : r === '.' && (r = 'dot'),
              pf.forEach((s) => {
                if (s !== r) {
                  let a = Jy[s];
                  a(t) && (o += s + '.');
                }
              }),
              (o += r),
              o === i)
        );
      }
      static eventCallback(t, i, r) {
        return (o) => {
          e.matchEventFullKeyCode(o, t) && r.runGuarded(() => i(o));
        };
      }
      static _normalizeKey(t) {
        return t === 'esc' ? 'escape' : t;
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)($(ot));
        };
      }
      static {
        this.ɵprov = Q({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })();
function yf(e, n, t) {
  return Ld(Z({ rootComponent: e, platformRef: t?.platformRef }, ev(n)));
}
function ev(e) {
  return { appProviders: [...ov, ...(e?.providers ?? [])], platformProviders: rv };
}
function tv() {
  $a.makeCurrent();
}
function nv() {
  return new ct();
}
function iv() {
  return (Qu(document), document);
}
var rv = [
  { provide: Tt, useValue: Kd },
  { provide: ca, useValue: tv, multi: !0 },
  { provide: ot, useFactory: iv, deps: [] },
];
var ov = [
  { provide: Mr, useValue: 'root' },
  { provide: ct, useFactory: nv, deps: [] },
  { provide: Ha, useClass: Yy, multi: !0, deps: [ot, oe, Tt] },
  { provide: Ha, useClass: Xy, multi: !0, deps: [ot] },
  df,
  mf,
  hf,
  { provide: _n, useExisting: df },
  { provide: In, useClass: Hy, deps: [] },
  [],
];
var Mf = (() => {
    class e {
      constructor(t, i) {
        ((this._renderer = t),
          (this._elementRef = i),
          (this.onChange = (r) => {}),
          (this.onTouched = () => {}));
      }
      setProperty(t, i) {
        this._renderer.setProperty(this._elementRef.nativeElement, t, i);
      }
      registerOnTouched(t) {
        this.onTouched = t;
      }
      registerOnChange(t) {
        this.onChange = t;
      }
      setDisabledState(t) {
        this.setProperty('disabled', t);
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(Yt), L(Mt));
        };
      }
      static {
        this.ɵdir = ie({ type: e });
      }
    }
    return e;
  })(),
  vi = (() => {
    class e extends Mf {
      static {
        this.ɵfac = (() => {
          let t;
          return function (r) {
            return (t || (t = ht(e)))(r || e);
          };
        })();
      }
      static {
        this.ɵdir = ie({ type: e, features: [Ee] });
      }
    }
    return e;
  })(),
  Nn = new P(''),
  sv = { provide: Nn, useExisting: Re(() => Za), multi: !0 },
  Za = (() => {
    class e extends vi {
      writeValue(t) {
        this.setProperty('checked', t);
      }
      static {
        this.ɵfac = (() => {
          let t;
          return function (r) {
            return (t || (t = ht(e)))(r || e);
          };
        })();
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['input', 'type', 'checkbox', 'formControlName', ''],
            ['input', 'type', 'checkbox', 'formControl', ''],
            ['input', 'type', 'checkbox', 'ngModel', ''],
          ],
          hostBindings: function (i, r) {
            i & 1 &&
              E('change', function (s) {
                return r.onChange(s.target.checked);
              })('blur', function () {
                return r.onTouched();
              });
          },
          features: [Ze([sv]), Ee],
        });
      }
    }
    return e;
  })(),
  av = { provide: Nn, useExisting: Re(() => bo), multi: !0 };
function lv() {
  let e = xn() ? xn().getUserAgent() : '';
  return /android (\d+)/.test(e.toLowerCase());
}
var cv = new P(''),
  bo = (() => {
    class e extends Mf {
      constructor(t, i, r) {
        (super(t, i),
          (this._compositionMode = r),
          (this._composing = !1),
          this._compositionMode == null && (this._compositionMode = !lv()));
      }
      writeValue(t) {
        let i = t ?? '';
        this.setProperty('value', i);
      }
      _handleInput(t) {
        (!this._compositionMode || (this._compositionMode && !this._composing)) && this.onChange(t);
      }
      _compositionStart() {
        this._composing = !0;
      }
      _compositionEnd(t) {
        ((this._composing = !1), this._compositionMode && this.onChange(t));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(Yt), L(Mt), L(cv, 8));
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['input', 'formControlName', '', 3, 'type', 'checkbox'],
            ['textarea', 'formControlName', ''],
            ['input', 'formControl', '', 3, 'type', 'checkbox'],
            ['textarea', 'formControl', ''],
            ['input', 'ngModel', '', 3, 'type', 'checkbox'],
            ['textarea', 'ngModel', ''],
            ['', 'ngDefaultControl', ''],
          ],
          hostBindings: function (i, r) {
            i & 1 &&
              E('input', function (s) {
                return r._handleInput(s.target.value);
              })('blur', function () {
                return r.onTouched();
              })('compositionstart', function () {
                return r._compositionStart();
              })('compositionend', function (s) {
                return r._compositionEnd(s.target.value);
              });
          },
          features: [Ze([av]), Ee],
        });
      }
    }
    return e;
  })();
function qa(e) {
  return e == null || ((typeof e == 'string' || Array.isArray(e)) && e.length === 0);
}
function uv(e) {
  return e != null && typeof e.length == 'number';
}
var Ci = new P(''),
  Tf = new P('');
function dv(e) {
  return (n) => {
    if (qa(n.value) || qa(e)) return null;
    let t = parseFloat(n.value);
    return !isNaN(t) && t < e ? { min: { min: e, actual: n.value } } : null;
  };
}
function fv(e) {
  return qa(e.value) ? { required: !0 } : null;
}
function pv(e) {
  return (n) =>
    uv(n.value) && n.value.length > e
      ? { maxlength: { requiredLength: e, actualLength: n.value.length } }
      : null;
}
function vf(e) {
  return null;
}
function Af(e) {
  return e != null;
}
function Nf(e) {
  return ii(e) ? Vt(e) : e;
}
function Rf(e) {
  let n = {};
  return (
    e.forEach((t) => {
      n = t != null ? Z(Z({}, n), t) : n;
    }),
    Object.keys(n).length === 0 ? null : n
  );
}
function Of(e, n) {
  return n.map((t) => t(e));
}
function hv(e) {
  return !e.validate;
}
function Pf(e) {
  return e.map((n) => (hv(n) ? n : (t) => n.validate(t)));
}
function mv(e) {
  if (!e) return null;
  let n = e.filter(Af);
  return n.length == 0
    ? null
    : function (t) {
        return Rf(Of(t, n));
      };
}
function Qa(e) {
  return e != null ? mv(Pf(e)) : null;
}
function gv(e) {
  if (!e) return null;
  let n = e.filter(Af);
  return n.length == 0
    ? null
    : function (t) {
        let i = Of(t, n).map(Nf);
        return Uo(i).pipe(Se(Rf));
      };
}
function Ya(e) {
  return e != null ? gv(Pf(e)) : null;
}
function Cf(e, n) {
  return e === null ? [n] : Array.isArray(e) ? [...e, n] : [e, n];
}
function _v(e) {
  return e._rawValidators;
}
function yv(e) {
  return e._rawAsyncValidators;
}
function za(e) {
  return e ? (Array.isArray(e) ? e : [e]) : [];
}
function _o(e, n) {
  return Array.isArray(e) ? e.includes(n) : e === n;
}
function Ef(e, n) {
  let t = za(n);
  return (
    za(e).forEach((r) => {
      _o(t, r) || t.push(r);
    }),
    t
  );
}
function Df(e, n) {
  return za(n).filter((t) => !_o(e, t));
}
var yo = class {
    constructor() {
      ((this._rawValidators = []),
        (this._rawAsyncValidators = []),
        (this._onDestroyCallbacks = []));
    }
    get value() {
      return this.control ? this.control.value : null;
    }
    get valid() {
      return this.control ? this.control.valid : null;
    }
    get invalid() {
      return this.control ? this.control.invalid : null;
    }
    get pending() {
      return this.control ? this.control.pending : null;
    }
    get disabled() {
      return this.control ? this.control.disabled : null;
    }
    get enabled() {
      return this.control ? this.control.enabled : null;
    }
    get errors() {
      return this.control ? this.control.errors : null;
    }
    get pristine() {
      return this.control ? this.control.pristine : null;
    }
    get dirty() {
      return this.control ? this.control.dirty : null;
    }
    get touched() {
      return this.control ? this.control.touched : null;
    }
    get status() {
      return this.control ? this.control.status : null;
    }
    get untouched() {
      return this.control ? this.control.untouched : null;
    }
    get statusChanges() {
      return this.control ? this.control.statusChanges : null;
    }
    get valueChanges() {
      return this.control ? this.control.valueChanges : null;
    }
    get path() {
      return null;
    }
    _setValidators(n) {
      ((this._rawValidators = n || []), (this._composedValidatorFn = Qa(this._rawValidators)));
    }
    _setAsyncValidators(n) {
      ((this._rawAsyncValidators = n || []),
        (this._composedAsyncValidatorFn = Ya(this._rawAsyncValidators)));
    }
    get validator() {
      return this._composedValidatorFn || null;
    }
    get asyncValidator() {
      return this._composedAsyncValidatorFn || null;
    }
    _registerOnDestroy(n) {
      this._onDestroyCallbacks.push(n);
    }
    _invokeOnDestroyCallbacks() {
      (this._onDestroyCallbacks.forEach((n) => n()), (this._onDestroyCallbacks = []));
    }
    reset(n = void 0) {
      this.control && this.control.reset(n);
    }
    hasError(n, t) {
      return this.control ? this.control.hasError(n, t) : !1;
    }
    getError(n, t) {
      return this.control ? this.control.getError(n, t) : null;
    }
  },
  Tn = class extends yo {
    get formDirective() {
      return null;
    }
    get path() {
      return null;
    }
  },
  yi = class extends yo {
    constructor() {
      (super(...arguments), (this._parent = null), (this.name = null), (this.valueAccessor = null));
    }
  },
  vo = class {
    constructor(n) {
      this._cd = n;
    }
    get isTouched() {
      return (this._cd?.control?._touched?.(), !!this._cd?.control?.touched);
    }
    get isUntouched() {
      return !!this._cd?.control?.untouched;
    }
    get isPristine() {
      return (this._cd?.control?._pristine?.(), !!this._cd?.control?.pristine);
    }
    get isDirty() {
      return !!this._cd?.control?.dirty;
    }
    get isValid() {
      return (this._cd?.control?._status?.(), !!this._cd?.control?.valid);
    }
    get isInvalid() {
      return !!this._cd?.control?.invalid;
    }
    get isPending() {
      return !!this._cd?.control?.pending;
    }
    get isSubmitted() {
      return (this._cd?._submitted?.(), !!this._cd?.submitted);
    }
  },
  vv = {
    '[class.ng-untouched]': 'isUntouched',
    '[class.ng-touched]': 'isTouched',
    '[class.ng-pristine]': 'isPristine',
    '[class.ng-dirty]': 'isDirty',
    '[class.ng-valid]': 'isValid',
    '[class.ng-invalid]': 'isInvalid',
    '[class.ng-pending]': 'isPending',
  },
  jx = ee(Z({}, vv), { '[class.ng-submitted]': 'isSubmitted' }),
  Ff = (() => {
    class e extends vo {
      constructor(t) {
        super(t);
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(yi, 2));
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['', 'formControlName', ''],
            ['', 'ngModel', ''],
            ['', 'formControl', ''],
          ],
          hostVars: 14,
          hostBindings: function (i, r) {
            i & 2 &&
              de('ng-untouched', r.isUntouched)('ng-touched', r.isTouched)(
                'ng-pristine',
                r.isPristine,
              )('ng-dirty', r.isDirty)('ng-valid', r.isValid)('ng-invalid', r.isInvalid)(
                'ng-pending',
                r.isPending,
              );
          },
          features: [Ee],
        });
      }
    }
    return e;
  })(),
  kf = (() => {
    class e extends vo {
      constructor(t) {
        super(t);
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(Tn, 10));
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['', 'formGroupName', ''],
            ['', 'formArrayName', ''],
            ['', 'ngModelGroup', ''],
            ['', 'formGroup', ''],
            ['form', 3, 'ngNoForm', ''],
            ['', 'ngForm', ''],
          ],
          hostVars: 16,
          hostBindings: function (i, r) {
            i & 2 &&
              de('ng-untouched', r.isUntouched)('ng-touched', r.isTouched)(
                'ng-pristine',
                r.isPristine,
              )('ng-dirty', r.isDirty)('ng-valid', r.isValid)('ng-invalid', r.isInvalid)(
                'ng-pending',
                r.isPending,
              )('ng-submitted', r.isSubmitted);
          },
          features: [Ee],
        });
      }
    }
    return e;
  })();
var pi = 'VALID',
  go = 'INVALID',
  Sn = 'PENDING',
  hi = 'DISABLED',
  An = class {},
  Co = class extends An {
    constructor(n, t) {
      (super(), (this.value = n), (this.source = t));
    }
  },
  gi = class extends An {
    constructor(n, t) {
      (super(), (this.pristine = n), (this.source = t));
    }
  },
  _i = class extends An {
    constructor(n, t) {
      (super(), (this.touched = n), (this.source = t));
    }
  },
  Mn = class extends An {
    constructor(n, t) {
      (super(), (this.status = n), (this.source = t));
    }
  };
function Vf(e) {
  return (wo(e) ? e.validators : e) || null;
}
function Cv(e) {
  return Array.isArray(e) ? Qa(e) : e || null;
}
function Lf(e, n) {
  return (wo(n) ? n.asyncValidators : e) || null;
}
function Ev(e) {
  return Array.isArray(e) ? Ya(e) : e || null;
}
function wo(e) {
  return e != null && !Array.isArray(e) && typeof e == 'object';
}
function Dv(e, n, t) {
  let i = e.controls;
  if (!(n ? Object.keys(i) : i).length) throw new F(1e3, '');
  if (!i[t]) throw new F(1001, '');
}
function bv(e, n, t) {
  e._forEachChild((i, r) => {
    if (t[r] === void 0) throw new F(1002, '');
  });
}
var Eo = class {
    constructor(n, t) {
      ((this._pendingDirty = !1),
        (this._hasOwnPendingAsyncValidator = null),
        (this._pendingTouched = !1),
        (this._onCollectionChange = () => {}),
        (this._parent = null),
        (this._status = ri(() => this.statusReactive())),
        (this.statusReactive = ti(void 0)),
        (this._pristine = ri(() => this.pristineReactive())),
        (this.pristineReactive = ti(!0)),
        (this._touched = ri(() => this.touchedReactive())),
        (this.touchedReactive = ti(!1)),
        (this._events = new Ye()),
        (this.events = this._events.asObservable()),
        (this._onDisabledChange = []),
        this._assignValidators(n),
        this._assignAsyncValidators(t));
    }
    get validator() {
      return this._composedValidatorFn;
    }
    set validator(n) {
      this._rawValidators = this._composedValidatorFn = n;
    }
    get asyncValidator() {
      return this._composedAsyncValidatorFn;
    }
    set asyncValidator(n) {
      this._rawAsyncValidators = this._composedAsyncValidatorFn = n;
    }
    get parent() {
      return this._parent;
    }
    get status() {
      return _t(this.statusReactive);
    }
    set status(n) {
      _t(() => this.statusReactive.set(n));
    }
    get valid() {
      return this.status === pi;
    }
    get invalid() {
      return this.status === go;
    }
    get pending() {
      return this.status == Sn;
    }
    get disabled() {
      return this.status === hi;
    }
    get enabled() {
      return this.status !== hi;
    }
    get pristine() {
      return _t(this.pristineReactive);
    }
    set pristine(n) {
      _t(() => this.pristineReactive.set(n));
    }
    get dirty() {
      return !this.pristine;
    }
    get touched() {
      return _t(this.touchedReactive);
    }
    set touched(n) {
      _t(() => this.touchedReactive.set(n));
    }
    get untouched() {
      return !this.touched;
    }
    get updateOn() {
      return this._updateOn ? this._updateOn : this.parent ? this.parent.updateOn : 'change';
    }
    setValidators(n) {
      this._assignValidators(n);
    }
    setAsyncValidators(n) {
      this._assignAsyncValidators(n);
    }
    addValidators(n) {
      this.setValidators(Ef(n, this._rawValidators));
    }
    addAsyncValidators(n) {
      this.setAsyncValidators(Ef(n, this._rawAsyncValidators));
    }
    removeValidators(n) {
      this.setValidators(Df(n, this._rawValidators));
    }
    removeAsyncValidators(n) {
      this.setAsyncValidators(Df(n, this._rawAsyncValidators));
    }
    hasValidator(n) {
      return _o(this._rawValidators, n);
    }
    hasAsyncValidator(n) {
      return _o(this._rawAsyncValidators, n);
    }
    clearValidators() {
      this.validator = null;
    }
    clearAsyncValidators() {
      this.asyncValidator = null;
    }
    markAsTouched(n = {}) {
      let t = this.touched === !1;
      this.touched = !0;
      let i = n.sourceControl ?? this;
      (this._parent &&
        !n.onlySelf &&
        this._parent.markAsTouched(ee(Z({}, n), { sourceControl: i })),
        t && n.emitEvent !== !1 && this._events.next(new _i(!0, i)));
    }
    markAllAsTouched(n = {}) {
      (this.markAsTouched({ onlySelf: !0, emitEvent: n.emitEvent, sourceControl: this }),
        this._forEachChild((t) => t.markAllAsTouched(n)));
    }
    markAsUntouched(n = {}) {
      let t = this.touched === !0;
      ((this.touched = !1), (this._pendingTouched = !1));
      let i = n.sourceControl ?? this;
      (this._forEachChild((r) => {
        r.markAsUntouched({ onlySelf: !0, emitEvent: n.emitEvent, sourceControl: i });
      }),
        this._parent && !n.onlySelf && this._parent._updateTouched(n, i),
        t && n.emitEvent !== !1 && this._events.next(new _i(!1, i)));
    }
    markAsDirty(n = {}) {
      let t = this.pristine === !0;
      this.pristine = !1;
      let i = n.sourceControl ?? this;
      (this._parent && !n.onlySelf && this._parent.markAsDirty(ee(Z({}, n), { sourceControl: i })),
        t && n.emitEvent !== !1 && this._events.next(new gi(!1, i)));
    }
    markAsPristine(n = {}) {
      let t = this.pristine === !1;
      ((this.pristine = !0), (this._pendingDirty = !1));
      let i = n.sourceControl ?? this;
      (this._forEachChild((r) => {
        r.markAsPristine({ onlySelf: !0, emitEvent: n.emitEvent });
      }),
        this._parent && !n.onlySelf && this._parent._updatePristine(n, i),
        t && n.emitEvent !== !1 && this._events.next(new gi(!0, i)));
    }
    markAsPending(n = {}) {
      this.status = Sn;
      let t = n.sourceControl ?? this;
      (n.emitEvent !== !1 &&
        (this._events.next(new Mn(this.status, t)), this.statusChanges.emit(this.status)),
        this._parent &&
          !n.onlySelf &&
          this._parent.markAsPending(ee(Z({}, n), { sourceControl: t })));
    }
    disable(n = {}) {
      let t = this._parentMarkedDirty(n.onlySelf);
      ((this.status = hi),
        (this.errors = null),
        this._forEachChild((r) => {
          r.disable(ee(Z({}, n), { onlySelf: !0 }));
        }),
        this._updateValue());
      let i = n.sourceControl ?? this;
      (n.emitEvent !== !1 &&
        (this._events.next(new Co(this.value, i)),
        this._events.next(new Mn(this.status, i)),
        this.valueChanges.emit(this.value),
        this.statusChanges.emit(this.status)),
        this._updateAncestors(ee(Z({}, n), { skipPristineCheck: t }), this),
        this._onDisabledChange.forEach((r) => r(!0)));
    }
    enable(n = {}) {
      let t = this._parentMarkedDirty(n.onlySelf);
      ((this.status = pi),
        this._forEachChild((i) => {
          i.enable(ee(Z({}, n), { onlySelf: !0 }));
        }),
        this.updateValueAndValidity({ onlySelf: !0, emitEvent: n.emitEvent }),
        this._updateAncestors(ee(Z({}, n), { skipPristineCheck: t }), this),
        this._onDisabledChange.forEach((i) => i(!1)));
    }
    _updateAncestors(n, t) {
      this._parent &&
        !n.onlySelf &&
        (this._parent.updateValueAndValidity(n),
        n.skipPristineCheck || this._parent._updatePristine({}, t),
        this._parent._updateTouched({}, t));
    }
    setParent(n) {
      this._parent = n;
    }
    getRawValue() {
      return this.value;
    }
    updateValueAndValidity(n = {}) {
      if ((this._setInitialStatus(), this._updateValue(), this.enabled)) {
        let i = this._cancelExistingSubscription();
        ((this.errors = this._runValidator()),
          (this.status = this._calculateStatus()),
          (this.status === pi || this.status === Sn) && this._runAsyncValidator(i, n.emitEvent));
      }
      let t = n.sourceControl ?? this;
      (n.emitEvent !== !1 &&
        (this._events.next(new Co(this.value, t)),
        this._events.next(new Mn(this.status, t)),
        this.valueChanges.emit(this.value),
        this.statusChanges.emit(this.status)),
        this._parent &&
          !n.onlySelf &&
          this._parent.updateValueAndValidity(ee(Z({}, n), { sourceControl: t })));
    }
    _updateTreeValidity(n = { emitEvent: !0 }) {
      (this._forEachChild((t) => t._updateTreeValidity(n)),
        this.updateValueAndValidity({ onlySelf: !0, emitEvent: n.emitEvent }));
    }
    _setInitialStatus() {
      this.status = this._allControlsDisabled() ? hi : pi;
    }
    _runValidator() {
      return this.validator ? this.validator(this) : null;
    }
    _runAsyncValidator(n, t) {
      if (this.asyncValidator) {
        ((this.status = Sn), (this._hasOwnPendingAsyncValidator = { emitEvent: t !== !1 }));
        let i = Nf(this.asyncValidator(this));
        this._asyncValidationSubscription = i.subscribe((r) => {
          ((this._hasOwnPendingAsyncValidator = null),
            this.setErrors(r, { emitEvent: t, shouldHaveEmitted: n }));
        });
      }
    }
    _cancelExistingSubscription() {
      if (this._asyncValidationSubscription) {
        this._asyncValidationSubscription.unsubscribe();
        let n = this._hasOwnPendingAsyncValidator?.emitEvent ?? !1;
        return ((this._hasOwnPendingAsyncValidator = null), n);
      }
      return !1;
    }
    setErrors(n, t = {}) {
      ((this.errors = n),
        this._updateControlsErrors(t.emitEvent !== !1, this, t.shouldHaveEmitted));
    }
    get(n) {
      let t = n;
      return t == null || (Array.isArray(t) || (t = t.split('.')), t.length === 0)
        ? null
        : t.reduce((i, r) => i && i._find(r), this);
    }
    getError(n, t) {
      let i = t ? this.get(t) : this;
      return i && i.errors ? i.errors[n] : null;
    }
    hasError(n, t) {
      return !!this.getError(n, t);
    }
    get root() {
      let n = this;
      for (; n._parent;) n = n._parent;
      return n;
    }
    _updateControlsErrors(n, t, i) {
      ((this.status = this._calculateStatus()),
        n && this.statusChanges.emit(this.status),
        (n || i) && this._events.next(new Mn(this.status, t)),
        this._parent && this._parent._updateControlsErrors(n, t, i));
    }
    _initObservables() {
      ((this.valueChanges = new Te()), (this.statusChanges = new Te()));
    }
    _calculateStatus() {
      return this._allControlsDisabled()
        ? hi
        : this.errors
          ? go
          : this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(Sn)
            ? Sn
            : this._anyControlsHaveStatus(go)
              ? go
              : pi;
    }
    _anyControlsHaveStatus(n) {
      return this._anyControls((t) => t.status === n);
    }
    _anyControlsDirty() {
      return this._anyControls((n) => n.dirty);
    }
    _anyControlsTouched() {
      return this._anyControls((n) => n.touched);
    }
    _updatePristine(n, t) {
      let i = !this._anyControlsDirty(),
        r = this.pristine !== i;
      ((this.pristine = i),
        this._parent && !n.onlySelf && this._parent._updatePristine(n, t),
        r && this._events.next(new gi(this.pristine, t)));
    }
    _updateTouched(n = {}, t) {
      ((this.touched = this._anyControlsTouched()),
        this._events.next(new _i(this.touched, t)),
        this._parent && !n.onlySelf && this._parent._updateTouched(n, t));
    }
    _registerOnCollectionChange(n) {
      this._onCollectionChange = n;
    }
    _setUpdateStrategy(n) {
      wo(n) && n.updateOn != null && (this._updateOn = n.updateOn);
    }
    _parentMarkedDirty(n) {
      let t = this._parent && this._parent.dirty;
      return !n && !!t && !this._parent._anyControlsDirty();
    }
    _find(n) {
      return null;
    }
    _assignValidators(n) {
      ((this._rawValidators = Array.isArray(n) ? n.slice() : n),
        (this._composedValidatorFn = Cv(this._rawValidators)));
    }
    _assignAsyncValidators(n) {
      ((this._rawAsyncValidators = Array.isArray(n) ? n.slice() : n),
        (this._composedAsyncValidatorFn = Ev(this._rawAsyncValidators)));
    }
  },
  Do = class extends Eo {
    constructor(n, t, i) {
      (super(Vf(t), Lf(i, t)),
        (this.controls = n),
        this._initObservables(),
        this._setUpdateStrategy(t),
        this._setUpControls(),
        this.updateValueAndValidity({ onlySelf: !0, emitEvent: !!this.asyncValidator }));
    }
    registerControl(n, t) {
      return this.controls[n]
        ? this.controls[n]
        : ((this.controls[n] = t),
          t.setParent(this),
          t._registerOnCollectionChange(this._onCollectionChange),
          t);
    }
    addControl(n, t, i = {}) {
      (this.registerControl(n, t),
        this.updateValueAndValidity({ emitEvent: i.emitEvent }),
        this._onCollectionChange());
    }
    removeControl(n, t = {}) {
      (this.controls[n] && this.controls[n]._registerOnCollectionChange(() => {}),
        delete this.controls[n],
        this.updateValueAndValidity({ emitEvent: t.emitEvent }),
        this._onCollectionChange());
    }
    setControl(n, t, i = {}) {
      (this.controls[n] && this.controls[n]._registerOnCollectionChange(() => {}),
        delete this.controls[n],
        t && this.registerControl(n, t),
        this.updateValueAndValidity({ emitEvent: i.emitEvent }),
        this._onCollectionChange());
    }
    contains(n) {
      return this.controls.hasOwnProperty(n) && this.controls[n].enabled;
    }
    setValue(n, t = {}) {
      (bv(this, !0, n),
        Object.keys(n).forEach((i) => {
          (Dv(this, !0, i),
            this.controls[i].setValue(n[i], { onlySelf: !0, emitEvent: t.emitEvent }));
        }),
        this.updateValueAndValidity(t));
    }
    patchValue(n, t = {}) {
      n != null &&
        (Object.keys(n).forEach((i) => {
          let r = this.controls[i];
          r && r.patchValue(n[i], { onlySelf: !0, emitEvent: t.emitEvent });
        }),
        this.updateValueAndValidity(t));
    }
    reset(n = {}, t = {}) {
      (this._forEachChild((i, r) => {
        i.reset(n ? n[r] : null, { onlySelf: !0, emitEvent: t.emitEvent });
      }),
        this._updatePristine(t, this),
        this._updateTouched(t, this),
        this.updateValueAndValidity(t));
    }
    getRawValue() {
      return this._reduceChildren({}, (n, t, i) => ((n[i] = t.getRawValue()), n));
    }
    _syncPendingControls() {
      let n = this._reduceChildren(!1, (t, i) => (i._syncPendingControls() ? !0 : t));
      return (n && this.updateValueAndValidity({ onlySelf: !0 }), n);
    }
    _forEachChild(n) {
      Object.keys(this.controls).forEach((t) => {
        let i = this.controls[t];
        i && n(i, t);
      });
    }
    _setUpControls() {
      this._forEachChild((n) => {
        (n.setParent(this), n._registerOnCollectionChange(this._onCollectionChange));
      });
    }
    _updateValue() {
      this.value = this._reduceValue();
    }
    _anyControls(n) {
      for (let [t, i] of Object.entries(this.controls)) if (this.contains(t) && n(i)) return !0;
      return !1;
    }
    _reduceValue() {
      let n = {};
      return this._reduceChildren(
        n,
        (t, i, r) => ((i.enabled || this.disabled) && (t[r] = i.value), t),
      );
    }
    _reduceChildren(n, t) {
      let i = n;
      return (
        this._forEachChild((r, o) => {
          i = t(i, r, o);
        }),
        i
      );
    }
    _allControlsDisabled() {
      for (let n of Object.keys(this.controls)) if (this.controls[n].enabled) return !1;
      return Object.keys(this.controls).length > 0 || this.disabled;
    }
    _find(n) {
      return this.controls.hasOwnProperty(n) ? this.controls[n] : null;
    }
  };
var Ka = new P('CallSetDisabledState', { providedIn: 'root', factory: () => Ja }),
  Ja = 'always';
function wv(e, n) {
  return [...n.path, e];
}
function jf(e, n, t = Ja) {
  (Bf(e, n),
    n.valueAccessor.writeValue(e.value),
    (e.disabled || t === 'always') && n.valueAccessor.setDisabledState?.(e.disabled),
    xv(e, n),
    Mv(e, n),
    Sv(e, n),
    Iv(e, n));
}
function bf(e, n) {
  e.forEach((t) => {
    t.registerOnValidatorChange && t.registerOnValidatorChange(n);
  });
}
function Iv(e, n) {
  if (n.valueAccessor.setDisabledState) {
    let t = (i) => {
      n.valueAccessor.setDisabledState(i);
    };
    (e.registerOnDisabledChange(t),
      n._registerOnDestroy(() => {
        e._unregisterOnDisabledChange(t);
      }));
  }
}
function Bf(e, n) {
  let t = _v(e);
  n.validator !== null
    ? e.setValidators(Cf(t, n.validator))
    : typeof t == 'function' && e.setValidators([t]);
  let i = yv(e);
  n.asyncValidator !== null
    ? e.setAsyncValidators(Cf(i, n.asyncValidator))
    : typeof i == 'function' && e.setAsyncValidators([i]);
  let r = () => e.updateValueAndValidity();
  (bf(n._rawValidators, r), bf(n._rawAsyncValidators, r));
}
function xv(e, n) {
  n.valueAccessor.registerOnChange((t) => {
    ((e._pendingValue = t),
      (e._pendingChange = !0),
      (e._pendingDirty = !0),
      e.updateOn === 'change' && Uf(e, n));
  });
}
function Sv(e, n) {
  n.valueAccessor.registerOnTouched(() => {
    ((e._pendingTouched = !0),
      e.updateOn === 'blur' && e._pendingChange && Uf(e, n),
      e.updateOn !== 'submit' && e.markAsTouched());
  });
}
function Uf(e, n) {
  (e._pendingDirty && e.markAsDirty(),
    e.setValue(e._pendingValue, { emitModelToViewChange: !1 }),
    n.viewToModelUpdate(e._pendingValue),
    (e._pendingChange = !1));
}
function Mv(e, n) {
  let t = (i, r) => {
    (n.valueAccessor.writeValue(i), r && n.viewToModelUpdate(i));
  };
  (e.registerOnChange(t),
    n._registerOnDestroy(() => {
      e._unregisterOnChange(t);
    }));
}
function Tv(e, n) {
  (e == null, Bf(e, n));
}
function Av(e, n) {
  if (!e.hasOwnProperty('model')) return !1;
  let t = e.model;
  return t.isFirstChange() ? !0 : !Object.is(n, t.currentValue);
}
function Nv(e) {
  return Object.getPrototypeOf(e.constructor) === vi;
}
function Rv(e, n) {
  (e._syncPendingControls(),
    n.forEach((t) => {
      let i = t.control;
      i.updateOn === 'submit' &&
        i._pendingChange &&
        (t.viewToModelUpdate(i._pendingValue), (i._pendingChange = !1));
    }));
}
function Ov(e, n) {
  if (!n) return null;
  Array.isArray(n);
  let t, i, r;
  return (
    n.forEach((o) => {
      o.constructor === bo ? (t = o) : Nv(o) ? (i = o) : (r = o);
    }),
    r || i || t || null
  );
}
var Pv = { provide: Tn, useExisting: Re(() => Xa) },
  mi = Promise.resolve(),
  Xa = (() => {
    class e extends Tn {
      get submitted() {
        return _t(this.submittedReactive);
      }
      constructor(t, i, r) {
        (super(),
          (this.callSetDisabledState = r),
          (this._submitted = ri(() => this.submittedReactive())),
          (this.submittedReactive = ti(!1)),
          (this._directives = new Set()),
          (this.ngSubmit = new Te()),
          (this.form = new Do({}, Qa(t), Ya(i))));
      }
      ngAfterViewInit() {
        this._setUpdateStrategy();
      }
      get formDirective() {
        return this;
      }
      get control() {
        return this.form;
      }
      get path() {
        return [];
      }
      get controls() {
        return this.form.controls;
      }
      addControl(t) {
        mi.then(() => {
          let i = this._findContainer(t.path);
          ((t.control = i.registerControl(t.name, t.control)),
            jf(t.control, t, this.callSetDisabledState),
            t.control.updateValueAndValidity({ emitEvent: !1 }),
            this._directives.add(t));
        });
      }
      getControl(t) {
        return this.form.get(t.path);
      }
      removeControl(t) {
        mi.then(() => {
          let i = this._findContainer(t.path);
          (i && i.removeControl(t.name), this._directives.delete(t));
        });
      }
      addFormGroup(t) {
        mi.then(() => {
          let i = this._findContainer(t.path),
            r = new Do({});
          (Tv(r, t), i.registerControl(t.name, r), r.updateValueAndValidity({ emitEvent: !1 }));
        });
      }
      removeFormGroup(t) {
        mi.then(() => {
          let i = this._findContainer(t.path);
          i && i.removeControl(t.name);
        });
      }
      getFormGroup(t) {
        return this.form.get(t.path);
      }
      updateModel(t, i) {
        mi.then(() => {
          this.form.get(t.path).setValue(i);
        });
      }
      setValue(t) {
        this.control.setValue(t);
      }
      onSubmit(t) {
        return (
          this.submittedReactive.set(!0),
          Rv(this.form, this._directives),
          this.ngSubmit.emit(t),
          t?.target?.method === 'dialog'
        );
      }
      onReset() {
        this.resetForm();
      }
      resetForm(t = void 0) {
        (this.form.reset(t), this.submittedReactive.set(!1));
      }
      _setUpdateStrategy() {
        this.options &&
          this.options.updateOn != null &&
          (this.form._updateOn = this.options.updateOn);
      }
      _findContainer(t) {
        return (t.pop(), t.length ? this.form.get(t) : this.form);
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(Ci, 10), L(Tf, 10), L(Ka, 8));
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['form', 3, 'ngNoForm', '', 3, 'formGroup', ''],
            ['ng-form'],
            ['', 'ngForm', ''],
          ],
          hostBindings: function (i, r) {
            i & 1 &&
              E('submit', function (s) {
                return r.onSubmit(s);
              })('reset', function () {
                return r.onReset();
              });
          },
          inputs: { options: [0, 'ngFormOptions', 'options'] },
          outputs: { ngSubmit: 'ngSubmit' },
          exportAs: ['ngForm'],
          features: [Ze([Pv]), Ee],
        });
      }
    }
    return e;
  })();
function wf(e, n) {
  let t = e.indexOf(n);
  t > -1 && e.splice(t, 1);
}
function If(e) {
  return (
    typeof e == 'object' &&
    e !== null &&
    Object.keys(e).length === 2 &&
    'value' in e &&
    'disabled' in e
  );
}
var Fv = class extends Eo {
  constructor(n = null, t, i) {
    (super(Vf(t), Lf(i, t)),
      (this.defaultValue = null),
      (this._onChange = []),
      (this._pendingChange = !1),
      this._applyFormState(n),
      this._setUpdateStrategy(t),
      this._initObservables(),
      this.updateValueAndValidity({ onlySelf: !0, emitEvent: !!this.asyncValidator }),
      wo(t) &&
        (t.nonNullable || t.initialValueIsDefault) &&
        (If(n) ? (this.defaultValue = n.value) : (this.defaultValue = n)));
  }
  setValue(n, t = {}) {
    ((this.value = this._pendingValue = n),
      this._onChange.length &&
        t.emitModelToViewChange !== !1 &&
        this._onChange.forEach((i) => i(this.value, t.emitViewToModelChange !== !1)),
      this.updateValueAndValidity(t));
  }
  patchValue(n, t = {}) {
    this.setValue(n, t);
  }
  reset(n = this.defaultValue, t = {}) {
    (this._applyFormState(n),
      this.markAsPristine(t),
      this.markAsUntouched(t),
      this.setValue(this.value, t),
      (this._pendingChange = !1));
  }
  _updateValue() {}
  _anyControls(n) {
    return !1;
  }
  _allControlsDisabled() {
    return this.disabled;
  }
  registerOnChange(n) {
    this._onChange.push(n);
  }
  _unregisterOnChange(n) {
    wf(this._onChange, n);
  }
  registerOnDisabledChange(n) {
    this._onDisabledChange.push(n);
  }
  _unregisterOnDisabledChange(n) {
    wf(this._onDisabledChange, n);
  }
  _forEachChild(n) {}
  _syncPendingControls() {
    return this.updateOn === 'submit' &&
      (this._pendingDirty && this.markAsDirty(),
      this._pendingTouched && this.markAsTouched(),
      this._pendingChange)
      ? (this.setValue(this._pendingValue, { onlySelf: !0, emitModelToViewChange: !1 }), !0)
      : !1;
  }
  _applyFormState(n) {
    If(n)
      ? ((this.value = this._pendingValue = n.value),
        n.disabled
          ? this.disable({ onlySelf: !0, emitEvent: !1 })
          : this.enable({ onlySelf: !0, emitEvent: !1 }))
      : (this.value = this._pendingValue = n);
  }
};
var kv = { provide: yi, useExisting: Re(() => el) },
  xf = Promise.resolve(),
  el = (() => {
    class e extends yi {
      constructor(t, i, r, o, s, a) {
        (super(),
          (this._changeDetectorRef = s),
          (this.callSetDisabledState = a),
          (this.control = new Fv()),
          (this._registered = !1),
          (this.name = ''),
          (this.update = new Te()),
          (this._parent = t),
          this._setValidators(i),
          this._setAsyncValidators(r),
          (this.valueAccessor = Ov(this, o)));
      }
      ngOnChanges(t) {
        if ((this._checkForErrors(), !this._registered || 'name' in t)) {
          if (this._registered && (this._checkName(), this.formDirective)) {
            let i = t.name.previousValue;
            this.formDirective.removeControl({ name: i, path: this._getPath(i) });
          }
          this._setUpControl();
        }
        ('isDisabled' in t && this._updateDisabled(t),
          Av(t, this.viewModel) && (this._updateValue(this.model), (this.viewModel = this.model)));
      }
      ngOnDestroy() {
        this.formDirective && this.formDirective.removeControl(this);
      }
      get path() {
        return this._getPath(this.name);
      }
      get formDirective() {
        return this._parent ? this._parent.formDirective : null;
      }
      viewToModelUpdate(t) {
        ((this.viewModel = t), this.update.emit(t));
      }
      _setUpControl() {
        (this._setUpdateStrategy(),
          this._isStandalone() ? this._setUpStandalone() : this.formDirective.addControl(this),
          (this._registered = !0));
      }
      _setUpdateStrategy() {
        this.options &&
          this.options.updateOn != null &&
          (this.control._updateOn = this.options.updateOn);
      }
      _isStandalone() {
        return !this._parent || !!(this.options && this.options.standalone);
      }
      _setUpStandalone() {
        (jf(this.control, this, this.callSetDisabledState),
          this.control.updateValueAndValidity({ emitEvent: !1 }));
      }
      _checkForErrors() {
        (this._isStandalone() || this._checkParentType(), this._checkName());
      }
      _checkParentType() {}
      _checkName() {
        (this.options && this.options.name && (this.name = this.options.name),
          !this._isStandalone() && this.name);
      }
      _updateValue(t) {
        xf.then(() => {
          (this.control.setValue(t, { emitViewToModelChange: !1 }),
            this._changeDetectorRef?.markForCheck());
        });
      }
      _updateDisabled(t) {
        let i = t.isDisabled.currentValue,
          r = i !== 0 && Qr(i);
        xf.then(() => {
          (r && !this.control.disabled
            ? this.control.disable()
            : !r && this.control.disabled && this.control.enable(),
            this._changeDetectorRef?.markForCheck());
        });
      }
      _getPath(t) {
        return this._parent ? wv(t, this._parent) : [t];
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(Tn, 9), L(Ci, 10), L(Tf, 10), L(Nn, 10), L(Zr, 8), L(Ka, 8));
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [['', 'ngModel', '', 3, 'formControlName', '', 3, 'formControl', '']],
          inputs: {
            name: 'name',
            isDisabled: [0, 'disabled', 'isDisabled'],
            model: [0, 'ngModel', 'model'],
            options: [0, 'ngModelOptions', 'options'],
          },
          outputs: { update: 'ngModelChange' },
          exportAs: ['ngModel'],
          features: [Ze([kv]), Ee, Yn],
        });
      }
    }
    return e;
  })(),
  $f = (() => {
    class e {
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [['form', 3, 'ngNoForm', '', 3, 'ngNativeValidate', '']],
          hostAttrs: ['novalidate', ''],
        });
      }
    }
    return e;
  })(),
  Vv = { provide: Nn, useExisting: Re(() => tl), multi: !0 },
  tl = (() => {
    class e extends vi {
      writeValue(t) {
        let i = t ?? '';
        this.setProperty('value', i);
      }
      registerOnChange(t) {
        this.onChange = (i) => {
          t(i == '' ? null : parseFloat(i));
        };
      }
      static {
        this.ɵfac = (() => {
          let t;
          return function (r) {
            return (t || (t = ht(e)))(r || e);
          };
        })();
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['input', 'type', 'number', 'formControlName', ''],
            ['input', 'type', 'number', 'formControl', ''],
            ['input', 'type', 'number', 'ngModel', ''],
          ],
          hostBindings: function (i, r) {
            i & 1 &&
              E('input', function (s) {
                return r.onChange(s.target.value);
              })('blur', function () {
                return r.onTouched();
              });
          },
          features: [Ze([Vv]), Ee],
        });
      }
    }
    return e;
  })();
var Lv = { provide: Nn, useExisting: Re(() => Io), multi: !0 };
function Hf(e, n) {
  return e == null
    ? `${n}`
    : (n && typeof n == 'object' && (n = 'Object'), `${e}: ${n}`.slice(0, 50));
}
function jv(e) {
  return e.split(':')[0];
}
var Io = (() => {
    class e extends vi {
      constructor() {
        (super(...arguments),
          (this._optionMap = new Map()),
          (this._idCounter = 0),
          (this._compareWith = Object.is));
      }
      set compareWith(t) {
        this._compareWith = t;
      }
      writeValue(t) {
        this.value = t;
        let i = this._getOptionId(t),
          r = Hf(i, t);
        this.setProperty('value', r);
      }
      registerOnChange(t) {
        this.onChange = (i) => {
          ((this.value = this._getOptionValue(i)), t(this.value));
        };
      }
      _registerOption() {
        return (this._idCounter++).toString();
      }
      _getOptionId(t) {
        for (let i of this._optionMap.keys())
          if (this._compareWith(this._optionMap.get(i), t)) return i;
        return null;
      }
      _getOptionValue(t) {
        let i = jv(t);
        return this._optionMap.has(i) ? this._optionMap.get(i) : t;
      }
      static {
        this.ɵfac = (() => {
          let t;
          return function (r) {
            return (t || (t = ht(e)))(r || e);
          };
        })();
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['select', 'formControlName', '', 3, 'multiple', ''],
            ['select', 'formControl', '', 3, 'multiple', ''],
            ['select', 'ngModel', '', 3, 'multiple', ''],
          ],
          hostBindings: function (i, r) {
            i & 1 &&
              E('change', function (s) {
                return r.onChange(s.target.value);
              })('blur', function () {
                return r.onTouched();
              });
          },
          inputs: { compareWith: 'compareWith' },
          features: [Ze([Lv]), Ee],
        });
      }
    }
    return e;
  })(),
  Wf = (() => {
    class e {
      constructor(t, i, r) {
        ((this._element = t),
          (this._renderer = i),
          (this._select = r),
          this._select && (this.id = this._select._registerOption()));
      }
      set ngValue(t) {
        this._select != null &&
          (this._select._optionMap.set(this.id, t),
          this._setElementValue(Hf(this.id, t)),
          this._select.writeValue(this._select.value));
      }
      set value(t) {
        (this._setElementValue(t), this._select && this._select.writeValue(this._select.value));
      }
      _setElementValue(t) {
        this._renderer.setProperty(this._element.nativeElement, 'value', t);
      }
      ngOnDestroy() {
        this._select &&
          (this._select._optionMap.delete(this.id), this._select.writeValue(this._select.value));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(Mt), L(Yt), L(Io, 9));
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [['option']],
          inputs: { ngValue: 'ngValue', value: 'value' },
        });
      }
    }
    return e;
  })(),
  Bv = { provide: Nn, useExisting: Re(() => Gf), multi: !0 };
function Sf(e, n) {
  return e == null
    ? `${n}`
    : (typeof n == 'string' && (n = `'${n}'`),
      n && typeof n == 'object' && (n = 'Object'),
      `${e}: ${n}`.slice(0, 50));
}
function Uv(e) {
  return e.split(':')[0];
}
var Gf = (() => {
    class e extends vi {
      constructor() {
        (super(...arguments),
          (this._optionMap = new Map()),
          (this._idCounter = 0),
          (this._compareWith = Object.is));
      }
      set compareWith(t) {
        this._compareWith = t;
      }
      writeValue(t) {
        this.value = t;
        let i;
        if (Array.isArray(t)) {
          let r = t.map((o) => this._getOptionId(o));
          i = (o, s) => {
            o._setSelected(r.indexOf(s.toString()) > -1);
          };
        } else
          i = (r, o) => {
            r._setSelected(!1);
          };
        this._optionMap.forEach(i);
      }
      registerOnChange(t) {
        this.onChange = (i) => {
          let r = [],
            o = i.selectedOptions;
          if (o !== void 0) {
            let s = o;
            for (let a = 0; a < s.length; a++) {
              let d = s[a],
                p = this._getOptionValue(d.value);
              r.push(p);
            }
          } else {
            let s = i.options;
            for (let a = 0; a < s.length; a++) {
              let d = s[a];
              if (d.selected) {
                let p = this._getOptionValue(d.value);
                r.push(p);
              }
            }
          }
          ((this.value = r), t(r));
        };
      }
      _registerOption(t) {
        let i = (this._idCounter++).toString();
        return (this._optionMap.set(i, t), i);
      }
      _getOptionId(t) {
        for (let i of this._optionMap.keys())
          if (this._compareWith(this._optionMap.get(i)._value, t)) return i;
        return null;
      }
      _getOptionValue(t) {
        let i = Uv(t);
        return this._optionMap.has(i) ? this._optionMap.get(i)._value : t;
      }
      static {
        this.ɵfac = (() => {
          let t;
          return function (r) {
            return (t || (t = ht(e)))(r || e);
          };
        })();
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['select', 'multiple', '', 'formControlName', ''],
            ['select', 'multiple', '', 'formControl', ''],
            ['select', 'multiple', '', 'ngModel', ''],
          ],
          hostBindings: function (i, r) {
            i & 1 &&
              E('change', function (s) {
                return r.onChange(s.target);
              })('blur', function () {
                return r.onTouched();
              });
          },
          inputs: { compareWith: 'compareWith' },
          features: [Ze([Bv]), Ee],
        });
      }
    }
    return e;
  })(),
  qf = (() => {
    class e {
      constructor(t, i, r) {
        ((this._element = t),
          (this._renderer = i),
          (this._select = r),
          this._select && (this.id = this._select._registerOption(this)));
      }
      set ngValue(t) {
        this._select != null &&
          ((this._value = t),
          this._setElementValue(Sf(this.id, t)),
          this._select.writeValue(this._select.value));
      }
      set value(t) {
        this._select
          ? ((this._value = t),
            this._setElementValue(Sf(this.id, t)),
            this._select.writeValue(this._select.value))
          : this._setElementValue(t);
      }
      _setElementValue(t) {
        this._renderer.setProperty(this._element.nativeElement, 'value', t);
      }
      _setSelected(t) {
        this._renderer.setProperty(this._element.nativeElement, 'selected', t);
      }
      ngOnDestroy() {
        this._select &&
          (this._select._optionMap.delete(this.id), this._select.writeValue(this._select.value));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)(L(Mt), L(Yt), L(Gf, 9));
        };
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [['option']],
          inputs: { ngValue: 'ngValue', value: 'value' },
        });
      }
    }
    return e;
  })();
function $v(e) {
  return typeof e == 'number' ? e : parseInt(e, 10);
}
function Hv(e) {
  return typeof e == 'number' ? e : parseFloat(e);
}
var nl = (() => {
  class e {
    constructor() {
      this._validator = vf;
    }
    ngOnChanges(t) {
      if (this.inputName in t) {
        let i = this.normalizeInput(t[this.inputName].currentValue);
        ((this._enabled = this.enabled(i)),
          (this._validator = this._enabled ? this.createValidator(i) : vf),
          this._onChange && this._onChange());
      }
    }
    validate(t) {
      return this._validator(t);
    }
    registerOnValidatorChange(t) {
      this._onChange = t;
    }
    enabled(t) {
      return t != null;
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵdir = ie({ type: e, features: [Yn] });
    }
  }
  return e;
})();
var Wv = { provide: Ci, useExisting: Re(() => il), multi: !0 },
  il = (() => {
    class e extends nl {
      constructor() {
        (super(...arguments),
          (this.inputName = 'min'),
          (this.normalizeInput = (t) => Hv(t)),
          (this.createValidator = (t) => dv(t)));
      }
      static {
        this.ɵfac = (() => {
          let t;
          return function (r) {
            return (t || (t = ht(e)))(r || e);
          };
        })();
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['input', 'type', 'number', 'min', '', 'formControlName', ''],
            ['input', 'type', 'number', 'min', '', 'formControl', ''],
            ['input', 'type', 'number', 'min', '', 'ngModel', ''],
          ],
          hostVars: 1,
          hostBindings: function (i, r) {
            i & 2 && ni('min', r._enabled ? r.min : null);
          },
          inputs: { min: 'min' },
          features: [Ze([Wv]), Ee],
        });
      }
    }
    return e;
  })(),
  Gv = { provide: Ci, useExisting: Re(() => rl), multi: !0 };
var rl = (() => {
  class e extends nl {
    constructor() {
      (super(...arguments),
        (this.inputName = 'required'),
        (this.normalizeInput = Qr),
        (this.createValidator = (t) => fv));
    }
    enabled(t) {
      return t;
    }
    static {
      this.ɵfac = (() => {
        let t;
        return function (r) {
          return (t || (t = ht(e)))(r || e);
        };
      })();
    }
    static {
      this.ɵdir = ie({
        type: e,
        selectors: [
          ['', 'required', '', 'formControlName', '', 3, 'type', 'checkbox'],
          ['', 'required', '', 'formControl', '', 3, 'type', 'checkbox'],
          ['', 'required', '', 'ngModel', '', 3, 'type', 'checkbox'],
        ],
        hostVars: 1,
        hostBindings: function (i, r) {
          i & 2 && ni('required', r._enabled ? '' : null);
        },
        inputs: { required: 'required' },
        features: [Ze([Gv]), Ee],
      });
    }
  }
  return e;
})();
var qv = { provide: Ci, useExisting: Re(() => ol), multi: !0 },
  ol = (() => {
    class e extends nl {
      constructor() {
        (super(...arguments),
          (this.inputName = 'maxlength'),
          (this.normalizeInput = (t) => $v(t)),
          (this.createValidator = (t) => pv(t)));
      }
      static {
        this.ɵfac = (() => {
          let t;
          return function (r) {
            return (t || (t = ht(e)))(r || e);
          };
        })();
      }
      static {
        this.ɵdir = ie({
          type: e,
          selectors: [
            ['', 'maxlength', '', 'formControlName', ''],
            ['', 'maxlength', '', 'formControl', ''],
            ['', 'maxlength', '', 'ngModel', ''],
          ],
          hostVars: 1,
          hostBindings: function (i, r) {
            i & 2 && ni('maxlength', r._enabled ? r.maxlength : null);
          },
          inputs: { maxlength: 'maxlength' },
          features: [Ze([qv]), Ee],
        });
      }
    }
    return e;
  })();
var zv = (() => {
  class e {
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵmod = Zt({ type: e });
    }
    static {
      this.ɵinj = zt({});
    }
  }
  return e;
})();
var zf = (() => {
  class e {
    static withConfig(t) {
      return { ngModule: e, providers: [{ provide: Ka, useValue: t.callSetDisabledState ?? Ja }] };
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵmod = Zt({ type: e });
    }
    static {
      this.ɵinj = zt({ imports: [zv] });
    }
  }
  return e;
})();
function Qv(e, n) {
  if ((e & 1 && (l(0, 'p', 16), u(1), c()), e & 2)) {
    let t = m();
    (f(), D(t.message));
  }
}
function Yv(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td')(2, 'strong'),
      u(3),
      c(),
      l(4, 'small'),
      u(5),
      c()(),
      l(6, 'td')(7, 'span', 22),
      u(8),
      c(),
      l(9, 'small'),
      u(10),
      c()(),
      l(11, 'td'),
      u(12),
      c(),
      l(13, 'td'),
      u(14),
      c(),
      l(15, 'td')(16, 'span', 23),
      u(17),
      c()(),
      l(18, 'td', 24)(19, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return v(o.test(r));
      }),
      u(20, 'Test'),
      c(),
      l(21, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return v(o.editProfile(r));
      }),
      u(22, 'Edit'),
      c(),
      l(23, 'button', 26),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return v(o.deleteProfile(r));
      }),
      u(24, 'Delete'),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(3),
      D(t.name),
      f(2),
      D(t.username || 'No username'),
      f(3),
      D(t.databaseType),
      f(2),
      D(t.databaseVersion || 'Version required \u2014 edit configuration'),
      f(2),
      D(t.authType),
      f(2),
      me('', t.host, ':', t.port, ''),
      f(2),
      de('on', t.tlsEnabled),
      f(),
      D(t.tlsEnabled ? 'Enabled' : 'Off'));
  }
}
function Kv(e, n) {
  e & 1 &&
    (l(0, 'tr')(1, 'td', 27),
    u(2, ' No configurations yet. Add your first database connection. '),
    c()());
}
function Jv(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'label'),
      u(1, 'Truststore path'),
      l(2, 'input', 47),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(3);
        return (T(o.profile.trustStorePath, r) || (o.profile.trustStorePath = r), v(r));
      }),
      c()());
  }
  if (e & 2) {
    let t = m(3);
    (f(2), S('ngModel', t.profile.trustStorePath));
  }
}
function Xv(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'label'),
      u(1, 'Keystore path'),
      l(2, 'input', 48),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(3);
        return (T(o.profile.keyStorePath, r) || (o.profile.keyStorePath = r), v(r));
      }),
      c()());
  }
  if (e & 2) {
    let t = m(3);
    (f(2), S('ngModel', t.profile.keyStorePath));
  }
}
function eC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 28)(1, 'form', 29),
      E('ngSubmit', function () {
        y(t);
        let r = m(2);
        return v(r.saveProfile());
      }),
      l(2, 'div', 30)(3, 'div')(4, 'p', 18),
      u(5),
      c(),
      l(6, 'h2'),
      u(7),
      c()(),
      l(8, 'button', 31),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.cancelProfile());
      }),
      u(9, '\xD7'),
      c()(),
      l(10, 'div', 32)(11, 'label'),
      u(12, 'Name'),
      l(13, 'input', 33),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.name, r) || (o.profile.name = r), v(r));
      }),
      c()(),
      l(14, 'label'),
      u(15, 'Database type'),
      l(16, 'select', 34),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.databaseType, r) || (o.profile.databaseType = r), v(r));
      }),
      E('ngModelChange', function () {
        y(t);
        let r = m(2);
        return v((r.profile.databaseVersion = ''));
      }),
      l(17, 'option'),
      u(18, 'SYBASE_ASE'),
      c(),
      l(19, 'option'),
      u(20, 'ORACLE'),
      c()()(),
      l(21, 'label'),
      u(22, 'Database version'),
      l(23, 'input', 35),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.databaseVersion, r) || (o.profile.databaseVersion = r), v(r));
      }),
      c()(),
      l(24, 'label'),
      u(25, 'Authentication'),
      l(26, 'select', 36),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.authType, r) || (o.profile.authType = r), v(r));
      }),
      l(27, 'option'),
      u(28, 'DB_SECRET'),
      c(),
      l(29, 'option'),
      u(30, 'CERTIFICATE'),
      c()()(),
      l(31, 'label'),
      u(32, 'Host'),
      l(33, 'input', 37),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.host, r) || (o.profile.host = r), v(r));
      }),
      c()(),
      l(34, 'label'),
      u(35, 'Port'),
      l(36, 'input', 38),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.port, r) || (o.profile.port = r), v(r));
      }),
      c()(),
      l(37, 'label'),
      u(38, 'Database (Sybase)'),
      l(39, 'input', 39),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.databaseName, r) || (o.profile.databaseName = r), v(r));
      }),
      c()(),
      l(40, 'label'),
      u(41, 'Service (Oracle)'),
      l(42, 'input', 40),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.serviceName, r) || (o.profile.serviceName = r), v(r));
      }),
      c()(),
      l(43, 'label'),
      u(44, 'Username'),
      l(45, 'input', 41),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.username, r) || (o.profile.username = r), v(r));
      }),
      c()(),
      l(46, 'label', 42)(47, 'input', 43),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.profile.tlsEnabled, r) || (o.profile.tlsEnabled = r), v(r));
      }),
      c(),
      u(48, ' Enable TLS'),
      c(),
      I(49, Jv, 3, 1, 'label', 13)(50, Xv, 3, 1, 'label', 13),
      c(),
      l(51, 'div', 44)(52, 'button', 45),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.cancelProfile());
      }),
      u(53, 'Cancel'),
      c(),
      l(54, 'button', 46),
      u(55, 'Save configuration'),
      c()()()());
  }
  if (e & 2) {
    let t = m(2);
    (f(5),
      A('', t.profile.id ? 'EDIT' : 'NEW', ' CONNECTION'),
      f(2),
      A('', t.profile.id ? 'Edit' : 'Add', ' configuration'),
      f(6),
      S('ngModel', t.profile.name),
      f(3),
      S('ngModel', t.profile.databaseType),
      f(7),
      S('ngModel', t.profile.databaseVersion),
      f(3),
      S('ngModel', t.profile.authType),
      f(7),
      S('ngModel', t.profile.host),
      f(3),
      S('ngModel', t.profile.port),
      f(3),
      S('ngModel', t.profile.databaseName),
      f(3),
      S('ngModel', t.profile.serviceName),
      f(3),
      S('ngModel', t.profile.username),
      f(2),
      S('ngModel', t.profile.tlsEnabled),
      f(2),
      _('ngIf', t.profile.authType === 'CERTIFICATE'),
      f(),
      _('ngIf', t.profile.authType === 'CERTIFICATE'),
      f(4),
      _('disabled', t.busy));
  }
}
function tC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'section')(1, 'div', 17)(2, 'div')(3, 'p', 18),
      u(4, 'CONNECTION MANAGEMENT'),
      c(),
      l(5, 'h2'),
      u(6, 'Manage reusable connections'),
      c(),
      l(7, 'p'),
      u(
        8,
        ' Create reusable Sybase and Oracle connection profiles. Credentials are never persisted. ',
      ),
      c()(),
      l(9, 'button', 6),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.addProfile());
      }),
      u(10, '+ Add configuration'),
      c()(),
      l(11, 'div', 19)(12, 'table')(13, 'thead')(14, 'tr')(15, 'th'),
      u(16, 'Name'),
      c(),
      l(17, 'th'),
      u(18, 'Database type / version'),
      c(),
      l(19, 'th'),
      u(20, 'Authentication'),
      c(),
      l(21, 'th'),
      u(22, 'Endpoint'),
      c(),
      l(23, 'th'),
      u(24, 'TLS'),
      c(),
      l(25, 'th', 20),
      u(26, 'Actions'),
      c()()(),
      l(27, 'tbody'),
      I(28, Yv, 25, 10, 'tr', 21)(29, Kv, 3, 0, 'tr', 13),
      c()()(),
      I(30, eC, 56, 15, 'div', 15),
      c());
  }
  if (e & 2) {
    let t = m();
    (f(28),
      _('ngForOf', t.profiles),
      f(),
      _('ngIf', !t.profiles.length),
      f(),
      _('ngIf', t.showProfileForm));
  }
}
function nC(e, n) {
  if ((e & 1 && (l(0, 'option', 63), u(1), c()), e & 2)) {
    let t = m().$implicit;
    (_('ngValue', t.id)('disabled', !t.databaseVersion),
      f(),
      rt(
        ' ',
        t.name,
        ' \xB7 ',
        t.databaseType,
        ' ',
        t.databaseVersion || 'Set version first',
        ' ',
      ));
  }
}
function iC(e, n) {
  if ((e & 1 && (mt(0), I(1, nC, 2, 5, 'option', 62), gt()), e & 2)) {
    let t = n.$implicit;
    (f(), _('ngIf', t.databaseType === 'SYBASE_ASE'));
  }
}
function rC(e, n) {
  if ((e & 1 && (l(0, 'option', 64), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('value', t), f(), A(' ', t, ' '));
  }
}
function oC(e, n) {
  if ((e & 1 && (l(0, 'p', 65), u(1), c()), e & 2)) {
    let t = m(2);
    (f(), A(' ', t.schemaLists.export.error, ' '));
  }
}
function sC(e, n) {
  if ((e & 1 && (l(0, 'p'), u(1), c()), e & 2)) {
    let t = m().$implicit;
    (f(), A('Detected: ', t.detectedVersion, ''));
  }
}
function aC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'button', 59),
      E('click', function () {
        y(t);
        let r = m().$implicit,
          o = m(2);
        return v(o.downloadSourceScript(r.id, r.schemaName ? 'schema.zip' : 'database.sql'));
      }),
      u(1),
      c());
  }
  if (e & 2) {
    let t = m().$implicit;
    (f(), A(' ', t.schemaName ? 'Download schema ZIP' : 'Download legacy SQL', ' '));
  }
}
function lC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 66)(1, 'h3'),
      u(2),
      l(3, 'span', 67),
      u(4),
      c()(),
      l(5, 'p'),
      u(6),
      Dn(7, 'date'),
      c(),
      I(8, sC, 2, 1, 'p', 13),
      l(9, 'p'),
      u(10),
      c(),
      l(11, 'p', 68),
      u(12),
      c(),
      l(13, 'div', 69),
      I(14, aC, 2, 1, 'button', 70),
      l(15, 'button', 59),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return v(o.downloadSourceScript(r.id, 'manifest.json'));
      }),
      u(16, ' Download manifest '),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(2),
      A(' ', t.name, ' '),
      f(2),
      D(t.status),
      f(2),
      Ia(
        ' ',
        t.databaseName,
        ' / ',
        t.schemaName || 'Legacy full-database export',
        ' \xB7 ',
        t.databaseType,
        ' ',
        t.configuredVersion,
        ' \xB7 ',
        bn(7, 11, t.createdAt, 'medium'),
        ' ',
      ),
      f(2),
      _('ngIf', t.detectedVersion),
      f(2),
      D(t.message),
      f(2),
      D(t.outputDirectory),
      f(2),
      _('ngIf', t.status === 'EXPORTED' || t.status === 'REVIEW_REQUIRED'));
  }
}
function cC(e, n) {
  e & 1 && (l(0, 'div', 71), u(1, 'No source exports yet.'), c());
}
function uC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'section')(1, 'div', 17)(2, 'div')(3, 'p', 18),
      u(4, 'STEP 1 \xB7 NATIVE SOURCE DDL'),
      c(),
      l(5, 'h2'),
      u(6, 'Generate Sybase schema scripts'),
      c(),
      l(7, 'p'),
      u(
        8,
        ' Select a source connection and choose a schema/owner fetched from that database. Scripts are grouped by object type. Table row data is not included. ',
      ),
      c()()(),
      l(9, 'form', 49),
      E('ngSubmit', function () {
        y(t);
        let r = m();
        return v(r.generateSourceScripts());
      }),
      l(10, 'label'),
      u(11, 'Export name'),
      l(12, 'input', 50),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.sourceExport.name, r) || (o.sourceExport.name = r), v(r));
      }),
      c()(),
      l(13, 'label'),
      u(14, 'Source database'),
      l(15, 'select', 51),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.sourceExport.sourceProfileId, r) || (o.sourceExport.sourceProfileId = r), v(r));
      }),
      E('ngModelChange', function () {
        y(t);
        let r = m();
        return v(r.loadSchemas('export'));
      }),
      l(16, 'option', 52),
      u(17, 'Select Sybase configuration'),
      c(),
      I(18, iC, 2, 1, 'ng-container', 21),
      c()(),
      l(19, 'label'),
      u(20, 'Source schema'),
      l(21, 'select', 53),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.sourceExport.sourceSchema, r) || (o.sourceExport.sourceSchema = r), v(r));
      }),
      l(22, 'option', 54),
      u(23),
      c(),
      I(24, rC, 2, 2, 'option', 55),
      c()(),
      l(25, 'button', 56),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.loadSchemas('export'));
      }),
      u(26, ' Reload schemas '),
      c(),
      I(27, oC, 2, 1, 'p', 57),
      l(28, 'button', 46),
      u(29, ' Generate Sybase scripts '),
      c()(),
      l(30, 'p', 16),
      u(
        31,
        ' Set the source version and credentials in DB Configurations, then select a schema here. Supported ASE version families: 15.7, 16.0 and 16.1. The backend requires SAP ddlgen libraries. TLS and custom connection parameters are not yet supported for native export. ',
      ),
      c(),
      l(32, 'div', 58)(33, 'h2'),
      u(34, 'Source exports'),
      c(),
      l(35, 'button', 59),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.loadSourceExports());
      }),
      u(36, 'Refresh'),
      c()(),
      I(37, lC, 17, 14, 'div', 60)(38, cC, 2, 0, 'div', 61),
      c());
  }
  if (e & 2) {
    let t = m();
    (f(12),
      S('ngModel', t.sourceExport.name),
      f(3),
      S('ngModel', t.sourceExport.sourceProfileId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.profiles),
      f(3),
      S('ngModel', t.sourceExport.sourceSchema),
      _('disabled', t.schemaLists.export.loading || !t.schemaLists.export.names.length),
      f(2),
      A(' ', t.schemaLists.export.loading ? 'Loading schemas\u2026' : 'Select schema', ' '),
      f(),
      _('ngForOf', t.schemaLists.export.names),
      f(),
      _('disabled', !t.sourceExport.sourceProfileId || t.schemaLists.export.loading),
      f(2),
      _('ngIf', t.schemaLists.export.error),
      f(),
      _(
        'disabled',
        t.exporting ||
          t.schemaLists.export.loading ||
          !t.sourceExport.sourceSchema ||
          !t.sourceExport.name.trim(),
      ),
      f(9),
      _('ngForOf', t.sourceExports),
      f(),
      _('ngIf', !t.sourceExports.length));
  }
}
function dC(e, n) {
  if ((e & 1 && (l(0, 'option', 82), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.id)('hidden', t.databaseType !== 'SYBASE_ASE'), f(), A(' ', t.name, ' '));
  }
}
function fC(e, n) {
  if ((e & 1 && (l(0, 'option', 82), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.id)('hidden', t.databaseType !== 'ORACLE'), f(), A(' ', t.name, ' '));
  }
}
function pC(e, n) {
  if ((e & 1 && (l(0, 'option', 64), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('value', t), f(), A(' ', t, ' '));
  }
}
function hC(e, n) {
  if ((e & 1 && (l(0, 'p', 65), u(1), c()), e & 2)) {
    let t = m(2);
    (f(), A(' ', t.schemaLists.migration.error, ' '));
  }
}
function mC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'label')(1, 'input', 84),
      E('change', function (r) {
        let o = y(t).$implicit,
          s = m(3);
        return v(s.toggle(o, r));
      }),
      c(),
      l(2, 'span'),
      u(3),
      c(),
      u(4),
      c());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(3), D(t.type), f(), A(' ', t.name, ''));
  }
}
function gC(e, n) {
  if ((e & 1 && (l(0, 'div', 83), I(1, mC, 5, 2, 'label', 21), c()), e & 2)) {
    let t = m(2);
    (f(), _('ngForOf', t.objects));
  }
}
function _C(e, n) {
  if (
    (e & 1 &&
      (l(0, 'div', 85)(1, 'div', 66)(2, 'h3'),
      u(3, 'Generated units'),
      c(),
      l(4, 'div', 86),
      te(5, 'i', 87)(6, 'i', 88),
      c(),
      l(7, 'div', 89)(8, 'span'),
      te(9, 'b', 90),
      u(10),
      c(),
      l(11, 'span'),
      te(12, 'b', 91),
      u(13),
      c()()(),
      l(14, 'div', 66)(15, 'h3'),
      u(16, 'Job status distribution'),
      c(),
      l(17, 'div', 92)(18, 'label'),
      u(19, 'Running '),
      l(20, 'i'),
      te(21, 'b'),
      c(),
      l(22, 'em'),
      u(23),
      c()(),
      l(24, 'label'),
      u(25, 'Completed '),
      l(26, 'i'),
      te(27, 'b'),
      c(),
      l(28, 'em'),
      u(29),
      c()(),
      l(30, 'label'),
      u(31, 'With errors '),
      l(32, 'i'),
      te(33, 'b', 93),
      c(),
      l(34, 'em'),
      u(35),
      c()()()()()),
    e & 2)
  ) {
    let t = m(2);
    (f(5),
      je('width', t.successWidth(), '%'),
      f(),
      je('width', t.failedWidth(), '%'),
      f(4),
      A('', t.successWidth(), '% successful'),
      f(3),
      A('', t.failedWidth(), '% failed'),
      f(8),
      je('width', (t.statusCount('RUNNING') * 100) / t.jobs.length, '%'),
      f(2),
      D(t.statusCount('RUNNING')),
      f(4),
      je('width', (t.statusCount('COMPLETED') * 100) / t.jobs.length, '%'),
      f(2),
      D(t.statusCount('COMPLETED')),
      f(4),
      je('width', (t.statusCount('COMPLETED_WITH_ERRORS') * 100) / t.jobs.length, '%'),
      f(2),
      D(t.statusCount('COMPLETED_WITH_ERRORS')));
  }
}
function yC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'button', 100),
      E('click', function () {
        y(t);
        let r = m().$implicit,
          o = m(2);
        return v(o.action(r, 'resume'));
      }),
      u(1, ' Resume'),
      c());
  }
}
function vC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'button', 100),
      E('click', function () {
        y(t);
        let r = m().$implicit,
          o = m(2);
        return v(o.action(r, 'retry'));
      }),
      u(1, ' Retry failures'),
      c());
  }
}
function CC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'button', 100),
      E('click', function () {
        y(t);
        let r = m().$implicit,
          o = m(2);
        return v(o.manifest(r));
      }),
      u(1, ' Download log'),
      c());
  }
}
function EC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 94)(1, 'div')(2, 'strong'),
      u(3),
      c(),
      l(4, 'small'),
      u(5),
      c()(),
      l(6, 'span', 67),
      u(7),
      c(),
      l(8, 'span'),
      u(9),
      c(),
      l(10, 'div', 95),
      te(11, 'i'),
      c(),
      l(12, 'strong', 96),
      u(13),
      c(),
      l(14, 'div', 69),
      I(15, yC, 2, 0, 'button', 97)(16, vC, 2, 0, 'button', 97)(17, CC, 2, 0, 'button', 97),
      l(18, 'label', 98),
      u(19, 'Upload log'),
      l(20, 'input', 99),
      E('change', function (r) {
        let o = y(t).$implicit,
          s = m(2);
        return v(s.upload(o, r));
      }),
      c()()()());
  }
  if (e & 2) {
    let t = n.$implicit,
      i = m(2);
    (f(3),
      D(t.name),
      f(2),
      me('', t.sourceProfile.name, ' \u2192 ', t.targetProfile.name, ''),
      f(2),
      D(t.status),
      f(2),
      rt(
        '',
        t.currentPhase || '\u2014',
        ' \xB7 ',
        t.completedUnits,
        ' complete \xB7 ',
        t.failedUnits,
        ' failed',
      ),
      f(2),
      je('width', i.progress(t), '%'),
      f(2),
      A('', i.progress(t), '%'),
      f(2),
      _('ngIf', t.status === 'INTERRUPTED' || t.status === 'FAILED'),
      f(),
      _('ngIf', t.failedUnits),
      f(),
      _('ngIf', t.failedUnits));
  }
}
function DC(e, n) {
  e & 1 && (l(0, 'div', 71), u(1, 'No migration jobs have been created.'), c());
}
function bC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'section')(1, 'div', 17)(2, 'div')(3, 'p', 18),
      u(4, 'SCRIPT GENERATION'),
      c(),
      l(5, 'h2'),
      u(6, 'Prepare ordered migration scripts'),
      c(),
      l(7, 'p'),
      u(8, 'Select the source and target, discover objects, and generate ordered scripts.'),
      c()()(),
      l(9, 'div', 72)(10, 'label'),
      u(11, 'Migration name'),
      l(12, 'input', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.job.name, r) || (o.job.name = r), v(r));
      }),
      c()(),
      l(13, 'label'),
      u(14, 'Sybase source'),
      l(15, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.job.sourceProfileId, r) || (o.job.sourceProfileId = r), v(r));
      }),
      E('ngModelChange', function () {
        y(t);
        let r = m();
        return v(r.loadSchemas('migration'));
      }),
      l(16, 'option', 52),
      u(17, 'Select'),
      c(),
      I(18, dC, 2, 3, 'option', 74),
      c()(),
      l(19, 'label'),
      u(20, 'Oracle target'),
      l(21, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.job.targetProfileId, r) || (o.job.targetProfileId = r), v(r));
      }),
      E('ngModelChange', function (r) {
        y(t);
        let o = m();
        return v(o.ensureCredentials([r]));
      }),
      l(22, 'option', 52),
      u(23, 'Select'),
      c(),
      I(24, fC, 2, 3, 'option', 74),
      c()(),
      l(25, 'label'),
      u(26, 'Source schema'),
      l(27, 'select', 75),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.job.sourceSchema, r) || (o.job.sourceSchema = r), v(r));
      }),
      E('ngModelChange', function () {
        y(t);
        let r = m();
        return v(r.clearMigrationObjects());
      }),
      l(28, 'option', 54),
      u(29),
      c(),
      I(30, pC, 2, 2, 'option', 55),
      c()(),
      l(31, 'button', 76),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.loadSchemas('migration'));
      }),
      u(32, ' Reload schemas '),
      c(),
      I(33, hC, 2, 1, 'p', 57),
      l(34, 'label', 42)(35, 'input', 77),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.job.entireSchema, r) || (o.job.entireSchema = r), v(r));
      }),
      c(),
      u(36, ' Entire schema'),
      c(),
      l(37, 'label', 42)(38, 'input', 77),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.job.overwrite, r) || (o.job.overwrite = r), v(r));
      }),
      c(),
      u(39, ' Overwrite existing scripts'),
      c(),
      l(40, 'button', 76),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.discover());
      }),
      u(41, ' Discover objects'),
      c(),
      l(42, 'button', 78),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.createAndStart());
      }),
      u(43, ' Generate scripts '),
      c()(),
      I(44, gC, 2, 1, 'div', 79),
      l(45, 'div', 58)(46, 'div')(47, 'p', 18),
      u(48, 'LIVE STATUS'),
      c(),
      l(49, 'h2'),
      u(50, 'Migration progress'),
      c()(),
      l(51, 'p'),
      u(52, 'Refreshes every five seconds'),
      c()(),
      I(53, _C, 36, 15, 'div', 80)(54, EC, 21, 13, 'div', 81)(55, DC, 2, 0, 'div', 61),
      c());
  }
  if (e & 2) {
    let t = m();
    (f(12),
      S('ngModel', t.job.name),
      f(3),
      S('ngModel', t.job.sourceProfileId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.profiles),
      f(3),
      S('ngModel', t.job.targetProfileId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.profiles),
      f(3),
      S('ngModel', t.job.sourceSchema),
      _('disabled', t.schemaLists.migration.loading || !t.schemaLists.migration.names.length),
      f(2),
      A(' ', t.schemaLists.migration.loading ? 'Loading schemas\u2026' : 'Select schema', ' '),
      f(),
      _('ngForOf', t.schemaLists.migration.names),
      f(),
      _('disabled', !t.job.sourceProfileId || t.schemaLists.migration.loading),
      f(2),
      _('ngIf', t.schemaLists.migration.error),
      f(2),
      S('ngModel', t.job.entireSchema),
      f(3),
      S('ngModel', t.job.overwrite),
      f(2),
      _('disabled', t.schemaLists.migration.loading || !t.job.sourceSchema),
      f(2),
      _(
        'disabled',
        t.schemaLists.migration.loading || !t.job.sourceSchema || !t.job.targetProfileId,
      ),
      f(2),
      _('ngIf', t.objects.length && !t.job.entireSchema),
      f(9),
      _('ngIf', t.jobs.length),
      f(),
      _('ngForOf', t.jobs),
      f(),
      _('ngIf', !t.jobs.length));
  }
}
function wC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td')(2, 'strong'),
      u(3),
      c()(),
      l(4, 'td'),
      u(5),
      Dn(6, 'date'),
      c(),
      l(7, 'td'),
      u(8),
      l(9, 'small'),
      u(10),
      c()(),
      l(11, 'td'),
      u(12),
      l(13, 'small'),
      u(14),
      c()(),
      l(15, 'td'),
      u(16),
      c(),
      l(17, 'td'),
      u(18),
      c(),
      l(19, 'td', 101)(20, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return (o.navigate('quantitative-reconciliation'), v(o.selectReconciliation(r)));
      }),
      u(21, ' Reload'),
      c(),
      l(22, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return v(o.downloadReport(r.reportId));
      }),
      u(23, ' Download XLSX '),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(3),
      D(t.reportId),
      f(2),
      D(bn(6, 10, t.generatedAt, 'medium')),
      f(3),
      A(' ', t.source.configurationName, ''),
      f(2),
      me('', t.source.databaseOrService, ' / ', t.source.schema, ''),
      f(2),
      A(' ', t.target.configurationName, ''),
      f(2),
      me('', t.target.databaseOrService, ' / ', t.target.schema, ''),
      f(2),
      D(t.matched),
      f(2),
      D(t.mismatched));
  }
}
function IC(e, n) {
  e & 1 && (l(0, 'tr')(1, 'td', 102), u(2, 'No quantitative reports.'), c()());
}
function xC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td')(2, 'strong'),
      u(3),
      c(),
      l(4, 'small'),
      u(5),
      c()(),
      l(6, 'td'),
      u(7),
      Dn(8, 'date'),
      c(),
      l(9, 'td'),
      u(10),
      c(),
      l(11, 'td'),
      u(12),
      c(),
      l(13, 'td'),
      u(14),
      c(),
      l(15, 'td', 101)(16, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return v(o.reloadQualitative(r.reportId));
      }),
      u(17, ' Reload'),
      c(),
      l(18, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return v(o.downloadQualitative(r.reportId));
      }),
      u(19, ' Download ZIP '),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(3),
      D(t.reportId),
      f(2),
      D(t.batchName),
      f(2),
      D(bn(8, 6, t.generatedAt, 'medium')),
      f(3),
      D(t.source.name),
      f(2),
      D(t.target.name),
      f(2),
      D(t.status));
  }
}
function SC(e, n) {
  e & 1 && (l(0, 'tr')(1, 'td', 27), u(2, 'No qualitative reports.'), c()());
}
function MC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'section')(1, 'div', 17)(2, 'div')(3, 'p', 18),
      u(4, 'REPORT LIBRARY'),
      c(),
      l(5, 'h2'),
      u(6, 'Review generated results'),
      c(),
      l(7, 'p'),
      u(8, 'Reload completed reports or download their stored XLSX workbooks.'),
      c()()(),
      l(9, 'div', 58)(10, 'div')(11, 'p', 18),
      u(12, 'QUANTITATIVE'),
      c(),
      l(13, 'h2'),
      u(14, 'Quantitative reports'),
      c()(),
      l(15, 'button', 6),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.navigate('quantitative-reconciliation'));
      }),
      u(16, 'New report'),
      c()(),
      l(17, 'div', 19)(18, 'table')(19, 'thead')(20, 'tr')(21, 'th'),
      u(22, 'Report'),
      c(),
      l(23, 'th'),
      u(24, 'Generated'),
      c(),
      l(25, 'th'),
      u(26, 'Source'),
      c(),
      l(27, 'th'),
      u(28, 'Target'),
      c(),
      l(29, 'th'),
      u(30, 'Matched'),
      c(),
      l(31, 'th'),
      u(32, 'Mismatched'),
      c(),
      l(33, 'th'),
      u(34, 'Actions'),
      c()()(),
      l(35, 'tbody'),
      I(36, wC, 24, 13, 'tr', 21)(37, IC, 3, 0, 'tr', 13),
      c()()(),
      l(38, 'div', 58)(39, 'div')(40, 'p', 18),
      u(41, 'QUALITATIVE'),
      c(),
      l(42, 'h2'),
      u(43, 'Qualitative reports'),
      c()(),
      l(44, 'button', 59),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.navigate('qualitative-reconciliation'));
      }),
      u(45, ' Open qualitative recon '),
      c()(),
      l(46, 'div', 19)(47, 'table')(48, 'thead')(49, 'tr')(50, 'th'),
      u(51, 'Report'),
      c(),
      l(52, 'th'),
      u(53, 'Generated'),
      c(),
      l(54, 'th'),
      u(55, 'Source'),
      c(),
      l(56, 'th'),
      u(57, 'Target'),
      c(),
      l(58, 'th'),
      u(59, 'Status'),
      c(),
      l(60, 'th'),
      u(61, 'Actions'),
      c()()(),
      l(62, 'tbody'),
      I(63, xC, 20, 9, 'tr', 21)(64, SC, 3, 0, 'tr', 13),
      c()()()());
  }
  if (e & 2) {
    let t = m();
    (f(36),
      _('ngForOf', t.reconciliationRuns),
      f(),
      _('ngIf', !t.reconciliationRuns.length),
      f(26),
      _('ngForOf', t.qualReports),
      f(),
      _('ngIf', !t.qualReports.length));
  }
}
function TC(e, n) {
  if ((e & 1 && (l(0, 'option', 82), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.id)('hidden', t.databaseType !== 'SYBASE_ASE'), f(), A(' ', t.name, ' '));
  }
}
function AC(e, n) {
  if ((e & 1 && (l(0, 'option', 82), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.id)('hidden', t.databaseType !== 'ORACLE'), f(), A(' ', t.name, ' '));
  }
}
function NC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td')(2, 'strong'),
      u(3),
      c()(),
      l(4, 'td'),
      u(5),
      Dn(6, 'date'),
      c(),
      l(7, 'td'),
      u(8),
      l(9, 'small'),
      u(10),
      c()(),
      l(11, 'td'),
      u(12),
      l(13, 'small'),
      u(14),
      c()(),
      l(15, 'td'),
      u(16),
      c(),
      l(17, 'td'),
      u(18),
      c(),
      l(19, 'td'),
      u(20),
      c(),
      l(21, 'td', 101)(22, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return v(o.selectReconciliation(r));
      }),
      u(23, 'Reload'),
      c(),
      l(24, 'button', 105),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(2);
        return v(o.downloadReport(r.reportId));
      }),
      u(25, ' Download XLSX '),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(3),
      D(t.reportId),
      f(2),
      D(bn(6, 12, t.generatedAt, 'medium')),
      f(3),
      A(' ', t.source.configurationName, ''),
      f(2),
      me('', t.source.databaseOrService, ' / ', t.source.schema, ''),
      f(2),
      A(' ', t.target.configurationName, ''),
      f(2),
      me('', t.target.databaseOrService, ' / ', t.target.schema, ''),
      f(2),
      D(t.matched),
      f(2),
      D(t.mismatched),
      f(2),
      D(t.status),
      f(4),
      _('disabled', !t.downloadable));
  }
}
function RC(e, n) {
  e & 1 && (l(0, 'tr')(1, 'td', 106), u(2, 'No saved quantitative reports.'), c()());
}
function OC(e, n) {
  if (
    (e & 1 &&
      (l(0, 'div', 107)(1, 'div')(2, 'strong'),
      u(3),
      c(),
      l(4, 'small'),
      u(5, 'The JSON and XLSX pair is created when processing completes.'),
      c()(),
      l(6, 'span', 67),
      u(7),
      c()()),
    e & 2)
  ) {
    let t = m(2);
    (f(3), D(t.activeRun.reportId), f(4), D(t.activeRun.status));
  }
}
function PC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 107)(1, 'div')(2, 'strong'),
      u(3),
      c(),
      l(4, 'small'),
      u(5),
      c()(),
      l(6, 'div', 101)(7, 'span', 67),
      u(8),
      c(),
      l(9, 'button', 25),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.downloadReport(r.activeReconciliation.reportId));
      }),
      u(10, ' Download XLSX '),
      c()()());
  }
  if (e & 2) {
    let t = m(2);
    (f(3),
      D(t.activeReconciliation.reportId),
      f(2),
      qr(
        '',
        t.activeReconciliation.source.configurationName,
        ' / ',
        t.activeReconciliation.source.schema,
        ' \u2192 ',
        t.activeReconciliation.target.configurationName,
        ' / ',
        t.activeReconciliation.target.schema,
        '',
      ),
      f(3),
      D(t.activeReconciliation.status));
  }
}
function FC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'button', 116),
      E('click', function () {
        y(t);
        let r = m().$implicit,
          o = m(3);
        return v(o.openDetails(r));
      }),
      u(1, ' Details'),
      c());
  }
}
function kC(e, n) {
  e & 1 && (l(0, 'span'), u(1, '\u2014'), c());
}
function VC(e, n) {
  if (
    (e & 1 &&
      (l(0, 'tr')(1, 'td')(2, 'strong'),
      u(3),
      c()(),
      l(4, 'td'),
      u(5),
      c(),
      l(6, 'td'),
      u(7),
      c(),
      l(8, 'td')(9, 'span', 114),
      u(10),
      c(),
      u(11),
      c(),
      l(12, 'td'),
      I(13, FC, 2, 0, 'button', 115)(14, kC, 2, 0, 'span', 13),
      c()()),
    e & 2)
  ) {
    let t = n.$implicit;
    (f(3),
      D(t.objectType),
      f(2),
      D(t.sourceCount),
      f(2),
      D(t.targetCount),
      f(2),
      de('mismatch', !t.matched),
      f(),
      D(t.matched ? '\u2713' : '\xD7'),
      f(),
      A(' ', t.matched ? 'Matched' : 'Mismatch', ' '),
      f(2),
      _('ngIf', !t.matched),
      f(),
      _('ngIf', t.matched));
  }
}
function LC(e, n) {
  if ((e & 1 && (l(0, 'small'), u(1), c()), e & 2)) {
    let t = m().$implicit;
    (f(), D(t.errorMessage));
  }
}
function jC(e, n) {
  if (
    (e & 1 &&
      (l(0, 'tr')(1, 'td')(2, 'strong'),
      u(3),
      c()(),
      l(4, 'td'),
      u(5),
      c(),
      l(6, 'td'),
      u(7),
      c(),
      l(8, 'td')(9, 'span', 114),
      u(10),
      c(),
      u(11),
      I(12, LC, 2, 1, 'small', 13),
      c()()),
    e & 2)
  ) {
    let t,
      i,
      r = n.$implicit;
    (f(3),
      D(r.tableName),
      f(2),
      D((t = r.sourceCount) !== null && t !== void 0 ? t : 'Missing'),
      f(2),
      D((i = r.targetCount) !== null && i !== void 0 ? i : 'Missing'),
      f(2),
      de('mismatch', r.status !== 'MATCHED'),
      f(),
      D(r.status === 'MATCHED' ? '\u2713' : '\xD7'),
      f(),
      A(' ', r.status, ''),
      f(),
      _('ngIf', r.errorMessage));
  }
}
function BC(e, n) {
  e & 1 && (l(0, 'tr')(1, 'td', 117), u(2, 'No table results.'), c()());
}
function UC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 118)(1, 'button', 76),
      E('click', function () {
        y(t);
        let r = m(3);
        return v(r.loadTableCounts(r.tableCounts.number - 1));
      }),
      u(2, ' Previous'),
      c(),
      l(3, 'span'),
      u(4),
      c(),
      l(5, 'button', 76),
      E('click', function () {
        y(t);
        let r = m(3);
        return v(r.loadTableCounts(r.tableCounts.number + 1));
      }),
      u(6, ' Next '),
      c()());
  }
  if (e & 2) {
    let t = m(3);
    (f(),
      _('disabled', t.tableCounts.number === 0),
      f(3),
      rt(
        'Page ',
        t.tableCounts.number + 1,
        ' of ',
        t.tableCounts.totalPages,
        ' \xB7 ',
        t.tableCounts.totalElements,
        ' tables',
      ),
      f(),
      _('disabled', t.tableCounts.number + 1 >= t.tableCounts.totalPages));
  }
}
function $C(e, n) {
  if (e & 1) {
    let t = R();
    (mt(0),
      l(1, 'div', 108)(2, 'div', 66)(3, 'h3'),
      u(4, 'Object matching'),
      c(),
      l(5, 'div', 109)(6, 'div', 110),
      u(7),
      c(),
      l(8, 'div', 111)(9, 'span'),
      te(10, 'b', 90),
      u(11),
      c(),
      l(12, 'span'),
      te(13, 'b', 91),
      u(14),
      c()()()(),
      l(15, 'div', 66)(16, 'h3'),
      u(17, 'Record-count matching'),
      c(),
      l(18, 'div', 109)(19, 'div', 110),
      u(20),
      c(),
      l(21, 'div', 111)(22, 'span'),
      te(23, 'b', 90),
      u(24),
      c(),
      l(25, 'span'),
      te(26, 'b', 91),
      u(27),
      c()()()()(),
      l(28, 'div', 58)(29, 'div')(30, 'p', 18),
      u(31, 'OBJECT INVENTORY'),
      c(),
      l(32, 'h2'),
      u(33, 'Object counts'),
      c()()(),
      l(34, 'div', 19)(35, 'table')(36, 'thead')(37, 'tr')(38, 'th'),
      u(39, 'Object type'),
      c(),
      l(40, 'th'),
      u(41, 'Source count'),
      c(),
      l(42, 'th'),
      u(43, 'Target count'),
      c(),
      l(44, 'th'),
      u(45, 'Result'),
      c(),
      l(46, 'th'),
      u(47, 'Details'),
      c()()(),
      l(48, 'tbody'),
      I(49, VC, 15, 9, 'tr', 21),
      c()()(),
      l(50, 'div', 58)(51, 'div')(52, 'p', 18),
      u(53, 'TABLE DATA'),
      c(),
      l(54, 'h2'),
      u(55, 'Record counts'),
      c()(),
      l(56, 'label', 112),
      u(57, 'Rows per page'),
      l(58, 'select', 73),
      E('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return v(o.changeTableSize(r));
      }),
      l(59, 'option', 52),
      u(60, '10'),
      c(),
      l(61, 'option', 52),
      u(62, '25'),
      c(),
      l(63, 'option', 52),
      u(64, '50'),
      c()()()(),
      l(65, 'div', 19)(66, 'table')(67, 'thead')(68, 'tr')(69, 'th'),
      u(70, 'Table'),
      c(),
      l(71, 'th'),
      u(72, 'Source records'),
      c(),
      l(73, 'th'),
      u(74, 'Target records'),
      c(),
      l(75, 'th'),
      u(76, 'Result'),
      c()()(),
      l(77, 'tbody'),
      I(78, jC, 13, 8, 'tr', 21)(79, BC, 3, 0, 'tr', 13),
      c()()(),
      I(80, UC, 7, 5, 'div', 113),
      gt());
  }
  if (e & 2) {
    let t = m(2);
    (f(6),
      je('--matched', t.objectChartWidth(!0) + '%'),
      f(),
      A(' ', t.objectChartWidth(!0), '% '),
      f(4),
      A('', t.objectMatchCount(!0), ' matched'),
      f(3),
      A('', t.objectMatchCount(!1), ' mismatched'),
      f(5),
      je(
        '--matched',
        (t.allTableCounts.length ? (t.recordMatchCount(!0) * 100) / t.allTableCounts.length : 0) +
          '%',
      ),
      f(),
      me(' ', t.recordMatchCount(!0), ' / ', t.allTableCounts.length, ' '),
      f(4),
      A('', t.recordMatchCount(!0), ' matched'),
      f(3),
      A('', t.recordMatchCount(!1), ' mismatched/errors'),
      f(22),
      _('ngForOf', t.objectCounts),
      f(9),
      _('ngModel', t.tableCounts.size),
      f(),
      _('ngValue', 10),
      f(2),
      _('ngValue', 25),
      f(2),
      _('ngValue', 50),
      f(15),
      _('ngForOf', t.tableCounts.content),
      f(),
      _('ngIf', !t.tableCounts.content.length),
      f(),
      _('ngIf', t.tableCounts.totalPages > 1));
  }
}
function HC(e, n) {
  if ((e & 1 && (l(0, 'tr')(1, 'td'), u(2), c()()), e & 2)) {
    let t = n.$implicit;
    (f(2), D(t));
  }
}
function WC(e, n) {
  e & 1 && (l(0, 'tr')(1, 'td', 123), u(2, 'None'), c()());
}
function GC(e, n) {
  if ((e & 1 && (l(0, 'tr')(1, 'td'), u(2), c()()), e & 2)) {
    let t = n.$implicit;
    (f(2), D(t));
  }
}
function qC(e, n) {
  e & 1 && (l(0, 'tr')(1, 'td', 123), u(2, 'None'), c()());
}
function zC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 28)(1, 'div', 119)(2, 'div', 30)(3, 'div')(4, 'p', 18),
      u(5, 'OBJECT DETAILS'),
      c(),
      l(6, 'h2'),
      u(7),
      c()(),
      l(8, 'button', 120),
      E('click', function () {
        y(t);
        let r = m(2);
        return v((r.details = void 0));
      }),
      u(9, '\xD7'),
      c()(),
      l(10, 'label', 112),
      u(11, 'Rows per grid'),
      l(12, 'select', 73),
      E('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return v(o.changeDetailSize(r));
      }),
      l(13, 'option', 52),
      u(14, '10'),
      c(),
      l(15, 'option', 52),
      u(16, '25'),
      c(),
      l(17, 'option', 52),
      u(18, '50'),
      c()()(),
      l(19, 'div', 121)(20, 'div')(21, 'h3'),
      u(22, 'Missing in source'),
      c(),
      l(23, 'table')(24, 'thead')(25, 'tr')(26, 'th'),
      u(27, 'Target-only object'),
      c()()(),
      l(28, 'tbody'),
      I(29, HC, 3, 1, 'tr', 21)(30, WC, 3, 0, 'tr', 13),
      c()(),
      l(31, 'div', 122)(32, 'button', 78),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.loadDetail('source', r.missingSource.page - 1));
      }),
      u(33, ' \u2039'),
      c(),
      l(34, 'span'),
      u(35),
      c(),
      l(36, 'button', 78),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.loadDetail('source', r.missingSource.page + 1));
      }),
      u(37, ' \u203A '),
      c()()(),
      l(38, 'div')(39, 'h3'),
      u(40, 'Missing in target'),
      c(),
      l(41, 'table')(42, 'thead')(43, 'tr')(44, 'th'),
      u(45, 'Source-only object'),
      c()()(),
      l(46, 'tbody'),
      I(47, GC, 3, 1, 'tr', 21)(48, qC, 3, 0, 'tr', 13),
      c()(),
      l(49, 'div', 122)(50, 'button', 78),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.loadDetail('target', r.missingTarget.page - 1));
      }),
      u(51, ' \u2039'),
      c(),
      l(52, 'span'),
      u(53),
      c(),
      l(54, 'button', 78),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.loadDetail('target', r.missingTarget.page + 1));
      }),
      u(55, ' \u203A '),
      c()()()()()());
  }
  if (e & 2) {
    let t = m(2);
    (f(7),
      A('', t.details.objectType, ' differences'),
      f(5),
      _('ngModel', t.detailSize),
      f(),
      _('ngValue', 10),
      f(2),
      _('ngValue', 25),
      f(2),
      _('ngValue', 50),
      f(12),
      _('ngForOf', t.missingSource.content),
      f(),
      _('ngIf', !t.missingSource.content.length),
      f(2),
      _('disabled', t.missingSource.page === 0),
      f(3),
      me('', t.missingSource.page + 1, ' / ', t.missingSource.totalPages || 1, ''),
      f(),
      _('disabled', t.missingSource.page + 1 >= t.missingSource.totalPages),
      f(11),
      _('ngForOf', t.missingTarget.content),
      f(),
      _('ngIf', !t.missingTarget.content.length),
      f(2),
      _('disabled', t.missingTarget.page === 0),
      f(3),
      me('', t.missingTarget.page + 1, ' / ', t.missingTarget.totalPages || 1, ''),
      f(),
      _('disabled', t.missingTarget.page + 1 >= t.missingTarget.totalPages));
  }
}
function ZC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'section')(1, 'div', 17)(2, 'div')(3, 'p', 18),
      u(4, 'SOURCE \u2194 TARGET'),
      c(),
      l(5, 'h2'),
      u(6, 'Compare structural totals'),
      c(),
      l(7, 'p'),
      u(8, 'Compare database object inventories and table record counts.'),
      c()()(),
      l(9, 'div', 103)(10, 'label'),
      u(11, 'Sybase source'),
      l(12, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.recon.sourceProfileId, r) || (o.recon.sourceProfileId = r), v(r));
      }),
      E('ngModelChange', function (r) {
        y(t);
        let o = m();
        return v(o.ensureCredentials([r]));
      }),
      l(13, 'option', 52),
      u(14, 'Select'),
      c(),
      I(15, TC, 2, 3, 'option', 74),
      c()(),
      l(16, 'label'),
      u(17, 'Oracle target'),
      l(18, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.recon.targetProfileId, r) || (o.recon.targetProfileId = r), v(r));
      }),
      E('ngModelChange', function (r) {
        y(t);
        let o = m();
        return v(o.ensureCredentials([r]));
      }),
      l(19, 'option', 52),
      u(20, 'Select'),
      c(),
      I(21, AC, 2, 3, 'option', 74),
      c()(),
      l(22, 'label'),
      u(23, 'Source schema'),
      l(24, 'input', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.recon.sourceSchema, r) || (o.recon.sourceSchema = r), v(r));
      }),
      c()(),
      l(25, 'label'),
      u(26, 'Target schema'),
      l(27, 'input', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.recon.targetSchema, r) || (o.recon.targetSchema = r), v(r));
      }),
      c()(),
      te(28, 'div'),
      l(29, 'button', 78),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.startReconciliation());
      }),
      u(30, 'Run reconciliation'),
      c()(),
      l(31, 'div', 58)(32, 'div')(33, 'p', 18),
      u(34, 'SAVED FILES'),
      c(),
      l(35, 'h2'),
      u(36, 'Quantitative reports'),
      c()()(),
      l(37, 'div', 19)(38, 'table')(39, 'thead')(40, 'tr')(41, 'th'),
      u(42, 'Report'),
      c(),
      l(43, 'th'),
      u(44, 'Generated'),
      c(),
      l(45, 'th'),
      u(46, 'Source'),
      c(),
      l(47, 'th'),
      u(48, 'Target'),
      c(),
      l(49, 'th'),
      u(50, 'Matched'),
      c(),
      l(51, 'th'),
      u(52, 'Mismatched'),
      c(),
      l(53, 'th'),
      u(54, 'Status'),
      c(),
      l(55, 'th'),
      u(56, 'Actions'),
      c()()(),
      l(57, 'tbody'),
      I(58, NC, 26, 15, 'tr', 21)(59, RC, 3, 0, 'tr', 13),
      c()()(),
      I(60, OC, 8, 2, 'div', 104)(61, PC, 11, 6, 'div', 104)(62, $C, 81, 19, 'ng-container', 13)(
        63,
        zC,
        56,
        17,
        'div',
        15,
      ),
      c());
  }
  if (e & 2) {
    let t = m();
    (f(12),
      S('ngModel', t.recon.sourceProfileId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.profiles),
      f(3),
      S('ngModel', t.recon.targetProfileId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.profiles),
      f(3),
      S('ngModel', t.recon.sourceSchema),
      f(3),
      S('ngModel', t.recon.targetSchema),
      f(2),
      _('disabled', t.busy),
      f(29),
      _('ngForOf', t.reconciliationRuns),
      f(),
      _('ngIf', !t.reconciliationRuns.length),
      f(),
      _('ngIf', t.activeRun),
      f(),
      _('ngIf', t.activeReconciliation),
      f(),
      _(
        'ngIf',
        t.activeReconciliation == null || t.activeReconciliation.status == null
          ? null
          : t.activeReconciliation.status.startsWith('COMPLETED'),
      ),
      f(),
      _('ngIf', t.details));
  }
}
function QC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td')(2, 'strong'),
      u(3),
      c(),
      l(4, 'small'),
      u(5),
      c()(),
      l(6, 'td'),
      u(7),
      c(),
      l(8, 'td'),
      u(9),
      c(),
      l(10, 'td', 101)(11, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(3);
        return v(o.editLogicalTable(r));
      }),
      u(12, 'Edit'),
      c(),
      l(13, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(3);
        return v(o.selectLogicalTable(r.ID));
      }),
      u(14, ' Columns '),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(3),
      D(t.NAME),
      f(2),
      D(t.DESCRIPTION),
      f(2),
      D(t.AUTO_COMPARE ? 'Automatic' : 'Manual'),
      f(2),
      D(t.ACTIVE ? 'Active' : 'Inactive'));
  }
}
function YC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td'),
      u(2),
      c(),
      l(3, 'td'),
      u(4),
      c(),
      l(5, 'td'),
      u(6),
      c(),
      l(7, 'td')(8, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(4);
        return v(o.editLogicalColumn(r));
      }),
      u(9, 'Edit'),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(2),
      D(t.NAME),
      f(2),
      D(t.PRIMARY_KEY_POSITION || '\u2014'),
      f(2),
      D(t.EXCLUDED ? 'Yes' : 'No'));
  }
}
function KC(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 66)(1, 'h3'),
      u(2, 'Logical columns'),
      c(),
      l(3, 'div', 126)(4, 'label'),
      u(5, 'Column'),
      l(6, 'input', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(3);
        return (T(o.columnForm.name, r) || (o.columnForm.name = r), v(r));
      }),
      c()(),
      l(7, 'label'),
      u(8, 'Primary-key position'),
      l(9, 'input', 127),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(3);
        return (
          T(o.columnForm.primaryKeyPosition, r) || (o.columnForm.primaryKeyPosition = r),
          v(r)
        );
      }),
      c()(),
      l(10, 'label', 42)(11, 'input', 77),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(3);
        return (T(o.columnForm.excluded, r) || (o.columnForm.excluded = r), v(r));
      }),
      c(),
      u(12, ' Excluded'),
      c(),
      l(13, 'button', 6),
      E('click', function () {
        y(t);
        let r = m(3);
        return v(r.saveLogicalColumn());
      }),
      u(14),
      c()(),
      l(15, 'table')(16, 'thead')(17, 'tr')(18, 'th'),
      u(19, 'Column'),
      c(),
      l(20, 'th'),
      u(21, 'Key position'),
      c(),
      l(22, 'th'),
      u(23, 'Excluded'),
      c(),
      te(24, 'th'),
      c()(),
      l(25, 'tbody'),
      I(26, YC, 10, 3, 'tr', 21),
      c()()());
  }
  if (e & 2) {
    let t = m(3);
    (f(6),
      S('ngModel', t.columnForm.name),
      f(3),
      S('ngModel', t.columnForm.primaryKeyPosition),
      f(2),
      S('ngModel', t.columnForm.excluded),
      f(3),
      A(' ', t.columnForm.id ? 'Update' : 'Add', ' column '),
      f(12),
      _('ngForOf', t.logicalColumns));
  }
}
function JC(e, n) {
  if (e & 1) {
    let t = R();
    (mt(0),
      l(1, 'div', 103)(2, 'label'),
      u(3, 'Logical table'),
      l(4, 'input', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.logicalForm.name, r) || (o.logicalForm.name = r), v(r));
      }),
      c()(),
      l(5, 'label'),
      u(6, 'Description'),
      l(7, 'input', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.logicalForm.description, r) || (o.logicalForm.description = r), v(r));
      }),
      c()(),
      l(8, 'label', 42)(9, 'input', 77),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.logicalForm.autoCompare, r) || (o.logicalForm.autoCompare = r), v(r));
      }),
      c(),
      u(10, ' Auto compare'),
      c(),
      l(11, 'label', 42)(12, 'input', 77),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.logicalForm.active, r) || (o.logicalForm.active = r), v(r));
      }),
      c(),
      u(13, ' Active'),
      c(),
      l(14, 'button', 6),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.saveLogicalTable());
      }),
      u(15),
      c()(),
      l(16, 'div', 19)(17, 'table')(18, 'thead')(19, 'tr')(20, 'th'),
      u(21, 'Name'),
      c(),
      l(22, 'th'),
      u(23, 'Mode'),
      c(),
      l(24, 'th'),
      u(25, 'Status'),
      c(),
      te(26, 'th'),
      c()(),
      l(27, 'tbody'),
      I(28, QC, 15, 4, 'tr', 21),
      c()()(),
      I(29, KC, 27, 5, 'div', 125),
      gt());
  }
  if (e & 2) {
    let t = m(2);
    (f(4),
      S('ngModel', t.logicalForm.name),
      f(3),
      S('ngModel', t.logicalForm.description),
      f(2),
      S('ngModel', t.logicalForm.autoCompare),
      f(3),
      S('ngModel', t.logicalForm.active),
      f(3),
      A(' ', t.logicalForm.id ? 'Update' : 'Add', ' table '),
      f(13),
      _('ngForOf', t.logicalTables),
      f(),
      _('ngIf', t.selectedLogicalTableId));
  }
}
function XC(e, n) {
  if ((e & 1 && (l(0, 'option', 52), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.ID), f(), D(t.NAME));
  }
}
function eE(e, n) {
  if ((e & 1 && (l(0, 'option', 52), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.id), f(), me(' ', t.name, ' (', t.databaseType, ') '));
  }
}
function tE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td'),
      u(2),
      c(),
      l(3, 'td'),
      u(4),
      l(5, 'small'),
      u(6),
      c()(),
      l(7, 'td'),
      u(8),
      c(),
      l(9, 'td'),
      u(10),
      c(),
      l(11, 'td')(12, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(3);
        return v(o.editDbTable(r));
      }),
      u(13, 'Edit'),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(2),
      D(t.LOGICAL_TABLE_NAME),
      f(2),
      A(' ', t.PROFILE_NAME, ''),
      f(2),
      D(t.DATABASE_TYPE),
      f(2),
      me('', t.SCHEMA_NAME, '.', t.TABLE_NAME, ''),
      f(2),
      D(t.ACTIVE ? 'Active' : 'Inactive'));
  }
}
function nE(e, n) {
  if (e & 1) {
    let t = R();
    (mt(0),
      l(1, 'div', 103)(2, 'label'),
      u(3, 'Logical table'),
      l(4, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.dbTableForm.logicalTableId, r) || (o.dbTableForm.logicalTableId = r), v(r));
      }),
      l(5, 'option', 52),
      u(6, 'Select'),
      c(),
      I(7, XC, 2, 2, 'option', 128),
      c()(),
      l(8, 'label'),
      u(9, 'Database'),
      l(10, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (
          T(o.dbTableForm.connectionProfileId, r) || (o.dbTableForm.connectionProfileId = r),
          v(r)
        );
      }),
      l(11, 'option', 52),
      u(12, 'Select'),
      c(),
      I(13, eE, 2, 3, 'option', 128),
      c()(),
      l(14, 'label'),
      u(15, 'Schema / owner'),
      l(16, 'input', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.dbTableForm.schemaName, r) || (o.dbTableForm.schemaName = r), v(r));
      }),
      c()(),
      l(17, 'label'),
      u(18, 'Physical table'),
      l(19, 'input', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.dbTableForm.tableName, r) || (o.dbTableForm.tableName = r), v(r));
      }),
      c()(),
      l(20, 'label', 42)(21, 'input', 77),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.dbTableForm.active, r) || (o.dbTableForm.active = r), v(r));
      }),
      c(),
      u(22, ' Active'),
      c(),
      l(23, 'button', 6),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.saveDbTable());
      }),
      u(24),
      c()(),
      l(25, 'div', 19)(26, 'table')(27, 'thead')(28, 'tr')(29, 'th'),
      u(30, 'Logical'),
      c(),
      l(31, 'th'),
      u(32, 'Database type / version'),
      c(),
      l(33, 'th'),
      u(34, 'Physical table'),
      c(),
      l(35, 'th'),
      u(36, 'Status'),
      c(),
      te(37, 'th'),
      c()(),
      l(38, 'tbody'),
      I(39, tE, 14, 6, 'tr', 21),
      c()()(),
      gt());
  }
  if (e & 2) {
    let t = m(2);
    (f(4),
      S('ngModel', t.dbTableForm.logicalTableId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.logicalTables),
      f(3),
      S('ngModel', t.dbTableForm.connectionProfileId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.profiles),
      f(3),
      S('ngModel', t.dbTableForm.schemaName),
      f(3),
      S('ngModel', t.dbTableForm.tableName),
      f(2),
      S('ngModel', t.dbTableForm.active),
      f(3),
      A(' ', t.dbTableForm.id ? 'Update' : 'Add', ' mapping '),
      f(15),
      _('ngForOf', t.dbTableMappings));
  }
}
function iE(e, n) {
  if ((e & 1 && (l(0, 'option', 52), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.ID), f(), D(t.NAME));
  }
}
function rE(e, n) {
  if ((e & 1 && (l(0, 'option', 52), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.ID),
      f(),
      rt(' ', t.PROFILE_NAME, ' / ', t.SCHEMA_NAME, '.', t.TABLE_NAME, ' '));
  }
}
function oE(e, n) {
  if ((e & 1 && (l(0, 'option', 52), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.ID),
      f(),
      rt(' ', t.PROFILE_NAME, ' / ', t.SCHEMA_NAME, '.', t.TABLE_NAME, ' '));
  }
}
function sE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td'),
      u(2),
      c(),
      l(3, 'td'),
      u(4),
      c(),
      l(5, 'td'),
      u(6),
      c(),
      l(7, 'td')(8, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(3);
        return v(o.editPair(r));
      }),
      u(9, 'Edit / map'),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(2),
      D(t.LOGICAL_TABLE_NAME),
      f(2),
      rt('', t.SOURCE_PROFILE, ' / ', t.SOURCE_SCHEMA, '.', t.SOURCE_TABLE, ''),
      f(2),
      rt('', t.TARGET_PROFILE, ' / ', t.TARGET_SCHEMA, '.', t.TARGET_TABLE, ''));
  }
}
function aE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 133),
      E('dragstart', function () {
        let r = y(t).$implicit,
          o = m(4);
        return v((o.draggedSource = r));
      }),
      u(1),
      c());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(), A(' ', t, ' '));
  }
}
function lE(e, n) {
  if (
    (e & 1 && (l(0, 'div')(1, 'span'), u(2), c(), te(3, 'i'), l(4, 'span'), u(5), c()()), e & 2)
  ) {
    let t = n.$implicit;
    (f(2), D(t.SOURCE_COLUMN_NAME), f(3), D(t.TARGET_COLUMN_NAME));
  }
}
function cE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 134),
      E('dragover', function (r) {
        return (y(t), v(r.preventDefault()));
      })('drop', function () {
        let r = y(t).$implicit,
          o = m(4);
        return v(o.dropColumn(r));
      }),
      l(1, 'small'),
      u(2),
      c(),
      u(3),
      c());
  }
  if (e & 2) {
    let t = n.$implicit,
      i = m(4);
    (f(2), D(i.mappingForTarget(t) || 'Drop source here'), f(), A('', t, ' '));
  }
}
function uE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 66)(1, 'div', 58)(2, 'div')(3, 'p', 18),
      u(4, 'COLUMN MAPPER'),
      c(),
      l(5, 'h2'),
      u(6, 'Source-to-target mapping'),
      c()(),
      l(7, 'div', 101)(8, 'button', 59),
      E('click', function () {
        y(t);
        let r = m(3);
        return v(r.autoMapColumns());
      }),
      u(9, 'Auto-map'),
      c(),
      l(10, 'button', 6),
      E('click', function () {
        y(t);
        let r = m(3);
        return v(r.saveColumnMappings());
      }),
      u(11, 'Save'),
      c()()(),
      l(12, 'p'),
      u(
        13,
        ' Drag a source column onto its target. Existing mappings are shown as connecting wires. ',
      ),
      c(),
      l(14, 'div', 129)(15, 'div')(16, 'h3'),
      u(17, 'Source'),
      c(),
      I(18, aE, 2, 1, 'div', 130),
      c(),
      l(19, 'div', 131),
      I(20, lE, 6, 2, 'div', 21),
      c(),
      l(21, 'div')(22, 'h3'),
      u(23, 'Target'),
      c(),
      I(24, cE, 4, 2, 'div', 132),
      c()()());
  }
  if (e & 2) {
    let t = m(3);
    (f(18),
      _('ngForOf', t.sourceMapperColumns),
      f(2),
      _('ngForOf', t.mappedColumns),
      f(4),
      _('ngForOf', t.targetMapperColumns));
  }
}
function dE(e, n) {
  if (e & 1) {
    let t = R();
    (mt(0),
      l(1, 'div', 103)(2, 'label'),
      u(3, 'Logical table'),
      l(4, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.pairForm.logicalTableId, r) || (o.pairForm.logicalTableId = r), v(r));
      }),
      l(5, 'option', 52),
      u(6, 'Select'),
      c(),
      I(7, iE, 2, 2, 'option', 128),
      c()(),
      l(8, 'label'),
      u(9, 'Source table'),
      l(10, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (
          T(o.pairForm.sourceTableMappingId, r) || (o.pairForm.sourceTableMappingId = r),
          v(r)
        );
      }),
      l(11, 'option', 52),
      u(12, 'Select'),
      c(),
      I(13, rE, 2, 4, 'option', 128),
      c()(),
      l(14, 'label'),
      u(15, 'Target table'),
      l(16, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (
          T(o.pairForm.targetTableMappingId, r) || (o.pairForm.targetTableMappingId = r),
          v(r)
        );
      }),
      l(17, 'option', 52),
      u(18, 'Select'),
      c(),
      I(19, oE, 2, 4, 'option', 128),
      c()(),
      l(20, 'label', 42)(21, 'input', 77),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.pairForm.active, r) || (o.pairForm.active = r), v(r));
      }),
      c(),
      u(22, ' Active'),
      c(),
      l(23, 'button', 6),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.savePair());
      }),
      u(24),
      c()(),
      l(25, 'div', 19)(26, 'table')(27, 'thead')(28, 'tr')(29, 'th'),
      u(30, 'Logical'),
      c(),
      l(31, 'th'),
      u(32, 'Source'),
      c(),
      l(33, 'th'),
      u(34, 'Target'),
      c(),
      te(35, 'th'),
      c()(),
      l(36, 'tbody'),
      I(37, sE, 10, 7, 'tr', 21),
      c()()(),
      I(38, uE, 25, 3, 'div', 125),
      gt());
  }
  if (e & 2) {
    let t = m(2);
    (f(4),
      S('ngModel', t.pairForm.logicalTableId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.logicalTables),
      f(3),
      S('ngModel', t.pairForm.sourceTableMappingId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.dbTableMappings),
      f(3),
      S('ngModel', t.pairForm.targetTableMappingId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.dbTableMappings),
      f(2),
      S('ngModel', t.pairForm.active),
      f(3),
      A('', t.pairForm.id ? 'Update' : 'Add', ' pair'),
      f(13),
      _('ngForOf', t.reconPairs),
      f(),
      _('ngIf', t.selectedPairId));
  }
}
function fE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td'),
      u(2),
      c(),
      l(3, 'td'),
      u(4),
      c(),
      l(5, 'td'),
      u(6),
      c(),
      l(7, 'td')(8, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(3);
        return v(o.editBatch(r));
      }),
      u(9, 'Edit / assign'),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(2), D(t.NAME), f(2), D(t.DESCRIPTION), f(2), D(t.ACTIVE ? 'Active' : 'Inactive'));
  }
}
function pE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'label', 137)(1, 'input', 138),
      E('change', function (r) {
        let o = y(t).$implicit,
          s = m(4);
        return v(s.toggleBatchPair(o.ID, r.target.checked));
      }),
      c(),
      l(2, 'span'),
      u(3),
      c(),
      l(4, 'small'),
      u(5),
      c()());
  }
  if (e & 2) {
    let t = n.$implicit,
      i = m(4);
    (f(),
      _('checked', i.batchHasPair(t.ID)),
      f(2),
      D(t.LOGICAL_TABLE_NAME),
      f(2),
      qr(
        '',
        t.SOURCE_SCHEMA,
        '.',
        t.SOURCE_TABLE,
        ' \u2192 ',
        t.TARGET_SCHEMA,
        '.',
        t.TARGET_TABLE,
        '',
      ));
  }
}
function hE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 66)(1, 'h3'),
      u(2, 'Assigned table pairs'),
      c(),
      I(3, pE, 6, 6, 'label', 136),
      l(4, 'button', 6),
      E('click', function () {
        y(t);
        let r = m(3);
        return v(r.saveBatchTables());
      }),
      u(5, 'Save assignments'),
      c()());
  }
  if (e & 2) {
    let t = m(3);
    (f(3), _('ngForOf', t.reconPairs));
  }
}
function mE(e, n) {
  if (e & 1) {
    let t = R();
    (mt(0),
      l(1, 'div', 103)(2, 'label'),
      u(3, 'Batch name'),
      l(4, 'input', 135),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.batchForm.name, r) || (o.batchForm.name = r), v(r));
      }),
      c()(),
      l(5, 'label'),
      u(6, 'Description'),
      l(7, 'input', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.batchForm.description, r) || (o.batchForm.description = r), v(r));
      }),
      c()(),
      l(8, 'label', 42)(9, 'input', 77),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.batchForm.active, r) || (o.batchForm.active = r), v(r));
      }),
      c(),
      u(10, ' Active'),
      c(),
      l(11, 'button', 6),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.saveBatch());
      }),
      u(12),
      c()(),
      l(13, 'div', 19)(14, 'table')(15, 'thead')(16, 'tr')(17, 'th'),
      u(18, 'Batch'),
      c(),
      l(19, 'th'),
      u(20, 'Description'),
      c(),
      l(21, 'th'),
      u(22, 'Status'),
      c(),
      te(23, 'th'),
      c()(),
      l(24, 'tbody'),
      I(25, fE, 10, 3, 'tr', 21),
      c()()(),
      I(26, hE, 6, 1, 'div', 125),
      gt());
  }
  if (e & 2) {
    let t = m(2);
    (f(4),
      S('ngModel', t.batchForm.name),
      f(3),
      S('ngModel', t.batchForm.description),
      f(2),
      S('ngModel', t.batchForm.active),
      f(3),
      A('', t.batchForm.id ? 'Update' : 'Add', ' batch'),
      f(13),
      _('ngForOf', t.reconBatches),
      f(),
      _('ngIf', t.selectedBatchId));
  }
}
function gE(e, n) {
  if ((e & 1 && (l(0, 'option', 52), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.id), f(), D(t.name));
  }
}
function _E(e, n) {
  if ((e & 1 && (l(0, 'option', 52), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.id), f(), D(t.name));
  }
}
function yE(e, n) {
  if ((e & 1 && (l(0, 'option', 52), u(1), c()), e & 2)) {
    let t = n.$implicit;
    (_('ngValue', t.ID), f(), D(t.NAME));
  }
}
function vE(e, n) {
  if (
    (e & 1 &&
      (l(0, 'div', 141)(1, 'div')(2, 'strong'),
      u(3),
      c(),
      l(4, 'small'),
      u(5),
      c()(),
      l(6, 'span', 67),
      u(7),
      c(),
      l(8, 'div', 95),
      te(9, 'i'),
      c(),
      l(10, 'strong'),
      u(11),
      c()()),
    e & 2)
  ) {
    let t = m(3);
    (f(3),
      D(t.qualRun.reportId),
      f(2),
      rt(
        '',
        t.qualRun.completedTables,
        ' of ',
        t.qualRun.totalTables,
        ' tables \xB7 ',
        t.qualRun.processedRecords,
        ' records',
      ),
      f(2),
      D(t.qualRun.status),
      f(2),
      je('width', t.qualProgress(), '%'),
      f(2),
      A('', t.qualProgress(), '%'));
  }
}
function CE(e, n) {
  if (
    (e & 1 &&
      (l(0, 'tr')(1, 'td'),
      u(2),
      c(),
      l(3, 'td'),
      u(4),
      l(5, 'small'),
      u(6),
      c()(),
      l(7, 'td'),
      u(8),
      c(),
      l(9, 'td'),
      u(10),
      l(11, 'small'),
      u(12),
      c()()()),
    e & 2)
  ) {
    let t = n.$implicit;
    (f(2),
      D(t.logicalTable),
      f(2),
      A(' ', t.sourceTable, ''),
      f(2),
      D(t.targetTable),
      f(2),
      me('', t.sourceCount, ' / ', t.targetCount, ''),
      f(2),
      A(' ', t.status, ''),
      f(2),
      D(t.errorMessage || t.xlsxFile));
  }
}
function EE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 66)(1, 'div', 58)(2, 'div')(3, 'h2'),
      u(4),
      c(),
      l(5, 'p'),
      u(6),
      c()(),
      l(7, 'button', 6),
      E('click', function () {
        y(t);
        let r = m(3);
        return v(r.downloadQualitative(r.activeQualReport.reportId));
      }),
      u(8),
      c()(),
      l(9, 'div', 142)(10, 'span')(11, 'b'),
      u(12),
      c(),
      u(13, 'Matched'),
      c(),
      l(14, 'span')(15, 'b'),
      u(16),
      c(),
      u(17, 'Mismatched'),
      c(),
      l(18, 'span')(19, 'b'),
      u(20),
      c(),
      u(21, 'Missing in source'),
      c(),
      l(22, 'span')(23, 'b'),
      u(24),
      c(),
      u(25, 'Missing in target'),
      c()(),
      l(26, 'table')(27, 'thead')(28, 'tr')(29, 'th'),
      u(30, 'Logical table'),
      c(),
      l(31, 'th'),
      u(32, 'Source / target'),
      c(),
      l(33, 'th'),
      u(34, 'Counts'),
      c(),
      l(35, 'th'),
      u(36, 'Result'),
      c()()(),
      l(37, 'tbody'),
      I(38, CE, 13, 7, 'tr', 21),
      c()()());
  }
  if (e & 2) {
    let t = m(3);
    (f(4),
      D(t.activeQualReport.batchName),
      f(2),
      D(t.activeQualReport.detailLabel),
      f(2),
      A(' Download ', t.activeQualReport.zipFile, ' '),
      f(4),
      D(t.activeQualReport.matched),
      f(4),
      D(t.activeQualReport.mismatched),
      f(4),
      D(t.activeQualReport.missingInSource),
      f(4),
      D(t.activeQualReport.missingInTarget),
      f(14),
      _('ngForOf', t.activeQualReport.tables));
  }
}
function DE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'tr')(1, 'td'),
      u(2),
      c(),
      l(3, 'td'),
      u(4),
      Dn(5, 'date'),
      c(),
      l(6, 'td'),
      u(7),
      c(),
      l(8, 'td'),
      u(9),
      c(),
      l(10, 'td'),
      u(11),
      c(),
      l(12, 'td', 101)(13, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(3);
        return v(o.reloadQualitative(r.reportId));
      }),
      u(14, ' Reload'),
      c(),
      l(15, 'button', 25),
      E('click', function () {
        let r = y(t).$implicit,
          o = m(3);
        return v(o.downloadQualitative(r.reportId));
      }),
      u(16, ' Download ZIP '),
      c()()());
  }
  if (e & 2) {
    let t = n.$implicit;
    (f(2),
      D(t.reportId),
      f(2),
      D(bn(5, 5, t.generatedAt, 'medium')),
      f(3),
      D(t.batchName),
      f(2),
      D(t.matched),
      f(2),
      D(t.mismatched + t.missingInSource + t.missingInTarget));
  }
}
function bE(e, n) {
  if (e & 1) {
    let t = R();
    (mt(0),
      l(1, 'div', 103)(2, 'label'),
      u(3, 'Source database'),
      l(4, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (
          T(o.qualExecution.sourceProfileId, r) || (o.qualExecution.sourceProfileId = r),
          v(r)
        );
      }),
      E('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (o.ensureCredentials([r]), v(o.loadEligibleBatches()));
      }),
      l(5, 'option', 52),
      u(6, 'Select'),
      c(),
      I(7, gE, 2, 2, 'option', 128),
      c()(),
      l(8, 'label'),
      u(9, 'Target database'),
      l(10, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (
          T(o.qualExecution.targetProfileId, r) || (o.qualExecution.targetProfileId = r),
          v(r)
        );
      }),
      E('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (o.ensureCredentials([r]), v(o.loadEligibleBatches()));
      }),
      l(11, 'option', 52),
      u(12, 'Select'),
      c(),
      I(13, _E, 2, 2, 'option', 128),
      c()(),
      l(14, 'label'),
      u(15, 'Batch'),
      l(16, 'select', 73),
      M('ngModelChange', function (r) {
        y(t);
        let o = m(2);
        return (T(o.qualExecution.batchId, r) || (o.qualExecution.batchId = r), v(r));
      }),
      l(17, 'option', 52),
      u(18, 'Select'),
      c(),
      I(19, yE, 2, 2, 'option', 128),
      c()(),
      l(20, 'button', 139),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.previewExecutionBatch());
      }),
      u(21, ' A \xB7 Tables'),
      c(),
      l(22, 'button', 78),
      E('click', function () {
        y(t);
        let r = m(2);
        return v(r.startQualitative());
      }),
      u(23, ' Execute '),
      c()(),
      I(24, vE, 12, 8, 'div', 140)(25, EE, 39, 8, 'div', 125),
      l(26, 'div', 19)(27, 'table')(28, 'thead')(29, 'tr')(30, 'th'),
      u(31, 'Report'),
      c(),
      l(32, 'th'),
      u(33, 'Generated'),
      c(),
      l(34, 'th'),
      u(35, 'Batch'),
      c(),
      l(36, 'th'),
      u(37, 'Matched'),
      c(),
      l(38, 'th'),
      u(39, 'Issues'),
      c(),
      te(40, 'th'),
      c()(),
      l(41, 'tbody'),
      I(42, DE, 17, 8, 'tr', 21),
      c()()(),
      gt());
  }
  if (e & 2) {
    let t = m(2);
    (f(4),
      S('ngModel', t.qualExecution.sourceProfileId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.profiles),
      f(3),
      S('ngModel', t.qualExecution.targetProfileId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.profiles),
      f(3),
      S('ngModel', t.qualExecution.batchId),
      f(),
      _('ngValue', 0),
      f(2),
      _('ngForOf', t.reconBatches),
      f(),
      _('disabled', !t.qualExecution.batchId),
      f(2),
      _('disabled', !t.qualExecution.batchId),
      f(2),
      _('ngIf', t.qualRun),
      f(),
      _('ngIf', t.activeQualReport),
      f(17),
      _('ngForOf', t.qualReports));
  }
}
function wE(e, n) {
  if ((e & 1 && (l(0, 'tr')(1, 'td'), u(2), c(), l(3, 'td'), u(4), c()()), e & 2)) {
    let t = n.$implicit;
    (f(2),
      me('', t.SOURCE_SCHEMA, '.', t.SOURCE_TABLE, ''),
      f(2),
      me('', t.TARGET_SCHEMA, '.', t.TARGET_TABLE, ''));
  }
}
function IE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 28)(1, 'div', 119)(2, 'div', 30)(3, 'h2'),
      u(4, 'Batch tables'),
      c(),
      l(5, 'button', 120),
      E('click', function () {
        y(t);
        let r = m(2);
        return v((r.showBatchPreview = !1));
      }),
      u(6, '\xD7'),
      c()(),
      l(7, 'table')(8, 'thead')(9, 'tr')(10, 'th'),
      u(11, 'Source'),
      c(),
      l(12, 'th'),
      u(13, 'Target'),
      c()()(),
      l(14, 'tbody'),
      I(15, wE, 5, 4, 'tr', 21),
      c()()()());
  }
  if (e & 2) {
    let t = m(2);
    (f(15), _('ngForOf', t.batchTables));
  }
}
function xE(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'section')(1, 'div', 17)(2, 'div')(3, 'p', 18),
      u(4, 'SOURCE TO TARGET'),
      c(),
      l(5, 'h2'),
      u(6, 'Compare business data'),
      c(),
      l(7, 'p'),
      u(8, 'Configure logical mappings, batches, and record-level comparison.'),
      c()()(),
      l(9, 'div', 124)(10, 'button', 6),
      E('click', function () {
        y(t);
        let r = m();
        return v((r.qualSection = 'tables'));
      }),
      u(11, ' Logical tables'),
      c(),
      l(12, 'button', 6),
      E('click', function () {
        y(t);
        let r = m();
        return v((r.qualSection = 'physical'));
      }),
      u(13, ' Physical tables'),
      c(),
      l(14, 'button', 6),
      E('click', function () {
        y(t);
        let r = m();
        return v((r.qualSection = 'pairs'));
      }),
      u(15, ' Mappings'),
      c(),
      l(16, 'button', 6),
      E('click', function () {
        y(t);
        let r = m();
        return v((r.qualSection = 'batches'));
      }),
      u(17, ' Batches'),
      c(),
      l(18, 'button', 6),
      E('click', function () {
        y(t);
        let r = m();
        return v((r.qualSection = 'execute'));
      }),
      u(19, ' Execute & reports '),
      c()(),
      I(20, JC, 30, 7, 'ng-container', 13)(21, nE, 40, 11, 'ng-container', 13)(
        22,
        dE,
        39,
        13,
        'ng-container',
        13,
      )(23, mE, 27, 6, 'ng-container', 13)(24, bE, 43, 14, 'ng-container', 13)(
        25,
        IE,
        16,
        1,
        'div',
        15,
      ),
      c());
  }
  if (e & 2) {
    let t = m();
    (f(10),
      de('active', t.qualSection === 'tables'),
      f(2),
      de('active', t.qualSection === 'physical'),
      f(2),
      de('active', t.qualSection === 'pairs'),
      f(2),
      de('active', t.qualSection === 'batches'),
      f(2),
      de('active', t.qualSection === 'execute'),
      f(2),
      _('ngIf', t.qualSection === 'tables'),
      f(),
      _('ngIf', t.qualSection === 'physical'),
      f(),
      _('ngIf', t.qualSection === 'pairs'),
      f(),
      _('ngIf', t.qualSection === 'batches'),
      f(),
      _('ngIf', t.qualSection === 'execute'),
      f(),
      _('ngIf', t.showBatchPreview));
  }
}
function SE(e, n) {
  e & 1 &&
    (l(0, 'section', 143)(1, 'div', 144),
    u(2, '\u2194'),
    c(),
    l(3, 'p', 18),
    u(4, 'QUALITATIVE RECONCILIATION'),
    c(),
    l(5, 'h2'),
    u(6, 'Requirements pending'),
    c(),
    l(7, 'p'),
    u(
      8,
      ' This section is ready for the qualitative reconciliation requirements when they are defined. ',
    ),
    c()());
}
function ME(e, n) {
  if (e & 1) {
    let t = R();
    (l(0, 'div', 28)(1, 'div', 145)(2, 'h2'),
      u(3),
      c(),
      l(4, 'p'),
      u(
        5,
        ' Credentials are kept in server memory until the application JAR restarts. They are reused across migration and reconciliation. ',
      ),
      c(),
      l(6, 'label'),
      u(7, 'Database password'),
      l(8, 'input', 146),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (T(o.credentialPrompt.secret, r) || (o.credentialPrompt.secret = r), v(r));
      }),
      c()(),
      l(9, 'label'),
      u(10, 'Key-store password (if required)'),
      l(11, 'input', 146),
      M('ngModelChange', function (r) {
        y(t);
        let o = m();
        return (
          T(o.credentialPrompt.keyStoreSecret, r) || (o.credentialPrompt.keyStoreSecret = r),
          v(r)
        );
      }),
      c()(),
      l(12, 'button', 78),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.submitQualCredential());
      }),
      u(13, 'Continue'),
      c(),
      l(14, 'button', 76),
      E('click', function () {
        y(t);
        let r = m();
        return v(r.cancelCredentialPrompt());
      }),
      u(15, ' Cancel '),
      c()()());
  }
  if (e & 2) {
    let t = m();
    (f(3),
      A('Database credentials: ', t.credentialProfileName(), ''),
      f(5),
      S('ngModel', t.credentialPrompt.secret),
      f(3),
      S('ngModel', t.credentialPrompt.keyStoreSecret),
      f(),
      _('disabled', t.credentialSaving),
      f(2),
      _('disabled', t.credentialSaving));
  }
}
var Zf = (() => {
  class e {
    clearMigrationObjects() {
      (this.discoveryRequest++, (this.objects = []), this.selected.clear());
    }
    loadSchemas(t) {
      return Ae(this, null, function* () {
        let i = this.schemaLists[t],
          r = t === 'export' ? this.sourceExport : this.job;
        ((r.sourceSchema = ''), (i.names = []), (i.error = ''), (i.loading = !1));
        let o = ++i.request;
        (t === 'migration' && this.clearMigrationObjects(),
          r.sourceProfileId &&
            (yield this.ensureCredentials([r.sourceProfileId])) &&
            o === i.request &&
            ((i.loading = !0),
            this.http.get(`${this.api}/profiles/${r.sourceProfileId}/schemas`).subscribe({
              next: (s) => {
                o === i.request &&
                  ((i.names = s),
                  (i.loading = !1),
                  s.length || (i.error = 'No schemas are available for this connection.'));
              },
              error: (s) => {
                o === i.request &&
                  ((i.loading = !1),
                  (i.error =
                    s.error?.error ||
                    'Could not load schemas. Check connection credentials and retry.'));
              },
            })));
      });
    }
    loadSourceExports() {
      this.http.get(`${this.api}/source-scripts`).subscribe({
        next: (t) => (this.sourceExports = t),
        error: (t) => {
          this.activePage === 'source-scripts' && this.fail(t);
        },
      });
    }
    generateSourceScripts() {
      return Ae(this, null, function* () {
        (yield this.ensureCredentials([this.sourceExport.sourceProfileId])) &&
          this.schemaLists.export.names.includes(this.sourceExport.sourceSchema) &&
          ((this.exporting = !0),
          this.http.post(`${this.api}/source-scripts`, this.sourceExport).subscribe({
            next: () => {
              ((this.exporting = !1),
                (this.message = 'Native Sybase script extraction queued.'),
                this.loadSourceExports());
            },
            error: (t) => {
              ((this.exporting = !1), this.fail(t));
            },
          }));
      });
    }
    downloadSourceScript(t, i) {
      window.open(`${this.api}/source-scripts/${t}/${i}`, '_blank');
    }
    constructor(t) {
      ((this.http = t),
        (this.api = '/api'),
        (this.profiles = []),
        (this.jobs = []),
        (this.objects = []),
        (this.selected = new Set()),
        (this.message = ''),
        (this.busy = !1),
        (this.activePage = 'db-configurations'),
        (this.showProfileForm = !1),
        (this.reconciliationRuns = []),
        (this.objectCounts = []),
        (this.allTableCounts = []),
        (this.tableCounts = { content: [], number: 0, size: 10, totalElements: 0, totalPages: 0 }),
        (this.recon = {
          sourceProfileId: 0,
          targetProfileId: 0,
          sourceSchema: 'dbo',
          targetSchema: '',
        }),
        (this.missingSource = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
        (this.missingTarget = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
        (this.detailSize = 10),
        (this.qualSection = 'tables'),
        (this.logicalTables = []),
        (this.logicalColumns = []),
        (this.dbTableMappings = []),
        (this.reconPairs = []),
        (this.reconBatches = []),
        (this.batchTables = []),
        (this.sourceMapperColumns = []),
        (this.targetMapperColumns = []),
        (this.mappedColumns = []),
        (this.selectedLogicalTableId = 0),
        (this.selectedPairId = 0),
        (this.selectedBatchId = 0),
        (this.draggedSource = ''),
        (this.showBatchPreview = !1),
        (this.logicalForm = { id: 0, name: '', description: '', autoCompare: !0, active: !0 }),
        (this.columnForm = { id: 0, name: '', excluded: !1, primaryKeyPosition: null }),
        (this.dbTableForm = {
          id: 0,
          logicalTableId: 0,
          connectionProfileId: 0,
          schemaName: '',
          tableName: '',
          active: !0,
        }),
        (this.pairForm = {
          id: 0,
          logicalTableId: 0,
          sourceTableMappingId: 0,
          targetTableMappingId: 0,
          active: !0,
        }),
        (this.batchForm = { id: 0, name: '', description: '', active: !0 }),
        (this.qualExecution = { sourceProfileId: 0, targetProfileId: 0, batchId: 0 }),
        (this.qualReports = []),
        (this.credentialPrompt = null),
        (this.profile = {
          name: '',
          databaseType: 'SYBASE_ASE',
          databaseVersion: '',
          authType: 'DB_SECRET',
          host: 'localhost',
          port: 5e3,
          databaseName: '',
          serviceName: '',
          username: '',
          jdbcParameters: '',
          trustStorePath: '',
          keyStorePath: '',
          tlsEnabled: !1,
        }),
        (this.job = {
          name: 'migration',
          sourceProfileId: 0,
          targetProfileId: 0,
          sourceSchema: '',
          entireSchema: !0,
          overwrite: !1,
        }),
        (this.sourceExports = []),
        (this.sourceExport = {
          sourceProfileId: 0,
          name: 'Sybase native export',
          sourceSchema: '',
        }),
        (this.schemaLists = {
          export: { names: [], loading: !1, error: '', request: 0 },
          migration: { names: [], loading: !1, error: '', request: 0 },
        }),
        (this.discoveryRequest = 0),
        (this.exporting = !1),
        (this.credentialSaving = !1),
        (this.credentialQueue = Promise.resolve(!0)));
    }
    ngOnInit() {
      (this.refresh(),
        setInterval(() => {
          (this.loadSourceExports(),
            this.loadJobs(),
            this.loadReconciliationRuns(),
            this.loadQualitativeReports());
        }, 5e3));
    }
    refresh() {
      (this.http.get(`${this.api}/profiles`).subscribe((t) => (this.profiles = t)),
        this.loadSourceExports(),
        this.loadJobs(),
        this.loadReconciliationRuns(),
        this.loadQualitativeConfiguration(),
        this.loadQualitativeReports());
    }
    loadJobs() {
      this.http.get(`${this.api}/jobs`).subscribe((t) => (this.jobs = t));
    }
    navigate(t) {
      ((this.activePage = t), (this.message = ''));
    }
    pageTitle() {
      return this.activePage === 'db-configurations'
        ? 'DB Configurations'
        : this.activePage === 'source-scripts'
          ? 'Generate Source Scripts'
          : this.activePage === 'build-migrations'
            ? 'Build Migrations'
            : this.activePage === 'reconciliation-home'
              ? 'Reconciliation Reports'
              : this.activePage === 'quantitative-reconciliation'
                ? 'Quantitative Reconciliation'
                : 'Qualitative Reconciliation';
    }
    addProfile() {
      ((this.profile = {
        name: '',
        databaseType: 'SYBASE_ASE',
        databaseVersion: '',
        authType: 'DB_SECRET',
        host: 'localhost',
        port: 5e3,
        databaseName: '',
        serviceName: '',
        username: '',
        jdbcParameters: '',
        trustStorePath: '',
        keyStorePath: '',
        tlsEnabled: !1,
      }),
        (this.showProfileForm = !0));
    }
    editProfile(t) {
      ((this.profile = Z({}, t)), (this.activeProfileId = t.id), (this.showProfileForm = !0));
    }
    cancelProfile() {
      this.showProfileForm = !1;
    }
    deleteProfile(t) {
      confirm(`Delete connection profile "${t.name}"?`) &&
        this.http.delete(`${this.api}/profiles/${t.id}`).subscribe({
          next: () => {
            ((this.message = 'Connection profile deleted.'), this.refresh());
          },
          error: (i) => this.fail(i),
        });
    }
    saveProfile() {
      ((this.busy = !0),
        (this.profile.id
          ? this.http.put(`${this.api}/profiles/${this.profile.id}`, this.profile)
          : this.http.post(`${this.api}/profiles`, this.profile)
        ).subscribe({
          next: (i) => {
            ((this.activeProfileId = i.id),
              (this.showProfileForm = !1),
              (this.message = 'Connection configuration saved.'),
              this.refresh(),
              (this.busy = !1));
          },
          error: (i) => this.fail(i),
        }));
    }
    test(t) {
      return Ae(this, null, function* () {
        (yield this.ensureCredentials([t.id])) &&
          this.http.post(`${this.api}/profiles/${t.id}/test`, {}).subscribe(
            (i) => (this.message = i.message),
            (i) => this.fail(i),
          );
      });
    }
    discover() {
      if (
        (this.clearMigrationObjects(),
        !this.schemaLists.migration.names.includes(this.job.sourceSchema))
      )
        return;
      let t = this.discoveryRequest;
      this.http
        .get(`${this.api}/profiles/${this.job.sourceProfileId}/objects`, {
          params: { schema: this.job.sourceSchema },
        })
        .subscribe({
          next: (i) => {
            t === this.discoveryRequest && (this.objects = i);
          },
          error: (i) => {
            t === this.discoveryRequest && this.fail(i);
          },
        });
    }
    toggle(t, i) {
      let r = t.type + '|' + t.name;
      i.target.checked ? this.selected.add(r) : this.selected.delete(r);
    }
    createAndStart() {
      return Ae(this, null, function* () {
        if (
          !(yield this.ensureCredentials([this.job.sourceProfileId, this.job.targetProfileId])) ||
          !this.schemaLists.migration.names.includes(this.job.sourceSchema) ||
          (this.job.overwrite &&
            !confirm('Existing scripts for this migration name will be overwritten. Continue?'))
        )
          return;
        let t = this.objects.filter((i) => this.selected.has(i.type + '|' + i.name));
        this.http.post(`${this.api}/jobs`, ee(Z({}, this.job), { selectedObjects: t })).subscribe({
          next: (i) =>
            this.http.post(`${this.api}/jobs/${i.id}/start`, {}).subscribe(() => {
              ((this.message = 'Migration generation started.'),
                this.loadSourceExports(),
                this.loadJobs());
            }),
          error: (i) => this.fail(i),
        });
      });
    }
    action(t, i) {
      return Ae(this, null, function* () {
        (yield this.ensureCredentials([t.sourceProfile.id, t.targetProfile.id])) &&
          this.http.post(`${this.api}/jobs/${t.id}/${i}`, {}).subscribe(() => {
            ((this.message = `${i} started`), this.loadSourceExports(), this.loadJobs());
          });
      });
    }
    upload(t, i) {
      let r = i.target;
      if (!r.files?.length) return;
      let o = new FormData();
      (o.append('file', r.files[0]),
        this.http.post(`${this.api}/jobs/${t.id}/failure-manifest`, o).subscribe(() => {
          ((this.message = 'Failure manifest imported. Click Retry failures.'),
            this.loadSourceExports(),
            this.loadJobs());
        }));
    }
    manifest(t) {
      window.open(`${this.api}/jobs/${t.id}/failure-manifest`, '_blank');
    }
    progress(t) {
      return t.totalUnits
        ? Math.min(100, Math.round(((t.completedUnits + t.failedUnits) / t.totalUnits) * 100))
        : 0;
    }
    successWidth() {
      let t = this.jobs.reduce((i, r) => i + r.completedUnits + r.failedUnits, 0);
      return t ? Math.round((this.jobs.reduce((i, r) => i + r.completedUnits, 0) * 100) / t) : 0;
    }
    failedWidth() {
      let t = this.jobs.reduce((i, r) => i + r.completedUnits + r.failedUnits, 0);
      return t ? Math.round((this.jobs.reduce((i, r) => i + r.failedUnits, 0) * 100) / t) : 0;
    }
    statusCount(t) {
      return this.jobs.filter((i) => i.status === t).length;
    }
    loadReconciliationRuns() {
      (this.http
        .get(`${this.api}/reconciliation/reports`)
        .subscribe((t) => (this.reconciliationRuns = t)),
        (this.activeRun?.status === 'CREATED' || this.activeRun?.status === 'RUNNING') &&
          this.http
            .get(`${this.api}/reconciliation/runs/${this.activeRun.reportId}/status`)
            .subscribe((t) => {
              ((this.activeRun = t),
                t.status.startsWith('COMPLETED') &&
                  (this.loadReconciliationRuns(), this.reloadReport(t.reportId)));
            }));
    }
    loadQualitativeConfiguration() {
      (this.http
        .get(`${this.api}/qualitative/config/logical-tables`)
        .subscribe((t) => (this.logicalTables = t)),
        this.http
          .get(`${this.api}/qualitative/config/db-tables`)
          .subscribe((t) => (this.dbTableMappings = t)),
        this.http
          .get(`${this.api}/qualitative/config/pairs`)
          .subscribe((t) => (this.reconPairs = t)),
        this.http
          .get(`${this.api}/qualitative/config/batches`)
          .subscribe((t) => (this.reconBatches = t)));
    }
    saveLogicalTable() {
      let t = this.logicalForm;
      (t.id
        ? this.http.put(`${this.api}/qualitative/config/logical-tables/${t.id}`, t)
        : this.http.post(`${this.api}/qualitative/config/logical-tables`, t)
      ).subscribe({
        next: () => {
          ((this.logicalForm = { id: 0, name: '', description: '', autoCompare: !0, active: !0 }),
            this.loadQualitativeConfiguration());
        },
        error: (r) => this.fail(r),
      });
    }
    editLogicalTable(t) {
      ((this.logicalForm = {
        id: t.ID,
        name: t.NAME,
        description: t.DESCRIPTION || '',
        autoCompare: t.AUTO_COMPARE,
        active: t.ACTIVE,
      }),
        this.selectLogicalTable(t.ID));
    }
    selectLogicalTable(t) {
      ((this.selectedLogicalTableId = t),
        this.http
          .get(`${this.api}/qualitative/config/logical-tables/${t}/columns`)
          .subscribe((i) => (this.logicalColumns = i)));
    }
    saveLogicalColumn() {
      let t = ee(Z({}, this.columnForm), { logicalTableId: this.selectedLogicalTableId });
      (t.id
        ? this.http.put(`${this.api}/qualitative/config/logical-columns/${t.id}`, t)
        : this.http.post(`${this.api}/qualitative/config/logical-columns`, t)
      ).subscribe({
        next: () => {
          ((this.columnForm = { id: 0, name: '', excluded: !1, primaryKeyPosition: null }),
            this.selectLogicalTable(this.selectedLogicalTableId));
        },
        error: (r) => this.fail(r),
      });
    }
    editLogicalColumn(t) {
      this.columnForm = {
        id: t.ID,
        name: t.NAME,
        excluded: t.EXCLUDED,
        primaryKeyPosition: t.PRIMARY_KEY_POSITION,
      };
    }
    saveDbTable() {
      let t = this.dbTableForm;
      (t.id
        ? this.http.put(`${this.api}/qualitative/config/db-tables/${t.id}`, t)
        : this.http.post(`${this.api}/qualitative/config/db-tables`, t)
      ).subscribe({
        next: () => {
          ((this.dbTableForm = {
            id: 0,
            logicalTableId: 0,
            connectionProfileId: 0,
            schemaName: '',
            tableName: '',
            active: !0,
          }),
            this.loadQualitativeConfiguration());
        },
        error: (r) => this.fail(r),
      });
    }
    editDbTable(t) {
      this.dbTableForm = {
        id: t.ID,
        logicalTableId: t.LOGICAL_TABLE_ID,
        connectionProfileId: t.CONNECTION_PROFILE_ID,
        schemaName: t.SCHEMA_NAME,
        tableName: t.TABLE_NAME,
        active: t.ACTIVE,
      };
    }
    savePair() {
      let t = this.pairForm;
      (t.id
        ? this.http.put(`${this.api}/qualitative/config/pairs/${t.id}`, t)
        : this.http.post(`${this.api}/qualitative/config/pairs`, t)
      ).subscribe({
        next: () => {
          ((this.pairForm = {
            id: 0,
            logicalTableId: 0,
            sourceTableMappingId: 0,
            targetTableMappingId: 0,
            active: !0,
          }),
            this.loadQualitativeConfiguration());
        },
        error: (r) => this.fail(r),
      });
    }
    editPair(t) {
      ((this.pairForm = {
        id: t.ID,
        logicalTableId: t.LOGICAL_TABLE_ID,
        sourceTableMappingId: t.SOURCE_TABLE_MAPPING_ID,
        targetTableMappingId: t.TARGET_TABLE_MAPPING_ID,
        active: t.ACTIVE,
      }),
        this.selectPair(t.ID));
    }
    selectPair(t) {
      this.selectedPairId = t;
      let i = this.reconPairs.find((r) => r.ID === t);
      i &&
        (this.http
          .get(`${this.api}/qualitative/config/pairs/${t}/columns`)
          .subscribe((r) => (this.mappedColumns = r)),
        this.http
          .get(`${this.api}/qualitative/config/profiles/${i.SOURCE_PROFILE_ID}/columns`, {
            params: { schema: i.SOURCE_SCHEMA, table: i.SOURCE_TABLE },
          })
          .subscribe({ next: (r) => (this.sourceMapperColumns = r), error: (r) => this.fail(r) }),
        this.http
          .get(`${this.api}/qualitative/config/profiles/${i.TARGET_PROFILE_ID}/columns`, {
            params: { schema: i.TARGET_SCHEMA, table: i.TARGET_TABLE },
          })
          .subscribe({ next: (r) => (this.targetMapperColumns = r), error: (r) => this.fail(r) }),
        this.selectLogicalTable(i.LOGICAL_TABLE_ID));
    }
    autoMapColumns() {
      this.http
        .post(`${this.api}/qualitative/config/pairs/${this.selectedPairId}/auto-map`, {})
        .subscribe({ next: (t) => (this.mappedColumns = t), error: (t) => this.fail(t) });
    }
    dropColumn(t) {
      if (!this.draggedSource) return;
      let i = this.logicalColumns.find(
        (r) => String(r.NAME).toUpperCase() === this.draggedSource.toUpperCase(),
      );
      if (!i) {
        this.message = 'Create the logical column before mapping it.';
        return;
      }
      ((this.mappedColumns = this.mappedColumns.filter(
        (r) => r.LOGICAL_COLUMN_ID !== i.ID && r.TARGET_COLUMN_NAME !== t,
      )),
        this.mappedColumns.push({
          LOGICAL_COLUMN_ID: i.ID,
          LOGICAL_COLUMN_NAME: i.NAME,
          SOURCE_COLUMN_NAME: this.draggedSource,
          TARGET_COLUMN_NAME: t,
        }),
        (this.draggedSource = ''));
    }
    saveColumnMappings() {
      let t = this.mappedColumns.map((i) => ({
        logicalColumnId: i.LOGICAL_COLUMN_ID,
        sourceColumnName: i.SOURCE_COLUMN_NAME,
        targetColumnName: i.TARGET_COLUMN_NAME,
      }));
      this.http
        .put(`${this.api}/qualitative/config/pairs/${this.selectedPairId}/columns`, t)
        .subscribe({
          next: () => (this.message = 'Column mappings saved.'),
          error: (i) => this.fail(i),
        });
    }
    mappingForTarget(t) {
      return this.mappedColumns.find((i) => i.TARGET_COLUMN_NAME === t)?.SOURCE_COLUMN_NAME || '';
    }
    saveBatch() {
      let t = this.batchForm;
      (t.id
        ? this.http.put(`${this.api}/qualitative/config/batches/${t.id}`, t)
        : this.http.post(`${this.api}/qualitative/config/batches`, t)
      ).subscribe({ next: () => this.loadQualitativeConfiguration(), error: (r) => this.fail(r) });
    }
    editBatch(t) {
      ((this.batchForm = {
        id: t.ID,
        name: t.NAME,
        description: t.DESCRIPTION || '',
        active: t.ACTIVE,
      }),
        this.selectBatch(t.ID));
    }
    selectBatch(t) {
      ((this.selectedBatchId = t),
        this.http
          .get(`${this.api}/qualitative/config/batches/${t}/tables`)
          .subscribe((i) => (this.batchTables = i)));
    }
    batchHasPair(t) {
      return this.batchTables.some((i) => i.RECON_DB_MAPPING_ID === t);
    }
    toggleBatchPair(t, i) {
      (i && !this.batchHasPair(t) && this.batchTables.push({ RECON_DB_MAPPING_ID: t }),
        i || (this.batchTables = this.batchTables.filter((r) => r.RECON_DB_MAPPING_ID !== t)));
    }
    saveBatchTables() {
      let t = this.batchTables.map((i, r) => ({
        reconDbMappingId: i.RECON_DB_MAPPING_ID,
        executionOrder: r + 1,
      }));
      this.http
        .put(`${this.api}/qualitative/config/batches/${this.selectedBatchId}/tables`, t)
        .subscribe({
          next: () => {
            ((this.message = 'Batch table assignments saved.'),
              this.selectBatch(this.selectedBatchId));
          },
          error: (i) => this.fail(i),
        });
    }
    loadEligibleBatches() {
      !this.qualExecution.sourceProfileId ||
        !this.qualExecution.targetProfileId ||
        this.http
          .get(`${this.api}/qualitative/config/batches`, {
            params: {
              sourceProfileId: this.qualExecution.sourceProfileId,
              targetProfileId: this.qualExecution.targetProfileId,
            },
          })
          .subscribe((t) => (this.reconBatches = t));
    }
    previewExecutionBatch() {
      (this.selectBatch(this.qualExecution.batchId), (this.showBatchPreview = !0));
    }
    ensureCredentials(t) {
      let i = [...new Set(t.filter((o) => o > 0))],
        r = this.credentialQueue.then(() =>
          Ae(this, null, function* () {
            try {
              for (let o of i) {
                if (
                  (yield this.http
                    .get(this.api + '/profiles/' + o + '/credentials/status')
                    .toPromise())?.available
                )
                  continue;
                if (
                  !(yield new Promise((d) => {
                    ((this.credentialDone = d),
                      (this.credentialPrompt = {
                        ids: [o],
                        index: 0,
                        secret: '',
                        keyStoreSecret: '',
                      }));
                  }))
                )
                  return !1;
              }
              return !0;
            } catch (o) {
              return (this.fail(o), !1);
            }
          }),
        );
      return ((this.credentialQueue = r), r);
    }
    credentialProfileName() {
      let t = this.credentialPrompt?.ids[this.credentialPrompt.index];
      return this.profiles.find((i) => i.id === t)?.name || 'Selected database';
    }
    cancelCredentialPrompt() {
      this.credentialPrompt = null;
      let t = this.credentialDone;
      ((this.credentialDone = void 0), t?.(!1));
    }
    startQualitative() {
      return Ae(this, null, function* () {
        (yield this.ensureCredentials([
          this.qualExecution.sourceProfileId,
          this.qualExecution.targetProfileId,
        ])) && this.executeQualitative();
      });
    }
    submitQualCredential() {
      if (!this.credentialPrompt || this.credentialSaving) return;
      let t = this.credentialPrompt.ids[this.credentialPrompt.index];
      ((this.credentialSaving = !0),
        this.http
          .post(this.api + '/profiles/' + t + '/credentials', {
            databaseSecret: this.credentialPrompt.secret,
            keyStoreSecret: this.credentialPrompt.keyStoreSecret,
          })
          .subscribe({
            next: () => {
              ((this.credentialSaving = !1), (this.credentialPrompt = null));
              let i = this.credentialDone;
              ((this.credentialDone = void 0), i?.(!0));
            },
            error: (i) => {
              ((this.credentialSaving = !1), this.fail(i));
            },
          }));
    }
    executeQualitative() {
      this.http.post(`${this.api}/qualitative/runs`, this.qualExecution).subscribe({
        next: (t) => {
          ((this.qualRun = t), (this.message = 'Qualitative reconciliation started.'));
        },
        error: (t) => this.fail(t),
      });
    }
    loadQualitativeReports() {
      (this.http.get(`${this.api}/qualitative/reports`).subscribe((t) => (this.qualReports = t)),
        this.qualRun &&
          ['CREATED', 'RUNNING'].includes(this.qualRun.status) &&
          this.http
            .get(`${this.api}/qualitative/runs/${this.qualRun.reportId}/status`)
            .subscribe((t) => {
              ((this.qualRun = t),
                t.status.startsWith('COMPLETED') && this.loadQualitativeReports());
            }));
    }
    reloadQualitative(t) {
      this.http.get(`${this.api}/qualitative/reports/${t}`).subscribe((i) => {
        ((this.activeQualReport = i),
          (this.activePage = 'qualitative-reconciliation'),
          (this.qualSection = 'execute'));
      });
    }
    downloadQualitative(t) {
      window.open(`${this.api}/qualitative/reports/${t}/zip`, '_blank');
    }
    qualProgress() {
      return this.qualRun?.totalTables
        ? Math.round((this.qualRun.completedTables * 100) / this.qualRun.totalTables)
        : 0;
    }
    startReconciliation() {
      return Ae(this, null, function* () {
        (yield this.ensureCredentials([this.recon.sourceProfileId, this.recon.targetProfileId])) &&
          ((this.busy = !0),
          this.http.post(`${this.api}/reconciliation/runs`, this.recon).subscribe({
            next: (t) => {
              ((this.activeRun = t),
                (this.activeReconciliation = void 0),
                (this.objectCounts = []),
                (this.allTableCounts = []),
                this.pageTableCounts(0),
                (this.message = 'Quantitative reconciliation started.'),
                (this.busy = !1));
            },
            error: (t) => this.fail(t),
          }));
      });
    }
    selectReconciliation(t) {
      ((this.activeReconciliation = t), (this.activeRun = void 0), this.reloadReport(t.reportId));
    }
    reloadReport(t) {
      this.http.get(`${this.api}/reconciliation/reports/${t}`).subscribe((i) => {
        ((this.objectCounts = i.objectCounts),
          (this.allTableCounts = i.recordCounts),
          this.pageTableCounts(0),
          (this.activeReconciliation = this.reconciliationRuns.find((r) => r.reportId === t) ?? {
            reportId: t,
            generatedAt: i.metadata.generatedAt,
            source: i.metadata.source,
            target: i.metadata.target,
            status: i.metadata.status,
            matched: i.objectCounts.filter((r) => r.matched).length,
            mismatched: i.objectCounts.filter((r) => !r.matched).length,
            fileSize: 0,
            downloadable: !0,
          }));
      });
    }
    loadTableCounts(t) {
      this.pageTableCounts(t);
    }
    pageTableCounts(t) {
      let i = this.tableCounts.size,
        r = Math.min(t * i, this.allTableCounts.length);
      this.tableCounts = {
        content: this.allTableCounts.slice(r, r + i),
        number: t,
        size: i,
        totalElements: this.allTableCounts.length,
        totalPages: Math.ceil(this.allTableCounts.length / i),
      };
    }
    changeTableSize(t) {
      ((this.tableCounts.size = t), this.loadTableCounts(0));
    }
    openDetails(t) {
      ((this.details = t), this.pageDetails('source', 0), this.pageDetails('target', 0));
    }
    loadDetail(t, i) {
      this.pageDetails(t, i);
    }
    pageDetails(t, i) {
      if (!this.details) return;
      let r = t === 'source' ? this.details.missingInSource : this.details.missingInTarget,
        o = Math.min(i * this.detailSize, r.length),
        s = {
          content: r.slice(o, o + this.detailSize),
          page: i,
          size: this.detailSize,
          totalElements: r.length,
          totalPages: Math.ceil(r.length / this.detailSize),
        };
      t === 'source' ? (this.missingSource = s) : (this.missingTarget = s);
    }
    changeDetailSize(t) {
      ((this.detailSize = t), this.loadDetail('source', 0), this.loadDetail('target', 0));
    }
    downloadReport(t) {
      window.open(`${this.api}/reconciliation/reports/${t}/xlsx`, '_blank');
    }
    objectMatchCount(t) {
      return this.objectCounts.filter((i) => i.matched === t).length;
    }
    objectChartWidth(t) {
      return this.objectCounts.length
        ? Math.round((this.objectMatchCount(t) * 100) / this.objectCounts.length)
        : 0;
    }
    recordMatchCount(t) {
      return this.allTableCounts.filter((i) => (i.status === 'MATCHED') === t).length;
    }
    fail(t) {
      ((this.message = t?.error?.error || t?.message || 'Request failed'), (this.busy = !1));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)(L(La));
      };
    }
    static {
      this.ɵcmp = Yc({
        type: e,
        selectors: [['app-root']],
        standalone: !0,
        features: [Rd],
        decls: 62,
        vars: 24,
        consts: [
          [1, 'app-shell'],
          [1, 'sidebar'],
          [1, 'brand', 'techm-brand'],
          ['aria-hidden', 'true'],
          ['aria-label', 'Application navigation'],
          [1, 'menu-group'],
          [3, 'click'],
          [1, 'storage-state'],
          [1, 'workspace'],
          [1, 'topbar'],
          [1, 'breadcrumbs'],
          [1, 'memory-note'],
          ['class', 'notice', 4, 'ngIf'],
          [4, 'ngIf'],
          ['class', 'coming-soon', 4, 'ngIf'],
          ['class', 'modal-backdrop', 4, 'ngIf'],
          [1, 'notice'],
          [1, 'page-intro'],
          [1, 'eyebrow'],
          [1, 'table-card'],
          [1, 'right'],
          [4, 'ngFor', 'ngForOf'],
          [1, 'type-badge'],
          [1, 'tls'],
          [1, 'right', 'actions-cell'],
          [1, 'icon-button', 3, 'click'],
          [1, 'icon-button', 'danger', 3, 'click'],
          ['colspan', '6', 1, 'empty'],
          [1, 'modal-backdrop'],
          [1, 'dialog', 3, 'ngSubmit'],
          [1, 'dialog-head'],
          ['type', 'button', 1, 'close', 3, 'click'],
          [1, 'form-grid'],
          ['name', 'name', 'required', '', 3, 'ngModelChange', 'ngModel'],
          ['name', 'db', 3, 'ngModelChange', 'ngModel'],
          [
            'name',
            'databaseVersion',
            'required',
            '',
            'maxlength',
            '100',
            'placeholder',
            'e.g. 16.0 SP03 or 19c',
            3,
            'ngModelChange',
            'ngModel',
          ],
          ['name', 'auth', 3, 'ngModelChange', 'ngModel'],
          ['name', 'host', 'required', '', 3, 'ngModelChange', 'ngModel'],
          ['type', 'number', 'name', 'port', 3, 'ngModelChange', 'ngModel'],
          ['name', 'database', 3, 'ngModelChange', 'ngModel'],
          ['name', 'service', 3, 'ngModelChange', 'ngModel'],
          ['name', 'username', 3, 'ngModelChange', 'ngModel'],
          [1, 'check'],
          ['type', 'checkbox', 'name', 'tls', 3, 'ngModelChange', 'ngModel'],
          [1, 'dialog-actions'],
          ['type', 'button', 1, 'secondary', 3, 'click'],
          [3, 'disabled'],
          ['name', 'trust', 3, 'ngModelChange', 'ngModel'],
          ['name', 'key', 3, 'ngModelChange', 'ngModel'],
          [1, 'card', 'form-grid', 3, 'ngSubmit'],
          ['name', 'exportName', 'required', '', 'maxlength', '120', 3, 'ngModelChange', 'ngModel'],
          ['name', 'sourceProfile', 'required', '', 3, 'ngModelChange', 'ngModel'],
          [3, 'ngValue'],
          ['name', 'sourceSchema', 'required', '', 3, 'ngModelChange', 'ngModel', 'disabled'],
          ['value', ''],
          [3, 'value', 4, 'ngFor', 'ngForOf'],
          ['type', 'button', 1, 'secondary', 3, 'click', 'disabled'],
          ['class', 'notice', 'role', 'alert', 4, 'ngIf'],
          [1, 'subheading'],
          [1, 'secondary', 3, 'click'],
          ['class', 'card', 4, 'ngFor', 'ngForOf'],
          ['class', 'empty card', 4, 'ngIf'],
          [3, 'ngValue', 'disabled', 4, 'ngIf'],
          [3, 'ngValue', 'disabled'],
          [3, 'value'],
          ['role', 'alert', 1, 'notice'],
          [1, 'card'],
          [1, 'pill'],
          [2, 'overflow-wrap', 'anywhere'],
          [1, 'actions'],
          ['class', 'secondary', 3, 'click', 4, 'ngIf'],
          [1, 'empty', 'card'],
          [1, 'card', 'form-grid', 'migration-form'],
          [3, 'ngModelChange', 'ngModel'],
          [3, 'ngValue', 'hidden', 4, 'ngFor', 'ngForOf'],
          [3, 'ngModelChange', 'ngModel', 'disabled'],
          [1, 'secondary', 3, 'click', 'disabled'],
          ['type', 'checkbox', 3, 'ngModelChange', 'ngModel'],
          [3, 'click', 'disabled'],
          ['class', 'objects', 4, 'ngIf'],
          ['class', 'charts', 4, 'ngIf'],
          ['class', 'job card', 4, 'ngFor', 'ngForOf'],
          [3, 'ngValue', 'hidden'],
          [1, 'objects'],
          ['type', 'checkbox', 3, 'change'],
          [1, 'charts'],
          [1, 'stacked'],
          [1, 'success'],
          [1, 'failure'],
          [1, 'legend'],
          [1, 'dot', 'success'],
          [1, 'dot', 'failure'],
          [1, 'status-bars'],
          [1, 'warn'],
          [1, 'job', 'card'],
          [1, 'job-progress'],
          [1, 'percent'],
          ['class', 'secondary compact', 3, 'click', 4, 'ngIf'],
          [1, 'upload'],
          ['type', 'file', 'accept', 'application/json', 3, 'change'],
          [1, 'secondary', 'compact', 3, 'click'],
          [1, 'actions-cell'],
          ['colspan', '7', 1, 'empty'],
          [1, 'card', 'form-grid', 'recon-form'],
          ['class', 'recon-status card', 4, 'ngIf'],
          [1, 'icon-button', 3, 'click', 'disabled'],
          ['colspan', '8', 1, 'empty'],
          [1, 'recon-status', 'card'],
          [1, 'charts', 'recon-charts'],
          [1, 'donut-row'],
          [1, 'donut'],
          [1, 'legend', 'vertical'],
          [1, 'page-size'],
          ['class', 'pagination', 4, 'ngIf'],
          [1, 'match-icon'],
          ['class', 'link-button', 3, 'click', 4, 'ngIf'],
          [1, 'link-button', 3, 'click'],
          ['colspan', '4', 1, 'empty'],
          [1, 'pagination'],
          [1, 'dialog', 'detail-dialog'],
          [1, 'close', 3, 'click'],
          [1, 'detail-grids'],
          [1, 'mini-pagination'],
          [1, 'empty'],
          [1, 'qual-tabs'],
          ['class', 'card', 4, 'ngIf'],
          [1, 'form-grid', 'recon-form'],
          [
            'type',
            'number',
            'min',
            '1',
            'placeholder',
            'Blank if not a key',
            3,
            'ngModelChange',
            'ngModel',
          ],
          [3, 'ngValue', 4, 'ngFor', 'ngForOf'],
          [1, 'column-mapper'],
          ['class', 'map-column', 'draggable', 'true', 3, 'dragstart', 4, 'ngFor', 'ngForOf'],
          [1, 'mapping-wires'],
          ['class', 'map-column target', 3, 'dragover', 'drop', 4, 'ngFor', 'ngForOf'],
          ['draggable', 'true', 1, 'map-column', 3, 'dragstart'],
          [1, 'map-column', 'target', 3, 'dragover', 'drop'],
          ['placeholder', 'PRE-COB-NAU-001', 3, 'ngModelChange', 'ngModel'],
          ['class', 'batch-pair', 4, 'ngFor', 'ngForOf'],
          [1, 'batch-pair'],
          ['type', 'checkbox', 3, 'change', 'checked'],
          [1, 'secondary', 'compact', 3, 'click', 'disabled'],
          ['class', 'card recon-status', 4, 'ngIf'],
          [1, 'card', 'recon-status'],
          [1, 'qual-metrics'],
          [1, 'coming-soon'],
          [1, 'coming-icon'],
          [1, 'dialog'],
          ['type', 'password', 3, 'ngModelChange', 'ngModel'],
        ],
        template: function (i, r) {
          (i & 1 &&
            (l(0, 'div', 0)(1, 'aside', 1)(2, 'div', 2)(3, 'b', 3),
            te(4, 'i'),
            c(),
            l(5, 'div')(6, 'strong')(7, 'span'),
            u(8, 'TECH'),
            c(),
            l(9, 'em'),
            u(10, 'mahindra'),
            c()(),
            l(11, 'small'),
            u(12, 'Migration Studio'),
            c()()(),
            l(13, 'nav', 4)(14, 'div', 5)(15, 'span'),
            u(16, 'Migration'),
            c(),
            l(17, 'button', 6),
            E('click', function () {
              return r.navigate('source-scripts');
            }),
            u(18, ' Generate Source Scripts '),
            c(),
            l(19, 'button', 6),
            E('click', function () {
              return r.navigate('db-configurations');
            }),
            u(20, ' Database Configurations '),
            c(),
            l(21, 'button', 6),
            E('click', function () {
              return r.navigate('build-migrations');
            }),
            u(22, ' Build Migrations '),
            c()(),
            l(23, 'div', 5)(24, 'span'),
            u(25, 'Reconciliation'),
            c(),
            l(26, 'button', 6),
            E('click', function () {
              return r.navigate('reconciliation-home');
            }),
            u(27, ' Reports Home '),
            c(),
            l(28, 'button', 6),
            E('click', function () {
              return r.navigate('quantitative-reconciliation');
            }),
            u(29, ' Quantitative Recon '),
            c(),
            l(30, 'button', 6),
            E('click', function () {
              return r.navigate('qualitative-reconciliation');
            }),
            u(31, ' Qualitative Recon '),
            c()()(),
            l(32, 'div', 7),
            u(33, '\u25CF Configuration stored in H2'),
            c()(),
            l(34, 'div', 8)(35, 'header', 9)(36, 'div')(37, 'div', 10)(38, 'span'),
            u(39, 'Home'),
            c(),
            l(40, 'b'),
            u(41, '\u203A'),
            c(),
            l(42, 'span'),
            u(43),
            c(),
            l(44, 'b'),
            u(45, '\u203A'),
            c(),
            l(46, 'strong'),
            u(47),
            c()(),
            l(48, 'h1'),
            u(49),
            c()(),
            l(50, 'span', 11),
            u(51, 'Secrets: memory only'),
            c()(),
            l(52, 'main'),
            I(53, Qv, 2, 1, 'p', 12)(54, tC, 31, 3, 'section', 13)(55, uC, 39, 13, 'section', 13)(
              56,
              bC,
              56,
              21,
              'section',
              13,
            )(57, MC, 65, 4, 'section', 13)(58, ZC, 64, 15, 'section', 13)(
              59,
              xE,
              26,
              16,
              'section',
              13,
            )(60, SE, 9, 0, 'section', 14)(61, ME, 16, 5, 'div', 15),
            c()()()),
            i & 2 &&
              (f(17),
              de('active', r.activePage === 'source-scripts'),
              f(2),
              de('active', r.activePage === 'db-configurations'),
              f(2),
              de('active', r.activePage === 'build-migrations'),
              f(5),
              de('active', r.activePage === 'reconciliation-home'),
              f(2),
              de('active', r.activePage === 'quantitative-reconciliation'),
              f(2),
              de('active', r.activePage === 'qualitative-reconciliation'),
              f(13),
              D(r.activePage.includes('reconciliation') ? 'Reconciliation' : 'Migration'),
              f(4),
              D(r.pageTitle()),
              f(2),
              D(r.pageTitle()),
              f(4),
              _('ngIf', r.message),
              f(),
              _('ngIf', r.activePage === 'db-configurations'),
              f(),
              _('ngIf', r.activePage === 'source-scripts'),
              f(),
              _('ngIf', r.activePage === 'build-migrations'),
              f(),
              _('ngIf', r.activePage === 'reconciliation-home'),
              f(),
              _('ngIf', r.activePage === 'quantitative-reconciliation'),
              f(),
              _('ngIf', r.activePage === 'qualitative-reconciliation'),
              f(),
              _('ngIf', !1),
              f(),
              _('ngIf', r.credentialPrompt)));
        },
        dependencies: [Ra, Zd, Qd, Yd, zf, $f, Wf, qf, bo, tl, Za, Io, Ff, kf, rl, ol, il, el, Xa],
        encapsulation: 2,
      });
    }
  }
  return e;
})();
yf(Zf, { providers: [uf()] }).catch(console.error);
