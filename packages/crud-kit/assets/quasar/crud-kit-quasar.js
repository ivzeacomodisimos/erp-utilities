var CrudKitQuasar = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region node_modules/@vue/shared/dist/shared.esm-bundler.js
	/**
	* @vue/shared v3.5.43
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	// @__NO_SIDE_EFFECTS__
	function makeMap(str) {
		const map = /* @__PURE__ */ Object.create(null);
		for (const key of str.split(",")) map[key] = 1;
		return (val) => val in map;
	}
	var EMPTY_OBJ = Object.freeze({});
	var EMPTY_ARR = Object.freeze([]);
	var NOOP = () => {};
	var NO = () => false;
	var isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
	var isModelListener = (key) => key.startsWith("onUpdate:");
	var extend$1 = Object.assign;
	var remove$1 = (arr, el) => {
		const i = arr.indexOf(el);
		if (i > -1) arr.splice(i, 1);
	};
	var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
	var hasOwn$1 = (val, key) => hasOwnProperty$1.call(val, key);
	var isArray = Array.isArray;
	var isMap = (val) => toTypeString(val) === "[object Map]";
	var isSet = (val) => toTypeString(val) === "[object Set]";
	var isDate$1 = (val) => toTypeString(val) === "[object Date]";
	var isFunction = (val) => typeof val === "function";
	var isString = (val) => typeof val === "string";
	var isSymbol = (val) => typeof val === "symbol";
	var isObject$1 = (val) => val !== null && typeof val === "object";
	var isPromise = (val) => {
		return (isObject$1(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
	};
	var objectToString = Object.prototype.toString;
	var toTypeString = (value) => objectToString.call(value);
	var toRawType = (value) => {
		return toTypeString(value).slice(8, -1);
	};
	var isPlainObject$1 = (val) => toTypeString(val) === "[object Object]";
	var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
	var isReservedProp = /* @__PURE__ */ makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
	var isBuiltInDirective = /* @__PURE__ */ makeMap("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo");
	var cacheStringFunction = (fn) => {
		const cache = /* @__PURE__ */ Object.create(null);
		return ((str) => {
			return cache[str] || (cache[str] = fn(str));
		});
	};
	var camelizeRE = /-\w/g;
	var camelize = cacheStringFunction((str) => {
		return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
	});
	var hyphenateRE = /\B([A-Z])/g;
	var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
	var capitalize = cacheStringFunction((str) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	});
	var toHandlerKey = cacheStringFunction((str) => {
		return str ? `on${capitalize(str)}` : ``;
	});
	var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
	var invokeArrayFns = (fns, ...arg) => {
		for (let i = 0; i < fns.length; i++) fns[i](...arg);
	};
	var def = (obj, key, value, writable = false) => {
		Object.defineProperty(obj, key, {
			configurable: true,
			enumerable: false,
			writable,
			value
		});
	};
	var looseToNumber = (val) => {
		const n = parseFloat(val);
		return isNaN(n) ? val : n;
	};
	var toNumber = (val) => {
		const n = isString(val) ? Number(val) : NaN;
		return isNaN(n) ? val : n;
	};
	var _globalThis;
	var getGlobalThis = () => {
		return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	};
	function normalizeStyle(value) {
		if (isArray(value)) {
			const res = {};
			for (let i = 0; i < value.length; i++) {
				const item = value[i];
				const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
				if (normalized) for (const key in normalized) res[key] = normalized[key];
			}
			return res;
		} else if (isString(value) || isObject$1(value)) return value;
	}
	var listDelimiterRE = /;(?![^(]*\))/g;
	var propertyDelimiterRE = /:([^]+)/;
	var styleCommentRE = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
	function parseStringStyle(cssText) {
		const ret = {};
		cssText.replace(styleCommentRE, (match) => match.startsWith("/*") ? "" : match).split(listDelimiterRE).forEach((item) => {
			if (item) {
				const tmp = item.split(propertyDelimiterRE);
				tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
			}
		});
		return ret;
	}
	function normalizeClass(value) {
		let res = "";
		if (isString(value)) res = value;
		else if (isArray(value)) for (let i = 0; i < value.length; i++) {
			const normalized = normalizeClass(value[i]);
			if (normalized) res += normalized + " ";
		}
		else if (isObject$1(value)) {
			for (const name in value) if (value[name]) res += name + " ";
		}
		return res.trim();
	}
	function normalizeProps(props) {
		if (!props) return null;
		let { class: klass, style } = props;
		if (klass && !isString(klass)) props.class = normalizeClass(klass);
		if (style) props.style = normalizeStyle(style);
		return props;
	}
	var HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
	var SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
	var MATH_TAGS = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics";
	var isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
	var isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
	var isMathMLTag = /* @__PURE__ */ makeMap(MATH_TAGS);
	var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
	var isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
	specialBooleanAttrs + "";
	function includeBooleanAttr(value) {
		return !!value || value === "";
	}
	function looseCompareArrays(a, b, seen) {
		if (a.length !== b.length) return false;
		let equal = true;
		for (let i = 0; equal && i < a.length; i++) equal = looseEqual(a[i], b[i], seen);
		return equal;
	}
	function looseCompareCollections(a, b, seen) {
		if (a.size !== b.size) return false;
		const candidates = Array.from(b);
		const matched = new Uint8Array(candidates.length);
		for (const item of a) {
			let index = -1;
			for (let i = 0; i < candidates.length; i++) if (!matched[i] && looseEqual(item, candidates[i], seen)) {
				index = i;
				break;
			}
			if (index < 0) return false;
			matched[index] = 1;
		}
		return true;
	}
	function looseCompareObjects(a, b, seen) {
		let aValidType = isMap(a);
		let bValidType = isMap(b);
		if (aValidType || bValidType) return aValidType && bValidType ? looseCompareCollections(a, b, seen) : false;
		aValidType = isSet(a);
		bValidType = isSet(b);
		if (aValidType || bValidType) return aValidType && bValidType ? looseCompareCollections(a, b, seen) : false;
		if (Object.keys(a).length !== Object.keys(b).length) return false;
		for (const key in a) {
			const aHasKey = a.hasOwnProperty(key);
			const bHasKey = b.hasOwnProperty(key);
			if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key], seen)) return false;
		}
		return String(a) === String(b);
	}
	function looseCompareNested(a, b, seen, compare) {
		if (!seen) seen = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
		const [seenA, seenB] = seen;
		if (seenA.has(a) || seenB.has(b)) return seenA.get(a) === b && seenB.get(b) === a;
		seenA.set(a, b);
		seenB.set(b, a);
		const equal = compare(a, b, seen);
		seenA.delete(a);
		seenB.delete(b);
		return equal;
	}
	function looseEqual(a, b, seen) {
		if (a === b) return true;
		let aValidType = isDate$1(a);
		let bValidType = isDate$1(b);
		if (aValidType || bValidType) return aValidType && bValidType ? a.getTime() === b.getTime() : false;
		aValidType = isSymbol(a);
		bValidType = isSymbol(b);
		if (aValidType || bValidType) return a === b;
		aValidType = isArray(a);
		bValidType = isArray(b);
		if (aValidType || bValidType) return aValidType && bValidType ? looseCompareNested(a, b, seen, looseCompareArrays) : false;
		aValidType = isObject$1(a);
		bValidType = isObject$1(b);
		if (aValidType || bValidType) {
			if (!aValidType || !bValidType) return false;
			return looseCompareNested(a, b, seen, looseCompareObjects);
		}
		return String(a) === String(b);
	}
	var isRef$1 = (val) => {
		return !!(val && val["__v_isRef"] === true);
	};
	var toDisplayString = (val) => {
		return isString(val) ? val : val == null ? "" : isArray(val) || isObject$1(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
	};
	var replacer = (_key, val) => {
		if (isRef$1(val)) return replacer(_key, val.value);
		else if (isMap(val)) return { [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2], i) => {
			entries[stringifySymbol(key, i) + " =>"] = val2;
			return entries;
		}, {}) };
		else if (isSet(val)) return { [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v)) };
		else if (isSymbol(val)) return stringifySymbol(val);
		else if (isObject$1(val) && !isArray(val) && !isPlainObject$1(val)) return String(val);
		return val;
	};
	var stringifySymbol = (v, i = "") => {
		var _a;
		return isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v;
	};
	//#endregion
	//#region node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
	/**
	* @vue/reactivity v3.5.43
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	function warn$2(msg, ...args) {
		console.warn(`[Vue warn] ${msg}`, ...args);
	}
	var activeEffectScope;
	var EffectScope = class {
		constructor(detached = false) {
			this.detached = detached;
			/**
			* @internal
			*/
			this._active = true;
			/**
			* @internal track `on` calls, allow `on` call multiple times
			*/
			this._on = 0;
			/**
			* @internal
			*/
			this.effects = [];
			/**
			* @internal
			*/
			this.cleanups = [];
			this._isPaused = false;
			this._warnOnRun = true;
			this.__v_skip = true;
			if (!detached && activeEffectScope) {
				if (activeEffectScope.active) {
					this.parent = activeEffectScope;
					this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
				} else {
					this._active = false;
					this._warnOnRun = false;
				}
			}
		}
		get active() {
			return this._active;
		}
		pause() {
			if (this._active) {
				this._isPaused = true;
				let i, l;
				if (this.scopes) {
					const scopes = this.scopes.slice();
					for (i = 0, l = scopes.length; i < l; i++) scopes[i].pause();
				}
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].pause();
			}
		}
		/**
		* Resumes the effect scope, including all child scopes and effects.
		*/
		resume() {
			if (this._active) {
				if (this._isPaused) {
					this._isPaused = false;
					let i, l;
					if (this.scopes) {
						const scopes = this.scopes.slice();
						for (i = 0, l = scopes.length; i < l; i++) scopes[i].resume();
					}
					const effects = this.effects.slice();
					for (i = 0, l = effects.length; i < l; i++) effects[i].resume();
				}
			}
		}
		run(fn) {
			if (this._active) {
				const currentEffectScope = activeEffectScope;
				try {
					activeEffectScope = this;
					return fn();
				} finally {
					activeEffectScope = currentEffectScope;
				}
			} else if (this._warnOnRun) warn$2(`cannot run an inactive effect scope.`);
		}
		/**
		* This should only be called on non-detached scopes
		* @internal
		*/
		on() {
			if (++this._on === 1) {
				this.prevScope = activeEffectScope;
				activeEffectScope = this;
			}
		}
		/**
		* This should only be called on non-detached scopes
		* @internal
		*/
		off() {
			if (this._on > 0 && --this._on === 0) {
				if (activeEffectScope === this) activeEffectScope = this.prevScope;
				else {
					let current = activeEffectScope;
					while (current) {
						if (current.prevScope === this) {
							current.prevScope = this.prevScope;
							break;
						}
						current = current.prevScope;
					}
				}
				this.prevScope = void 0;
			}
		}
		stop(fromParent) {
			if (this._active) {
				this._active = false;
				let i, l;
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].stop();
				this.effects.length = 0;
				for (i = 0, l = this.cleanups.length; i < l; i++) this.cleanups[i]();
				this.cleanups.length = 0;
				if (this.scopes) {
					const scopes = this.scopes.slice();
					for (i = 0, l = scopes.length; i < l; i++) scopes[i].stop(true);
					this.scopes.length = 0;
				}
				if (!this.detached && this.parent && !fromParent) {
					const last = this.parent.scopes.pop();
					if (last && last !== this) {
						this.parent.scopes[this.index] = last;
						last.index = this.index;
					}
				}
				this.parent = void 0;
			}
		}
	};
	function effectScope(detached) {
		return new EffectScope(detached);
	}
	function getCurrentScope() {
		return activeEffectScope;
	}
	function onScopeDispose(fn, failSilently = false) {
		if (activeEffectScope) activeEffectScope.cleanups.push(fn);
		else if (!failSilently) warn$2(`onScopeDispose() is called when there is no active effect scope to be associated with.`);
	}
	var activeSub;
	var pausedQueueEffects = /* @__PURE__ */ new WeakSet();
	var ReactiveEffect = class {
		constructor(fn) {
			this.fn = fn;
			/**
			* @internal
			*/
			this.deps = void 0;
			/**
			* @internal
			*/
			this.depsTail = void 0;
			/**
			* @internal
			*/
			this.flags = 5;
			/**
			* @internal
			*/
			this.next = void 0;
			/**
			* @internal
			*/
			this.cleanup = void 0;
			this.scheduler = void 0;
			if (activeEffectScope) {
				if (activeEffectScope.active) activeEffectScope.effects.push(this);
				else this.flags &= -2;
			}
		}
		pause() {
			this.flags |= 64;
		}
		resume() {
			if (this.flags & 64) {
				this.flags &= -65;
				if (pausedQueueEffects.has(this)) {
					pausedQueueEffects.delete(this);
					this.trigger();
				}
			}
		}
		/**
		* @internal
		*/
		notify() {
			if (this.flags & 2 && !(this.flags & 32)) return;
			if (!(this.flags & 8)) batch(this);
		}
		run() {
			if (!(this.flags & 1)) return this.fn();
			this.flags |= 2;
			cleanupEffect(this);
			prepareDeps(this);
			const prevEffect = activeSub;
			const prevShouldTrack = shouldTrack;
			activeSub = this;
			shouldTrack = true;
			try {
				return this.fn();
			} finally {
				if (activeSub !== this) warn$2("Active effect was not restored correctly - this is likely a Vue internal bug.");
				cleanupDeps(this);
				activeSub = prevEffect;
				shouldTrack = prevShouldTrack;
				this.flags &= -3;
			}
		}
		stop() {
			if (this.flags & 1) {
				for (let link = this.deps; link; link = link.nextDep) removeSub(link);
				this.deps = this.depsTail = void 0;
				cleanupEffect(this);
				this.onStop && this.onStop();
				this.flags &= -2;
			}
		}
		trigger() {
			if (this.flags & 64) pausedQueueEffects.add(this);
			else if (this.scheduler) this.scheduler();
			else this.runIfDirty();
		}
		/**
		* @internal
		*/
		runIfDirty() {
			if (isDirty(this)) this.run();
		}
		get dirty() {
			return isDirty(this);
		}
	};
	var batchDepth = 0;
	var batchedSub;
	var batchedComputed;
	function batch(sub, isComputed = false) {
		sub.flags |= 8;
		if (isComputed) {
			sub.next = batchedComputed;
			batchedComputed = sub;
			return;
		}
		sub.next = batchedSub;
		batchedSub = sub;
	}
	function startBatch() {
		batchDepth++;
	}
	function endBatch() {
		if (--batchDepth > 0) return;
		if (batchedComputed) {
			let e = batchedComputed;
			batchedComputed = void 0;
			while (e) {
				const next = e.next;
				e.next = void 0;
				e.flags &= -9;
				e = next;
			}
		}
		let error;
		while (batchedSub) {
			let e = batchedSub;
			batchedSub = void 0;
			while (e) {
				const next = e.next;
				e.next = void 0;
				e.flags &= -9;
				if (e.flags & 1) try {
					e.trigger();
				} catch (err) {
					if (!error) error = err;
				}
				e = next;
			}
		}
		if (error) throw error;
	}
	function prepareDeps(sub) {
		for (let link = sub.deps; link; link = link.nextDep) {
			link.version = -1;
			link.prevActiveLink = link.dep.activeLink;
			link.dep.activeLink = link;
		}
	}
	function cleanupDeps(sub) {
		let head;
		let tail = sub.depsTail;
		let link = tail;
		while (link) {
			const prev = link.prevDep;
			if (link.version === -1) {
				if (link === tail) tail = prev;
				removeSub(link);
				removeDep(link);
			} else head = link;
			link.dep.activeLink = link.prevActiveLink;
			link.prevActiveLink = void 0;
			link = prev;
		}
		sub.deps = head;
		sub.depsTail = tail;
	}
	function isDirty(sub) {
		for (let link = sub.deps; link; link = link.nextDep) if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) return true;
		if (sub._dirty) return true;
		return false;
	}
	function refreshComputed(computed) {
		if (computed.flags & 4 && !(computed.flags & 16)) return;
		computed.flags &= -17;
		if (computed.globalVersion === globalVersion) return;
		computed.globalVersion = globalVersion;
		if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) return;
		computed.flags |= 2;
		const dep = computed.dep;
		const prevSub = activeSub;
		const prevShouldTrack = shouldTrack;
		activeSub = computed;
		shouldTrack = true;
		try {
			prepareDeps(computed);
			const value = computed.fn(computed._value);
			if (dep.version === 0 || hasChanged(value, computed._value)) {
				computed.flags |= 128;
				computed._value = value;
				dep.version++;
			}
		} catch (err) {
			dep.version++;
			throw err;
		} finally {
			activeSub = prevSub;
			shouldTrack = prevShouldTrack;
			cleanupDeps(computed);
			computed.flags &= -3;
		}
	}
	function removeSub(link, soft = false) {
		const { dep, prevSub, nextSub } = link;
		if (prevSub) {
			prevSub.nextSub = nextSub;
			link.prevSub = void 0;
		}
		if (nextSub) {
			nextSub.prevSub = prevSub;
			link.nextSub = void 0;
		}
		if (dep.subsHead === link) dep.subsHead = nextSub;
		if (dep.subs === link) {
			dep.subs = prevSub;
			if (!prevSub && dep.computed) {
				dep.computed.flags &= -5;
				for (let l = dep.computed.deps; l; l = l.nextDep) removeSub(l, true);
			}
		}
		if (!soft && !--dep.sc && dep.map) dep.map.delete(dep.key);
	}
	function removeDep(link) {
		const { prevDep, nextDep } = link;
		if (prevDep) {
			prevDep.nextDep = nextDep;
			link.prevDep = void 0;
		}
		if (nextDep) {
			nextDep.prevDep = prevDep;
			link.nextDep = void 0;
		}
	}
	var shouldTrack = true;
	var trackStack = [];
	function pauseTracking() {
		trackStack.push(shouldTrack);
		shouldTrack = false;
	}
	function resetTracking() {
		const last = trackStack.pop();
		shouldTrack = last === void 0 ? true : last;
	}
	function cleanupEffect(e) {
		const { cleanup } = e;
		e.cleanup = void 0;
		if (cleanup) {
			const prevSub = activeSub;
			activeSub = void 0;
			try {
				cleanup();
			} finally {
				activeSub = prevSub;
			}
		}
	}
	var globalVersion = 0;
	var Link = class {
		constructor(sub, dep) {
			this.sub = sub;
			this.dep = dep;
			this.version = dep.version;
			this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
		}
	};
	var Dep = class {
		constructor(computed) {
			this.computed = computed;
			this.version = 0;
			/**
			* Link between this dep and the current active effect
			*/
			this.activeLink = void 0;
			/**
			* Doubly linked list representing the subscribing effects (tail)
			*/
			this.subs = void 0;
			/**
			* For object property deps cleanup
			*/
			this.map = void 0;
			this.key = void 0;
			/**
			* Subscriber counter
			*/
			this.sc = 0;
			/**
			* @internal
			*/
			this.__v_skip = true;
			this.subsHead = void 0;
		}
		track(debugInfo) {
			if (!activeSub || !shouldTrack || activeSub === this.computed) return;
			let link = this.activeLink;
			if (link === void 0 || link.sub !== activeSub) {
				link = this.activeLink = new Link(activeSub, this);
				if (!activeSub.deps) activeSub.deps = activeSub.depsTail = link;
				else {
					link.prevDep = activeSub.depsTail;
					activeSub.depsTail.nextDep = link;
					activeSub.depsTail = link;
				}
				addSub(link);
			} else if (link.version === -1) {
				link.version = this.version;
				if (link.nextDep) {
					const next = link.nextDep;
					next.prevDep = link.prevDep;
					if (link.prevDep) link.prevDep.nextDep = next;
					link.prevDep = activeSub.depsTail;
					link.nextDep = void 0;
					activeSub.depsTail.nextDep = link;
					activeSub.depsTail = link;
					if (activeSub.deps === link) activeSub.deps = next;
				}
			}
			if (activeSub.onTrack) activeSub.onTrack(extend$1({ effect: activeSub }, debugInfo));
			return link;
		}
		trigger(debugInfo) {
			this.version++;
			globalVersion++;
			this.notify(debugInfo);
		}
		notify(debugInfo) {
			startBatch();
			try {
				for (let head = this.subsHead; head; head = head.nextSub) if (head.sub.onTrigger && !(head.sub.flags & 8)) head.sub.onTrigger(extend$1({ effect: head.sub }, debugInfo));
				for (let link = this.subs; link; link = link.prevSub) if (link.sub.notify()) link.sub.dep.notify();
			} finally {
				endBatch();
			}
		}
	};
	function addSub(link) {
		link.dep.sc++;
		if (link.sub.flags & 4) {
			const computed = link.dep.computed;
			if (computed && !link.dep.subs) {
				computed.flags |= 20;
				for (let l = computed.deps; l; l = l.nextDep) addSub(l);
			}
			const currentTail = link.dep.subs;
			if (currentTail !== link) {
				link.prevSub = currentTail;
				if (currentTail) currentTail.nextSub = link;
			}
			if (link.dep.subsHead === void 0) link.dep.subsHead = link;
			link.dep.subs = link;
		}
	}
	var targetMap = /* @__PURE__ */ new WeakMap();
	var ITERATE_KEY = /* @__PURE__ */ Symbol("Object iterate");
	var MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol("Map keys iterate");
	var ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol("Array iterate");
	function track(target, type, key) {
		if (shouldTrack && activeSub) {
			let depsMap = targetMap.get(target);
			if (!depsMap) targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
			let dep = depsMap.get(key);
			if (!dep) {
				depsMap.set(key, dep = new Dep());
				dep.map = depsMap;
				dep.key = key;
			}
			dep.track({
				target,
				type,
				key
			});
		}
	}
	function trigger(target, type, key, newValue, oldValue, oldTarget) {
		const depsMap = targetMap.get(target);
		if (!depsMap) {
			globalVersion++;
			return;
		}
		const run = (dep) => {
			if (dep) dep.trigger({
				target,
				type,
				key,
				newValue,
				oldValue,
				oldTarget
			});
		};
		startBatch();
		if (type === "clear") depsMap.forEach(run);
		else {
			const targetIsArray = isArray(target);
			const isArrayIndex = targetIsArray && isIntegerKey(key);
			if (targetIsArray && key === "length") {
				const newLength = Number(newValue);
				depsMap.forEach((dep, key2) => {
					if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) run(dep);
				});
			} else {
				if (key !== void 0 || depsMap.has(void 0)) run(depsMap.get(key));
				if (isArrayIndex) run(depsMap.get(ARRAY_ITERATE_KEY));
				switch (type) {
					case "add":
						if (!targetIsArray) {
							run(depsMap.get(ITERATE_KEY));
							if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
						} else if (isArrayIndex) run(depsMap.get("length"));
						break;
					case "delete":
						if (!targetIsArray) {
							run(depsMap.get(ITERATE_KEY));
							if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
						}
						break;
					case "set": if (isMap(target)) run(depsMap.get(ITERATE_KEY));
				}
			}
		}
		endBatch();
	}
	function reactiveReadArray(array) {
		const raw = /* @__PURE__ */ toRaw(array);
		if (raw === array) return raw;
		track(raw, "iterate", ARRAY_ITERATE_KEY);
		if (/* @__PURE__ */ isShallow(array)) return raw;
		if (!/* @__PURE__ */ isReadonly(array)) return raw.map(toReactive);
		return /* @__PURE__ */ isReactive(array) ? raw.map((item) => toReadonly(toReactive(item))) : raw.map(toReadonly);
	}
	function shallowReadArray(arr) {
		track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
		return arr;
	}
	function toWrapped(target, item) {
		if (/* @__PURE__ */ isReadonly(target)) return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
		return toReactive(item);
	}
	var arrayInstrumentations = {
		__proto__: null,
		[Symbol.iterator]() {
			return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
		},
		concat(...args) {
			return reactiveReadArray(this).concat(...args.map((x) => isArray(x) ? reactiveReadArray(x) : x));
		},
		entries() {
			return iterator(this, "entries", (value) => {
				value[1] = toWrapped(this, value[1]);
				return value;
			});
		},
		every(fn, thisArg) {
			return apply(this, "every", fn, thisArg, void 0, arguments);
		},
		filter(fn, thisArg) {
			return apply(this, "filter", fn, thisArg, (v) => v.map((item) => toWrapped(this, item)), arguments);
		},
		find(fn, thisArg) {
			return apply(this, "find", fn, thisArg, (item) => toWrapped(this, item), arguments);
		},
		findIndex(fn, thisArg) {
			return apply(this, "findIndex", fn, thisArg, void 0, arguments);
		},
		findLast(fn, thisArg) {
			return apply(this, "findLast", fn, thisArg, (item) => toWrapped(this, item), arguments);
		},
		findLastIndex(fn, thisArg) {
			return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
		},
		forEach(fn, thisArg) {
			return apply(this, "forEach", fn, thisArg, void 0, arguments);
		},
		includes(...args) {
			return searchProxy(this, "includes", args);
		},
		indexOf(...args) {
			return searchProxy(this, "indexOf", args);
		},
		join(separator) {
			return reactiveReadArray(this).join(separator);
		},
		lastIndexOf(...args) {
			return searchProxy(this, "lastIndexOf", args);
		},
		map(fn, thisArg) {
			return apply(this, "map", fn, thisArg, void 0, arguments);
		},
		pop() {
			return noTracking(this, "pop");
		},
		push(...args) {
			return noTracking(this, "push", args);
		},
		reduce(fn, ...args) {
			return reduce(this, "reduce", fn, args);
		},
		reduceRight(fn, ...args) {
			return reduce(this, "reduceRight", fn, args);
		},
		shift() {
			return noTracking(this, "shift");
		},
		some(fn, thisArg) {
			return apply(this, "some", fn, thisArg, void 0, arguments);
		},
		splice(...args) {
			return noTracking(this, "splice", args);
		},
		toReversed() {
			return reactiveReadArray(this).toReversed();
		},
		toSorted(comparer) {
			return reactiveReadArray(this).toSorted(comparer);
		},
		toSpliced(...args) {
			return reactiveReadArray(this).toSpliced(...args);
		},
		unshift(...args) {
			return noTracking(this, "unshift", args);
		},
		values() {
			return iterator(this, "values", (item) => toWrapped(this, item));
		}
	};
	function iterator(self, method, wrapValue) {
		const arr = shallowReadArray(self);
		const iter = arr[method]();
		if (arr !== self && !/* @__PURE__ */ isShallow(self)) {
			iter._next = iter.next;
			iter.next = () => {
				const result = iter._next();
				if (!result.done) result.value = wrapValue(result.value);
				return result;
			};
		}
		return iter;
	}
	var arrayProto = Array.prototype;
	function apply(self, method, fn, thisArg, wrappedRetFn, args) {
		const arr = shallowReadArray(self);
		const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
		const methodFn = arr[method];
		if (methodFn !== arrayProto[method]) {
			const result2 = methodFn.apply(self, args);
			return needsWrap ? toReactive(result2) : result2;
		}
		let wrappedFn = fn;
		if (arr !== self) {
			if (needsWrap) wrappedFn = function(item, index) {
				return fn.call(this, toWrapped(self, item), index, self);
			};
			else if (fn.length > 2) wrappedFn = function(item, index) {
				return fn.call(this, item, index, self);
			};
		}
		const result = methodFn.call(arr, wrappedFn, thisArg);
		return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
	}
	function reduce(self, method, fn, args) {
		const arr = shallowReadArray(self);
		const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
		let wrappedFn = fn;
		let wrapInitialAccumulator = false;
		if (arr !== self) {
			if (needsWrap) {
				wrapInitialAccumulator = args.length === 0;
				wrappedFn = function(acc, item, index) {
					if (wrapInitialAccumulator) {
						wrapInitialAccumulator = false;
						acc = toWrapped(self, acc);
					}
					return fn.call(this, acc, toWrapped(self, item), index, self);
				};
			} else if (fn.length > 3) wrappedFn = function(acc, item, index) {
				return fn.call(this, acc, item, index, self);
			};
		}
		const result = arr[method](wrappedFn, ...args);
		return wrapInitialAccumulator ? toWrapped(self, result) : result;
	}
	function searchProxy(self, method, args) {
		const arr = /* @__PURE__ */ toRaw(self);
		track(arr, "iterate", ARRAY_ITERATE_KEY);
		const res = arr[method](...args);
		if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
			args[0] = /* @__PURE__ */ toRaw(args[0]);
			return arr[method](...args);
		}
		return res;
	}
	function noTracking(self, method, args = []) {
		pauseTracking();
		startBatch();
		const res = (/* @__PURE__ */ toRaw(self))[method].apply(self, args);
		endBatch();
		resetTracking();
		return res;
	}
	var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
	var builtInSymbols = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol));
	function hasOwnProperty(key) {
		if (!isSymbol(key)) key = String(key);
		const obj = /* @__PURE__ */ toRaw(this);
		track(obj, "has", key);
		return obj.hasOwnProperty(key);
	}
	var BaseReactiveHandler = class {
		constructor(_isReadonly = false, _isShallow = false) {
			this._isReadonly = _isReadonly;
			this._isShallow = _isShallow;
		}
		get(target, key, receiver) {
			if (key === "__v_skip") return target["__v_skip"];
			const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
			if (key === "__v_isReactive") return !isReadonly2;
			else if (key === "__v_isReadonly") return isReadonly2;
			else if (key === "__v_isShallow") return isShallow2;
			else if (key === "__v_raw") {
				if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) return target;
				return;
			}
			const targetIsArray = isArray(target);
			if (!isReadonly2) {
				let fn;
				if (targetIsArray && (fn = arrayInstrumentations[key])) return fn;
				if (key === "hasOwnProperty") return hasOwnProperty;
			}
			const res = Reflect.get(target, key, /* @__PURE__ */ isRef(target) ? target : receiver);
			if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) return res;
			if (!isReadonly2) track(target, "get", key);
			if (isShallow2) return res;
			if (/* @__PURE__ */ isRef(res)) {
				const value = targetIsArray && isIntegerKey(key) ? res : res.value;
				return isReadonly2 && isObject$1(value) ? /* @__PURE__ */ readonly(value) : value;
			}
			if (isObject$1(res)) return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
			return res;
		}
	};
	var MutableReactiveHandler = class extends BaseReactiveHandler {
		constructor(isShallow2 = false) {
			super(false, isShallow2);
		}
		set(target, key, value, receiver) {
			let oldValue = target[key];
			const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
			if (!this._isShallow) {
				const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
				if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
					oldValue = /* @__PURE__ */ toRaw(oldValue);
					value = /* @__PURE__ */ toRaw(value);
				}
				if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
					if (isOldValueReadonly) {
						warn$2(`Set operation on key "${String(key)}" failed: target is readonly.`, target[key]);
						return true;
					} else {
						oldValue.value = value;
						return true;
					}
				}
			}
			const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn$1(target, key);
			const result = Reflect.set(target, key, value, /* @__PURE__ */ isRef(target) ? target : receiver);
			if (target === /* @__PURE__ */ toRaw(receiver) && result) {
				if (!hadKey) trigger(target, "add", key, value);
				else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
			}
			return result;
		}
		deleteProperty(target, key) {
			const hadKey = hasOwn$1(target, key);
			const oldValue = target[key];
			const result = Reflect.deleteProperty(target, key);
			if (result && hadKey) trigger(target, "delete", key, void 0, oldValue);
			return result;
		}
		has(target, key) {
			const result = Reflect.has(target, key);
			if (!isSymbol(key) || !builtInSymbols.has(key)) track(target, "has", key);
			return result;
		}
		ownKeys(target) {
			track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
			return Reflect.ownKeys(target);
		}
	};
	var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
		constructor(isShallow2 = false) {
			super(true, isShallow2);
		}
		set(target, key) {
			warn$2(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
			return true;
		}
		deleteProperty(target, key) {
			warn$2(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
			return true;
		}
	};
	var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
	var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
	var shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
	var shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
	var toShallow = (value) => value;
	var getProto = (v) => Reflect.getPrototypeOf(v);
	function createIterableMethod(method, isReadonly2, isShallow2) {
		return function(...args) {
			const target = this["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const targetIsMap = isMap(rawTarget);
			const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
			const isKeyOnly = method === "keys" && targetIsMap;
			const innerIterator = target[method](...args);
			const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
			!isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
			return extend$1(Object.create(innerIterator), { next() {
				const { value, done } = innerIterator.next();
				return done ? {
					value,
					done
				} : {
					value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
					done
				};
			} });
		};
	}
	function createReadonlyMethod(type) {
		return function(...args) {
			{
				const key = args[0] ? `on key "${args[0]}" ` : ``;
				warn$2(`${capitalize(type)} operation ${key}failed: target is readonly.`, /* @__PURE__ */ toRaw(this));
			}
			return type === "delete" ? false : type === "clear" ? void 0 : this;
		};
	}
	function createInstrumentations(readonly, shallow) {
		const instrumentations = {
			get(key) {
				const target = this["__v_raw"];
				const rawTarget = /* @__PURE__ */ toRaw(target);
				const rawKey = /* @__PURE__ */ toRaw(key);
				if (!readonly) {
					if (hasChanged(key, rawKey)) track(rawTarget, "get", key);
					track(rawTarget, "get", rawKey);
				}
				const { has } = getProto(rawTarget);
				const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
				if (has.call(rawTarget, key)) return wrap(target.get(key));
				else if (has.call(rawTarget, rawKey)) return wrap(target.get(rawKey));
				else if (target !== rawTarget) target.get(key);
			},
			get size() {
				const target = this["__v_raw"];
				!readonly && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
				return target.size;
			},
			has(key) {
				const target = this["__v_raw"];
				const rawTarget = /* @__PURE__ */ toRaw(target);
				const rawKey = /* @__PURE__ */ toRaw(key);
				if (!readonly) {
					if (hasChanged(key, rawKey)) track(rawTarget, "has", key);
					track(rawTarget, "has", rawKey);
				}
				return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
			},
			forEach(callback, thisArg) {
				const observed = this;
				const target = observed["__v_raw"];
				const rawTarget = /* @__PURE__ */ toRaw(target);
				const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
				!readonly && track(rawTarget, "iterate", ITERATE_KEY);
				return target.forEach((value, key) => {
					return callback.call(thisArg, wrap(value), wrap(key), observed);
				});
			}
		};
		extend$1(instrumentations, readonly ? {
			add: createReadonlyMethod("add"),
			set: createReadonlyMethod("set"),
			delete: createReadonlyMethod("delete"),
			clear: createReadonlyMethod("clear")
		} : {
			add(value) {
				const target = /* @__PURE__ */ toRaw(this);
				const proto = getProto(target);
				const rawValue = /* @__PURE__ */ toRaw(value);
				const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
				if (!(proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue))) {
					target.add(valueToAdd);
					trigger(target, "add", valueToAdd, valueToAdd);
				}
				return this;
			},
			set(key, value) {
				if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) value = /* @__PURE__ */ toRaw(value);
				const target = /* @__PURE__ */ toRaw(this);
				const { has, get } = getProto(target);
				let hadKey = has.call(target, key);
				if (!hadKey) {
					key = /* @__PURE__ */ toRaw(key);
					hadKey = has.call(target, key);
				} else checkIdentityKeys(target, has, key);
				const oldValue = get.call(target, key);
				target.set(key, value);
				if (!hadKey) trigger(target, "add", key, value);
				else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
				return this;
			},
			delete(key) {
				const target = /* @__PURE__ */ toRaw(this);
				const { has, get } = getProto(target);
				let hadKey = has.call(target, key);
				if (!hadKey) {
					key = /* @__PURE__ */ toRaw(key);
					hadKey = has.call(target, key);
				} else checkIdentityKeys(target, has, key);
				const oldValue = get ? get.call(target, key) : void 0;
				const result = target.delete(key);
				if (hadKey) trigger(target, "delete", key, void 0, oldValue);
				return result;
			},
			clear() {
				const target = /* @__PURE__ */ toRaw(this);
				const hadItems = target.size !== 0;
				const oldTarget = isMap(target) ? new Map(target) : new Set(target);
				const result = target.clear();
				if (hadItems) trigger(target, "clear", void 0, void 0, oldTarget);
				return result;
			}
		});
		[
			"keys",
			"values",
			"entries",
			Symbol.iterator
		].forEach((method) => {
			instrumentations[method] = createIterableMethod(method, readonly, shallow);
		});
		return instrumentations;
	}
	function createInstrumentationGetter(isReadonly2, shallow) {
		const instrumentations = createInstrumentations(isReadonly2, shallow);
		return (target, key, receiver) => {
			if (key === "__v_isReactive") return !isReadonly2;
			else if (key === "__v_isReadonly") return isReadonly2;
			else if (key === "__v_raw") return target;
			return Reflect.get(hasOwn$1(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
		};
	}
	var mutableCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(false, false) };
	var shallowCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(false, true) };
	var readonlyCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(true, false) };
	var shallowReadonlyCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(true, true) };
	function checkIdentityKeys(target, has, key) {
		const rawKey = /* @__PURE__ */ toRaw(key);
		if (rawKey !== key && has.call(target, rawKey)) {
			const type = toRawType(target);
			warn$2(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
		}
	}
	var reactiveMap = /* @__PURE__ */ new WeakMap();
	var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
	var readonlyMap = /* @__PURE__ */ new WeakMap();
	var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
	function targetTypeMap(rawType) {
		switch (rawType) {
			case "Object":
			case "Array": return 1;
			case "Map":
			case "Set":
			case "WeakMap":
			case "WeakSet": return 2;
			default: return 0;
		}
	}
	// @__NO_SIDE_EFFECTS__
	function reactive(target) {
		if (/* @__PURE__ */ isReadonly(target)) return target;
		return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
	}
	// @__NO_SIDE_EFFECTS__
	function shallowReactive(target) {
		return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
	}
	// @__NO_SIDE_EFFECTS__
	function readonly(target) {
		return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
	}
	// @__NO_SIDE_EFFECTS__
	function shallowReadonly(target) {
		return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
	}
	function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
		if (!isObject$1(target)) {
			warn$2(`value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(target)}`);
			return target;
		}
		if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) return target;
		if (target["__v_skip"] || !Object.isExtensible(target)) return target;
		const existingProxy = proxyMap.get(target);
		if (existingProxy) return existingProxy;
		const targetType = targetTypeMap(toRawType(target));
		if (targetType === 0) return target;
		const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
		proxyMap.set(target, proxy);
		return proxy;
	}
	// @__NO_SIDE_EFFECTS__
	function isReactive(value) {
		if (/* @__PURE__ */ isReadonly(value)) return /* @__PURE__ */ isReactive(value["__v_raw"]);
		return !!(value && value["__v_isReactive"]);
	}
	// @__NO_SIDE_EFFECTS__
	function isReadonly(value) {
		return !!(value && value["__v_isReadonly"]);
	}
	// @__NO_SIDE_EFFECTS__
	function isShallow(value) {
		return !!(value && value["__v_isShallow"]);
	}
	// @__NO_SIDE_EFFECTS__
	function isProxy(value) {
		return value ? !!value["__v_raw"] : false;
	}
	// @__NO_SIDE_EFFECTS__
	function toRaw(observed) {
		const raw = observed && observed["__v_raw"];
		return raw ? /* @__PURE__ */ toRaw(raw) : observed;
	}
	function markRaw(value) {
		if (!hasOwn$1(value, "__v_skip") && Object.isExtensible(value)) def(value, "__v_skip", true);
		return value;
	}
	var toReactive = (value) => isObject$1(value) ? /* @__PURE__ */ reactive(value) : value;
	var toReadonly = (value) => isObject$1(value) ? /* @__PURE__ */ readonly(value) : value;
	// @__NO_SIDE_EFFECTS__
	function isRef(r) {
		return r ? r["__v_isRef"] === true : false;
	}
	// @__NO_SIDE_EFFECTS__
	function ref(value) {
		return createRef(value, false);
	}
	// @__NO_SIDE_EFFECTS__
	function shallowRef(value) {
		return createRef(value, true);
	}
	function createRef(rawValue, shallow) {
		if (/* @__PURE__ */ isRef(rawValue)) return rawValue;
		return new RefImpl(rawValue, shallow);
	}
	var RefImpl = class {
		constructor(value, isShallow2) {
			this.dep = new Dep();
			this["__v_isRef"] = true;
			this["__v_isShallow"] = false;
			this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
			this._value = isShallow2 ? value : toReactive(value);
			this["__v_isShallow"] = isShallow2;
		}
		get value() {
			this.dep.track({
				target: this,
				type: "get",
				key: "value"
			});
			return this._value;
		}
		set value(newValue) {
			const oldValue = this._rawValue;
			const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
			newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
			if (hasChanged(newValue, oldValue)) {
				this._rawValue = newValue;
				this._value = useDirectValue ? newValue : toReactive(newValue);
				this.dep.trigger({
					target: this,
					type: "set",
					key: "value",
					newValue,
					oldValue
				});
			}
		}
	};
	function unref(ref2) {
		return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
	}
	function toValue(source) {
		return isFunction(source) ? source() : unref(source);
	}
	var shallowUnwrapHandlers = {
		get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
		set: (target, key, value, receiver) => {
			const oldValue = target[key];
			if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
				oldValue.value = value;
				return true;
			} else return Reflect.set(target, key, value, receiver);
		}
	};
	function proxyRefs(objectWithRefs) {
		return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
	}
	var CustomRefImpl = class {
		constructor(factory) {
			this["__v_isRef"] = true;
			this._value = void 0;
			const dep = this.dep = new Dep();
			const { get, set } = factory(dep.track.bind(dep), dep.trigger.bind(dep));
			this._get = get;
			this._set = set;
		}
		get value() {
			return this._value = this._get();
		}
		set value(newVal) {
			this._set(newVal);
		}
	};
	function customRef(factory) {
		return new CustomRefImpl(factory);
	}
	var ComputedRefImpl = class {
		constructor(fn, setter, isSSR) {
			this.fn = fn;
			this.setter = setter;
			/**
			* @internal
			*/
			this._value = void 0;
			/**
			* @internal
			*/
			this.dep = new Dep(this);
			/**
			* @internal
			*/
			this.__v_isRef = true;
			/**
			* @internal
			*/
			this.deps = void 0;
			/**
			* @internal
			*/
			this.depsTail = void 0;
			/**
			* @internal
			*/
			this.flags = 16;
			/**
			* @internal
			*/
			this.globalVersion = globalVersion - 1;
			/**
			* @internal
			*/
			this.next = void 0;
			this.effect = this;
			this["__v_isReadonly"] = !setter;
			this.isSSR = isSSR;
		}
		/**
		* @internal
		*/
		notify() {
			this.flags |= 16;
			if (!(this.flags & 8) && activeSub !== this) {
				batch(this, true);
				return true;
			}
		}
		get value() {
			const link = this.dep.track({
				target: this,
				type: "get",
				key: "value"
			});
			refreshComputed(this);
			if (link) link.version = this.dep.version;
			return this._value;
		}
		set value(newValue) {
			if (this.setter) this.setter(newValue);
			else warn$2("Write operation failed: computed value is readonly");
		}
	};
	// @__NO_SIDE_EFFECTS__
	function computed$1(getterOrOptions, debugOptions, isSSR = false) {
		let getter;
		let setter;
		if (isFunction(getterOrOptions)) getter = getterOrOptions;
		else {
			getter = getterOrOptions.get;
			setter = getterOrOptions.set;
		}
		const cRef = new ComputedRefImpl(getter, setter, isSSR);
		if (debugOptions && !isSSR) {
			cRef.onTrack = debugOptions.onTrack;
			cRef.onTrigger = debugOptions.onTrigger;
		}
		return cRef;
	}
	var INITIAL_WATCHER_VALUE = {};
	var cleanupMap = /* @__PURE__ */ new WeakMap();
	var activeWatcher = void 0;
	function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
		if (owner) {
			let cleanups = cleanupMap.get(owner);
			if (!cleanups) cleanupMap.set(owner, cleanups = []);
			cleanups.push(cleanupFn);
		} else if (!failSilently) warn$2(`onWatcherCleanup() was called when there was no active watcher to associate with.`);
	}
	function watch$1(source, cb, options = EMPTY_OBJ) {
		const { immediate, deep, once, scheduler, augmentJob, call } = options;
		const warnInvalidSource = (s) => {
			(options.onWarn || warn$2)(`Invalid watch source: `, s, `A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`);
		};
		const reactiveGetter = (source2) => {
			if (deep) return source2;
			if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0) return traverse(source2, 1);
			return traverse(source2);
		};
		let effect;
		let getter;
		let cleanup;
		let boundCleanup;
		let forceTrigger = false;
		let isMultiSource = false;
		if (/* @__PURE__ */ isRef(source)) {
			getter = () => source.value;
			forceTrigger = /* @__PURE__ */ isShallow(source);
		} else if (/* @__PURE__ */ isReactive(source)) {
			getter = () => reactiveGetter(source);
			forceTrigger = true;
		} else if (isArray(source)) {
			isMultiSource = true;
			forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
			getter = () => source.map((s) => {
				if (/* @__PURE__ */ isRef(s)) return s.value;
				else if (/* @__PURE__ */ isReactive(s)) return reactiveGetter(s);
				else if (isFunction(s)) return call ? call(s, 2) : s();
				else warnInvalidSource(s);
			});
		} else if (isFunction(source)) {
			if (cb) getter = call ? () => call(source, 2) : source;
			else getter = () => {
				if (cleanup) {
					pauseTracking();
					try {
						cleanup();
					} finally {
						resetTracking();
					}
				}
				const currentEffect = activeWatcher;
				activeWatcher = effect;
				try {
					return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
				} finally {
					activeWatcher = currentEffect;
				}
			};
		} else {
			getter = NOOP;
			warnInvalidSource(source);
		}
		if (cb && deep) {
			const baseGetter = getter;
			const depth = deep === true ? Infinity : deep;
			getter = () => traverse(baseGetter(), depth);
		}
		const scope = getCurrentScope();
		const watchHandle = () => {
			effect.stop();
			if (scope && scope.active) remove$1(scope.effects, effect);
		};
		if (once && cb) {
			const _cb = cb;
			cb = (...args) => {
				const res = _cb(...args);
				watchHandle();
				return res;
			};
		}
		let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
		const job = (immediateFirstRun) => {
			if (!(effect.flags & 1) || !effect.dirty && !immediateFirstRun) return;
			if (cb) {
				const newValue = effect.run();
				if (immediateFirstRun || deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
					if (cleanup) cleanup();
					const currentWatcher = activeWatcher;
					activeWatcher = effect;
					try {
						const args = [
							newValue,
							oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
							boundCleanup
						];
						oldValue = newValue;
						call ? call(cb, 3, args) : cb(...args);
					} finally {
						activeWatcher = currentWatcher;
					}
				}
			} else effect.run();
		};
		if (augmentJob) augmentJob(job);
		effect = new ReactiveEffect(getter);
		effect.scheduler = scheduler ? () => scheduler(job, false) : job;
		boundCleanup = (fn) => onWatcherCleanup(fn, false, effect);
		cleanup = effect.onStop = () => {
			const cleanups = cleanupMap.get(effect);
			if (cleanups) {
				if (call) call(cleanups, 4);
				else for (const cleanup2 of cleanups) cleanup2();
				cleanupMap.delete(effect);
			}
		};
		effect.onTrack = options.onTrack;
		effect.onTrigger = options.onTrigger;
		if (cb) {
			if (immediate) job(true);
			else oldValue = effect.run();
		} else if (scheduler) scheduler(job.bind(null, true), true);
		else effect.run();
		watchHandle.pause = effect.pause.bind(effect);
		watchHandle.resume = effect.resume.bind(effect);
		watchHandle.stop = watchHandle;
		return watchHandle;
	}
	function traverse(value, depth = Infinity, seen) {
		if (depth <= 0 || !isObject$1(value) || value["__v_skip"]) return value;
		seen = seen || /* @__PURE__ */ new Map();
		if ((seen.get(value) || 0) >= depth) return value;
		seen.set(value, depth);
		depth--;
		if (/* @__PURE__ */ isRef(value)) traverse(value.value, depth, seen);
		else if (isArray(value)) for (let i = 0; i < value.length; i++) traverse(value[i], depth, seen);
		else if (isSet(value) || isMap(value)) value.forEach((v) => {
			traverse(v, depth, seen);
		});
		else if (isPlainObject$1(value)) {
			for (const key in value) traverse(value[key], depth, seen);
			for (const key of Object.getOwnPropertySymbols(value)) if (Object.prototype.propertyIsEnumerable.call(value, key)) traverse(value[key], depth, seen);
		}
		return value;
	}
	//#endregion
	//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
	/**
	* @vue/runtime-core v3.5.43
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	var stack = [];
	function pushWarningContext(vnode) {
		stack.push(vnode);
	}
	function popWarningContext() {
		stack.pop();
	}
	var isWarning = false;
	function warn$1(msg, ...args) {
		if (isWarning) return;
		isWarning = true;
		pauseTracking();
		const instance = stack.length ? stack[stack.length - 1].component : null;
		const appWarnHandler = instance && instance.appContext.config.warnHandler;
		const trace = getComponentTrace();
		if (appWarnHandler) callWithErrorHandling(appWarnHandler, instance, 11, [
			msg + args.map((a) => {
				var _a, _b;
				return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
			}).join(""),
			instance && instance.proxy,
			trace.map(({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`).join("\n"),
			trace
		]);
		else {
			const warnArgs = [`[Vue warn]: ${msg}`, ...args];
			if (trace.length && true) warnArgs.push(`
`, ...formatTrace(trace));
			console.warn(...warnArgs);
		}
		resetTracking();
		isWarning = false;
	}
	function getComponentTrace() {
		let currentVNode = stack[stack.length - 1];
		if (!currentVNode) return [];
		const normalizedStack = [];
		while (currentVNode) {
			const last = normalizedStack[0];
			if (last && last.vnode === currentVNode) last.recurseCount++;
			else normalizedStack.push({
				vnode: currentVNode,
				recurseCount: 0
			});
			const parentInstance = currentVNode.component && currentVNode.component.parent;
			currentVNode = parentInstance && parentInstance.vnode;
		}
		return normalizedStack;
	}
	function formatTrace(trace) {
		const logs = [];
		trace.forEach((entry, i) => {
			logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
		});
		return logs;
	}
	function formatTraceEntry({ vnode, recurseCount }) {
		const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
		const isRoot = vnode.component ? vnode.component.parent == null : false;
		const open = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
		const close = `>` + postfix;
		return vnode.props ? [
			open,
			...formatProps(vnode.props),
			close
		] : [open + close];
	}
	function formatProps(props) {
		const res = [];
		const keys = Object.keys(props);
		keys.slice(0, 3).forEach((key) => {
			res.push(...formatProp(key, props[key]));
		});
		if (keys.length > 3) res.push(` ...`);
		return res;
	}
	function formatProp(key, value, raw) {
		if (isString(value)) {
			value = JSON.stringify(value);
			return raw ? value : [`${key}=${value}`];
		} else if (typeof value === "number" || typeof value === "boolean" || value == null) return raw ? value : [`${key}=${value}`];
		else if (/* @__PURE__ */ isRef(value)) {
			value = formatProp(key, /* @__PURE__ */ toRaw(value.value), true);
			return raw ? value : [
				`${key}=Ref<`,
				value,
				`>`
			];
		} else if (isFunction(value)) return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
		else {
			value = /* @__PURE__ */ toRaw(value);
			return raw ? value : [`${key}=`, value];
		}
	}
	function assertNumber(val, type) {
		if (val === void 0) return;
		else if (typeof val !== "number") warn$1(`${type} is not a valid number - got ${JSON.stringify(val)}.`);
		else if (isNaN(val)) warn$1(`${type} is NaN - the duration expression might be incorrect.`);
	}
	var ErrorTypeStrings$1 = {
		["sp"]: "serverPrefetch hook",
		["bc"]: "beforeCreate hook",
		["c"]: "created hook",
		["bm"]: "beforeMount hook",
		["m"]: "mounted hook",
		["bu"]: "beforeUpdate hook",
		["u"]: "updated",
		["bum"]: "beforeUnmount hook",
		["um"]: "unmounted hook",
		["a"]: "activated hook",
		["da"]: "deactivated hook",
		["ec"]: "errorCaptured hook",
		["rtc"]: "renderTracked hook",
		["rtg"]: "renderTriggered hook",
		[0]: "setup function",
		[1]: "render function",
		[2]: "watcher getter",
		[3]: "watcher callback",
		[4]: "watcher cleanup function",
		[5]: "native event handler",
		[6]: "component event handler",
		[7]: "vnode hook",
		[8]: "directive hook",
		[9]: "transition hook",
		[10]: "app errorHandler",
		[11]: "app warnHandler",
		[12]: "ref function",
		[13]: "async component loader",
		[14]: "scheduler flush",
		[15]: "component update",
		[16]: "app unmount cleanup function"
	};
	function callWithErrorHandling(fn, instance, type, args) {
		try {
			return args ? fn(...args) : fn();
		} catch (err) {
			handleError(err, instance, type);
		}
	}
	function callWithAsyncErrorHandling(fn, instance, type, args) {
		if (isFunction(fn)) {
			const res = callWithErrorHandling(fn, instance, type, args);
			if (res && isPromise(res)) res.catch((err) => {
				handleError(err, instance, type);
			});
			return res;
		}
		if (isArray(fn)) {
			const values = [];
			for (let i = 0; i < fn.length; i++) values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
			return values;
		} else warn$1(`Invalid value type passed to callWithAsyncErrorHandling(): ${typeof fn}`);
	}
	function handleError(err, instance, type, throwInDev = true) {
		const contextVNode = instance ? instance.vnode : null;
		const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
		if (instance) {
			let cur = instance.parent;
			const exposedInstance = instance.proxy;
			const errorInfo = ErrorTypeStrings$1[type];
			while (cur) {
				const errorCapturedHooks = cur.ec;
				if (errorCapturedHooks) {
					for (let i = 0; i < errorCapturedHooks.length; i++) if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) return;
				}
				cur = cur.parent;
			}
			if (errorHandler) {
				pauseTracking();
				callWithErrorHandling(errorHandler, null, 10, [
					err,
					exposedInstance,
					errorInfo
				]);
				resetTracking();
				return;
			}
		}
		logError$1(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
	}
	function logError$1(err, type, contextVNode, throwInDev = true, throwInProd = false) {
		{
			const info = ErrorTypeStrings$1[type];
			if (contextVNode) pushWarningContext(contextVNode);
			warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
			if (contextVNode) popWarningContext();
			if (throwInDev) throw err;
			else console.error(err);
		}
	}
	var queue$1 = [];
	var flushIndex = -1;
	var pendingPostFlushCbs = [];
	var activePostFlushCbs = null;
	var postFlushIndex = 0;
	var resolvedPromise = /* @__PURE__ */ Promise.resolve();
	var currentFlushPromise = null;
	var RECURSION_LIMIT = 100;
	function nextTick(fn) {
		const p = currentFlushPromise || resolvedPromise;
		return fn ? p.then(this ? fn.bind(this) : fn) : p;
	}
	function findInsertionIndex(id) {
		let start = flushIndex + 1;
		let end = queue$1.length;
		while (start < end) {
			const middle = start + end >>> 1;
			const middleJob = queue$1[middle];
			const middleJobId = getId$1(middleJob);
			if (middleJobId < id || middleJobId === id && middleJob.flags & 2) start = middle + 1;
			else end = middle;
		}
		return start;
	}
	function queueJob(job) {
		if (!(job.flags & 1)) {
			const jobId = getId$1(job);
			const lastJob = queue$1[queue$1.length - 1];
			if (!lastJob || !(job.flags & 2) && jobId >= getId$1(lastJob)) queue$1.push(job);
			else queue$1.splice(findInsertionIndex(jobId), 0, job);
			job.flags |= 1;
			queueFlush();
		}
	}
	function queueFlush() {
		if (!currentFlushPromise) currentFlushPromise = resolvedPromise.then(flushJobs);
	}
	function queuePostFlushCb(cb) {
		if (!isArray(cb)) {
			if (activePostFlushCbs && cb.id === -1) activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
			else if (!(cb.flags & 1)) {
				pendingPostFlushCbs.push(cb);
				cb.flags |= 1;
			}
		} else for (let i = 0; i < cb.length; i++) pendingPostFlushCbs.push(cb[i]);
		queueFlush();
	}
	function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
		seen = seen || /* @__PURE__ */ new Map();
		for (; i < queue$1.length; i++) {
			const cb = queue$1[i];
			if (cb && cb.flags & 2) {
				if (instance && cb.id !== instance.uid) continue;
				if (checkRecursiveUpdates(seen, cb)) continue;
				queue$1.splice(i, 1);
				i--;
				if (cb.flags & 4) cb.flags &= -2;
				cb();
				if (!(cb.flags & 4)) cb.flags &= -2;
			}
		}
	}
	function flushPostFlushCbs(seen) {
		if (pendingPostFlushCbs.length) {
			const deduped = [...new Set(pendingPostFlushCbs)].sort((a, b) => getId$1(a) - getId$1(b));
			pendingPostFlushCbs.length = 0;
			if (activePostFlushCbs) {
				for (let i = 0; i < deduped.length; i++) activePostFlushCbs.push(deduped[i]);
				return;
			}
			activePostFlushCbs = deduped;
			seen = seen || /* @__PURE__ */ new Map();
			for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
				const cb = activePostFlushCbs[postFlushIndex];
				if (checkRecursiveUpdates(seen, cb)) continue;
				if (cb.flags & 4) cb.flags &= -2;
				if (!(cb.flags & 8)) cb();
				cb.flags &= -2;
			}
			activePostFlushCbs = null;
			postFlushIndex = 0;
		}
	}
	var getId$1 = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
	function flushJobs(seen) {
		seen = seen || /* @__PURE__ */ new Map();
		const check = (job) => checkRecursiveUpdates(seen, job);
		try {
			for (flushIndex = 0; flushIndex < queue$1.length; flushIndex++) {
				const job = queue$1[flushIndex];
				if (job && !(job.flags & 8)) {
					if (check(job)) continue;
					if (job.flags & 4) job.flags &= -2;
					callWithErrorHandling(job, job.i, job.i ? 15 : 14);
					if (!(job.flags & 4)) job.flags &= -2;
				}
			}
		} finally {
			for (; flushIndex < queue$1.length; flushIndex++) {
				const job = queue$1[flushIndex];
				if (job) job.flags &= -2;
			}
			flushIndex = -1;
			queue$1.length = 0;
			flushPostFlushCbs(seen);
			currentFlushPromise = null;
			if (queue$1.length || pendingPostFlushCbs.length) flushJobs(seen);
		}
	}
	function checkRecursiveUpdates(seen, fn) {
		const count = seen.get(fn) || 0;
		if (count > RECURSION_LIMIT) {
			const instance = fn.i;
			const componentName = instance && getComponentName(instance.type);
			handleError(`Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`, null, 10);
			return true;
		}
		seen.set(fn, count + 1);
		return false;
	}
	var isHmrUpdating = false;
	var setHmrUpdating = (v) => {
		try {
			return isHmrUpdating;
		} finally {
			isHmrUpdating = v;
		}
	};
	var hmrDirtyComponents = /* @__PURE__ */ new Map();
	getGlobalThis().__VUE_HMR_RUNTIME__ = {
		createRecord: tryWrap(createRecord),
		rerender: tryWrap(rerender),
		reload: tryWrap(reload$1)
	};
	var map = /* @__PURE__ */ new Map();
	function registerHMR(instance) {
		const id = instance.type.__hmrId;
		let record = map.get(id);
		if (!record) {
			createRecord(id, instance.type);
			record = map.get(id);
		}
		record.instances.add(instance);
	}
	function unregisterHMR(instance) {
		map.get(instance.type.__hmrId).instances.delete(instance);
	}
	function createRecord(id, initialDef) {
		if (map.has(id)) return false;
		map.set(id, {
			initialDef: normalizeClassComponent(initialDef),
			instances: /* @__PURE__ */ new Set()
		});
		return true;
	}
	function normalizeClassComponent(component) {
		return isClassComponent(component) ? component.__vccOpts : component;
	}
	function rerender(id, newRender) {
		const record = map.get(id);
		if (!record) return;
		record.initialDef.render = newRender;
		[...record.instances].forEach((instance) => {
			if (newRender) {
				instance.render = newRender;
				normalizeClassComponent(instance.type).render = newRender;
			}
			instance.renderCache = [];
			isHmrUpdating = true;
			if (!(instance.job.flags & 8)) instance.update();
			isHmrUpdating = false;
		});
	}
	function reload$1(id, newComp) {
		const record = map.get(id);
		if (!record) return;
		newComp = normalizeClassComponent(newComp);
		updateComponentDef(record.initialDef, newComp);
		const instances = [...record.instances];
		for (let i = 0; i < instances.length; i++) {
			const instance = instances[i];
			const oldComp = normalizeClassComponent(instance.type);
			let dirtyInstances = hmrDirtyComponents.get(oldComp);
			if (!dirtyInstances) {
				if (oldComp !== record.initialDef) updateComponentDef(oldComp, newComp);
				hmrDirtyComponents.set(oldComp, dirtyInstances = /* @__PURE__ */ new Set());
			}
			dirtyInstances.add(instance);
			instance.appContext.propsCache.delete(instance.type);
			instance.appContext.emitsCache.delete(instance.type);
			instance.appContext.optionsCache.delete(instance.type);
			if (instance.ceReload) {
				dirtyInstances.add(instance);
				instance.ceReload(newComp.styles);
				dirtyInstances.delete(instance);
			} else if (instance.parent) queueJob(() => {
				if (!(instance.job.flags & 8)) {
					isHmrUpdating = true;
					instance.parent.update();
					isHmrUpdating = false;
					dirtyInstances.delete(instance);
				}
			});
			else if (instance.appContext.reload) instance.appContext.reload();
			else if (typeof window !== "undefined") window.location.reload();
			else console.warn("[HMR] Root or manually mounted instance modified. Full reload required.");
			if (instance.root.ce && instance !== instance.root) instance.root.ce._removeChildStyle(oldComp);
		}
		queuePostFlushCb(() => {
			hmrDirtyComponents.clear();
		});
	}
	function updateComponentDef(oldComp, newComp) {
		extend$1(oldComp, newComp);
		for (const key in oldComp) if (key !== "__file" && !(key in newComp)) delete oldComp[key];
	}
	function tryWrap(fn) {
		return (id, arg) => {
			try {
				return fn(id, arg);
			} catch (e) {
				console.error(e);
				console.warn(`[HMR] Something went wrong during Vue component hot-reload. Full reload required.`);
			}
		};
	}
	var devtools$1;
	var buffer = [];
	var devtoolsNotInstalled = false;
	function emit$1(event, ...args) {
		if (devtools$1) devtools$1.emit(event, ...args);
		else if (!devtoolsNotInstalled) buffer.push({
			event,
			args
		});
	}
	function setDevtoolsHook$1(hook, target) {
		var _a, _b;
		devtools$1 = hook;
		if (devtools$1) {
			devtools$1.enabled = true;
			buffer.forEach(({ event, args }) => devtools$1.emit(event, ...args));
			buffer = [];
		} else if (typeof window !== "undefined" && window.HTMLElement && !((_b = (_a = window.navigator) == null ? void 0 : _a.userAgent) == null ? void 0 : _b.includes("jsdom"))) {
			(target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((newHook) => {
				setDevtoolsHook$1(newHook, target);
			});
			setTimeout(() => {
				if (!devtools$1) {
					target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
					devtoolsNotInstalled = true;
					buffer = [];
				}
			}, 3e3);
		} else {
			devtoolsNotInstalled = true;
			buffer = [];
		}
	}
	function devtoolsInitApp(app, version) {
		emit$1("app:init", app, version, {
			Fragment,
			Text,
			Comment,
			Static
		});
	}
	function devtoolsUnmountApp(app) {
		emit$1("app:unmount", app);
	}
	var devtoolsComponentAdded = /* @__PURE__ */ createDevtoolsComponentHook("component:added");
	var devtoolsComponentUpdated = /* @__PURE__ */ createDevtoolsComponentHook("component:updated");
	var _devtoolsComponentRemoved = /* @__PURE__ */ createDevtoolsComponentHook("component:removed");
	var devtoolsComponentRemoved = (component) => {
		if (devtools$1 && typeof devtools$1.cleanupBuffer === "function" && !devtools$1.cleanupBuffer(component)) _devtoolsComponentRemoved(component);
	};
	// @__NO_SIDE_EFFECTS__
	function createDevtoolsComponentHook(hook) {
		return (component) => {
			emit$1(hook, component.appContext.app, component.uid, component.parent ? component.parent.uid : void 0, component);
		};
	}
	var devtoolsPerfStart = /* @__PURE__ */ createDevtoolsPerformanceHook("perf:start");
	var devtoolsPerfEnd = /* @__PURE__ */ createDevtoolsPerformanceHook("perf:end");
	function createDevtoolsPerformanceHook(hook) {
		return (component, type, time) => {
			emit$1(hook, component.appContext.app, component.uid, component, type, time);
		};
	}
	function devtoolsComponentEmit(component, event, params) {
		emit$1("component:emit", component.appContext.app, component, event, params);
	}
	var currentRenderingInstance = null;
	var currentScopeId = null;
	function setCurrentRenderingInstance(instance) {
		const prev = currentRenderingInstance;
		currentRenderingInstance = instance;
		currentScopeId = instance && instance.type.__scopeId || null;
		return prev;
	}
	function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
		if (!ctx) return fn;
		if (fn._n) return fn;
		const renderFnWithContext = (...args) => {
			if (renderFnWithContext._d) setBlockTracking(-1);
			const prevInstance = setCurrentRenderingInstance(ctx);
			const prevStackSize = blockStack.length;
			let res;
			try {
				res = fn(...args);
			} finally {
				for (let i = blockStack.length; i > prevStackSize; i--) closeBlock();
				setCurrentRenderingInstance(prevInstance);
				if (renderFnWithContext._d) setBlockTracking(1);
			}
			devtoolsComponentUpdated(ctx);
			return res;
		};
		renderFnWithContext._n = true;
		renderFnWithContext._c = true;
		renderFnWithContext._d = true;
		return renderFnWithContext;
	}
	function validateDirectiveName(name) {
		if (isBuiltInDirective(name)) warn$1("Do not use built-in directive ids as custom directive id: " + name);
	}
	function withDirectives(vnode, directives) {
		if (currentRenderingInstance === null) {
			warn$1(`withDirectives can only be used inside render functions.`);
			return vnode;
		}
		const instance = getComponentPublicInstance(currentRenderingInstance);
		const bindings = vnode.dirs || (vnode.dirs = []);
		for (let i = 0; i < directives.length; i++) {
			let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
			if (dir) {
				if (isFunction(dir)) dir = {
					mounted: dir,
					updated: dir
				};
				if (dir.deep) traverse(value);
				bindings.push({
					dir,
					instance,
					value,
					oldValue: void 0,
					arg,
					modifiers
				});
			}
		}
		return vnode;
	}
	function invokeDirectiveHook(vnode, prevVNode, instance, name) {
		const bindings = vnode.dirs;
		const oldBindings = prevVNode && prevVNode.dirs;
		for (let i = 0; i < bindings.length; i++) {
			const binding = bindings[i];
			if (oldBindings) binding.oldValue = oldBindings[i].value;
			let hook = binding.dir[name];
			if (hook) {
				pauseTracking();
				callWithAsyncErrorHandling(hook, instance, 8, [
					vnode.el,
					binding,
					vnode,
					prevVNode
				]);
				resetTracking();
			}
		}
	}
	function provide(key, value) {
		if (!currentInstance || currentInstance.isMounted) warn$1(`provide() can only be used inside setup().`);
		if (currentInstance) {
			let provides = currentInstance.provides;
			const parentProvides = currentInstance.parent && currentInstance.parent.provides;
			if (parentProvides === provides) provides = currentInstance.provides = Object.create(parentProvides);
			provides[key] = value;
		}
	}
	function inject(key, defaultValue, treatDefaultAsFactory = false) {
		const instance = getCurrentInstance();
		if (instance || currentApp) {
			let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
			if (provides && key in provides) return provides[key];
			else if (arguments.length > 1) return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
			else warn$1(`injection "${String(key)}" not found.`);
		} else warn$1(`inject() can only be used inside setup() or functional components.`);
	}
	var ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
	var useSSRContext = () => {
		{
			const ctx = inject(ssrContextKey);
			if (!ctx) warn$1(`Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build.`);
			return ctx;
		}
	};
	function watch(source, cb, options) {
		if (!isFunction(cb)) warn$1(`\`watch(fn, options?)\` signature has been moved to a separate API. Use \`watchEffect(fn, options?)\` instead. \`watch\` now only supports \`watch(source, cb, options?) signature.`);
		return doWatch(source, cb, options);
	}
	function doWatch(source, cb, options = EMPTY_OBJ) {
		const { immediate, deep, flush, once } = options;
		if (!cb) {
			if (immediate !== void 0) warn$1(`watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`);
			if (deep !== void 0) warn$1(`watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`);
			if (once !== void 0) warn$1(`watch() "once" option is only respected when using the watch(source, callback, options?) signature.`);
		}
		const baseWatchOptions = extend$1({}, options);
		baseWatchOptions.onWarn = warn$1;
		const runsImmediately = cb && immediate || !cb && flush !== "post";
		let ssrCleanup;
		if (isInSSRComponentSetup) {
			if (flush === "sync") {
				const ctx = useSSRContext();
				ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
			} else if (!runsImmediately) {
				const watchStopHandle = () => {};
				watchStopHandle.stop = NOOP;
				watchStopHandle.resume = NOOP;
				watchStopHandle.pause = NOOP;
				return watchStopHandle;
			}
		}
		const instance = currentInstance;
		baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
		let isPre = false;
		if (flush === "post") baseWatchOptions.scheduler = (job) => {
			queuePostRenderEffect(job, instance && instance.suspense);
		};
		else if (flush !== "sync") {
			isPre = true;
			baseWatchOptions.scheduler = (job, isFirstRun) => {
				if (isFirstRun) job();
				else queueJob(job);
			};
		}
		baseWatchOptions.augmentJob = (job) => {
			if (cb) job.flags |= 4;
			if (isPre) {
				job.flags |= 2;
				if (instance) {
					job.id = instance.uid;
					job.i = instance;
				}
			}
		};
		const watchHandle = watch$1(source, cb, baseWatchOptions);
		if (isInSSRComponentSetup) {
			if (ssrCleanup) ssrCleanup.push(watchHandle);
			else if (runsImmediately) watchHandle();
		}
		return watchHandle;
	}
	function instanceWatch(source, value, options) {
		const publicThis = this.proxy;
		const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
		let cb;
		if (isFunction(value)) cb = value;
		else {
			cb = value.handler;
			options = value;
		}
		const reset = setCurrentInstance(this);
		const res = doWatch(getter, cb.bind(publicThis), options);
		reset();
		return res;
	}
	function createPathGetter(ctx, path) {
		const segments = path.split(".");
		return () => {
			let cur = ctx;
			for (let i = 0; i < segments.length && cur; i++) cur = cur[segments[i]];
			return cur;
		};
	}
	var pendingMounts = /* @__PURE__ */ new WeakMap();
	var TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
	var isTeleport = (type) => type.__isTeleport;
	var isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
	var isTeleportDeferred = (props) => props && (props.defer || props.defer === "");
	var isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
	var isTargetMathML = (target) => typeof MathMLElement === "function" && target instanceof MathMLElement;
	var resolveTarget = (props, select) => {
		const targetSelector = props && props.to;
		if (isString(targetSelector)) {
			if (!select) {
				warn$1(`Current renderer does not support string target for Teleports. (missing querySelector renderer option)`);
				return null;
			} else {
				const target = select(targetSelector);
				if (!target && !isTeleportDisabled(props)) warn$1(`Failed to locate Teleport target with selector "${targetSelector}". Note the target element must exist before the component is mounted - i.e. the target cannot be rendered by the component itself, and ideally should be outside of the entire Vue component tree.`);
				return target;
			}
		} else {
			if (!targetSelector && !isTeleportDisabled(props)) warn$1(`Invalid Teleport target: ${targetSelector}`);
			return targetSelector;
		}
	};
	var TeleportImpl = {
		name: "Teleport",
		__isTeleport: true,
		process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals) {
			const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment, parentNode } } = internals;
			const disabled = isTeleportDisabled(n2.props);
			let { dynamicChildren } = n2;
			if (isHmrUpdating) {
				optimized = false;
				dynamicChildren = null;
			}
			const mount = (vnode, container2, anchor2) => {
				if (vnode.shapeFlag & 16) mountChildren(vnode.children, container2, anchor2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			};
			const mountToTarget = (vnode = n2) => {
				const disabled2 = isTeleportDisabled(vnode.props);
				const target = vnode.target = resolveTarget(vnode.props, querySelector);
				const targetAnchor = prepareAnchor(target, vnode, createText, insert);
				if (target) {
					if (namespace !== "svg" && isTargetSVG(target)) namespace = "svg";
					else if (namespace !== "mathml" && isTargetMathML(target)) namespace = "mathml";
					if (parentComponent && parentComponent.isCE) (parentComponent.ce._teleportTargets || (parentComponent.ce._teleportTargets = /* @__PURE__ */ new Set())).add(target);
					if (!disabled2) {
						mount(vnode, target, targetAnchor);
						updateCssVars(vnode, false);
					}
				} else if (!disabled2) warn$1("Invalid Teleport target on mount:", target, `(${typeof target})`);
			};
			const queuePendingMount = (vnode) => {
				const mountJob = () => {
					if (pendingMounts.get(vnode) !== mountJob) return;
					pendingMounts.delete(vnode);
					if (isTeleportDisabled(vnode.props)) {
						const mountContainer = parentNode(vnode.el) || container;
						mount(vnode, mountContainer, vnode.anchor);
						updateCssVars(vnode, true);
					}
					mountToTarget(vnode);
				};
				pendingMounts.set(vnode, mountJob);
				queuePostRenderEffect(mountJob, parentSuspense);
			};
			if (n1 == null) {
				const placeholder = n2.el = createComment("teleport start");
				const mainAnchor = n2.anchor = createComment("teleport end");
				insert(placeholder, container, anchor);
				insert(mainAnchor, container, anchor);
				if (isTeleportDeferred(n2.props) || parentSuspense && parentSuspense.pendingBranch) {
					queuePendingMount(n2);
					return;
				}
				if (disabled) {
					mount(n2, container, mainAnchor);
					updateCssVars(n2, true);
				}
				mountToTarget();
			} else {
				n2.el = n1.el;
				const mainAnchor = n2.anchor = n1.anchor;
				const pendingMount = pendingMounts.get(n1);
				if (pendingMount) {
					pendingMount.flags |= 8;
					pendingMounts.delete(n1);
					queuePendingMount(n2);
					return;
				}
				n2.targetStart = n1.targetStart;
				const target = n2.target = n1.target;
				const targetAnchor = n2.targetAnchor = n1.targetAnchor;
				const wasDisabled = isTeleportDisabled(n1.props);
				const currentContainer = wasDisabled ? container : target;
				const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
				if (namespace === "svg" || isTargetSVG(target)) namespace = "svg";
				else if (namespace === "mathml" || isTargetMathML(target)) namespace = "mathml";
				if (dynamicChildren) {
					patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, namespace, slotScopeIds);
					traverseStaticChildren(n1, n2, false);
				} else if (!optimized) patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, false);
				if (disabled) {
					if (!wasDisabled) moveTeleport(n2, container, mainAnchor, internals, 1);
					else if (n2.props && n1.props && n2.props.to !== n1.props.to) n2.props.to = n1.props.to;
				} else if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
					const nextTarget = resolveTarget(n2.props, querySelector);
					if (nextTarget) {
						n2.target = nextTarget;
						moveTeleport(n2, nextTarget, null, internals, 0);
					} else warn$1("Invalid Teleport target on update:", target, `(${typeof target})`);
				} else if (wasDisabled) moveTeleport(n2, target, targetAnchor, internals, 1);
				updateCssVars(n2, disabled);
			}
		},
		remove(vnode, parentComponent, parentSuspense, { um: unmount, o: { remove: hostRemove } }, doRemove) {
			const { shapeFlag, children, anchor, targetStart, targetAnchor, target, props } = vnode;
			const disabled = isTeleportDisabled(props);
			const shouldRemove = doRemove || !disabled;
			const pendingMount = pendingMounts.get(vnode);
			if (pendingMount) {
				pendingMount.flags |= 8;
				pendingMounts.delete(vnode);
			}
			if (target) {
				hostRemove(targetStart);
				hostRemove(targetAnchor);
			}
			doRemove && hostRemove(anchor);
			if (!pendingMount && (disabled || target) && shapeFlag & 16) for (let i = 0; i < children.length; i++) {
				const child = children[i];
				unmount(child, parentComponent, parentSuspense, shouldRemove, !!child.dynamicChildren);
			}
		},
		move: moveTeleport,
		hydrate: hydrateTeleport
	};
	function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
		if (moveType === 0) insert(vnode.targetAnchor, container, parentAnchor);
		const { el, anchor, shapeFlag, children, props } = vnode;
		const isReorder = moveType === 2;
		if (isReorder) insert(el, container, parentAnchor);
		if (!pendingMounts.has(vnode) && (!isReorder || isTeleportDisabled(props))) {
			if (shapeFlag & 16) for (let i = 0; i < children.length; i++) move(children[i], container, parentAnchor, 2);
		}
		if (isReorder) insert(anchor, container, parentAnchor);
	}
	function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector, insert, createText } }, hydrateChildren) {
		function hydrateAnchor(target2, targetNode) {
			let targetAnchor = targetNode;
			while (targetAnchor) {
				if (targetAnchor && targetAnchor.nodeType === 8) {
					if (targetAnchor.data === "teleport start anchor") vnode.targetStart = targetAnchor;
					else if (targetAnchor.data === "teleport anchor") {
						vnode.targetAnchor = targetAnchor;
						target2._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
						break;
					}
				}
				targetAnchor = nextSibling(targetAnchor);
			}
		}
		function hydrateDisabledTeleport(node2, vnode2) {
			vnode2.anchor = hydrateChildren(nextSibling(node2), vnode2, parentNode(node2), parentComponent, parentSuspense, slotScopeIds, optimized);
		}
		const target = vnode.target = resolveTarget(vnode.props, querySelector);
		const disabled = isTeleportDisabled(vnode.props);
		if (target) {
			const targetNode = target._lpa || target.firstChild;
			if (vnode.shapeFlag & 16) {
				if (disabled) {
					hydrateDisabledTeleport(node, vnode);
					hydrateAnchor(target, targetNode);
					if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert, parentNode(node) === target ? node : null);
				} else {
					vnode.anchor = nextSibling(node);
					hydrateAnchor(target, targetNode);
					if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert);
					hydrateChildren(targetNode && nextSibling(targetNode), vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
				}
			}
			updateCssVars(vnode, disabled);
		} else if (disabled) {
			if (vnode.shapeFlag & 16) {
				hydrateDisabledTeleport(node, vnode);
				vnode.targetStart = node;
				vnode.targetAnchor = nextSibling(node);
			}
		}
		return vnode.anchor && nextSibling(vnode.anchor);
	}
	var Teleport = TeleportImpl;
	function updateCssVars(vnode, isDisabled) {
		const ctx = vnode.ctx;
		if (ctx && ctx.ut) {
			let node, anchor;
			if (isDisabled) {
				node = vnode.el;
				anchor = vnode.anchor;
			} else {
				node = vnode.targetStart;
				anchor = vnode.targetAnchor;
			}
			while (node && node !== anchor) {
				if (node.nodeType === 1) node.setAttribute("data-v-owner", ctx.uid);
				node = node.nextSibling;
			}
			ctx.ut();
		}
	}
	function prepareAnchor(target, vnode, createText, insert, anchor = null) {
		const targetStart = vnode.targetStart = createText("");
		const targetAnchor = vnode.targetAnchor = createText("");
		targetStart[TeleportEndKey] = targetAnchor;
		if (target) {
			insert(targetStart, target, anchor);
			insert(targetAnchor, target, anchor);
		}
		return targetAnchor;
	}
	var leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
	var enterCbKey$1 = /* @__PURE__ */ Symbol("_enterCb");
	function useTransitionState() {
		const state = {
			isMounted: false,
			isLeaving: false,
			isUnmounting: false,
			leavingVNodes: /* @__PURE__ */ new Map()
		};
		onMounted(() => {
			state.isMounted = true;
		});
		onBeforeUnmount(() => {
			state.isUnmounting = true;
		});
		return state;
	}
	var TransitionHookValidator = [Function, Array];
	var BaseTransitionPropsValidators = {
		mode: String,
		appear: Boolean,
		persisted: Boolean,
		onBeforeEnter: TransitionHookValidator,
		onEnter: TransitionHookValidator,
		onAfterEnter: TransitionHookValidator,
		onEnterCancelled: TransitionHookValidator,
		onBeforeLeave: TransitionHookValidator,
		onLeave: TransitionHookValidator,
		onAfterLeave: TransitionHookValidator,
		onLeaveCancelled: TransitionHookValidator,
		onBeforeAppear: TransitionHookValidator,
		onAppear: TransitionHookValidator,
		onAfterAppear: TransitionHookValidator,
		onAppearCancelled: TransitionHookValidator
	};
	var recursiveGetSubtree = (instance) => {
		const subTree = instance.subTree;
		return subTree.component ? recursiveGetSubtree(subTree.component) : subTree;
	};
	var BaseTransitionImpl = {
		name: `BaseTransition`,
		props: BaseTransitionPropsValidators,
		setup(props, { slots }) {
			const instance = getCurrentInstance();
			const state = useTransitionState();
			return () => {
				const children = slots.default && getTransitionRawChildren(slots.default(), true);
				const child = children && children.length ? findNonCommentChild(children) : instance.subTree ? createCommentVNode() : void 0;
				if (!child) return;
				const rawProps = /* @__PURE__ */ toRaw(props);
				const { mode } = rawProps;
				if (mode && mode !== "in-out" && mode !== "out-in" && mode !== "default") warn$1(`invalid <transition> mode: ${mode}`);
				if (state.isLeaving) return emptyPlaceholder(child);
				const innerChild = getInnerChild$1(child);
				if (!innerChild) return emptyPlaceholder(child);
				let enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance, (hooks) => enterHooks = hooks);
				if (innerChild.type !== Comment) setTransitionHooks(innerChild, enterHooks);
				let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
				if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(oldInnerChild, innerChild) && recursiveGetSubtree(instance).type !== Comment) {
					let leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
					setTransitionHooks(oldInnerChild, leavingHooks);
					if (mode === "out-in" && innerChild.type !== Comment) {
						state.isLeaving = true;
						leavingHooks.afterLeave = () => {
							state.isLeaving = false;
							if (!(instance.job.flags & 8)) instance.update();
							delete leavingHooks.afterLeave;
							oldInnerChild = void 0;
						};
						return emptyPlaceholder(child);
					} else if (mode === "in-out" && innerChild.type !== Comment) leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
						const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
						leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
						el[leaveCbKey] = () => {
							earlyRemove();
							el[leaveCbKey] = void 0;
							delete enterHooks.delayedLeave;
							oldInnerChild = void 0;
						};
						enterHooks.delayedLeave = () => {
							delayedLeave();
							delete enterHooks.delayedLeave;
							oldInnerChild = void 0;
						};
					};
					else oldInnerChild = void 0;
				} else if (oldInnerChild) oldInnerChild = void 0;
				return child;
			};
		}
	};
	function findNonCommentChild(children) {
		let child = children[0];
		if (children.length > 1) {
			let hasFound = false;
			for (const c of children) if (c.type !== Comment) {
				if (hasFound) {
					warn$1("<transition> can only be used on a single element or component. Use <transition-group> for lists.");
					break;
				}
				child = c;
				hasFound = true;
			}
		}
		return child;
	}
	var BaseTransition = BaseTransitionImpl;
	function getLeavingNodesForType(state, vnode) {
		const { leavingVNodes } = state;
		let leavingVNodesCache = leavingVNodes.get(vnode.type);
		if (!leavingVNodesCache) {
			leavingVNodesCache = /* @__PURE__ */ Object.create(null);
			leavingVNodes.set(vnode.type, leavingVNodesCache);
		}
		return leavingVNodesCache;
	}
	function resolveTransitionHooks(vnode, props, state, instance, postClone) {
		const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
		const key = String(vnode.key);
		const leavingVNodesCache = getLeavingNodesForType(state, vnode);
		const callHook = (hook, args) => {
			hook && callWithAsyncErrorHandling(hook, instance, 9, args);
		};
		const callAsyncHook = (hook, args) => {
			const done = args[1];
			callHook(hook, args);
			if (isArray(hook)) {
				if (hook.every((hook2) => hook2.length <= 1)) done();
			} else if (hook.length <= 1) done();
		};
		const hooks = {
			mode,
			persisted,
			beforeEnter(el) {
				let hook = onBeforeEnter;
				if (!state.isMounted) {
					if (appear) hook = onBeforeAppear || onBeforeEnter;
					else return;
				}
				if (el[leaveCbKey]) el[leaveCbKey](true);
				const leavingVNode = leavingVNodesCache[key];
				if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) leavingVNode.el[leaveCbKey]();
				callHook(hook, [el]);
			},
			enter(el) {
				if (!isHmrUpdating && leavingVNodesCache[key] === vnode) return;
				let hook = onEnter;
				let afterHook = onAfterEnter;
				let cancelHook = onEnterCancelled;
				if (!state.isMounted) {
					if (appear) {
						hook = onAppear || onEnter;
						afterHook = onAfterAppear || onAfterEnter;
						cancelHook = onAppearCancelled || onEnterCancelled;
					} else return;
				}
				let called = false;
				el[enterCbKey$1] = (cancelled) => {
					if (called) return;
					called = true;
					if (cancelled) callHook(cancelHook, [el]);
					else callHook(afterHook, [el]);
					if (hooks.delayedLeave) hooks.delayedLeave();
					el[enterCbKey$1] = void 0;
				};
				const done = el[enterCbKey$1].bind(null, false);
				if (hook) callAsyncHook(hook, [el, done]);
				else done();
			},
			leave(el, remove) {
				const key2 = String(vnode.key);
				if (el[enterCbKey$1]) el[enterCbKey$1](true);
				if (state.isUnmounting) return remove();
				callHook(onBeforeLeave, [el]);
				let called = false;
				el[leaveCbKey] = (cancelled) => {
					if (called) return;
					called = true;
					remove();
					if (cancelled) callHook(onLeaveCancelled, [el]);
					else callHook(onAfterLeave, [el]);
					el[leaveCbKey] = void 0;
					if (leavingVNodesCache[key2] === vnode) delete leavingVNodesCache[key2];
				};
				const done = el[leaveCbKey].bind(null, false);
				leavingVNodesCache[key2] = vnode;
				if (onLeave) callAsyncHook(onLeave, [el, done]);
				else done();
			},
			clone(vnode2) {
				const hooks2 = resolveTransitionHooks(vnode2, props, state, instance, postClone);
				if (postClone) postClone(hooks2);
				return hooks2;
			}
		};
		return hooks;
	}
	function emptyPlaceholder(vnode) {
		if (isKeepAlive(vnode)) {
			vnode = cloneVNode(vnode);
			vnode.children = null;
			return vnode;
		}
	}
	function getInnerChild$1(vnode) {
		if (!isKeepAlive(vnode)) {
			if (isTeleport(vnode.type) && vnode.children) return findNonCommentChild(vnode.children);
			return vnode;
		}
		if (vnode.component) return vnode.component.subTree;
		const { shapeFlag, children } = vnode;
		if (children) {
			if (shapeFlag & 16) return children[0];
			if (shapeFlag & 32 && isFunction(children.default)) return children.default();
		}
	}
	function setTransitionHooks(vnode, hooks) {
		if (vnode.shapeFlag & 6 && vnode.component) {
			vnode.transition = hooks;
			const subTree = vnode.component.subTree;
			setTransitionHooks(isTeleport(subTree.type) ? getInnerChild$1(subTree) || subTree : subTree, hooks);
		} else if (vnode.shapeFlag & 128) {
			vnode.ssContent.transition = hooks.clone(vnode.ssContent);
			vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
		} else vnode.transition = hooks;
	}
	function getTransitionRawChildren(children, keepComment = false, parentKey) {
		let ret = [];
		let keyedFragmentCount = 0;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
			if (child.type === Fragment) {
				if (child.patchFlag & 128) keyedFragmentCount++;
				ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
			} else if (keepComment || child.type !== Comment) ret.push(key != null ? cloneVNode(child, { key }) : child);
		}
		if (keyedFragmentCount > 1) for (let i = 0; i < ret.length; i++) ret[i].patchFlag = -2;
		return ret;
	}
	// @__NO_SIDE_EFFECTS__
	function defineComponent(options, extraOptions) {
		return isFunction(options) ? /* @__PURE__ */ (() => extend$1({ name: options.name }, extraOptions, { setup: options }))() : options;
	}
	function markAsyncBoundary(instance) {
		instance.ids = [
			instance.ids[0] + instance.ids[2]++ + "-",
			0,
			0
		];
	}
	var knownTemplateRefs = /* @__PURE__ */ new WeakSet();
	function isTemplateRefKey(refs, key) {
		let desc;
		return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
	}
	var pendingSetRefMap = /* @__PURE__ */ new WeakMap();
	function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
		if (isArray(rawRef)) {
			rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
			return;
		}
		if (isAsyncWrapper(vnode) && !isUnmount) {
			if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
			return;
		}
		const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
		const value = isUnmount ? null : refValue;
		const { i: owner, r: ref } = rawRef;
		if (!owner) {
			warn$1(`Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function.`);
			return;
		}
		const oldRef = oldRawRef && oldRawRef.r;
		const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
		const setupState = owner.setupState;
		const rawSetupState = /* @__PURE__ */ toRaw(setupState);
		const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
			if (hasOwn$1(rawSetupState, key) && !/* @__PURE__ */ isRef(rawSetupState[key])) warn$1(`Template ref "${key}" used on a non-ref value. It will not work in the production build.`);
			if (knownTemplateRefs.has(rawSetupState[key])) return false;
			if (isTemplateRefKey(refs, key)) return false;
			return hasOwn$1(rawSetupState, key);
		};
		const canSetRef = (ref2, key) => {
			if (knownTemplateRefs.has(ref2)) return false;
			if (key && isTemplateRefKey(refs, key)) return false;
			return true;
		};
		if (oldRef != null && oldRef !== ref) {
			invalidatePendingSetRef(oldRawRef);
			if (isString(oldRef)) {
				refs[oldRef] = null;
				if (canSetSetupRef(oldRef)) setupState[oldRef] = null;
			} else if (/* @__PURE__ */ isRef(oldRef)) {
				const oldRawRefAtom = oldRawRef;
				if (canSetRef(oldRef, oldRawRefAtom.k)) oldRef.value = null;
				if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
			}
		}
		if (isFunction(ref)) callWithErrorHandling(ref, owner, 12, [value, refs]);
		else {
			const _isString = isString(ref);
			const _isRef = /* @__PURE__ */ isRef(ref);
			if (_isString || _isRef) {
				const doSet = () => {
					if (rawRef.f) {
						const existing = _isString ? canSetSetupRef(ref) ? setupState[ref] : refs[ref] : canSetRef(ref) || !rawRef.k ? ref.value : refs[rawRef.k];
						if (isUnmount) isArray(existing) && remove$1(existing, refValue);
						else if (!isArray(existing)) {
							if (_isString) {
								refs[ref] = [refValue];
								if (canSetSetupRef(ref)) setupState[ref] = refs[ref];
							} else {
								const newVal = [refValue];
								if (canSetRef(ref, rawRef.k)) ref.value = newVal;
								if (rawRef.k) refs[rawRef.k] = newVal;
							}
						} else if (!existing.includes(refValue)) existing.push(refValue);
					} else if (_isString) {
						refs[ref] = value;
						if (canSetSetupRef(ref)) setupState[ref] = value;
					} else if (_isRef) {
						if (canSetRef(ref, rawRef.k)) ref.value = value;
						if (rawRef.k) refs[rawRef.k] = value;
					} else warn$1("Invalid template ref type:", ref, `(${typeof ref})`);
				};
				if (value) {
					const job = () => {
						doSet();
						pendingSetRefMap.delete(rawRef);
					};
					job.id = -1;
					pendingSetRefMap.set(rawRef, job);
					queuePostRenderEffect(job, parentSuspense);
				} else {
					invalidatePendingSetRef(rawRef);
					doSet();
				}
			} else warn$1("Invalid template ref type:", ref, `(${typeof ref})`);
		}
	}
	function invalidatePendingSetRef(rawRef) {
		const pendingSetRef = pendingSetRefMap.get(rawRef);
		if (pendingSetRef) {
			pendingSetRef.flags |= 8;
			pendingSetRefMap.delete(rawRef);
		}
	}
	getGlobalThis().requestIdleCallback;
	getGlobalThis().cancelIdleCallback;
	var isAsyncWrapper = (i) => !!i.type.__asyncLoader;
	var isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
	function onActivated(hook, target) {
		registerKeepAliveHook(hook, "a", target);
	}
	function onDeactivated(hook, target) {
		registerKeepAliveHook(hook, "da", target);
	}
	function registerKeepAliveHook(hook, type, target = currentInstance) {
		const wrappedHook = hook.__wdc || (hook.__wdc = () => {
			let current = target;
			while (current) {
				if (current.isDeactivated) return;
				current = current.parent;
			}
			return hook();
		});
		injectHook(type, wrappedHook, target);
		if (target) {
			let current = target.parent;
			while (current && current.parent) {
				if (isKeepAlive(current.parent.vnode)) injectToKeepAliveRoot(wrappedHook, type, target, current);
				current = current.parent;
			}
		}
	}
	function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
		const injected = injectHook(type, hook, keepAliveRoot, true);
		onUnmounted(() => {
			remove$1(keepAliveRoot[type], injected);
		}, target);
	}
	function injectHook(type, hook, target = currentInstance, prepend = false) {
		if (target) {
			const hooks = target[type] || (target[type] = []);
			const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
				pauseTracking();
				const reset = setCurrentInstance(target);
				const res = callWithAsyncErrorHandling(hook, target, type, args);
				reset();
				resetTracking();
				return res;
			});
			if (prepend) hooks.unshift(wrappedHook);
			else hooks.push(wrappedHook);
			return wrappedHook;
		} else warn$1(`${toHandlerKey(ErrorTypeStrings$1[type].replace(/ hook$/, ""))} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`);
	}
	var createHook = (lifecycle) => (hook, target = currentInstance) => {
		if (!isInSSRComponentSetup || lifecycle === "sp") injectHook(lifecycle, (...args) => hook(...args), target);
	};
	var onBeforeMount = createHook("bm");
	var onMounted = createHook("m");
	var onBeforeUpdate = createHook("bu");
	var onUpdated = createHook("u");
	var onBeforeUnmount = createHook("bum");
	var onUnmounted = createHook("um");
	var onServerPrefetch = createHook("sp");
	var onRenderTriggered = createHook("rtg");
	var onRenderTracked = createHook("rtc");
	function onErrorCaptured(hook, target = currentInstance) {
		injectHook("ec", hook, target);
	}
	var COMPONENTS = "components";
	var DIRECTIVES = "directives";
	function resolveComponent(name, maybeSelfReference) {
		return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
	}
	var NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
	function resolveDirective(name) {
		return resolveAsset(DIRECTIVES, name);
	}
	function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
		const instance = currentRenderingInstance || currentInstance;
		if (instance) {
			const Component = instance.type;
			if (type === COMPONENTS) {
				const selfName = getComponentName(Component, false);
				if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) return Component;
			}
			const res = resolve(instance[type] || Component[type], name) || resolve(instance.appContext[type], name);
			if (!res && maybeSelfReference) return Component;
			if (warnMissing && !res) {
				const extra = type === COMPONENTS ? `
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.` : ``;
				warn$1(`Failed to resolve ${type.slice(0, -1)}: ${name}${extra}`);
			}
			return res;
		} else warn$1(`resolve${capitalize(type.slice(0, -1))} can only be used in render() or setup().`);
	}
	function resolve(registry, name) {
		return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
	}
	function renderList(source, renderItem, cache, index) {
		let ret;
		const cached = cache && cache[index];
		const sourceIsArray = isArray(source);
		if (sourceIsArray || isString(source)) {
			const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
			let needsWrap = false;
			let isReadonlySource = false;
			if (sourceIsReactiveArray) {
				needsWrap = !/* @__PURE__ */ isShallow(source);
				isReadonlySource = /* @__PURE__ */ isReadonly(source);
				source = shallowReadArray(source);
			}
			ret = new Array(source.length);
			for (let i = 0, l = source.length; i < l; i++) ret[i] = renderItem(needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i], i, void 0, cached && cached[i]);
		} else if (typeof source === "number") {
			if (!Number.isInteger(source) || source < 0) {
				warn$1(`The v-for range expects a positive integer value but got ${source}.`);
				ret = [];
			} else {
				ret = new Array(source);
				for (let i = 0; i < source; i++) ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
			}
		} else if (isObject$1(source)) {
			if (source[Symbol.iterator]) ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
			else {
				const keys = Object.keys(source);
				ret = new Array(keys.length);
				for (let i = 0, l = keys.length; i < l; i++) {
					const key = keys[i];
					ret[i] = renderItem(source[key], key, i, cached && cached[i]);
				}
			}
		} else ret = [];
		if (cache) cache[index] = ret;
		return ret;
	}
	var getPublicInstance = (i) => {
		if (!i) return null;
		if (isStatefulComponent(i)) return getComponentPublicInstance(i);
		return getPublicInstance(i.parent);
	};
	var resolveDevRootEl = (vnode) => {
		let found = false;
		while (true) {
			if (vnode.patchFlag > 0 && vnode.patchFlag & 2048) {
				const root = filterSingleRoot(vnode.children);
				if (!root) return;
				vnode = root;
				found = true;
				continue;
			}
			const component = vnode.component;
			if (component && component.subTree) {
				vnode = component.subTree;
				continue;
			}
			const suspense = vnode.suspense;
			if (suspense && suspense.activeBranch) {
				vnode = suspense.activeBranch;
				continue;
			}
			return found ? vnode.el : void 0;
		}
	};
	var getDevRootFragmentEl = (i) => {
		const el = i.subTree && resolveDevRootEl(i.subTree);
		return el === void 0 ? i.vnode.el : el;
	};
	var publicPropertiesMap = /* @__PURE__ */ extend$1(/* @__PURE__ */ Object.create(null), {
		$: (i) => i,
		$el: (i) => getDevRootFragmentEl(i),
		$data: (i) => i.data,
		$props: (i) => /* @__PURE__ */ shallowReadonly(i.props),
		$attrs: (i) => /* @__PURE__ */ shallowReadonly(i.attrs),
		$slots: (i) => /* @__PURE__ */ shallowReadonly(i.slots),
		$refs: (i) => /* @__PURE__ */ shallowReadonly(i.refs),
		$parent: (i) => getPublicInstance(i.parent),
		$root: (i) => getPublicInstance(i.root),
		$host: (i) => i.ce,
		$emit: (i) => i.emit,
		$options: (i) => resolveMergedOptions(i),
		$forceUpdate: (i) => i.f || (i.f = () => {
			queueJob(i.update);
		}),
		$nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
		$watch: (i) => instanceWatch.bind(i)
	});
	var isReservedPrefix = (key) => key === "_" || key === "$";
	var hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn$1(state, key);
	var PublicInstanceProxyHandlers = {
		get({ _: instance }, key) {
			if (key === "__v_skip") return true;
			const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
			if (key === "__isVue") return true;
			if (key[0] !== "$") {
				const n = accessCache[key];
				if (n !== void 0) switch (n) {
					case 1: return setupState[key];
					case 2: return data[key];
					case 4: return ctx[key];
					case 3: return props[key];
				}
				else if (hasSetupBinding(setupState, key)) {
					accessCache[key] = 1;
					return setupState[key];
				} else if (data !== EMPTY_OBJ && hasOwn$1(data, key)) {
					accessCache[key] = 2;
					return data[key];
				} else if (hasOwn$1(props, key)) {
					accessCache[key] = 3;
					return props[key];
				} else if (ctx !== EMPTY_OBJ && hasOwn$1(ctx, key)) {
					accessCache[key] = 4;
					return ctx[key];
				} else if (shouldCacheAccess) accessCache[key] = 0;
			}
			const publicGetter = publicPropertiesMap[key];
			let cssModule, globalProperties;
			if (publicGetter) {
				if (key === "$attrs") {
					track(instance.attrs, "get", "");
					markAttrsAccessed();
				} else if (key === "$slots") track(instance, "get", key);
				return publicGetter(instance);
			} else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) return cssModule;
			else if (ctx !== EMPTY_OBJ && hasOwn$1(ctx, key)) {
				accessCache[key] = 4;
				return ctx[key];
			} else if (globalProperties = appContext.config.globalProperties, hasOwn$1(globalProperties, key)) return globalProperties[key];
			else if (currentRenderingInstance && (!isString(key) || key.indexOf("__v") !== 0)) {
				if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn$1(data, key)) warn$1(`Property ${JSON.stringify(key)} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`);
				else if (instance === currentRenderingInstance) warn$1(`Property ${JSON.stringify(key)} was accessed during render but is not defined on instance.`);
			}
		},
		set({ _: instance }, key, value) {
			const { data, setupState, ctx } = instance;
			if (hasSetupBinding(setupState, key)) {
				setupState[key] = value;
				return true;
			} else if (setupState.__isScriptSetup && hasOwn$1(setupState, key)) {
				warn$1(`Cannot mutate <script setup> binding "${key}" from Options API.`);
				return false;
			} else if (data !== EMPTY_OBJ && hasOwn$1(data, key)) {
				data[key] = value;
				return true;
			} else if (hasOwn$1(instance.props, key)) {
				warn$1(`Attempting to mutate prop "${key}". Props are readonly.`);
				return false;
			}
			if (key[0] === "$" && key.slice(1) in instance) {
				warn$1(`Attempting to mutate public property "${key}". Properties starting with $ are reserved and readonly.`);
				return false;
			} else if (key in instance.appContext.config.globalProperties) Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				value
			});
			else ctx[key] = value;
			return true;
		},
		has({ _: { data, setupState, accessCache, ctx, appContext, props, type } }, key) {
			let cssModules;
			return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn$1(data, key) || hasSetupBinding(setupState, key) || hasOwn$1(props, key) || hasOwn$1(ctx, key) || hasOwn$1(publicPropertiesMap, key) || hasOwn$1(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
		},
		defineProperty(target, key, descriptor) {
			if (descriptor.get != null) target._.accessCache[key] = 0;
			else if (hasOwn$1(descriptor, "value")) this.set(target, key, descriptor.value, null);
			return Reflect.defineProperty(target, key, descriptor);
		}
	};
	PublicInstanceProxyHandlers.ownKeys = (target) => {
		warn$1(`Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.`);
		return Reflect.ownKeys(target);
	};
	function createDevRenderContext(instance) {
		const target = {};
		Object.defineProperty(target, `_`, {
			configurable: true,
			enumerable: false,
			get: () => instance
		});
		Object.keys(publicPropertiesMap).forEach((key) => {
			Object.defineProperty(target, key, {
				configurable: true,
				enumerable: false,
				get: () => publicPropertiesMap[key](instance),
				set: NOOP
			});
		});
		return target;
	}
	function exposePropsOnRenderContext(instance) {
		const { ctx, propsOptions: [propsOptions] } = instance;
		if (propsOptions) Object.keys(propsOptions).forEach((key) => {
			Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => instance.props[key],
				set: NOOP
			});
		});
	}
	function exposeSetupStateOnRenderContext(instance) {
		const { ctx, setupState } = instance;
		Object.keys(/* @__PURE__ */ toRaw(setupState)).forEach((key) => {
			if (!setupState.__isScriptSetup) {
				if (isReservedPrefix(key[0])) {
					warn$1(`setup() return property ${JSON.stringify(key)} should not start with "$" or "_" which are reserved prefixes for Vue internals.`);
					return;
				}
				Object.defineProperty(ctx, key, {
					enumerable: true,
					configurable: true,
					get: () => setupState[key],
					set: NOOP
				});
			}
		});
	}
	function normalizePropsOrEmits(props) {
		return isArray(props) ? props.reduce((normalized, p) => (normalized[p] = null, normalized), {}) : props;
	}
	function createDuplicateChecker() {
		const cache = /* @__PURE__ */ Object.create(null);
		return (type, key) => {
			if (cache[key]) warn$1(`${type} property "${key}" is already defined in ${cache[key]}.`);
			else cache[key] = type;
		};
	}
	var shouldCacheAccess = true;
	function applyOptions(instance) {
		const options = resolveMergedOptions(instance);
		const publicThis = instance.proxy;
		const ctx = instance.ctx;
		shouldCacheAccess = false;
		if (options.beforeCreate) callHook$1(options.beforeCreate, instance, "bc");
		const { data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, expose, inheritAttrs, components, directives, filters } = options;
		const checkDuplicateProperties = createDuplicateChecker();
		{
			const [propsOptions] = instance.propsOptions;
			if (propsOptions) for (const key in propsOptions) checkDuplicateProperties("Props", key);
		}
		if (injectOptions) resolveInjections(injectOptions, ctx, checkDuplicateProperties);
		if (methods) for (const key in methods) {
			const methodHandler = methods[key];
			if (isFunction(methodHandler)) {
				Object.defineProperty(ctx, key, {
					value: methodHandler.bind(publicThis),
					configurable: true,
					enumerable: true,
					writable: true
				});
				checkDuplicateProperties("Methods", key);
			} else warn$1(`Method "${key}" has type "${typeof methodHandler}" in the component definition. Did you reference the function correctly?`);
		}
		if (dataOptions) {
			if (!isFunction(dataOptions)) warn$1(`The data option must be a function. Plain object usage is no longer supported.`);
			const data = dataOptions.call(publicThis, publicThis);
			if (isPromise(data)) warn$1(`data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>.`);
			if (!isObject$1(data)) warn$1(`data() should return an object.`);
			else {
				instance.data = /* @__PURE__ */ reactive(data);
				for (const key in data) {
					checkDuplicateProperties("Data", key);
					if (!isReservedPrefix(key[0])) Object.defineProperty(ctx, key, {
						configurable: true,
						enumerable: true,
						get: () => data[key],
						set: NOOP
					});
				}
			}
		}
		shouldCacheAccess = true;
		if (computedOptions) for (const key in computedOptions) {
			const opt = computedOptions[key];
			const get = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
			if (get === NOOP) warn$1(`Computed property "${key}" has no getter.`);
			const c = computed({
				get,
				set: !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : () => {
					warn$1(`Write operation failed: computed property "${key}" is readonly.`);
				}
			});
			Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => c.value,
				set: (v) => c.value = v
			});
			checkDuplicateProperties("Computed", key);
		}
		if (watchOptions) for (const key in watchOptions) createWatcher(watchOptions[key], ctx, publicThis, key);
		if (provideOptions) {
			const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
			Reflect.ownKeys(provides).forEach((key) => {
				provide(key, provides[key]);
			});
		}
		if (created) callHook$1(created, instance, "c");
		function registerLifecycleHook(register, hook) {
			if (isArray(hook)) hook.forEach((_hook) => register(_hook.bind(publicThis)));
			else if (hook) register(hook.bind(publicThis));
		}
		registerLifecycleHook(onBeforeMount, beforeMount);
		registerLifecycleHook(onMounted, mounted);
		registerLifecycleHook(onBeforeUpdate, beforeUpdate);
		registerLifecycleHook(onUpdated, updated);
		registerLifecycleHook(onActivated, activated);
		registerLifecycleHook(onDeactivated, deactivated);
		registerLifecycleHook(onErrorCaptured, errorCaptured);
		registerLifecycleHook(onRenderTracked, renderTracked);
		registerLifecycleHook(onRenderTriggered, renderTriggered);
		registerLifecycleHook(onBeforeUnmount, beforeUnmount);
		registerLifecycleHook(onUnmounted, unmounted);
		registerLifecycleHook(onServerPrefetch, serverPrefetch);
		if (isArray(expose)) {
			if (expose.length) {
				const exposed = instance.exposed || (instance.exposed = {});
				expose.forEach((key) => {
					Object.defineProperty(exposed, key, {
						get: () => publicThis[key],
						set: (val) => publicThis[key] = val,
						enumerable: true
					});
				});
			} else if (!instance.exposed) instance.exposed = {};
		}
		if (render && instance.render === NOOP) instance.render = render;
		if (inheritAttrs != null) instance.inheritAttrs = inheritAttrs;
		if (components) instance.components = components;
		if (directives) instance.directives = directives;
		if (serverPrefetch) markAsyncBoundary(instance);
	}
	function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
		if (isArray(injectOptions)) injectOptions = normalizeInject(injectOptions);
		for (const key in injectOptions) {
			const opt = injectOptions[key];
			let injected;
			if (isObject$1(opt)) {
				if ("default" in opt) injected = inject(opt.from || key, opt.default, true);
				else injected = inject(opt.from || key);
			} else injected = inject(opt);
			if (/* @__PURE__ */ isRef(injected)) Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => injected.value,
				set: (v) => injected.value = v
			});
			else ctx[key] = injected;
			checkDuplicateProperties("Inject", key);
		}
	}
	function callHook$1(hook, instance, type) {
		callWithAsyncErrorHandling(isArray(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
	}
	function createWatcher(raw, ctx, publicThis, key) {
		let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
		if (isString(raw)) {
			const handler = ctx[raw];
			if (isFunction(handler)) watch(getter, handler);
			else warn$1(`Invalid watch handler specified by key "${raw}"`, handler);
		} else if (isFunction(raw)) watch(getter, raw.bind(publicThis));
		else if (isObject$1(raw)) {
			if (isArray(raw)) raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
			else {
				const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
				if (isFunction(handler)) watch(getter, handler, raw);
				else warn$1(`Invalid watch handler specified by key "${raw.handler}"`, handler);
			}
		} else warn$1(`Invalid watch option: "${key}"`, raw);
	}
	function resolveMergedOptions(instance) {
		const base = instance.type;
		const { mixins, extends: extendsOptions } = base;
		const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
		const cached = cache.get(base);
		let resolved;
		if (cached) resolved = cached;
		else if (!globalMixins.length && !mixins && !extendsOptions) resolved = base;
		else {
			resolved = {};
			if (globalMixins.length) globalMixins.forEach((m) => mergeOptions(resolved, m, optionMergeStrategies, true));
			mergeOptions(resolved, base, optionMergeStrategies);
		}
		if (isObject$1(base)) cache.set(base, resolved);
		return resolved;
	}
	function mergeOptions(to, from, strats, asMixin = false) {
		const { mixins, extends: extendsOptions } = from;
		if (extendsOptions) mergeOptions(to, extendsOptions, strats, true);
		if (mixins) mixins.forEach((m) => mergeOptions(to, m, strats, true));
		for (const key in from) if (asMixin && key === "expose") warn$1(`"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.`);
		else {
			const strat = internalOptionMergeStrats[key] || strats && strats[key];
			to[key] = strat ? strat(to[key], from[key]) : from[key];
		}
		return to;
	}
	var internalOptionMergeStrats = {
		data: mergeDataFn,
		props: mergeEmitsOrPropsOptions,
		emits: mergeEmitsOrPropsOptions,
		methods: mergeObjectOptions,
		computed: mergeObjectOptions,
		beforeCreate: mergeAsArray,
		created: mergeAsArray,
		beforeMount: mergeAsArray,
		mounted: mergeAsArray,
		beforeUpdate: mergeAsArray,
		updated: mergeAsArray,
		beforeDestroy: mergeAsArray,
		beforeUnmount: mergeAsArray,
		destroyed: mergeAsArray,
		unmounted: mergeAsArray,
		activated: mergeAsArray,
		deactivated: mergeAsArray,
		errorCaptured: mergeAsArray,
		serverPrefetch: mergeAsArray,
		components: mergeObjectOptions,
		directives: mergeObjectOptions,
		watch: mergeWatchOptions,
		provide: mergeDataFn,
		inject: mergeInject
	};
	function mergeDataFn(to, from) {
		if (!from) return to;
		if (!to) return from;
		return function mergedDataFn() {
			return extend$1(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
		};
	}
	function mergeInject(to, from) {
		return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
	}
	function normalizeInject(raw) {
		if (isArray(raw)) {
			const res = {};
			for (let i = 0; i < raw.length; i++) res[raw[i]] = raw[i];
			return res;
		}
		return raw;
	}
	function mergeAsArray(to, from) {
		return to ? [...new Set([].concat(to, from))] : from;
	}
	function mergeObjectOptions(to, from) {
		return to ? extend$1(/* @__PURE__ */ Object.create(null), to, from) : from;
	}
	function mergeEmitsOrPropsOptions(to, from) {
		if (to) {
			if (isArray(to) && isArray(from)) return [.../* @__PURE__ */ new Set([...to, ...from])];
			return extend$1(/* @__PURE__ */ Object.create(null), normalizePropsOrEmits(to), normalizePropsOrEmits(from != null ? from : {}));
		} else return from;
	}
	function mergeWatchOptions(to, from) {
		if (!to) return from;
		if (!from) return to;
		const merged = extend$1(/* @__PURE__ */ Object.create(null), to);
		for (const key in from) merged[key] = mergeAsArray(to[key], from[key]);
		return merged;
	}
	function createAppContext() {
		return {
			app: null,
			config: {
				isNativeTag: NO,
				performance: false,
				globalProperties: {},
				optionMergeStrategies: {},
				errorHandler: void 0,
				warnHandler: void 0,
				compilerOptions: {}
			},
			mixins: [],
			components: {},
			directives: {},
			provides: /* @__PURE__ */ Object.create(null),
			optionsCache: /* @__PURE__ */ new WeakMap(),
			propsCache: /* @__PURE__ */ new WeakMap(),
			emitsCache: /* @__PURE__ */ new WeakMap()
		};
	}
	var uid$1 = 0;
	function createAppAPI(render, hydrate) {
		return function createApp(rootComponent, rootProps = null) {
			if (!isFunction(rootComponent)) rootComponent = extend$1({}, rootComponent);
			if (rootProps != null && !isObject$1(rootProps)) {
				warn$1(`root props passed to app.mount() must be an object.`);
				rootProps = null;
			}
			const context = createAppContext();
			const installedPlugins = /* @__PURE__ */ new WeakSet();
			const pluginCleanupFns = [];
			let isMounted = false;
			const app = context.app = {
				_uid: uid$1++,
				_component: rootComponent,
				_props: rootProps,
				_container: null,
				_context: context,
				_instance: null,
				version,
				get config() {
					return context.config;
				},
				set config(v) {
					warn$1(`app.config cannot be replaced. Modify individual options instead.`);
				},
				use(plugin, ...options) {
					if (installedPlugins.has(plugin)) warn$1(`Plugin has already been applied to target app.`);
					else if (plugin && isFunction(plugin.install)) {
						installedPlugins.add(plugin);
						plugin.install(app, ...options);
					} else if (isFunction(plugin)) {
						installedPlugins.add(plugin);
						plugin(app, ...options);
					} else warn$1(`A plugin must either be a function or an object with an "install" function.`);
					return app;
				},
				mixin(mixin) {
					if (!context.mixins.includes(mixin)) context.mixins.push(mixin);
					else warn$1("Mixin has already been applied to target app" + (mixin.name ? `: ${mixin.name}` : ""));
					return app;
				},
				component(name, component) {
					validateComponentName(name, context.config);
					if (!component) return context.components[name];
					if (context.components[name]) warn$1(`Component "${name}" has already been registered in target app.`);
					context.components[name] = component;
					return app;
				},
				directive(name, directive) {
					validateDirectiveName(name);
					if (!directive) return context.directives[name];
					if (context.directives[name]) warn$1(`Directive "${name}" has already been registered in target app.`);
					context.directives[name] = directive;
					return app;
				},
				mount(rootContainer, isHydrate, namespace) {
					if (!isMounted) {
						if (rootContainer.__vue_app__) warn$1(`There is already an app instance mounted on the host container.
 If you want to mount another app on the same host container, you need to unmount the previous app by calling \`app.unmount()\` first.`);
						const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
						vnode.appContext = context;
						if (namespace === true) namespace = "svg";
						else if (namespace === false) namespace = void 0;
						context.reload = () => {
							const cloned = cloneVNode(vnode);
							cloned.el = null;
							render(cloned, rootContainer, namespace);
						};
						if (isHydrate && hydrate) hydrate(vnode, rootContainer);
						else render(vnode, rootContainer, namespace);
						isMounted = true;
						app._container = rootContainer;
						rootContainer.__vue_app__ = app;
						app._instance = vnode.component;
						devtoolsInitApp(app, version);
						return getComponentPublicInstance(vnode.component);
					} else warn$1(`App has already been mounted.
If you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. \`const createMyApp = () => createApp(App)\``);
				},
				onUnmount(cleanupFn) {
					if (typeof cleanupFn !== "function") warn$1(`Expected function as first argument to app.onUnmount(), but got ${typeof cleanupFn}`);
					pluginCleanupFns.push(cleanupFn);
				},
				unmount() {
					if (isMounted) {
						callWithAsyncErrorHandling(pluginCleanupFns, app._instance, 16);
						render(null, app._container);
						app._instance = null;
						devtoolsUnmountApp(app);
						delete app._container.__vue_app__;
					} else warn$1(`Cannot unmount an app that is not mounted.`);
				},
				provide(key, value) {
					if (key in context.provides) {
						if (hasOwn$1(context.provides, key)) warn$1(`App already provides property with key "${String(key)}". It will be overwritten with the new value.`);
						else warn$1(`App already provides property with key "${String(key)}" inherited from its parent element. It will be overwritten with the new value.`);
					}
					context.provides[key] = value;
					return app;
				},
				runWithContext(fn) {
					const lastApp = currentApp;
					currentApp = app;
					try {
						return fn();
					} finally {
						currentApp = lastApp;
					}
				}
			};
			return app;
		};
	}
	var currentApp = null;
	var getModelModifiers = (props, modelName) => {
		return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
	};
	function emit(instance, event, ...rawArgs) {
		if (instance.isUnmounted) return;
		const props = instance.vnode.props || EMPTY_OBJ;
		{
			const { emitsOptions, propsOptions: [propsOptions] } = instance;
			if (emitsOptions) {
				if (!(event in emitsOptions) && true) {
					if (!propsOptions || !(toHandlerKey(camelize(event)) in propsOptions)) warn$1(`Component emitted event "${event}" but it is neither declared in the emits option nor as an "${toHandlerKey(camelize(event))}" prop.`);
				} else {
					const validator = emitsOptions[event];
					if (isFunction(validator)) {
						if (!validator(...rawArgs)) warn$1(`Invalid event arguments: event validation failed for event "${event}".`);
					}
				}
			}
		}
		let args = rawArgs;
		const isModelListener = event.startsWith("update:");
		const modifiers = isModelListener && getModelModifiers(props, event.slice(7));
		if (modifiers) {
			if (modifiers.trim) args = rawArgs.map((a) => isString(a) ? a.trim() : a);
			if (modifiers.number) args = args.map(looseToNumber);
		}
		devtoolsComponentEmit(instance, event, args);
		{
			const lowerCaseEvent = event.toLowerCase();
			if (lowerCaseEvent !== event && props[toHandlerKey(lowerCaseEvent)]) warn$1(`Event "${lowerCaseEvent}" is emitted in component ${formatComponentName(instance, instance.type)} but the handler is registered for "${event}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${hyphenate(event)}" instead of "${event}".`);
		}
		let handlerName;
		let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
		if (!handler && isModelListener) handler = props[handlerName = toHandlerKey(hyphenate(event))];
		if (handler) callWithAsyncErrorHandling(handler, instance, 6, args);
		const onceHandler = props[handlerName + `Once`];
		if (onceHandler) {
			if (!instance.emitted) instance.emitted = {};
			else if (instance.emitted[handlerName]) return;
			instance.emitted[handlerName] = true;
			callWithAsyncErrorHandling(onceHandler, instance, 6, args);
		}
	}
	var mixinEmitsCache = /* @__PURE__ */ new WeakMap();
	function normalizeEmitsOptions(comp, appContext, asMixin = false) {
		const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
		const cached = cache.get(comp);
		if (cached !== void 0) return cached;
		const raw = comp.emits;
		let normalized = {};
		let hasExtends = false;
		if (!isFunction(comp)) {
			const extendEmits = (raw2) => {
				const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
				if (normalizedFromExtend) {
					hasExtends = true;
					extend$1(normalized, normalizedFromExtend);
				}
			};
			if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendEmits);
			if (comp.extends) extendEmits(comp.extends);
			if (comp.mixins) comp.mixins.forEach(extendEmits);
		}
		if (!raw && !hasExtends) {
			if (isObject$1(comp)) cache.set(comp, null);
			return null;
		}
		if (isArray(raw)) raw.forEach((key) => normalized[key] = null);
		else extend$1(normalized, raw);
		if (isObject$1(comp)) cache.set(comp, normalized);
		return normalized;
	}
	function isEmitListener(options, key) {
		if (!options || !isOn(key)) return false;
		key = key.slice(2);
		key = key === "Once" ? key : key.replace(/Once$/, "");
		return hasOwn$1(options, key[0].toLowerCase() + key.slice(1)) || hasOwn$1(options, hyphenate(key)) || hasOwn$1(options, key);
	}
	var accessedAttrs = false;
	function markAttrsAccessed() {
		accessedAttrs = true;
	}
	function renderComponentRoot(instance) {
		const { type: Component, vnode, proxy, withProxy, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, props, data, setupState, ctx, inheritAttrs } = instance;
		const prev = setCurrentRenderingInstance(instance);
		let result;
		let fallthroughAttrs;
		accessedAttrs = false;
		try {
			if (vnode.shapeFlag & 4) {
				const proxyToUse = withProxy || proxy;
				const thisProxy = setupState.__isScriptSetup ? new Proxy(proxyToUse, { get(target, key, receiver) {
					warn$1(`Property '${String(key)}' was accessed via 'this'. Avoid using 'this' in templates.`);
					return Reflect.get(target, key, receiver);
				} }) : proxyToUse;
				result = normalizeVNode(render.call(thisProxy, proxyToUse, renderCache, /* @__PURE__ */ shallowReadonly(props), setupState, data, ctx));
				fallthroughAttrs = attrs;
			} else {
				const render2 = Component;
				if (attrs === props) markAttrsAccessed();
				result = normalizeVNode(render2.length > 1 ? render2(/* @__PURE__ */ shallowReadonly(props), {
					get attrs() {
						markAttrsAccessed();
						return /* @__PURE__ */ shallowReadonly(attrs);
					},
					slots,
					emit
				}) : render2(/* @__PURE__ */ shallowReadonly(props), null));
				fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
			}
		} catch (err) {
			blockStack.length = 0;
			handleError(err, instance, 1);
			result = createVNode(Comment);
		}
		let root = result;
		let setRoot = void 0;
		if (result.patchFlag > 0 && result.patchFlag & 2048) [root, setRoot] = getChildRoot(result);
		if (fallthroughAttrs && inheritAttrs !== false) {
			const keys = Object.keys(fallthroughAttrs);
			const { shapeFlag } = root;
			if (keys.length) {
				if (shapeFlag & 7) {
					if (propsOptions && keys.some(isModelListener)) fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
					root = cloneVNode(root, fallthroughAttrs, false, true);
				} else if (!accessedAttrs && root.type !== Comment) {
					const allAttrs = Object.keys(attrs);
					const eventAttrs = [];
					const extraAttrs = [];
					for (let i = 0, l = allAttrs.length; i < l; i++) {
						const key = allAttrs[i];
						if (isOn(key)) {
							if (!isModelListener(key)) eventAttrs.push(key[2].toLowerCase() + key.slice(3));
						} else extraAttrs.push(key);
					}
					if (extraAttrs.length) warn$1(`Extraneous non-props attributes (${extraAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`);
					if (eventAttrs.length) warn$1(`Extraneous non-emits event listeners (${eventAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`);
				}
			}
		}
		if (vnode.dirs) {
			if (!isElementRoot(root)) warn$1(`Runtime directive used on component with non-element root node. The directives will not function as intended.`);
			root = cloneVNode(root, null, false, true);
			root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
		}
		if (vnode.transition) {
			const child = isTeleport(root.type) ? getInnerChild$1(root) || root : root;
			if (!isElementRoot(child)) warn$1(`Component inside <Transition> renders non-element root node that cannot be animated.`);
			setTransitionHooks(child, vnode.transition);
		}
		if (setRoot) setRoot(root);
		else result = root;
		setCurrentRenderingInstance(prev);
		return result;
	}
	var getChildRoot = (vnode) => {
		const rawChildren = vnode.children;
		const dynamicChildren = vnode.dynamicChildren;
		const childRoot = filterSingleRoot(rawChildren, false);
		if (!childRoot) return [vnode, void 0];
		else if (childRoot.patchFlag > 0 && childRoot.patchFlag & 2048) return getChildRoot(childRoot);
		const index = rawChildren.indexOf(childRoot);
		const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
		const setRoot = (updatedRoot) => {
			rawChildren[index] = updatedRoot;
			if (dynamicChildren) {
				if (dynamicIndex > -1) dynamicChildren[dynamicIndex] = updatedRoot;
				else if (updatedRoot.patchFlag > 0) vnode.dynamicChildren = [...dynamicChildren, updatedRoot];
			}
		};
		return [normalizeVNode(childRoot), setRoot];
	};
	function filterSingleRoot(children, recurse = true) {
		let singleRoot;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (isVNode(child)) {
				if (child.type !== Comment || child.children === "v-if") {
					if (singleRoot) return;
					else {
						singleRoot = child;
						if (recurse && singleRoot.patchFlag > 0 && singleRoot.patchFlag & 2048) return filterSingleRoot(singleRoot.children);
					}
				}
			} else return;
		}
		return singleRoot;
	}
	var getFunctionalFallthrough = (attrs) => {
		let res;
		for (const key in attrs) if (key === "class" || key === "style" || isOn(key)) (res || (res = {}))[key] = attrs[key];
		return res;
	};
	var filterModelListeners = (attrs, props) => {
		const res = {};
		for (const key in attrs) if (!isModelListener(key) || !(key.slice(9) in props)) res[key] = attrs[key];
		return res;
	};
	var isElementRoot = (vnode) => {
		return vnode.shapeFlag & 7 || vnode.type === Comment;
	};
	function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
		const { props: prevProps, children: prevChildren, component } = prevVNode;
		const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
		const emits = component.emitsOptions;
		if ((prevChildren || nextChildren) && isHmrUpdating) return true;
		if (nextVNode.dirs || nextVNode.transition) return true;
		if (optimized && patchFlag >= 0) {
			if (patchFlag & 1024) return true;
			if (patchFlag & 16) {
				if (!prevProps) return !!nextProps;
				return hasPropsChanged(prevProps, nextProps, emits);
			} else if (patchFlag & 8) {
				const dynamicProps = nextVNode.dynamicProps;
				for (let i = 0; i < dynamicProps.length; i++) {
					const key = dynamicProps[i];
					if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) return true;
				}
			}
		} else {
			if (prevChildren || nextChildren) {
				if (!nextChildren || !nextChildren.$stable) return true;
			}
			if (prevProps === nextProps) return false;
			if (!prevProps) return !!nextProps;
			if (!nextProps) return true;
			return hasPropsChanged(prevProps, nextProps, emits);
		}
		return false;
	}
	function hasPropsChanged(prevProps, nextProps, emitsOptions) {
		const nextKeys = Object.keys(nextProps);
		if (nextKeys.length !== Object.keys(prevProps).length) return true;
		for (let i = 0; i < nextKeys.length; i++) {
			const key = nextKeys[i];
			if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) return true;
		}
		return false;
	}
	function hasPropValueChanged(nextProps, prevProps, key) {
		const nextProp = nextProps[key];
		const prevProp = prevProps[key];
		if (key === "style" && isObject$1(nextProp) && isObject$1(prevProp)) return !looseEqual(nextProp, prevProp);
		return nextProp !== prevProp;
	}
	function updateHOCHostEl({ vnode, parent, suspense }, el) {
		while (parent) {
			const root = parent.subTree;
			if (root.suspense && root.suspense.activeBranch === vnode) {
				root.suspense.vnode.el = root.el = el;
				vnode = root;
			}
			if (root === vnode) {
				(vnode = parent.vnode).el = el;
				parent = parent.parent;
			} else break;
		}
		if (suspense && suspense.activeBranch === vnode) suspense.vnode.el = el;
	}
	var internalObjectProto = {};
	var createInternalObject = () => Object.create(internalObjectProto);
	var isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
	function initProps(instance, rawProps, isStateful, isSSR = false) {
		const props = {};
		const attrs = createInternalObject();
		instance.propsDefaults = /* @__PURE__ */ Object.create(null);
		setFullProps(instance, rawProps, props, attrs);
		for (const key in instance.propsOptions[0]) if (!(key in props)) props[key] = void 0;
		validateProps(rawProps || {}, props, instance);
		if (isStateful) instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
		else if (!instance.type.props) instance.props = attrs;
		else instance.props = props;
		instance.attrs = attrs;
	}
	function isInHmrContext(instance) {
		while (instance) {
			if (instance.type.__hmrId) return true;
			instance = instance.parent;
		}
	}
	function updateProps(instance, rawProps, rawPrevProps, optimized) {
		const { props, attrs, vnode: { patchFlag } } = instance;
		const rawCurrentProps = /* @__PURE__ */ toRaw(props);
		const [options] = instance.propsOptions;
		let hasAttrsChanged = false;
		if (!isInHmrContext(instance) && (optimized || patchFlag > 0) && !(patchFlag & 16)) {
			if (patchFlag & 8) {
				const propsToUpdate = instance.vnode.dynamicProps;
				for (let i = 0; i < propsToUpdate.length; i++) {
					let key = propsToUpdate[i];
					if (isEmitListener(instance.emitsOptions, key)) continue;
					const value = rawProps[key];
					if (options) {
						if (hasOwn$1(attrs, key)) {
							if (value !== attrs[key]) {
								attrs[key] = value;
								hasAttrsChanged = true;
							}
						} else {
							const camelizedKey = camelize(key);
							props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
						}
					} else if (value !== attrs[key]) {
						attrs[key] = value;
						hasAttrsChanged = true;
					}
				}
			}
		} else {
			if (setFullProps(instance, rawProps, props, attrs)) hasAttrsChanged = true;
			let kebabKey;
			for (const key in rawCurrentProps) if (!rawProps || !hasOwn$1(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn$1(rawProps, kebabKey))) {
				if (options) {
					if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
				} else delete props[key];
			}
			if (attrs !== rawCurrentProps) {
				for (const key in attrs) if (!rawProps || !hasOwn$1(rawProps, key) && true) {
					delete attrs[key];
					hasAttrsChanged = true;
				}
			}
		}
		if (hasAttrsChanged) trigger(instance.attrs, "set", "");
		validateProps(rawProps || {}, props, instance);
	}
	function setFullProps(instance, rawProps, props, attrs) {
		const [options, needCastKeys] = instance.propsOptions;
		let hasAttrsChanged = false;
		let rawCastValues;
		if (rawProps) for (let key in rawProps) {
			if (isReservedProp(key)) continue;
			const value = rawProps[key];
			let camelKey;
			if (options && hasOwn$1(options, camelKey = camelize(key))) {
				if (!needCastKeys || !needCastKeys.includes(camelKey)) props[camelKey] = value;
				else (rawCastValues || (rawCastValues = {}))[camelKey] = value;
			} else if (!isEmitListener(instance.emitsOptions, key)) {
				if (!(key in attrs) || value !== attrs[key]) {
					attrs[key] = value;
					hasAttrsChanged = true;
				}
			}
		}
		if (needCastKeys) {
			const rawCurrentProps = /* @__PURE__ */ toRaw(props);
			const castValues = rawCastValues || EMPTY_OBJ;
			for (let i = 0; i < needCastKeys.length; i++) {
				const key = needCastKeys[i];
				props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn$1(castValues, key));
			}
		}
		return hasAttrsChanged;
	}
	function resolvePropValue(options, props, key, value, instance, isAbsent) {
		const opt = options[key];
		if (opt != null) {
			const hasDefault = hasOwn$1(opt, "default");
			if (hasDefault && value === void 0) {
				const defaultValue = opt.default;
				if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
					const { propsDefaults } = instance;
					if (key in propsDefaults) value = propsDefaults[key];
					else {
						const reset = setCurrentInstance(instance);
						value = propsDefaults[key] = defaultValue.call(null, props);
						reset();
					}
				} else value = defaultValue;
				if (instance.ce) instance.ce._setProp(key, value);
			}
			if (opt[0]) {
				if (isAbsent && !hasDefault) value = false;
				else if (opt[1] && (value === "" || value === hyphenate(key))) value = true;
			}
		}
		return value;
	}
	var mixinPropsCache = /* @__PURE__ */ new WeakMap();
	function normalizePropsOptions(comp, appContext, asMixin = false) {
		const cache = asMixin ? mixinPropsCache : appContext.propsCache;
		const cached = cache.get(comp);
		if (cached) return cached;
		const raw = comp.props;
		const normalized = {};
		const needCastKeys = [];
		let hasExtends = false;
		if (!isFunction(comp)) {
			const extendProps = (raw2) => {
				hasExtends = true;
				const [props, keys] = normalizePropsOptions(raw2, appContext, true);
				extend$1(normalized, props);
				if (keys) needCastKeys.push(...keys);
			};
			if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendProps);
			if (comp.extends) extendProps(comp.extends);
			if (comp.mixins) comp.mixins.forEach(extendProps);
		}
		if (!raw && !hasExtends) {
			if (isObject$1(comp)) cache.set(comp, EMPTY_ARR);
			return EMPTY_ARR;
		}
		if (isArray(raw)) for (let i = 0; i < raw.length; i++) {
			if (!isString(raw[i])) warn$1(`props must be strings when using array syntax.`, raw[i]);
			const normalizedKey = camelize(raw[i]);
			if (validatePropName(normalizedKey)) normalized[normalizedKey] = EMPTY_OBJ;
		}
		else if (raw) {
			if (!isObject$1(raw)) warn$1(`invalid props options`, raw);
			for (const key in raw) {
				const normalizedKey = camelize(key);
				if (validatePropName(normalizedKey)) {
					const opt = raw[key];
					const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend$1({}, opt);
					const propType = prop.type;
					let shouldCast = false;
					let shouldCastTrue = true;
					if (isArray(propType)) for (let index = 0; index < propType.length; ++index) {
						const type = propType[index];
						const typeName = isFunction(type) && type.name;
						if (typeName === "Boolean") {
							shouldCast = true;
							break;
						} else if (typeName === "String") shouldCastTrue = false;
					}
					else shouldCast = isFunction(propType) && propType.name === "Boolean";
					prop[0] = shouldCast;
					prop[1] = shouldCastTrue;
					if (shouldCast || hasOwn$1(prop, "default")) needCastKeys.push(normalizedKey);
				}
			}
		}
		const res = [normalized, needCastKeys];
		if (isObject$1(comp)) cache.set(comp, res);
		return res;
	}
	function validatePropName(key) {
		if (key[0] !== "$" && !isReservedProp(key)) return true;
		else warn$1(`Invalid prop name: "${key}" is a reserved property.`);
		return false;
	}
	function getType$1(ctor) {
		if (ctor === null) return "null";
		if (typeof ctor === "function") return ctor.name || "";
		else if (typeof ctor === "object") return ctor.constructor && ctor.constructor.name || "";
		return "";
	}
	function validateProps(rawProps, props, instance) {
		const resolvedValues = /* @__PURE__ */ toRaw(props);
		const options = instance.propsOptions[0];
		const camelizePropsKey = Object.keys(rawProps).map((key) => camelize(key));
		for (const key in options) {
			let opt = options[key];
			if (opt == null) continue;
			validateProp(key, resolvedValues[key], opt, /* @__PURE__ */ shallowReadonly(resolvedValues), !camelizePropsKey.includes(key));
		}
	}
	function validateProp(name, value, prop, props, isAbsent) {
		const { type, required, validator, skipCheck } = prop;
		if (required && isAbsent) {
			warn$1("Missing required prop: \"" + name + "\"");
			return;
		}
		if (value == null && !required) return;
		if (type != null && type !== true && !skipCheck) {
			let isValid = false;
			const types = isArray(type) ? type : [type];
			const expectedTypes = [];
			for (let i = 0; i < types.length && !isValid; i++) {
				const { valid, expectedType } = assertType(value, types[i]);
				expectedTypes.push(expectedType || "");
				isValid = valid;
			}
			if (!isValid) {
				warn$1(getInvalidTypeMessage(name, value, expectedTypes));
				return;
			}
		}
		if (validator && !validator(value, props)) warn$1("Invalid prop: custom validator check failed for prop \"" + name + "\".");
	}
	var isSimpleType = /* @__PURE__ */ makeMap("String,Number,Boolean,Function,Symbol,BigInt");
	function assertType(value, type) {
		let valid;
		const expectedType = getType$1(type);
		if (expectedType === "null") valid = value === null;
		else if (isSimpleType(expectedType)) {
			const t = typeof value;
			valid = t === expectedType.toLowerCase();
			if (!valid && t === "object") valid = value instanceof type;
		} else if (expectedType === "Object") valid = isObject$1(value);
		else if (expectedType === "Array") valid = isArray(value);
		else valid = value instanceof type;
		return {
			valid,
			expectedType
		};
	}
	function getInvalidTypeMessage(name, value, expectedTypes) {
		if (expectedTypes.length === 0) return `Prop type [] for prop "${name}" won't match anything. Did you mean to use type Array instead?`;
		let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize).join(" | ")}`;
		const expectedType = expectedTypes[0];
		const receivedType = toRawType(value);
		const expectedValue = styleValue(value, expectedType);
		const receivedValue = styleValue(value, receivedType);
		if (expectedTypes.length === 1 && isExplicable(expectedType) && isCoercible(expectedType, receivedType)) message += ` with value ${expectedValue}`;
		message += `, got ${receivedType} `;
		if (isExplicable(receivedType)) message += `with value ${receivedValue}.`;
		return message;
	}
	function styleValue(value, type) {
		if (isSymbol(value)) return value.toString();
		else if (type === "String") return `"${value}"`;
		else if (type === "Number") return `${Number(value)}`;
		else return `${value}`;
	}
	function isExplicable(type) {
		return [
			"string",
			"number",
			"boolean"
		].some((elem) => type.toLowerCase() === elem);
	}
	function isCoercible(...args) {
		return args.every((elem) => {
			const value = elem.toLowerCase();
			return value !== "boolean" && value !== "symbol";
		});
	}
	var isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
	var normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
	var normalizeSlot = (key, rawSlot, ctx) => {
		if (rawSlot._n) return rawSlot;
		const normalized = withCtx((...args) => {
			if (currentInstance && !(ctx === null && currentRenderingInstance) && !(ctx && ctx.root !== currentInstance.root)) warn$1(`Slot "${key}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`);
			return normalizeSlotValue(rawSlot(...args));
		}, ctx);
		normalized._c = false;
		return normalized;
	};
	var normalizeObjectSlots = (rawSlots, slots, instance) => {
		const ctx = rawSlots._ctx;
		for (const key in rawSlots) {
			if (isInternalKey(key)) continue;
			const value = rawSlots[key];
			if (isFunction(value)) slots[key] = normalizeSlot(key, value, ctx);
			else if (value != null) {
				warn$1(`Non-function value encountered for slot "${key}". Prefer function slots for better performance.`);
				const normalized = normalizeSlotValue(value);
				slots[key] = () => normalized;
			}
		}
	};
	var normalizeVNodeSlots = (instance, children) => {
		if (!isKeepAlive(instance.vnode) && true) warn$1(`Non-function value encountered for default slot. Prefer function slots for better performance.`);
		const normalized = normalizeSlotValue(children);
		instance.slots.default = () => normalized;
	};
	var assignSlots = (slots, children, optimized) => {
		for (const key in children) if (optimized || !isInternalKey(key)) slots[key] = children[key];
	};
	var initSlots = (instance, children, optimized) => {
		const slots = instance.slots = createInternalObject();
		if (instance.vnode.shapeFlag & 32) {
			const type = children._;
			if (type) {
				assignSlots(slots, children, optimized);
				if (optimized) def(slots, "_", type, true);
			} else normalizeObjectSlots(children, slots);
		} else if (children) normalizeVNodeSlots(instance, children);
	};
	var updateSlots = (instance, children, optimized) => {
		const { vnode, slots } = instance;
		let needDeletionCheck = true;
		let deletionComparisonTarget = EMPTY_OBJ;
		if (vnode.shapeFlag & 32) {
			const type = children._;
			if (type) {
				if (isHmrUpdating) {
					assignSlots(slots, children, optimized);
					trigger(instance, "set", "$slots");
				} else if (optimized && type === 1) needDeletionCheck = false;
				else assignSlots(slots, children, optimized);
			} else {
				needDeletionCheck = !children.$stable;
				normalizeObjectSlots(children, slots);
			}
			deletionComparisonTarget = children;
		} else if (children) {
			normalizeVNodeSlots(instance, children);
			deletionComparisonTarget = { default: 1 };
		}
		if (needDeletionCheck) {
			for (const key in slots) if (!isInternalKey(key) && deletionComparisonTarget[key] == null) delete slots[key];
		}
	};
	var supported;
	var perf;
	function startMeasure(instance, type) {
		if (instance.appContext.config.performance && isSupported()) perf.mark(`vue-${type}-${instance.uid}`);
		devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
	}
	function endMeasure(instance, type) {
		if (instance.appContext.config.performance && isSupported()) {
			const startTag = `vue-${type}-${instance.uid}`;
			const endTag = startTag + `:end`;
			const measureName = `<${formatComponentName(instance, instance.type)}> ${type}`;
			perf.mark(endTag);
			perf.measure(measureName, startTag, endTag);
			perf.clearMeasures(measureName);
			perf.clearMarks(startTag);
			perf.clearMarks(endTag);
		}
		devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
	}
	function isSupported() {
		if (supported !== void 0) return supported;
		if (typeof window !== "undefined" && window.performance) {
			supported = true;
			perf = window.performance;
		} else supported = false;
		return supported;
	}
	function initFeatureFlags() {
		const needWarn = [];
		if (needWarn.length) {
			const multi = needWarn.length > 1;
			console.warn(`Feature flag${multi ? `s` : ``} ${needWarn.join(", ")} ${multi ? `are` : `is`} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`);
		}
	}
	var queuePostRenderEffect = queueEffectWithSuspense;
	function createRenderer(options) {
		return baseCreateRenderer(options);
	}
	function baseCreateRenderer(options, createHydrationFns) {
		initFeatureFlags();
		const target = getGlobalThis();
		target.__VUE__ = true;
		setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
		const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
		const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = isHmrUpdating ? false : !!n2.dynamicChildren) => {
			if (n1 === n2) return;
			if (n1 && !isSameVNodeType(n1, n2)) {
				anchor = getNextHostNode(n1);
				unmount(n1, parentComponent, parentSuspense, true);
				n1 = null;
			}
			if (n2.patchFlag === -2) {
				optimized = false;
				n2.dynamicChildren = null;
			}
			if (n2.dynamicChildren && n1 && n1.dynamicChildren && n1.dynamicChildren.hasOnce) {
				if (n2.dynamicChildren === EMPTY_ARR) n2.dynamicChildren = [];
				n2.dynamicChildren.hasOnce = true;
			}
			const { type, ref, shapeFlag } = n2;
			switch (type) {
				case Text:
					processText(n1, n2, container, anchor);
					break;
				case Comment:
					processCommentNode(n1, n2, container, anchor);
					break;
				case Static:
					if (n1 == null) mountStaticNode(n2, container, anchor, namespace);
					else patchStaticNode(n1, n2, container, namespace);
					break;
				case Fragment:
					processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					break;
				default: if (shapeFlag & 1) processElement(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (shapeFlag & 6) processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (shapeFlag & 64) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
				else if (shapeFlag & 128) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
				else warn$1("Invalid VNode type:", type, `(${typeof type})`);
			}
			if (ref != null && parentComponent) setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
			else if (ref == null && n1 && n1.ref != null) setRef(n1.ref, null, parentSuspense, n1, true);
		};
		const processText = (n1, n2, container, anchor) => {
			if (n1 == null) hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
			else {
				const el = n2.el = n1.el;
				if (n2.children !== n1.children) hostSetText(el, n2.children);
			}
		};
		const processCommentNode = (n1, n2, container, anchor) => {
			if (n1 == null) hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
			else n2.el = n1.el;
		};
		const mountStaticNode = (n2, container, anchor, namespace) => {
			[n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace, n2.el, n2.anchor);
		};
		const patchStaticNode = (n1, n2, container, namespace) => {
			if (n2.children !== n1.children) {
				const anchor = hostNextSibling(n1.anchor);
				removeStaticNode(n1);
				[n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace);
			} else {
				n2.el = n1.el;
				n2.anchor = n1.anchor;
			}
		};
		const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
			let next;
			while (el && el !== anchor) {
				next = hostNextSibling(el);
				hostInsert(el, container, nextSibling);
				el = next;
			}
			hostInsert(anchor, container, nextSibling);
		};
		const removeStaticNode = ({ el, anchor }) => {
			let next;
			while (el && el !== anchor) {
				next = hostNextSibling(el);
				hostRemove(el);
				el = next;
			}
			hostRemove(anchor);
		};
		const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			if (n2.type === "svg") namespace = "svg";
			else if (n2.type === "math") namespace = "mathml";
			if (n1 == null) mountElement(n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else {
				const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
				try {
					if (customElement) customElement._beginPatch();
					patchElement(n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				} finally {
					if (customElement) customElement._endPatch();
				}
			}
		};
		const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			let el;
			let vnodeHook;
			const { props, shapeFlag, transition, dirs } = vnode;
			el = vnode.el = hostCreateElement(vnode.type, namespace, props && props.is, props);
			if (shapeFlag & 8) hostSetElementText(el, vnode.children);
			else if (shapeFlag & 16) mountChildren(vnode.children, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(vnode, namespace), slotScopeIds, optimized);
			if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
			setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
			if (props) {
				for (const key in props) if (key !== "value" && !isReservedProp(key)) hostPatchProp(el, key, null, props[key], namespace, parentComponent);
				if ("value" in props) hostPatchProp(el, "value", null, props.value, namespace);
				if (vnodeHook = props.onVnodeBeforeMount) invokeVNodeHook(vnodeHook, parentComponent, vnode);
			}
			def(el, "__vnode", vnode, true);
			def(el, "__vueParentComponent", parentComponent, true);
			if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
			const needCallTransitionHooks = needTransition(parentSuspense, transition);
			if (needCallTransitionHooks) transition.beforeEnter(el);
			hostInsert(el, container, anchor);
			if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
				const isHmr = isHmrUpdating;
				queuePostRenderEffect(() => {
					let prev;
					prev = setHmrUpdating(isHmr);
					try {
						vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
						needCallTransitionHooks && transition.enter(el);
						dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
					} finally {
						setHmrUpdating(prev);
					}
				}, parentSuspense);
			}
		};
		const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
			if (scopeId) hostSetScopeId(el, scopeId);
			if (slotScopeIds) for (let i = 0; i < slotScopeIds.length; i++) hostSetScopeId(el, slotScopeIds[i]);
			if (parentComponent) {
				let subTree = parentComponent.subTree;
				if (subTree.patchFlag > 0 && subTree.patchFlag & 2048) subTree = filterSingleRoot(subTree.children) || subTree;
				if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
					const parentVNode = parentComponent.vnode;
					setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
				}
			}
		};
		const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
			for (let i = start; i < children.length; i++) {
				const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
				patch(null, child, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
		};
		const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			const el = n2.el = n1.el;
			el.__vnode = n2;
			let { patchFlag, dynamicChildren, dirs } = n2;
			patchFlag |= n1.patchFlag & 16;
			const oldProps = n1.props || EMPTY_OBJ;
			const newProps = n2.props || EMPTY_OBJ;
			let vnodeHook;
			parentComponent && toggleRecurse(parentComponent, false);
			if (vnodeHook = newProps.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
			if (dirs) invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
			parentComponent && toggleRecurse(parentComponent, true);
			if (isHmrUpdating || dynamicChildren && (!n1.dynamicChildren || n1.dynamicChildren.length !== dynamicChildren.length)) {
				patchFlag = 0;
				optimized = false;
				dynamicChildren = null;
			}
			if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) hostSetElementText(el, "");
			if (dynamicChildren) {
				patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds);
				traverseStaticChildren(n1, n2);
			} else if (!optimized) patchChildren(n1, n2, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds, false);
			if (patchFlag > 0) {
				if (patchFlag & 16) patchProps(el, oldProps, newProps, parentComponent, namespace);
				else {
					if (patchFlag & 2) {
						if (oldProps.class !== newProps.class) hostPatchProp(el, "class", null, newProps.class, namespace);
					}
					if (patchFlag & 4) hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
					if (patchFlag & 8) {
						const propsToUpdate = n2.dynamicProps;
						for (let i = 0; i < propsToUpdate.length; i++) {
							const key = propsToUpdate[i];
							const prev = oldProps[key];
							const next = newProps[key];
							if (next !== prev || key === "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
						}
					}
				}
				if (patchFlag & 1) {
					if (n1.children !== n2.children) hostSetElementText(el, n2.children);
				}
			} else if (!optimized && dynamicChildren == null) patchProps(el, oldProps, newProps, parentComponent, namespace);
			if ((vnodeHook = newProps.onVnodeUpdated) || dirs) queuePostRenderEffect(() => {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
				dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
			}, parentSuspense);
		};
		const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
			for (let i = 0; i < newChildren.length; i++) {
				const oldVNode = oldChildren[i];
				const newVNode = newChildren[i];
				const container = oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & 198) ? hostParentNode(oldVNode.el) : fallbackContainer;
				patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, true);
			}
		};
		const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
			if (oldProps !== newProps) {
				if (oldProps !== EMPTY_OBJ) {
					for (const key in oldProps) if (!isReservedProp(key) && !(key in newProps)) hostPatchProp(el, key, oldProps[key], null, namespace, parentComponent);
				}
				for (const key in newProps) {
					if (isReservedProp(key)) continue;
					const next = newProps[key];
					const prev = oldProps[key];
					if (next !== prev && key !== "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
				}
				if ("value" in newProps) hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
			}
		};
		const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
			const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
			let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
			if (isHmrUpdating || patchFlag & 2048) {
				patchFlag = 0;
				optimized = false;
				dynamicChildren = null;
			}
			if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
			if (n1 == null) {
				hostInsert(fragmentStartAnchor, container, anchor);
				hostInsert(fragmentEndAnchor, container, anchor);
				mountChildren(n2.children || [], container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			} else if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
				patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, namespace, slotScopeIds);
				traverseStaticChildren(n1, n2);
			} else patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		};
		const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			n2.slotScopeIds = slotScopeIds;
			if (n1 == null) {
				if (n2.shapeFlag & 512) parentComponent.ctx.activate(n2, container, anchor, namespace, optimized);
				else mountComponent(n2, container, anchor, parentComponent, parentSuspense, namespace, optimized);
			} else updateComponent(n1, n2, optimized);
		};
		const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
			const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
			if (instance.type.__hmrId) registerHMR(instance);
			pushWarningContext(initialVNode);
			startMeasure(instance, `mount`);
			if (isKeepAlive(initialVNode)) instance.ctx.renderer = internals;
			startMeasure(instance, `init`);
			setupComponent(instance, false, optimized);
			endMeasure(instance, `init`);
			if (isHmrUpdating) initialVNode.el = null;
			if (instance.asyncDep) {
				parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
				if (!initialVNode.el) {
					const placeholder = instance.subTree = createVNode(Comment);
					processCommentNode(null, placeholder, container, anchor);
					initialVNode.placeholder = placeholder.el;
				}
			} else setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, namespace, optimized);
			popWarningContext();
			endMeasure(instance, `mount`);
		};
		const updateComponent = (n1, n2, optimized) => {
			const instance = n2.component = n1.component;
			if (shouldUpdateComponent(n1, n2, optimized)) {
				if (instance.asyncDep && !instance.asyncResolved) {
					pushWarningContext(n2);
					n2.el = n1.el;
					updateComponentPreRender(instance, n2, optimized);
					popWarningContext();
					return;
				} else {
					instance.next = n2;
					instance.update();
				}
			} else {
				n2.el = n1.el;
				instance.vnode = n2;
			}
		};
		const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
			const componentUpdateFn = () => {
				if (!instance.isMounted) {
					let vnodeHook;
					const { el, props } = initialVNode;
					const { bm, m, parent, root, type } = instance;
					const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
					toggleRecurse(instance, false);
					if (bm) invokeArrayFns(bm);
					if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) invokeVNodeHook(vnodeHook, parent, initialVNode);
					toggleRecurse(instance, true);
					if (el && hydrateNode) {
						const hydrateSubTree = () => {
							startMeasure(instance, `render`);
							instance.subTree = renderComponentRoot(instance);
							endMeasure(instance, `render`);
							startMeasure(instance, `hydrate`);
							hydrateNode(el, instance.subTree, instance, parentSuspense, null);
							endMeasure(instance, `hydrate`);
						};
						if (isAsyncWrapperVNode && type.__asyncHydrate) type.__asyncHydrate(el, instance, hydrateSubTree);
						else hydrateSubTree();
					} else {
						if (root.ce && root.ce._hasShadowRoot()) root.ce._injectChildStyle(type, instance.parent ? instance.parent.type : void 0);
						startMeasure(instance, `render`);
						const subTree = instance.subTree = renderComponentRoot(instance);
						endMeasure(instance, `render`);
						startMeasure(instance, `patch`);
						patch(null, subTree, container, anchor, instance, parentSuspense, namespace);
						endMeasure(instance, `patch`);
						initialVNode.el = subTree.el;
					}
					if (m) queuePostRenderEffect(m, parentSuspense);
					if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
						const scopedInitialVNode = initialVNode;
						queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
					}
					if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) instance.a && queuePostRenderEffect(instance.a, parentSuspense);
					instance.isMounted = true;
					devtoolsComponentAdded(instance);
					initialVNode = container = anchor = null;
				} else {
					let { next, bu, u, parent, vnode } = instance;
					{
						const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
						if (nonHydratedAsyncRoot) {
							if (next) {
								next.el = vnode.el;
								updateComponentPreRender(instance, next, optimized);
							}
							nonHydratedAsyncRoot.asyncDep.then(() => {
								queuePostRenderEffect(() => {
									if (!instance.isUnmounted) update();
								}, parentSuspense);
							});
							return;
						}
					}
					let originNext = next;
					let vnodeHook;
					pushWarningContext(next || instance.vnode);
					toggleRecurse(instance, false);
					if (next) {
						next.el = vnode.el;
						updateComponentPreRender(instance, next, optimized);
					} else next = vnode;
					if (bu) invokeArrayFns(bu);
					if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parent, next, vnode);
					toggleRecurse(instance, true);
					startMeasure(instance, `render`);
					const nextTree = renderComponentRoot(instance);
					endMeasure(instance, `render`);
					const prevTree = instance.subTree;
					instance.subTree = nextTree;
					startMeasure(instance, `patch`);
					patch(prevTree, nextTree, hostParentNode(prevTree.el), getNextHostNode(prevTree), instance, parentSuspense, namespace);
					endMeasure(instance, `patch`);
					next.el = nextTree.el;
					if (originNext === null) updateHOCHostEl(instance, nextTree.el);
					if (u) queuePostRenderEffect(u, parentSuspense);
					if (vnodeHook = next.props && next.props.onVnodeUpdated) queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
					devtoolsComponentUpdated(instance);
					popWarningContext();
				}
			};
			instance.scope.on();
			const effect = instance.effect = new ReactiveEffect(componentUpdateFn);
			instance.scope.off();
			const update = instance.update = effect.run.bind(effect);
			const job = instance.job = effect.runIfDirty.bind(effect);
			job.i = instance;
			job.id = instance.uid;
			effect.scheduler = () => queueJob(job);
			toggleRecurse(instance, true);
			effect.onTrack = instance.rtc ? (e) => invokeArrayFns(instance.rtc, e) : void 0;
			effect.onTrigger = instance.rtg ? (e) => invokeArrayFns(instance.rtg, e) : void 0;
			update();
		};
		const updateComponentPreRender = (instance, nextVNode, optimized) => {
			nextVNode.component = instance;
			const prevProps = instance.vnode.props;
			instance.vnode = nextVNode;
			instance.next = null;
			updateProps(instance, nextVNode.props, prevProps, optimized);
			updateSlots(instance, nextVNode.children, optimized);
			pauseTracking();
			flushPreFlushCbs(instance);
			resetTracking();
		};
		const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
			const c1 = n1 && n1.children;
			const prevShapeFlag = n1 ? n1.shapeFlag : 0;
			const c2 = n2.children;
			const { patchFlag, shapeFlag } = n2;
			if (patchFlag > 0) {
				if (patchFlag & 128) {
					patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					return;
				} else if (patchFlag & 256) {
					patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					return;
				}
			}
			if (shapeFlag & 8) {
				if (prevShapeFlag & 16) unmountChildren(c1, parentComponent, parentSuspense);
				if (c2 !== c1) hostSetElementText(container, c2);
			} else if (prevShapeFlag & 16) {
				if (shapeFlag & 16) patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else unmountChildren(c1, parentComponent, parentSuspense, true);
			} else {
				if (prevShapeFlag & 8) hostSetElementText(container, "");
				if (shapeFlag & 16) mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
		};
		const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			c1 = c1 || EMPTY_ARR;
			c2 = c2 || EMPTY_ARR;
			const oldLength = c1.length;
			const newLength = c2.length;
			const commonLength = Math.min(oldLength, newLength);
			let i = 0;
			for (; i < commonLength; i++) {
				const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
			if (oldLength > newLength) unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
			else mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, commonLength);
		};
		const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			let i = 0;
			const l2 = c2.length;
			let e1 = c1.length - 1;
			let e2 = l2 - 1;
			while (i <= e1 && i <= e2) {
				const n1 = c1[i];
				const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else break;
				i++;
			}
			while (i <= e1 && i <= e2) {
				const n1 = c1[e1];
				const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
				if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else break;
				e1--;
				e2--;
			}
			if (i > e1) {
				if (i <= e2) {
					const nextPos = e2 + 1;
					const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
					while (i <= e2) {
						patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
						i++;
					}
				}
			} else if (i > e2) while (i <= e1) {
				unmount(c1[i], parentComponent, parentSuspense, true);
				i++;
			}
			else {
				const s1 = i;
				const s2 = i;
				const keyToNewIndexMap = /* @__PURE__ */ new Map();
				for (i = s2; i <= e2; i++) {
					const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
					if (nextChild.key != null) {
						if (keyToNewIndexMap.has(nextChild.key)) warn$1(`Duplicate keys found during update:`, JSON.stringify(nextChild.key), `Make sure keys are unique.`);
						keyToNewIndexMap.set(nextChild.key, i);
					}
				}
				let j;
				let patched = 0;
				const toBePatched = e2 - s2 + 1;
				let moved = false;
				let maxNewIndexSoFar = 0;
				const newIndexToOldIndexMap = new Array(toBePatched);
				for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
				for (i = s1; i <= e1; i++) {
					const prevChild = c1[i];
					if (patched >= toBePatched) {
						unmount(prevChild, parentComponent, parentSuspense, true);
						continue;
					}
					let newIndex;
					if (prevChild.key != null) newIndex = keyToNewIndexMap.get(prevChild.key);
					else for (j = s2; j <= e2; j++) if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
						newIndex = j;
						break;
					}
					if (newIndex === void 0) unmount(prevChild, parentComponent, parentSuspense, true);
					else {
						newIndexToOldIndexMap[newIndex - s2] = i + 1;
						if (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex;
						else moved = true;
						patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
						patched++;
					}
				}
				const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
				j = increasingNewIndexSequence.length - 1;
				for (i = toBePatched - 1; i >= 0; i--) {
					const nextIndex = s2 + i;
					const nextChild = c2[nextIndex];
					const anchorVNode = c2[nextIndex + 1];
					const anchor = nextIndex + 1 < l2 ? anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode) : parentAnchor;
					if (newIndexToOldIndexMap[i] === 0) patch(null, nextChild, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					else if (moved) {
						if (j < 0 || i !== increasingNewIndexSequence[j]) move(nextChild, container, anchor, 2);
						else j--;
					}
				}
			}
		};
		const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
			const { el, type, transition, children, shapeFlag } = vnode;
			if (shapeFlag & 6) {
				move(vnode.component.subTree, container, anchor, moveType);
				return;
			}
			if (shapeFlag & 128) {
				vnode.suspense.move(container, anchor, moveType);
				return;
			}
			if (shapeFlag & 64) {
				type.move(vnode, container, anchor, internals);
				return;
			}
			if (type === Fragment) {
				hostInsert(el, container, anchor);
				for (let i = 0; i < children.length; i++) move(children[i], container, anchor, moveType);
				hostInsert(vnode.anchor, container, anchor);
				return;
			}
			if (type === Static) {
				moveStaticNode(vnode, container, anchor);
				return;
			}
			if (moveType !== 2 && shapeFlag & 1 && transition) {
				if (moveType === 0) {
					if (transition.persisted && !el[leaveCbKey]) hostInsert(el, container, anchor);
					else {
						transition.beforeEnter(el);
						hostInsert(el, container, anchor);
						queuePostRenderEffect(() => transition.enter(el), parentSuspense);
					}
				} else {
					const { leave, delayLeave, afterLeave } = transition;
					const remove2 = () => {
						if (vnode.ctx.isUnmounted) hostRemove(el);
						else hostInsert(el, container, anchor);
					};
					const performLeave = () => {
						const wasLeaving = el._isLeaving || !!el[leaveCbKey];
						if (el._isLeaving) el[leaveCbKey](true);
						if (transition.persisted && !wasLeaving) remove2();
						else leave(el, () => {
							remove2();
							afterLeave && afterLeave();
						});
					};
					if (delayLeave) delayLeave(el, remove2, performLeave);
					else performLeave();
				}
			} else hostInsert(el, container, anchor);
		};
		const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
			const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs, cacheIndex, memo } = vnode;
			if (patchFlag === -2 || dynamicChildren && dynamicChildren.hasOnce) optimized = false;
			if (ref != null) {
				pauseTracking();
				setRef(ref, null, parentSuspense, vnode, true);
				resetTracking();
			}
			if (cacheIndex != null && (!vnode.ctx || vnode.ctx === parentComponent)) parentComponent.renderCache[cacheIndex] = void 0;
			if (shapeFlag & 256) {
				parentComponent.ctx.deactivate(vnode);
				return;
			}
			const shouldInvokeDirs = shapeFlag & 1 && dirs;
			const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
			let vnodeHook;
			if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) invokeVNodeHook(vnodeHook, parentComponent, vnode);
			if (shapeFlag & 6) unmountComponent(vnode.component, parentSuspense, doRemove);
			else {
				if (shapeFlag & 128) {
					vnode.suspense.unmount(parentSuspense, doRemove);
					return;
				}
				if (shouldInvokeDirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
				if (shapeFlag & 64) vnode.type.remove(vnode, parentComponent, parentSuspense, internals, doRemove);
				else if (dynamicChildren && !dynamicChildren.hasOnce && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
				else if (type === Fragment && patchFlag & 384 || !optimized && shapeFlag & 16) unmountChildren(children, parentComponent, parentSuspense);
				if (doRemove) remove(vnode);
			}
			const shouldInvalidateMemo = memo != null && cacheIndex == null;
			if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) queuePostRenderEffect(() => {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
				shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
				if (shouldInvalidateMemo) vnode.el = null;
			}, parentSuspense);
		};
		const remove = (vnode) => {
			const { type, el, anchor, transition } = vnode;
			if (type === Fragment) {
				if (vnode.patchFlag > 0 && vnode.patchFlag & 2048 && transition && !transition.persisted) vnode.children.forEach((child) => {
					if (child.type === Comment) hostRemove(child.el);
					else remove(child);
				});
				else removeFragment(el, anchor);
				return;
			}
			if (type === Static) {
				removeStaticNode(vnode);
				if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
				return;
			}
			const performRemove = () => {
				hostRemove(el);
				if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
			};
			if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
				const { leave, delayLeave } = transition;
				const performLeave = () => leave(el, performRemove);
				if (delayLeave) delayLeave(vnode.el, performRemove, performLeave);
				else performLeave();
			} else performRemove();
		};
		const removeFragment = (cur, end) => {
			let next;
			while (cur !== end) {
				next = hostNextSibling(cur);
				hostRemove(cur);
				cur = next;
			}
			hostRemove(end);
		};
		const unmountComponent = (instance, parentSuspense, doRemove) => {
			if (instance.type.__hmrId) unregisterHMR(instance);
			const { bum, scope, job, subTree, um, m, a } = instance;
			invalidateMount(m);
			invalidateMount(a);
			if (bum) invokeArrayFns(bum);
			scope.stop();
			if (job) {
				job.flags |= 8;
				unmount(subTree, instance, parentSuspense, doRemove);
			} else if (instance.vnode.el && subTree) {
				subTree.transition = instance.vnode.transition;
				unmount(subTree, instance, parentSuspense, doRemove);
			}
			if (um) queuePostRenderEffect(um, parentSuspense);
			queuePostRenderEffect(() => {
				instance.isUnmounted = true;
			}, parentSuspense);
			devtoolsComponentRemoved(instance);
		};
		const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
			for (let i = start; i < children.length; i++) unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
		};
		const getNextHostNode = (vnode) => {
			if (vnode.shapeFlag & 6) return getNextHostNode(vnode.component.subTree);
			if (vnode.shapeFlag & 128) return vnode.suspense.next();
			const el = hostNextSibling(vnode.anchor || vnode.el);
			const teleportEnd = el && el[TeleportEndKey];
			return teleportEnd ? hostNextSibling(teleportEnd) : el;
		};
		let isFlushing = false;
		const render = (vnode, container, namespace) => {
			let instance;
			if (vnode == null) {
				if (container._vnode) {
					unmount(container._vnode, null, null, true);
					instance = container._vnode.component;
				}
			} else patch(container._vnode || null, vnode, container, null, null, null, namespace);
			container._vnode = vnode;
			if (!isFlushing) {
				isFlushing = true;
				flushPreFlushCbs(instance);
				flushPostFlushCbs();
				isFlushing = false;
			}
		};
		const internals = {
			p: patch,
			um: unmount,
			m: move,
			r: remove,
			mt: mountComponent,
			mc: mountChildren,
			pc: patchChildren,
			pbc: patchBlockChildren,
			n: getNextHostNode,
			o: options
		};
		let hydrate;
		let hydrateNode;
		if (createHydrationFns) [hydrate, hydrateNode] = createHydrationFns(internals);
		return {
			render,
			hydrate,
			createApp: createAppAPI(render, hydrate)
		};
	}
	function resolveChildrenNamespace({ type, props }, currentNamespace) {
		return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
	}
	function toggleRecurse({ effect, job }, allowed) {
		if (allowed) {
			effect.flags |= 32;
			job.flags |= 4;
		} else {
			effect.flags &= -33;
			job.flags &= -5;
		}
	}
	function needTransition(parentSuspense, transition) {
		return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
	}
	function traverseStaticChildren(n1, n2, shallow = false) {
		const ch1 = n1.children;
		const ch2 = n2.children;
		if (isArray(ch1) && isArray(ch2)) for (let i = 0; i < ch1.length; i++) {
			const c1 = ch1[i];
			let c2 = ch2[i];
			if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
				if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
					c2 = ch2[i] = cloneIfMounted(ch2[i]);
					c2.el = c1.el;
				}
				if (!shallow && c2.patchFlag !== -2) traverseStaticChildren(c1, c2);
			}
			if (c2.type === Text) {
				if (c2.patchFlag === -1) c2 = ch2[i] = cloneIfMounted(c2);
				c2.el = c1.el;
			}
			if (c2.type === Comment && !c2.el) c2.el = c1.el;
			c2.el && (c2.el.__vnode = c2);
		}
	}
	function getSequence(arr) {
		const p = arr.slice();
		const result = [0];
		let i, j, u, v, c;
		const len = arr.length;
		for (i = 0; i < len; i++) {
			const arrI = arr[i];
			if (arrI !== 0) {
				j = result[result.length - 1];
				if (arr[j] < arrI) {
					p[i] = j;
					result.push(i);
					continue;
				}
				u = 0;
				v = result.length - 1;
				while (u < v) {
					c = u + v >> 1;
					if (arr[result[c]] < arrI) u = c + 1;
					else v = c;
				}
				if (arrI < arr[result[u]]) {
					if (u > 0) p[i] = result[u - 1];
					result[u] = i;
				}
			}
		}
		u = result.length;
		v = result[u - 1];
		while (u-- > 0) {
			result[u] = v;
			v = p[v];
		}
		return result;
	}
	function locateNonHydratedAsyncRoot(instance) {
		const subComponent = instance.subTree.component;
		if (subComponent) {
			if (subComponent.asyncDep && !subComponent.asyncResolved) return subComponent;
			else return locateNonHydratedAsyncRoot(subComponent);
		}
	}
	function invalidateMount(hooks) {
		if (hooks) for (let i = 0; i < hooks.length; i++) hooks[i].flags |= 8;
	}
	function resolveAsyncComponentPlaceholder(anchorVnode) {
		if (anchorVnode.placeholder) return anchorVnode.placeholder;
		const instance = anchorVnode.component;
		if (instance) return resolveAsyncComponentPlaceholder(instance.subTree);
		return null;
	}
	var isSuspense = (type) => type.__isSuspense;
	function queueEffectWithSuspense(fn, suspense) {
		if (suspense && suspense.pendingBranch) {
			if (isArray(fn)) suspense.effects.push(...fn);
			else suspense.effects.push(fn);
		} else queuePostFlushCb(fn);
	}
	var Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
	var Text = /* @__PURE__ */ Symbol.for("v-txt");
	var Comment = /* @__PURE__ */ Symbol.for("v-cmt");
	var Static = /* @__PURE__ */ Symbol.for("v-stc");
	var blockStack = [];
	var currentBlock = null;
	function openBlock(disableTracking = false) {
		blockStack.push(currentBlock = disableTracking ? null : []);
	}
	function closeBlock() {
		blockStack.pop();
		currentBlock = blockStack[blockStack.length - 1] || null;
	}
	var isBlockTreeEnabled = 1;
	function setBlockTracking(value, inVOnce = false) {
		isBlockTreeEnabled += value;
		if (value < 0 && currentBlock && inVOnce) currentBlock.hasOnce = true;
	}
	function setupBlock(vnode) {
		vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
		closeBlock();
		if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(vnode);
		return vnode;
	}
	function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
		return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
	}
	function createBlock(type, props, children, patchFlag, dynamicProps) {
		return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
	}
	function isVNode(value) {
		return value ? value.__v_isVNode === true : false;
	}
	function isSameVNodeType(n1, n2) {
		if (n2.shapeFlag & 6 && n1.component) {
			const dirtyInstances = hmrDirtyComponents.get(n2.type);
			if (dirtyInstances && dirtyInstances.has(n1.component)) {
				n1.shapeFlag &= -257;
				n2.shapeFlag &= -513;
				return false;
			}
		}
		return n1.type === n2.type && n1.key === n2.key;
	}
	var vnodeArgsTransformer;
	var createVNodeWithArgsTransform = (...args) => {
		return _createVNode(...vnodeArgsTransformer ? vnodeArgsTransformer(args, currentRenderingInstance) : args);
	};
	var normalizeKey = ({ key }) => key != null ? key : null;
	var normalizeRef = ({ ref, ref_key, ref_for }) => {
		if (typeof ref === "number") ref = "" + ref;
		return ref != null ? isString(ref) || /* @__PURE__ */ isRef(ref) || isFunction(ref) ? {
			i: currentRenderingInstance,
			r: ref,
			k: ref_key,
			f: !!ref_for
		} : ref : null;
	};
	function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
		const vnode = {
			__v_isVNode: true,
			__v_skip: true,
			type,
			props,
			key: props && normalizeKey(props),
			ref: props && normalizeRef(props),
			scopeId: currentScopeId,
			slotScopeIds: null,
			children,
			component: null,
			suspense: null,
			ssContent: null,
			ssFallback: null,
			dirs: null,
			transition: null,
			el: null,
			anchor: null,
			target: null,
			targetStart: null,
			targetAnchor: null,
			staticCount: 0,
			shapeFlag,
			patchFlag,
			dynamicProps,
			dynamicChildren: null,
			appContext: null,
			ctx: currentRenderingInstance
		};
		if (needFullChildrenNormalization) {
			normalizeChildren(vnode, children);
			if (shapeFlag & 128) type.normalize(vnode);
		} else if (children) vnode.shapeFlag |= isString(children) ? 8 : 16;
		if (vnode.key !== vnode.key) warn$1(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
		if (props && vnode.shapeFlag & 1) {
			const overwritingProp = props.innerHTML != null ? "innerHTML" : props.textContent != null ? "textContent" : null;
			if (overwritingProp && hasContentChildren(vnode.children)) warn$1(`The \`${overwritingProp}\` prop on <${vnode.type}> will override its children. Remove either the \`${overwritingProp}\` prop or the children.`);
		}
		if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) currentBlock.push(vnode);
		return vnode;
	}
	function hasContentChildren(children) {
		if (isString(children)) return children !== "";
		if (isArray(children)) return children.length > 0;
		return false;
	}
	var createVNode = createVNodeWithArgsTransform;
	function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
		if (!type || type === NULL_DYNAMIC_COMPONENT) {
			if (!type) warn$1(`Invalid vnode type when creating vnode: ${type}.`);
			type = Comment;
		}
		if (isVNode(type)) {
			const cloned = cloneVNode(type, props, true);
			if (children) normalizeChildren(cloned, children);
			if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
				if (cloned.shapeFlag & 6) currentBlock[currentBlock.indexOf(type)] = cloned;
				else currentBlock.push(cloned);
			}
			cloned.patchFlag = -2;
			return cloned;
		}
		if (isClassComponent(type)) type = type.__vccOpts;
		if (props) {
			props = guardReactiveProps(props);
			let { class: klass, style } = props;
			if (klass && !isString(klass)) props.class = normalizeClass(klass);
			if (isObject$1(style)) {
				if (/* @__PURE__ */ isProxy(style) && !isArray(style)) style = extend$1({}, style);
				props.style = normalizeStyle(style);
			}
		}
		const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$1(type) ? 4 : isFunction(type) ? 2 : 0;
		if (shapeFlag & 4 && /* @__PURE__ */ isProxy(type)) {
			type = /* @__PURE__ */ toRaw(type);
			warn$1(`Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with \`markRaw\` or using \`shallowRef\` instead of \`ref\`.`, `
Component that was made reactive: `, type);
		}
		return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
	}
	function guardReactiveProps(props) {
		if (!props) return null;
		return /* @__PURE__ */ isProxy(props) || isInternalObject(props) ? extend$1({}, props) : props;
	}
	function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
		const { props, ref, patchFlag, children, transition } = vnode;
		const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
		const cloned = {
			__v_isVNode: true,
			__v_skip: true,
			type: vnode.type,
			props: mergedProps,
			key: mergedProps && normalizeKey(mergedProps),
			ref: extraProps && extraProps.ref ? mergeRef && ref ? isArray(ref) ? ref.concat(normalizeRef(extraProps)) : [ref, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref,
			scopeId: vnode.scopeId,
			slotScopeIds: vnode.slotScopeIds,
			children: patchFlag === -1 && isArray(children) ? children.map(deepCloneVNode) : children,
			target: vnode.target,
			targetStart: vnode.targetStart,
			targetAnchor: vnode.targetAnchor,
			staticCount: vnode.staticCount,
			shapeFlag: vnode.shapeFlag,
			patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
			dynamicProps: vnode.dynamicProps,
			dynamicChildren: vnode.dynamicChildren,
			appContext: vnode.appContext,
			dirs: vnode.dirs,
			transition,
			component: vnode.component,
			suspense: vnode.suspense,
			ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
			ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
			placeholder: vnode.placeholder,
			el: vnode.el,
			anchor: vnode.anchor,
			ctx: vnode.ctx,
			ce: vnode.ce,
			cacheIndex: vnode.cacheIndex
		};
		if (transition && cloneTransition) setTransitionHooks(cloned, transition.clone(cloned));
		return cloned;
	}
	function deepCloneVNode(vnode) {
		const cloned = cloneVNode(vnode);
		if (isArray(vnode.children)) cloned.children = vnode.children.map(deepCloneVNode);
		return cloned;
	}
	function createTextVNode(text = " ", flag = 0) {
		return createVNode(Text, null, text, flag);
	}
	function createCommentVNode(text = "", asBlock = false) {
		return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
	}
	function normalizeVNode(child) {
		if (child == null || typeof child === "boolean") return createVNode(Comment);
		else if (isArray(child)) return createVNode(Fragment, null, child.slice());
		else if (isVNode(child)) return cloneIfMounted(child);
		else return createVNode(Text, null, String(child));
	}
	function cloneIfMounted(child) {
		return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
	}
	function normalizeChildren(vnode, children) {
		let type = 0;
		const { shapeFlag } = vnode;
		if (children == null) children = null;
		else if (isArray(children)) type = 16;
		else if (typeof children === "object") {
			if (shapeFlag & 65) {
				const slot = children.default;
				if (slot) {
					slot._c && (slot._d = false);
					normalizeChildren(vnode, slot());
					slot._c && (slot._d = true);
				}
				return;
			} else {
				type = 32;
				const slotFlag = children._;
				if (!slotFlag && !isInternalObject(children)) children._ctx = currentRenderingInstance;
				else if (slotFlag === 3 && currentRenderingInstance) {
					if (currentRenderingInstance.slots._ === 1) children._ = 1;
					else {
						children._ = 2;
						vnode.patchFlag |= 1024;
					}
				}
			}
		} else if (isFunction(children)) {
			if (shapeFlag & 65) {
				normalizeChildren(vnode, { default: children });
				return;
			}
			children = {
				default: children,
				_ctx: currentRenderingInstance
			};
			type = 32;
		} else {
			children = String(children);
			if (shapeFlag & 64) {
				type = 16;
				children = [createTextVNode(children)];
			} else type = 8;
		}
		vnode.children = children;
		vnode.shapeFlag |= type;
	}
	function mergeProps(...args) {
		const ret = {};
		for (let i = 0; i < args.length; i++) {
			const toMerge = args[i];
			for (const key in toMerge) if (key === "class") {
				if (ret.class !== toMerge.class) ret.class = normalizeClass([ret.class, toMerge.class]);
			} else if (key === "style") ret.style = normalizeStyle([ret.style, toMerge.style]);
			else if (isOn(key)) {
				const existing = ret[key];
				const incoming = toMerge[key];
				if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) ret[key] = existing ? [].concat(existing, incoming) : incoming;
				else if (incoming == null && existing == null && !isModelListener(key)) ret[key] = incoming;
			} else if (key !== "") ret[key] = toMerge[key];
		}
		return ret;
	}
	function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
		callWithAsyncErrorHandling(hook, instance, 7, [vnode, prevVNode]);
	}
	var emptyAppContext = createAppContext();
	var uid$3 = 0;
	function createComponentInstance(vnode, parent, suspense) {
		const type = vnode.type;
		const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
		const instance = {
			uid: uid$3++,
			vnode,
			type,
			parent,
			appContext,
			root: null,
			next: null,
			subTree: null,
			effect: null,
			update: null,
			job: null,
			scope: new EffectScope(true),
			render: null,
			proxy: null,
			exposed: null,
			exposeProxy: null,
			withProxy: null,
			provides: parent ? parent.provides : Object.create(appContext.provides),
			ids: parent ? parent.ids : [
				"",
				0,
				0
			],
			accessCache: null,
			renderCache: [],
			components: null,
			directives: null,
			propsOptions: normalizePropsOptions(type, appContext),
			emitsOptions: normalizeEmitsOptions(type, appContext),
			emit: null,
			emitted: null,
			propsDefaults: EMPTY_OBJ,
			inheritAttrs: type.inheritAttrs,
			ctx: EMPTY_OBJ,
			data: EMPTY_OBJ,
			props: EMPTY_OBJ,
			attrs: EMPTY_OBJ,
			slots: EMPTY_OBJ,
			refs: EMPTY_OBJ,
			setupState: EMPTY_OBJ,
			setupContext: null,
			suspense,
			suspenseId: suspense ? suspense.pendingId : 0,
			asyncDep: null,
			asyncResolved: false,
			isMounted: false,
			isUnmounted: false,
			isDeactivated: false,
			bc: null,
			c: null,
			bm: null,
			m: null,
			bu: null,
			u: null,
			um: null,
			bum: null,
			da: null,
			a: null,
			rtg: null,
			rtc: null,
			ec: null,
			sp: null
		};
		instance.ctx = createDevRenderContext(instance);
		instance.root = parent ? parent.root : instance;
		instance.emit = emit.bind(null, instance);
		if (vnode.ce) vnode.ce(instance);
		return instance;
	}
	var currentInstance = null;
	var getCurrentInstance = () => currentInstance || currentRenderingInstance;
	var internalSetCurrentInstance;
	var setInSSRSetupState;
	{
		const g = getGlobalThis();
		const registerGlobalSetter = (key, setter) => {
			let setters;
			if (!(setters = g[key])) setters = g[key] = [];
			setters.push(setter);
			return (v) => {
				if (setters.length > 1) setters.forEach((set) => set(v));
				else setters[0](v);
			};
		};
		internalSetCurrentInstance = registerGlobalSetter(`__VUE_INSTANCE_SETTERS__`, (v) => currentInstance = v);
		setInSSRSetupState = registerGlobalSetter(`__VUE_SSR_SETTERS__`, (v) => isInSSRComponentSetup = v);
	}
	var setCurrentInstance = (instance) => {
		const prev = currentInstance;
		internalSetCurrentInstance(instance);
		instance.scope.on();
		return () => {
			instance.scope.off();
			internalSetCurrentInstance(prev);
		};
	};
	var unsetCurrentInstance = () => {
		currentInstance && currentInstance.scope.off();
		internalSetCurrentInstance(null);
	};
	var isBuiltInTag = /* @__PURE__ */ makeMap("slot,component");
	function validateComponentName(name, { isNativeTag }) {
		if (isBuiltInTag(name) || isNativeTag(name)) warn$1("Do not use built-in or reserved HTML elements as component id: " + name);
	}
	function isStatefulComponent(instance) {
		return instance.vnode.shapeFlag & 4;
	}
	var isInSSRComponentSetup = false;
	function setupComponent(instance, isSSR = false, optimized = false) {
		isSSR && setInSSRSetupState(isSSR);
		const { props, children } = instance.vnode;
		const isStateful = isStatefulComponent(instance);
		initProps(instance, props, isStateful, isSSR);
		initSlots(instance, children, optimized || isSSR);
		const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
		isSSR && setInSSRSetupState(false);
		return setupResult;
	}
	function setupStatefulComponent(instance, isSSR) {
		const Component = instance.type;
		if (Component.name) validateComponentName(Component.name, instance.appContext.config);
		if (Component.components) {
			const names = Object.keys(Component.components);
			for (let i = 0; i < names.length; i++) validateComponentName(names[i], instance.appContext.config);
		}
		if (Component.directives) {
			const names = Object.keys(Component.directives);
			for (let i = 0; i < names.length; i++) validateDirectiveName(names[i]);
		}
		if (Component.compilerOptions && isRuntimeOnly()) warn$1(`"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.`);
		instance.accessCache = /* @__PURE__ */ Object.create(null);
		instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
		exposePropsOnRenderContext(instance);
		const { setup } = Component;
		if (setup) {
			pauseTracking();
			const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
			const reset = setCurrentInstance(instance);
			const setupResult = callWithErrorHandling(setup, instance, 0, [/* @__PURE__ */ shallowReadonly(instance.props), setupContext]);
			const isAsyncSetup = isPromise(setupResult);
			resetTracking();
			reset();
			if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) markAsyncBoundary(instance);
			if (isAsyncSetup) {
				setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
				if (isSSR) return setupResult.then((resolvedResult) => {
					setInSSRSetupState(true);
					try {
						handleSetupResult(instance, resolvedResult, isSSR);
					} finally {
						setInSSRSetupState(false);
					}
				}).catch((e) => {
					handleError(e, instance, 0);
				});
				else {
					instance.asyncDep = setupResult;
					if (!instance.suspense) warn$1(`Component <${formatComponentName(instance, Component)}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`);
				}
			} else handleSetupResult(instance, setupResult, isSSR);
		} else finishComponentSetup(instance, isSSR);
	}
	function handleSetupResult(instance, setupResult, isSSR) {
		if (isFunction(setupResult)) {
			if (instance.type.__ssrInlineRender) instance.ssrRender = setupResult;
			else instance.render = setupResult;
		} else if (isObject$1(setupResult)) {
			if (isVNode(setupResult)) warn$1(`setup() should not return VNodes directly - return a render function instead.`);
			instance.devtoolsRawSetupState = setupResult;
			instance.setupState = proxyRefs(setupResult);
			exposeSetupStateOnRenderContext(instance);
		} else if (setupResult !== void 0) warn$1(`setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`);
		finishComponentSetup(instance, isSSR);
	}
	var compile;
	var installWithProxy;
	var isRuntimeOnly = () => !compile;
	function finishComponentSetup(instance, isSSR, skipOptions) {
		const Component = instance.type;
		if (!instance.render) {
			if (!isSSR && compile && !Component.render) {
				const template = Component.template || resolveMergedOptions(instance).template;
				if (template) {
					startMeasure(instance, `compile`);
					const { isCustomElement, compilerOptions } = instance.appContext.config;
					const { delimiters, compilerOptions: componentCompilerOptions } = Component;
					Component.render = compile(template, extend$1(extend$1({
						isCustomElement,
						delimiters
					}, compilerOptions), componentCompilerOptions));
					endMeasure(instance, `compile`);
				}
			}
			instance.render = Component.render || NOOP;
			if (installWithProxy) installWithProxy(instance);
		}
		{
			const reset = setCurrentInstance(instance);
			pauseTracking();
			try {
				applyOptions(instance);
			} finally {
				resetTracking();
				reset();
			}
		}
		if (!Component.render && instance.render === NOOP && !isSSR) {
			if (!compile && Component.template) warn$1("Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias \"vue\" to \"vue/dist/vue.esm-bundler.js\".");
			else warn$1(`Component is missing template or render function: `, Component);
		}
	}
	var attrsProxyHandlers = {
		get(target, key) {
			markAttrsAccessed();
			track(target, "get", "");
			return target[key];
		},
		set() {
			warn$1(`setupContext.attrs is readonly.`);
			return false;
		},
		deleteProperty() {
			warn$1(`setupContext.attrs is readonly.`);
			return false;
		}
	};
	function getSlotsProxy(instance) {
		return new Proxy(instance.slots, { get(target, key) {
			track(instance, "get", "$slots");
			return target[key];
		} });
	}
	function createSetupContext(instance) {
		const expose = (exposed) => {
			if (instance.exposed) warn$1(`expose() should be called only once per setup().`);
			if (exposed != null) {
				let exposedType = typeof exposed;
				if (exposedType === "object") {
					if (isArray(exposed)) exposedType = "array";
					else if (/* @__PURE__ */ isRef(exposed)) exposedType = "ref";
				}
				if (exposedType !== "object") warn$1(`expose() should be passed a plain object, received ${exposedType}.`);
			}
			instance.exposed = exposed || {};
		};
		{
			let attrsProxy;
			let slotsProxy;
			return Object.freeze({
				get attrs() {
					return attrsProxy || (attrsProxy = new Proxy(instance.attrs, attrsProxyHandlers));
				},
				get slots() {
					return slotsProxy || (slotsProxy = getSlotsProxy(instance));
				},
				get emit() {
					return (event, ...args) => instance.emit(event, ...args);
				},
				expose
			});
		}
	}
	function getComponentPublicInstance(instance) {
		if (instance.exposed) return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
			get(target, key) {
				if (key in target) return target[key];
				else if (key in publicPropertiesMap) return publicPropertiesMap[key](instance);
			},
			has(target, key) {
				return key in target || key in publicPropertiesMap;
			}
		}));
		else return instance.proxy;
	}
	var classifyRE = /(?:^|[-_])\w/g;
	var classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
	function getComponentName(Component, includeInferred = true) {
		return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
	}
	function formatComponentName(instance, Component, isRoot = false) {
		let name = getComponentName(Component);
		if (!name && Component.__file) {
			const match = Component.__file.match(/([^/\\]+)\.\w+$/);
			if (match) name = match[1];
		}
		if (!name && instance) {
			const inferFromRegistry = (registry) => {
				for (const key in registry) if (registry[key] === Component) return key;
			};
			name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
		}
		return name ? classify(name) : isRoot ? `App` : `Anonymous`;
	}
	function isClassComponent(value) {
		return isFunction(value) && "__vccOpts" in value;
	}
	var computed = (getterOrOptions, debugOptions) => {
		const c = /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
		{
			const i = getCurrentInstance();
			if (i && i.appContext.config.warnRecursiveComputed) c._warnRecursive = true;
		}
		return c;
	};
	function h(type, propsOrChildren, children) {
		try {
			setBlockTracking(-1);
			const l = arguments.length;
			if (l === 2) {
				if (isObject$1(propsOrChildren) && !isArray(propsOrChildren)) {
					if (isVNode(propsOrChildren)) return createVNode(type, null, [propsOrChildren]);
					return createVNode(type, propsOrChildren);
				} else return createVNode(type, null, propsOrChildren);
			} else {
				if (l > 3) children = Array.prototype.slice.call(arguments, 2);
				else if (l === 3 && isVNode(children)) children = [children];
				return createVNode(type, propsOrChildren, children);
			}
		} finally {
			setBlockTracking(1);
		}
	}
	function initCustomFormatter() {
		if (typeof window === "undefined") return;
		const vueStyle = { style: "color:#3ba776" };
		const numberStyle = { style: "color:#1677ff" };
		const stringStyle = { style: "color:#f5222d" };
		const keywordStyle = { style: "color:#eb2f96" };
		const formatter = {
			__vue_custom_formatter: true,
			header(obj) {
				if (!isObject$1(obj)) return null;
				if (obj.__isVue) return [
					"div",
					vueStyle,
					`VueInstance`
				];
				else if (/* @__PURE__ */ isRef(obj)) {
					pauseTracking();
					const value = obj.value;
					resetTracking();
					return [
						"div",
						{},
						[
							"span",
							vueStyle,
							genRefFlag(obj)
						],
						"<",
						formatValue(value),
						`>`
					];
				} else if (/* @__PURE__ */ isReactive(obj)) return [
					"div",
					{},
					[
						"span",
						vueStyle,
						/* @__PURE__ */ isShallow(obj) ? "ShallowReactive" : "Reactive"
					],
					"<",
					formatValue(obj),
					`>${/* @__PURE__ */ isReadonly(obj) ? ` (readonly)` : ``}`
				];
				else if (/* @__PURE__ */ isReadonly(obj)) return [
					"div",
					{},
					[
						"span",
						vueStyle,
						/* @__PURE__ */ isShallow(obj) ? "ShallowReadonly" : "Readonly"
					],
					"<",
					formatValue(obj),
					">"
				];
				return null;
			},
			hasBody(obj) {
				return obj && obj.__isVue;
			},
			body(obj) {
				if (obj && obj.__isVue) return [
					"div",
					{},
					...formatInstance(obj.$)
				];
			}
		};
		function formatInstance(instance) {
			const blocks = [];
			if (instance.type.props && instance.props) blocks.push(createInstanceBlock("props", /* @__PURE__ */ toRaw(instance.props)));
			if (instance.setupState !== EMPTY_OBJ) blocks.push(createInstanceBlock("setup", instance.setupState));
			if (instance.data !== EMPTY_OBJ) blocks.push(createInstanceBlock("data", /* @__PURE__ */ toRaw(instance.data)));
			const computed = extractKeys(instance, "computed");
			if (computed) blocks.push(createInstanceBlock("computed", computed));
			const injected = extractKeys(instance, "inject");
			if (injected) blocks.push(createInstanceBlock("injected", injected));
			blocks.push([
				"div",
				{},
				[
					"span",
					{ style: keywordStyle.style + ";opacity:0.66" },
					"$ (internal): "
				],
				["object", { object: instance }]
			]);
			return blocks;
		}
		function createInstanceBlock(type, target) {
			target = extend$1({}, target);
			if (!Object.keys(target).length) return ["span", {}];
			return [
				"div",
				{ style: "line-height:1.25em;margin-bottom:0.6em" },
				[
					"div",
					{ style: "color:#476582" },
					type
				],
				[
					"div",
					{ style: "padding-left:1.25em" },
					...Object.keys(target).map((key) => {
						return [
							"div",
							{},
							[
								"span",
								keywordStyle,
								key + ": "
							],
							formatValue(target[key], false)
						];
					})
				]
			];
		}
		function formatValue(v, asRaw = true) {
			if (typeof v === "number") return [
				"span",
				numberStyle,
				v
			];
			else if (typeof v === "string") return [
				"span",
				stringStyle,
				JSON.stringify(v)
			];
			else if (typeof v === "boolean") return [
				"span",
				keywordStyle,
				v
			];
			else if (isObject$1(v)) return ["object", { object: asRaw ? /* @__PURE__ */ toRaw(v) : v }];
			else return [
				"span",
				stringStyle,
				String(v)
			];
		}
		function extractKeys(instance, type) {
			const Comp = instance.type;
			if (isFunction(Comp)) return;
			const extracted = {};
			for (const key in instance.ctx) if (isKeyOfType(Comp, key, type)) extracted[key] = instance.ctx[key];
			return extracted;
		}
		function isKeyOfType(Comp, key, type) {
			const opts = Comp[type];
			if (isArray(opts) && opts.includes(key) || isObject$1(opts) && key in opts) return true;
			if (Comp.extends && isKeyOfType(Comp.extends, key, type)) return true;
			if (Comp.mixins && Comp.mixins.some((m) => isKeyOfType(m, key, type))) return true;
		}
		function genRefFlag(v) {
			if (/* @__PURE__ */ isShallow(v)) return `ShallowRef`;
			if (v.effect) return `ComputedRef`;
			return `Ref`;
		}
		if (window.devtoolsFormatters) window.devtoolsFormatters.push(formatter);
		else window.devtoolsFormatters = [formatter];
	}
	var version = "3.5.43";
	var warn = warn$1;
	//#endregion
	//#region node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
	/**
	* @vue/runtime-dom v3.5.43
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	var policy = void 0;
	var tt = typeof window !== "undefined" && window.trustedTypes;
	if (tt) try {
		policy = /* @__PURE__ */ tt.createPolicy("vue", { createHTML: (val) => val });
	} catch (e) {
		warn(`Error creating trusted types policy: ${e}`);
	}
	var unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
	var svgNS = "http://www.w3.org/2000/svg";
	var mathmlNS = "http://www.w3.org/1998/Math/MathML";
	var doc = typeof document !== "undefined" ? document : null;
	var templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
	var nodeOps = {
		insert: (child, parent, anchor) => {
			parent.insertBefore(child, anchor || null);
		},
		remove: (child) => {
			const parent = child.parentNode;
			if (parent) parent.removeChild(child);
		},
		createElement: (tag, namespace, is, props) => {
			const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
			if (tag === "select" && props && props.multiple != null) el.setAttribute("multiple", props.multiple);
			return el;
		},
		createText: (text) => doc.createTextNode(text),
		createComment: (text) => doc.createComment(text),
		setText: (node, text) => {
			node.nodeValue = text;
		},
		setElementText: (el, text) => {
			el.textContent = text;
		},
		parentNode: (node) => node.parentNode,
		nextSibling: (node) => node.nextSibling,
		querySelector: (selector) => doc.querySelector(selector),
		setScopeId(el, id) {
			el.setAttribute(id, "");
		},
		insertStaticContent(content, parent, anchor, namespace, start, end) {
			const before = anchor ? anchor.previousSibling : parent.lastChild;
			if (start && (start === end || start.nextSibling)) while (true) {
				parent.insertBefore(start.cloneNode(true), anchor);
				if (start === end || !(start = start.nextSibling)) break;
			}
			else {
				templateContainer.innerHTML = unsafeToTrustedHTML(namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content);
				const template = templateContainer.content;
				if (namespace === "svg" || namespace === "mathml") {
					const wrapper = template.firstChild;
					while (wrapper.firstChild) template.appendChild(wrapper.firstChild);
					template.removeChild(wrapper);
				}
				parent.insertBefore(template, anchor);
			}
			return [before ? before.nextSibling : parent.firstChild, anchor ? anchor.previousSibling : parent.lastChild];
		}
	};
	var TRANSITION = "transition";
	var ANIMATION = "animation";
	var vtcKey = /* @__PURE__ */ Symbol("_vtc");
	var DOMTransitionPropsValidators = {
		name: String,
		type: String,
		css: {
			type: Boolean,
			default: true
		},
		duration: [
			String,
			Number,
			Object
		],
		enterFromClass: String,
		enterActiveClass: String,
		enterToClass: String,
		appearFromClass: String,
		appearActiveClass: String,
		appearToClass: String,
		leaveFromClass: String,
		leaveActiveClass: String,
		leaveToClass: String
	};
	var TransitionPropsValidators = /* @__PURE__ */ extend$1({}, BaseTransitionPropsValidators, DOMTransitionPropsValidators);
	var decorate$1 = (t) => {
		t.displayName = "Transition";
		t.props = TransitionPropsValidators;
		return t;
	};
	var Transition = /* @__PURE__ */ decorate$1((props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots));
	var callHook = (hook, args = []) => {
		if (isArray(hook)) hook.forEach((h2) => h2(...args));
		else if (hook) hook(...args);
	};
	var hasExplicitCallback = (hook) => {
		return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
	};
	function resolveTransitionProps(rawProps) {
		const baseProps = {};
		for (const key in rawProps) if (!(key in DOMTransitionPropsValidators)) baseProps[key] = rawProps[key];
		if (rawProps.css === false) return baseProps;
		const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
		const durations = normalizeDuration(duration);
		const enterDuration = durations && durations[0];
		const leaveDuration = durations && durations[1];
		const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
		const finishEnter = (el, isAppear, done, isCancelled) => {
			el._enterCancelled = isCancelled;
			removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
			removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
			done && done();
		};
		const finishLeave = (el, done) => {
			el._isLeaving = false;
			removeTransitionClass(el, leaveFromClass);
			removeTransitionClass(el, leaveToClass);
			removeTransitionClass(el, leaveActiveClass);
			done && done();
		};
		const makeEnterHook = (isAppear) => {
			return (el, done) => {
				const hook = isAppear ? onAppear : onEnter;
				const resolve = () => finishEnter(el, isAppear, done);
				callHook(hook, [el, resolve]);
				nextFrame(() => {
					removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
					addTransitionClass(el, isAppear ? appearToClass : enterToClass);
					if (!hasExplicitCallback(hook)) whenTransitionEnds(el, type, enterDuration, resolve);
				});
			};
		};
		return extend$1(baseProps, {
			onBeforeEnter(el) {
				callHook(onBeforeEnter, [el]);
				addTransitionClass(el, enterFromClass);
				addTransitionClass(el, enterActiveClass);
			},
			onBeforeAppear(el) {
				callHook(onBeforeAppear, [el]);
				addTransitionClass(el, appearFromClass);
				addTransitionClass(el, appearActiveClass);
			},
			onEnter: makeEnterHook(false),
			onAppear: makeEnterHook(true),
			onLeave(el, done) {
				el._isLeaving = true;
				const resolve = () => finishLeave(el, done);
				addTransitionClass(el, leaveFromClass);
				if (!el._enterCancelled) {
					forceReflow(el);
					addTransitionClass(el, leaveActiveClass);
				} else {
					addTransitionClass(el, leaveActiveClass);
					forceReflow(el);
				}
				nextFrame(() => {
					if (!el._isLeaving) return;
					removeTransitionClass(el, leaveFromClass);
					addTransitionClass(el, leaveToClass);
					if (!hasExplicitCallback(onLeave)) whenTransitionEnds(el, type, leaveDuration, resolve);
				});
				callHook(onLeave, [el, resolve]);
			},
			onEnterCancelled(el) {
				finishEnter(el, false, void 0, true);
				callHook(onEnterCancelled, [el]);
			},
			onAppearCancelled(el) {
				finishEnter(el, true, void 0, true);
				callHook(onAppearCancelled, [el]);
			},
			onLeaveCancelled(el) {
				finishLeave(el);
				callHook(onLeaveCancelled, [el]);
			}
		});
	}
	function normalizeDuration(duration) {
		if (duration == null) return null;
		else if (isObject$1(duration)) return [NumberOf(duration.enter), NumberOf(duration.leave)];
		else {
			const n = NumberOf(duration);
			return [n, n];
		}
	}
	function NumberOf(val) {
		const res = toNumber(val);
		assertNumber(res, "<transition> explicit duration");
		return res;
	}
	function addTransitionClass(el, cls) {
		cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
		(el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
	}
	function removeTransitionClass(el, cls) {
		cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
		const _vtc = el[vtcKey];
		if (_vtc) {
			_vtc.delete(cls);
			if (!_vtc.size) el[vtcKey] = void 0;
		}
	}
	function nextFrame(cb) {
		requestAnimationFrame(() => {
			requestAnimationFrame(cb);
		});
	}
	var endId = 0;
	function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
		const id = el._endId = ++endId;
		const resolveIfNotStale = () => {
			if (id === el._endId) resolve();
		};
		if (explicitTimeout != null) return setTimeout(resolveIfNotStale, explicitTimeout);
		const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
		if (!type) return resolve();
		const endEvent = type + "end";
		let ended = 0;
		const end = () => {
			el.removeEventListener(endEvent, onEnd);
			resolveIfNotStale();
		};
		const onEnd = (e) => {
			if (e.target === el && ++ended >= propCount) end();
		};
		setTimeout(() => {
			if (ended < propCount) end();
		}, timeout + 1);
		el.addEventListener(endEvent, onEnd);
	}
	function getTransitionInfo(el, expectedType) {
		const styles = window.getComputedStyle(el);
		const getStyleProperties = (key) => (styles[key] || "").split(", ");
		const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
		const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
		const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
		const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
		const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
		const animationTimeout = getTimeout(animationDelays, animationDurations);
		let type = null;
		let timeout = 0;
		let propCount = 0;
		if (expectedType === TRANSITION) {
			if (transitionTimeout > 0) {
				type = TRANSITION;
				timeout = transitionTimeout;
				propCount = transitionDurations.length;
			}
		} else if (expectedType === ANIMATION) {
			if (animationTimeout > 0) {
				type = ANIMATION;
				timeout = animationTimeout;
				propCount = animationDurations.length;
			}
		} else {
			timeout = Math.max(transitionTimeout, animationTimeout);
			type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
			propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
		}
		const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(getStyleProperties(`${TRANSITION}Property`).toString());
		return {
			type,
			timeout,
			propCount,
			hasTransform
		};
	}
	function getTimeout(delays, durations) {
		while (delays.length < durations.length) delays = delays.concat(delays);
		return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
	}
	function toMs(s) {
		if (s === "auto") return 0;
		return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
	}
	function forceReflow(el) {
		return (el ? el.ownerDocument : document).body.offsetHeight;
	}
	function patchClass(el, value, isSVG) {
		const transitionClasses = el[vtcKey];
		if (transitionClasses) value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
		if (value == null) el.removeAttribute("class");
		else if (isSVG) el.setAttribute("class", value);
		else el.className = value;
	}
	var vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
	var vShowHidden = /* @__PURE__ */ Symbol("_vsh");
	var vShow = {
		name: "show",
		beforeMount(el, { value }, { transition }) {
			el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
			if (transition && value) transition.beforeEnter(el);
			else setDisplay(el, value);
		},
		mounted(el, { value }, { transition }) {
			if (transition && value) transition.enter(el);
		},
		updated(el, { value, oldValue }, { transition }) {
			if (!value === !oldValue) return;
			if (transition) {
				if (value) {
					transition.beforeEnter(el);
					setDisplay(el, true);
					transition.enter(el);
				} else transition.leave(el, () => {
					setDisplay(el, false);
				});
			} else setDisplay(el, value);
		},
		beforeUnmount(el, { value }) {
			setDisplay(el, value);
		}
	};
	function setDisplay(el, value) {
		el.style.display = value ? el[vShowOriginalDisplay] : "none";
		el[vShowHidden] = !value;
	}
	var CSS_VAR_TEXT = /* @__PURE__ */ Symbol("CSS_VAR_TEXT");
	var displayRE = /(?:^|;)\s*display\s*:/;
	function patchStyle(el, prev, next) {
		const style = el.style;
		const isCssString = isString(next);
		let hasControlledDisplay = false;
		if (next && !isCssString) {
			if (prev) {
				if (!isString(prev)) {
					for (const key in prev) if (next[key] == null) setStyle(style, key, "");
				} else for (const prevStyle of prev.split(";")) {
					const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
					if (next[key] == null) setStyle(style, key, "");
				}
			}
			for (const key in next) {
				if (key === "display") hasControlledDisplay = true;
				const value = next[key];
				if (value != null) {
					if (!shouldPreserveTextareaResizeStyle(el, key, !isString(prev) && prev ? prev[key] : void 0, value)) setStyle(style, key, value);
				} else setStyle(style, key, "");
			}
		} else if (isCssString) {
			if (prev !== next) {
				const cssVarText = style[CSS_VAR_TEXT];
				if (cssVarText) next += ";" + cssVarText;
				style.cssText = next;
				hasControlledDisplay = displayRE.test(next);
			}
		} else if (prev) el.removeAttribute("style");
		if (vShowOriginalDisplay in el) {
			el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
			if (el[vShowHidden]) style.display = "none";
		}
	}
	var semicolonRE = /[^\\];\s*$/;
	var importantRE = /\s*!important$/;
	function setStyle(style, name, val) {
		if (isArray(val)) val.forEach((v) => setStyle(style, name, v));
		else {
			if (val == null) val = "";
			if (semicolonRE.test(val)) warn(`Unexpected semicolon at the end of '${name}' style value: '${val}'`);
			if (name.startsWith("--")) {
				if (importantRE.test(val)) style.setProperty(name, val.replace(importantRE, ""), "important");
				else style.setProperty(name, val);
			} else {
				const prefixed = autoPrefix(style, name);
				if (importantRE.test(val)) style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
				else style[prefixed] = val;
			}
		}
	}
	var prefixes = [
		"Webkit",
		"Moz",
		"ms"
	];
	var prefixCache = {};
	function autoPrefix(style, rawName) {
		const cached = prefixCache[rawName];
		if (cached) return cached;
		let name = camelize(rawName);
		if (name !== "filter" && name in style) return prefixCache[rawName] = name;
		name = capitalize(name);
		for (let i = 0; i < prefixes.length; i++) {
			const prefixed = prefixes[i] + name;
			if (prefixed in style) return prefixCache[rawName] = prefixed;
		}
		return rawName;
	}
	function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
		return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
	}
	var xlinkNS = "http://www.w3.org/1999/xlink";
	function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
		if (isSVG && key.startsWith("xlink:")) {
			if (value == null) el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
			else el.setAttributeNS(xlinkNS, key, value);
		} else if (value == null || isBoolean && !includeBooleanAttr(value)) el.removeAttribute(key);
		else el.setAttribute(key, isBoolean ? "" : isSymbol(value) ? String(value) : value);
	}
	function patchDOMProp(el, key, value, parentComponent, attrName) {
		if (key === "innerHTML" || key === "textContent") {
			if (value != null) el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
			return;
		}
		const tag = el.tagName;
		if (key === "value" && tag !== "PROGRESS" && !tag.includes("-")) {
			const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
			const newValue = value == null ? el.type === "checkbox" ? "on" : "" : String(value);
			if (oldValue !== newValue || !("_value" in el)) el.value = newValue;
			if (value == null) el.removeAttribute(key);
			el._value = value;
			return;
		}
		let needRemove = false;
		if (value === "" || value == null) {
			const type = typeof el[key];
			if (type === "boolean") value = includeBooleanAttr(value);
			else if (value == null && type === "string") {
				value = "";
				needRemove = true;
			} else if (type === "number") {
				value = 0;
				needRemove = true;
			}
		}
		try {
			el[key] = value;
		} catch (e) {
			if (!needRemove) warn(`Failed setting prop "${key}" on <${tag.toLowerCase()}>: value ${value} is invalid.`, e);
		}
		needRemove && el.removeAttribute(attrName || key);
	}
	function addEventListener(el, event, handler, options) {
		el.addEventListener(event, handler, options);
	}
	function removeEventListener(el, event, handler, options) {
		el.removeEventListener(event, handler, options);
	}
	var veiKey = /* @__PURE__ */ Symbol("_vei");
	function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
		const invokers = el[veiKey] || (el[veiKey] = {});
		const existingInvoker = invokers[rawName];
		if (nextValue && existingInvoker) existingInvoker.value = sanitizeEventValue(nextValue, rawName);
		else {
			const [name, options] = parseName(rawName);
			if (nextValue) addEventListener(el, name, invokers[rawName] = createInvoker(sanitizeEventValue(nextValue, rawName), instance), options);
			else if (existingInvoker) {
				removeEventListener(el, name, existingInvoker, options);
				invokers[rawName] = void 0;
			}
		}
	}
	var optionsModifierRE = /(Once|Passive|Capture)$/;
	var optionsModifierEventRE = /^on:?(?:Once|Passive|Capture)$/;
	function parseName(name) {
		let options;
		let m;
		while ((m = name.match(optionsModifierRE)) && !optionsModifierEventRE.test(name)) {
			if (!options) options = {};
			name = name.slice(0, name.length - m[1].length);
			options[m[1].toLowerCase()] = true;
		}
		return [name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2)), options];
	}
	var cachedNow = 0;
	var p = /* @__PURE__ */ Promise.resolve();
	var getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
	function createInvoker(initialValue, instance) {
		const invoker = (e) => {
			if (!e._vts) e._vts = Date.now();
			else if (e._vts <= invoker.attached) return;
			const value = invoker.value;
			if (isArray(value)) {
				const originalStop = e.stopImmediatePropagation;
				e.stopImmediatePropagation = () => {
					originalStop.call(e);
					e._stopped = true;
				};
				const handlers = value.slice();
				const args = [e];
				for (let i = 0; i < handlers.length; i++) {
					if (e._stopped) break;
					const handler = handlers[i];
					if (handler) callWithAsyncErrorHandling(handler, instance, 5, args);
				}
			} else callWithAsyncErrorHandling(value, instance, 5, [e]);
		};
		invoker.value = initialValue;
		invoker.attached = getNow();
		return invoker;
	}
	function sanitizeEventValue(value, propName) {
		if (isFunction(value) || isArray(value)) return value;
		warn(`Wrong type passed as event handler to ${propName} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof value}.`);
		return NOOP;
	}
	var isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
	var patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
		const isSVG = namespace === "svg";
		if (key === "class") patchClass(el, nextValue, isSVG);
		else if (key === "style") patchStyle(el, prevValue, nextValue);
		else if (isOn(key)) {
			if (!isModelListener(key)) patchEvent(el, key, prevValue, nextValue, parentComponent);
		} else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
			patchDOMProp(el, key, nextValue);
			if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
		} else if (el._isVueCE && (shouldSetAsPropForVueCE(el, key) || el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))) patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
		else {
			if (key === "true-value") el._trueValue = nextValue;
			else if (key === "false-value") el._falseValue = nextValue;
			patchAttr(el, key, nextValue, isSVG);
		}
	};
	function shouldSetAsProp(el, key, value, isSVG) {
		if (isSVG) {
			if (key === "innerHTML" || key === "textContent") return true;
			if (key in el && isNativeOn(key) && isFunction(value)) return true;
			return false;
		}
		if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") return false;
		if (key === "sandbox" && el.tagName === "IFRAME") return false;
		if (key === "form") return false;
		if (key === "list" && el.tagName === "INPUT") return false;
		if (key === "type" && el.tagName === "TEXTAREA") return false;
		if (key === "width" || key === "height") {
			const tag = el.tagName;
			if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") return false;
		}
		if (isNativeOn(key) && isString(value)) return false;
		return key in el;
	}
	function shouldSetAsPropForVueCE(el, key) {
		const props = el._def.props;
		if (!props) return false;
		const camelKey = camelize(key);
		return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
	}
	var positionMap = /* @__PURE__ */ new WeakMap();
	var newPositionMap = /* @__PURE__ */ new WeakMap();
	var moveCbKey = /* @__PURE__ */ Symbol("_moveCb");
	var enterCbKey = /* @__PURE__ */ Symbol("_enterCb");
	var decorate = (t) => {
		delete t.props.mode;
		return t;
	};
	var TransitionGroup = /* @__PURE__ */ decorate({
		name: "TransitionGroup",
		props: /* @__PURE__ */ extend$1({}, TransitionPropsValidators, {
			tag: String,
			moveClass: String
		}),
		setup(props, { slots }) {
			const instance = getCurrentInstance();
			const state = useTransitionState();
			let prevChildren;
			let children;
			onUpdated(() => {
				if (!prevChildren.length) return;
				const moveClass = props.moveClass || `${props.name || "v"}-move`;
				if (!hasCSSTransform(prevChildren[0].el, instance.vnode.el, moveClass)) {
					prevChildren = [];
					return;
				}
				prevChildren.forEach(callPendingCbs);
				prevChildren.forEach(recordPosition);
				const movedChildren = prevChildren.filter(applyTranslation);
				forceReflow(instance.vnode.el);
				movedChildren.forEach((c) => {
					const el = c.el;
					const style = el.style;
					addTransitionClass(el, moveClass);
					style.transform = style.webkitTransform = style.transitionDuration = "";
					const cb = el[moveCbKey] = (e) => {
						if (e && e.target !== el) return;
						if (!e || e.propertyName.endsWith("transform")) {
							el.removeEventListener("transitionend", cb);
							el[moveCbKey] = null;
							removeTransitionClass(el, moveClass);
						}
					};
					el.addEventListener("transitionend", cb);
				});
				prevChildren = [];
			});
			return () => {
				const rawProps = /* @__PURE__ */ toRaw(props);
				const cssTransitionProps = resolveTransitionProps(rawProps);
				let tag = rawProps.tag || Fragment;
				prevChildren = [];
				if (children) for (let i = 0; i < children.length; i++) {
					const child = children[i];
					if (child.el && child.el instanceof Element && !child.el[vShowHidden]) {
						prevChildren.push(child);
						setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
						positionMap.set(child, getPosition(child.el));
					}
				}
				children = slots.default ? getTransitionRawChildren(slots.default()) : [];
				for (let i = 0; i < children.length; i++) {
					const child = children[i];
					if (child.key != null) setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
					else if (child.type !== Text) warn(`<TransitionGroup> children must be keyed.`);
				}
				return createVNode(tag, null, children);
			};
		}
	});
	function callPendingCbs(c) {
		const el = c.el;
		if (el[moveCbKey]) el[moveCbKey]();
		if (el[enterCbKey]) el[enterCbKey]();
	}
	function recordPosition(c) {
		newPositionMap.set(c, getPosition(c.el));
	}
	function applyTranslation(c) {
		const oldPos = positionMap.get(c);
		const newPos = newPositionMap.get(c);
		const dx = oldPos.left - newPos.left;
		const dy = oldPos.top - newPos.top;
		if (dx || dy) {
			const el = c.el;
			const s = el.style;
			const rect = el.getBoundingClientRect();
			let scaleX = 1;
			let scaleY = 1;
			if (el.offsetWidth) scaleX = rect.width / el.offsetWidth;
			if (el.offsetHeight) scaleY = rect.height / el.offsetHeight;
			if (!Number.isFinite(scaleX) || scaleX === 0) scaleX = 1;
			if (!Number.isFinite(scaleY) || scaleY === 0) scaleY = 1;
			if (Math.abs(scaleX - 1) < .01) scaleX = 1;
			if (Math.abs(scaleY - 1) < .01) scaleY = 1;
			s.transform = s.webkitTransform = `translate(${dx / scaleX}px,${dy / scaleY}px)`;
			s.transitionDuration = "0s";
			return c;
		}
	}
	function getPosition(el) {
		const rect = el.getBoundingClientRect();
		return {
			left: rect.left,
			top: rect.top
		};
	}
	function hasCSSTransform(el, root, moveClass) {
		const clone = el.cloneNode();
		const _vtc = el[vtcKey];
		if (_vtc) _vtc.forEach((cls) => {
			cls.split(/\s+/).forEach((c) => c && clone.classList.remove(c));
		});
		moveClass.split(/\s+/).forEach((c) => c && clone.classList.add(c));
		clone.style.display = "none";
		const container = root.nodeType === 1 ? root : root.parentNode;
		container.appendChild(clone);
		const { hasTransform } = getTransitionInfo(clone);
		container.removeChild(clone);
		return hasTransform;
	}
	var systemModifiers = [
		"ctrl",
		"shift",
		"alt",
		"meta"
	];
	var modifierGuards = {
		stop: (e) => e.stopPropagation(),
		prevent: (e) => e.preventDefault(),
		self: (e) => e.target !== e.currentTarget,
		ctrl: (e) => !e.ctrlKey,
		shift: (e) => !e.shiftKey,
		alt: (e) => !e.altKey,
		meta: (e) => !e.metaKey,
		left: (e) => "button" in e && e.button !== 0,
		middle: (e) => "button" in e && e.button !== 1,
		right: (e) => "button" in e && e.button !== 2,
		exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
	};
	var withModifiers = (fn, modifiers) => {
		if (!fn) return fn;
		const cache = fn._withMods || (fn._withMods = {});
		const cacheKey = modifiers.join(".");
		return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
			for (let i = 0; i < modifiers.length; i++) {
				const guard = modifierGuards[modifiers[i]];
				if (guard && guard(event, modifiers)) return;
			}
			return fn(event, ...args);
		}));
	};
	var rendererOptions = /* @__PURE__ */ extend$1({ patchProp }, nodeOps);
	var renderer;
	function ensureRenderer() {
		return renderer || (renderer = createRenderer(rendererOptions));
	}
	var createApp = ((...args) => {
		const app = ensureRenderer().createApp(...args);
		injectNativeTagCheck(app);
		injectCompilerOptionsCheck(app);
		const { mount } = app;
		app.mount = (containerOrSelector) => {
			const container = normalizeContainer(containerOrSelector);
			if (!container) return;
			const component = app._component;
			if (!isFunction(component) && !component.render && !component.template) component.template = container.innerHTML;
			if (container.nodeType === 1) container.textContent = "";
			const proxy = mount(container, false, resolveRootNamespace(container));
			if (container instanceof Element) {
				container.removeAttribute("v-cloak");
				container.setAttribute("data-v-app", "");
			}
			return proxy;
		};
		return app;
	});
	function resolveRootNamespace(container) {
		if (container instanceof SVGElement) return "svg";
		if (typeof MathMLElement === "function" && container instanceof MathMLElement) return "mathml";
	}
	function injectNativeTagCheck(app) {
		Object.defineProperty(app.config, "isNativeTag", {
			value: (tag) => isHTMLTag(tag) || isSVGTag(tag) || isMathMLTag(tag),
			writable: false
		});
	}
	function injectCompilerOptionsCheck(app) {
		if (isRuntimeOnly()) {
			const isCustomElement = app.config.isCustomElement;
			Object.defineProperty(app.config, "isCustomElement", {
				get() {
					return isCustomElement;
				},
				set() {
					warn(`The \`isCustomElement\` config option is deprecated. Use \`compilerOptions.isCustomElement\` instead.`);
				}
			});
			const compilerOptions = app.config.compilerOptions;
			const msg = `The \`compilerOptions\` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, \`compilerOptions\` must be passed to \`@vue/compiler-dom\` in the build setup instead.
- For vue-loader: pass it via vue-loader's \`compilerOptions\` loader option.
- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader
- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc`;
			Object.defineProperty(app.config, "compilerOptions", {
				get() {
					warn(msg);
					return compilerOptions;
				},
				set() {
					warn(msg);
				}
			});
		}
	}
	function normalizeContainer(container) {
		if (isString(container)) {
			const res = document.querySelector(container);
			if (!res) warn(`Failed to mount app: mount target selector "${container}" returned null.`);
			return res;
		}
		if (window.ShadowRoot && container instanceof window.ShadowRoot && container.mode === "closed") warn(`mounting on a ShadowRoot with \`{mode: "closed"}\` may lead to unpredictable bugs`);
		return container;
	}
	//#endregion
	//#region node_modules/vue/dist/vue.runtime.esm-bundler.js
	/**
	* vue v3.5.43
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	function initDev() {
		initCustomFormatter();
	}
	initDev();
	//#endregion
	//#region node_modules/quasar/dist/quasar.client.js
	/*!
	* Quasar Framework v2.34.0
	* (c) 2015-present Razvan Stoenescu
	* Released under the MIT License.
	*/
	/**
	* Quasar runtime flags are needed only if NOT using
	* Quasar CLI or @quasar/vite-plugin or vue-cli-plugin-quasar
	*/
	var attachPoint = null;
	function getAttachPoint() {
		if (attachPoint !== null) return attachPoint;
		return attachPoint = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
	}
	if (typeof __QUASAR_SSR__ !== "boolean") getAttachPoint().__QUASAR_SSR__ = false;
	if (typeof __QUASAR_SSR_CLIENT__ !== "boolean") getAttachPoint().__QUASAR_SSR_CLIENT__ = false;
	if (typeof __QUASAR_SSR_PWA__ !== "boolean") getAttachPoint().__QUASAR_SSR_PWA__ = false;
	function injectProp(target, propName, get, set) {
		Object.defineProperty(target, propName, {
			get,
			set,
			enumerable: true
		});
		return target;
	}
	function injectMultipleProps(target, props) {
		for (const key in props) injectProp(target, key, props[key]);
		return target;
	}
	/**
	* __ QUASAR_SSR __            -> runs on SSR/SSG on client or server
	* __ QUASAR_SSR_SERVER __     -> runs on SSR/SSG on server
	* __ QUASAR_SSR_CLIENT __     -> runs on SSR/SSG on client
	* __ QUASAR_SSR_PWA __        -> built with SSR/SSG + PWA; may run on SSR/SSG on client or on PWA client
	*                              (needs runtime detection)
	*/
	var isRuntimeSsrPreHydration = /* @__PURE__ */ ref(__QUASAR_SSR_CLIENT__ && (__QUASAR_SSR_PWA__ ? "serverRendered" in document.body.dataset : true));
	var preHydrationBrowser;
	var maxUserAgentLength = 512;
	function normalizeUserAgent(userAgent) {
		return typeof userAgent === "string" ? userAgent.slice(0, maxUserAgentLength).toLowerCase() : "";
	}
	var safariVersionRE = /(?:^|\s)version\/([\w.]+)/;
	var applewebkitRE = /(?:^|\s)applewebkit\/[\w.]+/;
	var safariAgentRE = /(?:^|\s)safari\/[\w.]+/;
	function getSafariMatch(userAgent) {
		const versionMatch = safariVersionRE.exec(userAgent);
		return versionMatch !== null && applewebkitRE.test(userAgent) && safariAgentRE.test(userAgent) ? {
			browser: "safari",
			version: versionMatch[1]
		} : null;
	}
	var edgeRE = /(edg|edga|edgios)\/([\w.]+)/;
	var oprRE = /(opr)[\/]([\w.]+)/;
	var vivaldiRE = /(vivaldi)[\/]([\w.]+)/;
	var chromeRE = /(chrome|crios)[\/]([\w.]+)/;
	var firefoxRE = /(firefox|fxios)[\/]([\w.]+)/;
	var webkitRE = /(webkit)[\/]([\w.]+)/;
	function getMatch(userAgent, platformMatch) {
		let match = edgeRE.exec(userAgent) || oprRE.exec(userAgent) || vivaldiRE.exec(userAgent) || chromeRE.exec(userAgent);
		if (match === null) {
			const safariMatch = getSafariMatch(userAgent);
			if (safariMatch !== null) return {
				...safariMatch,
				platform: platformMatch[0] || ""
			};
			match = firefoxRE.exec(userAgent) || webkitRE.exec(userAgent) || [];
		}
		return {
			browser: match[5] || match[3] || match[1] || "",
			version: match[4] || match[2] || "0",
			platform: platformMatch[0] || ""
		};
	}
	var ipadRE = /(ipad)/;
	var ipodRE = /(ipod)/;
	var iphoneRE = /(iphone)/;
	var androidRE = /(android)/;
	var winRE = /(win)/;
	var macRE = /(mac)/;
	var linuxRE = /(linux)/;
	var crosRE = /(cros)/;
	function getPlatformMatch(userAgent) {
		return ipadRE.exec(userAgent) || ipodRE.exec(userAgent) || iphoneRE.exec(userAgent) || androidRE.exec(userAgent) || winRE.exec(userAgent) || macRE.exec(userAgent) || linuxRE.exec(userAgent) || crosRE.exec(userAgent) || [];
	}
	var hasTouch = "ontouchstart" in window || window.navigator.maxTouchPoints > 0;
	function getPlatform(UA) {
		const userAgent = normalizeUserAgent(UA);
		const matched = getMatch(userAgent, getPlatformMatch(userAgent));
		const browser = {
			mobile: false,
			desktop: false,
			cordova: false,
			capacitor: false,
			nativeMobile: false,
			electron: false,
			bex: false,
			linux: false,
			mac: false,
			win: false,
			cros: false,
			chrome: false,
			firefox: false,
			opera: false,
			safari: false,
			vivaldi: false,
			edge: false,
			webkit: false,
			android: false,
			ios: false,
			ipad: false,
			iphone: false,
			ipod: false
		};
		if (matched.browser) {
			browser[matched.browser] = true;
			browser.version = matched.version;
			browser.versionNumber = Number.parseInt(matched.version, 10);
		}
		if (matched.platform) browser[matched.platform] = true;
		const knownMobiles = browser.android || browser.ios || browser.ipad || browser.iphone || browser.ipod;
		if (knownMobiles === true || userAgent.includes("mobile")) browser.mobile = true;
		else browser.desktop = true;
		if (browser.edga || browser.edgios || browser.edg) {
			browser.edge = true;
			matched.browser = "edge";
		} else if (browser.crios) {
			browser.chrome = true;
			matched.browser = "chrome";
		} else if (browser.fxios) {
			browser.firefox = true;
			matched.browser = "firefox";
		}
		if (browser.ipod || browser.ipad || browser.iphone) browser.ios = true;
		if (browser.vivaldi) {
			matched.browser = "vivaldi";
			browser.vivaldi = true;
		}
		if (browser.chrome || browser.opr || browser.safari || browser.vivaldi || browser.mobile && !browser.ios && !knownMobiles) browser.webkit = true;
		if (browser.opr) {
			matched.browser = "opera";
			browser.opera = true;
		}
		browser.name = matched.browser;
		browser.platform = matched.platform;
		if (userAgent.includes("electron")) browser.electron = true;
		else if (document.location.href.includes("-extension://")) browser.bex = true;
		else {
			if (window.Capacitor !== void 0) {
				browser.capacitor = true;
				browser.nativeMobile = true;
				browser.nativeMobileWrapper = "capacitor";
			} else if (window._cordovaNative !== void 0 || window.cordova !== void 0) {
				browser.cordova = true;
				browser.nativeMobile = true;
				browser.nativeMobileWrapper = "cordova";
			}
			if (isRuntimeSsrPreHydration.value) preHydrationBrowser = { is: { ...browser } };
			if (hasTouch && browser.mac && (browser.desktop && browser.safari || browser.nativeMobile && !browser.android && !browser.ios && !browser.ipad)) {
				delete browser.mac;
				delete browser.desktop;
				const platform = Math.min(window.innerHeight, window.innerWidth) > 414 ? "ipad" : "iphone";
				Object.assign(browser, {
					mobile: true,
					ios: true,
					platform,
					[platform]: true
				});
			}
			if (!browser.mobile && window.navigator.userAgentData && window.navigator.userAgentData.mobile) {
				delete browser.desktop;
				browser.mobile = true;
			}
		}
		return browser;
	}
	var userAgent = navigator.userAgent;
	var ssrClient = {
		has: {
			touch: false,
			webStorage: false
		},
		within: { iframe: false }
	};
	var client = {
		userAgent,
		is: getPlatform(userAgent),
		has: { touch: hasTouch },
		within: { iframe: window.self !== window.top }
	};
	var Platform = { install(opts) {
		const { $q } = opts;
		if (isRuntimeSsrPreHydration.value) {
			opts.onSSRHydrated.push(() => {
				Object.assign($q.platform, client);
				isRuntimeSsrPreHydration.value = false;
			});
			$q.platform = /* @__PURE__ */ reactive(this);
		} else $q.platform = this;
	} };
	{
		let hasWebStorage;
		injectProp(client.has, "webStorage", () => {
			if (hasWebStorage !== void 0) return hasWebStorage;
			try {
				if (window.localStorage) {
					hasWebStorage = true;
					return true;
				}
			} catch {}
			hasWebStorage = false;
			return false;
		});
		Object.assign(Platform, client);
		if (isRuntimeSsrPreHydration.value) {
			Object.assign(Platform, preHydrationBrowser, ssrClient);
			preHydrationBrowser = null;
		}
	}
	function createComponent(raw) {
		return markRaw(/* @__PURE__ */ defineComponent(raw));
	}
	function createDirective(raw) {
		return markRaw(raw);
	}
	var createReactivePlugin = (state, plugin) => {
		const reactiveState = /* @__PURE__ */ reactive(state);
		for (const name in state) injectProp(plugin, name, () => reactiveState[name], (val) => {
			reactiveState[name] = val;
		});
		return plugin;
	};
	var listenOpts = {
		hasPassive: true,
		passive: { passive: true },
		notPassive: { passive: false },
		passiveCapture: {
			passive: true,
			capture: true
		},
		notPassiveCapture: {
			passive: false,
			capture: true
		}
	};
	function noop() {}
	function position(e) {
		if (e.touches && e.touches[0]) e = e.touches[0];
		else if (e.changedTouches && e.changedTouches[0]) e = e.changedTouches[0];
		else if (e.targetTouches && e.targetTouches[0]) e = e.targetTouches[0];
		return {
			top: e.clientY,
			left: e.clientX
		};
	}
	function stop(e) {
		e.stopPropagation();
	}
	function prevent(e) {
		if (e.cancelable !== false) e.preventDefault();
	}
	function stopAndPrevent(e) {
		if (e.cancelable !== false) e.preventDefault();
		e.stopPropagation();
	}
	function addEvt(ctx, targetName, events) {
		const name = `__q_${targetName}_evt`;
		ctx[name] = [...ctx[name] ?? [], ...events];
		events.forEach((evt) => {
			evt[0].addEventListener(evt[1], ctx[evt[2]], listenOpts[evt[3]]);
		});
	}
	function cleanEvt(ctx, targetName) {
		const name = `__q_${targetName}_evt`;
		if (ctx[name] !== void 0) {
			ctx[name].forEach((evt) => {
				evt[0].removeEventListener(evt[1], ctx[evt[2]], listenOpts[evt[3]]);
			});
			ctx[name] = void 0;
		}
	}
	function parseOptions(options) {
		if (Object(options) === options) {
			const trailing = options.trailing ?? true;
			return {
				leading: options.leading,
				trailing,
				maxWait: trailing && typeof options.maxWait === "number" ? options.maxWait : void 0
			};
		}
		return options ? {
			leading: true,
			trailing: false
		} : {
			leading: false,
			trailing: true
		};
	}
	function debounce(fn, wait = 250, options) {
		const { leading, trailing, maxWait } = parseOptions(options);
		let timer = null, maxTimer = null, lastThis, lastArgs = null;
		function run() {
			const context = lastThis;
			const args = lastArgs;
			lastThis = void 0;
			lastArgs = null;
			debounced.isPending = false;
			fn.apply(context, args);
		}
		function clearTimer() {
			if (timer !== null) {
				clearTimeout(timer);
				timer = null;
			}
		}
		function clearMaxTimer() {
			if (maxTimer !== null) {
				clearTimeout(maxTimer);
				maxTimer = null;
			}
		}
		function onTimeout() {
			timer = null;
			clearMaxTimer();
			if (lastArgs !== null) run();
		}
		function onMaxTimeout() {
			maxTimer = null;
			clearTimer();
			if (lastArgs !== null) run();
		}
		function debounced(...args) {
			const isFirstCall = timer === null;
			clearTimer();
			timer = setTimeout(onTimeout, wait);
			if (isFirstCall) {
				if (maxWait !== void 0) maxTimer = setTimeout(onMaxTimeout, maxWait);
				if (leading) {
					fn.apply(this, args);
					return;
				}
			}
			if (trailing) {
				lastThis = this;
				lastArgs = args;
				debounced.isPending = true;
			}
		}
		debounced.isPending = false;
		debounced.cancel = () => {
			clearTimer();
			clearMaxTimer();
			lastThis = void 0;
			lastArgs = null;
			debounced.isPending = false;
		};
		debounced.flush = () => {
			if (lastArgs !== null) {
				clearTimer();
				clearMaxTimer();
				run();
			}
		};
		return debounced;
	}
	var SIZE_LIST = [
		"sm",
		"md",
		"lg",
		"xl"
	];
	var { passive: passive$7 } = listenOpts;
	var Screen_default = /*#__PURE__*/ createReactivePlugin({
		width: 0,
		height: 0,
		name: "xs",
		sizes: {
			sm: 600,
			md: 1024,
			lg: 1440,
			xl: 1920
		},
		lt: {
			sm: true,
			md: true,
			lg: true,
			xl: true
		},
		gt: {
			xs: false,
			sm: false,
			md: false,
			lg: false
		},
		xs: true,
		sm: false,
		md: false,
		lg: false,
		xl: false,
		orientation: {
			type: "portrait-primary",
			angle: 0,
			portrait: true,
			landscape: false
		}
	}, {
		setSizes: noop,
		setDebounce: noop,
		install({ $q, onSSRHydrated }) {
			$q.screen = this;
			if (this.__installed) {
				if ($q.config.screen !== void 0) {
					if (!$q.config.screen.bodyClasses) document.body.classList.remove(`screen--${this.name}`);
					else this.__update(true);
				}
				return;
			}
			const { visualViewport } = window;
			const target = visualViewport || window;
			const scrollingElement = document.scrollingElement || document.documentElement;
			const getSize = visualViewport === void 0 || client.is.mobile ? () => [Math.max(window.innerWidth, scrollingElement.clientWidth), Math.max(window.innerHeight, scrollingElement.clientHeight)] : () => [visualViewport.width * visualViewport.scale + window.innerWidth - scrollingElement.clientWidth, visualViewport.height * visualViewport.scale + window.innerHeight - scrollingElement.clientHeight];
			const useBodyClasses = $q.config.screen?.bodyClasses === true;
			this.__update = (force) => {
				const [w, h] = getSize();
				if (h !== this.height) this.height = h;
				if (w !== this.width) this.width = w;
				else if (force !== true) return;
				let s = this.sizes;
				this.gt.xs = w >= s.sm;
				this.gt.sm = w >= s.md;
				this.gt.md = w >= s.lg;
				this.gt.lg = w >= s.xl;
				this.lt.sm = w < s.sm;
				this.lt.md = w < s.md;
				this.lt.lg = w < s.lg;
				this.lt.xl = w < s.xl;
				this.xs = this.lt.sm;
				this.sm = this.gt.xs && this.lt.md;
				this.md = this.gt.sm && this.lt.lg;
				this.lg = this.gt.md && this.lt.xl;
				this.xl = this.gt.lg;
				s = this.xs && "xs" || this.sm && "sm" || this.md && "md" || this.lg && "lg" || "xl";
				if (s !== this.name) {
					if (useBodyClasses) {
						document.body.classList.remove(`screen--${this.name}`);
						document.body.classList.add(`screen--${s}`);
					}
					this.name = s;
				}
			};
			let updateEvt, updateSizes = {}, updateDebounce = 16;
			this.setSizes = (sizes) => {
				SIZE_LIST.forEach((name) => {
					if (sizes[name] !== void 0) updateSizes[name] = sizes[name];
				});
			};
			this.setDebounce = (deb) => {
				updateDebounce = deb;
			};
			const start = () => {
				const style = getComputedStyle(document.body);
				if (style.getPropertyValue("--q-size-sm")) SIZE_LIST.forEach((name) => {
					this.sizes[name] = Number.parseInt(style.getPropertyValue(`--q-size-${name}`), 10);
				});
				this.setSizes = (sizes) => {
					SIZE_LIST.forEach((name) => {
						if (sizes[name]) this.sizes[name] = sizes[name];
					});
					this.__update(true);
				};
				this.setDebounce = (delay) => {
					if (updateEvt !== void 0) {
						updateEvt.flush?.();
						target.removeEventListener("resize", updateEvt, passive$7);
					}
					updateEvt = delay > 0 ? debounce(this.__update, delay) : this.__update;
					target.addEventListener("resize", updateEvt, passive$7);
				};
				this.setDebounce(updateDebounce);
				if (Object.keys(updateSizes).length !== 0) {
					this.setSizes(updateSizes);
					updateSizes = void 0;
				} else this.__update();
				if (useBodyClasses && this.name === "xs") document.body.classList.add("screen--xs");
				const { orientation } = window.screen;
				const updateOrientation = () => {
					const { type, angle } = orientation;
					const portrait = type.startsWith("portrait");
					Object.assign(this.orientation, {
						type,
						angle,
						portrait,
						landscape: !portrait
					});
				};
				updateOrientation();
				orientation.addEventListener("change", updateOrientation, passive$7);
			};
			if (isRuntimeSsrPreHydration.value) onSSRHydrated.push(start);
			else start();
		}
	});
	var ssrAutoAttr = "data-dark-auto";
	var Plugin$5 = /*#__PURE__*/ createReactivePlugin({
		isActive: false,
		mode: false
	}, {
		__media: void 0,
		set(val) {
			Plugin$5.mode = val;
			if (val === "auto") {
				if (Plugin$5.__media === void 0) {
					Plugin$5.__media = window.matchMedia("(prefers-color-scheme: dark)");
					Plugin$5.__updateMedia = () => {
						Plugin$5.set("auto");
					};
					Plugin$5.__media.addListener(Plugin$5.__updateMedia);
				}
				val = Plugin$5.__media.matches;
			} else if (Plugin$5.__media !== void 0) {
				Plugin$5.__media.removeListener(Plugin$5.__updateMedia);
				Plugin$5.__media = void 0;
			}
			Plugin$5.isActive = val === true;
			document.body.classList.remove(`body--${val === true ? "light" : "dark"}`);
			document.body.classList.add(`body--${val === true ? "dark" : "light"}`);
		},
		toggle() {
			Plugin$5.set(!Plugin$5.isActive);
		},
		install({ $q, ssrContext, onSSRHydrated }) {
			$q.dark = this;
			if (this.__installed) return;
			if (isRuntimeSsrPreHydration.value) {
				if (document.body.hasAttribute(ssrAutoAttr)) {
					this.mode = "auto";
					onSSRHydrated.push(() => {
						document.body.removeAttribute(ssrAutoAttr);
						if (this.mode === "auto") this.set("auto");
					});
					return;
				}
				this.set(document.body.classList.contains("body--dark"));
				return;
			}
			this.set($q.config.dark ?? false);
		}
	});
	function setCssVar(propName, value, element = document.body) {
		if (typeof propName !== "string") throw new TypeError("Expected a string as propName");
		if (typeof value !== "string") throw new TypeError("Expected a string as value");
		if (!(element instanceof Element)) throw new TypeError("Expected a DOM element");
		element.style.setProperty(`--q-${propName}`, value);
	}
	var lastKeyCompositionStatus = false;
	function onKeyDownComposition(evt) {
		lastKeyCompositionStatus = evt.isComposing === true;
	}
	function shouldIgnoreKey(evt) {
		return lastKeyCompositionStatus || evt !== Object(evt) || evt.isComposing || evt.qKeyEvent;
	}
	function isKeyCode(evt, keyCodes) {
		return !shouldIgnoreKey(evt) && (Array.isArray(keyCodes) ? keyCodes.includes(evt.keyCode) : keyCodes === evt.keyCode);
	}
	function getMobilePlatform(is) {
		if (is.ios) return "ios";
		if (is.android) return "android";
	}
	function getBodyClasses({ is, has, within }, cfg) {
		const cls = [is.desktop ? "desktop" : "mobile", `${has.touch ? "" : "no-"}touch`];
		if (is.mobile) {
			const mobile = getMobilePlatform(is);
			if (mobile !== void 0) cls.push("platform-" + mobile);
		}
		if (is.nativeMobile) {
			const type = is.nativeMobileWrapper;
			const mobileCfg = cfg[type];
			cls.push(type, "native-mobile");
			if (is.ios && (mobileCfg === void 0 || mobileCfg.iosStatusBarPadding)) cls.push("q-ios-padding");
			else if (is.android && (mobileCfg === void 0 || mobileCfg.androidStatusBarPadding !== false)) cls.push("q-safe-area-padding");
		} else if (is.electron) cls.push("electron");
		else if (is.bex) cls.push("bex");
		if (within.iframe) cls.push("within-iframe");
		return cls;
	}
	function applyClientSsrCorrections() {
		const { is } = client;
		const classes = document.body.className;
		const classList = new Set(classes.replaceAll(/ {2}/g, " ").split(" "));
		if (!is.nativeMobile && !is.electron && !is.bex) {
			if (is.desktop) {
				classList.delete("mobile");
				classList.delete("platform-ios");
				classList.delete("platform-android");
				classList.add("desktop");
			} else if (is.mobile) {
				classList.delete("desktop");
				classList.add("mobile");
				classList.delete("platform-ios");
				classList.delete("platform-android");
				const mobile = getMobilePlatform(is);
				if (mobile !== void 0) classList.add(`platform-${mobile}`);
			}
		}
		if (client.has.touch) {
			classList.delete("no-touch");
			classList.add("touch");
		}
		if (client.within.iframe) classList.add("within-iframe");
		const newCls = [...classList].join(" ");
		if (classes !== newCls) document.body.className = newCls;
	}
	function setColors(brand) {
		for (const color in brand) setCssVar(color, brand[color]);
	}
	var Body_default = { install(opts) {
		if (this.__installed) return;
		if (isRuntimeSsrPreHydration.value) applyClientSsrCorrections();
		else {
			const { $q } = opts;
			if ($q.config.brand !== void 0) setColors($q.config.brand);
			document.body.classList.add(...getBodyClasses(client, $q.config));
		}
		if (client.is.ios) document.body.addEventListener("touchstart", noop);
		window.addEventListener("keydown", onKeyDownComposition, true);
	} };
	var getTrue = () => true;
	function filterInvalidPath(path) {
		return typeof path === "string" && path !== "" && path !== "/" && path !== "#/";
	}
	function normalizeExitPath(path) {
		if (path.startsWith("#")) path = path.slice(1);
		if (!path.startsWith("/")) path = "/" + path;
		if (path.endsWith("/")) path = path.slice(0, -1);
		return "#" + path;
	}
	function getShouldExitFn(cfg) {
		if (cfg.backButtonExit === false) return () => false;
		if (cfg.backButtonExit === "*") return getTrue;
		const exitPaths = ["#/"];
		if (Array.isArray(cfg.backButtonExit)) exitPaths.push(...cfg.backButtonExit.filter(filterInvalidPath).map(normalizeExitPath));
		return () => exitPaths.includes(window.location.hash);
	}
	var History_default = {
		__history: [],
		add: noop,
		remove: noop,
		install({ $q }) {
			if (this.__installed) return;
			const { cordova, capacitor } = client.is;
			if (!cordova && !capacitor) return;
			const qConf = $q.config[cordova ? "cordova" : "capacitor"];
			if (qConf?.backButton === false) return;
			if (capacitor && (window.Capacitor === void 0 || window.Capacitor.Plugins.App === void 0)) return;
			this.add = (entry) => {
				if (entry.condition === void 0) entry.condition = getTrue;
				this.__history.push(entry);
			};
			this.remove = (entry) => {
				const index = this.__history.indexOf(entry);
				if (index !== -1) this.__history.splice(index, 1);
			};
			const shouldExit = getShouldExitFn({
				backButtonExit: true,
				...qConf
			});
			const backHandler = () => {
				if (this.__history.length !== 0) {
					const entry = this.__history.at(-1);
					if (entry.condition()) {
						this.__history.pop();
						entry.handler();
					}
				} else if (shouldExit()) navigator.app.exitApp();
				else window.history.back();
			};
			if (cordova) document.addEventListener("deviceready", () => {
				document.addEventListener("backbutton", backHandler, false);
			});
			else window.Capacitor.Plugins.App.addListener("backButton", backHandler);
		}
	};
	var en_US_default = {
		isoName: "en-US",
		nativeName: "English (US)",
		label: {
			clear: "Clear",
			ok: "OK",
			cancel: "Cancel",
			close: "Close",
			set: "Set",
			select: "Select",
			reset: "Reset",
			remove: "Remove",
			update: "Update",
			create: "Create",
			search: "Search",
			filter: "Filter",
			refresh: "Refresh",
			minimum: "Minimum",
			maximum: "Maximum",
			range: "Range",
			noValue: "No value",
			resize: "Resize",
			expand: (label) => label ? `Expand "${label}"` : "Expand",
			collapse: (label) => label ? `Collapse "${label}"` : "Collapse"
		},
		date: {
			days: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
			daysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
			months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
			monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
			firstDayOfWeek: 0,
			format24h: false,
			pluralDay: "days",
			prevMonth: "Previous month",
			nextMonth: "Next month",
			prevYear: "Previous year",
			nextYear: "Next year",
			today: "Today",
			prevRangeYears: (range) => `Previous ${range} years`,
			nextRangeYears: (range) => `Next ${range} years`,
			hour: "Hour",
			minute: "Minute",
			second: "Second",
			now: "Current time"
		},
		table: {
			noData: "No data available",
			noResults: "No matching records found",
			loading: "Loading...",
			selectedRecords: (rows) => rows === 1 ? "1 record selected." : (rows === 0 ? "No" : rows) + " records selected.",
			recordsPerPage: "Records per page:",
			allRows: "All",
			pagination: (start, end, total) => start + "–" + end + " of " + total,
			columns: "Columns",
			selectAllRows: "Select all rows",
			selectRow: "Select row"
		},
		pagination: {
			label: "Pagination",
			first: "First page",
			prev: "Previous page",
			next: "Next page",
			last: "Last page"
		},
		carousel: {
			prevSlide: "Previous slide",
			nextSlide: "Next slide"
		},
		colorPicker: {
			spectrum: "Spectrum",
			tune: "Tune",
			palette: "Palette",
			value: "Color value",
			hue: "Hue",
			alpha: "Opacity",
			saturation: "Saturation",
			brightness: "Brightness"
		},
		uploader: {
			addFiles: "Pick files",
			upload: "Upload files",
			abort: "Abort upload",
			removeQueued: "Remove queued files",
			removeUploaded: "Remove uploaded files",
			removeFile: "Remove file"
		},
		editor: {
			toolbar: "Editor toolbar",
			url: "URL",
			bold: "Bold",
			italic: "Italic",
			strikethrough: "Strikethrough",
			underline: "Underline",
			unorderedList: "Unordered List",
			orderedList: "Ordered List",
			subscript: "Subscript",
			superscript: "Superscript",
			hyperlink: "Hyperlink",
			toggleFullscreen: "Toggle Fullscreen",
			quote: "Quote",
			left: "Left align",
			center: "Center align",
			right: "Right align",
			justify: "Justify align",
			print: "Print",
			outdent: "Decrease indentation",
			indent: "Increase indentation",
			removeFormat: "Remove formatting",
			formatting: "Formatting",
			fontSize: "Font Size",
			align: "Align",
			hr: "Insert Horizontal Rule",
			undo: "Undo",
			redo: "Redo",
			heading1: "Heading 1",
			heading2: "Heading 2",
			heading3: "Heading 3",
			heading4: "Heading 4",
			heading5: "Heading 5",
			heading6: "Heading 6",
			paragraph: "Paragraph",
			code: "Code",
			size1: "Very small",
			size2: "A bit small",
			size3: "Normal",
			size4: "Medium-large",
			size5: "Big",
			size6: "Very big",
			size7: "Maximum",
			defaultFont: "Default Font",
			viewSource: "View Source"
		},
		tree: {
			noNodes: "No nodes available",
			noResults: "No matching nodes found"
		}
	};
	function splitTag(tag) {
		return tag.split(/[-_]/).map((v, i) => i === 0 ? v.toLowerCase() : i > 1 || v.length < 4 ? v.toUpperCase() : v[0].toUpperCase() + v.slice(1).toLowerCase());
	}
	function getLocale() {
		const val = Array.isArray(navigator.languages) && navigator.languages.length !== 0 ? navigator.languages[0] : navigator.language;
		if (typeof val === "string") return splitTag(val).join("-");
	}
	function getLikelySubtags(tag) {
		try {
			const { language, script, region } = new Intl.Locale(tag).maximize();
			return {
				language,
				script,
				region
			};
		} catch {}
	}
	function getClosestIsoName(locale, isoNames) {
		if (typeof locale !== "string" || !Array.isArray(isoNames)) return;
		const byKey = /* @__PURE__ */ new Map();
		for (const tag of isoNames) {
			if (typeof tag !== "string") continue;
			const key = tag.toLowerCase().replaceAll("_", "-");
			if (!byKey.has(key)) byKey.set(key, tag);
		}
		if (byKey.size === 0) return;
		const subtags = splitTag(locale);
		const chain = [];
		for (let i = subtags.length; i > 1; i--) chain.push(subtags.slice(0, i).join("-"));
		if (subtags.length > 2 && subtags[1].length === 4) {
			const noScript = [subtags[0], ...subtags.slice(2)];
			for (let i = noScript.length; i > 1; i--) chain.push(noScript.slice(0, i).join("-"));
		}
		chain.push(subtags[0]);
		for (const tag of chain) {
			const hit = byKey.get(tag.toLowerCase());
			if (hit !== void 0) return hit;
		}
		const target = getLikelySubtags(subtags.join("-"));
		if (target === void 0) return;
		const defaultRegion = getLikelySubtags(target.language).region;
		let best;
		for (const [key, tag] of byKey) {
			const likely = getLikelySubtags(key);
			if (likely === void 0 || likely.language !== target.language) continue;
			const score = (likely.script === target.script ? 4 : 0) + (likely.region === target.region ? 2 : 0) + (likely.region === defaultRegion ? 1 : 0);
			const depth = key.split("-").length;
			if (best === void 0 || score > best.score || score === best.score && depth < best.depth) best = {
				tag,
				score,
				depth
			};
		}
		return best?.tag;
	}
	var Plugin$7 = /*#__PURE__*/ createReactivePlugin({ __qLang: {} }, {
		getLocale,
		getClosestIsoName,
		set(langObject = en_US_default, ssrContext) {
			const lang = {
				...langObject,
				rtl: langObject.rtl === true,
				getLocale,
				getClosestIsoName
			};
			lang.set = Plugin$7.set;
			if (Plugin$7.__langConfig === void 0 || !Plugin$7.__langConfig.noHtmlAttrs) {
				const el = document.documentElement;
				el.setAttribute("dir", lang.rtl ? "rtl" : "ltr");
				el.setAttribute("lang", lang.isoName);
			}
			for (const key of Object.keys(Plugin$7.__qLang)) if (!(key in lang)) delete Plugin$7.__qLang[key];
			Object.assign(Plugin$7.__qLang, lang);
		},
		install({ $q, lang, ssrContext }) {
			$q.lang = Plugin$7.__qLang;
			Plugin$7.__langConfig = $q.config.lang;
			if (this.__installed) {
				if (lang !== void 0) this.set(lang);
			} else {
				this.props = new Proxy(this.__qLang, {
					get: Reflect.get,
					ownKeys(target) {
						return Reflect.ownKeys(target).filter((key) => key !== "set" && key !== "getLocale" && key !== "getClosestIsoName");
					}
				});
				this.set(lang || en_US_default);
			}
		}
	});
	var material_icons_default = {
		name: "material-icons",
		type: {
			positive: "check_circle",
			negative: "warning",
			info: "info",
			warning: "priority_high"
		},
		arrow: {
			up: "arrow_upward",
			right: "arrow_forward",
			down: "arrow_downward",
			left: "arrow_back",
			dropdown: "arrow_drop_down"
		},
		chevron: {
			left: "chevron_left",
			right: "chevron_right"
		},
		colorPicker: {
			spectrum: "gradient",
			tune: "tune",
			palette: "style"
		},
		pullToRefresh: { icon: "refresh" },
		carousel: {
			left: "chevron_left",
			right: "chevron_right",
			up: "keyboard_arrow_up",
			down: "keyboard_arrow_down",
			navigationIcon: "lens"
		},
		chip: {
			remove: "cancel",
			selected: "check"
		},
		datetime: {
			arrowLeft: "chevron_left",
			arrowRight: "chevron_right",
			now: "access_time",
			today: "today"
		},
		editor: {
			bold: "format_bold",
			italic: "format_italic",
			strikethrough: "strikethrough_s",
			underline: "format_underlined",
			unorderedList: "format_list_bulleted",
			orderedList: "format_list_numbered",
			subscript: "vertical_align_bottom",
			superscript: "vertical_align_top",
			hyperlink: "link",
			toggleFullscreen: "fullscreen",
			quote: "format_quote",
			left: "format_align_left",
			center: "format_align_center",
			right: "format_align_right",
			justify: "format_align_justify",
			print: "print",
			outdent: "format_indent_decrease",
			indent: "format_indent_increase",
			removeFormat: "format_clear",
			formatting: "text_format",
			fontSize: "format_size",
			align: "format_align_left",
			hr: "remove",
			undo: "undo",
			redo: "redo",
			heading: "format_size",
			code: "code",
			size: "format_size",
			font: "font_download",
			viewSource: "code"
		},
		expansionItem: {
			icon: "keyboard_arrow_down",
			denseIcon: "arrow_drop_down"
		},
		fab: {
			icon: "add",
			activeIcon: "close"
		},
		field: {
			clear: "cancel",
			error: "error"
		},
		pagination: {
			first: "first_page",
			prev: "keyboard_arrow_left",
			next: "keyboard_arrow_right",
			last: "last_page"
		},
		rating: { icon: "grade" },
		stepper: {
			done: "check",
			active: "edit",
			error: "warning"
		},
		tabs: {
			left: "chevron_left",
			right: "chevron_right",
			up: "keyboard_arrow_up",
			down: "keyboard_arrow_down"
		},
		table: {
			arrowUp: "arrow_upward",
			warning: "warning",
			firstPage: "first_page",
			prevPage: "chevron_left",
			nextPage: "chevron_right",
			lastPage: "last_page"
		},
		tree: { icon: "play_arrow" },
		uploader: {
			done: "done",
			clear: "clear",
			add: "add_box",
			upload: "cloud_upload",
			removeQueue: "clear_all",
			removeUploaded: "done_all"
		}
	};
	var Plugin$6 = /*#__PURE__*/ createReactivePlugin({
		iconMapFn: null,
		__qIconSet: {}
	}, {
		set(setObject, ssrContext) {
			const def = { ...setObject };
			def.set = Plugin$6.set;
			Object.assign(Plugin$6.__qIconSet, def);
		},
		install({ $q, iconSet, ssrContext }) {
			if ($q.config.iconMapFn !== void 0) this.iconMapFn = $q.config.iconMapFn;
			$q.iconSet = this.__qIconSet;
			injectProp($q, "iconMapFn", () => this.iconMapFn, (val) => {
				this.iconMapFn = val;
			});
			if (this.__installed) {
				if (iconSet !== void 0) this.set(iconSet);
			} else {
				this.props = new Proxy(this.__qIconSet, {
					get: Reflect.get,
					ownKeys(target) {
						return Reflect.ownKeys(target).filter((key) => key !== "set");
					}
				});
				this.set(iconSet || material_icons_default);
			}
		}
	});
	var listKey = "_q_li_";
	var formKey = "_q_fo_";
	function toByteView(v) {
		return v.constructor === ArrayBuffer ? new Uint8Array(v) : new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
	}
	function hasCustomConversion(aFn, bFn, nativeFn) {
		return typeof aFn === "function" && aFn !== nativeFn && typeof bFn === "function" && bFn !== nativeFn;
	}
	function isDeepEqual(a, b) {
		if (a === b) return true;
		if (a !== null && b !== null && typeof a === "object" && typeof b === "object") {
			if (a.constructor !== b.constructor) return false;
			let length, i;
			if (a.constructor === Array) {
				length = a.length;
				if (length !== b.length) return false;
				for (i = length; i-- !== 0;) if (!isDeepEqual(a[i], b[i])) return false;
				return true;
			}
			if (a.constructor === Map) {
				if (a.size !== b.size) return false;
				let iter = a.entries();
				i = iter.next();
				while (!i.done) {
					if (!b.has(i.value[0])) return false;
					i = iter.next();
				}
				iter = a.entries();
				i = iter.next();
				while (!i.done) {
					if (!isDeepEqual(i.value[1], b.get(i.value[0]))) return false;
					i = iter.next();
				}
				return true;
			}
			if (a.constructor === Set) {
				if (a.size !== b.size) return false;
				const iter = a.entries();
				i = iter.next();
				while (!i.done) {
					if (!b.has(i.value[0])) return false;
					i = iter.next();
				}
				return true;
			}
			if (a.constructor === ArrayBuffer || a.constructor === DataView) {
				if (a.byteLength !== b.byteLength) return false;
				a = toByteView(a);
				b = toByteView(b);
			}
			if (ArrayBuffer.isView(a)) {
				length = a.length;
				if (length !== b.length) return false;
				for (i = length; i-- !== 0;) if (a[i] !== b[i]) return false;
				return true;
			}
			if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
			if (hasCustomConversion(a.valueOf, b.valueOf, Object.prototype.valueOf)) return a.valueOf() === b.valueOf();
			if (hasCustomConversion(a.toString, b.toString, Object.prototype.toString)) return a.toString() === b.toString();
			const keys = Object.keys(a).filter((key) => a[key] !== void 0);
			length = keys.length;
			if (length !== Object.keys(b).filter((key) => b[key] !== void 0).length) return false;
			for (i = length; i-- !== 0;) {
				const key = keys[i];
				if (!isDeepEqual(a[key], b[key])) return false;
			}
			return true;
		}
		return a !== a && b !== b;
	}
	function isObject(v) {
		return v !== null && typeof v === "object" && !Array.isArray(v);
	}
	function isDate(v) {
		return Object.prototype.toString.call(v) === "[object Date]";
	}
	function isRegexp(v) {
		return Object.prototype.toString.call(v) === "[object RegExp]";
	}
	function isNumber(v) {
		return typeof v === "number" && Number.isFinite(v);
	}
	var globalConfig = {};
	var globalConfigIsFrozen = false;
	function freezeGlobalConfig() {
		globalConfigIsFrozen = true;
	}
	/**
	* If the list below changes, make sure
	* to also edit /ui/test/specs/generators/generator.plugin.js
	* on the "autoInstalledPlugins" array
	*/
	var autoInstalledPlugins = [
		Platform,
		Body_default,
		Plugin$5,
		Screen_default,
		History_default,
		Plugin$7,
		Plugin$6
	];
	function createChildApp(appCfg, parentApp) {
		const app = createApp(appCfg);
		app.config.globalProperties = parentApp.config.globalProperties;
		const { reload, ...appContext } = parentApp._context;
		Object.assign(app._context, appContext);
		return app;
	}
	function installPlugins(pluginOpts, pluginList) {
		pluginList.forEach((Plugin) => {
			Plugin.install(pluginOpts);
			Plugin.__installed = true;
		});
	}
	function prepareApp(app, uiOpts, pluginOpts) {
		app.config.globalProperties.$q = pluginOpts.$q;
		app.provide("_q_", pluginOpts.$q);
		installPlugins(pluginOpts, autoInstalledPlugins);
		if (uiOpts.components !== void 0) Object.values(uiOpts.components).forEach((c) => {
			if (isObject(c) && c.name !== void 0) app.component(c.name, c);
		});
		if (uiOpts.directives !== void 0) Object.values(uiOpts.directives).forEach((d) => {
			if (isObject(d) && d.name !== void 0) app.directive(d.name, d);
		});
		if (uiOpts.plugins !== void 0) installPlugins(pluginOpts, Object.values(uiOpts.plugins).filter((p) => typeof p.install === "function" && !autoInstalledPlugins.includes(p)));
		if (isRuntimeSsrPreHydration.value) pluginOpts.$q.onSSRHydrated = () => {
			pluginOpts.onSSRHydrated.forEach((fn) => {
				fn();
			});
			pluginOpts.$q.onSSRHydrated = () => {};
		};
	}
	var install_quasar_default = function installQuasar(parentApp, opts = {}) {
		const $q = { version: "2.34.0" };
		if (!globalConfigIsFrozen) {
			if (opts.config !== void 0) Object.assign(globalConfig, opts.config);
			$q.config = { ...globalConfig };
			freezeGlobalConfig();
		} else $q.config = opts.config || {};
		prepareApp(parentApp, opts, {
			parentApp,
			$q,
			lang: opts.lang,
			iconSet: opts.iconSet,
			onSSRHydrated: []
		});
	};
	/**
	* Returns the $q instance.
	* Equivalent to `this.$q` inside templates.
	*/
	function useQuasar() {
		return getCurrentInstance()?.appContext.config.globalProperties.$q ?? inject("_q_");
	}
	function normalizeToInterval(v, min, max) {
		if (max <= min) return min;
		const size = max - min + 1;
		let index = min + (v - min) % size;
		if (index < min) index = size + index;
		return index === 0 ? 0 : index;
	}
	function pad(v, length = 2, char = "0") {
		if (v === void 0 || v === null) return v;
		return String(v).padStart(length, char);
	}
	XMLHttpRequest.prototype.open;
	var useSizeDefaults = {
		xs: 18,
		sm: 24,
		md: 32,
		lg: 38,
		xl: 46
	};
	var useSizeProps = { size: String };
	/**
	* Creates a per-render callable size -> style resolver. The returned
	* objects are shared and reference-stable, so an unchanged size skips
	* style patching entirely -- do not mutate them.
	*/
	function createSizeStyle(sizes) {
		const cache = /* @__PURE__ */ new Map();
		return (size) => {
			if (size === void 0) return null;
			let style = cache.get(size);
			if (style === void 0) {
				if (cache.size > 500) cache.clear();
				style = { fontSize: size in sizes ? `${sizes[size]}px` : size };
				cache.set(size, style);
			}
			return style;
		};
	}
	var getSizeStyle$3 = /*#__PURE__*/ createSizeStyle(useSizeDefaults);
	function hSlot(slot, otherwise) {
		return slot !== void 0 ? slot() || otherwise : otherwise;
	}
	function hUniqueSlot(slot, otherwise) {
		if (slot !== void 0) {
			const vnode = slot();
			if (vnode !== void 0 && vnode !== null) return [...vnode];
		}
		return otherwise;
	}
	/**
	* Source definitely exists,
	* so it's merged with the possible slot
	*/
	function hMergeSlot(slot, source) {
		return slot !== void 0 ? source.concat(slot()) : source;
	}
	/**
	* Merge with possible slot,
	* even if source might not exist
	*/
	function hMergeSlotSafely(slot, source) {
		if (slot === void 0) return source;
		return source !== void 0 ? source.concat(slot()) : slot();
	}
	var defaultViewBox = "0 0 24 24";
	var libMap = {
		"mdi-": "mdi ",
		"icon-": "",
		"fa-": "",
		"bt-": "bt ",
		"eva-": "eva ",
		"iconfont ": "",
		"ti-": "themify-icon ",
		"bi-": "bootstrap-icons ",
		"i-": ""
	};
	var libPrefixes = Object.keys(libMap);
	var matMap = {
		o_: "-outlined",
		r_: "-round",
		s_: "-sharp"
	};
	var symMap = {
		sym_o_: "-outlined",
		sym_r_: "-rounded",
		sym_s_: "-sharp"
	};
	function isFaLegacy(s) {
		const c0 = s.codePointAt(0);
		if (c0 !== 102 && c0 !== 108 || s.codePointAt(1) !== 97) return false;
		const c2 = s.codePointAt(2);
		return c2 === 32 ? true : s.codePointAt(3) === 32 && (c2 === 115 || c2 === 114 || c2 === 108 || c2 === 98 || c2 === 100 || c2 === 107);
	}
	function isSpace(c) {
		return c === 32 || c >= 9 && c <= 13 || c === 160 || c === 5760 || c >= 8192 && c <= 8202 || c === 8232 || c === 8233 || c === 8239 || c === 8287 || c === 12288 || c === 65279;
	}
	function isSvgPath(s) {
		const c0 = s.codePointAt(0);
		if (c0 !== 77 && c0 !== 109) return false;
		let i = 1;
		let c = s.codePointAt(i);
		if (isSpace(c)) c = s.codePointAt(++i);
		if (c === 43 || c === 45) c = s.codePointAt(++i);
		if (c === 46) c = s.codePointAt(++i);
		return c >= 48 && c <= 57;
	}
	var noneType = { cls: "" };
	var ligatureSpanProps = { "aria-hidden": "true" };
	function parseIcon(icon, isIos) {
		if (icon.startsWith("img:")) return {
			cls: "",
			img: true,
			src: icon.slice(4)
		};
		if (icon.startsWith("svguse:")) {
			const [def, viewBox] = icon.split("|");
			return {
				cls: "",
				svguse: true,
				src: def.slice(7),
				viewBox: viewBox || defaultViewBox
			};
		}
		if (icon.startsWith("ion-")) return { cls: " ionicons " + (icon.startsWith("ion-md") || icon.startsWith("ion-ios") || icon.startsWith("ion-logo") ? icon : `ion-${isIos ? "ios" : "md"}${icon.slice(3)}`) };
		if (icon.startsWith("sym_")) {
			const symType = symMap[icon.slice(0, 6)];
			if (symType !== void 0) return {
				cls: " notranslate material-symbols" + symType,
				content: icon.slice(6),
				ligature: true
			};
		}
		for (const prefix of libPrefixes) if (icon.startsWith(prefix)) return { cls: ` ${libMap[prefix]}${icon}` };
		if (isFaLegacy(icon)) return { cls: " " + icon };
		if (isSvgPath(icon)) {
			const [def, viewBox] = icon.split("|");
			return {
				cls: "",
				svg: true,
				viewBox: viewBox || defaultViewBox,
				nodes: def.split("&&").map((path) => {
					const [d, style, transform] = path.split("@@");
					return {
						d,
						style,
						transform
					};
				})
			};
		}
		const cls = " notranslate material-icons";
		const matType = matMap[icon.slice(0, 2)];
		return matType !== void 0 ? {
			cls: cls + matType,
			content: icon.slice(2),
			ligature: true
		} : {
			cls,
			content: icon,
			ligature: true
		};
	}
	var typeCacheMd = /* @__PURE__ */ new Map();
	var typeCacheIos = /* @__PURE__ */ new Map();
	function getType(icon, isIos) {
		const cache = isIos ? typeCacheIos : typeCacheMd;
		let type = cache.get(icon);
		if (type === void 0) {
			if (cache.size > 1e3) cache.clear();
			type = parseIcon(icon, isIos);
			cache.set(icon, type);
		}
		return type;
	}
	var mapFnCache = /* @__PURE__ */ new WeakMap();
	function getMappedType(mapFn, icon, isIos) {
		let cache = mapFnCache.get(mapFn);
		if (cache === void 0) {
			cache = /* @__PURE__ */ new Map();
			mapFnCache.set(mapFn, cache);
		}
		const key = (isIos === true ? "ios;" : "md;") + icon;
		let type = cache.get(key);
		if (type === void 0) {
			if (cache.size > 1e3) cache.clear();
			const res = mapFn(icon);
			if (res === void 0) type = getType(icon, isIos);
			else if (res.icon !== void 0) type = res.icon === "none" || !res.icon ? noneType : getType(res.icon, isIos);
			else {
				const { cls, content } = res;
				type = {
					cls: cls !== void 0 ? " " + cls : "",
					content,
					ligature: content !== void 0 && content.trim().length !== 0
				};
			}
			cache.set(key, type);
		}
		return type;
	}
	var QIcon_default = /*#__PURE__*/ createComponent({
		name: "QIcon",
		props: {
			...useSizeProps,
			tag: {
				type: String,
				default: "i"
			},
			name: String,
			color: String,
			left: Boolean,
			right: Boolean
		},
		setup(props, { slots }) {
			const $q = useQuasar();
			const isIos = $q.platform.is.ios;
			let lastIcon = null;
			let lastType = noneType;
			let lastMapFn = null;
			return () => {
				const icon = props.name;
				if (icon !== lastIcon || $q.iconMapFn !== lastMapFn) {
					lastIcon = icon;
					lastMapFn = $q.iconMapFn;
					lastType = icon === "none" || !icon ? noneType : lastMapFn !== null ? getMappedType(lastMapFn, icon, isIos) : getType(icon, isIos);
				}
				const type = lastType;
				const data = {
					"aria-hidden": "true",
					class: "q-icon" + (props.left ? " on-left" : "") + (props.right ? " on-right" : "") + (props.color !== void 0 ? ` text-${props.color}` : "") + type.cls
				};
				if (props.size !== void 0) data.style = getSizeStyle$3(props.size);
				if (type.content !== void 0) return h(props.tag, data, hMergeSlot(slots.default, [type.ligature ? h("span", ligatureSpanProps, type.content) : type.content]));
				if (type.img) return h(props.tag, data, hMergeSlot(slots.default, [h("img", { src: type.src })]));
				if (type.svg) return h(props.tag, data, hMergeSlot(slots.default, [h("svg", { viewBox: type.viewBox }, type.nodes.map((svgData) => h("path", svgData)))]));
				if (type.svguse) return h(props.tag, data, hMergeSlot(slots.default, [h("svg", { viewBox: type.viewBox }, [h("use", { "xlink:href": type.src })])]));
				return h(props.tag, data, hSlot(slots.default));
			};
		}
	});
	var QAvatar_default = /*#__PURE__*/ createComponent({
		name: "QAvatar",
		props: {
			...useSizeProps,
			fontSize: String,
			color: String,
			textColor: String,
			icon: String,
			square: Boolean,
			rounded: Boolean
		},
		setup(props, { slots }) {
			const classes = computed(() => "q-avatar" + (props.color ? ` bg-${props.color}` : "") + (props.textColor ? ` text-${props.textColor} q-chip--colored` : "") + (props.square ? " q-avatar--square" : props.rounded ? " rounded-borders" : ""));
			const contentStyle = computed(() => props.fontSize ? { fontSize: props.fontSize } : null);
			return () => {
				const icon = props.icon !== void 0 ? [h(QIcon_default, { name: props.icon })] : void 0;
				const data = { class: classes.value };
				if (props.size !== void 0) data.style = getSizeStyle$3(props.size);
				return h("div", data, [h("div", {
					class: "q-avatar__content row flex-center overflow-hidden",
					style: contentStyle.value
				}, hMergeSlotSafely(slots.default, icon))]);
			};
		}
	});
	var useDarkProps = { dark: {
		type: Boolean,
		default: null
	} };
	function useDark(props, $q) {
		return () => props.dark === null ? $q.dark.isActive : props.dark;
	}
	({ ...useDarkProps });
	({ ...useDarkProps });
	var alignMap = {
		left: "start",
		center: "center",
		right: "end",
		between: "between",
		around: "around",
		evenly: "evenly",
		stretch: "stretch"
	};
	var alignValues$2 = Object.keys(alignMap);
	var useAlignProps = { align: {
		type: String,
		validator: (v) => alignValues$2.includes(v)
	} };
	function useAlign(props) {
		return () => {
			const align = props.align === void 0 ? props.vertical ? "stretch" : "left" : props.align;
			return `${props.vertical ? "items" : "justify"}-${alignMap[align]}`;
		};
	}
	function getParentProxy(proxy) {
		if (Object(proxy.$parent) === proxy.$parent) return proxy.$parent;
		let { parent } = proxy.$;
		while (Object(parent) === parent) {
			if (Object(parent.proxy) === parent.proxy) return parent.proxy;
			parent = parent.parent;
		}
	}
	function vmHasRouter(vm) {
		return vm.appContext.config.globalProperties.$router !== void 0;
	}
	function vmIsDestroyed(vm) {
		return vm.isUnmounted === true || vm.isDeactivated === true;
	}
	/**
	* Resolves the element a composable should watch: `target` (a ref or
	* getter of an Element or a component instance) or, when omitted, the
	* root element of the current component instance `vm`
	*/
	function getTargetElement(target, vm) {
		const value = target === void 0 ? vm === null ? null : vm.proxy.$el : toValue(target);
		if (value === null || value === void 0) return null;
		const el = value.$el ?? value;
		return el.nodeType === 1 ? el : null;
	}
	({ ...useAlignProps });
	function getOriginalPath(record) {
		return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
	}
	function isSameRouteRecord(a, b) {
		return (a.aliasOf || a) === (b.aliasOf || b);
	}
	function includesParams(outer, inner) {
		for (const key in inner) {
			const innerValue = inner[key], outerValue = outer[key];
			if (typeof innerValue === "string") {
				if (innerValue !== outerValue) return false;
			} else if (!Array.isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value !== outerValue[i])) return false;
		}
		return true;
	}
	function isEquivalentArray(a, b) {
		return Array.isArray(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
	}
	function isSameRouteLocationParamsValue(a, b) {
		return Array.isArray(a) ? isEquivalentArray(a, b) : Array.isArray(b) ? isEquivalentArray(b, a) : a === b;
	}
	function isSameRouteLocationParams(a, b) {
		if (Object.keys(a).length !== Object.keys(b).length) return false;
		for (const key in a) if (!isSameRouteLocationParamsValue(a[key], b[key])) return false;
		return true;
	}
	var useRouterLinkNonMatchingProps = {
		to: [String, Object],
		replace: Boolean,
		href: String,
		target: String,
		disable: Boolean
	};
	var useRouterLinkProps = {
		...useRouterLinkNonMatchingProps,
		exact: Boolean,
		activeClass: {
			type: String,
			default: "q-router-link--active"
		},
		exactActiveClass: {
			type: String,
			default: "q-router-link--exact-active"
		}
	};
	var emptyLinkAttrs = {};
	var linkFalse = { value: false };
	var linkNull = { value: null };
	var linkNoClass = { value: "" };
	function useRouterLink({ fallbackTag, useDisableForRouterLinkProps = true } = {}) {
		const vm = getCurrentInstance();
		const { props, proxy, emit } = vm;
		const hasHrefLink = computed(() => !props.disable && props.href !== void 0);
		if (!vmHasRouter(vm)) return {
			hasRouterLink: linkFalse,
			hasHrefLink,
			hasLink: hasHrefLink,
			linkTag: computed(() => props.type === "a" || hasHrefLink.value ? "a" : props.tag || fallbackTag || "div"),
			resolvedLink: linkNull,
			linkIsActive: linkFalse,
			linkIsExactActive: linkFalse,
			linkClass: linkNoClass,
			linkAttrs: computed(() => hasHrefLink.value ? {
				href: props.href,
				target: props.target
			} : emptyLinkAttrs),
			getLink: () => null,
			navigateToRouterLink(e) {
				e.preventDefault();
				return Promise.resolve(false);
			},
			navigateOnClick(e) {
				emit("click", e);
			}
		};
		const hasRouterLinkProps = useDisableForRouterLinkProps ? computed(() => !props.disable && !hasHrefLink.value && props.to !== void 0 && props.to !== null && props.to !== "") : computed(() => !hasHrefLink.value && props.to !== void 0 && props.to !== null && props.to !== "");
		const resolvedLink = computed(() => hasRouterLinkProps.value ? getLink(props.to) : null);
		const hasRouterLink = computed(() => resolvedLink.value !== null);
		const hasLink = computed(() => hasHrefLink.value || hasRouterLink.value);
		const linkTag = computed(() => props.type === "a" || hasLink.value ? "a" : props.tag || fallbackTag || "div");
		const linkAttrs = computed(() => hasHrefLink.value ? {
			href: props.href,
			target: props.target
		} : hasRouterLink.value ? {
			href: resolvedLink.value.href,
			target: props.target
		} : emptyLinkAttrs);
		const linkActiveIndex = computed(() => {
			if (!hasRouterLink.value) return -1;
			const { matched } = resolvedLink.value, { length } = matched, routeMatched = matched[length - 1];
			if (routeMatched === void 0) return -1;
			const currentMatched = proxy.$route.matched;
			if (currentMatched.length === 0) return -1;
			const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
			if (index !== -1) return index;
			const parentRecordPath = getOriginalPath(matched[length - 2]);
			return length > 1 && getOriginalPath(routeMatched) === parentRecordPath && currentMatched.at(-1).path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index;
		});
		const linkIsActive = computed(() => hasRouterLink.value && linkActiveIndex.value !== -1 && includesParams(proxy.$route.params, resolvedLink.value.params));
		const linkIsExactActive = computed(() => linkIsActive.value && linkActiveIndex.value === proxy.$route.matched.length - 1 && isSameRouteLocationParams(proxy.$route.params, resolvedLink.value.params));
		const linkClass = computed(() => hasRouterLink.value ? linkIsExactActive.value ? ` ${props.exactActiveClass} ${props.activeClass}` : props.exact ? "" : linkIsActive.value ? ` ${props.activeClass}` : "" : "");
		function getLink(to) {
			try {
				return proxy.$router.resolve(to);
			} catch {}
			return null;
		}
		/**
		* @returns Promise<RouterError | false | undefined>
		*/
		function navigateToRouterLink(e, { returnRouterError, to = props.to, replace = props.replace } = {}) {
			if (props.disable) {
				e.preventDefault();
				return Promise.resolve(false);
			}
			if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== void 0 && e.button !== 0 || props.target === "_blank") return Promise.resolve(false);
			e.preventDefault();
			const promise = proxy.$router[replace ? "replace" : "push"](to);
			return returnRouterError ? promise : promise.then(() => {}).catch(() => {});
		}
		function navigateOnClick(e) {
			if (hasRouterLink.value) {
				const go = (opts) => navigateToRouterLink(e, opts);
				emit("click", e, go);
				if (!e.defaultPrevented) go();
			} else emit("click", e);
		}
		return {
			hasRouterLink,
			hasHrefLink,
			hasLink,
			linkTag,
			resolvedLink,
			linkIsActive,
			linkIsExactActive,
			linkClass,
			linkAttrs,
			getLink,
			navigateToRouterLink,
			navigateOnClick
		};
	}
	({ ...useRouterLinkProps });
	var useSpinnerProps = {
		size: {
			type: [String, Number],
			default: "1em"
		},
		color: String
	};
	function getSpinnerSize(size) {
		return size in useSizeDefaults ? `${useSizeDefaults[size]}px` : size;
	}
	function getSpinnerClass(color, name) {
		return "q-spinner" + (name ? ` q-spinner-${name}` : "") + (color ? ` text-${color}` : "");
	}
	var QSpinner_default = /*#__PURE__*/ createComponent({
		name: "QSpinner",
		props: {
			...useSpinnerProps,
			thickness: {
				type: Number,
				default: 5
			}
		},
		setup(props) {
			return () => {
				const cSize = getSpinnerSize(props.size);
				return h("svg", {
					class: getSpinnerClass(props.color, "mat"),
					width: cSize,
					height: cSize,
					viewBox: "0 0 50 50"
				}, [h("circle", {
					class: "path",
					cx: "25",
					cy: "25",
					r: "20",
					fill: "none",
					stroke: "currentColor",
					"stroke-width": props.thickness,
					"stroke-miterlimit": "10"
				})]);
			};
		}
	});
	function css(element, cssObject) {
		const elementStyle = element.style;
		for (const prop in cssObject) elementStyle[prop] = cssObject[prop];
	}
	function getElement$1(el) {
		if (el === void 0 || el === null) return;
		if (typeof el === "string") try {
			return document.querySelector(el) || void 0;
		} catch {
			return;
		}
		const target = unref(el);
		if (target) return target.$el || target;
	}
	function childHasFocus(el, focusedEl) {
		if (el === void 0 || el === null || el.contains(focusedEl)) return true;
		for (let next = el.nextElementSibling; next !== null; next = next.nextElementSibling) if (next.contains(focusedEl)) return true;
		return false;
	}
	var enterDelay = 50;
	var touchEnterDelay = 100;
	var keyThrottle = 300;
	var { passive: passive$6 } = listenOpts;
	var listeners$1 = [
		[],
		[["click", onStart], ["keyup", onKey]],
		[
			["pointerdown", onStart],
			["pointercancel", onCancel],
			["pointerleave", onCancel],
			["keydown", onKey]
		]
	];
	function showRipple(evt, el, ctx, forceCenter) {
		if (ctx.stop) stop(evt);
		const color = ctx.color, center = ctx.center || forceCenter === true, node = document.createElement("span"), innerNode = document.createElement("span"), pos = position(evt), { left, top, width, height } = el.getBoundingClientRect(), diameter = Math.hypot(width, height), radius = diameter / 2, centerX = `${(width - diameter) / 2}px`, x = center ? centerX : `${pos.left - left - radius}px`, centerY = `${(height - diameter) / 2}px`, y = center ? centerY : `${pos.top - top - radius}px`;
		innerNode.className = "q-ripple__inner";
		css(innerNode, {
			height: `${diameter}px`,
			width: `${diameter}px`,
			transform: `translate(${x},${y}) scale(.2)`,
			opacity: 0
		});
		node.className = `q-ripple${color ? " text-" + color : ""}`;
		node.setAttribute("dir", "ltr");
		node.append(innerNode);
		el.append(node);
		let timer;
		let phase = 0;
		const finish = () => {
			node.remove();
			const index = ctx.ripples.indexOf(ripple);
			if (index !== -1) ctx.ripples.splice(index, 1);
		};
		const leave = () => {
			phase = 2;
			innerNode.classList.remove("q-ripple__inner--enter");
			innerNode.classList.add("q-ripple__inner--leave");
			innerNode.style.opacity = 0;
			timer = setTimeout(finish, 275);
		};
		const enter = () => {
			phase = 1;
			innerNode.classList.add("q-ripple__inner--enter");
			innerNode.style.transform = `translate(${centerX},${centerY}) scale(1)`;
			innerNode.style.opacity = .2;
			timer = setTimeout(leave, 250);
		};
		const ripple = {
			pointerId: evt.type === "pointerdown" ? evt.pointerId : null,
			abort() {
				clearTimeout(timer);
				node.remove();
			},
			cancel() {
				ripple.pointerId = null;
				if (phase === 2) return;
				clearTimeout(timer);
				if (phase === 0) finish();
				else leave();
			}
		};
		ctx.ripples.push(ripple);
		timer = setTimeout(enter, evt.type === "pointerdown" && evt.pointerType === "touch" ? touchEnterDelay : enterDelay);
	}
	function onStart(evt) {
		if (!evt.qSkipRipple) {
			const el = evt.currentTarget;
			showRipple(evt, el, el.__qripple, evt.qKeyEvent === true);
		}
	}
	function onKey(evt) {
		const el = evt.currentTarget, ctx = el.__qripple;
		if (!evt.qSkipRipple && isKeyCode(evt, ctx.keyCodes)) {
			const now = Date.now();
			if (now - ctx.keyTime >= keyThrottle) {
				ctx.keyTime = now;
				showRipple(evt, el, ctx, true);
			}
		}
	}
	function onCancel(evt) {
		if (evt.type === "pointerleave" && evt.buttons === 0) return;
		const { ripples } = evt.currentTarget.__qripple;
		for (let i = ripples.length - 1; i >= 0; i--) {
			const ripple = ripples[i];
			if (ripple.pointerId === evt.pointerId) ripple.cancel();
		}
	}
	function modifiersChanged(a, b) {
		return a !== b && (a.early !== b.early || a.stop !== b.stop || a.center !== b.center);
	}
	function setOptions(ctx, { modifiers, value, arg }) {
		const cfg = {
			...ctx.cfg,
			...modifiers,
			...value
		};
		const keyCodes = cfg.keyCodes || 13;
		ctx.arg = arg;
		ctx.modifiers = modifiers;
		ctx.early = cfg.early === true;
		ctx.stop = cfg.stop === true;
		ctx.center = cfg.center === true;
		ctx.color = cfg.color || arg;
		ctx.keyCodes = Array.isArray(keyCodes) ? keyCodes.flat() : keyCodes;
	}
	function bind$4(el, ctx) {
		const bound = ctx.enabled ? ctx.early ? 2 : 1 : 0;
		if (bound !== ctx.bound) {
			for (const [name, fn] of listeners$1[ctx.bound]) el.removeEventListener(name, fn, passive$6);
			for (const [name, fn] of listeners$1[bound]) el.addEventListener(name, fn, passive$6);
			ctx.bound = bound;
		}
	}
	var Ripple_default = /*#__PURE__*/ createDirective({
		name: "ripple",
		beforeMount(el, binding) {
			const cfg = binding.instance.$.appContext.config.globalProperties.$q.config || {};
			if (cfg.ripple === false) return;
			const ctx = {
				cfg: cfg.ripple,
				enabled: binding.value !== false,
				arg: void 0,
				modifiers: void 0,
				early: false,
				stop: false,
				center: false,
				color: void 0,
				keyCodes: 13,
				keyTime: 0,
				bound: 0,
				ripples: []
			};
			setOptions(ctx, binding);
			el.__qripple = ctx;
			bind$4(el, ctx);
		},
		updated(el, binding) {
			const ctx = el.__qripple;
			if (ctx === void 0) return;
			const { value, oldValue, arg, modifiers } = binding;
			ctx.enabled = value !== false;
			if (ctx.enabled && (value !== oldValue || arg !== ctx.arg || modifiersChanged(modifiers, ctx.modifiers))) setOptions(ctx, binding);
			bind$4(el, ctx);
		},
		beforeUnmount(el) {
			const ctx = el.__qripple;
			if (ctx === void 0) return;
			ctx.ripples.forEach((ripple) => {
				ripple.abort();
			});
			ctx.enabled = false;
			bind$4(el, ctx);
			el.__qripple = void 0;
		}
	});
	var btnPadding = {
		none: 0,
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32
	};
	var getSizeStyle$2 = /*#__PURE__*/ createSizeStyle({
		xs: 8,
		sm: 10,
		md: 14,
		lg: 20,
		xl: 24
	});
	var formTypes = [
		"button",
		"submit",
		"reset"
	];
	var mediaTypeRE = /[^\s]\/[^\s]/;
	var btnDesignOptions = [
		"flat",
		"outline",
		"push",
		"unelevated"
	];
	function getBtnDesign(props, defaultValue) {
		if (props.flat) return "flat";
		if (props.outline) return "outline";
		if (props.push) return "push";
		if (props.unelevated) return "unelevated";
		return defaultValue;
	}
	var nonRoundBtnProps = {
		...useSizeProps,
		...useRouterLinkNonMatchingProps,
		type: {
			type: String,
			default: "button"
		},
		label: [Number, String],
		icon: String,
		iconRight: String,
		...btnDesignOptions.reduce((acc, val) => (acc[val] = Boolean) && acc, {}),
		square: Boolean,
		rounded: Boolean,
		glossy: Boolean,
		size: String,
		fab: Boolean,
		fabMini: Boolean,
		padding: String,
		color: String,
		textColor: String,
		noCaps: Boolean,
		noWrap: Boolean,
		dense: Boolean,
		tabindex: [Number, String],
		ripple: {
			type: [Boolean, Object],
			default: true
		},
		align: {
			...useAlignProps.align,
			default: "center"
		},
		stack: Boolean,
		stretch: Boolean,
		loading: {
			type: Boolean,
			default: null
		},
		disable: Boolean
	};
	var useBtnProps = {
		...nonRoundBtnProps,
		round: Boolean
	};
	function useBtn(props) {
		const alignClass = useAlign(props);
		const { hasRouterLink, hasLink, linkTag, linkAttrs, navigateOnClick } = useRouterLink({ fallbackTag: "button" });
		const style = computed(() => {
			const obj = props.fab || props.fabMini ? {} : getSizeStyle$2(props.size);
			return props.padding !== void 0 ? {
				...obj,
				padding: props.padding.split(/\s+/).map((v) => v in btnPadding ? btnPadding[v] + "px" : v).join(" "),
				minWidth: "0",
				minHeight: "0"
			} : obj;
		});
		const isRounded = computed(() => props.rounded || props.fab || props.fabMini);
		const isActionable = computed(() => !props.disable && !props.loading);
		const tabIndex = computed(() => isActionable.value ? props.tabindex || 0 : -1);
		const design = computed(() => getBtnDesign(props, "standard"));
		const attributes = computed(() => {
			const acc = { tabindex: tabIndex.value };
			if (hasLink.value) Object.assign(acc, linkAttrs.value);
			else if (formTypes.includes(props.type)) acc.type = props.type;
			if (linkTag.value === "a") {
				if (props.disable) acc["aria-disabled"] = "true";
				if (acc.href === void 0) acc.role = "button";
				if (!hasRouterLink.value && mediaTypeRE.test(props.type)) acc.type = props.type;
			} else if (props.disable) {
				acc.disabled = "";
				acc["aria-disabled"] = "true";
			}
			if (props.loading && props.percentage !== void 0) Object.assign(acc, {
				role: "progressbar",
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuenow": props.percentage
			});
			return acc;
		});
		return {
			classes: computed(() => {
				let colors;
				if (props.color !== void 0) colors = props.flat || props.outline ? `text-${props.textColor || props.color}` : `bg-${props.color} text-${props.textColor || "white"}`;
				else if (props.textColor) colors = `text-${props.textColor}`;
				const shape = props.round ? "round" : `rectangle${isRounded.value ? " q-btn--rounded" : props.square ? " q-btn--square" : ""}`;
				return `q-btn--${design.value} q-btn--${shape}` + (colors !== void 0 ? " " + colors : "") + (isActionable.value ? " q-btn--actionable q-focusable q-hoverable" : props.disable ? " disabled" : "") + (props.fab ? " q-btn--fab" : props.fabMini ? " q-btn--fab-mini" : "") + (props.noCaps ? " q-btn--no-uppercase" : "") + (props.dense ? " q-btn--dense" : "") + (props.stretch ? " no-border-radius self-stretch" : "") + (props.glossy ? " glossy" : "") + (props.square ? " q-btn--square" : "");
			}),
			style,
			innerClasses: computed(() => alignClass() + (props.stack ? " column" : " row") + (props.noWrap ? " no-wrap text-no-wrap" : "") + (props.loading ? " q-btn__content--hidden" : "")),
			attributes,
			hasLink,
			linkTag,
			navigateOnClick,
			isActionable
		};
	}
	var { passiveCapture: passiveCapture$5 } = listenOpts;
	var touchTarget = null;
	var keyboardTarget = null;
	var mouseTarget = null;
	function onLoadingEvt(evt) {
		stopAndPrevent(evt);
		evt.qSkipRipple = true;
	}
	var QBtn_default = /*#__PURE__*/ createComponent({
		name: "QBtn",
		props: {
			...useBtnProps,
			percentage: Number,
			darkPercentage: Boolean,
			onTouchstart: [Function, Array]
		},
		emits: [
			"click",
			"keydown",
			"mousedown",
			"keyup"
		],
		setup(props, { slots, emit }) {
			const { proxy } = getCurrentInstance();
			const $q = useQuasar();
			const { classes, style, innerClasses, attributes, hasLink, linkTag, navigateOnClick, isActionable } = useBtn(props);
			const rootRef = /* @__PURE__ */ shallowRef(null);
			const blurTargetRef = /* @__PURE__ */ shallowRef(null);
			let localTouchTargetEl = null, avoidMouseRipple, mouseTimer = null, clickCleanup = null;
			const hasLabel = computed(() => props.label !== void 0 && props.label !== null && props.label !== "");
			const ripple = computed(() => props.disable || props.ripple === false ? false : {
				keyCodes: hasLink.value ? [13, 32] : [13],
				...props.ripple === true ? {} : props.ripple
			});
			const rippleProps = computed(() => ({ center: props.round }));
			const percentageStyle = computed(() => {
				const val = Math.max(0, Math.min(100, props.percentage));
				return val > 0 ? {
					transition: "transform 0.6s",
					transform: `translateX(${val - 100}%)`
				} : {};
			});
			const onEvents = computed(() => {
				if (props.loading) return {
					onMousedown: onLoadingEvt,
					onTouchstart: onLoadingEvt,
					onClick: onLoadingEvt,
					onKeydown: onLoadingEvt,
					onKeyup: onLoadingEvt
				};
				if (isActionable.value) {
					const acc = {
						onClick,
						onKeydown,
						onMousedown
					};
					if ($q.platform.has.touch) {
						const suffix = props.onTouchstart !== void 0 ? "" : "Passive";
						acc[`onTouchstart${suffix}`] = onTouchstart;
					}
					return acc;
				}
				return { onClick: stopAndPrevent };
			});
			const nodeProps = computed(() => ({
				ref: rootRef,
				class: "q-btn q-btn-item non-selectable no-outline " + classes.value,
				style: style.value,
				...attributes.value,
				...onEvents.value
			}));
			function onClick(e) {
				if (rootRef.value === null) return;
				if (e !== void 0) {
					if (e.defaultPrevented) return;
					const el = document.activeElement;
					if (props.type === "submit" && el !== document.body && !rootRef.value.contains(el) && !el.contains(rootRef.value)) {
						if (!e.qAvoidFocus) rootRef.value.focus();
						const onClickCleanup = () => {
							clickCleanup = null;
							document.removeEventListener("keydown", stopAndPrevent, true);
							document.removeEventListener("keyup", onClickCleanup, passiveCapture$5);
							rootRef.value?.removeEventListener("blur", onClickCleanup, passiveCapture$5);
						};
						clickCleanup = onClickCleanup;
						document.addEventListener("keydown", stopAndPrevent, true);
						document.addEventListener("keyup", onClickCleanup, passiveCapture$5);
						rootRef.value.addEventListener("blur", onClickCleanup, passiveCapture$5);
					}
				}
				navigateOnClick(e);
			}
			function onKeydown(e) {
				if (rootRef.value === null) return;
				emit("keydown", e);
				if (isKeyCode(e, [13, 32]) && keyboardTarget !== rootRef.value) {
					if (keyboardTarget !== null) cleanup();
					if (!e.defaultPrevented) {
						if (!e.qAvoidFocus) rootRef.value.focus();
						keyboardTarget = rootRef.value;
						rootRef.value.classList.add("q-btn--active");
						document.addEventListener("keyup", onPressEnd, true);
						rootRef.value.addEventListener("blur", onPressEnd, passiveCapture$5);
					}
					stopAndPrevent(e);
				}
			}
			function onTouchstart(e) {
				if (rootRef.value === null) return;
				emit("touchstart", e);
				if (e.defaultPrevented) return;
				if (touchTarget !== rootRef.value) {
					if (touchTarget !== null) cleanup();
					touchTarget = rootRef.value;
					localTouchTargetEl = e.target;
					localTouchTargetEl.addEventListener("touchcancel", onPressEnd, passiveCapture$5);
					localTouchTargetEl.addEventListener("touchend", onPressEnd, passiveCapture$5);
				}
				avoidMouseRipple = true;
				if (mouseTimer !== null) clearTimeout(mouseTimer);
				mouseTimer = setTimeout(() => {
					mouseTimer = null;
					avoidMouseRipple = false;
				}, 200);
			}
			function onMousedown(e) {
				if (rootRef.value === null) return;
				e.qSkipRipple = avoidMouseRipple === true;
				emit("mousedown", e);
				if (!e.defaultPrevented && mouseTarget !== rootRef.value) {
					if (mouseTarget !== null) cleanup();
					mouseTarget = rootRef.value;
					rootRef.value.classList.add("q-btn--active");
					document.addEventListener("mouseup", onPressEnd, passiveCapture$5);
				}
			}
			function onPressEnd(e) {
				if (rootRef.value === null) return;
				if (e?.type === "keyup") {
					if (keyboardTarget === rootRef.value && isKeyCode(e, [13, 32])) {
						const evt = new MouseEvent("click", e);
						evt.qKeyEvent = true;
						if (e.defaultPrevented) prevent(evt);
						if (e.cancelBubble) stop(evt);
						rootRef.value.dispatchEvent(evt);
						stopAndPrevent(e);
						e.qKeyEvent = true;
					}
					emit("keyup", e);
				}
				cleanup();
			}
			function cleanup(destroying) {
				clickCleanup?.();
				const blurTarget = blurTargetRef.value;
				if (!destroying && (touchTarget === rootRef.value || mouseTarget === rootRef.value) && blurTarget !== null && blurTarget !== document.activeElement) {
					blurTarget.setAttribute("tabindex", -1);
					blurTarget.focus({ preventScroll: true });
				}
				if (touchTarget === rootRef.value) {
					if (localTouchTargetEl !== null) {
						localTouchTargetEl.removeEventListener("touchcancel", onPressEnd, passiveCapture$5);
						localTouchTargetEl.removeEventListener("touchend", onPressEnd, passiveCapture$5);
					}
					touchTarget = localTouchTargetEl = null;
				}
				if (mouseTarget === rootRef.value) {
					document.removeEventListener("mouseup", onPressEnd, passiveCapture$5);
					mouseTarget = null;
				}
				if (keyboardTarget === rootRef.value) {
					document.removeEventListener("keyup", onPressEnd, true);
					rootRef.value?.removeEventListener("blur", onPressEnd, passiveCapture$5);
					keyboardTarget = null;
				}
				rootRef.value?.classList.remove("q-btn--active");
			}
			onBeforeUnmount(() => {
				cleanup(true);
			});
			Object.assign(proxy, { click: (e) => {
				if (isActionable.value) onClick(e);
			} });
			return () => {
				let inner = [];
				if (props.icon !== void 0) inner.push(h(QIcon_default, {
					name: props.icon,
					left: !props.stack && hasLabel.value,
					role: "img"
				}));
				if (hasLabel.value) inner.push(h("span", { class: "block" }, [props.label]));
				inner = hMergeSlot(slots.default, inner);
				if (props.iconRight !== void 0 && !props.round) inner.push(h(QIcon_default, {
					name: props.iconRight,
					right: !props.stack && hasLabel.value,
					role: "img"
				}));
				const child = [h("span", {
					class: "q-focus-helper",
					ref: blurTargetRef
				})];
				if (props.loading && props.percentage !== void 0) child.push(h("span", { class: "q-btn__progress absolute-full overflow-hidden" + (props.darkPercentage ? " q-btn__progress--dark" : "") }, [h("span", {
					class: "q-btn__progress-indicator fit block",
					style: percentageStyle.value
				})]));
				child.push(h("span", { class: "q-btn__content text-center col items-center q-anchor--skip " + innerClasses.value }, inner));
				if (props.loading !== null) child.push(h(Transition, { name: "q-transition--fade" }, () => props.loading ? [h("span", {
					key: "loading",
					class: "absolute-full flex flex-center"
				}, slots.loading !== void 0 ? slots.loading() : [h(QSpinner_default)])] : null));
				return withDirectives(h(linkTag.value, nodeProps.value, child), [[
					Ripple_default,
					ripple.value,
					void 0,
					rippleProps.value
				]]);
			};
		}
	});
	function clearSelection() {
		if (window.getSelection !== void 0) {
			const selection = window.getSelection();
			if (selection.empty !== void 0) selection.empty();
			else if (selection.removeAllRanges !== void 0) {
				selection.removeAllRanges();
				if (!Platform.is.mobile) selection.addRange(document.createRange());
			}
		} else if (document.selection !== void 0) document.selection.empty();
	}
	var useAnchorStaticProps = {
		target: {
			type: [
				Boolean,
				String,
				Element
			],
			default: true
		},
		noParentEvent: Boolean
	};
	var useAnchorProps = {
		...useAnchorStaticProps,
		contextMenu: Boolean
	};
	var expandableRoles = {
		application: true,
		button: true,
		checkbox: true,
		columnheader: true,
		combobox: true,
		gridcell: true,
		link: true,
		listbox: true,
		menuitem: true,
		menuitemcheckbox: true,
		menuitemradio: true,
		row: true,
		rowheader: true,
		switch: true,
		tab: true,
		treeitem: true
	};
	var expandableInputTypes = {
		button: true,
		image: true,
		reset: true,
		submit: true
	};
	var popupRoles = {
		dialog: true,
		grid: true,
		listbox: true,
		menu: true,
		tree: true
	};
	function isExpandableControl(el) {
		const role = el.getAttribute("role")?.trim();
		if (role) return Object.hasOwn(expandableRoles, role.split(/\s+/)[0]);
		const tag = el.tagName;
		return tag === "BUTTON" || tag === "A" && el.hasAttribute("href") || tag === "INPUT" && Object.hasOwn(expandableInputTypes, el.type);
	}
	function useAnchor({ showing, avoidEmit, configureAnchorEl, getPopupRole }) {
		const { props, proxy, emit } = getCurrentInstance();
		const anchorEl = /* @__PURE__ */ shallowRef(null);
		let ariaEl = null, ownsExpanded = false, ownsHaspopup = false;
		let touchTimer = null;
		let touchHoldOwned = false;
		function canShow(evt) {
			return anchorEl.value === null ? false : evt === void 0 || evt.touches === void 0 || evt.touches.length <= 1;
		}
		const anchorEvents = {};
		if (configureAnchorEl === void 0) {
			Object.assign(anchorEvents, {
				hide(evt) {
					if (evt?.pointerType === "touch") return;
					touchHoldOwned = false;
					proxy.hide(evt);
				},
				toggle(evt) {
					proxy.toggle(evt);
					evt.qAnchorHandled = true;
				},
				toggleKey(evt) {
					if (isKeyCode(evt, 13)) anchorEvents.toggle(evt);
				},
				contextClick(evt) {
					if (touchHoldOwned) {
						touchHoldOwned = false;
						prevent(evt);
						return;
					}
					proxy.hide(evt);
					prevent(evt);
					nextTick(() => {
						proxy.show(evt);
						evt.qAnchorHandled = true;
					});
				},
				touchHold(evt) {
					anchorEvents.touchHoldCleanup(evt);
					if (!canShow(evt)) return;
					touchHoldOwned = true;
					proxy.hide(evt);
					anchorEl.value.classList.add("non-selectable");
					const target = evt.target;
					addEvt(anchorEvents, "anchor", [
						[
							target,
							"touchmove",
							"touchHoldCleanup",
							"passive"
						],
						[
							target,
							"touchend",
							"touchHoldCleanup",
							"passive"
						],
						[
							target,
							"touchcancel",
							"touchHoldCleanup",
							"passive"
						]
					]);
					touchTimer = setTimeout(() => {
						touchTimer = null;
						proxy.show(evt);
						evt.qAnchorHandled = true;
					}, 300);
				},
				touchHoldCleanup(evt) {
					anchorEl.value.classList.remove("non-selectable");
					if (touchTimer !== null) {
						clearTimeout(touchTimer);
						touchTimer = null;
						touchHoldOwned = false;
					}
					if (showing.value && evt !== void 0) clearSelection();
				}
			});
			watch(showing, (val) => {
				if (!val) touchHoldOwned = false;
			});
			configureAnchorEl = function configureAnchorElFn(context = props.contextMenu) {
				if (props.noParentEvent || anchorEl.value === null) return;
				const evts = context ? [
					[
						anchorEl.value,
						"touchstart",
						"touchHold",
						"passive"
					],
					[
						anchorEl.value,
						"pointerdown",
						"hide",
						"passive"
					],
					[
						anchorEl.value,
						"contextmenu",
						"contextClick",
						"notPassive"
					]
				] : [[
					anchorEl.value,
					"click",
					"toggle",
					"passive"
				], [
					anchorEl.value,
					"keyup",
					"toggleKey",
					"passive"
				]];
				if (!context && props.hover === true) evts.push([
					anchorEl.value,
					"pointerenter",
					"hoverShow",
					"passive"
				], [
					anchorEl.value,
					"pointerleave",
					"hoverHide",
					"passive"
				]);
				addEvt(anchorEvents, "anchor", evts);
			};
		}
		function unconfigureAnchorEl() {
			cleanEvt(anchorEvents, "anchor");
		}
		function configureAnchorAria() {
			if (getPopupRole === void 0 || anchorEl.value === null || props.contextMenu) return;
			const el = anchorEl.value;
			if (!isExpandableControl(el)) return;
			ownsExpanded = !el.hasAttribute("aria-expanded");
			ownsHaspopup = !el.hasAttribute("aria-haspopup");
			if (ownsExpanded || ownsHaspopup) {
				ariaEl = el;
				updateAnchorAria();
			}
		}
		function updateAnchorAria() {
			if (ariaEl === null) return;
			if (ownsExpanded) ariaEl.setAttribute("aria-expanded", showing.value ? "true" : "false");
			if (ownsHaspopup) {
				const role = getPopupRole();
				if (Object.hasOwn(popupRoles, role)) ariaEl.setAttribute("aria-haspopup", role);
				else ariaEl.removeAttribute("aria-haspopup");
			}
		}
		function unconfigureAnchorAria() {
			if (ariaEl === null) return;
			if (ownsExpanded) ariaEl.removeAttribute("aria-expanded");
			if (ownsHaspopup) ariaEl.removeAttribute("aria-haspopup");
			ariaEl = null;
			ownsExpanded = false;
			ownsHaspopup = false;
		}
		function setAnchorEl(el) {
			anchorEl.value = el;
			while (anchorEl.value.classList.contains("q-anchor--skip")) anchorEl.value = anchorEl.value.parentNode;
			configureAnchorEl();
		}
		function pickAnchorEl() {
			if (props.target === false || props.target === "" || proxy.$el.parentNode === null) anchorEl.value = null;
			else if (props.target === true) setAnchorEl(proxy.$el.parentNode);
			else {
				let el = props.target;
				if (typeof props.target === "string") try {
					el = document.querySelector(props.target);
				} catch {
					el = void 0;
				}
				if (el !== void 0 && el !== null) {
					anchorEl.value = el.$el || el;
					configureAnchorEl();
				} else {
					anchorEl.value = null;
					console.error(`Anchor: target "${props.target}" not found`);
				}
			}
			configureAnchorAria();
		}
		watch(() => props.contextMenu, (val) => {
			if (anchorEl.value !== null) {
				unconfigureAnchorEl();
				configureAnchorEl(val);
				unconfigureAnchorAria();
				configureAnchorAria();
			}
		});
		watch(() => props.hover, () => {
			if (anchorEl.value !== null) {
				unconfigureAnchorEl();
				configureAnchorEl();
			}
		});
		watch(() => props.target, () => {
			if (anchorEl.value !== null) {
				unconfigureAnchorEl();
				unconfigureAnchorAria();
			}
			pickAnchorEl();
		});
		watch(() => props.noParentEvent, (val) => {
			if (anchorEl.value !== null) {
				if (val) unconfigureAnchorEl();
				else configureAnchorEl();
			}
		});
		if (getPopupRole !== void 0) watch(showing, updateAnchorAria);
		onMounted(() => {
			pickAnchorEl();
			if (!avoidEmit && props.modelValue && anchorEl.value === null) emit("update:modelValue", false);
		});
		onBeforeUnmount(() => {
			if (touchTimer !== null) clearTimeout(touchTimer);
			unconfigureAnchorEl();
			unconfigureAnchorAria();
		});
		return {
			anchorEl,
			canShow,
			anchorEvents
		};
	}
	var useModelToggleProps = {
		modelValue: {
			type: Boolean,
			default: null
		},
		"onUpdate:modelValue": [Function, Array]
	};
	var useModelToggleEmits = [
		"beforeShow",
		"show",
		"beforeHide",
		"hide"
	];
	function useModelToggle({ showing, canShow, canHide, hideOnRouteChange, handleShow, handleHide, handleRouteChange, processOnMount }) {
		const vm = getCurrentInstance();
		const { props, emit, proxy } = vm;
		let payload;
		function toggle(evt) {
			if (showing.value) hide(evt);
			else show(evt);
		}
		function show(evt) {
			if (props.disable || evt?.qAnchorHandled === true || canShow !== void 0 && !canShow(evt)) return;
			const listener = props["onUpdate:modelValue"] !== void 0;
			if (listener && true) {
				emit("update:modelValue", true);
				payload = evt;
				nextTick(() => {
					if (payload === evt) payload = void 0;
				});
			}
			if (props.modelValue === null || !listener) processShow(evt);
		}
		function processShow(evt) {
			if (showing.value) return;
			showing.value = true;
			emit("beforeShow", evt);
			if (handleShow !== void 0) handleShow(evt);
			else emit("show", evt);
		}
		function hide(evt) {
			if (props.disable || canHide !== void 0 && !canHide(evt)) return;
			const listener = props["onUpdate:modelValue"] !== void 0;
			if (listener && true) {
				emit("update:modelValue", false);
				payload = evt;
				nextTick(() => {
					if (payload === evt) payload = void 0;
				});
			}
			if (props.modelValue === null || !listener) processHide(evt);
		}
		function processHide(evt) {
			if (!showing.value) return;
			showing.value = false;
			emit("beforeHide", evt);
			if (handleHide !== void 0) handleHide(evt);
			else emit("hide", evt);
		}
		function processModelChange(val) {
			if (props.disable && val) {
				if (props["onUpdate:modelValue"] !== void 0) emit("update:modelValue", false);
			} else if (val === true !== showing.value) (val ? processShow : processHide)(payload);
		}
		watch(() => props.modelValue, processModelChange);
		if (hideOnRouteChange !== void 0 && vmHasRouter(vm)) watch(() => proxy.$route.fullPath, () => {
			if (hideOnRouteChange.value && showing.value) {
				handleRouteChange?.();
				hide();
			}
		});
		if (processOnMount) onMounted(() => {
			processModelChange(props.modelValue);
		});
		const publicMethods = {
			show,
			hide,
			toggle
		};
		Object.assign(proxy, publicMethods);
		return publicMethods;
	}
	var portalProxyList = [];
	function getPortalProxy(el) {
		return portalProxyList.find((proxy) => proxy.contentEl !== null && proxy.contentEl.contains(el));
	}
	function closePortalMenus(proxy, evt) {
		do {
			if (proxy.$options.name === "QMenu") {
				proxy.hide(evt);
				if (proxy.$props.separateClosePopup) return getParentProxy(proxy);
			} else if (proxy.__qPortal) {
				const parent = getParentProxy(proxy);
				if (parent?.$options.name === "QPopupProxy") {
					proxy.hide(evt);
					return parent;
				}
				return proxy;
			}
			proxy = getParentProxy(proxy);
		} while (proxy !== void 0 && proxy !== null);
	}
	function closePortals(proxy, evt, depth) {
		while (depth !== 0 && proxy !== void 0 && proxy !== null) {
			if (proxy.__qPortal) {
				depth--;
				if (proxy.$options.name === "QMenu") {
					proxy = closePortalMenus(proxy, evt);
					continue;
				}
				proxy.hide(evt);
			}
			proxy = getParentProxy(proxy);
		}
	}
	var queue = [];
	var waitFlags = [];
	var refocusing = false;
	function refocus(el) {
		refocusing = true;
		el.focus({ preventScroll: true });
		refocusing = false;
	}
	function isRefocusing() {
		return refocusing;
	}
	function clearFlag(flag) {
		waitFlags = waitFlags.filter((entry) => entry !== flag);
	}
	function addFocusWaitFlag(flag) {
		clearFlag(flag);
		waitFlags.push(flag);
	}
	function removeFocusWaitFlag(flag) {
		clearFlag(flag);
		if (waitFlags.length === 0 && queue.length !== 0) {
			queue.at(-1)();
			queue = [];
		}
	}
	function addFocusFn(fn) {
		if (waitFlags.length === 0) fn();
		else queue.push(fn);
	}
	function removeFocusFn(fn) {
		queue = queue.filter((entry) => entry !== fn);
	}
	var nodesList = [];
	var portalTypeList = [];
	var portalIndex = 1;
	var target = document.body;
	function createGlobalNode(id, portalType, parentEl) {
		const el = document.createElement("div");
		el.id = portalType !== void 0 ? `q-portal--${portalType}--${portalIndex++}` : id;
		if (globalConfig.globalNodes !== void 0) {
			const cls = globalConfig.globalNodes.class;
			if (cls !== void 0) el.className = cls;
		}
		(parentEl || target).append(el);
		nodesList.push(el);
		portalTypeList.push(portalType);
		return el;
	}
	function removeGlobalNode(el) {
		const nodeIndex = nodesList.indexOf(el);
		if (nodeIndex !== -1) {
			nodesList.splice(nodeIndex, 1);
			portalTypeList.splice(nodeIndex, 1);
		}
		el.remove();
	}
	/**
	* Re-appends the global nodes living directly under the current target, in
	* their creation order. Portals paint above a same-z-index sibling only while
	* they come later in the DOM, which holds naturally until something else gets
	* appended to <body> after them -- the fullscreen mixin does exactly that
	* with the element it detaches, burying every already-open popup (#18513).
	*/
	function bringGlobalNodesToFront() {
		const activeEl = document.activeElement;
		nodesList.forEach((node) => {
			if (node.parentElement === target) target.append(node);
		});
		if (activeEl !== null && activeEl !== document.activeElement && activeEl.isConnected) activeEl.focus({ preventScroll: true });
	}
	function changeGlobalNodesTarget(newTarget) {
		if (newTarget === target) return;
		target = newTarget;
		if (target === document.body || portalTypeList.reduce((acc, type) => type === "dialog" ? acc + 1 : acc, 0) < 2) {
			nodesList.forEach((node) => {
				if (!node.contains(target)) target.append(node);
			});
			return;
		}
		const lastDialogIndex = portalTypeList.lastIndexOf("dialog");
		for (let i = 0; i < nodesList.length; i++) {
			const el = nodesList[i];
			if ((i === lastDialogIndex || portalTypeList[i] !== "dialog") && !el.contains(target)) target.append(el);
		}
	}
	/**
	* Noop internal component to ease testing
	* of the teleported content.
	*
	* const wrapper = mount(QDialog, { ... })
	* const teleportedWrapper = wrapper.findComponent({ name: 'QPortal' })
	*/
	var QPortal = /*#__PURE__*/ createComponent({
		name: "QPortal",
		setup(_, { slots }) {
			return () => slots.default();
		}
	});
	function isOnGlobalDialog(vm) {
		vm = vm.parent;
		while (vm !== void 0 && vm !== null) {
			if (vm.type.name === "QGlobalDialog") return true;
			if (vm.type.name === "QDialog" || vm.type.name === "QMenu") return false;
			vm = vm.parent;
		}
		return false;
	}
	function getAriaModalEl(vm) {
		let node = vm.parent;
		while (node !== void 0 && node !== null) {
			if (node.type.name === "QDialog") {
				const el = node.proxy?.__getAriaModalEl?.();
				if (el !== null && el !== void 0) return el;
			}
			node = node.parent;
		}
		return null;
	}
	function usePortal(vm, innerRef, renderPortalContent, type) {
		const portalIsActive = /* @__PURE__ */ ref(false);
		let portalIsOpening = false;
		let portalEl = null;
		const focusObj = {};
		const onGlobalDialog = type === "dialog" && isOnGlobalDialog(vm);
		const notifiesField = type !== "tooltip";
		let fieldNotified = false;
		function notifyField(name) {
			vm.vnode.el?.dispatchEvent(new CustomEvent(name, { bubbles: true }));
		}
		function notifyFieldHide() {
			if (fieldNotified) {
				fieldNotified = false;
				notifyField("popup-hide");
			}
		}
		function showPortal(isReady, silent) {
			if (isReady) {
				removeFocusWaitFlag(focusObj);
				portalIsOpening = false;
				return;
			}
			portalIsOpening = true;
			if (!portalIsActive.value) {
				if (!onGlobalDialog && portalEl === null) {
					const modalEl = type === "menu" ? getAriaModalEl(vm) : null;
					portalEl = createGlobalNode(false, type, modalEl);
					if (modalEl !== null) portalEl.classList.add("all-pointer-events");
				}
				portalIsActive.value = true;
				portalProxyList.push(vm.proxy);
				addFocusWaitFlag(focusObj);
				if (notifiesField && !silent) {
					fieldNotified = true;
					notifyField("popup-show");
				}
			}
		}
		function hidePortal(isReady) {
			portalIsOpening = false;
			notifyFieldHide();
			if (!isReady) return;
			removeFocusWaitFlag(focusObj);
			portalIsActive.value = false;
			const index = portalProxyList.indexOf(vm.proxy);
			if (index !== -1) portalProxyList.splice(index, 1);
			if (portalEl !== null) {
				removeGlobalNode(portalEl);
				portalEl = null;
			}
		}
		onBeforeUnmount(notifyFieldHide);
		onUnmounted(() => {
			hidePortal(true);
		});
		vm.proxy.__qPortal = true;
		injectProp(vm.proxy, "contentEl", () => innerRef.value);
		return {
			showPortal,
			hidePortal,
			portalIsActive,
			portalIsOpening: () => portalIsOpening,
			renderPortal: () => onGlobalDialog ? renderPortalContent() : portalIsActive.value ? [h(Teleport, { to: portalEl }, h(QPortal, renderPortalContent))] : void 0
		};
	}
	function usePortalRefocus(props, isTakingFocus) {
		const { proxy } = getCurrentInstance();
		let refocusTarget = null;
		function captureRefocusTarget(skip) {
			refocusTarget = props.noRefocus || skip === true ? null : document.activeElement;
		}
		function setRefocusTarget(target) {
			refocusTarget = target || null;
		}
		function clearRefocusTarget() {
			refocusTarget = null;
		}
		function resolveTarget(evt) {
			return (evt?.type.indexOf("key") === 0 ? refocusTarget.closest("[tabindex]:not([tabindex^=\"-\"])") : void 0) || refocusTarget;
		}
		function restoreFocus(evt) {
			if (refocusTarget === null) return;
			const target = resolveTarget(evt);
			refocusTarget = null;
			const index = portalProxyList.indexOf(proxy);
			if (index !== -1) {
				for (let i = portalProxyList.length - 1; i > index; i--) if (portalProxyList[i].__adoptRefocusTarget?.(target, proxy.contentEl) === true) return;
			}
			addFocusFn(() => {
				if (target.isConnected) refocus(target);
			});
		}
		function restoreFocusSync(evt) {
			if (refocusTarget === null) return;
			if (refocusTarget.isConnected) refocus(resolveTarget(evt));
			refocusTarget = null;
		}
		function adoptRefocusTarget(target, donorEl) {
			if (!isTakingFocus()) return false;
			if (!props.noRefocus && (refocusTarget === null || donorEl?.contains(refocusTarget) === true)) refocusTarget = target;
			return true;
		}
		return {
			captureRefocusTarget,
			setRefocusTarget,
			clearRefocusTarget,
			restoreFocus,
			restoreFocusSync,
			adoptRefocusTarget
		};
	}
	var useTransitionProps = {
		transitionShow: {
			type: String,
			default: "fade"
		},
		transitionHide: {
			type: String,
			default: "fade"
		},
		transitionDuration: {
			type: [String, Number],
			default: 300
		}
	};
	var transitionPropsCache = /* @__PURE__ */ new Map();
	function useTransition(props, defaultShowFn = () => {}, defaultHideFn = () => {}) {
		return {
			transitionProps: () => {
				const show = props.transitionShow || defaultShowFn();
				const hide = props.transitionHide || defaultHideFn();
				const key = `${show}|${hide}`;
				let target = transitionPropsCache.get(key);
				if (target === void 0) {
					if (transitionPropsCache.size > 200) transitionPropsCache.clear();
					const showCls = `q-transition--${show}`;
					const hideCls = `q-transition--${hide}`;
					target = {
						appear: true,
						enterFromClass: `${showCls}-enter-from`,
						enterActiveClass: `${showCls}-enter-active`,
						enterToClass: `${showCls}-enter-to`,
						leaveFromClass: `${hideCls}-leave-from`,
						leaveActiveClass: `${hideCls}-leave-active`,
						leaveToClass: `${hideCls}-leave-to`
					};
					transitionPropsCache.set(key, target);
				}
				return target;
			},
			transitionStyle: () => `--q-transition-duration: ${props.transitionDuration}ms`
		};
	}
	function useTick() {
		let tickFn;
		const vm = getCurrentInstance();
		function removeTick() {
			tickFn = void 0;
		}
		if (vm !== null) {
			onDeactivated(removeTick);
			onBeforeUnmount(removeTick);
		}
		return {
			removeTick,
			registerTick(fn) {
				tickFn = fn;
				nextTick(() => {
					if (tickFn === fn) {
						if (vm === null || !vmIsDestroyed(vm)) tickFn();
						tickFn = void 0;
					}
				});
			}
		};
	}
	function useTimeout() {
		const isTimeoutPending = /* @__PURE__ */ ref(false);
		let timer = null;
		const vm = getCurrentInstance();
		function removeTimeout() {
			if (timer !== null) {
				clearTimeout(timer);
				timer = null;
				isTimeoutPending.value = false;
			}
		}
		if (vm !== null) {
			onDeactivated(removeTimeout);
			onBeforeUnmount(removeTimeout);
		}
		return {
			isTimeoutPending,
			removeTimeout,
			registerTimeout(fn, delay) {
				if (vm !== null && vmIsDestroyed(vm)) return;
				removeTimeout();
				isTimeoutPending.value = true;
				timer = setTimeout(() => {
					timer = null;
					isTimeoutPending.value = false;
					fn();
				}, delay);
			}
		};
	}
	function useTransitionEnd(props) {
		const { registerTimeout, removeTimeout } = useTimeout();
		let finishTransition = null;
		onDeactivated(() => {
			finishTransition?.();
		});
		return {
			registerTimeout,
			removeTimeout,
			registerTransitionEnd(fn) {
				finishTransition = () => {
					finishTransition = null;
					fn();
				};
				registerTimeout(finishTransition, props.transitionDuration);
			}
		};
	}
	var useHoverProps = {
		hover: Boolean,
		hoverDelay: {
			type: Number,
			default: 0
		},
		hoverHideDelay: {
			type: Number,
			default: 150
		}
	};
	function useHover({ props, canShow, show, canHide, hide }) {
		const { removeTimeout, registerTimeout } = useTimeout();
		function hoverShow(evt) {
			if (props.hover !== true || evt.pointerType === "touch") return;
			removeTimeout();
			if (!canShow(evt)) return;
			if (props.hoverDelay > 0) registerTimeout(() => {
				show(evt);
			}, props.hoverDelay);
			else show(evt);
		}
		function scheduleHoverHide(evt) {
			removeTimeout();
			if (!canHide(evt)) return;
			registerTimeout(() => {
				hide(evt);
			}, props.hoverHideDelay);
		}
		function hoverHide(evt) {
			if (props.hover !== true || evt.pointerType === "touch") return;
			scheduleHoverHide(evt);
		}
		function onHoverContentEnter(evt) {
			if (evt.pointerType !== "touch") removeTimeout();
		}
		return {
			clearHoverTimer: removeTimeout,
			hoverShow,
			hoverHide,
			scheduleHoverHide,
			onHoverContentEnter
		};
	}
	var partsFirst = [
		"top",
		"center",
		"bottom"
	];
	var partsSecond = [
		"left",
		"middle",
		"right",
		"start",
		"end"
	];
	/**
	* Decides which of the two positioning engines drives a popup:
	* anchor-engine.js (native CSS anchor positioning, zero
	* listeners) where this is true, fallback-engine.js
	* (measure + pixel insets, scroll listeners) everywhere else.
	*
	* The native path is deliberately gated to Chromium engines (identified
	* through the Chromium-only userAgentData API): it is the only family
	* where the anchor engine was validated, while the fresh Gecko/WebKit
	* implementations (Baseline newly available 2026) stay on the battle
	* tested JS engine, like every browser without the feature.
	*
	* Resolved once at import (the typeof guard covers DOM-less imports
	* such as jsdom, which lands on the fallback engine); the component
	* tests re-mock this module with a getter to force the fallback engine
	* per test.
	*/
	var cssAnchorSupport = typeof CSS !== "undefined" && navigator.userAgentData?.brands?.some((entry) => entry.brand === "Chromium") === true && CSS.supports("position-anchor: --q") && CSS.supports("justify-self: anchor-center");
	function validatePosition(pos) {
		const parts = pos.split(" ");
		if (parts.length !== 2) return false;
		if (!partsFirst.includes(parts[0])) {
			console.error("Anchor/Self position must start with one of top/center/bottom");
			return false;
		}
		if (!partsSecond.includes(parts[1])) {
			console.error("Anchor/Self position must end with one of left/middle/right/start/end");
			return false;
		}
		return true;
	}
	function validateOffset(val) {
		if (!val) return true;
		if (val.length !== 2) return false;
		if (typeof val[0] !== "number" || typeof val[1] !== "number") return false;
		return true;
	}
	var horizontalPos = {
		"start#ltr": "left",
		"start#rtl": "right",
		"end#ltr": "right",
		"end#rtl": "left"
	};
	[
		"left",
		"middle",
		"right"
	].forEach((pos) => {
		horizontalPos[`${pos}#ltr`] = pos;
		horizontalPos[`${pos}#rtl`] = pos;
	});
	var positionCache = /* @__PURE__ */ new Map();
	function parsePosition(pos, rtl) {
		const key = `${pos}#${rtl ? "rtl" : "ltr"}`;
		let res = positionCache.get(key);
		if (res === void 0) {
			const parts = pos.split(" ");
			res = {
				vertical: parts[0],
				horizontal: horizontalPos[`${parts[1]}#${rtl ? "rtl" : "ltr"}`]
			};
			positionCache.set(key, res);
		}
		return res;
	}
	/**
	* The placement decision both engines share: whether the intended
	* placement fits the viewport, measured once per show (and on demand
	* through updatePosition()). A placement that overflows gets its
	* origins mirrored towards the roomier side — the anchor's expanded box
	* edges swap sides — unless the intended side has at least as much room
	* (the room is measured from the anchor line each placement would use,
	* not from the anchor's edge against the viewport middle, which used
	* to flip an anchor straddling the middle towards the SMALLER side,
	* #16443) and a max size capped to that space, whether or not its
	* natural size already fit there: content can grow after this pass,
	* and the flipped side has already anchored the popup's far edge, so a
	* popup left uncapped there would grow past the opposite viewport edge
	* with no scroll position able to reveal the overflow (#18536). The cap
	* is the fractional space itself (getBoundingClientRect), never the
	* popup's own measured size, so it never rounds a fractional natural
	* size down (offsetWidth/offsetHeight are integers) and wraps or
	* scrolls content that fit before the flip; and it is combined (CSS
	* min()) with the bound the popup already has, read as the computed
	* max size once the previous caps are lifted: a max-height/max-width
	* prop, the popups' own stylesheet ceilings or the app's CSS. An inline
	* cap replaces them all, so a flip towards a side roomier than that
	* bound would otherwise widen the popup past it. How the returned
	* origins/caps are then EXPRESSED is the engines'
	* business: anchor() insets on the native engine, pixel insets on the
	* fallback; either way the popup keeps tracking its anchor and only the
	* flip/cap decision itself is frozen at measure time. The element does
	* leave the pass already at the decided caps though: measuring lifts
	* them, content that then fits has its scroll offset clamped to 0 by
	* layout, and the engines restore the offset right after the pass
	* (#18534), which needs the popup scrollable again by then (the native
	* engine's own expression of the caps only lands on the next render).
	*
	* A "center"/"middle" self origin axis is skipped: when its anchor line
	* is centered too it clamps at the viewport edges instead (natively via
	* anchor-center, mirrored by the fallback engine), otherwise it is a
	* niche combination not worth the handling.
	*/
	function applyBoundary({ el, anchorEl, anchorOrigin, selfOrigin, offset, cover, maxHeight, maxWidth }) {
		el.style.maxHeight = maxHeight || "";
		el.style.maxWidth = maxWidth || "";
		el.style.visibility = "";
		const { offsetWidth: width, offsetHeight: height } = el;
		const bound = getComputedStyle(el);
		const rect = anchorEl.getBoundingClientRect();
		const [ox, oy] = offset !== void 0 && cover !== true ? offset : [0, 0];
		const A = {
			top: rect.top - oy,
			bottom: rect.bottom + oy,
			center: rect.top + (rect.bottom - rect.top) / 2,
			left: rect.left - ox,
			right: rect.right + ox,
			middle: rect.left + (rect.right - rect.left) / 2
		};
		const { clientWidth: VW, clientHeight: VH } = document.documentElement;
		const res = {
			anchorOrigin,
			selfOrigin,
			maxHeight: null,
			maxWidth: null
		};
		let av = anchorOrigin.vertical, sv = selfOrigin.vertical, ah = anchorOrigin.horizontal, sh = selfOrigin.horizontal, changed = false;
		if (sv !== "center") {
			const top = A[av] - (sv === "bottom" ? height : 0);
			if (top < 0 || top + height > VH) {
				changed = true;
				const [avBelow, avAbove] = av === "center" ? ["center", "center"] : av === sv ? ["top", "bottom"] : ["bottom", "top"];
				const spaceBelow = VH - Math.max(0, A[avBelow]);
				const spaceAbove = Math.min(VH, A[avAbove]);
				let space;
				if (sv === "top" ? spaceBelow >= spaceAbove : spaceBelow > spaceAbove) {
					av = avBelow;
					sv = "top";
					space = spaceBelow;
				} else {
					av = avAbove;
					sv = "bottom";
					space = spaceAbove;
				}
				res.maxHeight = bound.maxHeight === "none" ? `${space}px` : `min(${space}px, ${bound.maxHeight})`;
			}
		}
		if (sh !== "middle") {
			const left = A[ah] - (sh === "right" ? width : 0);
			if (left < 0 || left + width > VW) {
				changed = true;
				const [ahRight, ahLeft] = ah === "middle" ? ["middle", "middle"] : ah === sh ? ["left", "right"] : ["right", "left"];
				const spaceRight = VW - Math.max(0, A[ahRight]);
				const spaceLeft = Math.min(VW, A[ahLeft]);
				let space;
				if (sh === "left" ? spaceRight >= spaceLeft : spaceRight > spaceLeft) {
					ah = ahRight;
					sh = "left";
					space = spaceRight;
				} else {
					ah = ahLeft;
					sh = "right";
					space = spaceLeft;
				}
				res.maxWidth = bound.maxWidth === "none" ? `${space}px` : `min(${space}px, ${bound.maxWidth})`;
			}
		}
		if (changed) {
			res.anchorOrigin = {
				vertical: av,
				horizontal: ah
			};
			res.selfOrigin = {
				vertical: sv,
				horizontal: sh
			};
		}
		if (res.maxHeight !== null) el.style.maxHeight = res.maxHeight;
		if (res.maxWidth !== null) el.style.maxWidth = res.maxWidth;
		return res;
	}
	/**
	* The offset a point-mode axis applies: unlike box mode, where the
	* offset expands the anchor's box, here it displaces the popup from the
	* point in the direction the popup grows, so it clears the pointer on
	* whichever side it opens. A centered axis straddles the point and has
	* no growth direction, so it takes the positive one, where a cursor
	* glyph's body sits relative to its hotspot.
	*/
	function pointOffset(self, offset) {
		return self === "bottom" || self === "right" ? -offset : offset;
	}
	/**
	* Point-mode companion of applyBoundary, for a popup opening from a
	* coordinate inside its anchor (touch position / cursor position /
	* context menu): an overflowing side mirrors around the point, which
	* stays put because the offset re-signs itself with the flipped origin.
	* A center/middle self origin axis has no other side to mirror to and
	* shifts to stay inside the viewport instead, mirroring what
	* applyBoundary's centered axes get natively from anchor-center.
	* Returns null while the placement needs no correction, otherwise the
	* resolved selfOrigin plus the point (only a centered axis moves it).
	*/
	function applyPointBoundary({ el, anchorEl, point, selfOrigin, offset }) {
		const { offsetWidth: width, offsetHeight: height } = el;
		const rect = anchorEl.getBoundingClientRect();
		const { clientWidth: VW, clientHeight: VH } = document.documentElement;
		const [ox = 0, oy = 0] = offset ?? [];
		let { vertical, horizontal } = selfOrigin;
		const res = {
			top: point.top,
			left: point.left
		};
		let changed = false;
		const lineY = rect.top + point.top + pointOffset(vertical, oy);
		if (vertical === "center") {
			const top = lineY - height / 2;
			const shift = Math.max(0, Math.min(top, VH - height)) - top;
			if (shift !== 0) {
				res.top += shift;
				changed = true;
			}
		} else if (vertical === "top" && lineY + height > VH) {
			vertical = "bottom";
			changed = true;
		} else if (vertical === "bottom" && lineY - height < 0) {
			vertical = "top";
			changed = true;
		}
		const lineX = rect.left + point.left + pointOffset(horizontal, ox);
		if (horizontal === "middle") {
			const left = lineX - width / 2;
			const shift = Math.max(0, Math.min(left, VW - width)) - left;
			if (shift !== 0) {
				res.left += shift;
				changed = true;
			}
		} else if (horizontal === "left" && lineX + width > VW) {
			horizontal = "right";
			changed = true;
		} else if (horizontal === "right" && lineX - width < 0) {
			horizontal = "left";
			changed = true;
		}
		return changed ? {
			selfOrigin: {
				vertical,
				horizontal
			},
			point: res
		} : null;
	}
	/**
	* Both engines' boundary pass measures with the size caps lifted, which
	* clamps the scroll offset of content that fits meanwhile (#18534);
	* they put it back right after.
	*/
	function restoreScroll(el, scrollTop, scrollLeft) {
		if (el.scrollTop !== scrollTop) el.scrollTop = scrollTop;
		if (el.scrollLeft !== scrollLeft) el.scrollLeft = scrollLeft;
	}
	/**
	* The native positioning engine: expresses a popup's placement through
	* CSS anchor positioning (position-anchor + anchor()/anchor-size()
	* insets), so the browser keeps it glued to its anchor through any
	* scroll, layout shift, resize or animation with zero listeners.
	*
	* Only used where core.js' cssAnchorSupport says so;
	* every other browser runs fallback-engine.js instead.
	*/
	/**
	* The browser tracks a CSS anchor for us, but `anchor-name` must live on
	* the anchor element itself, which is app-owned DOM. Popups therefore
	* borrow the element through this refcounted registry: the first popup
	* on an element names it, later ones reuse the name, and the last one
	* out restores whatever inline value the app had there.
	*/
	var anchorNames = /* @__PURE__ */ new Map();
	var anchorUid = 0;
	function setAnchorName(el) {
		let entry = anchorNames.get(el);
		if (entry === void 0) {
			entry = {
				name: `--q-pe-${++anchorUid}`,
				count: 0,
				prev: el.style.getPropertyValue("anchor-name")
			};
			anchorNames.set(el, entry);
			el.style.setProperty("anchor-name", entry.name);
		}
		entry.count++;
		return entry.name;
	}
	function removeAnchorName(el) {
		const entry = anchorNames.get(el);
		if (entry === void 0) return;
		entry.count--;
		if (entry.count === 0) {
			anchorNames.delete(el);
			if (entry.prev === "") el.style.removeProperty("anchor-name");
			else el.style.setProperty("anchor-name", entry.prev);
		}
	}
	var anchorLine = {
		top: "top",
		center: "center",
		bottom: "bottom",
		left: "left",
		middle: "center",
		right: "right"
	};
	function calcExpr(line, delta) {
		return delta === 0 ? `anchor(${line})` : `calc(anchor(${line}) ${delta > 0 ? "+" : "-"} ${Math.abs(delta)}px)`;
	}
	/**
	* One axis of the positioning recipe. Writing the primary inset from the
	* axis start (top/left) makes the box grow towards the axis end and vice
	* versa; a "center" self origin with a matching "center" anchor line uses
	* native clamped centering (anchor-center), while a "center" self on an
	* edge line falls back to a -50% translate.
	*
	* `offset` pushes the anchor line outwards, exactly like the fallback
	* engine's virtual anchor-rect expansion: edge lines move by the offset,
	* center lines don't move at all.
	*/
	function applyAxis(style, { line, self, offset, start, end, alignProp }) {
		if (self === "center" || self === "middle") {
			if (line === "center" || line === "middle") {
				style[start] = "0px";
				style[end] = "0px";
				style[alignProp] = "anchor-center";
				return false;
			}
			style[start] = calcExpr(anchorLine[line], 0);
			return true;
		}
		const growsFromStart = self === "top" || self === "left";
		const edgeDelta = line === "center" || line === "middle" ? 0 : (line === "top" || line === "left" ? -1 : 1) * offset;
		if (growsFromStart) style[start] = calcExpr(anchorLine[line], edgeDelta);
		else style[end] = calcExpr(anchorLine[line], -edgeDelta);
		return false;
	}
	/**
	* Computes the CSS for a popup positioned through native CSS anchor
	* positioning. The returned styles are static: from here on the browser
	* keeps the popup glued to its anchor through any scroll, layout shift
	* or resize with no listeners involved. Whether the placement FITS is
	* decided separately (applyBoundary) and fed back in through the
	* origins/max caps.
	*
	* `point` positions relative to a coordinate inside the anchor (touch
	* position / context menu) instead of the anchor's box.
	*/
	function getPositionStyle({ anchorName, anchorOrigin, selfOrigin, offset, point, fit, cover, maxHeight, maxWidth }) {
		const style = {
			positionAnchor: anchorName,
			top: null,
			right: null,
			bottom: null,
			left: null,
			translate: null,
			alignSelf: null,
			justifySelf: null,
			minWidth: null,
			minHeight: null,
			maxWidth: maxWidth || null,
			maxHeight: maxHeight || null
		};
		const ox = offset !== void 0 && !cover ? offset[0] : 0;
		const oy = offset !== void 0 && !cover ? offset[1] : 0;
		if (fit || cover) {
			style.minWidth = maxWidth !== null && maxWidth !== void 0 ? `min(anchor-size(width), ${maxWidth})` : "anchor-size(width)";
			if (cover) style.minHeight = maxHeight !== null && maxHeight !== void 0 ? `min(anchor-size(height), ${maxHeight})` : "anchor-size(height)";
		}
		if (point !== void 0) {
			const top = point.top + pointOffset(selfOrigin.vertical, oy), left = point.left + pointOffset(selfOrigin.horizontal, ox);
			if (selfOrigin.vertical === "bottom") style.bottom = calcExpr("top", -top);
			else style.top = calcExpr("top", top);
			if (selfOrigin.horizontal === "right") style.right = calcExpr("left", -left);
			else style.left = calcExpr("left", left);
			if (selfOrigin.horizontal === "middle" || selfOrigin.vertical === "center") style.translate = `${selfOrigin.horizontal === "middle" ? "-50%" : "0px"} ${selfOrigin.vertical === "center" ? "-50%" : "0px"}`;
			return style;
		}
		const vTranslate = applyAxis(style, {
			line: anchorOrigin.vertical,
			self: selfOrigin.vertical,
			offset: oy,
			start: "top",
			end: "bottom",
			alignProp: "alignSelf"
		});
		const hTranslate = applyAxis(style, {
			line: anchorOrigin.horizontal,
			self: selfOrigin.horizontal,
			offset: ox,
			start: "left",
			end: "right",
			alignProp: "justifySelf"
		});
		if (vTranslate || hTranslate) style.translate = `${hTranslate ? "-50%" : "0px"} ${vTranslate ? "-50%" : "0px"}`;
		return style;
	}
	/**
	* Native CSS anchor positioning: the browser owns the tracking and JS
	* only decides the placement (once per show, on demand through
	* updatePosition() and on screen/placement-prop changes).
	*/
	function useCssAnchorEngine(props, { anchorEl, innerRef, anchorOrigin, selfOrigin }) {
		let namedAnchorEl = null;
		const anchorName = /* @__PURE__ */ ref("");
		const anchorPoint = /* @__PURE__ */ ref(null);
		const pointBoundary = /* @__PURE__ */ ref(null);
		const boundary = /* @__PURE__ */ ref(null);
		const positioned = /* @__PURE__ */ ref(false);
		const positionStyle = computed(() => {
			if (anchorName.value === "") return "";
			const b = anchorPoint.value === null ? boundary.value : null;
			const p = anchorPoint.value !== null ? pointBoundary.value : null;
			const style = getPositionStyle({
				anchorName: anchorName.value,
				anchorOrigin: b !== null ? b.anchorOrigin : anchorOrigin.value,
				selfOrigin: p !== null ? p.selfOrigin : b !== null ? b.selfOrigin : selfOrigin.value,
				offset: props.offset,
				point: p !== null ? p.point : anchorPoint.value ?? void 0,
				fit: props.fit,
				cover: props.cover,
				maxHeight: props.maxHeight,
				maxWidth: props.maxWidth
			});
			if (b !== null) {
				if (b.maxHeight !== null) style.maxHeight = b.maxHeight;
				if (b.maxWidth !== null) style.maxWidth = b.maxWidth;
			}
			if (!positioned.value) style.visibility = "hidden";
			return style;
		});
		const acquireAnchorName = () => {
			if (namedAnchorEl === anchorEl.value) return;
			releaseAnchor(false);
			namedAnchorEl = anchorEl.value;
			anchorName.value = setAnchorName(namedAnchorEl);
		};
		const updatePosition = () => {
			if (anchorEl.value === null) return;
			acquireAnchorName();
			const el = innerRef.value;
			if (el === null) return;
			if (anchorPoint.value === null) {
				const { scrollTop, scrollLeft } = el;
				boundary.value = applyBoundary({
					el,
					anchorEl: anchorEl.value,
					anchorOrigin: anchorOrigin.value,
					selfOrigin: selfOrigin.value,
					offset: props.offset,
					cover: props.cover,
					maxHeight: props.maxHeight,
					maxWidth: props.maxWidth
				});
				restoreScroll(el, scrollTop, scrollLeft);
			} else {
				el.style.visibility = "";
				pointBoundary.value = applyPointBoundary({
					el,
					anchorEl: anchorEl.value,
					point: anchorPoint.value,
					selfOrigin: selfOrigin.value,
					offset: props.offset
				});
			}
			positioned.value = true;
		};
		const releaseAnchor = (hidingInProgress) => {
			if (!hidingInProgress) {
				if (namedAnchorEl !== null) {
					removeAnchorName(namedAnchorEl);
					namedAnchorEl = null;
				}
				anchorName.value = "";
			}
		};
		return {
			positionStyle,
			updatePosition,
			handleTick: updatePosition,
			releaseAnchor,
			setAnchorPoint(point) {
				anchorPoint.value = point;
				pointBoundary.value = null;
			},
			handleShow() {
				anchorPoint.value = null;
				pointBoundary.value = null;
				boundary.value = null;
				positioned.value = false;
				if (anchorEl.value !== null) acquireAnchorName();
			}
		};
	}
	/**
	* Registry of elements that have been detached from their original DOM
	* position. Currently only useSoftFullscreen() does this: it moves the element
	* to <body> so that the fullscreen mixin can escape ancestor overflow,
	* transform and stacking contexts.
	*
	* The key is the filler node that the mover leaves behind at the original
	* position -- once the element is gone it is the only stable handle to where
	* the element logically belongs. The value is the component proxy rather than
	* a captured $el, so that the component's current root is read at test time
	* instead of a possibly stale reference.
	*/
	var detachedMap = /* @__PURE__ */ new Map();
	/**
	* Registry-change listeners. An anchored popup that is open while its anchor's
	* subtree gets detached (or restored) has stale geometry and a stale scroll
	* target; it subscribes here to know when to re-measure (#18513). Listeners
	* run synchronously, before the exit path restores the element -- schedule any
	* DOM measurement instead of measuring inside the listener. Notification runs
	* over a snapshot, so a listener may safely un/subscribe from within.
	*/
	var listeners = [];
	function addDetachedFullscreenListener(fn) {
		listeners.push(fn);
	}
	function removeDetachedFullscreenListener(fn) {
		const index = listeners.indexOf(fn);
		if (index !== -1) listeners.splice(index, 1);
	}
	function notifyListeners() {
		for (const fn of listeners.slice()) fn();
	}
	function addDetachedFullscreen(fillerNode, getEl) {
		detachedMap.set(fillerNode, getEl);
		notifyListeners();
	}
	function removeDetachedFullscreen(fillerNode) {
		if (detachedMap.delete(fillerNode)) notifyListeners();
	}
	function fillerNodeFor(el) {
		for (const [fillerNode, getEl] of detachedMap) if (getEl().contains(el) === true) return fillerNode;
	}
	/**
	* Tells if el sits inside an element that was detached from somewhere within
	* rootEl, which makes it a logical -- but no longer physical -- child. The
	* `owns` test decides whether a filler node belongs to rootEl, so that each
	* variant below agrees with the physical containment test it complements at
	* its call sites.
	*
	* Walks the filler chain instead of testing a single hop, so that an element
	* detached from inside another detached element resolves as well.
	*/
	function isInDetachedFullscreen(rootEl, el, owns) {
		if (rootEl === void 0 || rootEl === null) return false;
		const visited = /* @__PURE__ */ new Set();
		for (let node = fillerNodeFor(el); node !== void 0 && !visited.has(node); node = fillerNodeFor(node)) {
			if (owns(rootEl, node) === true) return true;
			visited.add(node);
		}
		return false;
	}
	/**
	* Focus-trap variant (QDialog trap, QMenu focusout recapture): ownership via
	* childHasFocus(), which also owns later siblings -- matching how those traps
	* treat sibling portal nodes. A false positive only makes a trap fire less.
	*/
	function focusIsInDetachedFullscreen(rootEl, focusedEl) {
		return isInDetachedFullscreen(rootEl, focusedEl, childHasFocus);
	}
	function strictlyContains(rootEl, node) {
		return rootEl.contains(node);
	}
	/**
	* Pointer variant (click-outside, #18512): ownership via strict containment,
	* matching click-outside's own anchorEl/innerRef .contains() tests. The
	* sibling widening above must not leak here: an element detached from a later
	* *sibling* of a popup is genuinely outside it, and a click inside that
	* element still has to close the popup.
	*/
	function clickIsInDetachedFullscreen(rootEl, targetEl) {
		return isInDetachedFullscreen(rootEl, targetEl, strictlyContains);
	}
	/**
	* One capture-phase document listener tracks every scrolling container
	* at once — nested ones included, which per-container listeners could
	* never cover — and fans out to the subscribers (popups re-expressing
	* their frozen placement, QParallax recomputing its scroll percentage).
	* A subscriber that positions its own content filters out the scrolls
	* originating inside it (they never move it).
	*/
	var scrollSubscribers = /* @__PURE__ */ new Set();
	function onViewportMove(evt) {
		scrollSubscribers.forEach((fn) => {
			fn(evt);
		});
	}
	function changeGlobalListeners(fnProp) {
		document[fnProp]("scroll", onViewportMove, listenOpts.passiveCapture);
		if (client.is.ios) {
			window.visualViewport?.[fnProp]("scroll", onViewportMove, listenOpts.passive);
			window.visualViewport?.[fnProp]("resize", onViewportMove, listenOpts.passive);
		}
	}
	function addScrollTracking(fn) {
		if (scrollSubscribers.size === 0) changeGlobalListeners("addEventListener");
		scrollSubscribers.add(fn);
	}
	function removeScrollTracking(fn) {
		if (scrollSubscribers.delete(fn) && scrollSubscribers.size === 0) changeGlobalListeners("removeEventListener");
	}
	/**
	* The JS positioning engine: expresses a placement decided by the
	* shared boundary pass (core.js) through pixel insets, written from
	* the edge the self origin anchors (top or bottom, left or right) like
	* the native engine's anchor() insets, so content that grows between
	* two passes grows away from the anchor line instead of over it; a
	* centered self origin straddles its line through a -50% translate
	* (anchor-center / translate natively).
	* A written position is only valid for the moment it was
	* computed, so its callers re-express the SAME frozen placement
	* (applyPosition) on every scroll step (private.scroll-tracking) and
	* on anchor motion (trackAnchorMotion) — the popup stays glued to its
	* anchor and scrolls off-screen with it, exactly like the native
	* engine's; only viewport/placement-prop changes re-open the decision.
	*
	* Serves every browser outside core.js' cssAnchorSupport
	* gate; the ones inside it run anchor-engine.js instead.
	*/
	var vpLeft;
	var vpTop;
	/**
	* Writes the pixel styles for one placement pass. anchorOrigin/
	* selfOrigin arrive decision-resolved (post applyBoundary /
	* applyPointBoundary) and capHeight/capWidth carry the decision's size
	* caps; maxHeight/maxWidth stay the raw props, which alone bound the
	* fit/cover minimum sizes (mirroring the native engine, where the
	* min() expressions are built from the props while the caps overwrite
	* only the max sizes).
	*
	* A centered popup on a centered anchor line (anchor-center on the
	* native engine) shifts to stay inside the viewport, but the browser
	* computes that shift at LAYOUT time only: scrolling merely translates
	* the popup 1:1 with its anchor afterwards. Mirrored here through
	* `centerShift`: a decision pass (null) computes and returns the
	* shift, a tracking pass re-applies the frozen one it is handed.
	*
	* `point` positions relative to a coordinate inside the anchor (touch
	* position / context menu) instead of the anchor's box.
	*/
	function applyPosition({ targetEl: el, anchorEl, anchorOrigin, selfOrigin, offset, point, fit, cover, maxHeight, maxWidth, capHeight, capWidth, centerShift = null }) {
		if (client.is.ios) {
			const bodyStyle = document.body.style;
			const { offsetLeft: left = 0, offsetTop: top = 0 } = window.visualViewport ?? {};
			if (left !== vpLeft) {
				bodyStyle.setProperty("--q-pe-left", left + "px");
				vpLeft = left;
			}
			if (top !== vpTop) {
				bodyStyle.setProperty("--q-pe-top", top + "px");
				vpTop = top;
			}
		}
		const rect = anchorEl.getBoundingClientRect();
		const useOffset = offset !== void 0 && cover !== true;
		const ox = useOffset ? offset[0] : 0;
		const oy = useOffset ? offset[1] : 0;
		const style = {
			visibility: "visible",
			maxHeight: capHeight ?? maxHeight,
			maxWidth: capWidth ?? maxWidth,
			minWidth: null,
			minHeight: null
		};
		if (fit === true || cover === true) {
			style.minWidth = maxWidth ? `min(${rect.width}px, ${maxWidth})` : rect.width + "px";
			if (cover === true) style.minHeight = maxHeight ? `min(${rect.height}px, ${maxHeight})` : rect.height + "px";
		}
		Object.assign(el.style, style);
		const { offsetWidth: width, offsetHeight: height } = el;
		const { clientWidth: VW, clientHeight: VH } = document.documentElement;
		const shift = {
			top: 0,
			left: 0
		};
		let lineY, lineX;
		if (point !== void 0) {
			lineY = rect.top + point.top + pointOffset(selfOrigin.vertical, oy);
			lineX = rect.left + point.left + pointOffset(selfOrigin.horizontal, ox);
		} else {
			const A = {
				top: rect.top - oy,
				bottom: rect.bottom + oy,
				center: rect.top + (rect.bottom - rect.top) / 2,
				left: rect.left - ox,
				right: rect.right + ox,
				middle: rect.left + (rect.right - rect.left) / 2
			};
			lineY = A[anchorOrigin.vertical];
			lineX = A[anchorOrigin.horizontal];
		}
		const pos = {
			top: "",
			bottom: "",
			left: "",
			right: ""
		};
		let tx = "0", ty = "0";
		if (selfOrigin.vertical === "center") {
			if (point === void 0 && anchorOrigin.vertical === "center") {
				const top = lineY - height / 2;
				shift.top = centerShift !== null ? centerShift.top : Math.max(0, Math.min(top, VH - height)) - top;
			}
			pos.top = lineY + shift.top + "px";
			ty = "-50%";
		} else if (selfOrigin.vertical === "bottom") pos.bottom = VH - lineY + "px";
		else pos.top = lineY + "px";
		if (selfOrigin.horizontal === "middle") {
			if (point === void 0 && anchorOrigin.horizontal === "middle") {
				const left = lineX - width / 2;
				shift.left = centerShift !== null ? centerShift.left : Math.max(0, Math.min(left, VW - width)) - left;
			}
			pos.left = lineX + shift.left + "px";
			tx = "-50%";
		} else if (selfOrigin.horizontal === "right") pos.right = VW - lineX + "px";
		else pos.left = lineX + "px";
		pos.translate = tx === "0" && ty === "0" ? "" : `${tx} ${ty}`;
		Object.assign(el.style, pos);
		return shift;
	}
	/**
	* Follows an anchor that is still moving while its popup opens — e.g. a
	* push QBtn springing back from its :active translateY, released by the
	* very click that opens the menu. The popup only measures the anchor at
	* show time and again when the enter transition ends, so a rect that
	* settles in between would land as a visible position snap at the end
	* of the transition (and QTooltip has no end-of-transition re-measure
	* at all).
	*
	* Re-measures the anchor every animation frame for the given duration
	* and invokes onMove only on frames where the rect actually changed;
	* idle frames cost a single clean-layout getBoundingClientRect() read.
	* Stops itself if the anchor goes away. Returns a stop function.
	*/
	function trackAnchorMotion(getAnchorEl, onMove, duration) {
		const stopTime = performance.now() + Number(duration);
		let el = getAnchorEl();
		let prevRect = el === null ? null : el.getBoundingClientRect();
		let rafId = requestAnimationFrame(function step() {
			rafId = null;
			el = getAnchorEl();
			if (el === null || !el.isConnected) return;
			const rect = el.getBoundingClientRect();
			if (prevRect !== null && (rect.top !== prevRect.top || rect.left !== prevRect.left || rect.width !== prevRect.width || rect.height !== prevRect.height)) onMove();
			prevRect = rect;
			if (performance.now() < stopTime) rafId = requestAnimationFrame(step);
		});
		return () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		};
	}
	/**
	* The JS fallback: pixel insets, re-expressed on every scroll step
	* and anchor move; the placement decision itself has the same
	* lifecycle as the native engine's.
	*/
	function useFallbackEngine(props, { anchorEl, innerRef, showing, anchorOrigin, selfOrigin, trackContent }) {
		let observer, stopAnchorTracking, anchorPoint = null, pointBoundary = null, boundary = null, centerShift = null, retries = 0;
		const track = () => {
			if (innerRef.value === null || anchorEl.value === null) return;
			const b = anchorPoint === null ? boundary : null;
			const p = anchorPoint !== null ? pointBoundary : null;
			centerShift = applyPosition({
				targetEl: innerRef.value,
				anchorEl: anchorEl.value,
				anchorOrigin: b !== null ? b.anchorOrigin : anchorOrigin.value,
				selfOrigin: p !== null ? p.selfOrigin : b !== null ? b.selfOrigin : selfOrigin.value,
				offset: props.offset,
				point: p !== null ? p.point : anchorPoint ?? void 0,
				fit: props.fit,
				cover: props.cover,
				maxHeight: props.maxHeight,
				maxWidth: props.maxWidth,
				capHeight: b !== null ? b.maxHeight : null,
				capWidth: b !== null ? b.maxWidth : null,
				centerShift
			});
		};
		const updatePosition = () => {
			const el = innerRef.value;
			if (el === null || anchorEl.value === null) return;
			if (el.offsetWidth === 0 || el.offsetHeight === 0) {
				if (retries < 5) {
					retries++;
					setTimeout(updatePosition, 10);
				}
				return;
			}
			retries = 0;
			const { scrollTop, scrollLeft } = el;
			if (anchorPoint === null) {
				boundary = null;
				centerShift = null;
				track();
				boundary = applyBoundary({
					el,
					anchorEl: anchorEl.value,
					anchorOrigin: anchorOrigin.value,
					selfOrigin: selfOrigin.value,
					offset: props.offset,
					cover: props.cover,
					maxHeight: props.maxHeight,
					maxWidth: props.maxWidth
				});
			} else {
				pointBoundary = null;
				centerShift = null;
				track();
				pointBoundary = applyPointBoundary({
					el,
					anchorEl: anchorEl.value,
					point: anchorPoint,
					selfOrigin: selfOrigin.value,
					offset: props.offset
				});
			}
			centerShift = null;
			track();
			restoreScroll(el, scrollTop, scrollLeft);
		};
		const onScroll = (evt) => {
			if (innerRef.value !== null && (!(evt.target instanceof Node) || !innerRef.value.contains(evt.target))) track();
		};
		const onDetachedFullscreenChange = () => {
			nextTick(() => {
				requestAnimationFrame(() => {
					if (showing.value && anchorEl.value !== null && anchorEl.value.isConnected) track();
				});
			});
		};
		return {
			positionStyle: { value: "" },
			track,
			updatePosition,
			setAnchorPoint(point) {
				anchorPoint = point;
				pointBoundary = null;
			},
			handleShow() {
				anchorPoint = null;
				pointBoundary = null;
				boundary = null;
				centerShift = null;
				retries = 0;
				addDetachedFullscreenListener(onDetachedFullscreenChange);
				addScrollTracking(onScroll);
			},
			handleTick() {
				if (trackContent) {
					observer?.disconnect();
					observer = void 0;
					if (innerRef.value !== null) {
						observer = new MutationObserver(track);
						observer.observe(innerRef.value, {
							attributes: false,
							childList: true,
							characterData: true,
							subtree: true
						});
					}
				}
				updatePosition();
				stopAnchorTracking = trackAnchorMotion(() => anchorEl.value, track, props.transitionDuration);
			},
			releaseAnchor(hidingInProgress) {
				if (observer !== void 0) {
					observer.disconnect();
					observer = void 0;
				}
				if (stopAnchorTracking !== void 0) {
					stopAnchorTracking();
					stopAnchorTracking = void 0;
				}
				removeDetachedFullscreenListener(onDetachedFullscreenChange);
				if (!hidingInProgress) {
					removeScrollTracking(onScroll);
					anchorPoint = null;
					pointBoundary = null;
					boundary = null;
					centerShift = null;
				}
			}
		};
	}
	function usePositionEngine({ props, $q, anchorEl, innerRef, showing, anchorOrigin, selfOrigin, trackContent = false, viaCssAnchor = cssAnchorSupport }) {
		let stopPositionWatcher;
		const engine = (viaCssAnchor ? useCssAnchorEngine : useFallbackEngine)(props, {
			anchorEl,
			innerRef,
			showing,
			anchorOrigin,
			selfOrigin,
			trackContent
		});
		return {
			viaCssAnchor,
			positionStyle: engine.positionStyle,
			updatePosition: engine.updatePosition,
			handleTick: engine.handleTick,
			track: engine.track,
			handleShow(pointEvt) {
				engine.handleShow();
				if (pointEvt !== void 0 && anchorEl.value !== null) {
					const pos = position(pointEvt);
					if (pos.left !== void 0) {
						const { top, left } = anchorEl.value.getBoundingClientRect();
						engine.setAnchorPoint({
							left: pos.left - left,
							top: pos.top - top
						});
					}
				}
				if (stopPositionWatcher === void 0) stopPositionWatcher = watch([anchorEl, () => `${$q.screen.width}|${$q.screen.height}|${props.self}|${props.anchor}|${$q.lang.rtl}`], () => {
					if (showing.value) engine.updatePosition();
				});
			},
			releaseAnchor(hidingInProgress) {
				if (stopPositionWatcher !== void 0) {
					stopPositionWatcher();
					stopPositionWatcher = void 0;
				}
				engine.releaseAnchor(hidingInProgress);
			}
		};
	}
	var handlers$1 = [];
	var escDown;
	function onKeydown$3(evt) {
		if (evt.keyCode === 27) escDown = true;
	}
	function onBlur() {
		if (escDown) escDown = false;
	}
	function onKeyup$1(evt) {
		if (escDown && isKeyCode(evt, 27)) {
			escDown = false;
			handlers$1.at(-1)(evt);
		}
	}
	function update$6(action) {
		window[action]("keydown", onKeydown$3);
		window[action]("blur", onBlur);
		window[action]("keyup", onKeyup$1);
		escDown = false;
	}
	function addEscapeKey(fn) {
		handlers$1.push(fn);
		if (handlers$1.length === 1) update$6("addEventListener");
	}
	function removeEscapeKey(fn) {
		const index = handlers$1.indexOf(fn);
		if (index !== -1) {
			handlers$1.splice(index, 1);
			if (handlers$1.length === 0) update$6("removeEventListener");
		}
	}
	var handlers = [];
	function trigger$2(e) {
		handlers.at(-1)(e);
	}
	function addFocusout(fn) {
		handlers.push(fn);
		if (handlers.length === 1) document.body.addEventListener("focusin", trigger$2);
	}
	function removeFocusout(fn) {
		const index = handlers.indexOf(fn);
		if (index !== -1) {
			handlers.splice(index, 1);
			if (handlers.length === 0) document.body.removeEventListener("focusin", trigger$2);
		}
	}
	var timer = null;
	var { notPassiveCapture: notPassiveCapture$4, passiveCapture: passiveCapture$4 } = listenOpts, registeredList = [];
	function globalHandler(evt) {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
		const target = evt.target;
		if (target === void 0 || target.nodeType === 8 || target.classList.contains("no-pointer-events")) return;
		let closableContentEls = null;
		let sawClosablePortal = false;
		for (let i = portalProxyList.length - 1; i >= 0; i--) {
			const proxy = portalProxyList[i].$;
			const name = proxy.type.name;
			if (name === "QTooltip") continue;
			if (name === "QDialog") {
				if (proxy.props.seamless !== true) {
					if (sawClosablePortal === false) return;
					closableContentEls = new Set(portalProxyList.slice(i + 1).map((vm) => vm.contentEl));
					break;
				}
				continue;
			}
			sawClosablePortal = true;
		}
		for (let i = registeredList.length - 1; i >= 0; i--) {
			const state = registeredList[i];
			if (closableContentEls !== null && !closableContentEls.has(state.innerRef.value)) return;
			if ((state.anchorEl.value === null || !state.anchorEl.value.contains(target) && !clickIsInDetachedFullscreen(state.anchorEl.value, target)) && (target === document.body || state.innerRef.value !== null && !state.innerRef.value.contains(target) && !clickIsInDetachedFullscreen(state.innerRef.value, target))) {
				evt.qClickOutside = true;
				state.onClickOutside(evt);
			} else return;
		}
	}
	function onPointerdown(evt) {
		if (evt.pointerType === "touch") return;
		if (timer !== null) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
			globalHandler(evt);
		}, 0);
	}
	function addClickOutside(clickOutsideProps) {
		registeredList.push(clickOutsideProps);
		if (registeredList.length === 1) {
			document.addEventListener("pointerdown", onPointerdown, passiveCapture$4);
			document.addEventListener("mousedown", globalHandler, notPassiveCapture$4);
			document.addEventListener("touchstart", globalHandler, notPassiveCapture$4);
		}
	}
	function removeClickOutside(clickOutsideProps) {
		const index = registeredList.indexOf(clickOutsideProps);
		if (index === -1) return;
		registeredList.splice(index, 1);
		if (registeredList.length !== 0) return;
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
		document.removeEventListener("pointerdown", onPointerdown, passiveCapture$4);
		document.removeEventListener("mousedown", globalHandler, notPassiveCapture$4);
		document.removeEventListener("touchstart", globalHandler, notPassiveCapture$4);
	}
	var tabbableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex^=\"-\"])";
	var QMenu_default = /*#__PURE__*/ createComponent({
		name: "QMenu",
		inheritAttrs: false,
		props: {
			...useAnchorProps,
			...useModelToggleProps,
			...useDarkProps,
			...useTransitionProps,
			persistent: Boolean,
			autoClose: Boolean,
			separateClosePopup: Boolean,
			noEscDismiss: Boolean,
			noRouteDismiss: Boolean,
			noRefocus: Boolean,
			noFocus: Boolean,
			fit: Boolean,
			cover: Boolean,
			square: Boolean,
			anchor: {
				type: String,
				validator: validatePosition
			},
			self: {
				type: String,
				validator: validatePosition
			},
			offset: {
				type: Array,
				validator: validateOffset
			},
			touchPosition: Boolean,
			...useHoverProps,
			maxHeight: {
				type: String,
				default: null
			},
			maxWidth: {
				type: String,
				default: null
			}
		},
		emits: [
			...useModelToggleEmits,
			"click",
			"escapeKey"
		],
		setup(props, { slots, emit, attrs }) {
			let avoidAutoClose, hoverShown = false;
			const vm = getCurrentInstance();
			const { proxy } = vm;
			const $q = useQuasar();
			const innerRef = /* @__PURE__ */ shallowRef(null);
			const showing = /* @__PURE__ */ ref(false);
			const hideOnRouteChange = computed(() => !props.persistent && !props.noRouteDismiss);
			const isDark = useDark(props, $q);
			const { registerTick, removeTick } = useTick();
			const { registerTransitionEnd } = useTransitionEnd(props);
			const { transitionProps, transitionStyle } = useTransition(props);
			const { anchorEl, canShow, anchorEvents } = useAnchor({
				showing,
				getPopupRole: () => attrs.role
			});
			const { show, hide } = useModelToggle({
				showing,
				canShow,
				canHide(evt) {
					return hoverShown && portalIsOpening() ? evt?.type !== "click" : true;
				},
				handleShow,
				handleHide,
				handleRouteChange,
				hideOnRouteChange,
				processOnMount: true
			});
			const { clearHoverTimer, hoverShow, scheduleHoverHide, onHoverContentEnter } = useHover({
				props,
				canShow: () => !showing.value,
				show,
				canHide: (evt) => showing.value && !hoverWithinScope(evt.relatedTarget),
				hide
			});
			Object.assign(anchorEvents, {
				hoverShow,
				hoverHide
			});
			const { showPortal, hidePortal, portalIsOpening, renderPortal } = usePortal(vm, innerRef, renderPortalContent, "menu");
			const { captureRefocusTarget, clearRefocusTarget, restoreFocus, restoreFocusSync, adoptRefocusTarget } = usePortalRefocus(props, () => !props.noFocus && !hoverShown && portalIsOpening());
			const clickOutsideProps = {
				anchorEl,
				innerRef,
				onClickOutside(e) {
					if (!props.persistent && showing.value) {
						hide(e);
						if (e.type === "touchstart" || e.target.classList.contains("q-dialog__backdrop")) stopAndPrevent(e);
						return true;
					}
				}
			};
			const anchorOrigin = computed(() => parsePosition(props.anchor || (props.cover ? "center middle" : "bottom start"), $q.lang.rtl));
			const posEngine = usePositionEngine({
				props,
				$q,
				anchorEl,
				innerRef,
				showing,
				anchorOrigin,
				selfOrigin: computed(() => props.cover ? anchorOrigin.value : parsePosition(props.self || "top start", $q.lang.rtl))
			});
			const menuClass = computed(() => "q-menu scroll" + (posEngine.viaCssAnchor ? "" : " q-position-engine") + (props.square ? " q-menu--square" : "") + (isDark() ? " q-menu--dark q-dark" : ""));
			const onEvents = computed(() => props.autoClose ? { onClick: onAutoClose } : {});
			const handlesFocus = computed(() => showing.value && !props.persistent);
			watch(handlesFocus, (val) => {
				if (val) {
					addEscapeKey(onEscapeKey);
					addClickOutside(clickOutsideProps);
				} else {
					removeEscapeKey(onEscapeKey);
					removeClickOutside(clickOutsideProps);
				}
			});
			function focus() {
				addFocusFn(() => {
					let node = innerRef.value;
					if (node && node.contains !== void 0 && !node.contains(document.activeElement)) {
						node = node.querySelector("[autofocus][tabindex], [data-autofocus][tabindex]") || node.querySelector("[autofocus] [tabindex], [data-autofocus] [tabindex]") || node.querySelector("[autofocus], [data-autofocus]") || node;
						node.focus({ preventScroll: true });
					}
				});
			}
			function hoverWithinScope(el) {
				if (el === null || el === void 0) return false;
				if (anchorEl.value !== null && anchorEl.value.contains(el) || innerRef.value !== null && innerRef.value.contains(el)) return true;
				let portalProxy = getPortalProxy(el);
				while (portalProxy !== void 0 && portalProxy !== null) {
					if (portalProxy === proxy) return true;
					portalProxy = getParentProxy(portalProxy);
				}
				return false;
			}
			function hoverHide(evt) {
				if (evt.pointerType === "touch") return;
				scheduleHoverHide(evt);
				let parent = getParentProxy(proxy);
				while (parent !== void 0 && parent !== null) {
					if (parent.$options.name === "QMenu" && parent.$props.hover === true) parent.__qHoverHide?.(evt);
					parent = getParentProxy(parent);
				}
			}
			function handleShow(evt) {
				hoverShown = props.hover && evt?.type === "pointerenter";
				clearHoverTimer();
				captureRefocusTarget(hoverShown);
				addFocusout(onFocusout);
				showPortal(false, hoverShown);
				posEngine.handleShow(!hoverShown && (props.touchPosition || props.contextMenu) ? evt : void 0);
				if (!props.noFocus && !hoverShown) document.activeElement.blur();
				registerTick(() => {
					posEngine.handleTick();
					if (!props.noFocus && !hoverShown) focus();
				});
				registerTransitionEnd(() => {
					if ($q.platform.is.ios) {
						avoidAutoClose = props.autoClose;
						innerRef.value.click();
					}
					if (!posEngine.viaCssAnchor) posEngine.track();
					showPortal(true);
					emit("show", evt);
				});
			}
			function handleHide(evt) {
				hoverShown = false;
				removeTick();
				hidePortal();
				anchorCleanup(true);
				if (evt === void 0 || !evt.qClickOutside) restoreFocus(evt);
				else clearRefocusTarget();
				registerTransitionEnd(() => {
					hidePortal(true);
					posEngine.releaseAnchor(false);
					emit("hide", evt);
				});
			}
			function handleRouteChange() {
				clearRefocusTarget();
			}
			function anchorCleanup(hidingInProgress) {
				clearHoverTimer();
				posEngine.releaseAnchor(hidingInProgress);
				if (hidingInProgress || showing.value) {
					removeFocusout(onFocusout);
					removeClickOutside(clickOutsideProps);
					removeEscapeKey(onEscapeKey);
				}
				if (!hidingInProgress) clearRefocusTarget();
			}
			function onAutoClose(e) {
				if (!avoidAutoClose) {
					closePortalMenus(proxy, e);
					emit("click", e);
				} else avoidAutoClose = false;
			}
			function onFocusout(evt) {
				if (handlesFocus.value && !props.noFocus && !hoverShown && !childHasFocus(innerRef.value, evt.target) && !focusIsInDetachedFullscreen(innerRef.value, evt.target)) focus();
			}
			function onEscapeKey(evt) {
				if (!props.noEscDismiss) {
					emit("escapeKey");
					hide(evt);
				}
			}
			function onPortalKeydown(evt) {
				if (evt.keyCode !== 9 || evt.defaultPrevented || !handlesFocus.value || innerRef.value === null) return;
				const inner = innerRef.value;
				const tabbables = inner.querySelectorAll(tabbableSelector);
				const edge = tabbables.length === 0 ? null : tabbables[evt.shiftKey ? 0 : tabbables.length - 1];
				if (edge !== null && document.activeElement !== edge && !(evt.shiftKey && document.activeElement === inner)) return;
				removeFocusout(onFocusout);
				restoreFocusSync(evt);
				hide(evt);
			}
			function renderPortalContent() {
				return h(Transition, transitionProps(), () => showing.value ? h("div", {
					...attrs,
					ref: innerRef,
					tabindex: -1,
					onKeydown: [].concat(attrs.onKeydown || [], onPortalKeydown),
					...props.hover ? {
						onPointerenter: [].concat(attrs.onPointerenter || [], onHoverContentEnter),
						onPointerleave: [].concat(attrs.onPointerleave || [], hoverHide)
					} : {},
					class: [menuClass.value, attrs.class],
					style: [
						attrs.style,
						transitionStyle(),
						posEngine.positionStyle.value
					],
					...onEvents.value
				}, hSlot(slots.default)) : null);
			}
			onBeforeUnmount(() => {
				anchorCleanup(false);
			});
			Object.assign(proxy, {
				focus,
				updatePosition: posEngine.updatePosition,
				__adoptRefocusTarget: adoptRefocusTarget
			});
			proxy.__qHoverHide = scheduleHoverHide;
			return renderPortal;
		}
	});
	function createUidFn() {
		if (typeof crypto === "undefined") return () => {
			throw new Error("[Quasar uid()] Secure RNG not available. Cannot generate collision-resistant UUID.");
		};
		if (crypto.randomUUID) return () => crypto.randomUUID();
		const hex = Array.from({ length: 256 }, (_, i) => (i + 256).toString(16).slice(1));
		let buf, bufIdx;
		return () => {
			if (buf === void 0 || bufIdx + 16 > 4096) {
				bufIdx = 0;
				buf = /* @__PURE__ */ new Uint8Array(4096);
				crypto.getRandomValues(buf);
			}
			const i = bufIdx;
			bufIdx += 16;
			buf[i + 6] = buf[i + 6] & 15 | 64;
			buf[i + 8] = buf[i + 8] & 63 | 128;
			return hex[buf[i]] + hex[buf[i + 1]] + hex[buf[i + 2]] + hex[buf[i + 3]] + "-" + hex[buf[i + 4]] + hex[buf[i + 5]] + "-" + hex[buf[i + 6]] + hex[buf[i + 7]] + "-" + hex[buf[i + 8]] + hex[buf[i + 9]] + "-" + hex[buf[i + 10]] + hex[buf[i + 11]] + hex[buf[i + 12]] + hex[buf[i + 13]] + hex[buf[i + 14]] + hex[buf[i + 15]];
		};
	}
	var uid_default = /*#__PURE__*/ createUidFn();
	function parseValue(val) {
		return val === void 0 || val === null ? null : val;
	}
	function getId(val, required) {
		return val === void 0 || val === null ? required ? `f_${uid_default()}` : null : val;
	}
	/**
	* Returns an "id" which is a ref() that can be used as
	* a unique identifier to apply to a DOM node attribute.
	*
	* On SSR/SSG, it takes care of generating the id on the client side (only) to
	* avoid hydration errors.
	*/
	function useId({ getValue, required = true } = {}) {
		if (isRuntimeSsrPreHydration.value) {
			const id = getValue !== void 0 ? /* @__PURE__ */ ref(parseValue(getValue())) : /* @__PURE__ */ ref(null);
			if (required && id.value === null) onMounted(() => {
				id.value = `f_${uid_default()}`;
			});
			if (getValue !== void 0) watch(getValue, (newId) => {
				id.value = getId(newId, required);
			});
			return id;
		}
		return getValue !== void 0 ? computed(() => getId(getValue(), required)) : /* @__PURE__ */ ref(`f_${uid_default()}`);
	}
	Object.keys(nonRoundBtnProps);
	({
		...nonRoundBtnProps,
		...useTransitionProps
	});
	var useFormProps = { name: String };
	function useFormAttrs(props) {
		return () => ({
			type: "hidden",
			name: props.name,
			value: props.modelValue
		});
	}
	function useFormInject(formAttrs) {
		return (child, action, className) => {
			child[action](h("input", {
				class: "hidden" + (className || ""),
				...formAttrs !== void 0 ? formAttrs() : void 0
			}));
		};
	}
	function useFormInputNameAttr(props) {
		return () => props.name || props.for;
	}
	({ ...useFormProps }), useAlignProps.align;
	var QCard_default = /*#__PURE__*/ createComponent({
		name: "QCard",
		props: {
			...useDarkProps,
			tag: {
				type: String,
				default: "div"
			},
			square: Boolean,
			flat: Boolean,
			bordered: Boolean
		},
		setup(props, { slots }) {
			const isDark = useDark(props, useQuasar());
			const classes = computed(() => "q-card" + (isDark() ? " q-card--dark q-dark" : "") + (props.bordered ? " q-card--bordered" : "") + (props.square ? " q-card--square no-border-radius" : "") + (props.flat ? " q-card--flat no-shadow" : ""));
			return () => h(props.tag, { class: classes.value }, hSlot(slots.default));
		}
	});
	var QCardSection_default = /*#__PURE__*/ createComponent({
		name: "QCardSection",
		props: {
			tag: {
				type: String,
				default: "div"
			},
			horizontal: Boolean
		},
		setup(props, { slots }) {
			const classes = computed(() => `q-card__section q-card__section--${props.horizontal ? "horiz row no-wrap" : "vert"}`);
			return () => h(props.tag, { class: classes.value }, hSlot(slots.default));
		}
	});
	var QCardActions_default = /*#__PURE__*/ createComponent({
		name: "QCardActions",
		props: {
			...useAlignProps,
			vertical: Boolean
		},
		setup(props, { slots }) {
			const alignClass = useAlign(props);
			const classes = computed(() => `q-card__actions ${alignClass()} q-card__actions--${props.vertical ? "vert column" : "horiz row"}`);
			return () => h("div", { class: classes.value }, hSlot(slots.default));
		}
	});
	var modifiersAll = {
		left: true,
		right: true,
		up: true,
		down: true,
		horizontal: true,
		vertical: true
	};
	Object.keys(modifiersAll);
	modifiersAll.all = true;
	var { passive: passive$5, passiveCapture: passiveCapture$3, notPassive: notPassive$1, notPassiveCapture: notPassiveCapture$3 } = listenOpts;
	function useRenderCache() {
		let cache = Object.create(null);
		return {
			getCache: (key, defaultValue) => Object.hasOwn(cache, key) ? cache[key] : cache[key] = typeof defaultValue === "function" ? defaultValue() : defaultValue,
			setCache(key, obj) {
				cache[key] = obj;
			},
			hasCache(key) {
				return Object.hasOwn(cache, key);
			},
			clearCache(key) {
				if (key !== void 0) delete cache[key];
				else cache = Object.create(null);
			}
		};
	}
	var usePanelChildProps = {
		name: { required: true },
		disable: Boolean
	};
	var usePanelProps = {
		modelValue: { required: true },
		animated: Boolean,
		infinite: Boolean,
		swipeable: Boolean,
		vertical: Boolean,
		transitionPrev: String,
		transitionNext: String,
		transitionDuration: {
			type: [String, Number],
			default: 300
		},
		keepAlive: Boolean,
		keepAliveInclude: [
			String,
			Array,
			RegExp
		],
		keepAliveExclude: [
			String,
			Array,
			RegExp
		],
		keepAliveMax: Number
	};
	var usePanelEmits = [
		"update:modelValue",
		"beforeTransition",
		"transition"
	];
	var scrollTargetProp = [
		Element,
		String,
		Object
	];
	var scrollTargets = [
		null,
		document,
		document.body,
		document.scrollingElement,
		document.documentElement
	];
	function getScrollTarget(el, targetEl) {
		let target = getElement$1(targetEl);
		if (target !== void 0 && target !== window && !(target instanceof Element) && !scrollTargets.includes(target)) {
			console.warn("[Quasar] scroll-target: the specified value is not an Element nor a component with a root element; falling back to auto detection");
			target = void 0;
		}
		if (target === void 0) {
			if (el === void 0 || el === null) return window;
			target = el.closest(".scroll,.scroll-y,.overflow-auto");
		}
		return scrollTargets.includes(target) ? window : target;
	}
	function getVerticalScrollPosition(scrollTarget) {
		return scrollTarget === window ? window.scrollY : scrollTarget.scrollTop;
	}
	function getHorizontalScrollPosition(scrollTarget) {
		return scrollTarget === window ? window.scrollX : scrollTarget.scrollLeft;
	}
	var counter = 0;
	var restoreState = null;
	/**
	* Detaching an element drops the focus (and any caret) it holds, and
	* browsers do not bring either back on re-insertion (#17843). Captured
	* before a move, restored after it.
	*
	* The caret/selection of an input or textarea is element state and comes
	* back with focus() on its own; a contenteditable caret lives on the
	* document Selection, which is captured as plain boundary values -- node
	* removal re-targets live Range objects to the old parent.
	*/
	function captureFocusWithin(el) {
		const activeEl = document.activeElement;
		if (activeEl === null || activeEl === document.body || !el.contains(activeEl)) return null;
		const capture = { activeEl };
		if (activeEl.isContentEditable === true) {
			const selection = document.getSelection();
			if (selection.rangeCount !== 0 && el.contains(selection.anchorNode)) {
				capture.anchorNode = selection.anchorNode;
				capture.anchorOffset = selection.anchorOffset;
				capture.focusNode = selection.focusNode;
				capture.focusOffset = selection.focusOffset;
			}
		}
		return capture;
	}
	function restoreFocus(capture) {
		if (capture === null || !capture.activeEl.isConnected) return;
		capture.activeEl.focus({ preventScroll: true });
		if (capture.anchorNode !== void 0 && capture.anchorNode.isConnected) document.getSelection().setBaseAndExtent(capture.anchorNode, capture.anchorOffset, capture.focusNode, capture.focusOffset);
	}
	function useSoftFullscreen(options) {
		const inFullscreen = /* @__PURE__ */ ref(false);
		const vm = getCurrentInstance();
		let target, el = null, fillerNode = null, historyEntry, noRouteExit = false, requested, pending = false, active = false, restoreToken = 0;
		function getEl() {
			return el;
		}
		function isDestroyed() {
			return vm !== null && vmIsDestroyed(vm);
		}
		function cancelRestore() {
			restoreToken++;
		}
		function setFullscreen() {
			if (active || isDestroyed()) return;
			const node = getTargetElement(target, vm);
			if (node === null) {
				pending = requested;
				return;
			}
			pending = false;
			cancelRestore();
			if (counter === 0) restoreState = {
				left: getHorizontalScrollPosition(window),
				top: getVerticalScrollPosition(window),
				width: window.innerWidth,
				height: window.innerHeight
			};
			el = node;
			active = true;
			inFullscreen.value = true;
			if (fillerNode === null) fillerNode = document.createElement("span");
			const focusCapture = captureFocusWithin(el);
			el.replaceWith(fillerNode);
			document.body.append(el);
			bringGlobalNodesToFront();
			addDetachedFullscreen(fillerNode, getEl);
			restoreFocus(focusCapture);
			counter++;
			if (counter === 1) document.body.classList.add("q-body--fullscreen-mixin");
			historyEntry = { handler: exitFullscreen };
			History_default.add(historyEntry);
		}
		function exitFullscreen() {
			if (!active) return;
			if (historyEntry !== void 0) {
				History_default.remove(historyEntry);
				historyEntry = void 0;
			}
			removeDetachedFullscreen(fillerNode);
			if (el.isConnected) {
				const focusCapture = captureFocusWithin(el);
				fillerNode.replaceWith(el);
				restoreFocus(focusCapture);
			} else fillerNode.remove();
			const exitedEl = el;
			active = false;
			inFullscreen.value = false;
			counter = Math.max(0, counter - 1);
			if (counter !== 0) return;
			document.body.classList.remove("q-body--fullscreen-mixin");
			if (restoreState === null) return;
			const { left, top, width, height } = restoreState;
			restoreState = null;
			if (isDestroyed()) return;
			const token = ++restoreToken;
			nextTick(() => {
				if (token !== restoreToken || counter !== 0 || isDestroyed()) return;
				requestAnimationFrame(() => {
					if (token !== restoreToken || counter !== 0 || isDestroyed()) return;
					if (window.innerWidth !== width || window.innerHeight !== height)
 /**
					* If user has resized the window while in fullscreen mode,
					* we cannot restore the scroll position because it will be wrong.
					* So we just scroll the element into view instead,
					* which is the best we can do.
					*/
					exitedEl.scrollIntoView();
					else window.scrollTo(left, top);
				});
			});
		}
		function toggleFullscreen() {
			if (active) exitFullscreen();
			else setFullscreen();
		}
		const effect = new ReactiveEffect(() => {
			const opts = toValue(options) ?? {};
			target = opts.target;
			noRouteExit = opts.noRouteExit === true;
			const newEl = getTargetElement(target, vm);
			const newRequested = opts.fullscreen === true;
			const requestChanged = newRequested !== requested;
			requested = newRequested;
			if (!requested) pending = false;
			if (active && newEl !== el) {
				exitFullscreen();
				if (requested) setFullscreen();
			} else if (requestChanged && requested !== active) {
				if (requested) setFullscreen();
				else exitFullscreen();
			} else if (pending && !active && newEl !== null) setFullscreen();
		});
		effect.scheduler = () => {
			effect.run();
		};
		if (vm !== null) {
			if (vmHasRouter(vm)) watch(() => vm.proxy.$route.fullPath, () => {
				if (!noRouteExit) exitFullscreen();
			});
			onMounted(() => {
				effect.run();
			});
			onDeactivated(() => {
				cancelRestore();
				exitFullscreen();
			});
			onActivated(() => {
				if (requested) setFullscreen();
			});
			onBeforeUnmount(() => {
				cancelRestore();
				exitFullscreen();
			});
		} else effect.run();
		return {
			inFullscreen,
			setFullscreen,
			exitFullscreen,
			toggleFullscreen
		};
	}
	var useFullscreenProps = {
		fullscreen: Boolean,
		noRouteFullscreenExit: Boolean
	};
	var useFullscreenEmits = ["update:fullscreen", "fullscreen"];
	function useInternalFullscreen() {
		const { props, emit, proxy } = getCurrentInstance();
		const { inFullscreen, toggleFullscreen, setFullscreen, exitFullscreen } = useSoftFullscreen(() => ({
			fullscreen: props.fullscreen,
			noRouteExit: props.noRouteFullscreenExit
		}));
		watch(inFullscreen, (v) => {
			emit("update:fullscreen", v);
			emit("fullscreen", v);
		});
		Object.assign(proxy, {
			toggleFullscreen,
			setFullscreen,
			exitFullscreen
		});
		return {
			inFullscreen,
			toggleFullscreen
		};
	}
	({
		...useDarkProps,
		...usePanelProps,
		...useFullscreenProps
	}), [...useFullscreenEmits, ...usePanelEmits];
	({ ...usePanelChildProps });
	function useRefocusTarget(props, rootRef) {
		const refocusRef = /* @__PURE__ */ shallowRef(null);
		const refocusTargetEl = computed(() => {
			if (props.disable) return null;
			return h("span", {
				ref: refocusRef,
				class: "no-outline",
				tabindex: -1
			});
		});
		function refocusTarget(e) {
			const root = rootRef.value;
			if (e?.qAvoidFocus === true) return;
			if (root?.getAttribute("aria-hidden") === "true") return;
			if (e?.type.indexOf("key") === 0) {
				if (document.activeElement !== root && root?.contains(document.activeElement) === true) root.focus({ preventScroll: true });
			} else if (refocusRef.value !== null && (e === void 0 || root?.contains(e.target) === true)) refocusRef.value.focus({ preventScroll: true });
		}
		return {
			refocusTargetEl,
			refocusTarget
		};
	}
	var getOptionSizeStyle = /*#__PURE__*/ createSizeStyle({
		xs: 30,
		sm: 35,
		md: 40,
		lg: 50,
		xl: 60
	});
	var useCheckboxProps = {
		...useDarkProps,
		...useSizeProps,
		...useFormProps,
		modelValue: {
			required: true,
			default: null
		},
		val: {},
		trueValue: { default: true },
		falseValue: { default: false },
		indeterminateValue: { default: null },
		checkedIcon: String,
		uncheckedIcon: String,
		indeterminateIcon: String,
		toggleOrder: {
			type: String,
			validator: (v) => v === "tf" || v === "ft"
		},
		toggleIndeterminate: Boolean,
		label: String,
		leftLabel: Boolean,
		color: String,
		keepColor: Boolean,
		dense: Boolean,
		disable: Boolean,
		tabindex: [String, Number]
	};
	var useCheckboxEmits = ["update:modelValue"];
	function onKeydown$2(e) {
		if (e.keyCode === 13 || e.keyCode === 32) stopAndPrevent(e);
	}
	function useCheckbox(type, getInner) {
		const { props, slots, emit, proxy } = getCurrentInstance();
		const isDark = useDark(props, useQuasar());
		const rootRef = /* @__PURE__ */ shallowRef(null);
		const { refocusTargetEl, refocusTarget } = useRefocusTarget(props, rootRef);
		const modelIsArray = computed(() => props.val !== void 0 && Array.isArray(props.modelValue));
		const index = computed(() => {
			const val = /* @__PURE__ */ toRaw(props.val);
			return modelIsArray.value ? props.modelValue.findIndex((opt) => /* @__PURE__ */ toRaw(opt) === val) : -1;
		});
		const isTrue = computed(() => modelIsArray.value ? index.value !== -1 : /* @__PURE__ */ toRaw(props.modelValue) === /* @__PURE__ */ toRaw(props.trueValue));
		const isFalse = computed(() => modelIsArray.value ? index.value === -1 : /* @__PURE__ */ toRaw(props.modelValue) === /* @__PURE__ */ toRaw(props.falseValue));
		const isIndeterminate = computed(() => !isTrue.value && !isFalse.value);
		const tabindex = computed(() => props.disable ? -1 : props.tabindex || 0);
		const classes = computed(() => `q-${type} cursor-pointer no-outline row inline no-wrap items-center` + (props.disable ? " disabled" : "") + (isDark() ? ` q-${type}--dark` : "") + (props.dense ? ` q-${type}--dense` : "") + (props.leftLabel ? " reverse" : ""));
		const innerClass = computed(() => {
			return `q-${type}__inner relative-position non-selectable q-${type}__inner--${isTrue.value ? "truthy" : isFalse.value ? "falsy" : "indet"}${props.color !== void 0 && (props.keepColor || (type === "toggle" ? isTrue.value : !isFalse.value)) ? ` text-${props.color}` : ""}`;
		});
		const formAttrs = () => {
			const prop = { type: "checkbox" };
			if (props.name !== void 0) Object.assign(prop, {
				".checked": isTrue.value,
				"^checked": isTrue.value ? "checked" : void 0,
				name: props.name,
				value: modelIsArray.value ? props.val : props.trueValue
			});
			return prop;
		};
		const injectFormInput = useFormInject(formAttrs);
		const attributes = computed(() => {
			const attrs = {
				tabindex: tabindex.value,
				role: type === "toggle" ? "switch" : "checkbox",
				"aria-label": props.label,
				"aria-checked": isIndeterminate.value ? type === "toggle" ? "false" : "mixed" : isTrue.value ? "true" : "false"
			};
			if (props.disable) attrs["aria-disabled"] = "true";
			return attrs;
		});
		function onClick(e) {
			if (e !== void 0) {
				stopAndPrevent(e);
				refocusTarget(e);
			}
			if (!props.disable) emit("update:modelValue", getNextValue(), e);
		}
		function getNextValue() {
			if (modelIsArray.value) {
				if (isTrue.value) {
					const val = [...props.modelValue];
					val.splice(index.value, 1);
					return val;
				}
				return [...props.modelValue, props.val];
			}
			if (isTrue.value) {
				if (props.toggleOrder !== "ft" || !props.toggleIndeterminate) return props.falseValue;
			} else if (isFalse.value) {
				if (props.toggleOrder === "ft" || !props.toggleIndeterminate) return props.trueValue;
			} else return props.toggleOrder !== "ft" ? props.trueValue : props.falseValue;
			return props.indeterminateValue;
		}
		function onKeyup(e) {
			if (e.keyCode === 13 || e.keyCode === 32) onClick(e);
		}
		const getInnerContent = getInner(isTrue, isIndeterminate);
		Object.assign(proxy, { toggle: onClick });
		return () => {
			const inner = getInnerContent();
			if (!props.disable) injectFormInput(inner, "unshift", ` q-${type}__native absolute q-ma-none q-pa-none`);
			const child = [h("div", {
				class: innerClass.value,
				style: getOptionSizeStyle(props.size),
				"aria-hidden": "true"
			}, inner)];
			if (refocusTargetEl.value !== null) child.push(refocusTargetEl.value);
			const label = props.label !== void 0 ? hMergeSlot(slots.default, [props.label]) : hSlot(slots.default);
			if (label !== void 0) child.push(h("div", { class: `q-${type}__label q-anchor--skip` }, label));
			return h("div", {
				ref: rootRef,
				class: classes.value,
				...attributes.value,
				onClick,
				onKeydown: onKeydown$2,
				onKeyup
			}, child);
		};
	}
	var createBgNode = () => h("div", {
		key: "svg",
		class: "q-checkbox__bg absolute"
	}, [h("svg", {
		class: "q-checkbox__svg fit absolute-full",
		viewBox: "0 0 24 24"
	}, [h("path", {
		class: "q-checkbox__truthy",
		fill: "none",
		d: "M1.73,12.91 8.1,19.28 22.79,4.59"
	}), h("path", {
		class: "q-checkbox__indet",
		d: "M4,14H20V10H4"
	})])]);
	var QCheckbox_default = /*#__PURE__*/ createComponent({
		name: "QCheckbox",
		props: useCheckboxProps,
		emits: useCheckboxEmits,
		setup(props) {
			const bgNode = createBgNode();
			function getInner(isTrue, isIndeterminate) {
				const icon = computed(() => (isTrue.value ? props.checkedIcon : isIndeterminate.value ? props.indeterminateIcon : props.uncheckedIcon) || null);
				return () => icon.value !== null ? [h("div", {
					key: "icon",
					class: "q-checkbox__icon-container absolute-full flex flex-center no-wrap"
				}, [h(QIcon_default, {
					class: "q-checkbox__icon",
					name: icon.value
				})])] : [bgNode];
			}
			return useCheckbox("checkbox", getInner);
		}
	});
	function preventSpace$4(e) {
		if (e.keyCode === 32) stopAndPrevent(e);
	}
	var getSizeStyle$1 = /*#__PURE__*/ createSizeStyle({
		xs: 8,
		sm: 10,
		md: 14,
		lg: 20,
		xl: 24
	});
	var QChip_default = /*#__PURE__*/ createComponent({
		name: "QChip",
		props: {
			...useDarkProps,
			...useSizeProps,
			dense: Boolean,
			icon: String,
			iconRight: String,
			iconRemove: String,
			iconSelected: String,
			label: [String, Number],
			color: String,
			textColor: String,
			modelValue: {
				type: Boolean,
				default: true
			},
			selected: {
				type: Boolean,
				default: null
			},
			square: Boolean,
			outline: Boolean,
			clickable: {
				type: Boolean,
				default: null
			},
			onClick: Function,
			removable: Boolean,
			removeAriaLabel: String,
			tabindex: [String, Number],
			disable: Boolean,
			ripple: {
				type: [Boolean, Object],
				default: true
			}
		},
		emits: [
			"update:modelValue",
			"update:selected",
			"remove"
		],
		setup(props, { slots, emit }) {
			const $q = useQuasar();
			const isDark = useDark(props, $q);
			const hasLeftIcon = computed(() => props.selected || props.icon !== void 0);
			const leftIcon = computed(() => props.selected ? props.iconSelected || $q.iconSet.chip.selected : props.icon);
			const removeIcon = computed(() => props.iconRemove || $q.iconSet.chip.remove);
			const isActionable = computed(() => (props.clickable === null ? props.onClick !== void 0 : props.clickable) || props.selected !== null);
			const isClickable = computed(() => !props.disable && isActionable.value);
			const classes = computed(() => {
				const text = props.outline ? props.color || props.textColor : props.textColor;
				return "q-chip row inline no-wrap items-center" + (!props.outline && props.color !== void 0 ? ` bg-${props.color}` : "") + (text ? ` text-${text} q-chip--colored` : "") + (props.disable ? " disabled" : "") + (props.dense ? " q-chip--dense" : "") + (props.outline ? " q-chip--outline" : "") + (props.selected ? " q-chip--selected" : "") + (isClickable.value ? " q-chip--clickable cursor-pointer non-selectable q-hoverable" : "") + (props.square ? " q-chip--square" : "") + (isDark() ? " q-chip--dark q-dark" : "");
			});
			const attributes = computed(() => {
				return {
					chip: props.disable ? {
						role: "button",
						tabindex: -1,
						"aria-disabled": "true"
					} : {
						role: "button",
						tabindex: props.tabindex || 0,
						...props.selected !== null ? { "aria-pressed": props.selected ? "true" : "false" } : {}
					},
					remove: {
						role: "button",
						"aria-hidden": "false",
						"aria-label": props.removeAriaLabel || $q.lang.label.remove,
						...props.disable ? {
							tabindex: -1,
							"aria-disabled": "true"
						} : { tabindex: props.tabindex || 0 }
					}
				};
			});
			function onKeyup(e) {
				if ([13, 32].includes(e.keyCode)) {
					onClick(e);
					stopAndPrevent(e);
				}
			}
			function onClick(e) {
				if (!props.disable) {
					emit("update:selected", !props.selected);
					emit("click", e);
				}
			}
			function onRemove(e) {
				if (e.keyCode === void 0 || [13, 32].includes(e.keyCode)) {
					stopAndPrevent(e);
					if (!props.disable) {
						emit("update:modelValue", false);
						emit("remove");
					}
				}
			}
			function getContent() {
				const child = [];
				if (isClickable.value) child.push(h("div", { class: "q-focus-helper" }));
				if (hasLeftIcon.value) child.push(h(QIcon_default, {
					class: "q-chip__icon q-chip__icon--left",
					name: leftIcon.value
				}));
				const label = props.label !== void 0 ? [h("div", { class: "ellipsis" }, [props.label])] : void 0;
				child.push(h("div", { class: "q-chip__content col row no-wrap items-center q-anchor--skip" }, hMergeSlotSafely(slots.default, label)));
				if (props.iconRight) child.push(h(QIcon_default, {
					class: "q-chip__icon q-chip__icon--right",
					name: props.iconRight
				}));
				if (props.removable) child.push(h(QIcon_default, {
					class: "q-chip__icon q-chip__icon--remove cursor-pointer",
					name: removeIcon.value,
					...attributes.value.remove,
					onClick: onRemove,
					onKeydown: preventSpace$4,
					onKeyup: onRemove
				}));
				return child;
			}
			return () => {
				if (!props.modelValue) return;
				const data = { class: classes.value };
				if (props.size !== void 0) data.style = getSizeStyle$1(props.size);
				if (isActionable.value) Object.assign(data, attributes.value.chip);
				if (isClickable.value) Object.assign(data, {
					onClick,
					onKeydown: preventSpace$4,
					onKeyup
				});
				return withDirectives(h("div", data, getContent()), [[Ripple_default, props.disable || props.ripple === false ? false : props.ripple]]);
			};
		}
	});
	var useCircularCommonProps = {
		...useSizeProps,
		min: {
			type: Number,
			default: 0
		},
		max: {
			type: Number,
			default: 100
		},
		color: String,
		centerColor: String,
		trackColor: String,
		fontSize: String,
		rounded: Boolean,
		thickness: {
			type: Number,
			default: .2,
			validator: (v) => v >= 0 && v <= 1
		},
		angle: {
			type: Number,
			default: 0
		},
		showValue: Boolean,
		reverse: Boolean,
		instantFeedback: Boolean
	};
	Math.round(100 * Math.PI * 1e3) / 1e3;
	({ ...useCircularCommonProps });
	var { passive: passive$4, passiveCapture: passiveCapture$2, notPassiveCapture: notPassiveCapture$2 } = listenOpts;
	function isListener(key) {
		if (key.codePointAt(0) !== 111 || key.codePointAt(1) !== 110) return false;
		const c = key.codePointAt(2);
		return c >= 65 && c <= 90;
	}
	function differs(next, prev) {
		const keys = Object.keys(next);
		if (keys.length !== Object.keys(prev).length) return true;
		for (const key of keys) if (next[key] !== prev[key] || !(key in prev)) return true;
		return false;
	}
	function useSplitAttrs() {
		const vm = getCurrentInstance();
		const { attrs } = vm;
		const acc = {
			listeners: /* @__PURE__ */ ref({}),
			attributes: /* @__PURE__ */ ref({})
		};
		function update() {
			const attributes = {};
			const listeners = {};
			for (const key in attrs) if (key !== "class" && key !== "style" && !isListener(key)) attributes[key] = attrs[key];
			for (const key in vm.vnode.props) if (isListener(key)) listeners[key] = vm.vnode.props[key];
			if (differs(attributes, acc.attributes.value)) acc.attributes.value = attributes;
			if (differs(listeners, acc.listeners.value)) acc.listeners.value = listeners;
		}
		onBeforeUpdate(update);
		update();
		return acc;
	}
	var useSliderProps = {
		...useDarkProps,
		...useFormProps,
		min: {
			type: Number,
			default: 0
		},
		max: {
			type: Number,
			default: 100
		},
		innerMin: Number,
		innerMax: Number,
		step: {
			type: Number,
			default: 1,
			validator: (v) => v >= 0
		},
		snap: Boolean,
		vertical: Boolean,
		reverse: Boolean,
		color: String,
		markerLabelsClass: String,
		label: Boolean,
		labelColor: String,
		labelTextColor: String,
		labelAlways: Boolean,
		switchLabelSide: Boolean,
		markers: [Boolean, Number],
		markerLabels: [
			Boolean,
			Array,
			Object,
			Function
		],
		switchMarkerLabelsSide: Boolean,
		trackImg: String,
		trackColor: String,
		innerTrackImg: String,
		innerTrackColor: String,
		selectionColor: String,
		selectionImg: String,
		thumbSize: {
			type: String,
			default: "20px"
		},
		trackSize: {
			type: String,
			default: "4px"
		},
		disable: Boolean,
		readonly: Boolean,
		dense: Boolean,
		tabindex: [String, Number],
		thumbColor: String,
		thumbPath: {
			type: String,
			default: "M 4, 10 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0"
		}
	};
	({ ...useSliderProps });
	var id$1 = 0;
	var useTabProps = {
		icon: String,
		label: [Number, String],
		alert: [Boolean, String],
		alertIcon: String,
		name: {
			type: [Number, String],
			default: () => `t_${id$1++}`
		},
		noCaps: Boolean,
		tabindex: [String, Number],
		disable: Boolean,
		contentClass: String,
		ripple: {
			type: [Boolean, Object],
			default: true
		}
	};
	({
		...usePanelProps,
		...useDarkProps
	});
	var hexRE$1 = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
	var hexaRE = /^#[0-9a-fA-F]{4}([0-9a-fA-F]{4})?$/;
	var hexOrHexaRE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
	var rgbRE$1 = /^rgb\(((0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5]),){2}(0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5])\)$/;
	var rgbaRE$1 = /^rgba\(((0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5]),){2}(0|[1-9][\d]?|1[\d]{0,2}|2[\d]?|2[0-4][\d]|25[0-5]),(0(\.[\d]+)?|1(\.0+)?)\)$/;
	var dateRE = /^-?[\d]+\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
	var timeRE = /^([0-1]?\d|2[0-3]):[0-5]\d$/;
	var fulltimeRE = /^([0-1]?\d|2[0-3]):[0-5]\d:[0-5]\d$/;
	var timeOrFulltimeRE = /^([0-1]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
	var emailRE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var testPattern = {
		date: (v) => dateRE.test(v),
		time: (v) => timeRE.test(v),
		fulltime: (v) => fulltimeRE.test(v),
		timeOrFulltime: (v) => timeOrFulltimeRE.test(v),
		email: (v) => emailRE.test(v),
		hexColor: (v) => hexRE$1.test(v),
		hexaColor: (v) => hexaRE.test(v),
		hexOrHexaColor: (v) => hexOrHexaRE.test(v),
		rgbColor: (v) => rgbRE$1.test(v),
		rgbaColor: (v) => rgbaRE$1.test(v),
		rgbOrRgbaColor: (v) => rgbRE$1.test(v) || rgbaRE$1.test(v),
		hexOrRgbColor: (v) => hexRE$1.test(v) || rgbRE$1.test(v),
		hexaOrRgbaColor: (v) => hexaRE.test(v) || rgbaRE$1.test(v),
		anyColor: (v) => hexOrHexaRE.test(v) || rgbRE$1.test(v) || rgbaRE$1.test(v)
	};
	({
		...useDarkProps,
		...useFormProps
	});
	function useHydration() {
		const isHydrated = /* @__PURE__ */ ref(!isRuntimeSsrPreHydration.value);
		if (!isHydrated.value) onMounted(() => {
			isHydrated.value = true;
		});
		return { isHydrated };
	}
	var breaks = [
		-61,
		9,
		38,
		199,
		426,
		686,
		756,
		818,
		1111,
		1181,
		1210,
		1635,
		2060,
		2097,
		2192,
		2262,
		2324,
		2394,
		2456,
		3178
	];
	function toJalaali(gy, gm, gd) {
		if (Object.prototype.toString.call(gy) === "[object Date]") {
			gd = gy.getDate();
			gm = gy.getMonth() + 1;
			gy = gy.getFullYear();
		}
		return d2j(g2d(gy, gm, gd));
	}
	function toGregorian(jy, jm, jd) {
		return d2g(j2d(jy, jm, jd));
	}
	function isLeapJalaaliYear(jy) {
		return jalCalLeap(jy) === 0;
	}
	function jalaaliMonthLength(jy, jm) {
		if (jm <= 6) return 31;
		if (jm <= 11) return 30;
		if (isLeapJalaaliYear(jy)) return 30;
		return 29;
	}
	function jalCalLeap(jy) {
		const bl = breaks.length;
		let jp = breaks[0], jm, jump, leap, n, i;
		if (jy < jp || jy >= breaks[bl - 1]) throw new Error("Invalid Jalaali year " + jy);
		for (i = 1; i < bl; i += 1) {
			jm = breaks[i];
			jump = jm - jp;
			if (jy < jm) break;
			jp = jm;
		}
		n = jy - jp;
		if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
		leap = mod(mod(n + 1, 33) - 1, 4);
		if (leap === -1) leap = 4;
		return leap;
	}
	function jalCal(jy, withoutLeap) {
		const bl = breaks.length, gy = jy + 621;
		let leapJ = -14, jp = breaks[0], jm, jump, leap, n, i;
		if (jy < jp || jy >= breaks[bl - 1]) throw new Error("Invalid Jalaali year " + jy);
		for (i = 1; i < bl; i += 1) {
			jm = breaks[i];
			jump = jm - jp;
			if (jy < jm) break;
			leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
			jp = jm;
		}
		n = jy - jp;
		leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
		if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
		const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
		const march = 20 + leapJ - leapG;
		if (!withoutLeap) {
			if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
			leap = mod(mod(n + 1, 33) - 1, 4);
			if (leap === -1) leap = 4;
		}
		return {
			leap,
			gy,
			march
		};
	}
	function j2d(jy, jm, jd) {
		const r = jalCal(jy, true);
		return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
	}
	function d2j(jdn) {
		const gy = d2g(jdn).gy;
		let jy = gy - 621, jd, jm, k;
		const r = jalCal(jy, false);
		k = jdn - g2d(gy, 3, r.march);
		if (k >= 0) {
			if (k <= 185) {
				jm = 1 + div(k, 31);
				jd = mod(k, 31) + 1;
				return {
					jy,
					jm,
					jd
				};
			}
			k -= 186;
		} else {
			jy -= 1;
			k += 179;
			if (r.leap === 1) k += 1;
		}
		jm = 7 + div(k, 30);
		jd = mod(k, 30) + 1;
		return {
			jy,
			jm,
			jd
		};
	}
	function g2d(gy, gm, gd) {
		let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
		d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
		return d;
	}
	function d2g(jdn) {
		let j = 4 * jdn + 139361631;
		j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
		const i = div(mod(j, 1461), 4) * 5 + 308, gd = div(mod(i, 153), 5) + 1, gm = mod(div(i, 153), 12) + 1;
		return {
			gy: div(j, 1461) - 100100 + div(8 - gm, 6),
			gm,
			gd
		};
	}
	function div(a, b) {
		return Math.trunc(a / b);
	}
	function mod(a, b) {
		return a - Math.trunc(a / b) * b;
	}
	var calendars = ["gregorian", "persian"];
	var useDatetimeProps = {
		mask: { type: String },
		locale: Object,
		calendar: {
			type: String,
			validator: (v) => calendars.includes(v),
			default: "gregorian"
		},
		landscape: Boolean,
		color: String,
		textColor: String,
		square: Boolean,
		flat: Boolean,
		bordered: Boolean,
		readonly: Boolean,
		disable: Boolean
	};
	var useDatetimeEmits = ["update:modelValue"];
	function getDayHash(date) {
		return date.year + "/" + pad(date.month) + "/" + pad(date.day);
	}
	function useDatetime(props, $q) {
		const editable = computed(() => !props.disable && !props.readonly);
		const tabindex = computed(() => editable.value ? 0 : -1);
		const headerClass = computed(() => {
			const cls = [];
			if (props.color !== void 0) cls.push(`bg-${props.color}`);
			if (props.textColor !== void 0) cls.push(`text-${props.textColor}`);
			return cls.join(" ");
		});
		function getLocale() {
			return {
				formatNumber: $q.lang.formatNumber,
				...$q.lang.date,
				...props.locale
			};
		}
		function getCurrentDate(dateOnly) {
			const d = /* @__PURE__ */ new Date();
			const timeFill = dateOnly ? null : 0;
			if (props.calendar === "persian") {
				const jDate = toJalaali(d);
				return {
					year: jDate.jy,
					month: jDate.jm,
					day: jDate.jd
				};
			}
			return {
				year: d.getFullYear(),
				month: d.getMonth() + 1,
				day: d.getDate(),
				hour: timeFill,
				minute: timeFill,
				second: timeFill,
				millisecond: timeFill
			};
		}
		return {
			editable,
			tabindex,
			headerClass,
			getLocale,
			getCurrentDate
		};
	}
	var MILLISECONDS_IN_DAY = 864e5;
	var MILLISECONDS_IN_HOUR = 36e5;
	var MILLISECONDS_IN_MINUTE = 6e4;
	var defaultMask = "YYYY-MM-DDTHH:mm:ss.SSSZ";
	var token = /\[((?:[^\]\\]|\\]|\\)*)\]|do|d{1,4}|Mo|M{1,4}|m{1,2}|wo|w{1,2}|Qo|Do|DDDo|D{1,4}|YY(?:YY)?|GG(?:GG)?|H{1,2}|h{1,2}|s{1,2}|S{1,3}|Z{1,2}|a{1,2}|[AQExX]/g;
	var reverseToken = /(\[[^\]]*\])|do|d{1,4}|Mo|M{1,4}|m{1,2}|wo|w{1,2}|Qo|Do|DDDo|D{1,4}|YY(?:YY)?|GG(?:GG)?|H{1,2}|h{1,2}|s{1,2}|S{1,3}|Z{1,2}|a{1,2}|[AQExX]|([.*+:?^,\s${}()|\\]+)/g;
	var escapeRegexRE = /[.*+?^${}()|[\]\\]/g;
	var regexStore = /* @__PURE__ */ new Map();
	var localeStore = /* @__PURE__ */ new WeakMap();
	var escapeSortFn = (a, b) => b.length - a.length;
	function escapeRegex(str) {
		return str.replaceAll(escapeRegexRE, String.raw`\$&`);
	}
	function namesRegex(list) {
		return "(" + [...list].sort(escapeSortFn).map(escapeRegex).join("|") + ")";
	}
	function getLocaleData(dateLocale) {
		const cached = localeStore.get(dateLocale);
		if (cached !== void 0) return cached;
		const daysMinList = dateLocale.days.map((day) => day.slice(0, 2));
		const days = namesRegex(dateLocale.days), daysMin = namesRegex(daysMinList), daysShort = namesRegex(dateLocale.daysShort), months = namesRegex(dateLocale.months), monthsShort = namesRegex(dateLocale.monthsShort);
		const entry = {
			days,
			daysMin,
			daysShort,
			months,
			monthsShort,
			daysMinList,
			daysMinAreUnique: new Set(daysMinList).size === daysMinList.length,
			key: [
				days,
				daysShort,
				months,
				monthsShort
			].join("|")
		};
		localeStore.set(dateLocale, entry);
		return entry;
	}
	function getRegexData(mask, dateLocale) {
		const localeData = getLocaleData(dateLocale), { days, daysMin, daysShort, months, monthsShort } = localeData;
		const key = mask + "|" + localeData.key;
		if (regexStore.has(key)) return regexStore.get(key);
		const map = {};
		let index = 0;
		const regexText = mask.replace(reverseToken, (match) => {
			index++;
			switch (match) {
				case "YY":
					map.YY = index;
					return String.raw`(-?\d{1,2})`;
				case "YYYY":
					map.YYYY = index;
					return String.raw`(-?\d{1,4})`;
				case "M":
					map.M = index;
					return String.raw`(\d{1,2})`;
				case "Mo":
					map.M = index++;
					return String.raw`(\d{1,2}(st|nd|rd|th))`;
				case "MM":
					map.M = index;
					return String.raw`(\d{2})`;
				case "MMM":
					map.MMM = index;
					return monthsShort;
				case "MMMM":
					map.MMMM = index;
					return months;
				case "D":
					map.D = index;
					return String.raw`(\d{1,2})`;
				case "Do":
					map.D = index++;
					return String.raw`(\d{1,2}(st|nd|rd|th))`;
				case "DD":
					map.D = index;
					return String.raw`(\d{2})`;
				case "H":
					map.H = index;
					return String.raw`(\d{1,2})`;
				case "HH":
					map.H = index;
					return String.raw`(\d{2})`;
				case "h":
					map.h = index;
					return String.raw`(\d{1,2})`;
				case "hh":
					map.h = index;
					return String.raw`(\d{2})`;
				case "m":
					map.m = index;
					return String.raw`(\d{1,2})`;
				case "mm":
					map.m = index;
					return String.raw`(\d{2})`;
				case "s":
					map.s = index;
					return String.raw`(\d{1,2})`;
				case "ss":
					map.s = index;
					return String.raw`(\d{2})`;
				case "S":
					map.S = index;
					return String.raw`(\d{1})`;
				case "SS":
					map.S = index;
					return String.raw`(\d{2})`;
				case "SSS":
					map.S = index;
					return String.raw`(\d{3})`;
				case "A":
					map.A = index;
					return "(AM|PM)";
				case "a":
					map.a = index;
					return "(am|pm)";
				case "aa":
					map.aa = index;
					return String.raw`(a\.m\.|p\.m\.)`;
				case "dd":
					if (localeData.daysMinAreUnique) map.dd = index;
					return daysMin;
				case "ddd":
					map.ddd = index;
					return daysShort;
				case "dddd":
					map.dddd = index;
					return days;
				case "Q": return String.raw`(\d{1})`;
				case "d":
					map.d = index;
					return String.raw`(\d{1})`;
				case "E":
					map.E = index;
					return String.raw`(\d{1})`;
				case "do":
					map.d = index++;
					return String.raw`(\d{1}(st|nd|rd|th))`;
				case "Qo": return "(1st|2nd|3rd|4th)";
				case "DDD":
				case "DDDD": return String.raw`(\d{1,3})`;
				case "DDDo":
					index++;
					return String.raw`(\d{1,3}(st|nd|rd|th))`;
				case "w":
					map.w = index;
					return String.raw`(\d{1,2})`;
				case "wo":
					map.w = index++;
					return String.raw`(\d{1,2}(st|nd|rd|th))`;
				case "ww":
					map.w = index;
					return String.raw`(\d{2})`;
				case "GG":
					map.GG = index;
					return String.raw`(-?\d{1,2})`;
				case "GGGG":
					map.GGGG = index;
					return String.raw`(-?\d{1,4})`;
				case "Z":
					map.Z = index;
					return String.raw`(Z|[+-]\d{2}:\d{2})`;
				case "ZZ":
					map.ZZ = index;
					return String.raw`(Z|[+-]\d{2}\d{2})`;
				case "X":
					map.X = index;
					return String.raw`(-?\d+)`;
				case "x":
					map.x = index;
					return String.raw`(-?\d{4,})`;
				default:
					index--;
					if (match[0] === "[") match = match.slice(1, -1);
					return escapeRegex(match);
			}
		});
		const res = {
			map,
			regex: new RegExp("^" + regexText)
		};
		if (regexStore.size > 100) regexStore.clear();
		regexStore.set(key, res);
		return res;
	}
	function getDateLocale(paramDateLocale, langProps) {
		return paramDateLocale !== void 0 ? paramDateLocale : langProps !== void 0 ? langProps.date : en_US_default.date;
	}
	function formatTimezone(offset, delimeter = "") {
		const sign = offset > 0 ? "-" : "+", absOffset = Math.abs(offset), hours = Math.floor(absOffset / 60), minutes = absOffset % 60;
		return sign + pad(hours) + delimeter + pad(minutes);
	}
	function getExtractedISODay(match, map, langOpts) {
		if (map.E !== void 0) return Number.parseInt(match[map.E], 10);
		if (map.d !== void 0) {
			const day = Number.parseInt(match[map.d], 10);
			return day === 0 ? 7 : day;
		}
		if (map.dddd !== void 0) return langOpts.days.indexOf(match[map.dddd]) || 7;
		if (map.ddd !== void 0) return langOpts.daysShort.indexOf(match[map.ddd]) || 7;
		if (map.dd !== void 0) return getLocaleData(langOpts).daysMinList.indexOf(match[map.dd]) || 7;
		return 1;
	}
	function getISOWeekDate(weekYear, week, isoDay) {
		const jan4 = new Date(weekYear, 0, 4), date = new Date(weekYear, 0, 4 - (jan4.getDay() + 6) % 7 + (week - 1) * 7 + (isoDay - 1));
		return getWeekOfYear(date) === week ? date : null;
	}
	function __splitDate(str, mask, dateLocale, calendar, defaultModel) {
		const date = {
			year: null,
			month: null,
			day: null,
			hour: null,
			minute: null,
			second: null,
			millisecond: null,
			timezoneOffset: null,
			dateHash: null,
			timeHash: null
		};
		if (defaultModel !== void 0) Object.assign(date, defaultModel);
		if (str === void 0 || str === null || str === "" || typeof str !== "string") return date;
		if (mask === void 0) mask = defaultMask;
		const langOpts = getDateLocale(dateLocale, Plugin$7.props), months = langOpts.months, monthsShort = langOpts.monthsShort;
		const { regex, map } = getRegexData(mask, langOpts);
		const match = str.match(regex);
		if (match === null) return date;
		let tzString = "";
		if (map.X !== void 0 || map.x !== void 0) {
			const stamp = Number.parseInt(match[map.X ?? map.x], 10);
			if (Number.isNaN(stamp)) return date;
			const d = /* @__PURE__ */ new Date(stamp * (map.X !== void 0 ? 1e3 : 1));
			date.year = d.getFullYear();
			date.month = d.getMonth() + 1;
			date.day = d.getDate();
			date.hour = d.getHours();
			date.minute = d.getMinutes();
			date.second = d.getSeconds();
			date.millisecond = d.getMilliseconds();
		} else {
			if (map.YYYY !== void 0) date.year = Number.parseInt(match[map.YYYY], 10);
			else if (map.YY !== void 0) {
				const y = Number.parseInt(match[map.YY], 10);
				date.year = y < 0 ? y : 2e3 + y;
			}
			if (map.M !== void 0) {
				date.month = Number.parseInt(match[map.M], 10);
				if (date.month < 1 || date.month > 12) return date;
			} else if (map.MMM !== void 0) date.month = monthsShort.indexOf(match[map.MMM]) + 1;
			else if (map.MMMM !== void 0) date.month = months.indexOf(match[map.MMMM]) + 1;
			if (map.D !== void 0) {
				date.day = Number.parseInt(match[map.D], 10);
				if (date.year === null || date.month === null || date.day < 1) return date;
				const maxDay = calendar !== "persian" ? new Date(date.year, date.month, 0).getDate() : jalaaliMonthLength(date.year, date.month);
				if (date.day > maxDay) return date;
			}
			if (map.w !== void 0 && date.day === null) {
				const week = Number.parseInt(match[map.w], 10);
				if (week < 1 || week > 53) return date;
				let weekYear = date.year;
				if (map.GGGG !== void 0) weekYear = Number.parseInt(match[map.GGGG], 10);
				else if (map.GG !== void 0) {
					const y = Number.parseInt(match[map.GG], 10);
					weekYear = y < 0 ? y : 2e3 + y;
				}
				if (weekYear === null) return date;
				const isoDay = getExtractedISODay(match, map, langOpts);
				if (isoDay < 1 || isoDay > 7) return date;
				const weekDate = getISOWeekDate(weekYear, week, isoDay);
				if (weekDate === null) return date;
				date.year = weekDate.getFullYear();
				date.month = weekDate.getMonth() + 1;
				date.day = weekDate.getDate();
			}
			if (map.H !== void 0) {
				date.hour = Number.parseInt(match[map.H], 10);
				if (date.hour > 23) {
					date.hour = null;
					return date;
				}
			} else if (map.h !== void 0) {
				date.hour = Number.parseInt(match[map.h], 10);
				if (date.hour < 1 || date.hour > 12) {
					date.hour = null;
					return date;
				}
				date.hour %= 12;
				if (map.A && match[map.A] === "PM" || map.a && match[map.a] === "pm" || map.aa && match[map.aa] === "p.m.") date.hour += 12;
				date.hour = date.hour % 24;
			}
			if (map.m !== void 0) {
				date.minute = Number.parseInt(match[map.m], 10);
				if (date.minute > 59) {
					date.minute = null;
					return date;
				}
			}
			if (map.s !== void 0) {
				date.second = Number.parseInt(match[map.s], 10);
				if (date.second > 59) {
					date.second = null;
					return date;
				}
			}
			if (map.S !== void 0) date.millisecond = Number.parseInt(match[map.S], 10) * 10 ** (3 - match[map.S].length);
			if (map.Z !== void 0 || map.ZZ !== void 0) {
				tzString = map.Z !== void 0 ? match[map.Z].replace(":", "") : match[map.ZZ];
				if (tzString === "Z") date.timezoneOffset = 0;
				else {
					const tzHours = Number(tzString.slice(1, 3)), tzMinutes = Number(tzString.slice(3, 5));
					if (tzHours > 23 || tzMinutes > 59) return date;
					date.timezoneOffset = (tzString[0] === "+" ? -1 : 1) * (60 * tzHours + tzMinutes);
				}
			}
		}
		date.dateHash = pad(date.year, 4) + "/" + pad(date.month) + "/" + pad(date.day);
		date.timeHash = pad(date.hour) + ":" + pad(date.minute) + ":" + pad(date.second) + tzString;
		return date;
	}
	function getISOWeekThursday(date) {
		const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		thursday.setDate(thursday.getDate() - (thursday.getDay() + 6) % 7 + 3);
		return thursday;
	}
	function getWeekOfYear(date) {
		const thursday = getISOWeekThursday(date);
		const firstThursday = getISOWeekThursday(new Date(thursday.getFullYear(), 0, 4));
		const ds = thursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
		thursday.setMinutes(thursday.getMinutes() - ds);
		const weekDiff = (thursday - firstThursday) / (MILLISECONDS_IN_DAY * 7);
		return 1 + Math.floor(weekDiff);
	}
	function getISOWeekYear(date) {
		return getISOWeekThursday(date).getFullYear();
	}
	function startOfDate(date, unit, utc) {
		const t = new Date(date), prefix = `set${utc ? "UTC" : ""}`;
		switch (unit) {
			case "year":
			case "years": t[`${prefix}Month`](0);
			case "month":
			case "months": t[`${prefix}Date`](1);
			case "day":
			case "days":
			case "date": t[`${prefix}Hours`](0);
			case "hour":
			case "hours": t[`${prefix}Minutes`](0);
			case "minute":
			case "minutes": t[`${prefix}Seconds`](0);
			case "second":
			case "seconds": t[`${prefix}Milliseconds`](0);
		}
		return t;
	}
	function getDiff(t, sub, interval) {
		return (t.getTime() - t.getTimezoneOffset() * MILLISECONDS_IN_MINUTE - (sub.getTime() - sub.getTimezoneOffset() * MILLISECONDS_IN_MINUTE)) / interval;
	}
	function getDateDiff(date, subtract, unit = "days") {
		const t = new Date(date), sub = new Date(subtract);
		switch (unit) {
			case "years":
			case "year": return t.getFullYear() - sub.getFullYear();
			case "months":
			case "month": return (t.getFullYear() - sub.getFullYear()) * 12 + t.getMonth() - sub.getMonth();
			case "days":
			case "day":
			case "date": return getDiff(startOfDate(t, "day"), startOfDate(sub, "day"), MILLISECONDS_IN_DAY);
			case "hours":
			case "hour": return getDiff(startOfDate(t, "hour"), startOfDate(sub, "hour"), MILLISECONDS_IN_HOUR);
			case "minutes":
			case "minute": return getDiff(startOfDate(t, "minute"), startOfDate(sub, "minute"), MILLISECONDS_IN_MINUTE);
			case "seconds":
			case "second": return getDiff(startOfDate(t, "second"), startOfDate(sub, "second"), 1e3);
		}
	}
	function getDayOfYear(date) {
		return getDateDiff(date, startOfDate(date, "year"), "days") + 1;
	}
	function getOrdinal(n) {
		if (n >= 11 && n <= 13) return `${n}th`;
		switch (n % 10) {
			case 1: return `${n}st`;
			case 2: return `${n}nd`;
			case 3: return `${n}rd`;
		}
		return `${n}th`;
	}
	var formatter = {
		YY(date, dateLocale, forcedYear) {
			const y = this.YYYY(date, dateLocale, forcedYear) % 100;
			return y >= 0 ? pad(y) : "-" + pad(Math.abs(y));
		},
		YYYY(date, _dateLocale, forcedYear) {
			return forcedYear !== void 0 && forcedYear !== null ? forcedYear : date.getFullYear();
		},
		M(date) {
			return date.getMonth() + 1;
		},
		Mo(date) {
			return getOrdinal(date.getMonth() + 1);
		},
		MM(date) {
			return pad(date.getMonth() + 1);
		},
		MMM(date, dateLocale) {
			return dateLocale.monthsShort[date.getMonth()];
		},
		MMMM(date, dateLocale) {
			return dateLocale.months[date.getMonth()];
		},
		Q(date) {
			return Math.ceil((date.getMonth() + 1) / 3);
		},
		Qo(date) {
			return getOrdinal(this.Q(date));
		},
		D(date) {
			return date.getDate();
		},
		Do(date) {
			return getOrdinal(date.getDate());
		},
		DD(date) {
			return pad(date.getDate());
		},
		DDD(date) {
			return getDayOfYear(date);
		},
		DDDo(date) {
			return getOrdinal(getDayOfYear(date));
		},
		DDDD(date) {
			return pad(getDayOfYear(date), 3);
		},
		d(date) {
			return date.getDay();
		},
		do(date) {
			return getOrdinal(date.getDay());
		},
		dd(date, dateLocale) {
			return dateLocale.days[date.getDay()].slice(0, 2);
		},
		ddd(date, dateLocale) {
			return dateLocale.daysShort[date.getDay()];
		},
		dddd(date, dateLocale) {
			return dateLocale.days[date.getDay()];
		},
		E(date) {
			return date.getDay() || 7;
		},
		w(date) {
			return getWeekOfYear(date);
		},
		wo(date) {
			return getOrdinal(getWeekOfYear(date));
		},
		ww(date) {
			return pad(getWeekOfYear(date));
		},
		GG(date, dateLocale, forcedYear) {
			const y = this.GGGG(date, dateLocale, forcedYear) % 100;
			return y >= 0 ? pad(y) : "-" + pad(Math.abs(y));
		},
		GGGG(date, _dateLocale, forcedYear) {
			return forcedYear !== void 0 && forcedYear !== null ? forcedYear : getISOWeekYear(date);
		},
		H(date) {
			return date.getHours();
		},
		HH(date) {
			return pad(date.getHours());
		},
		h(date) {
			const hours = date.getHours();
			return hours === 0 ? 12 : hours > 12 ? hours % 12 : hours;
		},
		hh(date) {
			return pad(this.h(date));
		},
		m(date) {
			return date.getMinutes();
		},
		mm(date) {
			return pad(date.getMinutes());
		},
		s(date) {
			return date.getSeconds();
		},
		ss(date) {
			return pad(date.getSeconds());
		},
		S(date) {
			return Math.floor(date.getMilliseconds() / 100);
		},
		SS(date) {
			return pad(Math.floor(date.getMilliseconds() / 10));
		},
		SSS(date) {
			return pad(date.getMilliseconds(), 3);
		},
		A(date) {
			return date.getHours() < 12 ? "AM" : "PM";
		},
		a(date) {
			return date.getHours() < 12 ? "am" : "pm";
		},
		aa(date) {
			return date.getHours() < 12 ? "a.m." : "p.m.";
		},
		Z(date, _dateLocale, _forcedYear, forcedTimezoneOffset) {
			return formatTimezone(forcedTimezoneOffset === void 0 || forcedTimezoneOffset === null ? date.getTimezoneOffset() : forcedTimezoneOffset, ":");
		},
		ZZ(date, _dateLocale, _forcedYear, forcedTimezoneOffset) {
			return formatTimezone(forcedTimezoneOffset === void 0 || forcedTimezoneOffset === null ? date.getTimezoneOffset() : forcedTimezoneOffset);
		},
		X(date) {
			return Math.floor(date.getTime() / 1e3);
		},
		x(date) {
			return date.getTime();
		}
	};
	var formatStore = /* @__PURE__ */ new Map();
	function compileMask(mask) {
		const parts = [];
		let index = 0;
		mask.replace(token, (match, text, offset) => {
			if (offset > index) parts.push(mask.slice(index, offset));
			index = offset + match.length;
			parts.push(match in formatter ? formatter[match] : text === void 0 ? match : text.split(String.raw`\]`).join("]"));
		});
		if (index < mask.length) parts.push(mask.slice(index));
		return parts;
	}
	function formatDate(val, mask, dateLocale, __forcedYear, __forcedTimezoneOffset) {
		if (val !== 0 && !val || val === Infinity || val === -Infinity) return;
		const date = new Date(val);
		if (Number.isNaN(date.getTime())) return;
		if (mask === void 0) mask = defaultMask;
		const locale = getDateLocale(dateLocale, Plugin$7.props);
		let parts = formatStore.get(mask);
		if (parts === void 0) {
			if (formatStore.size > 100) formatStore.clear();
			parts = compileMask(mask);
			formatStore.set(mask, parts);
		}
		let acc = "";
		for (const part of parts) acc += typeof part === "function" ? part.call(formatter, date, locale, __forcedYear, __forcedTimezoneOffset) : part;
		return acc;
	}
	var yearsInterval = 20;
	var views = [
		"Calendar",
		"Years",
		"Months"
	];
	var viewIsValid = (v) => views.includes(v);
	var yearMonthRE = /^-?[\d]+\/[0-1]\d$/;
	var yearMonthValidator = (v) => yearMonthRE.test(v);
	var lineStr = " — ";
	function getMonthHash(date) {
		return date.year + "/" + pad(date.month);
	}
	function preventSpace$3(e) {
		if (e.keyCode === 32) stopAndPrevent(e);
	}
	function getShortDate(date) {
		return {
			year: date.year,
			month: date.month,
			day: date.day
		};
	}
	var QDate_default = /*#__PURE__*/ createComponent({
		name: "QDate",
		props: {
			...useDatetimeProps,
			...useFormProps,
			...useDarkProps,
			modelValue: {
				required: true,
				default: null,
				validator: (val) => typeof val === "string" || Array.isArray(val) || Object(val) === val || val === null
			},
			multiple: Boolean,
			range: Boolean,
			title: String,
			subtitle: String,
			mask: {
				...useDatetimeProps.mask,
				default: "YYYY/MM/DD"
			},
			defaultYearMonth: {
				type: String,
				validator: yearMonthValidator
			},
			yearsInMonthView: Boolean,
			events: [Array, Function],
			eventColor: [String, Function],
			emitImmediately: Boolean,
			options: [Array, Function],
			navigationMinYearMonth: {
				type: String,
				validator: yearMonthValidator
			},
			navigationMaxYearMonth: {
				type: String,
				validator: yearMonthValidator
			},
			noUnset: Boolean,
			firstDayOfWeek: [String, Number],
			todayBtn: Boolean,
			minimal: Boolean,
			defaultView: {
				type: String,
				default: "Calendar",
				validator: viewIsValid
			}
		},
		emits: [
			...useDatetimeEmits,
			"rangeStart",
			"rangeEnd",
			"navigation"
		],
		setup(props, { slots, emit }) {
			const { proxy } = getCurrentInstance();
			const $q = useQuasar();
			const isDark = useDark(props, $q);
			const { getCache } = useRenderCache();
			const { isHydrated } = useHydration();
			const { tabindex, headerClass, getLocale, getCurrentDate } = useDatetime(props, $q);
			let lastEmitValue;
			const injectFormInput = useFormInject(useFormAttrs(props));
			const blurTargetRef = /* @__PURE__ */ shallowRef(null);
			const roverRef = /* @__PURE__ */ shallowRef(null);
			const innerMask = /* @__PURE__ */ ref(getMask());
			const innerLocale = /* @__PURE__ */ ref(getLocale());
			function fmtNum(value) {
				const str = String(value);
				return innerLocale.value.formatNumber?.(str) ?? str;
			}
			const focusedDay = /* @__PURE__ */ ref(null);
			let pendingFocusDay = null;
			const mask = computed(() => getMask());
			const locale = computed(() => getLocale());
			const today = computed(() => getCurrentDate());
			const viewModel = /* @__PURE__ */ ref(getViewModel(innerMask.value, innerLocale.value));
			const view = /* @__PURE__ */ ref(props.defaultView);
			const direction = computed(() => $q.lang.rtl ? "right" : "left");
			const monthDirection = /* @__PURE__ */ ref(direction.value);
			const yearDirection = /* @__PURE__ */ ref(direction.value);
			const localYear = viewModel.value.year;
			const startYear = /* @__PURE__ */ ref(localYear - localYear % yearsInterval - (localYear < 0 ? yearsInterval : 0));
			const editRange = /* @__PURE__ */ ref(null);
			const classes = computed(() => {
				const type = props.landscape ? "landscape" : "portrait";
				return `q-date q-date--${type} q-date--${type}-${props.minimal ? "minimal" : "standard"}` + (isDark() ? " q-date--dark q-dark" : "") + (props.bordered ? " q-date--bordered" : "") + (props.square ? " q-date--square no-border-radius" : "") + (props.flat ? " q-date--flat no-shadow" : "") + (props.disable ? " disabled" : props.readonly ? " q-date--readonly" : "");
			});
			const computedColor = computed(() => props.color || "primary");
			const computedTextColor = computed(() => props.textColor || "white");
			const isImmediate = computed(() => props.emitImmediately && !props.multiple && !props.range);
			const normalizedModel = computed(() => Array.isArray(props.modelValue) ? props.modelValue : props.modelValue !== null && props.modelValue !== void 0 ? [props.modelValue] : []);
			const daysModel = computed(() => normalizedModel.value.filter((date) => typeof date === "string").map((date) => decodeString(date, innerMask.value, innerLocale.value)).filter((date) => date.dateHash !== null && date.day !== null && date.month !== null && date.year !== null));
			const rangeModel = computed(() => {
				const fn = (date) => decodeString(date, innerMask.value, innerLocale.value);
				return normalizedModel.value.filter((date) => isObject(date) && date.from !== void 0 && date.to !== void 0).map((range) => ({
					from: fn(range.from),
					to: fn(range.to)
				})).filter((range) => range.from.dateHash !== null && range.to.dateHash !== null && range.from.dateHash < range.to.dateHash);
			});
			const getNativeDateFn = computed(() => props.calendar !== "persian" ? (model) => new Date(model.year, model.month - 1, model.day) : (model) => {
				const gDate = toGregorian(model.year, model.month, model.day);
				return new Date(gDate.gy, gDate.gm - 1, gDate.gd);
			});
			const encodeObjectFn = computed(() => props.calendar === "persian" ? getDayHash : (date, dateMask, dateLocale) => formatDate(new Date(date.year, date.month - 1, date.day, date.hour, date.minute, date.second, date.millisecond), dateMask === void 0 ? innerMask.value : dateMask, dateLocale === void 0 ? innerLocale.value : dateLocale, date.year, date.timezoneOffset));
			const daysInModel = computed(() => daysModel.value.length + rangeModel.value.reduce((acc, range) => acc + 1 + getDateDiff(getNativeDateFn.value(range.to), getNativeDateFn.value(range.from)), 0));
			const headerTitle = computed(() => {
				if (props.title !== void 0 && props.title !== null && props.title.length !== 0) return props.title;
				if (editRange.value !== null) {
					const model = editRange.value.init;
					const date = getNativeDateFn.value(model);
					return innerLocale.value.daysShort[date.getDay()] + ", " + innerLocale.value.monthsShort[model.month - 1] + " " + fmtNum(model.day) + " — ?";
				}
				if (daysInModel.value === 0) return lineStr;
				if (daysInModel.value > 1) return `${fmtNum(daysInModel.value)} ${innerLocale.value.pluralDay}`;
				const model = daysModel.value[0];
				const date = getNativeDateFn.value(model);
				if (Number.isNaN(date.valueOf())) return lineStr;
				if (innerLocale.value.headerTitle !== void 0) return innerLocale.value.headerTitle(date, model);
				return innerLocale.value.daysShort[date.getDay()] + ", " + innerLocale.value.monthsShort[model.month - 1] + " " + fmtNum(model.day);
			});
			const minSelectedModel = computed(() => {
				return [...daysModel.value, ...rangeModel.value.map((range) => range.from)].sort((a, b) => a.year - b.year || a.month - b.month)[0];
			});
			const maxSelectedModel = computed(() => {
				return [...daysModel.value, ...rangeModel.value.map((range) => range.to)].sort((a, b) => b.year - a.year || b.month - a.month)[0];
			});
			const headerSubtitle = computed(() => {
				if (props.subtitle !== void 0 && props.subtitle !== null && props.subtitle.length !== 0) return props.subtitle;
				if (daysInModel.value === 0) return lineStr;
				if (daysInModel.value > 1) {
					const from = minSelectedModel.value;
					const to = maxSelectedModel.value;
					const month = innerLocale.value.monthsShort;
					return month[from.month - 1] + (from.year !== to.year ? " " + fmtNum(from.year) + lineStr + month[to.month - 1] + " " : from.month !== to.month ? lineStr + month[to.month - 1] : "") + " " + fmtNum(to.year);
				}
				return fmtNum(daysModel.value[0].year);
			});
			const dateArrow = computed(() => {
				const val = [$q.iconSet.datetime.arrowLeft, $q.iconSet.datetime.arrowRight];
				return $q.lang.rtl ? val.reverse() : val;
			});
			const computedFirstDayOfWeek = computed(() => props.firstDayOfWeek !== void 0 ? Number(props.firstDayOfWeek) : innerLocale.value.firstDayOfWeek);
			const daysOfWeek = computed(() => {
				const days = innerLocale.value.daysShort, first = computedFirstDayOfWeek.value;
				return first > 0 ? [...days.slice(first, 7), ...days.slice(0, first)] : days;
			});
			const daysInMonth = computed(() => {
				const date = viewModel.value;
				return props.calendar !== "persian" ? new Date(date.year, date.month, 0).getDate() : jalaaliMonthLength(date.year, date.month);
			});
			const evtColor = computed(() => typeof props.eventColor === "function" ? props.eventColor : () => props.eventColor);
			const minNav = computed(() => {
				if (props.navigationMinYearMonth === void 0) return null;
				const data = props.navigationMinYearMonth.split("/");
				return {
					year: Number.parseInt(data[0], 10),
					month: Number.parseInt(data[1], 10)
				};
			});
			const maxNav = computed(() => {
				if (props.navigationMaxYearMonth === void 0) return null;
				const data = props.navigationMaxYearMonth.split("/");
				return {
					year: Number.parseInt(data[0], 10),
					month: Number.parseInt(data[1], 10)
				};
			});
			const navBoundaries = computed(() => {
				const data = {
					month: {
						prev: true,
						next: true
					},
					year: {
						prev: true,
						next: true
					}
				};
				if (minNav.value !== null && minNav.value.year >= viewModel.value.year) {
					data.year.prev = false;
					if (minNav.value.year === viewModel.value.year && minNav.value.month >= viewModel.value.month) data.month.prev = false;
				}
				if (maxNav.value !== null && maxNav.value.year <= viewModel.value.year) {
					data.year.next = false;
					if (maxNav.value.year === viewModel.value.year && maxNav.value.month <= viewModel.value.month) data.month.next = false;
				}
				return data;
			});
			const daysMap = computed(() => {
				const map = {};
				daysModel.value.forEach((entry) => {
					const hash = getMonthHash(entry);
					if (map[hash] === void 0) map[hash] = [];
					map[hash].push(entry.day);
				});
				return map;
			});
			const rangeMap = computed(() => {
				const map = {};
				rangeModel.value.forEach((entry) => {
					const hashFrom = getMonthHash(entry.from);
					const hashTo = getMonthHash(entry.to);
					if (map[hashFrom] === void 0) map[hashFrom] = [];
					map[hashFrom].push({
						from: entry.from.day,
						to: hashFrom === hashTo ? entry.to.day : void 0,
						range: entry
					});
					if (hashFrom < hashTo) {
						let hash;
						const { year, month } = entry.from;
						const cur = month < 12 ? {
							year,
							month: month + 1
						} : {
							year: year + 1,
							month: 1
						};
						while ((hash = getMonthHash(cur)) <= hashTo) {
							if (map[hash] === void 0) map[hash] = [];
							map[hash].push({
								from: void 0,
								to: hash === hashTo ? entry.to.day : void 0,
								range: entry
							});
							cur.month++;
							if (cur.month > 12) {
								cur.year++;
								cur.month = 1;
							}
						}
					}
				});
				return map;
			});
			const rangeView = computed(() => {
				if (editRange.value === null) return;
				const { init, initHash, final, finalHash } = editRange.value;
				const [from, to] = initHash <= finalHash ? [init, final] : [final, init];
				const fromHash = getMonthHash(from);
				const toHash = getMonthHash(to);
				if (fromHash !== viewMonthHash.value && toHash !== viewMonthHash.value) return;
				const localView = {};
				if (fromHash === viewMonthHash.value) {
					localView.from = from.day;
					localView.includeFrom = true;
				} else localView.from = 1;
				if (toHash === viewMonthHash.value) {
					localView.to = to.day;
					localView.includeTo = true;
				} else localView.to = daysInMonth.value;
				return localView;
			});
			const viewMonthHash = computed(() => getMonthHash(viewModel.value));
			const selectionDaysMap = computed(() => {
				const map = {};
				if (props.options === void 0) {
					for (let i = 1; i <= daysInMonth.value; i++) map[i] = true;
					return map;
				}
				const fn = typeof props.options === "function" ? props.options : (date) => props.options.includes(date);
				for (let i = 1; i <= daysInMonth.value; i++) {
					const dayHash = viewMonthHash.value + "/" + pad(i);
					map[i] = fn(dayHash);
				}
				return map;
			});
			const eventDaysMap = computed(() => {
				const map = {};
				if (props.events === void 0) for (let i = 1; i <= daysInMonth.value; i++) map[i] = false;
				else {
					const fn = typeof props.events === "function" ? props.events : (date) => props.events.includes(date);
					for (let i = 1; i <= daysInMonth.value; i++) {
						const dayHash = viewMonthHash.value + "/" + pad(i);
						if (fn(dayHash)) {
							const color = evtColor.value(dayHash);
							map[i] = "q-date__event" + (color ? ` bg-${color}` : "");
						} else map[i] = false;
					}
				}
				return map;
			});
			const viewDays = computed(() => {
				let date, endDay;
				const { year, month } = viewModel.value;
				if (props.calendar !== "persian") {
					date = new Date(year, month - 1, 1);
					endDay = new Date(year, month - 1, 0).getDate();
				} else {
					const gDate = toGregorian(year, month, 1);
					date = new Date(gDate.gy, gDate.gm - 1, gDate.gd);
					let prevJM = month - 1;
					let prevJY = year;
					if (prevJM === 0) {
						prevJM = 12;
						prevJY--;
					}
					endDay = jalaaliMonthLength(prevJY, prevJM);
				}
				return {
					days: date.getDay() - computedFirstDayOfWeek.value - 1,
					endDay
				};
			});
			const days = computed(() => {
				const res = [];
				const { days: localDays, endDay } = viewDays.value;
				const len = localDays < 0 ? localDays + 7 : localDays;
				if (len < 6) for (let i = endDay - len; i <= endDay; i++) res.push({
					i,
					fill: true
				});
				const index = res.length;
				for (let i = 1; i <= daysInMonth.value; i++) {
					const day = {
						i,
						event: eventDaysMap.value[i],
						classes: []
					};
					if (selectionDaysMap.value[i]) {
						day.in = true;
						day.flat = true;
					}
					res.push(day);
				}
				if (daysMap.value[viewMonthHash.value] !== void 0) daysMap.value[viewMonthHash.value].forEach((day) => {
					const i = index + day - 1;
					Object.assign(res[i], {
						selected: true,
						unelevated: true,
						flat: false,
						color: computedColor.value,
						textColor: computedTextColor.value
					});
				});
				if (rangeMap.value[viewMonthHash.value] !== void 0) rangeMap.value[viewMonthHash.value].forEach((entry) => {
					if (entry.from !== void 0) {
						const from = index + entry.from - 1;
						const to = index + (entry.to || daysInMonth.value) - 1;
						for (let day = from; day <= to; day++) Object.assign(res[day], {
							range: entry.range,
							unelevated: true,
							color: computedColor.value,
							textColor: computedTextColor.value
						});
						Object.assign(res[from], {
							rangeFrom: true,
							flat: false
						});
						if (entry.to !== void 0) Object.assign(res[to], {
							rangeTo: true,
							flat: false
						});
					} else if (entry.to !== void 0) {
						const to = index + entry.to - 1;
						for (let day = index; day <= to; day++) Object.assign(res[day], {
							range: entry.range,
							unelevated: true,
							color: computedColor.value,
							textColor: computedTextColor.value
						});
						Object.assign(res[to], {
							flat: false,
							rangeTo: true
						});
					} else {
						const to = index + daysInMonth.value - 1;
						for (let day = index; day <= to; day++) Object.assign(res[day], {
							range: entry.range,
							unelevated: true,
							color: computedColor.value,
							textColor: computedTextColor.value
						});
					}
				});
				if (rangeView.value !== void 0) {
					const from = index + rangeView.value.from - 1;
					const to = index + rangeView.value.to - 1;
					for (let day = from; day <= to; day++) {
						res[day].color = computedColor.value;
						res[day].editRange = true;
					}
					if (rangeView.value.includeFrom) res[from].editRangeFrom = true;
					if (rangeView.value.includeTo) res[to].editRangeTo = true;
				}
				if (isHydrated.value && viewModel.value.year === today.value.year && viewModel.value.month === today.value.month) res[index + today.value.day - 1].today = true;
				const left = res.length % 7;
				if (left > 0) {
					const afterDays = 7 - left;
					for (let i = 1; i <= afterDays; i++) res.push({
						i,
						fill: true
					});
				}
				res.forEach((day) => {
					let cls = "q-date__calendar-item ";
					if (day.fill) cls += "q-date__calendar-item--fill";
					else {
						cls += `q-date__calendar-item--${day.in ? "in" : "out"}`;
						if (day.range !== void 0) cls += ` q-date__range${day.rangeTo ? "-to" : day.rangeFrom ? "-from" : ""}`;
						if (day.editRange) cls += ` q-date__edit-range${day.editRangeFrom ? "-from" : ""}${day.editRangeTo ? "-to" : ""}`;
						if (day.range !== void 0 || day.editRange) cls += ` text-${day.color}`;
					}
					day.classes = cls;
				});
				return res;
			});
			const keyboardDays = computed(() => days.value.filter((day) => day.in === true).map((day) => day.i));
			const firstDayOffset = computed(() => days.value.findIndex((day) => day.fill !== true));
			const roverDay = computed(() => {
				const list = keyboardDays.value;
				if (list.length === 0) return null;
				if (focusedDay.value !== null && list.includes(focusedDay.value)) return focusedDay.value;
				const target = days.value.find((day) => day.in === true && (day.selected === true || day.rangeFrom === true)) ?? days.value.find((day) => day.in === true && day.today === true);
				return target !== void 0 ? target.i : list[0];
			});
			const attributes = computed(() => props.disable ? { "aria-disabled": "true" } : {});
			watch(() => props.modelValue, (v) => {
				if (lastEmitValue === JSON.stringify(v)) lastEmitValue = 0;
				else {
					const model = getViewModel(innerMask.value, innerLocale.value);
					updateViewModel(model.year, model.month, model);
				}
			});
			watch(view, () => {
				if (blurTargetRef.value !== null && proxy.$el.contains(document.activeElement)) blurTargetRef.value.focus({ preventScroll: true });
			});
			watch(() => viewModel.value.year + "|" + viewModel.value.month, () => {
				emit("navigation", {
					year: viewModel.value.year,
					month: viewModel.value.month
				});
			});
			watch(mask, (val) => {
				updateValue(val, innerLocale.value, "mask");
				innerMask.value = val;
			});
			watch(locale, (val) => {
				updateValue(innerMask.value, val, "locale");
				innerLocale.value = val;
			});
			watch(viewMonthHash, () => {
				if (pendingFocusDay !== null) {
					const target = pendingFocusDay <= 0 ? daysInMonth.value + pendingFocusDay : Math.min(pendingFocusDay, daysInMonth.value);
					const dir = pendingFocusDay <= 0 ? -1 : 1;
					pendingFocusDay = null;
					const day = seekDay(Math.max(1, target), dir) ?? seekDay(Math.max(1, target), -dir);
					if (day !== null) setRover(day);
				} else focusedDay.value = null;
			}, { flush: "post" });
			function setLastValue(v) {
				lastEmitValue = JSON.stringify(v);
			}
			function setToday() {
				const { year, month, day } = today.value;
				const date = {
					...viewModel.value,
					year,
					month,
					day
				};
				const monthMap = daysMap.value[getMonthHash(date)];
				if (monthMap === void 0 || !monthMap.includes(date.day)) addToModel(date);
				setCalendarTo(date.year, date.month);
			}
			function setView(viewMode) {
				if (viewIsValid(viewMode)) view.value = viewMode;
			}
			function offsetCalendar(type, descending) {
				if (["month", "year"].includes(type)) (type === "month" ? goToMonth : goToYear)(descending ? -1 : 1);
			}
			function setCalendarTo(year, month) {
				view.value = "Calendar";
				updateViewModel(year, month);
			}
			function setEditingRange(from, to) {
				if (!props.range || !from) {
					editRange.value = null;
					return;
				}
				const init = {
					...viewModel.value,
					...from
				};
				const final = to !== void 0 ? {
					...viewModel.value,
					...to
				} : init;
				editRange.value = {
					init,
					initHash: getDayHash(init),
					final,
					finalHash: getDayHash(final)
				};
				setCalendarTo(init.year, init.month);
			}
			function getMask() {
				return props.calendar === "persian" ? "YYYY/MM/DD" : props.mask;
			}
			function decodeString(date, dateMask, dateLocale) {
				return __splitDate(date, dateMask, dateLocale, props.calendar, {
					hour: 0,
					minute: 0,
					second: 0,
					millisecond: 0
				});
			}
			function getViewModel(dateMask, dateLocale) {
				const model = Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : [];
				if (model.length === 0) return getDefaultViewModel();
				const target = model.at(-1);
				const decoded = decodeString(target.from !== void 0 ? target.from : target, dateMask, dateLocale);
				return decoded.dateHash === null ? getDefaultViewModel() : decoded;
			}
			function getDefaultViewModel() {
				let year, month;
				if (props.defaultYearMonth !== void 0) {
					const d = props.defaultYearMonth.split("/");
					year = Number.parseInt(d[0], 10);
					month = Number.parseInt(d[1], 10);
				} else {
					const d = today.value !== void 0 ? today.value : getCurrentDate();
					year = d.year;
					month = d.month;
				}
				return {
					year,
					month,
					day: 1,
					hour: 0,
					minute: 0,
					second: 0,
					millisecond: 0,
					dateHash: year + "/" + pad(month) + "/01"
				};
			}
			function goToMonth(offset) {
				let year = viewModel.value.year;
				let month = Number(viewModel.value.month) + offset;
				if (month === 13) {
					month = 1;
					year++;
				} else if (month === 0) {
					month = 12;
					year--;
				}
				updateViewModel(year, month);
				if (isImmediate.value) emitImmediately("month");
			}
			function goToYear(offset) {
				updateViewModel(Number(viewModel.value.year) + offset, viewModel.value.month);
				if (isImmediate.value) emitImmediately("year");
			}
			function setYear(year) {
				updateViewModel(year, viewModel.value.month);
				view.value = props.defaultView === "Years" ? "Months" : "Calendar";
				if (isImmediate.value) emitImmediately("year");
			}
			function setMonth(month) {
				updateViewModel(viewModel.value.year, month);
				view.value = "Calendar";
				if (isImmediate.value) emitImmediately("month");
			}
			function toggleDate(date, monthHash) {
				(daysMap.value[monthHash]?.includes(date.day) === true ? removeFromModel : addToModel)(date);
			}
			function updateViewModel(year, month, time) {
				if (minNav.value !== null && year <= minNav.value.year) {
					if (month < minNav.value.month || year < minNav.value.year) month = minNav.value.month;
					year = minNav.value.year;
				}
				if (maxNav.value !== null && year >= maxNav.value.year) {
					if (month > maxNav.value.month || year > maxNav.value.year) month = maxNav.value.month;
					year = maxNav.value.year;
				}
				if (time !== void 0) {
					const { hour, minute, second, millisecond, timezoneOffset, timeHash } = time;
					Object.assign(viewModel.value, {
						hour,
						minute,
						second,
						millisecond,
						timezoneOffset,
						timeHash
					});
				}
				const newHash = year + "/" + pad(month) + "/01";
				if (newHash !== viewModel.value.dateHash) {
					monthDirection.value = viewModel.value.dateHash < newHash === ($q.lang.rtl !== true) ? "left" : "right";
					if (year !== viewModel.value.year) yearDirection.value = monthDirection.value;
					nextTick(() => {
						startYear.value = year - year % yearsInterval - (year < 0 ? yearsInterval : 0);
						Object.assign(viewModel.value, {
							year,
							month,
							day: 1,
							dateHash: newHash
						});
					});
				}
			}
			function emitValue(val, action, date) {
				const value = val !== null && val.length === 1 && !props.multiple ? val[0] : val;
				const { reason, details } = getEmitParams(action, date);
				setLastValue(value);
				emit("update:modelValue", value, reason, details);
			}
			function emitImmediately(reason) {
				const date = daysModel.value[0] !== void 0 && daysModel.value[0].dateHash !== null ? { ...daysModel.value[0] } : { ...viewModel.value };
				nextTick(() => {
					date.year = viewModel.value.year;
					date.month = viewModel.value.month;
					const maxDay = props.calendar !== "persian" ? new Date(date.year, date.month, 0).getDate() : jalaaliMonthLength(date.year, date.month);
					date.day = Math.min(Math.max(1, date.day), maxDay);
					const value = encodeEntry(date);
					const { details } = getEmitParams("", date);
					setLastValue(value);
					emit("update:modelValue", value, reason, details);
				});
			}
			function getEmitParams(action, date) {
				return date.from !== void 0 ? {
					reason: `${action}-range`,
					details: {
						...getShortDate(date.target),
						from: getShortDate(date.from),
						to: getShortDate(date.to)
					}
				} : {
					reason: `${action}-day`,
					details: getShortDate(date)
				};
			}
			function encodeEntry(date, dateMask, dateLocale) {
				return date.from !== void 0 ? {
					from: encodeObjectFn.value(date.from, dateMask, dateLocale),
					to: encodeObjectFn.value(date.to, dateMask, dateLocale)
				} : encodeObjectFn.value(date, dateMask, dateLocale);
			}
			function addToModel(date) {
				let value;
				if (props.multiple) {
					if (date.from !== void 0) {
						const fromHash = getDayHash(date.from);
						const toHash = getDayHash(date.to);
						const localDays = daysModel.value.filter((day) => day.dateHash < fromHash || day.dateHash > toHash);
						const ranges = rangeModel.value.filter(({ from, to }) => to.dateHash < fromHash || from.dateHash > toHash);
						value = [
							...localDays,
							...ranges,
							date
						].map((entry) => encodeEntry(entry));
					} else value = [...normalizedModel.value, encodeEntry(date)];
				} else value = encodeEntry(date);
				emitValue(value, "add", date);
			}
			function removeFromModel(date) {
				if (props.noUnset) return;
				let model = null;
				if (props.multiple && Array.isArray(props.modelValue)) {
					const val = encodeEntry(date);
					model = date.from !== void 0 ? props.modelValue.filter((item) => item.from !== void 0 ? item.from !== val.from && item.to !== val.to : true) : props.modelValue.filter((item) => item !== val);
					if (model.length === 0) model = null;
				}
				emitValue(model, "remove", date);
			}
			function updateValue(dateMask, dateLocale, reason) {
				const model = [...daysModel.value, ...rangeModel.value].map((entry) => encodeEntry(entry, dateMask, dateLocale)).filter((entry) => entry.from !== void 0 ? entry.from.dateHash !== null && entry.to.dateHash !== null : entry.dateHash !== null);
				const value = (props.multiple ? model : model[0]) || null;
				setLastValue(value);
				emit("update:modelValue", value, reason);
			}
			function getHeader() {
				if (props.minimal) return;
				return h("div", { class: "q-date__header " + headerClass.value }, [h("div", { class: "relative-position" }, [h(Transition, { name: "q-transition--fade" }, () => h("div", {
					key: "h-yr-" + headerSubtitle.value,
					class: "q-date__header-subtitle q-date__header-link " + (view.value === "Years" ? "q-date__header-link--active" : "cursor-pointer"),
					tabindex: tabindex.value,
					role: "button",
					"aria-pressed": view.value === "Years" ? "true" : "false",
					...getCache("vY", {
						onClick() {
							view.value = "Years";
						},
						onKeydown: preventSpace$3,
						onKeyup(e) {
							if ([13, 32].includes(e.keyCode)) {
								view.value = "Years";
								stopAndPrevent(e);
							}
						}
					})
				}, [headerSubtitle.value]))]), h("div", { class: "q-date__header-title relative-position flex no-wrap" }, [h("div", { class: "relative-position col" }, [h(Transition, { name: "q-transition--fade" }, () => h("div", {
					key: "h-sub" + headerTitle.value,
					class: "q-date__header-title-label q-date__header-link " + (view.value === "Calendar" ? "q-date__header-link--active" : "cursor-pointer"),
					tabindex: tabindex.value,
					role: "button",
					"aria-pressed": view.value === "Calendar" ? "true" : "false",
					...getCache("vC", {
						onClick() {
							view.value = "Calendar";
						},
						onKeydown: preventSpace$3,
						onKeyup(e) {
							if ([13, 32].includes(e.keyCode)) {
								view.value = "Calendar";
								stopAndPrevent(e);
							}
						}
					})
				}, [headerTitle.value]))]), props.todayBtn ? h(QBtn_default, {
					class: "q-date__header-today self-start",
					icon: $q.iconSet.datetime.today,
					"aria-label": $q.lang.date.today,
					flat: true,
					size: "sm",
					round: true,
					tabindex: tabindex.value,
					onClick: setToday
				}) : null])]);
			}
			function getNavigation({ label, type, key, dir, goTo, boundaries, cls }) {
				return [
					h("div", { class: "row items-center q-date__arrow" }, [h(QBtn_default, {
						round: true,
						dense: true,
						size: "sm",
						flat: true,
						icon: dateArrow.value[0],
						"aria-label": type === "Years" ? $q.lang.date.prevYear : $q.lang.date.prevMonth,
						tabindex: tabindex.value,
						disable: !boundaries.prev,
						...getCache("go-#" + type, { onClick() {
							goTo(-1);
						} })
					})]),
					h("div", { class: "relative-position overflow-hidden flex flex-center" + cls }, [h(Transition, { name: "q-transition--jump-" + dir }, () => h("div", { key }, [h(QBtn_default, {
						flat: true,
						dense: true,
						noCaps: true,
						label,
						tabindex: tabindex.value,
						...getCache("view#" + type, { onClick: () => {
							view.value = type;
						} })
					})]))]),
					h("div", { class: "row items-center q-date__arrow" }, [h(QBtn_default, {
						round: true,
						dense: true,
						size: "sm",
						flat: true,
						icon: dateArrow.value[1],
						"aria-label": type === "Years" ? $q.lang.date.nextYear : $q.lang.date.nextMonth,
						tabindex: tabindex.value,
						disable: !boundaries.next,
						...getCache("go+#" + type, { onClick() {
							goTo(1);
						} })
					})])
				];
			}
			const renderViews = {
				Calendar: () => [h("div", {
					key: "calendar-view",
					class: "q-date__view q-date__calendar"
				}, [
					h("div", { class: "q-date__navigation row items-center no-wrap" }, [...getNavigation({
						label: innerLocale.value.months[viewModel.value.month - 1],
						type: "Months",
						key: viewModel.value.month,
						dir: monthDirection.value,
						goTo: goToMonth,
						boundaries: navBoundaries.value.month,
						cls: " col"
					}), ...getNavigation({
						label: fmtNum(viewModel.value.year),
						type: "Years",
						key: viewModel.value.year,
						dir: yearDirection.value,
						goTo: goToYear,
						boundaries: navBoundaries.value.year,
						cls: ""
					})]),
					h("div", { class: "q-date__calendar-weekdays row items-center no-wrap" }, daysOfWeek.value.map((day) => h("div", { class: "q-date__calendar-item" }, [h("div", day)]))),
					h("div", { class: "q-date__calendar-days-container relative-position overflow-hidden" }, [h(Transition, { name: "q-transition--slide-" + monthDirection.value }, () => h("div", {
						key: viewMonthHash.value,
						class: "q-date__calendar-days fit"
					}, days.value.map((day) => h("div", { class: day.classes }, [day.in ? h(QBtn_default, {
						class: day.today ? "q-date__today" : "",
						dense: true,
						flat: day.flat,
						unelevated: day.unelevated,
						color: day.color,
						textColor: day.textColor,
						label: fmtNum(day.i),
						tabindex: day.i === roverDay.value ? tabindex.value : -1,
						ref: day.i === roverDay.value ? roverRef : void 0,
						"aria-label": `${fmtNum(day.i)} ${innerLocale.value.months[viewModel.value.month - 1]} ${fmtNum(viewModel.value.year)}`,
						"aria-pressed": day.selected === true || day.range !== void 0 ? "true" : "false",
						"aria-current": day.today === true ? "date" : void 0,
						...getCache("day#" + day.i, {
							onClick: () => {
								onDayClick(day.i);
							},
							onMouseover: () => {
								onDayMouseover(day.i);
							},
							onFocus: () => {
								onDayFocus(day.i);
							},
							onKeydown: (e) => {
								onDayKeydown(e, day.i);
							}
						})
					}, day.event ? () => h("div", { class: day.event }) : null) : h("div", fmtNum(day.i))]))))])
				])],
				Months() {
					const currentYear = isHydrated.value && viewModel.value.year === today.value.year;
					const isDisabled = (month) => minNav.value !== null && viewModel.value.year === minNav.value.year && minNav.value.month > month || maxNav.value !== null && viewModel.value.year === maxNav.value.year && maxNav.value.month < month;
					const content = innerLocale.value.monthsShort.map((month, i) => {
						const active = viewModel.value.month === i + 1;
						return h("div", { class: "q-date__months-item flex flex-center" }, [h(QBtn_default, {
							class: currentYear && today.value.month === i + 1 ? "q-date__today" : null,
							flat: !active,
							label: month,
							"aria-label": innerLocale.value.months[i],
							unelevated: active,
							color: active ? computedColor.value : null,
							textColor: active ? computedTextColor.value : null,
							tabindex: tabindex.value,
							disable: isDisabled(i + 1),
							...getCache("month#" + i, { onClick: () => {
								setMonth(i + 1);
							} })
						})]);
					});
					if (props.yearsInMonthView) content.unshift(h("div", { class: "row no-wrap full-width" }, [getNavigation({
						label: fmtNum(viewModel.value.year),
						type: "Years",
						key: viewModel.value.year,
						dir: yearDirection.value,
						goTo: goToYear,
						boundaries: navBoundaries.value.year,
						cls: " col"
					})]));
					return h("div", {
						key: "months-view",
						class: "q-date__view q-date__months flex flex-center"
					}, content);
				},
				Years() {
					const start = startYear.value, stop = start + yearsInterval, years = [];
					const isDisabled = (year) => minNav.value !== null && minNav.value.year > year || maxNav.value !== null && maxNav.value.year < year;
					for (let i = start; i <= stop; i++) {
						const active = viewModel.value.year === i;
						years.push(h("div", { class: "q-date__years-item flex flex-center" }, [h(QBtn_default, {
							key: "yr" + i,
							class: isHydrated.value && today.value.year === i ? "q-date__today" : null,
							flat: !active,
							label: fmtNum(i),
							dense: true,
							unelevated: active,
							color: active ? computedColor.value : null,
							textColor: active ? computedTextColor.value : null,
							tabindex: tabindex.value,
							disable: isDisabled(i),
							...getCache("yr#" + i, { onClick: () => {
								setYear(i);
							} })
						})]));
					}
					return h("div", { class: "q-date__view q-date__years flex flex-center" }, [
						h("div", { class: "col-auto" }, [h(QBtn_default, {
							round: true,
							dense: true,
							flat: true,
							icon: dateArrow.value[0],
							"aria-label": $q.lang.date.prevRangeYears(yearsInterval),
							tabindex: tabindex.value,
							disable: isDisabled(start),
							...getCache("y-", { onClick: () => {
								startYear.value -= yearsInterval;
							} })
						})]),
						h("div", { class: "q-date__years-content col self-stretch row items-center" }, years),
						h("div", { class: "col-auto" }, [h(QBtn_default, {
							round: true,
							dense: true,
							flat: true,
							icon: dateArrow.value[1],
							"aria-label": $q.lang.date.nextRangeYears(yearsInterval),
							tabindex: tabindex.value,
							disable: isDisabled(stop),
							...getCache("y+", { onClick: () => {
								startYear.value += yearsInterval;
							} })
						})])
					]);
				}
			};
			function onDayClick(dayIndex) {
				const day = {
					...viewModel.value,
					day: dayIndex
				};
				if (!props.range) {
					toggleDate(day, viewMonthHash.value);
					return;
				}
				if (editRange.value === null) {
					const dayProps = days.value.find((item) => !item.fill && item.i === dayIndex);
					if (!props.noUnset && dayProps.range !== void 0) {
						removeFromModel({
							target: day,
							from: dayProps.range.from,
							to: dayProps.range.to
						});
						return;
					}
					if (dayProps.selected) {
						removeFromModel(day);
						return;
					}
					const initHash = getDayHash(day);
					editRange.value = {
						init: day,
						initHash,
						final: day,
						finalHash: initHash
					};
					emit("rangeStart", getShortDate(day));
				} else {
					const initHash = editRange.value.initHash, finalHash = getDayHash(day), payload = initHash <= finalHash ? {
						from: editRange.value.init,
						to: day
					} : {
						from: day,
						to: editRange.value.init
					};
					editRange.value = null;
					addToModel(initHash === finalHash ? day : {
						target: day,
						...payload
					});
					emit("rangeEnd", {
						from: getShortDate(payload.from),
						to: getShortDate(payload.to)
					});
				}
			}
			function onDayMouseover(dayIndex) {
				if (editRange.value !== null) {
					const final = {
						...viewModel.value,
						day: dayIndex
					};
					Object.assign(editRange.value, {
						final,
						finalHash: getDayHash(final)
					});
				}
			}
			function onDayFocus(dayIndex) {
				focusedDay.value = dayIndex;
				onDayMouseover(dayIndex);
			}
			function seekDay(from, dir) {
				let target = from;
				while (target >= 1 && target <= daysInMonth.value) {
					if (keyboardDays.value.includes(target)) return target;
					target += dir;
				}
				return null;
			}
			function setRover(day) {
				focusedDay.value = day;
				nextTick(() => {
					roverRef.value?.$el?.focus();
				});
			}
			function crossMonth(dir, day) {
				if (navBoundaries.value.month[dir === -1 ? "prev" : "next"]) {
					pendingFocusDay = day;
					goToMonth(dir);
				}
			}
			function onDayKeydown(e, dayIndex) {
				const { keyCode } = e;
				if (keyCode === 33 || keyCode === 34) {
					stopAndPrevent(e);
					const dir = keyCode === 33 ? -1 : 1;
					if (e.shiftKey) {
						if (navBoundaries.value.year[dir === -1 ? "prev" : "next"]) {
							pendingFocusDay = dayIndex;
							goToYear(dir);
						}
					} else crossMonth(dir, dayIndex);
					return;
				}
				if (keyCode < 35 || keyCode > 40) return;
				stopAndPrevent(e);
				if (keyCode === 36 || keyCode === 35) {
					const weekPos = (firstDayOffset.value + dayIndex - 1) % 7;
					let target, dir;
					if (keyCode === 36) {
						target = dayIndex - weekPos;
						dir = 1;
					} else {
						target = dayIndex + 6 - weekPos;
						dir = -1;
					}
					const day = seekDay(Math.min(Math.max(target, 1), daysInMonth.value), dir);
					if (day !== null) setRover(day);
					return;
				}
				let dir, target;
				if (keyCode === 38 || keyCode === 40) {
					dir = keyCode === 38 ? -1 : 1;
					target = dayIndex + 7 * dir;
				} else {
					dir = (keyCode === 37 ? -1 : 1) * ($q.lang.rtl === true ? -1 : 1);
					target = dayIndex + dir;
				}
				if (target >= 1 && target <= daysInMonth.value) {
					const day = seekDay(target, dir);
					if (day !== null) {
						setRover(day);
						return;
					}
					target = dir === 1 ? daysInMonth.value + 1 : 0;
				}
				crossMonth(dir, target <= 0 ? target : target - daysInMonth.value);
			}
			Object.assign(proxy, {
				setToday,
				setView,
				offsetCalendar,
				setCalendarTo,
				setEditingRange
			});
			return () => {
				const content = [h("div", { class: "q-date__content col relative-position" }, [h(Transition, { name: "q-transition--fade" }, renderViews[view.value])])];
				const def = hSlot(slots.default);
				if (def !== void 0) content.push(h("div", { class: "q-date__actions" }, def));
				if (props.name !== void 0 && !props.disable) injectFormInput(content, "push");
				return h("div", {
					class: classes.value,
					...attributes.value
				}, [getHeader(), h("div", {
					ref: blurTargetRef,
					class: "q-date__main col column",
					tabindex: -1
				}, content)]);
			};
		}
	});
	function useHistory(showing, hide, hideOnRouteChange) {
		let historyEntry;
		function removeFromHistory() {
			if (historyEntry !== void 0) {
				History_default.remove(historyEntry);
				historyEntry = void 0;
			}
		}
		onBeforeUnmount(() => {
			if (showing.value) removeFromHistory();
		});
		return {
			removeFromHistory,
			addToHistory() {
				historyEntry = {
					condition: () => hideOnRouteChange.value,
					handler: hide
				};
				History_default.add(historyEntry);
			}
		};
	}
	var registered = 0;
	var scrollPositionX;
	var scrollPositionY;
	var maxScrollTop;
	var vpPendingUpdate = false;
	var bodyLeft;
	var bodyTop;
	var isIos = false;
	var routePath;
	var closeTimer = null;
	var releaseListeners = /* @__PURE__ */ new Set();
	function onAppleResize(evt) {
		if (vpPendingUpdate) return;
		vpPendingUpdate = true;
		requestAnimationFrame(() => {
			vpPendingUpdate = false;
			const { height, scale } = evt.target;
			if (Math.abs(scale - 1) > .01) return;
			const { clientHeight, scrollTop } = document.scrollingElement;
			if (maxScrollTop === void 0 || height !== window.innerHeight) {
				maxScrollTop = clientHeight - height;
				document.scrollingElement.scrollTop = scrollTop;
			}
			if (scrollTop > maxScrollTop) document.scrollingElement.scrollTop -= Math.ceil((scrollTop - maxScrollTop) / 8);
		});
	}
	function apply$1(action) {
		const body = document.body;
		if (action === "add") {
			scrollPositionX = getHorizontalScrollPosition(window);
			scrollPositionY = getVerticalScrollPosition(window);
			routePath = window.location.pathname;
			isIos = client.is.ios;
			const classList = ["q-document--prevent-scroll"];
			if (isIos) {
				bodyLeft = body.style.left;
				bodyTop = body.style.top;
				body.style.left = `-${scrollPositionX}px`;
				body.style.top = `-${scrollPositionY}px`;
				classList.push("q-document--pin-body");
			} else {
				classList.push("q-document--clip-scroll");
				if (window.innerWidth - document.documentElement.clientWidth > 0) classList.push("q-document--reserve-scrollbar");
			}
			document.documentElement.classList.add(...classList);
			document.qScrollPrevented = true;
			if (isIos) {
				window.scrollTo(0, 0);
				window.visualViewport?.addEventListener("resize", onAppleResize, listenOpts.passiveCapture);
				window.visualViewport?.addEventListener("scroll", onAppleResize, listenOpts.passiveCapture);
				window.scrollTo(0, 0);
			}
		} else {
			if (isIos) {
				window.visualViewport?.removeEventListener("resize", onAppleResize, listenOpts.passiveCapture);
				window.visualViewport?.removeEventListener("scroll", onAppleResize, listenOpts.passiveCapture);
			}
			document.documentElement.classList.remove("q-document--prevent-scroll", "q-document--clip-scroll", "q-document--reserve-scrollbar", "q-document--pin-body");
			document.qScrollPrevented = false;
			if (isIos) {
				body.style.left = bodyLeft;
				body.style.top = bodyTop;
			}
			if (isIos && window.location.pathname === routePath && (getHorizontalScrollPosition(window) !== scrollPositionX || getVerticalScrollPosition(window) !== scrollPositionY)) window.scrollTo(scrollPositionX, scrollPositionY);
			else releaseListeners.forEach((fn) => {
				fn();
			});
			maxScrollTop = void 0;
		}
	}
	function preventScroll(state) {
		let action = "add";
		if (state === true) {
			registered++;
			if (closeTimer !== null) {
				clearTimeout(closeTimer);
				closeTimer = null;
				return;
			}
			if (registered > 1) return;
		} else {
			if (registered === 0) return;
			registered--;
			if (registered > 0) return;
			action = "remove";
			if (isIos && client.is.nativeMobile) {
				if (closeTimer !== null) clearTimeout(closeTimer);
				closeTimer = setTimeout(() => {
					apply$1(action);
					closeTimer = null;
				}, 100);
				return;
			}
		}
		apply$1(action);
	}
	function usePreventScroll() {
		let currentState;
		return { preventBodyScroll(state) {
			if (state !== currentState && (currentState !== void 0 || state)) {
				currentState = state;
				preventScroll(state);
			}
		} };
	}
	var maximizedModals = 0;
	var positionClass$1 = {
		standard: "fixed-full flex-center",
		top: "fixed-top justify-center",
		bottom: "fixed-bottom justify-center",
		right: "fixed-right items-center",
		left: "fixed-left items-center"
	};
	var defaultTransitions = {
		standard: ["scale", "scale"],
		top: ["slide-down", "slide-up"],
		bottom: ["slide-up", "slide-down"],
		right: ["slide-left", "slide-right"],
		left: ["slide-right", "slide-left"]
	};
	var QDialog_default = /*#__PURE__*/ createComponent({
		name: "QDialog",
		inheritAttrs: false,
		props: {
			...useModelToggleProps,
			...useTransitionProps,
			transitionShow: String,
			transitionHide: String,
			persistent: Boolean,
			autoClose: Boolean,
			allowFocusOutside: Boolean,
			noEscDismiss: Boolean,
			noBackdropDismiss: Boolean,
			noRouteDismiss: Boolean,
			noRefocus: Boolean,
			noFocus: Boolean,
			noShake: Boolean,
			seamless: Boolean,
			maximized: Boolean,
			fullWidth: Boolean,
			fullHeight: Boolean,
			square: Boolean,
			backdropFilter: String,
			position: {
				type: String,
				default: "standard",
				validator: (val) => [
					"standard",
					"top",
					"bottom",
					"left",
					"right"
				].includes(val)
			}
		},
		emits: [
			...useModelToggleEmits,
			"shake",
			"click",
			"escapeKey"
		],
		setup(props, { slots, emit, attrs }) {
			const vm = getCurrentInstance();
			const $q = useQuasar();
			const rootElRef = /* @__PURE__ */ shallowRef(null);
			const innerRef = /* @__PURE__ */ shallowRef(null);
			const showing = /* @__PURE__ */ ref(false);
			const animating = /* @__PURE__ */ ref(false);
			const viewportInset = /* @__PURE__ */ ref(null);
			let shakeTimeout = null, isMaximized = false, avoidAutoClose = false, viewportTracked = false;
			const hideOnRouteChange = computed(() => !props.persistent && !props.noRouteDismiss && !props.seamless);
			const { preventBodyScroll } = usePreventScroll();
			const { registerTransitionEnd } = useTransitionEnd(props);
			const { registerTick, removeTick } = useTick();
			const { transitionProps, transitionStyle } = useTransition(props, () => defaultTransitions[props.position][0], () => defaultTransitions[props.position][1]);
			const backdropStyle = computed(() => transitionStyle() + (props.backdropFilter !== void 0 ? `;backdrop-filter:${props.backdropFilter};-webkit-backdrop-filter:${props.backdropFilter}` : ""));
			const { showPortal, hidePortal, portalIsOpening, renderPortal } = usePortal(vm, innerRef, renderPortalContent, "dialog");
			const { captureRefocusTarget, setRefocusTarget, clearRefocusTarget, restoreFocus, adoptRefocusTarget } = usePortalRefocus(props, () => !props.noFocus && portalIsOpening());
			const { hide } = useModelToggle({
				showing,
				hideOnRouteChange,
				handleShow,
				handleHide,
				handleRouteChange,
				processOnMount: true
			});
			const { addToHistory, removeFromHistory } = useHistory(showing, hide, hideOnRouteChange);
			const classes = computed(() => `q-dialog__inner flex no-pointer-events q-dialog__inner--${props.maximized ? "maximized" : "minimized"} q-dialog__inner--${props.position} ${positionClass$1[props.position]}` + (animating.value ? " q-dialog__inner--animating" : "") + (viewportInset.value !== null ? " q-dialog__inner--keyboard" : "") + (props.fullWidth ? " q-dialog__inner--fullwidth" : "") + (props.fullHeight ? " q-dialog__inner--fullheight" : "") + (props.square ? " q-dialog__inner--square" : ""));
			const useBackdrop = computed(() => showing.value && !props.seamless);
			const onEvents = computed(() => props.autoClose ? { onClick: onAutoClose } : {});
			const rootClasses = computed(() => `q-dialog fullscreen no-pointer-events q-dialog--${useBackdrop.value ? "modal" : "seamless"}`);
			watch(() => props.maximized, (state) => {
				if (showing.value) updateMaximized(state);
			});
			watch(useBackdrop, (val) => {
				preventBodyScroll(val);
				if (val) {
					addFocusout(onFocusChange);
					addEscapeKey(onEscapeKey);
				} else {
					removeFocusout(onFocusChange);
					removeEscapeKey(onEscapeKey);
				}
			});
			function updateViewportInset() {
				const { offsetTop, height, scale } = window.visualViewport;
				const { innerHeight } = window;
				if (Math.abs(scale - 1) > .01 || innerHeight - height < 1) {
					viewportInset.value = null;
					return;
				}
				const top = Math.round(offsetTop);
				const bottom = Math.round(innerHeight - offsetTop - height);
				const current = viewportInset.value;
				if (current === null || current.top !== top || current.bottom !== bottom) viewportInset.value = {
					top,
					bottom,
					height: Math.round(height)
				};
			}
			function trackViewport(add) {
				const fn = add ? "addEventListener" : "removeEventListener";
				viewportTracked = add;
				window.visualViewport?.[fn]("resize", updateViewportInset, listenOpts.passive);
				window.visualViewport?.[fn]("scroll", updateViewportInset, listenOpts.passive);
				if (add && window.visualViewport !== void 0) updateViewportInset();
				else viewportInset.value = null;
			}
			function getInnerStyle() {
				const inset = viewportInset.value;
				if (inset === null) return transitionStyle();
				return `${transitionStyle()};--q-dialog-viewport-height:${inset.height}px` + (props.position !== "bottom" ? `;top:${inset.top}px` : "") + (props.position !== "top" ? `;bottom:${inset.bottom}px` : "");
			}
			function handleShow(evt) {
				addToHistory();
				captureRefocusTarget();
				updateMaximized(props.maximized);
				showPortal();
				animating.value = true;
				if ($q.platform.is.ios) trackViewport(true);
				if (props.noFocus) removeTick();
				else {
					document.activeElement?.blur();
					registerTick(focus);
				}
				registerTransitionEnd(() => {
					if ($q.platform.is.ios) {
						if (!props.seamless && document.activeElement) {
							const { top, bottom } = document.activeElement.getBoundingClientRect(), { innerHeight } = window, height = window.visualViewport?.height ?? innerHeight;
							if (top > 0 && bottom > height / 2) document.scrollingElement.scrollTop = Math.min(document.scrollingElement.scrollHeight - height, bottom >= innerHeight ? Infinity : Math.ceil(document.scrollingElement.scrollTop + bottom - height / 2));
							document.activeElement.scrollIntoView();
						}
						avoidAutoClose = true;
						innerRef.value.click();
						avoidAutoClose = false;
					}
					showPortal(true);
					animating.value = false;
					emit("show", evt);
				});
			}
			function handleHide(evt) {
				removeTick();
				removeFromHistory();
				cleanup(true);
				animating.value = true;
				hidePortal();
				restoreFocus(evt);
				registerTransitionEnd(() => {
					hidePortal(true);
					animating.value = false;
					emit("hide", evt);
				});
			}
			function handleRouteChange() {
				clearRefocusTarget();
			}
			function focus(selector) {
				addFocusFn(() => {
					let node = innerRef.value;
					if (node === null || node.contains === void 0) return;
					if (selector !== void 0) {
						const target = node.querySelector(selector);
						if (target !== null) {
							target.focus({ preventScroll: true });
							return;
						}
					}
					if (!node.contains(document.activeElement)) {
						node = node.querySelector("[autofocus][tabindex], [data-autofocus][tabindex]") || node.querySelector("[autofocus] [tabindex], [data-autofocus] [tabindex]") || node.querySelector("[autofocus], [data-autofocus]") || node;
						node.focus({ preventScroll: true });
					}
				});
			}
			function shake(focusTarget) {
				if (focusTarget && typeof focusTarget.focus === "function") focusTarget.focus({ preventScroll: true });
				else focus();
				emit("shake");
				const node = innerRef.value;
				if (node !== null) {
					node.classList.remove("q-animate--scale");
					node.classList.add("q-animate--scale");
					if (shakeTimeout !== null) clearTimeout(shakeTimeout);
					shakeTimeout = setTimeout(() => {
						shakeTimeout = null;
						if (innerRef.value !== null) {
							node.classList.remove("q-animate--scale");
							focus();
						}
					}, 170);
				}
			}
			function onEscapeKey(evt) {
				if (!props.seamless) {
					if (props.persistent || props.noEscDismiss) {
						if (!props.maximized && !props.noShake) shake();
					} else {
						emit("escapeKey");
						hide(evt);
					}
				}
			}
			function cleanup(hiding) {
				if (shakeTimeout !== null) {
					clearTimeout(shakeTimeout);
					shakeTimeout = null;
				}
				if (hiding || showing.value) {
					updateMaximized(false);
					if (viewportTracked) trackViewport(false);
					if (!props.seamless) {
						preventBodyScroll(false);
						removeFocusout(onFocusChange);
						removeEscapeKey(onEscapeKey);
					}
				}
				if (!hiding) clearRefocusTarget();
			}
			function updateMaximized(active) {
				if (active) {
					if (!isMaximized) {
						if (maximizedModals < 1) document.body.classList.add("q-body--dialog");
						maximizedModals++;
						isMaximized = true;
					}
				} else if (isMaximized) {
					if (maximizedModals < 2) document.body.classList.remove("q-body--dialog");
					maximizedModals--;
					isMaximized = false;
				}
			}
			function onAutoClose(e) {
				if (!avoidAutoClose) {
					hide(e);
					emit("click", e);
				}
			}
			function onBackdropPress(e) {
				if (e.button !== 0) return;
				if (!props.persistent && !props.noBackdropDismiss) hide(e);
				else if (!props.noShake) shake();
			}
			function onFocusChange(evt) {
				if (!props.allowFocusOutside && !portalIsOpening() && !childHasFocus(innerRef.value, evt.target) && !focusIsInDetachedFullscreen(innerRef.value, evt.target)) focus("[tabindex]:not([tabindex=\"-1\"])");
			}
			Object.assign(vm.proxy, {
				focus,
				shake,
				__updateRefocusTarget: setRefocusTarget,
				__adoptRefocusTarget: adoptRefocusTarget,
				__getAriaModalEl: () => useBackdrop.value ? rootElRef.value : null
			});
			onBeforeUnmount(cleanup);
			function renderPortalContent() {
				return h("div", {
					ref: rootElRef,
					role: "dialog",
					"aria-modal": useBackdrop.value ? "true" : "false",
					...attrs,
					class: [rootClasses.value, attrs.class]
				}, [h(Transition, {
					name: "q-transition--fade",
					appear: true
				}, () => useBackdrop.value ? h("div", {
					class: "q-dialog__backdrop fixed-full",
					style: backdropStyle.value,
					"aria-hidden": "true",
					onMousedown: onBackdropPress
				}) : null), h(Transition, transitionProps(), () => showing.value ? h("div", {
					ref: innerRef,
					class: classes.value,
					style: getInnerStyle(),
					tabindex: -1,
					...onEvents.value
				}, hSlot(slots.default)) : null)]);
			}
			return renderPortal;
		}
	});
	({
		...useModelToggleProps,
		...useDarkProps
	}), [...useModelToggleEmits];
	var nonSelectableCount = 0;
	var cursorSettleDelay = 100;
	var cursorSettleTolerance = 4;
	function isContactPointer(evt) {
		return evt.pointerType === "touch" || evt.pointerType === "pen" && evt.buttons !== 0;
	}
	var QTooltip_default = /*#__PURE__*/ createComponent({
		name: "QTooltip",
		inheritAttrs: false,
		props: {
			...useAnchorStaticProps,
			...useModelToggleProps,
			...useTransitionProps,
			maxHeight: {
				type: String,
				default: null
			},
			maxWidth: {
				type: String,
				default: null
			},
			transitionShow: {
				...useTransitionProps.transitionShow,
				default: "jump-down"
			},
			transitionHide: {
				...useTransitionProps.transitionHide,
				default: "jump-up"
			},
			anchor: {
				type: String,
				default: "bottom middle",
				validator: validatePosition
			},
			self: {
				type: String,
				default: "top middle",
				validator: validatePosition
			},
			offset: {
				type: Array,
				default: () => [14, 14],
				validator: validateOffset
			},
			cursorPosition: Boolean,
			delay: {
				type: Number,
				default: 0
			},
			hideDelay: {
				type: Number,
				default: 0
			},
			persistent: Boolean
		},
		emits: [...useModelToggleEmits],
		setup(props, { slots, emit, attrs }) {
			let removeNonSelectableTimer, hasNonSelectable = false, contactType = null, settlePoint = null, describedBy;
			const vm = getCurrentInstance();
			const $q = useQuasar();
			const innerRef = /* @__PURE__ */ shallowRef(null);
			const showing = /* @__PURE__ */ ref(false);
			const targetUid = useId();
			function getTooltipId() {
				return attrs.id || targetUid.value;
			}
			const anchorOrigin = computed(() => parsePosition(props.anchor, $q.lang.rtl));
			const selfOrigin = computed(() => parsePosition(props.self, $q.lang.rtl));
			const hideOnRouteChange = computed(() => !props.persistent);
			const { registerTimeout, registerTransitionEnd } = useTransitionEnd(props);
			const { transitionProps, transitionStyle } = useTransition(props);
			const { anchorEl, canShow, anchorEvents } = useAnchor({
				showing,
				configureAnchorEl
			});
			const { show, hide } = useModelToggle({
				showing,
				canShow,
				handleShow,
				handleHide,
				hideOnRouteChange,
				processOnMount: true
			});
			Object.assign(anchorEvents, {
				delayShow,
				delayHide,
				onFocusin,
				onPointerdown,
				onCursorMove
			});
			const { showPortal, hidePortal, renderPortal } = usePortal(vm, innerRef, renderPortalContent, "tooltip");
			const { registerTick, removeTick } = useTick();
			const posEngine = usePositionEngine({
				props,
				$q,
				anchorEl,
				innerRef,
				showing,
				anchorOrigin,
				selfOrigin,
				trackContent: true
			});
			watch(() => (props.modelValue === null || props["onUpdate:modelValue"]) && showing.value === true && props.persistent !== true, (val) => {
				(val === true ? addEscapeKey : removeEscapeKey)(onEscapeKey);
			});
			function handleShow(evt) {
				cleanEvt(anchorEvents, "cursorTemp");
				showPortal();
				addAriaDescription();
				posEngine.handleShow(props.cursorPosition ? evt : void 0);
				registerTick(posEngine.handleTick);
				registerTransitionEnd(() => {
					showPortal(true);
					emit("show", evt);
				});
			}
			function handleHide(evt) {
				removeTick();
				hidePortal();
				anchorCleanup(true);
				registerTransitionEnd(() => {
					hidePortal(true);
					posEngine.releaseAnchor(false);
					emit("hide", evt);
				});
			}
			function anchorCleanup(hidingInProgress) {
				posEngine.releaseAnchor(hidingInProgress);
				removeEscapeKey(onEscapeKey);
				contactType = null;
				cleanEvt(anchorEvents, "tooltipTemp");
				cleanEvt(anchorEvents, "cursorTemp");
				removeAriaDescription();
				setNonSelectable(false);
			}
			function delayShow(evt) {
				if (evt.pointerType === "touch" && evt.isPrimary === false) return;
				const contact = isContactPointer(evt);
				if (contact) engageContact(evt);
				if (props.cursorPosition && !contact) {
					const pos = position(evt);
					if (pos.left !== void 0) {
						settlePoint = pos;
						addEvt(anchorEvents, "cursorTemp", [[
							anchorEl.value,
							"pointermove",
							"onCursorMove",
							"passive"
						]]);
						settleShow(evt);
						return;
					}
				}
				registerTimeout(() => {
					show(evt);
				}, props.delay);
			}
			function settleShow(evt) {
				registerTimeout(() => {
					show(evt);
				}, Math.max(props.delay, cursorSettleDelay));
			}
			function onCursorMove(evt) {
				const pos = position(evt);
				if (Math.abs(pos.left - settlePoint.left) <= cursorSettleTolerance && Math.abs(pos.top - settlePoint.top) <= cursorSettleTolerance) return;
				settlePoint = pos;
				settleShow(evt);
			}
			function engageContact(evt) {
				contactType = evt.pointerType;
				if (removeNonSelectableTimer !== void 0) {
					clearTimeout(removeNonSelectableTimer);
					removeNonSelectableTimer = void 0;
				}
				clearSelection();
				setNonSelectable(true);
				const target = anchorEl.value;
				const evts = [
					"touchmove",
					"touchcancel",
					"touchend",
					"click"
				].map((e) => [
					target,
					e,
					"delayHide",
					"passiveCapture"
				]);
				addEvt(anchorEvents, "tooltipTemp", evts);
			}
			function onPointerdown(evt) {
				if (evt.pointerType === "pen" && contactType === null) engageContact(evt);
			}
			function delayHide(evt) {
				if (evt.pointerType === "touch" && evt.isPrimary === false) return;
				if (evt.type === "focusout" && anchorEl.value !== null && anchorEl.value.contains(evt.relatedTarget)) return;
				cleanEvt(anchorEvents, "cursorTemp");
				if (contactType !== null) {
					const liftedPen = contactType === "pen" && (evt.type === "click" || evt.type === "touchend");
					contactType = null;
					cleanEvt(anchorEvents, "tooltipTemp");
					clearSelection();
					removeNonSelectableTimer = setTimeout(() => {
						removeNonSelectableTimer = void 0;
						setNonSelectable(false);
					}, 10);
					if (liftedPen) return;
				}
				registerTimeout(() => {
					hide(evt);
				}, props.hideDelay);
			}
			function onFocusin(evt) {
				const el = evt.target;
				if (!el) return;
				if (isRefocusing() || !el.matches(":focus-visible")) return;
				delayShow(evt);
			}
			function onEscapeKey(evt) {
				hide(evt);
			}
			function configureAnchorEl() {
				if (props.noParentEvent || anchorEl.value === null) return;
				const evts = [
					[
						anchorEl.value,
						"pointerenter",
						"delayShow",
						"passive"
					],
					[
						anchorEl.value,
						"pointerdown",
						"onPointerdown",
						"passive"
					],
					[
						anchorEl.value,
						"pointerleave",
						"delayHide",
						"passive"
					],
					[
						anchorEl.value,
						"focusin",
						"onFocusin",
						"passive"
					],
					[
						anchorEl.value,
						"focusout",
						"delayHide",
						"passive"
					]
				];
				addEvt(anchorEvents, "anchor", evts);
			}
			function setNonSelectable(state) {
				if (hasNonSelectable === state) return;
				hasNonSelectable = state;
				nonSelectableCount += state ? 1 : -1;
				document.body.classList.toggle("non-selectable", nonSelectableCount > 0);
				if (!state && removeNonSelectableTimer !== void 0) {
					clearTimeout(removeNonSelectableTimer);
					removeNonSelectableTimer = void 0;
				}
			}
			function addAriaDescription() {
				const el = anchorEl.value, id = getTooltipId();
				if (el === null || id === void 0) return;
				const ids = (el.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
				describedBy = {
					el,
					id,
					added: !ids.includes(id)
				};
				if (describedBy.added) {
					ids.push(id);
					el.setAttribute("aria-describedby", ids.join(" "));
				}
			}
			function removeAriaDescription() {
				if (describedBy?.added === true) {
					const { el, id } = describedBy, value = (el.getAttribute("aria-describedby") || "").split(/\s+/).filter((entry) => entry !== "" && entry !== id);
					if (value.length === 0) el.removeAttribute("aria-describedby");
					else el.setAttribute("aria-describedby", value.join(" "));
				}
				describedBy = void 0;
			}
			function getTooltipContent() {
				return showing.value ? h("div", {
					...attrs,
					id: getTooltipId(),
					ref: innerRef,
					class: ["q-tooltip q-tooltip--style no-pointer-events" + (posEngine.viaCssAnchor ? "" : " q-position-engine"), attrs.class],
					style: [
						attrs.style,
						transitionStyle(),
						posEngine.positionStyle.value
					],
					role: "tooltip"
				}, hSlot(slots.default)) : null;
			}
			function renderPortalContent() {
				return h(Transition, transitionProps(), getTooltipContent);
			}
			onBeforeUnmount(() => {
				anchorCleanup(false);
			});
			Object.assign(vm.proxy, { updatePosition: posEngine.updatePosition });
			return renderPortal;
		}
	});
	var QItem_default = /*#__PURE__*/ createComponent({
		name: "QItem",
		props: {
			...useDarkProps,
			...useRouterLinkProps,
			tag: {
				type: String,
				default: "div"
			},
			active: {
				type: Boolean,
				default: null
			},
			clickable: {
				type: Boolean,
				default: null
			},
			onClick: Function,
			dense: Boolean,
			insetLevel: Number,
			role: String,
			tabindex: [String, Number],
			focused: Boolean,
			manualFocus: Boolean
		},
		emits: ["keyup"],
		setup(props, { slots, emit }) {
			const $q = useQuasar();
			const isDark = useDark(props, $q);
			const { hasLink, linkAttrs, linkClass, linkTag, navigateOnClick } = useRouterLink();
			const rootRef = /* @__PURE__ */ shallowRef(null);
			const blurTargetRef = /* @__PURE__ */ shallowRef(null);
			const isActionable = computed(() => (props.clickable === null ? props.onClick !== void 0 : props.clickable) || hasLink.value || props.tag === "label");
			const isClickable = computed(() => !props.disable && isActionable.value);
			const listRole = inject(listKey, null);
			const role = computed(() => {
				if (props.role !== void 0) return props.role;
				const ctx = listRole !== null ? listRole.value : null;
				if (ctx === "menu" || ctx === "menubar") return isActionable.value ? "menuitem" : void 0;
				if (hasLink.value) return void 0;
				if (isClickable.value) return "button";
				return ctx === "list" ? "listitem" : void 0;
			});
			const classes = computed(() => "q-item q-item-type row no-wrap" + (props.dense ? " q-item--dense" : "") + (isDark() ? " q-item--dark" : "") + (hasLink.value && props.active === null ? linkClass.value : props.active ? ` q-item--active${props.activeClass !== void 0 ? ` ${props.activeClass}` : ""}` : "") + (props.disable ? " disabled" : "") + (isClickable.value ? " q-item--clickable q-link cursor-pointer " + (props.manualFocus ? "q-manual-focusable" : "q-focusable q-hoverable") + (props.focused ? " q-manual-focusable--focused" : "") : ""));
			const style = computed(() => {
				if (props.insetLevel === void 0) return null;
				return { ["padding" + ($q.lang.rtl ? "Right" : "Left")]: 16 + props.insetLevel * 56 + "px" };
			});
			function onClick(e) {
				if (isClickable.value) {
					if (blurTargetRef.value !== null && !e.qAvoidFocus) {
						if (!e.qKeyEvent && document.activeElement === rootRef.value) blurTargetRef.value.focus({ preventScroll: true });
						else if (document.activeElement === blurTargetRef.value) rootRef.value.focus({ preventScroll: true });
					}
					navigateOnClick(e);
				}
			}
			function onKeyup(e) {
				if (isClickable.value && isKeyCode(e, [13, 32])) {
					stopAndPrevent(e);
					e.qKeyEvent = true;
					const evt = new MouseEvent("click", e);
					evt.qKeyEvent = true;
					rootRef.value.dispatchEvent(evt);
				}
				emit("keyup", e);
			}
			function onKeydown(e) {
				if (isClickable.value && e.keyCode === 32) stopAndPrevent(e);
			}
			function getContent() {
				const child = hUniqueSlot(slots.default, []);
				if (isClickable.value) child.unshift(h("div", {
					class: "q-focus-helper",
					tabindex: -1,
					ref: blurTargetRef
				}));
				return child;
			}
			return () => {
				const data = {
					ref: rootRef,
					class: classes.value,
					style: style.value,
					role: role.value,
					onKeyup
				};
				if (isClickable.value) {
					data.onClick = onClick;
					data.onKeydown = onKeydown;
					data.tabindex = props.tabindex || "0";
					Object.assign(data, linkAttrs.value);
				} else if (isActionable.value) data["aria-disabled"] = "true";
				return h(linkTag.value, data, getContent());
			};
		}
	});
	var QItemSection_default = /*#__PURE__*/ createComponent({
		name: "QItemSection",
		props: {
			avatar: Boolean,
			thumbnail: Boolean,
			side: Boolean,
			top: Boolean,
			noWrap: Boolean
		},
		setup(props, { slots }) {
			const classes = computed(() => `q-item__section column q-item__section--${props.avatar || props.side || props.thumbnail ? "side" : "main"}` + (props.top ? " q-item__section--top justify-start" : " justify-center") + (props.avatar ? " q-item__section--avatar" : "") + (props.thumbnail ? " q-item__section--thumbnail" : "") + (props.noWrap ? " q-item__section--nowrap" : ""));
			return () => h("div", { class: classes.value }, hSlot(slots.default));
		}
	});
	new Set([
		"Boolean",
		"Number",
		"String",
		"Function",
		"Array",
		"Date",
		"RegExp"
	].map((name) => "[object " + name + "]"));
	({
		...useDarkProps,
		...useFullscreenProps
	}), [...useFullscreenEmits];
	var QItemLabel_default = /*#__PURE__*/ createComponent({
		name: "QItemLabel",
		props: {
			overline: Boolean,
			caption: Boolean,
			header: Boolean,
			lines: [Number, String]
		},
		setup(props, { slots }) {
			const parsedLines = computed(() => Number.parseInt(props.lines, 10));
			const classes = computed(() => "q-item__label" + (props.overline ? " q-item__label--overline text-overline" : "") + (props.caption ? " q-item__label--caption text-caption" : "") + (props.header ? " q-item__label--header" : "") + (parsedLines.value === 1 ? " ellipsis" : ""));
			const style = computed(() => props.lines !== void 0 && parsedLines.value > 1 ? {
				overflow: "hidden",
				display: "-webkit-box",
				"-webkit-box-orient": "vertical",
				"-webkit-line-clamp": parsedLines.value
			} : null);
			return () => h("div", {
				style: style.value,
				class: classes.value
			}, hSlot(slots.default));
		}
	});
	var insetMap = {
		true: "inset",
		item: "item-inset",
		"item-thumbnail": "item-thumbnail-inset"
	};
	var margins = {
		xs: 2,
		sm: 4,
		md: 8,
		lg: 16,
		xl: 24
	};
	var QSeparator_default = /*#__PURE__*/ createComponent({
		name: "QSeparator",
		props: {
			...useDarkProps,
			spaced: [Boolean, String],
			inset: [Boolean, String],
			vertical: Boolean,
			color: String,
			size: String
		},
		setup(props) {
			const isDark = useDark(props, useQuasar());
			const orientation = computed(() => props.vertical ? "vertical" : "horizontal");
			const orientClass = computed(() => ` q-separator--${orientation.value}`);
			const insetClass = computed(() => props.inset ? `${orientClass.value}-${insetMap[props.inset]}` : "");
			const classes = computed(() => `q-separator${orientClass.value}${insetClass.value}` + (props.color !== void 0 ? ` bg-${props.color}` : "") + (isDark() ? " q-separator--dark" : ""));
			const style = computed(() => {
				const acc = {};
				if (props.size !== void 0) acc[props.vertical ? "width" : "height"] = props.size;
				if (props.spaced) {
					const size = props.spaced === true ? `${margins.md}px` : props.spaced in margins ? `${margins[props.spaced]}px` : props.spaced;
					const dir = props.vertical ? ["Left", "Right"] : ["Top", "Bottom"];
					acc[`margin${dir[0]}`] = acc[`margin${dir[1]}`] = size;
				}
				return acc;
			});
			return () => h("hr", {
				class: classes.value,
				style: style.value,
				"aria-orientation": orientation.value
			});
		}
	});
	typeof CSS !== "undefined" && CSS.supports("height", "calc-size(auto, size)");
	Object.keys(useRouterLinkProps);
	({
		...useRouterLinkProps,
		...useModelToggleProps,
		...useDarkProps
	}), [...useModelToggleEmits];
	var labelPositions = [
		"top",
		"right",
		"bottom",
		"left"
	];
	var useFabProps = {
		type: {
			type: String,
			default: "a"
		},
		outline: Boolean,
		push: Boolean,
		flat: Boolean,
		unelevated: Boolean,
		color: String,
		textColor: String,
		glossy: Boolean,
		square: Boolean,
		padding: String,
		label: {
			type: [String, Number],
			default: ""
		},
		labelPosition: {
			type: String,
			default: "right",
			validator: (v) => labelPositions.includes(v)
		},
		externalLabel: Boolean,
		hideLabel: { type: Boolean },
		labelClass: [
			Array,
			String,
			Object
		],
		labelStyle: [
			Array,
			String,
			Object
		],
		disable: Boolean,
		tabindex: [Number, String]
	};
	var renderedByTheFab = ["label"];
	Object.keys(useFabProps).filter((name) => !renderedByTheFab.includes(name) && QBtn_default.props[name] !== void 0);
	({
		...useFabProps,
		...useModelToggleProps
	}), { ...useFabProps.hideLabel }, { ...useHoverProps };
	({ ...useFabProps });
	function useFormChild({ validate, resetValidation, requiresQForm }) {
		const $form = inject(formKey, false);
		if ($form !== false) {
			const { props, proxy } = getCurrentInstance();
			Object.assign(proxy, {
				validate,
				resetValidation
			});
			watch(() => props.disable, (val) => {
				if (val) {
					if (typeof resetValidation === "function") resetValidation();
					$form.unbindComponent(proxy);
				} else $form.bindComponent(proxy);
			});
			onMounted(() => {
				if (!props.disable) $form.bindComponent(proxy);
			});
			onBeforeUnmount(() => {
				if (!props.disable) $form.unbindComponent(proxy);
			});
		} else if (requiresQForm) console.error("Parent QForm not found on useFormChild()!");
	}
	var lazyRulesValues = [
		true,
		false,
		"ondemand"
	];
	var useValidateProps = {
		modelValue: {},
		error: {
			type: Boolean,
			default: null
		},
		errorMessage: String,
		noErrorIcon: Boolean,
		rules: Array,
		reactiveRules: Boolean,
		lazyRules: {
			type: [Boolean, String],
			default: false,
			validator: (v) => lazyRulesValues.includes(v)
		}
	};
	function useValidate(focused, innerLoading) {
		const { props, proxy } = getCurrentInstance();
		const innerError = /* @__PURE__ */ ref(false);
		const innerErrorMessage = /* @__PURE__ */ ref(null);
		const isDirtyModel = /* @__PURE__ */ ref(false);
		useFormChild({
			validate,
			resetValidation
		});
		let validateIndex = 0, unwatchRules, unmounted = false, pendingBlurValidation = false;
		const hasRules = computed(() => props.rules !== void 0 && props.rules !== null && props.rules.length !== 0);
		const canDebounceValidate = computed(() => !props.disable && hasRules.value && !innerLoading.value);
		const hasError = computed(() => props.error === true || innerError.value);
		const errorMessage = computed(() => typeof props.errorMessage === "string" && props.errorMessage.length !== 0 ? props.errorMessage : innerErrorMessage.value);
		watch(() => props.modelValue, () => {
			isDirtyModel.value = true;
			if (canDebounceValidate.value && (props.lazyRules === false || props.lazyRules === true && innerError.value)) debouncedValidate();
		});
		function onRulesChange() {
			if (props.lazyRules !== "ondemand" && canDebounceValidate.value && isDirtyModel.value) debouncedValidate();
		}
		watch(() => props.reactiveRules, (val) => {
			if (val) {
				if (unwatchRules === void 0) unwatchRules = watch(() => props.rules, onRulesChange, {
					immediate: true,
					deep: true
				});
			} else if (unwatchRules !== void 0) {
				unwatchRules();
				unwatchRules = void 0;
			}
		}, { immediate: true });
		watch(() => props.lazyRules, onRulesChange);
		watch(focused, (val) => {
			if (val) isDirtyModel.value = true;
			else if (props.lazyRules !== "ondemand") {
				if (canDebounceValidate.value) debouncedValidate();
				else if (!props.disable && hasRules.value && innerLoading.value) pendingBlurValidation = true;
			}
		});
		function resetValidation() {
			validateIndex++;
			innerLoading.value = false;
			isDirtyModel.value = false;
			innerError.value = false;
			innerErrorMessage.value = null;
			pendingBlurValidation = false;
			debouncedValidate.cancel();
		}
		function validate(val = props.modelValue) {
			if (props.disable || !hasRules.value) return true;
			const index = ++validateIndex;
			const startModel = props.modelValue;
			pendingBlurValidation = false;
			const revalidateIfStale = () => {
				const blurArrived = pendingBlurValidation;
				pendingBlurValidation = false;
				if (!unmounted && props.modelValue !== startModel && canDebounceValidate.value && props.lazyRules !== "ondemand" && (props.lazyRules === false || innerError.value || blurArrived)) debouncedValidate();
			};
			const setDirty = innerLoading.value ? () => {} : () => {
				isDirtyModel.value = true;
			};
			const update = (hasErr, msg) => {
				if (hasErr) setDirty();
				innerError.value = hasErr;
				innerErrorMessage.value = msg || null;
				innerLoading.value = false;
			};
			const promises = [];
			for (let i = 0; i < props.rules.length; i++) {
				const rule = props.rules[i];
				let res;
				if (typeof rule === "function") res = rule(val, testPattern);
				else if (typeof rule === "string") {
					if (testPattern[rule] === void 0) {
						console.error(`Unknown validation pattern rule: "${rule}"`);
						res = false;
					} else res = testPattern[rule](val);
				}
				if (res === false || typeof res === "string") {
					update(true, res);
					return false;
				} else if (res !== true && res !== void 0) promises.push(res);
			}
			if (promises.length === 0) {
				update(false);
				return true;
			}
			innerLoading.value = true;
			return Promise.all(promises).then((res) => {
				if (res === void 0 || !Array.isArray(res) || res.length === 0) {
					if (index === validateIndex) {
						update(false);
						revalidateIfStale();
					}
					return true;
				}
				const msg = res.find((r) => r === false || typeof r === "string");
				if (index === validateIndex) {
					update(msg !== void 0, msg);
					revalidateIfStale();
				}
				return msg === void 0;
			}, (err) => {
				if (index === validateIndex) {
					console.error(err);
					update(true);
					revalidateIfStale();
				}
				return false;
			});
		}
		const debouncedValidate = debounce(validate, 0);
		onBeforeUnmount(() => {
			unmounted = true;
			unwatchRules?.();
			debouncedValidate.cancel();
		});
		Object.assign(proxy, {
			resetValidation,
			validate
		});
		injectProp(proxy, "hasError", () => hasError.value);
		return {
			isDirtyModel,
			hasRules,
			hasError,
			errorMessage,
			validate,
			resetValidation
		};
	}
	function fieldValueIsFilled(val) {
		return val !== void 0 && val !== null && String(val).length !== 0;
	}
	var useNonInputFieldProps = {
		...useDarkProps,
		...useValidateProps,
		label: String,
		stackLabel: Boolean,
		hint: String,
		hideHint: Boolean,
		prefix: String,
		suffix: String,
		labelColor: String,
		color: String,
		bgColor: String,
		filled: Boolean,
		outlined: Boolean,
		borderless: Boolean,
		standout: [Boolean, String],
		square: Boolean,
		loading: Boolean,
		labelSlot: Boolean,
		bottomSlots: Boolean,
		hideBottomSpace: Boolean,
		rounded: Boolean,
		dense: Boolean,
		itemAligned: Boolean,
		counter: Boolean,
		clearable: Boolean,
		clearIcon: String,
		disable: Boolean,
		readonly: Boolean,
		autofocus: Boolean,
		for: String
	};
	var useFieldProps = {
		...useNonInputFieldProps,
		maxlength: [Number, String]
	};
	var useFieldEmits = [
		"update:modelValue",
		"clear",
		"focus",
		"blur"
	];
	function useFieldState({ requiredForAttr = true, tagProp, changeEvent = false } = {}) {
		const { props } = getCurrentInstance();
		const isDark = useDark(props, useQuasar());
		const targetUid = useId({
			required: requiredForAttr,
			getValue: () => props.for
		});
		return {
			requiredForAttr,
			changeEvent,
			tag: tagProp ? { get value() {
				return props.tag;
			} } : { value: "label" },
			isDark,
			editable: computed(() => !props.disable && !props.readonly),
			innerLoading: /* @__PURE__ */ ref(false),
			focused: /* @__PURE__ */ ref(false),
			hasPopupOpen: false,
			splitAttrs: useSplitAttrs(),
			targetUid,
			rootRef: /* @__PURE__ */ shallowRef(null),
			targetRef: /* @__PURE__ */ shallowRef(null),
			controlRef: /* @__PURE__ */ shallowRef(null)
		};
	}
	var prependProps = {
		class: "q-field__prepend q-field__marginal row no-wrap items-center",
		key: "prepend",
		onClick: prevent
	};
	var appendProps = {
		class: "q-field__append q-field__marginal row no-wrap items-center",
		key: "append",
		onClick: prevent
	};
	var nativeControlSelector = "input:not([disabled]):not([type=\"hidden\"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([disabled]), [contenteditable]:not([contenteditable=\"false\"])";
	var controlContainerProps = { class: "q-field__control-container col relative-position row no-wrap q-anchor--skip" };
	var prefixProps = { class: "q-field__prefix no-pointer-events row items-center" };
	var suffixProps = { class: "q-field__suffix no-pointer-events row items-center" };
	var innerProps = { class: "q-field__inner relative-position col self-stretch" };
	var beforeProps = {
		class: "q-field__before q-field__marginal row no-wrap items-center",
		onClick: prevent
	};
	var afterProps = {
		class: "q-field__after q-field__marginal row no-wrap items-center",
		onClick: prevent
	};
	var noErrorAriaAttrs = {};
	function hasCustomStandout(props, state) {
		return state.focused.value && typeof props.standout === "string" && props.standout.length !== 0;
	}
	function getInnerAppendNode(key, content) {
		return content === null ? null : h("div", {
			key,
			class: "q-field__append q-field__marginal row no-wrap items-center q-anchor--skip"
		}, content);
	}
	function useField(state) {
		const { props, emit, slots, attrs, proxy } = getCurrentInstance();
		const $q = useQuasar();
		let focusoutTimer = null;
		if (state.hasValue === void 0) state.hasValue = computed(() => fieldValueIsFilled(props.modelValue));
		if (state.emitValue === void 0) state.emitValue = (value) => {
			emit("update:modelValue", value);
		};
		if (state.controlEvents === void 0) state.controlEvents = {
			onFocusin: onControlFocusin,
			onFocusout: onControlFocusout,
			onPopupShow: onControlPopupShow,
			onPopupHide: onControlPopupHide
		};
		Object.assign(state, {
			clearValue,
			onControlFocusin,
			onControlFocusout,
			focus
		});
		if (state.computedCounter === void 0) state.computedCounter = computed(() => {
			if (props.counter) {
				const len = typeof props.modelValue === "string" || typeof props.modelValue === "number" ? String(props.modelValue).length : Array.isArray(props.modelValue) ? props.modelValue.length : 0;
				const max = props.maxlength !== void 0 ? props.maxlength : props.maxValues;
				return len + (max !== void 0 ? " / " + max : "");
			}
		});
		const { isDirtyModel, hasRules, hasError, errorMessage, resetValidation } = useValidate(state.focused, state.innerLoading);
		const errorMessageId = computed(() => hasError.value && state.targetUid.value ? `${state.targetUid.value}_error` : void 0);
		function getErrorAriaAttrs(controlAttrs) {
			if (hasError.value !== true) return noErrorAriaAttrs;
			const acc = { "aria-invalid": "true" };
			if (errorMessageId.value !== void 0 && (!props.hideBottomSpace || props.counter || slots.counter !== void 0 || errorMessage.value !== null || slots.error !== void 0)) {
				acc["aria-errormessage"] = controlAttrs?.["aria-errormessage"] !== void 0 ? controlAttrs["aria-errormessage"] : errorMessageId.value;
				acc["aria-describedby"] = controlAttrs?.["aria-describedby"] !== void 0 ? `${controlAttrs["aria-describedby"]} ${errorMessageId.value}` : errorMessageId.value;
			}
			return acc;
		}
		Object.assign(state, {
			hasError,
			errorMessage,
			errorMessageId,
			getErrorAriaAttrs
		});
		const floatingLabel = state.floatingLabel !== void 0 ? computed(() => props.stackLabel || state.focused.value || state.floatingLabel.value) : computed(() => props.stackLabel || state.focused.value || state.hasValue.value);
		const shouldRenderBottom = computed(() => props.bottomSlots || props.hint !== void 0 || hasRules.value || props.counter || props.error !== null);
		const classes = computed(() => "q-field row no-wrap items-start q-field--" + (props.filled ? "filled" : props.outlined ? "outlined" : props.borderless ? "borderless" : props.standout ? "standout" : "standard") + (state.fieldClass !== void 0 ? ` ${state.fieldClass.value}` : "") + (props.rounded ? " q-field--rounded" : "") + (props.square ? " q-field--square" : "") + (floatingLabel.value ? " q-field--float" : "") + (hasLabel.value ? " q-field--labeled" : "") + (props.dense ? " q-field--dense" : "") + (props.itemAligned ? " q-field--item-aligned q-item-type" : "") + (state.isDark() ? " q-field--dark" : "") + (state.getControl === void 0 ? " q-field--auto-height" : "") + (state.focused.value ? " q-field--focused" : "") + (hasError.value ? " q-field--error" : hasCustomStandout(props, state) ? " q-field--standout-custom" : "") + (hasError.value || state.focused.value ? " q-field--highlighted" : "") + (!props.hideBottomSpace && shouldRenderBottom.value ? " q-field--with-bottom" : "") + (props.disable ? " q-field--disabled" : props.readonly ? " q-field--readonly" : ""));
		const contentClass = computed(() => "q-field__control relative-position row no-wrap" + (props.bgColor !== void 0 ? ` bg-${props.bgColor}` : "") + (hasError.value ? " text-negative" : hasCustomStandout(props, state) ? ` ${props.standout}` : props.color !== void 0 ? ` text-${props.color}` : ""));
		const hasLabel = computed(() => props.labelSlot || props.label !== void 0);
		const labelClass = computed(() => "q-field__label no-pointer-events absolute ellipsis" + (props.labelColor !== void 0 && !hasError.value ? ` text-${props.labelColor}` : ""));
		const controlSlotScope = computed(() => injectProp({
			id: state.targetUid.value,
			editable: state.editable.value,
			focused: state.focused.value,
			floatingLabel: floatingLabel.value,
			modelValue: props.modelValue,
			emitValue: state.emitValue,
			ariaInvalid: hasError.value === true ? "true" : void 0,
			ariaDescribedby: errorMessageId.value,
			ariaErrormessage: errorMessageId.value
		}, "field", () => state.rootRef.value));
		const attributes = computed(() => {
			const acc = {};
			if (state.targetUid.value) acc.for = state.targetUid.value;
			if (props.disable) acc["aria-disabled"] = "true";
			return acc;
		});
		function focusHandler() {
			const el = document.activeElement;
			let target = state.targetRef?.value;
			if (target && (el === null || el.id !== state.targetUid.value)) {
				if (!target.hasAttribute("tabindex")) target = target.querySelector("[tabindex]");
				if (target !== el) target?.focus({ preventScroll: true });
			}
		}
		function focus() {
			addFocusFn(focusHandler);
		}
		function onNativeFocus(e) {
			const wrapper = e.target;
			const bound = state.targetUid.value !== null ? document.getElementById(state.targetUid.value) : null;
			if (bound !== null && wrapper.contains(bound)) {
				bound.focus({ preventScroll: true });
				if (document.activeElement === bound) return;
			}
			for (const el of wrapper.querySelectorAll(nativeControlSelector)) {
				el.focus({ preventScroll: true });
				if (document.activeElement === el) return;
			}
		}
		function blur() {
			removeFocusFn(focusHandler);
			const el = document.activeElement;
			if (el !== null && state.rootRef.value.contains(el)) el.blur();
		}
		function onControlFocusin(e) {
			if (focusoutTimer !== null) {
				clearTimeout(focusoutTimer);
				focusoutTimer = null;
			}
			if (!props.disable && !state.focused.value) {
				state.focused.value = true;
				emit("focus", e);
			}
		}
		function onControlFocusout(e, then) {
			if (focusoutTimer !== null) clearTimeout(focusoutTimer);
			focusoutTimer = setTimeout(() => {
				focusoutTimer = null;
				if (document.hasFocus() && (state.hasPopupOpen || state.controlRef === void 0 || state.controlRef.value === null || state.controlRef.value.contains(document.activeElement))) return;
				if (state.focused.value) {
					state.focused.value = false;
					emit("blur", e);
				}
				then?.();
			}, 0);
		}
		function onControlPopupShow(e) {
			state.hasPopupOpen = true;
			onControlFocusin(e);
		}
		function onControlPopupHide(e) {
			state.hasPopupOpen = false;
			onControlFocusout(e);
		}
		function clearValue(e) {
			stopAndPrevent(e);
			if (!$q.platform.is.mobile) (state.targetRef?.value || state.rootRef.value).focus();
			else if (state.rootRef.value.contains(document.activeElement)) document.activeElement.blur();
			if (props.type === "file") state.inputRef.value.value = null;
			state.onClear?.();
			emit("update:modelValue", null);
			if (state.changeEvent) emit("change", null);
			emit("clear", props.modelValue);
			nextTick(() => {
				const isDirty = isDirtyModel.value;
				resetValidation();
				isDirtyModel.value = isDirty;
			});
		}
		function onClearableKeyup(evt) {
			if ([13, 32].includes(evt.keyCode)) clearValue(evt);
		}
		function getContent() {
			const node = [];
			if (slots.prepend !== void 0) node.push(h("div", prependProps, slots.prepend()));
			node.push(h("div", controlContainerProps, getControlContainer()));
			if (hasError.value && !props.noErrorIcon) node.push(getInnerAppendNode("error", [h(QIcon_default, {
				name: $q.iconSet.field.error,
				color: "negative"
			})]));
			const loadingContent = props.loading || state.innerLoading.value ? slots.loading !== void 0 ? slots.loading() : state.shouldHideLoadingIndicator?.() ? null : [h(QSpinner_default, { color: props.color })] : null;
			if (loadingContent !== null) node.push(getInnerAppendNode("inner-loading-append", loadingContent));
			else if (props.clearable && state.hasValue.value && state.editable.value) node.push(getInnerAppendNode("inner-clearable-append", [h(QIcon_default, {
				class: "q-field__focusable-action",
				name: props.clearIcon || $q.iconSet.field.clear,
				tabindex: 0,
				role: "button",
				"aria-hidden": "false",
				"aria-label": $q.lang.label.clear,
				onKeyup: onClearableKeyup,
				onClick: clearValue
			})]));
			if (slots.append !== void 0) node.push(h("div", appendProps, slots.append()));
			if (state.getInnerAppend !== void 0) node.push(getInnerAppendNode("inner-append", state.getInnerAppend()));
			if (state.getControlChild !== void 0) node.push(state.getControlChild());
			return node;
		}
		function getControlContainer() {
			const node = [];
			if (props.prefix !== void 0 && props.prefix !== null) node.push(h("div", prefixProps, props.prefix));
			if (state.getShadowControl !== void 0 && state.hasShadow.value) node.push(state.getShadowControl());
			if (hasLabel.value) node.push(h("div", { class: labelClass.value }, hSlot(slots.label, props.label)));
			if (state.getControl !== void 0) node.push(state.getControl());
			else if (slots.rawControl !== void 0) node.push(slots.rawControl());
			else if (slots.control !== void 0) node.push(h("div", {
				ref: state.targetRef,
				class: "q-field__native row",
				tabindex: -1,
				...state.splitAttrs.attributes.value,
				"data-autofocus": props.autofocus || void 0,
				onFocus: onNativeFocus
			}, slots.control(controlSlotScope.value)));
			if (props.suffix !== void 0 && props.suffix !== null) node.push(h("div", suffixProps, props.suffix));
			return node.concat(hSlot(slots.default));
		}
		let messageKey = null;
		let animateMessage = false;
		function getBottom() {
			let msg, key;
			if (hasError.value) {
				if (errorMessage.value !== null) {
					msg = [h("div", { role: "alert" }, errorMessage.value)];
					key = `q--slot-error-${errorMessage.value}`;
				} else {
					msg = hSlot(slots.error);
					key = "q--slot-error";
				}
			} else if (!props.hideHint || state.focused.value) {
				if (props.hint !== void 0) {
					msg = [h("div", props.hint)];
					key = `q--slot-hint-${props.hint}`;
				} else {
					msg = hSlot(slots.hint);
					key = "q--slot-hint";
				}
			}
			const hasCounter = props.counter || slots.counter !== void 0;
			if (props.hideBottomSpace && !hasCounter && msg === void 0) return;
			if (key !== messageKey) {
				animateMessage = messageKey !== null;
				messageKey = key;
			}
			return h("div", {
				class: "q-field__bottom row items-start q-field__bottom--" + (props.hideBottomSpace ? "stale" : "animated"),
				onClick: prevent
			}, [h("div", {
				key,
				id: hasError.value === true ? errorMessageId.value : void 0,
				class: "q-field__messages col" + (animateMessage && !props.hideBottomSpace ? " q-field__messages--animated" : "")
			}, msg), hasCounter ? h("div", { class: "q-field__counter" }, slots.counter !== void 0 ? slots.counter() : state.computedCounter.value) : null]);
		}
		let shouldActivate = false;
		onDeactivated(() => {
			shouldActivate = true;
		});
		onActivated(() => {
			if (shouldActivate && props.autofocus) proxy.focus();
		});
		if (props.autofocus) onMounted(() => {
			proxy.focus();
		});
		onBeforeUnmount(() => {
			if (focusoutTimer !== null) clearTimeout(focusoutTimer);
		});
		Object.assign(proxy, {
			focus,
			blur
		});
		return function renderField() {
			const labelAttrs = state.getControl === void 0 && slots.control === void 0 ? {
				...state.splitAttrs.attributes.value,
				"data-autofocus": props.autofocus || void 0,
				...attributes.value
			} : attributes.value;
			return h(state.tag.value, {
				ref: state.rootRef,
				class: [classes.value, attrs.class],
				style: attrs.style,
				...labelAttrs
			}, [
				slots.before !== void 0 ? h("div", beforeProps, slots.before()) : null,
				h("div", innerProps, [h("div", {
					ref: state.controlRef,
					class: contentClass.value,
					tabindex: -1,
					...state.controlEvents
				}, getContent()), shouldRenderBottom.value ? getBottom() : null]),
				slots.after !== void 0 ? h("div", afterProps, slots.after()) : null
			]);
		};
	}
	var QField_default = /*#__PURE__*/ createComponent({
		name: "QField",
		inheritAttrs: false,
		props: {
			...useFieldProps,
			tag: {
				type: String,
				default: "label"
			}
		},
		emits: useFieldEmits,
		setup() {
			return useField(useFieldState({ tagProp: true }));
		}
	});
	var useFileProps = {
		multiple: Boolean,
		accept: String,
		capture: String,
		maxFileSize: [Number, String],
		maxTotalSize: [Number, String],
		maxFiles: [Number, String],
		filter: Function
	};
	var useFileEmits = ["rejected"];
	function useFileDomProps(props, typeGuard) {
		function getFormDomProps() {
			const model = props.modelValue;
			try {
				const dt = new DataTransfer();
				if (Object(model) === model) ("length" in model ? [...model] : [model]).forEach((file) => {
					dt.items.add(file);
				});
				return { files: dt.files };
			} catch {
				return { files: void 0 };
			}
		}
		return typeGuard ? computed(() => {
			if (props.type !== "file") return;
			return getFormDomProps();
		}) : computed(getFormDomProps);
	}
	({
		...useNonInputFieldProps,
		...useFormProps,
		...useFileProps
	}), [...useFieldEmits, ...useFileEmits];
	function validateComponent(comp) {
		let valid;
		try {
			valid = comp.validate();
		} catch (err) {
			return Promise.resolve({
				valid: false,
				comp,
				err
			});
		}
		return typeof valid?.then === "function" ? valid.then((isValid) => ({
			valid: isValid,
			comp
		}), (err) => ({
			valid: false,
			comp,
			err
		})) : Promise.resolve({
			valid,
			comp
		});
	}
	var QForm_default = /*#__PURE__*/ createComponent({
		name: "QForm",
		props: {
			autofocus: Boolean,
			noErrorFocus: Boolean,
			noResetFocus: Boolean,
			greedy: Boolean,
			onSubmit: Function
		},
		emits: [
			"reset",
			"validationSuccess",
			"validationError"
		],
		setup(props, { slots, emit }) {
			const vm = getCurrentInstance();
			const rootRef = /* @__PURE__ */ shallowRef(null);
			let validateIndex = 0;
			const registeredComponents = [];
			function validate(shouldFocus) {
				const localFocus = typeof shouldFocus === "boolean" ? shouldFocus : !props.noErrorFocus;
				const index = ++validateIndex;
				const emitEvent = (res, compRef) => {
					emit(`validation${res ? "Success" : "Error"}`, compRef);
				};
				return (props.greedy ? Promise.all(registeredComponents.map(validateComponent)).then((res) => res.filter((r) => !r.valid)) : registeredComponents.reduce((acc, comp) => acc.then(() => validateComponent(comp)).then((r) => {
					if (!r.valid) throw r;
				}), Promise.resolve()).catch((err) => [err])).then((errors) => {
					if (errors === void 0 || errors.length === 0) {
						if (index === validateIndex) emitEvent(true);
						return true;
					}
					if (index === validateIndex) {
						const { comp, err } = errors[0];
						if (err !== void 0) console.error(err);
						emitEvent(false, comp);
						if (localFocus) {
							const activeError = errors.find(({ comp: compRef }) => typeof compRef.focus === "function" && !vmIsDestroyed(compRef.$));
							if (activeError !== void 0) activeError.comp.focus();
						}
					}
					return false;
				});
			}
			function resetValidation() {
				validateIndex++;
				registeredComponents.forEach((comp) => {
					if (typeof comp.resetValidation === "function") comp.resetValidation();
				});
			}
			function submit(evt) {
				if (evt !== void 0) stopAndPrevent(evt);
				const index = validateIndex + 1;
				validate().then((val) => {
					if (index === validateIndex && val) {
						if (props.onSubmit !== void 0) emit("submit", evt);
						else if (evt?.target !== void 0 && typeof evt.target.submit === "function") evt.target.submit();
					}
				});
			}
			function reset(evt) {
				if (evt !== void 0) stopAndPrevent(evt);
				emit("reset");
				nextTick(() => {
					resetValidation();
					if (props.autofocus && !props.noResetFocus) focus();
				});
			}
			function focus() {
				addFocusFn(() => {
					if (rootRef.value === null) return;
					(rootRef.value.querySelector("[autofocus][tabindex], [data-autofocus][tabindex]") || rootRef.value.querySelector("[autofocus] [tabindex], [data-autofocus] [tabindex]") || rootRef.value.querySelector("[autofocus], [data-autofocus]") || Array.prototype.find.call(rootRef.value.querySelectorAll("[tabindex]"), (el) => el.tabIndex !== -1))?.focus({ preventScroll: true });
				});
			}
			provide(formKey, {
				bindComponent(vmProxy) {
					registeredComponents.push(vmProxy);
				},
				unbindComponent(vmProxy) {
					const index = registeredComponents.indexOf(vmProxy);
					if (index !== -1) registeredComponents.splice(index, 1);
				}
			});
			let shouldActivate = false;
			onDeactivated(() => {
				shouldActivate = true;
			});
			onActivated(() => {
				if (shouldActivate && props.autofocus) focus();
			});
			onMounted(() => {
				if (props.autofocus) focus();
			});
			Object.assign(vm.proxy, {
				validate,
				resetValidation,
				submit,
				reset,
				focus,
				getValidationComponents: () => registeredComponents
			});
			return () => h("form", {
				class: "q-form",
				ref: rootRef,
				onSubmit: submit,
				onReset: reset
			}, hSlot(slots.default));
		}
	});
	var useRatioProps = { ratio: [String, Number] };
	({ ...useRatioProps });
	({
		...useDarkProps,
		...useTransitionProps
	});
	var NAMED_MASKS = {
		date: "####/##/##",
		datetime: "####/##/## ##:##",
		time: "##:##",
		fulltime: "##:##:##",
		phone: "(###) ### - ####",
		card: "#### #### #### ####"
	};
	var patternTesters = {
		"[\\d]": (char) => {
			const code = char.codePointAt(0);
			return code > 47 && code < 58;
		},
		"[a-zA-Z]": (char) => {
			const code = char.codePointAt(0);
			return code > 64 && code < 91 || code > 96 && code < 123;
		},
		"[0-9a-zA-Z]": (char) => {
			const code = char.codePointAt(0);
			return code > 47 && code < 58 || code > 64 && code < 91 || code > 96 && code < 123;
		}
	};
	var { tokenMap: DEFAULT_TOKEN_MAP, tokenKeys: DEFAULT_TOKEN_MAP_KEYS } = /*#__PURE__*/ getTokenMap({
		"#": {
			pattern: "[\\d]",
			negate: "[^\\d]"
		},
		S: {
			pattern: "[a-zA-Z]",
			negate: "[^a-zA-Z]"
		},
		N: {
			pattern: "[0-9a-zA-Z]",
			negate: "[^0-9a-zA-Z]"
		},
		A: {
			pattern: "[a-zA-Z]",
			negate: "[^a-zA-Z]",
			transform: (v) => v.toLocaleUpperCase()
		},
		a: {
			pattern: "[a-zA-Z]",
			negate: "[^a-zA-Z]",
			transform: (v) => v.toLocaleLowerCase()
		},
		X: {
			pattern: "[0-9a-zA-Z]",
			negate: "[^0-9a-zA-Z]",
			transform: (v) => v.toLocaleUpperCase()
		},
		x: {
			pattern: "[0-9a-zA-Z]",
			negate: "[^0-9a-zA-Z]",
			transform: (v) => v.toLocaleLowerCase()
		}
	});
	function getTokenMap(tokens) {
		const tokenKeys = Object.keys(tokens);
		const tokenMap = {};
		tokenKeys.forEach((key) => {
			const entry = tokens[key];
			let test;
			if (Object.hasOwn(patternTesters, entry.pattern)) test = patternTesters[entry.pattern];
			else {
				const regex = new RegExp(entry.pattern);
				test = (char) => regex.test(char);
			}
			tokenMap[key] = {
				...entry,
				test
			};
		});
		return {
			tokenMap,
			tokenKeys
		};
	}
	function getTokenRegexMask(keys) {
		return new RegExp("\\\\([^.*+?^${}()|([\\]])|([.*+?^${}()|[\\]])|([" + keys.join("") + "])|(.)", "g");
	}
	var EDIT_INPUT_TYPES = [
		"insertText",
		"deleteContentBackward",
		"deleteContentForward",
		"deleteWordBackward",
		"deleteWordForward",
		"deleteByCut"
	];
	var escRegex = /[.*+?^${}()|[\]\\]/g;
	var DEFAULT_TOKEN_REGEX_MASK = /*#__PURE__*/ getTokenRegexMask(DEFAULT_TOKEN_MAP_KEYS);
	var MARKER = String.fromCodePoint(1);
	var useMaskProps = {
		mask: String,
		reverseFillMask: Boolean,
		fillMask: [Boolean, String],
		unmaskedValue: Boolean,
		maskTokens: Object
	};
	function useMask(props, emit, emitValue, inputRef, cancelPendingValueEmission) {
		let maskMarked, maskReplaced, computedMask, computedUnmask, pastedTextStart, selectionAnchor, innerValueDataLen;
		const tokens = computed(() => {
			if (props.maskTokens === void 0 || props.maskTokens === null) return {
				tokenMap: DEFAULT_TOKEN_MAP,
				tokenRegexMask: DEFAULT_TOKEN_REGEX_MASK
			};
			const { tokenMap: customTokens } = getTokenMap(props.maskTokens);
			const tokenMap = {
				...DEFAULT_TOKEN_MAP,
				...customTokens
			};
			return {
				tokenMap,
				tokenRegexMask: getTokenRegexMask(Object.keys(tokenMap))
			};
		});
		const hasMask = /* @__PURE__ */ ref(null);
		const innerValue = /* @__PURE__ */ ref(getInitialMaskedValue());
		function getIsTypeText() {
			return props.autogrow || [
				"textarea",
				"text",
				"search",
				"url",
				"tel",
				"password"
			].includes(props.type);
		}
		watch(() => props.type + props.autogrow, updateMaskInternals);
		watch(() => props.mask, (v) => {
			if (v !== void 0) updateMaskValue(innerValue.value, true);
			else {
				const val = unmaskValue(hasMask.value ? stripFillPadding(innerValue.value, innerValueDataLen) : innerValue.value);
				updateMaskInternals();
				if (props.modelValue !== val) emit("update:modelValue", val);
			}
		});
		watch(() => props.fillMask + props.reverseFillMask, () => {
			if (hasMask.value) updateMaskValue(innerValue.value, true);
		});
		watch(() => props.unmaskedValue, () => {
			if (hasMask.value) updateMaskValue(innerValue.value);
		});
		watch(() => props.maskTokens, () => {
			if (hasMask.value) updateMaskValue(innerValue.value, true);
		}, { deep: true });
		function getInitialMaskedValue() {
			updateMaskInternals();
			if (hasMask.value) {
				const masked = maskValue(unmaskValue(props.modelValue));
				innerValueDataLen = masked.length;
				return props.fillMask !== false ? fillWithMask(masked) : masked;
			}
			innerValueDataLen = 0;
			return props.modelValue;
		}
		function getPaddedMaskMarked(size) {
			if (size < maskMarked.length) return maskMarked.slice(-size);
			let pad = "", localMaskMarked = maskMarked;
			const padPos = localMaskMarked.indexOf(MARKER);
			if (padPos !== -1) {
				for (let i = size - localMaskMarked.length; i > 0; i--) pad += MARKER;
				localMaskMarked = localMaskMarked.slice(0, padPos) + pad + localMaskMarked.slice(padPos);
			}
			return localMaskMarked;
		}
		function updateMaskInternals() {
			hasMask.value = props.mask !== void 0 && props.mask.length !== 0 && getIsTypeText();
			if (!hasMask.value) {
				computedUnmask = void 0;
				maskMarked = "";
				maskReplaced = "";
				return;
			}
			const localComputedMask = NAMED_MASKS[props.mask] === void 0 ? props.mask : NAMED_MASKS[props.mask], fillChar = typeof props.fillMask === "string" && props.fillMask.length !== 0 ? props.fillMask.slice(0, 1) : "_", fillCharEscaped = fillChar.replace(escRegex, String.raw`\$&`), unmask = [], extract = [], mask = [];
			let firstMatch = props.reverseFillMask, unmaskChar = "", negateChar = "";
			localComputedMask.replace(tokens.value.tokenRegexMask, (_, char1, esc, token, char2) => {
				if (token !== void 0) {
					const c = tokens.value.tokenMap[token];
					mask.push(c);
					negateChar = c.negate;
					if (firstMatch) {
						extract.push({
							c,
							overflow: true
						});
						firstMatch = false;
					}
					extract.push({ c });
					return;
				}
				if (esc !== void 0) {
					unmaskChar = "\\" + (esc === "\\" ? "" : esc);
					mask.push(esc);
				} else {
					const c = char1 !== void 0 ? char1 : char2;
					unmaskChar = c === "\\" ? String.raw`\\\\` : c.replace(escRegex, String.raw`\\$&`);
					mask.push(c);
				}
				unmask.push("([^" + unmaskChar + "]+)?" + unmaskChar + "?");
			});
			const maskTokenPatterns = [...new Set(mask.filter((v) => typeof v !== "string").map(({ pattern }) => pattern))], unmaskMatcher = new RegExp("^" + unmask.join("") + "(" + (unmaskChar === "" ? "." : "[^" + unmaskChar + "]") + "+)?" + (unmaskChar === "" ? "" : "[" + unmaskChar + "]*") + "$"), extractLast = extract.length - 1, separator = maskTokenPatterns.length === 1 ? negateChar : "(?:" + maskTokenPatterns.map((pattern) => "(?!" + pattern + ")").join("") + String.raw`[\s\S])`, getExtractSource = ({ c, overflow }) => overflow === true ? "(?:" + separator + "+)?(" + c.pattern + "+)?(?:" + separator + "+)?(" + c.pattern + "+)?" : "(?:" + separator + "+)?(" + c.pattern + ")?", extractMatcher = extract.map((entry, index) => {
				const re = getExtractSource(entry);
				if (index === 0 && props.reverseFillMask) return new RegExp("^" + fillCharEscaped + "*" + re);
				else if (index === extractLast) return new RegExp("^" + re + "(" + (negateChar === "" ? "." : negateChar) + "+)?" + (props.reverseFillMask ? "$" : fillCharEscaped + "*"));
				return new RegExp("^" + re);
			});
			computedMask = mask;
			computedUnmask = (val) => {
				const unmaskMatch = unmaskMatcher.exec(props.reverseFillMask ? val : val.slice(0, mask.length + 1));
				if (unmaskMatch !== null) val = unmaskMatch.slice(1).join("");
				const extractMatch = [], extractMatcherLength = extractMatcher.length;
				for (let i = 0, str = val; i < extractMatcherLength; i++) {
					const m = extractMatcher[i].exec(str);
					if (m === null) break;
					str = str.slice(m.shift().length);
					extractMatch.push(...m);
				}
				if (extractMatch.length !== 0) return extractMatch.join("");
				return val;
			};
			maskMarked = mask.map((v) => typeof v === "string" ? v : MARKER).join("");
			maskReplaced = maskMarked.split(MARKER).join(fillChar);
		}
		function getDataCharTester(str, dataLen) {
			const strLen = str.length, localMaskMarked = props.reverseFillMask ? getPaddedMaskMarked(strLen) : maskMarked, defOffset = props.reverseFillMask ? computedMask.length - strLen : 0, fillFrom = props.reverseFillMask ? 0 : Math.min(dataLen, strLen), fillTo = props.reverseFillMask ? strLen - dataLen : strLen;
			return (i) => {
				if (localMaskMarked[i] !== MARKER || i >= fillFrom && i < fillTo) return false;
				const maskDef = computedMask[defOffset + i];
				return maskDef === void 0 || typeof maskDef === "string" ? true : maskDef.test(str[i]);
			};
		}
		function countDataChars(str, position, dataLen) {
			const isDataChar = getDataCharTester(str, dataLen);
			let count = 0;
			for (let i = 0; i < position; i++) if (isDataChar(i)) count++;
			return count;
		}
		function updateMaskValue(rawVal, updateMaskInternalsFlag, inputType) {
			const inp = inputRef.value, end = inp?.selectionEnd ?? 0, endReverse = inp === null ? 0 : inp.value.length - end, unmasked = updateMaskInternalsFlag !== true && typeof innerValue.value === "string" && EDIT_INPUT_TYPES.includes(inputType) ? unmaskEditValue(innerValue.value, innerValueDataLen, rawVal, inputType) : unmaskValue(rawVal);
			let dataBeforeCaret;
			if (updateMaskInternalsFlag === true && inp !== null && maskMarked.length !== 0) dataBeforeCaret = countDataChars(inp.value, end, innerValueDataLen);
			if (updateMaskInternalsFlag === true) updateMaskInternals();
			const preMasked = maskValue(unmasked, updateMaskInternalsFlag), masked = props.fillMask !== false ? fillWithMask(preMasked) : preMasked, maskedDataLen = preMasked.length, changed = innerValue.value !== masked, dataChanged = changed || maskedDataLen !== innerValueDataLen;
			innerValueDataLen = maskedDataLen;
			const rendersEmpty = props.fillMask !== false && maskedDataLen === 0;
			if (inp !== null && inp.value !== masked) inp.value = masked;
			if (changed) innerValue.value = masked;
			if (inp !== null && document.activeElement === inp) nextTick(() => {
				if (rendersEmpty) {
					const cursor = props.reverseFillMask ? maskReplaced.length : 0;
					inp.setSelectionRange(cursor, cursor, "forward");
					return;
				}
				if (dataBeforeCaret !== void 0) {
					let cursor = 0, found = 0;
					while (cursor < masked.length && found < dataBeforeCaret) {
						found = countDataChars(masked, cursor + 1, maskedDataLen);
						cursor++;
					}
					inp.setSelectionRange(cursor, cursor, "forward");
					return;
				}
				if (inputType === "insertFromPaste" && !props.reverseFillMask) {
					const maxEnd = inp.selectionEnd;
					let cursor = end - 1;
					for (let i = pastedTextStart; i <= cursor && i < maxEnd; i++) if (maskMarked[i] !== MARKER) cursor++;
					moveCursor.right(inp, cursor);
					return;
				}
				if (["deleteContentBackward", "deleteContentForward"].includes(inputType)) {
					const cursor = props.reverseFillMask ? end === 0 ? masked.length > preMasked.length ? 1 : 0 : Math.max(0, masked.length - (rendersEmpty ? 0 : Math.min(preMasked.length, endReverse) + 1)) + 1 : end;
					inp.setSelectionRange(cursor, cursor, "forward");
					return;
				}
				if (props.reverseFillMask) {
					if (dataChanged) {
						const cursor = Math.max(0, masked.length - (rendersEmpty ? 0 : Math.min(preMasked.length, endReverse + 1)));
						if (cursor === 1 && end === 1) inp.setSelectionRange(cursor, cursor, "forward");
						else moveCursor.rightReverse(inp, cursor);
					} else {
						const cursor = masked.length - endReverse;
						inp.setSelectionRange(cursor, cursor, "backward");
					}
				} else if (dataChanged) {
					const cursor = Math.max(0, maskMarked.indexOf(MARKER), Math.min(preMasked.length, end) - 1);
					moveCursor.right(inp, cursor);
				} else {
					const cursor = end - 1;
					moveCursor.right(inp, cursor);
				}
			});
			const val = props.unmaskedValue ? unmaskValue(preMasked) : masked;
			if (String(props.modelValue) !== val && (props.modelValue !== null || val !== "")) emitValue(val, true);
			else if (cancelPendingValueEmission !== void 0) cancelPendingValueEmission();
		}
		function moveCursorForPaste(inp, start, end) {
			const preMasked = maskValue(unmaskValue(inp.value));
			start = Math.max(0, maskMarked.indexOf(MARKER), Math.min(preMasked.length, start));
			pastedTextStart = start;
			inp.setSelectionRange(start, end, "forward");
		}
		const moveCursor = {
			left(inp, cursor) {
				const noMarkBefore = !maskMarked.slice(cursor - 1).includes(MARKER);
				let i = Math.max(0, cursor - 1);
				for (; i >= 0; i--) if (maskMarked[i] === MARKER) {
					cursor = i;
					if (noMarkBefore) cursor++;
					break;
				}
				if (i < 0 && maskMarked[cursor] !== void 0 && maskMarked[cursor] !== MARKER) return moveCursor.right(inp, 0);
				if (cursor >= 0) inp.setSelectionRange(cursor, cursor, "backward");
			},
			right(inp, cursor) {
				const limit = inp.value.length;
				let i = Math.min(limit, cursor + 1);
				for (; i <= limit; i++) if (maskMarked[i] === MARKER) {
					cursor = i;
					break;
				} else if (maskMarked[i - 1] === MARKER) cursor = i;
				if (i > limit && maskMarked[cursor - 1] !== void 0 && maskMarked[cursor - 1] !== MARKER) return moveCursor.left(inp, limit);
				inp.setSelectionRange(cursor, cursor, "forward");
			},
			leftReverse(inp, cursor) {
				const localMaskMarked = getPaddedMaskMarked(inp.value.length);
				let i = Math.max(0, cursor - 1);
				for (; i >= 0; i--) if (localMaskMarked[i - 1] === MARKER) {
					cursor = i;
					break;
				} else if (localMaskMarked[i] === MARKER) {
					cursor = i;
					if (i === 0) break;
				}
				if (i < 0 && localMaskMarked[cursor] !== void 0 && localMaskMarked[cursor] !== MARKER) return moveCursor.rightReverse(inp, 0);
				if (cursor >= 0) inp.setSelectionRange(cursor, cursor, "backward");
			},
			rightReverse(inp, cursor) {
				const limit = inp.value.length, localMaskMarked = getPaddedMaskMarked(limit), noMarkBefore = !localMaskMarked.slice(0, cursor + 1).includes(MARKER);
				let i = Math.min(limit, cursor + 1);
				for (; i <= limit; i++) if (localMaskMarked[i - 1] === MARKER) {
					cursor = i;
					if (cursor > 0 && noMarkBefore) cursor--;
					break;
				}
				if (i > limit && localMaskMarked[cursor - 1] !== void 0 && localMaskMarked[cursor - 1] !== MARKER) return moveCursor.leftReverse(inp, limit);
				inp.setSelectionRange(cursor, cursor, "forward");
			}
		};
		function onMaskedClick(e) {
			emit("click", e);
			selectionAnchor = void 0;
		}
		function onMaskedKeydown(e) {
			emit("keydown", e);
			if (e.defaultPrevented || e.altKey || shouldIgnoreKey(e)) return;
			const inp = inputRef.value, start = inp.selectionStart, end = inp.selectionEnd;
			if (!e.shiftKey) selectionAnchor = void 0;
			if (e.keyCode === 37 || e.keyCode === 39) {
				if (e.shiftKey && selectionAnchor === void 0) selectionAnchor = inp.selectionDirection === "forward" ? start : end;
				const fn = moveCursor[(e.keyCode === 39 ? "right" : "left") + (props.reverseFillMask ? "Reverse" : "")];
				e.preventDefault();
				fn(inp, selectionAnchor === start ? end : start);
				if (e.shiftKey) {
					const cursor = inp.selectionStart;
					inp.setSelectionRange(Math.min(selectionAnchor, cursor), Math.max(selectionAnchor, cursor), "forward");
				}
			} else if (e.keyCode === 8 && !props.reverseFillMask && start === end) {
				moveCursor.left(inp, start);
				inp.setSelectionRange(inp.selectionStart, end, "backward");
			} else if (e.keyCode === 46 && props.reverseFillMask && start === end) {
				moveCursor.rightReverse(inp, end);
				inp.setSelectionRange(start, inp.selectionEnd, "forward");
			}
		}
		function maskValue(val, updateMaskInternalsFlag) {
			if (val === void 0 || val === null || val === "") return "";
			if (props.reverseFillMask) return maskValueReverse(val, updateMaskInternalsFlag);
			const mask = computedMask;
			let valIndex = 0, output = "";
			for (let maskIndex = 0; maskIndex < mask.length; maskIndex++) {
				const valChar = val[valIndex], maskDef = mask[maskIndex];
				if (typeof maskDef === "string") {
					output += maskDef;
					if (updateMaskInternalsFlag === true && valChar === maskDef) valIndex++;
				} else if (valChar !== void 0 && maskDef.test(valChar)) {
					output += maskDef.transform !== void 0 ? maskDef.transform(valChar) : valChar;
					valIndex++;
				} else return output;
			}
			return output;
		}
		function maskValueReverse(val, updateMaskInternalsFlag) {
			const mask = computedMask, firstTokenIndex = maskMarked.indexOf(MARKER);
			let valIndex = val.length - 1, output = "", pendingLiterals = "";
			for (let maskIndex = mask.length - 1; maskIndex >= 0 && valIndex !== -1; maskIndex--) {
				const maskDef = mask[maskIndex];
				let valChar = val[valIndex];
				if (typeof maskDef === "string") {
					pendingLiterals = maskDef + pendingLiterals;
					if (updateMaskInternalsFlag === true && valChar === maskDef) valIndex--;
				} else if (valChar !== void 0 && maskDef.test(valChar)) {
					output = pendingLiterals + output;
					pendingLiterals = "";
					do {
						output = (maskDef.transform !== void 0 ? maskDef.transform(valChar) : valChar) + output;
						valIndex--;
						valChar = val[valIndex];
					} while (firstTokenIndex === maskIndex && valChar !== void 0 && maskDef.test(valChar));
				} else return output;
			}
			return output;
		}
		function unmaskEditValue(prev, prevDataLen, val, inputType) {
			const prevLen = prev.length, valLen = val.length, minLen = Math.min(prevLen, valLen);
			let start = 0;
			while (start < minLen && prev[start] === val[start]) start++;
			let end = 0;
			while (end < minLen - start && prev[prevLen - 1 - end] === val[valLen - 1 - end]) end++;
			const dataAt = getDataCharTester(prev, prevDataLen);
			let before = "", after = "";
			for (let i = 0; i < start; i++) if (dataAt(i)) before += prev[i];
			for (let i = prevLen - end; i < prevLen; i++) if (dataAt(i)) after += prev[i];
			let inserted = "";
			const rawInserted = val.slice(start, valLen - end);
			if (rawInserted.length !== 0) {
				if (props.reverseFillMask) {
					for (const char of rawInserted) if (computedMask.some((maskDef) => typeof maskDef !== "string" && maskDef.test(char))) inserted += char;
				} else {
					const tokenDefs = computedMask.filter((maskDef) => typeof maskDef !== "string");
					let slot = before.length;
					for (const char of rawInserted) if (tokenDefs[slot] !== void 0 && tokenDefs[slot].test(char)) {
						inserted += char;
						slot++;
					}
				}
			} else if (!props.reverseFillMask && start + end < prevLen) {
				let deletedData = false;
				for (let i = start; i < prevLen - end; i++) if (dataAt(i)) {
					deletedData = true;
					break;
				}
				if (!deletedData) {
					if (inputType === "deleteContentForward") after = after.slice(1);
					else before = before.slice(0, -1);
				}
			}
			return before + inserted + after;
		}
		function unmaskValue(val) {
			return typeof val !== "string" || computedUnmask === void 0 ? typeof val === "number" ? computedUnmask(String(val)) : val : computedUnmask(val);
		}
		function stripFillPadding(str, dataLen) {
			if (dataLen >= str.length) return str;
			return props.reverseFillMask ? str.slice(str.length - dataLen) : str.slice(0, dataLen);
		}
		function fillWithMask(val) {
			if (maskReplaced.length - val.length <= 0) return val;
			return props.reverseFillMask && val.length !== 0 ? maskReplaced.slice(0, -val.length) + val : val + maskReplaced.slice(val.length);
		}
		return {
			innerValue,
			hasMask,
			moveCursorForPaste,
			updateMaskValue,
			onMaskedKeydown,
			onMaskedClick
		};
	}
	/**
	* Returns adjustHeight on the JS path only (undefined on the CSS path,
	* which is also where a DOM-less import lands: jsdom and friends have
	* no CSS global, and this runs at import time, not per instance).
	* The seam the component tests re-mock to force the JS fallback per
	* test (through the exported createAdjustHeightFn()).
	*/
	var useAutogrow = typeof CSS === "undefined" || CSS.supports("field-sizing", "content") ? void 0 : createAdjustHeightFn;
	/**
	* The measuring autogrow for browsers without CSS field-sizing:
	* collapses the textarea to 1px, reads its scrollHeight and writes it
	* back as the inline height. Runs on mount and on the autogrow/dense
	* prop changes by itself; returns the routine for the call sites that
	* must trigger it on their own schedule (input, model changes,
	* autofill animationend).
	*/
	function createAdjustHeightFn(props, attrs, inputRef, $q) {
		let frameId = null;
		function cancelPendingFrame() {
			if (frameId !== null) {
				cancelAnimationFrame(frameId);
				frameId = null;
			}
		}
		function adjustHeight() {
			if (frameId !== null) return;
			frameId = requestAnimationFrame(() => {
				frameId = null;
				const inp = inputRef.value;
				if (inp !== null) {
					const parentStyle = inp.parentNode.style;
					const { scrollTop } = inp;
					const { overflowY, maxHeight } = $q.platform.is.firefox ? {} : window.getComputedStyle(inp);
					const changeOverflow = overflowY !== void 0 && overflowY !== "scroll";
					if (changeOverflow) inp.style.overflowY = "hidden";
					parentStyle.marginBottom = inp.scrollHeight - 1 + "px";
					inp.style.height = "1px";
					inp.style.height = inp.scrollHeight + "px";
					if (changeOverflow) inp.style.overflowY = Number.parseInt(maxHeight, 10) < inp.scrollHeight ? "auto" : "hidden";
					parentStyle.marginBottom = "";
					inp.scrollTop = scrollTop;
				}
			});
		}
		watch(() => props.autogrow, (val) => {
			if (val) nextTick(adjustHeight);
			else if (inputRef.value !== null) {
				cancelPendingFrame();
				const { style } = inputRef.value;
				style.overflowY = "";
				style.height = attrs.rows > 0 ? "auto" : "";
			}
		});
		watch(() => props.dense, () => {
			if (props.autogrow) nextTick(adjustHeight);
		});
		onMounted(() => {
			if (props.autogrow) adjustHeight();
		});
		onBeforeUnmount(cancelPendingFrame);
		return adjustHeight;
	}
	var isJapanese = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFF9F\u4E00-\u9FAF\u3400-\u4DBF]/;
	var isChinese = /[\u4E00-\u9FFF\u3400-\u4DBF\u{20000}-\u{2A6DF}\u{2A700}-\u{2B73F}\u{2B740}-\u{2B81F}\u{2B820}-\u{2CEAF}\uF900-\uFAFF\u3300-\u33FF\uFE30-\uFE4F\uF900-\uFAFF\u{2F800}-\u{2FA1F}]/u;
	var isKorean = /[\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3]/;
	var isPlainText = /[a-z0-9_ -]$/i;
	function useKeyComposition(onInput) {
		return function onComposition(e) {
			if (e.type === "compositionend" || e.type === "change") {
				if (!e.target.qComposing) return;
				e.target.qComposing = false;
				onInput(e);
			} else if (e.type === "compositionupdate" && !e.target.qComposing && typeof e.data === "string") {
				if (client.is.firefox ? !isPlainText.test(e.data) : isJapanese.test(e.data) || isChinese.test(e.data) || isKorean.test(e.data)) e.target.qComposing = true;
			}
		};
	}
	var QInput_default = /*#__PURE__*/ createComponent({
		name: "QInput",
		inheritAttrs: false,
		props: {
			...useFieldProps,
			...useMaskProps,
			...useFormProps,
			modelValue: [
				String,
				Number,
				FileList
			],
			modelModifiers: Object,
			shadowText: String,
			type: {
				type: String,
				default: "text"
			},
			debounce: [String, Number],
			autogrow: Boolean,
			inputClass: [
				Array,
				String,
				Object
			],
			inputStyle: [
				Array,
				String,
				Object
			]
		},
		emits: [
			...useFieldEmits,
			"paste",
			"change",
			"keydown",
			"click",
			"animationend"
		],
		setup(props, { emit, attrs }) {
			const { proxy } = getCurrentInstance();
			const $q = useQuasar();
			const temp = {};
			let emitCachedValue = NaN, typedNumber = false, stopValueWatcher = false, emitTimer = null, emitValueFn;
			const inputRef = /* @__PURE__ */ shallowRef(null);
			const nameProp = useFormInputNameAttr(props);
			const { innerValue, hasMask, moveCursorForPaste, updateMaskValue, onMaskedKeydown, onMaskedClick } = useMask(props, emit, emitValue, inputRef, () => {
				cancelPendingValueEmission();
				delete temp.value;
			});
			const formDomProps = useFileDomProps(props, true);
			const hasValue = computed(() => fieldValueIsFilled(innerValue.value));
			const onKeyComposition = useKeyComposition(onInput);
			function onComposition(e) {
				if (hasMask.value && e.type === "compositionstart") {
					e.target.qComposing = true;
					return;
				}
				onKeyComposition(e);
			}
			const state = useFieldState({ changeEvent: true });
			const isTextarea = computed(() => props.type === "textarea" || props.autogrow);
			const adjustHeightViaJS = useAutogrow?.(props, attrs, inputRef, $q);
			const isTypeText = computed(() => isTextarea.value || [
				"text",
				"search",
				"url",
				"tel",
				"password"
			].includes(props.type));
			const onEvents = computed(() => {
				const evt = {
					...state.splitAttrs.listeners.value,
					onInput,
					onPaste,
					onChange,
					onBlur: onFinishEditing,
					onFocus: stop
				};
				evt.onCompositionstart = evt.onCompositionupdate = evt.onCompositionend = onComposition;
				if (hasMask.value) {
					evt.onKeydown = onMaskedKeydown;
					evt.onClick = onMaskedClick;
				}
				if (adjustHeightViaJS && props.autogrow) evt.onAnimationend = onAnimationend;
				return evt;
			});
			const inputAttrs = computed(() => {
				const acc = {
					tabindex: 0,
					"data-autofocus": props.autofocus || void 0,
					rows: props.type === "textarea" ? 6 : void 0,
					"aria-label": props.label,
					name: nameProp(),
					...state.splitAttrs.attributes.value,
					id: state.targetUid.value,
					maxlength: props.maxlength,
					disabled: props.disable,
					readonly: props.readonly
				};
				if (!isTextarea.value) acc.type = props.type;
				if (props.autogrow) acc.rows = 1;
				return acc;
			});
			watch(() => props.type, () => {
				if (inputRef.value) inputRef.value.value = props.modelValue;
			});
			watch(() => props.modelValue, (v) => {
				if (emitValueFn !== void 0) {
					cancelPendingValueEmission();
					typedNumber = false;
					stopValueWatcher = false;
					delete temp.value;
				}
				if (hasMask.value) {
					if (stopValueWatcher) {
						stopValueWatcher = false;
						if (String(v) === emitCachedValue) return;
					}
					updateMaskValue(v);
				} else if (innerValue.value !== v) {
					innerValue.value = v;
					if (props.type === "number" && Object.hasOwn(temp, "value")) {
						if (typedNumber) typedNumber = false;
						else delete temp.value;
					}
					if (props.modelModifiers?.trim === true && Object.hasOwn(temp, "value") && (typeof temp.value !== "string" || temp.value.trim() !== v)) delete temp.value;
				}
				if (adjustHeightViaJS && props.autogrow) nextTick(adjustHeightViaJS);
			});
			function focusHandler() {
				const el = document.activeElement;
				if (inputRef.value !== null && inputRef.value !== el && (el === null || el.id !== state.targetUid.value)) inputRef.value.focus({ preventScroll: true });
			}
			function focus() {
				addFocusFn(focusHandler);
			}
			function blur() {
				removeFocusFn(focusHandler);
				const el = document.activeElement;
				if (el !== null && state.rootRef.value.contains(el)) el.blur();
			}
			function select() {
				inputRef.value?.select();
			}
			function onPaste(e) {
				if (hasMask.value && props.reverseFillMask !== true) {
					const inp = e.target;
					moveCursorForPaste(inp, inp.selectionStart, inp.selectionEnd);
				}
				emit("paste", e);
			}
			function onInput(e) {
				if (!e || !e.target) return;
				if (props.type === "file") {
					emit("update:modelValue", e.target.files);
					return;
				}
				const val = e.target.value;
				if (e.target.qComposing) {
					temp.value = val;
					return;
				}
				if (hasMask.value) updateMaskValue(val, false, e.inputType);
				else {
					if (props.modelModifiers?.trim === true) temp.value = val;
					emitValue(val);
					if (isTypeText.value && e.target === document.activeElement) {
						const { selectionStart, selectionEnd } = e.target;
						if (selectionStart !== void 0 && selectionEnd !== void 0) nextTick(() => {
							if (e.target === document.activeElement && val.indexOf(e.target.value) === 0) e.target.setSelectionRange(selectionStart, selectionEnd);
						});
					}
				}
				if (adjustHeightViaJS && props.autogrow) adjustHeightViaJS();
			}
			function onAnimationend(e) {
				emit("animationend", e);
				adjustHeightViaJS();
			}
			function emitValue(val, stopWatcher) {
				emitValueFn = () => {
					emitTimer = null;
					if (props.type !== "number" && (props.modelModifiers?.trim !== true || hasMask.value) && Object.hasOwn(temp, "value")) delete temp.value;
					if (props.modelValue !== val && emitCachedValue !== val) {
						emitCachedValue = val;
						if (stopWatcher === true) stopValueWatcher = true;
						emit("update:modelValue", val);
						nextTick(() => {
							if (emitCachedValue === val) emitCachedValue = NaN;
						});
					}
					emitValueFn = void 0;
				};
				if (props.type === "number") {
					typedNumber = true;
					temp.value = val;
				}
				const holdTemp = () => {
					if (hasMask.value) delete temp.value;
					else temp.value = val;
				};
				if (props.modelModifiers?.lazy === true) holdTemp();
				else if (props.debounce !== void 0) {
					if (emitTimer !== null) clearTimeout(emitTimer);
					holdTemp();
					emitTimer = setTimeout(emitValueFn, props.debounce);
				} else emitValueFn();
			}
			function cancelPendingValueEmission() {
				if (emitTimer !== null) {
					clearTimeout(emitTimer);
					emitTimer = null;
				}
				emitValueFn = void 0;
			}
			function onClear() {
				cancelPendingValueEmission();
				typedNumber = false;
				stopValueWatcher = false;
				delete temp.value;
			}
			function onChange(e) {
				onComposition(e);
				if (emitTimer !== null) {
					clearTimeout(emitTimer);
					emitTimer = null;
				}
				emitValueFn?.();
				emit("change", e.target.value);
			}
			function onFinishEditing(e) {
				if (e !== void 0) stop(e);
				if (emitTimer !== null) {
					clearTimeout(emitTimer);
					emitTimer = null;
				}
				emitValueFn?.();
				typedNumber = false;
				stopValueWatcher = false;
				delete temp.value;
				if (props.type !== "file") setTimeout(() => {
					if (inputRef.value !== null) inputRef.value.value = innerValue.value !== void 0 ? innerValue.value : "";
				}, 0);
			}
			function getCurValue() {
				return Object.hasOwn(temp, "value") ? temp.value : innerValue.value !== void 0 ? innerValue.value : "";
			}
			onBeforeUnmount(() => {
				onFinishEditing();
			});
			Object.assign(state, {
				innerValue,
				fieldClass: computed(() => `q-${isTextarea.value ? "textarea" : "input"}` + (props.autogrow ? " q-textarea--autogrow" : "")),
				hasShadow: computed(() => props.type !== "file" && typeof props.shadowText === "string" && props.shadowText.length !== 0),
				inputRef,
				emitValue,
				onClear,
				hasValue,
				floatingLabel: computed(() => hasValue.value && (props.type !== "number" || Number.isFinite(Number(innerValue.value))) || fieldValueIsFilled(props.displayValue)),
				getControl: () => {
					const controlAttrs = inputAttrs.value;
					return h(isTextarea.value ? "textarea" : "input", {
						ref: inputRef,
						class: ["q-field__native q-placeholder", props.inputClass],
						style: props.inputStyle,
						...controlAttrs,
						...state.getErrorAriaAttrs(controlAttrs),
						...onEvents.value,
						...props.type !== "file" ? { value: getCurValue() } : formDomProps.value
					});
				},
				getShadowControl: () => h("div", { class: "q-field__native q-field__shadow absolute-bottom no-pointer-events" + (isTextarea.value ? "" : " text-no-wrap") }, [h("span", { class: "invisible" }, getCurValue()), h("span", props.shadowText)])
			});
			const renderFn = useField(state);
			Object.assign(proxy, {
				focus,
				blur,
				select,
				getNativeElement: () => inputRef.value
			});
			injectProp(proxy, "nativeEl", () => inputRef.value);
			return renderFn;
		}
	});
	var roleAttrExceptions = ["ul", "ol"];
	var QList_default = /*#__PURE__*/ createComponent({
		name: "QList",
		props: {
			...useDarkProps,
			bordered: Boolean,
			dense: Boolean,
			separator: Boolean,
			padding: Boolean,
			role: String,
			tag: {
				type: String,
				default: "div"
			}
		},
		setup(props, { slots }) {
			const isDark = useDark(props, useQuasar());
			const role = computed(() => props.role !== void 0 ? props.role : roleAttrExceptions.includes(props.tag) ? null : "list");
			provide(listKey, computed(() => props.role !== void 0 ? props.role : "list"));
			const classes = computed(() => "q-list" + (props.bordered ? " q-list--bordered" : "") + (props.dense ? " q-list--dense" : "") + (props.separator ? " q-list--separator" : "") + (isDark() ? " q-list--dark" : "") + (props.padding ? " q-list--padding" : ""));
			return () => h(props.tag, {
				class: classes.value,
				role: role.value
			}, hSlot(slots.default));
		}
	});
	Object.keys(useCircularCommonProps);
	({
		...useFormProps,
		...useCircularCommonProps
	});
	var { passive: passive$3 } = listenOpts;
	var getSizeStyle = /*#__PURE__*/ createSizeStyle({
		xs: 2,
		sm: 4,
		md: 6,
		lg: 10,
		xl: 14
	});
	function width(val) {
		return { transform: `scaleX(${val})` };
	}
	var QLinearProgress_default = /*#__PURE__*/ createComponent({
		name: "QLinearProgress",
		props: {
			...useDarkProps,
			...useSizeProps,
			value: {
				type: Number,
				default: 0
			},
			buffer: Number,
			color: String,
			trackColor: String,
			reverse: Boolean,
			stripe: Boolean,
			indeterminate: Boolean,
			query: Boolean,
			rounded: Boolean,
			animationSpeed: {
				type: [String, Number],
				default: 2100
			},
			instantFeedback: Boolean
		},
		setup(props, { slots }) {
			const isDark = useDark(props, useQuasar());
			const motion = computed(() => props.indeterminate || props.query);
			const style = computed(() => ({
				...getSizeStyle(props.size),
				"--q-linear-progress-speed": `${props.animationSpeed}ms`
			}));
			const classes = computed(() => "q-linear-progress" + (props.color !== void 0 ? ` text-${props.color}` : "") + (props.reverse || props.query ? " q-linear-progress--reverse" : "") + (props.rounded ? " rounded-borders" : ""));
			const trackStyle = computed(() => width(props.buffer !== void 0 ? props.buffer : 1));
			const transitionSuffix = computed(() => `with${props.instantFeedback ? "out" : ""}-transition`);
			const trackClass = computed(() => `q-linear-progress__track absolute-full q-linear-progress__track--${transitionSuffix.value} q-linear-progress__track--${isDark() ? "dark" : "light"}` + (props.trackColor !== void 0 ? ` bg-${props.trackColor}` : ""));
			const modelStyle = computed(() => width(motion.value ? 1 : props.value));
			const modelClass = computed(() => `q-linear-progress__model absolute-full q-linear-progress__model--${transitionSuffix.value} q-linear-progress__model--${motion.value ? "in" : ""}determinate`);
			const stripeStyle = computed(() => ({ width: `${props.value * 100}%` }));
			const stripeClass = computed(() => `q-linear-progress__stripe absolute-${props.reverse ? "right" : "left"} q-linear-progress__stripe--${transitionSuffix.value}`);
			return () => {
				const child = [h("div", {
					class: trackClass.value,
					style: trackStyle.value
				}), h("div", {
					class: modelClass.value,
					style: modelStyle.value
				})];
				if (props.stripe && !motion.value) child.push(h("div", {
					class: stripeClass.value,
					style: stripeStyle.value
				}));
				return h("div", {
					class: classes.value,
					style: style.value,
					role: "progressbar",
					"aria-valuemin": 0,
					"aria-valuemax": 1,
					"aria-valuenow": props.indeterminate || props.query ? void 0 : props.value
				}, hMergeSlot(slots.default, child));
			};
		}
	});
	var separatorValues = [
		"horizontal",
		"vertical",
		"cell",
		"none"
	];
	var QMarkupTable_default = /*#__PURE__*/ createComponent({
		name: "QMarkupTable",
		props: {
			...useDarkProps,
			dense: Boolean,
			flat: Boolean,
			bordered: Boolean,
			square: Boolean,
			wrapCells: Boolean,
			separator: {
				type: String,
				default: "horizontal",
				validator: (v) => separatorValues.includes(v)
			}
		},
		setup(props, { slots }) {
			const isDark = useDark(props, useQuasar());
			const classes = computed(() => `q-markup-table q-table__container q-table__card q-table--${props.separator}-separator` + (isDark() ? " q-table--dark q-table__card--dark q-dark" : "") + (props.dense ? " q-table--dense" : "") + (props.flat ? " q-table--flat" : "") + (props.bordered ? " q-table--bordered" : "") + (props.square ? " q-table--square" : "") + (props.wrapCells ? "" : " q-table--no-wrap"));
			return () => h("div", {
				class: classes.value,
				tabindex: 0
			}, [h("table", { class: "q-table" }, hSlot(slots.default))]);
		}
	});
	var createSvg = () => h("svg", {
		key: "svg",
		class: "q-radio__bg absolute non-selectable",
		viewBox: "0 0 24 24"
	}, [h("path", { d: "M12,22a10,10 0 0 1 -10,-10a10,10 0 0 1 10,-10a10,10 0 0 1 10,10a10,10 0 0 1 -10,10m0,-22a12,12 0 0 0 -12,12a12,12 0 0 0 12,12a12,12 0 0 0 12,-12a12,12 0 0 0 -12,-12" }), h("path", {
		class: "q-radio__check",
		d: "M12,6a6,6 0 0 0 -6,6a6,6 0 0 0 6,6a6,6 0 0 0 6,-6a6,6 0 0 0 -6,-6"
	})]);
	function onKeydown(e) {
		if (e.keyCode === 13 || e.keyCode === 32) stopAndPrevent(e);
	}
	var QRadio_default = /*#__PURE__*/ createComponent({
		name: "QRadio",
		props: {
			...useDarkProps,
			...useSizeProps,
			...useFormProps,
			modelValue: { required: true },
			val: { required: true },
			label: String,
			leftLabel: Boolean,
			checkedIcon: String,
			uncheckedIcon: String,
			color: String,
			keepColor: Boolean,
			dense: Boolean,
			disable: Boolean,
			tabindex: [String, Number]
		},
		emits: ["update:modelValue"],
		setup(props, { slots, emit }) {
			const { proxy } = getCurrentInstance();
			const isDark = useDark(props, useQuasar());
			const rootRef = /* @__PURE__ */ shallowRef(null);
			const { refocusTargetEl, refocusTarget } = useRefocusTarget(props, rootRef);
			const isTrue = computed(() => /* @__PURE__ */ toRaw(props.modelValue) === /* @__PURE__ */ toRaw(props.val));
			const classes = computed(() => "q-radio cursor-pointer no-outline row inline no-wrap items-center" + (props.disable ? " disabled" : "") + (isDark() ? " q-radio--dark" : "") + (props.dense ? " q-radio--dense" : "") + (props.leftLabel ? " reverse" : ""));
			const innerClass = computed(() => {
				const color = props.color !== void 0 && (props.keepColor || isTrue.value) ? ` text-${props.color}` : "";
				return `q-radio__inner relative-position q-radio__inner--${isTrue.value ? "truthy" : "falsy"}${color}`;
			});
			const icon = computed(() => (isTrue.value ? props.checkedIcon : props.uncheckedIcon) || null);
			const tabindex = computed(() => props.disable ? -1 : props.tabindex || 0);
			const formAttrs = () => {
				const prop = { type: "radio" };
				if (props.name !== void 0) Object.assign(prop, {
					".checked": isTrue.value,
					"^checked": isTrue.value ? "checked" : void 0,
					name: props.name,
					value: props.val
				});
				return prop;
			};
			const injectFormInput = useFormInject(formAttrs);
			function onClick(e) {
				if (e !== void 0) {
					stopAndPrevent(e);
					refocusTarget(e);
				}
				if (!props.disable && !isTrue.value) emit("update:modelValue", props.val, e);
			}
			function onKeyup(e) {
				if (e.keyCode === 13 || e.keyCode === 32) onClick(e);
			}
			Object.assign(proxy, { set: onClick });
			const svg = createSvg();
			return () => {
				const content = icon.value !== null ? [h("div", {
					key: "icon",
					class: "q-radio__icon-container absolute-full flex flex-center no-wrap"
				}, [h(QIcon_default, {
					class: "q-radio__icon",
					name: icon.value
				})])] : [svg];
				if (!props.disable) injectFormInput(content, "unshift", " q-radio__native q-ma-none q-pa-none");
				const child = [h("div", {
					class: innerClass.value,
					style: getOptionSizeStyle(props.size),
					"aria-hidden": "true"
				}, content)];
				if (refocusTargetEl.value !== null) child.push(refocusTargetEl.value);
				const label = props.label !== void 0 ? hMergeSlot(slots.default, [props.label]) : hSlot(slots.default);
				if (label !== void 0) child.push(h("div", { class: "q-radio__label q-anchor--skip" }, label));
				return h("div", {
					ref: rootRef,
					class: classes.value,
					tabindex: tabindex.value,
					role: "radio",
					"aria-label": props.label,
					"aria-checked": isTrue.value ? "true" : "false",
					"aria-disabled": props.disable ? "true" : void 0,
					onClick,
					onKeydown,
					onKeyup
				}, child);
			};
		}
	});
	var QToggle_default = /*#__PURE__*/ createComponent({
		name: "QToggle",
		props: {
			...useCheckboxProps,
			icon: String,
			iconColor: String
		},
		emits: useCheckboxEmits,
		setup(props) {
			function getInner(isTrue, isIndeterminate) {
				const icon = computed(() => (isTrue.value ? props.checkedIcon : isIndeterminate.value ? props.indeterminateIcon : props.uncheckedIcon) || props.icon);
				const color = computed(() => isTrue.value ? props.iconColor : null);
				return () => [h("div", { class: "q-toggle__track" }), h("div", { class: "q-toggle__thumb absolute flex flex-center no-wrap" }, icon.value !== void 0 ? [h(QIcon_default, {
					name: icon.value,
					color: color.value
				})] : void 0)];
			}
			return useCheckbox("toggle", getInner);
		}
	});
	var components = {
		radio: QRadio_default,
		checkbox: QCheckbox_default,
		toggle: QToggle_default
	};
	var typeValues = Object.keys(components);
	function getPropValueFn$1(userPropName, defaultPropName) {
		if (typeof userPropName === "function") return userPropName;
		const propName = userPropName !== void 0 ? userPropName : defaultPropName;
		return (opt) => opt[propName];
	}
	var QOptionGroup_default = /*#__PURE__*/ createComponent({
		name: "QOptionGroup",
		props: {
			...useDarkProps,
			modelValue: { required: true },
			options: {
				type: Array,
				validator: (opts) => opts.every(isObject),
				default: () => []
			},
			optionValue: [Function, String],
			optionLabel: [Function, String],
			optionDisable: [Function, String],
			name: String,
			type: {
				type: String,
				default: "radio",
				validator: (v) => typeValues.includes(v)
			},
			color: String,
			keepColor: Boolean,
			dense: Boolean,
			size: String,
			leftLabel: Boolean,
			inline: Boolean,
			disable: Boolean
		},
		emits: ["update:modelValue"],
		setup(props, { emit, slots }) {
			const $q = useQuasar();
			const arrayModel = Array.isArray(props.modelValue);
			if (props.type === "radio") {
				if (arrayModel) console.error("q-option-group: model should not be array");
			} else if (!arrayModel) console.error("q-option-group: model should be array in your case");
			const isDark = useDark(props, $q);
			const component = computed(() => components[props.type]);
			const rootRef = /* @__PURE__ */ shallowRef(null);
			const getOptionValue = computed(() => getPropValueFn$1(props.optionValue, "value"));
			const getOptionLabel = computed(() => getPropValueFn$1(props.optionLabel, "label"));
			const getOptionDisable = computed(() => getPropValueFn$1(props.optionDisable, "disable"));
			const innerOptions = computed(() => props.options.map((opt) => ({
				val: getOptionValue.value(opt),
				name: opt.name === void 0 ? props.name : opt.name,
				disable: props.disable || getOptionDisable.value(opt),
				leftLabel: opt.leftLabel === void 0 ? props.leftLabel : opt.leftLabel,
				color: opt.color === void 0 ? props.color : opt.color,
				checkedIcon: opt.checkedIcon,
				uncheckedIcon: opt.uncheckedIcon,
				dark: opt.dark === void 0 ? isDark() : opt.dark,
				size: opt.size === void 0 ? props.size : opt.size,
				dense: props.dense,
				keepColor: opt.keepColor === void 0 ? props.keepColor : opt.keepColor
			})));
			const tabStopIndex = computed(() => {
				const model = /* @__PURE__ */ toRaw(props.modelValue);
				const list = innerOptions.value;
				const index = list.findIndex((opt) => !opt.disable && /* @__PURE__ */ toRaw(opt.val) === model);
				return index !== -1 ? index : list.findIndex((opt) => !opt.disable);
			});
			const classes = computed(() => "q-option-group q-gutter-x-sm" + (props.inline ? " q-option-group--inline" : ""));
			const attrs = computed(() => {
				const acc = { role: props.type === "radio" ? "radiogroup" : "group" };
				if (props.disable) acc["aria-disabled"] = "true";
				return acc;
			});
			function onUpdateModelValue(value) {
				emit("update:modelValue", value);
			}
			function onKeydown(e) {
				const dirKey = e.keyCode === 37 || e.keyCode === 38 ? -1 : e.keyCode === 39 || e.keyCode === 40 ? 1 : 0;
				if (dirKey === 0) return;
				const radioEls = rootRef.value.getElementsByClassName("q-radio");
				const startIndex = Array.prototype.indexOf.call(radioEls, e.target);
				if (startIndex === -1) return;
				stopAndPrevent(e);
				const dir = (e.keyCode === 37 || e.keyCode === 39) && $q.lang.rtl === true ? -dirKey : dirKey;
				const list = innerOptions.value;
				const len = list.length;
				let index = startIndex;
				do
					index = (index + dir + len) % len;
				while (index !== startIndex && list[index].disable);
				if (index !== startIndex) {
					radioEls[index].focus();
					if (/* @__PURE__ */ toRaw(list[index].val) !== /* @__PURE__ */ toRaw(props.modelValue)) emit("update:modelValue", list[index].val);
				}
			}
			return () => h("div", {
				ref: rootRef,
				class: classes.value,
				...attrs.value,
				onKeydown: props.type === "radio" ? onKeydown : void 0
			}, props.options.map((opt, i) => {
				const child = slots["label-" + i] !== void 0 ? () => slots["label-" + i](opt) : slots.label !== void 0 ? () => slots.label(opt) : void 0;
				return h("div", [h(component.value, {
					label: child === void 0 ? getOptionLabel.value(opt) : null,
					modelValue: props.modelValue,
					"onUpdate:modelValue": onUpdateModelValue,
					...innerOptions.value[i],
					tabindex: props.type === "radio" ? i === tabStopIndex.value ? 0 : -1 : void 0
				}, child)]);
			}));
		}
	});
	var usePageStickyProps = {
		position: {
			type: String,
			default: "bottom-right",
			validator: (v) => [
				"top-right",
				"top-left",
				"bottom-right",
				"bottom-left",
				"top",
				"right",
				"bottom",
				"left"
			].includes(v)
		},
		offset: {
			type: Array,
			validator: (v) => v.length === 2
		},
		expand: Boolean
	};
	({ ...usePageStickyProps }), { ...usePageStickyProps.offset };
	({ ...useDarkProps });
	var { passive: passive$2 } = listenOpts;
	var QPopupProxy_default = /*#__PURE__*/ createComponent({
		name: "QPopupProxy",
		props: {
			...useAnchorProps,
			breakpoint: {
				type: [String, Number],
				default: 450
			}
		},
		emits: ["show", "hide"],
		setup(props, { slots, emit, attrs }) {
			const { proxy } = getCurrentInstance();
			const $q = useQuasar();
			const showing = /* @__PURE__ */ ref(false);
			const popupRef = /* @__PURE__ */ shallowRef(null);
			const breakpoint = computed(() => Number.parseInt(props.breakpoint, 10));
			const { canShow } = useAnchor({
				showing,
				avoidEmit: true
			});
			function getType() {
				return $q.screen.width < breakpoint.value || $q.screen.height < breakpoint.value ? "dialog" : "menu";
			}
			const type = /* @__PURE__ */ ref(getType());
			const popupProps = computed(() => type.value === "menu" ? { maxHeight: "99vh" } : {});
			watch(() => getType(), (val) => {
				if (!showing.value) type.value = val;
			});
			function onShow(evt) {
				showing.value = true;
				emit("show", evt);
			}
			function onHide(evt) {
				showing.value = false;
				type.value = getType();
				emit("hide", evt);
			}
			Object.assign(proxy, {
				show(evt) {
					if (canShow(evt)) popupRef.value.show(evt);
				},
				hide(evt) {
					popupRef.value.hide(evt);
				},
				toggle(evt) {
					popupRef.value.toggle(evt);
				}
			});
			injectProp(proxy, "currentComponent", () => ({
				type: type.value,
				ref: popupRef.value
			}));
			return () => {
				const data = {
					ref: popupRef,
					...popupProps.value,
					...attrs,
					onShow,
					onHide
				};
				let component;
				if (type.value === "dialog") component = QDialog_default;
				else {
					component = QMenu_default;
					Object.assign(data, {
						target: props.target,
						contextMenu: props.contextMenu,
						noParentEvent: true,
						separateClosePopup: true
					});
				}
				return h(component, data, slots.default);
			};
		}
	});
	({ ...useSliderProps });
	({
		...useSizeProps,
		...useFormProps
	});
	({ ...useDarkProps });
	var aggBucketSize = 1e3;
	var scrollToEdges = [
		"start",
		"center",
		"end",
		"start-force",
		"center-force",
		"end-force"
	];
	var filterProto = Array.prototype.filter;
	var setOverflowAnchor = __QUASAR_SSR__ || window.getComputedStyle(document.body).overflowAnchor === void 0 ? noop : function setOverflowAnchor(contentEl, index) {
		if (contentEl === null) return;
		if (contentEl._qOverflowAnimationFrame !== void 0) cancelAnimationFrame(contentEl._qOverflowAnimationFrame);
		contentEl._qOverflowAnimationFrame = requestAnimationFrame(() => {
			if (contentEl === null) return;
			contentEl._qOverflowAnimationFrame = void 0;
			const children = contentEl.children || [];
			filterProto.call(children, (el) => el.dataset && el.dataset.qVsAnchor !== void 0).forEach((el) => {
				delete el.dataset.qVsAnchor;
			});
			const el = children[index];
			if (el?.dataset) el.dataset.qVsAnchor = "";
		});
	};
	function sumFn(acc, item) {
		return acc + item;
	}
	function getScrollDetails(parent, child, beforeRef, afterRef, horizontal, rtl, stickyStart, stickyEnd) {
		const parentCalc = parent === window ? document.scrollingElement || document.documentElement : parent, propRectSize = horizontal ? "width" : "height", details = {
			scrollStart: 0,
			scrollViewSize: -stickyStart - stickyEnd,
			scrollMaxSize: 0,
			offsetStart: -stickyStart,
			offsetEnd: -stickyEnd
		};
		if (horizontal) {
			if (parent === window) {
				details.scrollStart = window.scrollX;
				details.scrollViewSize += document.documentElement.clientWidth;
			} else {
				details.scrollStart = parentCalc.scrollLeft;
				details.scrollViewSize += parentCalc.clientWidth;
			}
			details.scrollMaxSize = parentCalc.scrollWidth;
			if (rtl) details.scrollStart = -details.scrollStart;
		} else {
			if (parent === window) {
				details.scrollStart = window.scrollY;
				details.scrollViewSize += document.documentElement.clientHeight;
			} else {
				details.scrollStart = parentCalc.scrollTop;
				details.scrollViewSize += parentCalc.clientHeight;
			}
			details.scrollMaxSize = parentCalc.scrollHeight;
		}
		if (beforeRef !== null) {
			for (let el = beforeRef.previousElementSibling; el !== null; el = el.previousElementSibling) if (!el.classList.contains("q-virtual-scroll--skip")) details.offsetStart += el.getBoundingClientRect()[propRectSize];
		}
		if (afterRef !== null) {
			for (let el = afterRef.nextElementSibling; el !== null; el = el.nextElementSibling) if (!el.classList.contains("q-virtual-scroll--skip")) details.offsetEnd += el.getBoundingClientRect()[propRectSize];
		}
		if (child !== parent) {
			const parentRect = parentCalc.getBoundingClientRect(), childRect = child.getBoundingClientRect();
			if (horizontal) {
				details.offsetStart += childRect.left - parentRect.left;
				details.offsetEnd -= childRect.width;
			} else {
				details.offsetStart += childRect.top - parentRect.top;
				details.offsetEnd -= childRect.height;
			}
			if (parent !== window) details.offsetStart += details.scrollStart;
			details.offsetEnd += details.scrollMaxSize - details.offsetStart;
		}
		return details;
	}
	function setScroll(parent, scroll, horizontal, rtl) {
		if (scroll === "end") scroll = (parent === window ? document.body : parent)[horizontal ? "scrollWidth" : "scrollHeight"];
		if (parent === window) {
			let left, top;
			if (horizontal) {
				if (rtl) scroll = -scroll;
				left = scroll;
				top = window.scrollY;
			} else {
				left = window.scrollX;
				top = scroll;
			}
			window.scrollTo({
				left,
				top,
				behavior: "instant"
			});
		} else if (horizontal) {
			if (rtl) scroll = -scroll;
			parent.scrollTo({
				left: scroll,
				behavior: "instant"
			});
		} else parent.scrollTo({
			top: scroll,
			behavior: "instant"
		});
	}
	function sumSize(sizeAgg, size, from, to) {
		if (from >= to) return 0;
		const lastTo = size.length, fromAgg = Math.floor(from / aggBucketSize), toAgg = Math.floor((to - 1) / aggBucketSize) + 1;
		let total = 0;
		for (let i = fromAgg; i < toAgg; i++) total += sizeAgg[i];
		if (from % aggBucketSize !== 0) for (let i = fromAgg * aggBucketSize; i < from; i++) total -= size[i];
		if (to % aggBucketSize !== 0 && to !== lastTo) {
			const end = Math.min(toAgg * aggBucketSize, lastTo);
			for (let i = to; i < end; i++) total -= size[i];
		}
		return total;
	}
	var commonVirtScrollProps = {
		virtualScrollSliceSize: {
			type: [Number, String],
			default: 10
		},
		virtualScrollSliceRatioBefore: {
			type: [Number, String],
			default: 1
		},
		virtualScrollSliceRatioAfter: {
			type: [Number, String],
			default: 1
		},
		virtualScrollItemSize: {
			type: [Number, String],
			default: 24
		},
		virtualScrollStickySizeStart: {
			type: [Number, String],
			default: 0
		},
		virtualScrollStickySizeEnd: {
			type: [Number, String],
			default: 0
		},
		tableColspan: [Number, String]
	};
	var commonVirtScrollPropsList = Object.keys(commonVirtScrollProps);
	var useVirtualScrollProps = {
		virtualScrollHorizontal: Boolean,
		onVirtualScroll: Function,
		...commonVirtScrollProps
	};
	function useVirtualScroll({ virtualScrollLength, getVirtualScrollTarget, getVirtualScrollEl, virtualScrollItemSizeComputed }) {
		const { props, emit, proxy } = getCurrentInstance();
		const $q = useQuasar();
		let prevScrollStart, prevToIndex, localScrollViewSize, virtualScrollSizesAgg = [], virtualScrollSizes;
		const virtualScrollPaddingBefore = /* @__PURE__ */ ref(0);
		const virtualScrollPaddingAfter = /* @__PURE__ */ ref(0);
		const virtualScrollSliceSizeComputed = /* @__PURE__ */ ref({});
		const beforeRef = /* @__PURE__ */ shallowRef(null);
		const afterRef = /* @__PURE__ */ shallowRef(null);
		const contentRef = /* @__PURE__ */ shallowRef(null);
		const virtualScrollSliceRange = /* @__PURE__ */ ref({
			from: 0,
			to: 0
		});
		const colspanAttr = computed(() => props.tableColspan !== void 0 ? props.tableColspan : 100);
		if (virtualScrollItemSizeComputed === void 0) virtualScrollItemSizeComputed = computed(() => props.virtualScrollItemSize);
		const needsReset = computed(() => virtualScrollItemSizeComputed.value + ";" + props.virtualScrollHorizontal);
		watch(computed(() => needsReset.value + ";" + props.virtualScrollSliceRatioBefore + ";" + props.virtualScrollSliceRatioAfter), () => {
			setVirtualScrollSize();
		});
		watch(needsReset, reset);
		function reset() {
			localResetVirtualScroll(prevToIndex, true);
		}
		function refresh(toIndex) {
			localResetVirtualScroll(toIndex === void 0 ? prevToIndex : toIndex);
		}
		function scrollTo(toIndex, edge) {
			const scrollEl = getVirtualScrollTarget();
			if (scrollEl === void 0 || scrollEl === null || scrollEl.nodeType === 8) return;
			onVirtualScrollEvt.cancel();
			const scrollDetails = getScrollDetails(scrollEl, getVirtualScrollEl(), beforeRef.value, afterRef.value, props.virtualScrollHorizontal, $q.lang.rtl, props.virtualScrollStickySizeStart, props.virtualScrollStickySizeEnd);
			if (localScrollViewSize !== scrollDetails.scrollViewSize) setVirtualScrollSize(scrollDetails.scrollViewSize);
			setVirtualScrollSliceRange(scrollEl, scrollDetails, Math.min(virtualScrollLength.value - 1, Math.max(0, Number.parseInt(toIndex, 10) || 0)), 0, scrollToEdges.includes(edge) ? edge : prevToIndex !== -1 && toIndex > prevToIndex ? "end" : "start");
		}
		function localOnVirtualScrollEvt() {
			const scrollEl = getVirtualScrollTarget();
			if (scrollEl === void 0 || scrollEl === null || scrollEl.nodeType === 8) return;
			const scrollDetails = getScrollDetails(scrollEl, getVirtualScrollEl(), beforeRef.value, afterRef.value, props.virtualScrollHorizontal, $q.lang.rtl, props.virtualScrollStickySizeStart, props.virtualScrollStickySizeEnd), listLastIndex = virtualScrollLength.value - 1, listEndOffset = scrollDetails.scrollMaxSize - scrollDetails.offsetStart - scrollDetails.offsetEnd - virtualScrollPaddingAfter.value;
			if (prevScrollStart === scrollDetails.scrollStart) return;
			if (scrollDetails.scrollMaxSize <= 0) {
				setVirtualScrollSliceRange(scrollEl, scrollDetails, 0, 0);
				return;
			}
			if (localScrollViewSize !== scrollDetails.scrollViewSize) setVirtualScrollSize(scrollDetails.scrollViewSize);
			updateVirtualScrollSizes(virtualScrollSliceRange.value.from);
			const scrollMaxStart = Math.floor(scrollDetails.scrollMaxSize - Math.max(scrollDetails.scrollViewSize, scrollDetails.offsetEnd) - Math.min(virtualScrollSizes[listLastIndex], scrollDetails.scrollViewSize / 2));
			if (scrollMaxStart > 0 && Math.ceil(scrollDetails.scrollStart) >= scrollMaxStart) {
				setVirtualScrollSliceRange(scrollEl, scrollDetails, listLastIndex, scrollDetails.scrollMaxSize - scrollDetails.offsetEnd - virtualScrollSizesAgg.reduce(sumFn, 0));
				return;
			}
			let toIndex = 0, listOffset = scrollDetails.scrollStart - scrollDetails.offsetStart, offset = listOffset;
			if (listOffset <= listEndOffset && listOffset + scrollDetails.scrollViewSize >= virtualScrollPaddingBefore.value) {
				listOffset -= virtualScrollPaddingBefore.value;
				toIndex = virtualScrollSliceRange.value.from;
				offset = listOffset;
			} else for (let j = 0; listOffset >= virtualScrollSizesAgg[j] && toIndex < listLastIndex; j++) {
				listOffset -= virtualScrollSizesAgg[j];
				toIndex += aggBucketSize;
			}
			while (listOffset > 0 && toIndex < listLastIndex) {
				listOffset -= virtualScrollSizes[toIndex];
				if (listOffset > -scrollDetails.scrollViewSize) {
					toIndex++;
					offset = listOffset;
				} else offset = virtualScrollSizes[toIndex] + listOffset;
			}
			setVirtualScrollSliceRange(scrollEl, scrollDetails, toIndex, offset);
		}
		function setVirtualScrollSliceRange(scrollEl, scrollDetails, toIndex, offset, align) {
			const alignForce = typeof align === "string" && align.includes("-force");
			const alignEnd = alignForce ? align.replace("-force", "") : align;
			const alignRange = alignEnd !== void 0 ? alignEnd : "start";
			let from = Math.max(0, toIndex - virtualScrollSliceSizeComputed.value[alignRange]), to = from + virtualScrollSliceSizeComputed.value.total;
			if (to > virtualScrollLength.value) {
				to = virtualScrollLength.value;
				from = Math.max(0, to - virtualScrollSliceSizeComputed.value.total);
			}
			prevScrollStart = scrollDetails.scrollStart;
			const rangeChanged = from !== virtualScrollSliceRange.value.from || to !== virtualScrollSliceRange.value.to;
			if (!rangeChanged && alignEnd === void 0) {
				emitScroll(toIndex);
				return;
			}
			const { activeElement } = document;
			const contentEl = contentRef.value;
			if (rangeChanged && contentEl !== null && contentEl !== activeElement && contentEl.contains(activeElement)) {
				contentEl.addEventListener("focusout", onBlurRefocusFn);
				setTimeout(() => {
					contentEl?.removeEventListener("focusout", onBlurRefocusFn);
				}, 0);
			}
			setOverflowAnchor(contentEl, toIndex - from);
			const sizeBefore = alignEnd !== void 0 ? virtualScrollSizes.slice(from, toIndex).reduce(sumFn, 0) : 0;
			if (rangeChanged) {
				const tempTo = to >= virtualScrollSliceRange.value.from && from <= virtualScrollSliceRange.value.to ? virtualScrollSliceRange.value.to : to;
				virtualScrollSliceRange.value = {
					from,
					to: tempTo
				};
				virtualScrollPaddingBefore.value = sumSize(virtualScrollSizesAgg, virtualScrollSizes, 0, from);
				virtualScrollPaddingAfter.value = sumSize(virtualScrollSizesAgg, virtualScrollSizes, to, virtualScrollLength.value);
				requestAnimationFrame(() => {
					if (virtualScrollSliceRange.value.to !== to && prevScrollStart === scrollDetails.scrollStart) {
						virtualScrollSliceRange.value = {
							from: virtualScrollSliceRange.value.from,
							to
						};
						virtualScrollPaddingAfter.value = sumSize(virtualScrollSizesAgg, virtualScrollSizes, to, virtualScrollLength.value);
					}
				});
			}
			requestAnimationFrame(() => {
				if (prevScrollStart !== scrollDetails.scrollStart) return;
				if (rangeChanged) updateVirtualScrollSizes(from);
				const sizeAfter = virtualScrollSizes.slice(from, toIndex).reduce(sumFn, 0), posStart = sizeAfter + scrollDetails.offsetStart + virtualScrollPaddingBefore.value, posEnd = posStart + virtualScrollSizes[toIndex];
				let scrollPosition = posStart + offset;
				if (alignEnd !== void 0) {
					const sizeDiff = sizeAfter - sizeBefore;
					const scrollStart = scrollDetails.scrollStart + sizeDiff;
					scrollPosition = !alignForce && scrollStart < posStart && posEnd < scrollStart + scrollDetails.scrollViewSize ? scrollStart : alignEnd === "end" ? posEnd - scrollDetails.scrollViewSize : posStart - (alignEnd === "start" ? 0 : Math.round((scrollDetails.scrollViewSize - virtualScrollSizes[toIndex]) / 2));
				}
				prevScrollStart = scrollPosition;
				setScroll(scrollEl, scrollPosition, props.virtualScrollHorizontal, $q.lang.rtl);
				emitScroll(toIndex);
			});
		}
		function updateVirtualScrollSizes(from) {
			const contentEl = contentRef.value;
			if (contentEl) {
				const children = filterProto.call(contentEl.children, (el) => el.classList && !el.classList.contains("q-virtual-scroll--skip")), childrenLength = children.length, sizeFn = props.virtualScrollHorizontal ? (el) => el.getBoundingClientRect().width : (el) => el.getBoundingClientRect().height;
				let index = from, size, diff;
				for (let i = 0; i < childrenLength;) {
					size = sizeFn(children[i]);
					i++;
					while (i < childrenLength && children[i].classList.contains("q-virtual-scroll--with-prev")) {
						size += sizeFn(children[i]);
						i++;
					}
					diff = size - virtualScrollSizes[index];
					if (diff !== 0) {
						virtualScrollSizes[index] += diff;
						virtualScrollSizesAgg[Math.floor(index / aggBucketSize)] += diff;
					}
					index++;
				}
			}
		}
		function onBlurRefocusFn() {
			contentRef.value?.focus({ preventScroll: true });
		}
		function localResetVirtualScroll(toIndex, fullReset) {
			const defaultSize = Number(virtualScrollItemSizeComputed.value);
			if (fullReset || !Array.isArray(virtualScrollSizes)) virtualScrollSizes = [];
			const oldVirtualScrollSizesLength = virtualScrollSizes.length;
			virtualScrollSizes.length = virtualScrollLength.value;
			for (let i = virtualScrollLength.value - 1; i >= oldVirtualScrollSizesLength; i--) virtualScrollSizes[i] = defaultSize;
			const jMax = Math.floor((virtualScrollLength.value - 1) / aggBucketSize);
			virtualScrollSizesAgg = [];
			for (let j = 0; j <= jMax; j++) {
				let size = 0;
				const iMax = Math.min((j + 1) * aggBucketSize, virtualScrollLength.value);
				for (let i = j * aggBucketSize; i < iMax; i++) size += virtualScrollSizes[i];
				virtualScrollSizesAgg.push(size);
			}
			prevToIndex = -1;
			prevScrollStart = void 0;
			virtualScrollPaddingBefore.value = sumSize(virtualScrollSizesAgg, virtualScrollSizes, 0, virtualScrollSliceRange.value.from);
			virtualScrollPaddingAfter.value = sumSize(virtualScrollSizesAgg, virtualScrollSizes, virtualScrollSliceRange.value.to, virtualScrollLength.value);
			if (toIndex >= 0) {
				updateVirtualScrollSizes(virtualScrollSliceRange.value.from);
				nextTick(() => {
					scrollTo(toIndex);
				});
			} else onVirtualScrollEvt();
		}
		function setVirtualScrollSize(scrollViewSize) {
			if (scrollViewSize === void 0 && typeof window !== "undefined") {
				const scrollEl = getVirtualScrollTarget();
				if (scrollEl !== void 0 && scrollEl !== null && scrollEl.nodeType !== 8) scrollViewSize = getScrollDetails(scrollEl, getVirtualScrollEl(), beforeRef.value, afterRef.value, props.virtualScrollHorizontal, $q.lang.rtl, props.virtualScrollStickySizeStart, props.virtualScrollStickySizeEnd).scrollViewSize;
			}
			localScrollViewSize = scrollViewSize;
			const virtualScrollSliceRatioBefore = Number.parseFloat(props.virtualScrollSliceRatioBefore) || 0;
			const virtualScrollSliceRatioAfter = Number.parseFloat(props.virtualScrollSliceRatioAfter) || 0;
			const multiplier = 1 + virtualScrollSliceRatioBefore + virtualScrollSliceRatioAfter;
			const view = scrollViewSize === void 0 || scrollViewSize <= 0 ? 1 : Math.ceil(scrollViewSize / virtualScrollItemSizeComputed.value);
			const baseSize = Math.max(1, view, Math.ceil((props.virtualScrollSliceSize > 0 ? props.virtualScrollSliceSize : 10) / multiplier));
			virtualScrollSliceSizeComputed.value = {
				total: Math.ceil(baseSize * multiplier),
				start: Math.ceil(baseSize * virtualScrollSliceRatioBefore),
				center: Math.ceil(baseSize * (.5 + virtualScrollSliceRatioBefore)),
				end: Math.ceil(baseSize * (1 + virtualScrollSliceRatioBefore)),
				view
			};
		}
		function padVirtualScroll(tag, content, contentAttrs) {
			const paddingSize = props.virtualScrollHorizontal ? "width" : "height";
			const style = { ["--q-virtual-scroll-item-" + paddingSize]: virtualScrollItemSizeComputed.value + "px" };
			return [
				tag === "tbody" ? h(tag, {
					class: "q-virtual-scroll__padding",
					key: "before",
					ref: beforeRef,
					"aria-hidden": "true"
				}, [h("tr", [h("td", {
					style: {
						[paddingSize]: `${virtualScrollPaddingBefore.value}px`,
						...style
					},
					colspan: colspanAttr.value
				})])]) : h(tag, {
					class: "q-virtual-scroll__padding",
					key: "before",
					ref: beforeRef,
					"aria-hidden": "true",
					style: {
						[paddingSize]: `${virtualScrollPaddingBefore.value}px`,
						...style
					}
				}),
				h(tag, {
					class: "q-virtual-scroll__content",
					key: "content",
					ref: contentRef,
					tabindex: -1,
					...contentAttrs
				}, content.flat()),
				tag === "tbody" ? h(tag, {
					class: "q-virtual-scroll__padding",
					key: "after",
					ref: afterRef,
					"aria-hidden": "true"
				}, [h("tr", [h("td", {
					style: {
						[paddingSize]: `${virtualScrollPaddingAfter.value}px`,
						...style
					},
					colspan: colspanAttr.value
				})])]) : h(tag, {
					class: "q-virtual-scroll__padding",
					key: "after",
					ref: afterRef,
					"aria-hidden": "true",
					style: {
						[paddingSize]: `${virtualScrollPaddingAfter.value}px`,
						...style
					}
				})
			];
		}
		function emitScroll(index) {
			if (prevToIndex !== index) {
				if (props.onVirtualScroll !== void 0) emit("virtualScroll", {
					index,
					from: virtualScrollSliceRange.value.from,
					to: virtualScrollSliceRange.value.to - 1,
					direction: index < prevToIndex ? "decrease" : "increase",
					ref: proxy
				});
				prevToIndex = index;
			}
		}
		setVirtualScrollSize();
		{
			const to = Math.min(virtualScrollLength.value, virtualScrollSliceSizeComputed.value.total);
			const defaultSize = Number(virtualScrollItemSizeComputed.value);
			virtualScrollSliceRange.value = {
				from: 0,
				to
			};
			virtualScrollPaddingAfter.value = Number.isFinite(defaultSize) ? Math.max(0, (virtualScrollLength.value - to) * defaultSize) : 0;
		}
		const onVirtualScrollEvt = debounce(localOnVirtualScrollEvt, $q.platform.is.ios ? 120 : 35);
		onBeforeMount(() => {
			setVirtualScrollSize();
		});
		let shouldActivate = false;
		onDeactivated(() => {
			shouldActivate = true;
		});
		onActivated(() => {
			if (!shouldActivate) return;
			const scrollEl = getVirtualScrollTarget();
			if (prevScrollStart !== void 0 && scrollEl !== void 0 && scrollEl !== null && scrollEl.nodeType !== 8) setScroll(scrollEl, prevScrollStart, props.virtualScrollHorizontal, $q.lang.rtl);
			else scrollTo(prevToIndex);
		});
		if (!__QUASAR_SSR__) onBeforeUnmount(() => {
			onVirtualScrollEvt.cancel();
		});
		Object.assign(proxy, {
			scrollTo,
			reset,
			refresh
		});
		return {
			virtualScrollSliceRange,
			virtualScrollSliceSizeComputed,
			setVirtualScrollSize,
			onVirtualScrollEvt,
			localResetVirtualScroll,
			padVirtualScroll,
			scrollTo,
			reset,
			refresh
		};
	}
	var validateNewValueMode = (v) => [
		"add",
		"add-unique",
		"toggle"
	].includes(v);
	var reEscapeList = ".*+?^${}()|[]\\";
	var fieldPropsList = Object.keys(useFieldProps);
	function getPropValueFn(userPropName, defaultPropName) {
		if (typeof userPropName === "function") return userPropName;
		const propName = userPropName !== void 0 ? userPropName : defaultPropName;
		return (opt) => opt !== null && typeof opt === "object" && propName in opt ? opt[propName] : opt;
	}
	var QSelect_default = /*#__PURE__*/ createComponent({
		name: "QSelect",
		inheritAttrs: false,
		props: {
			...useVirtualScrollProps,
			...useFormProps,
			...useFieldProps,
			modelValue: { required: true },
			multiple: Boolean,
			displayValue: [String, Number],
			displayValueHtml: Boolean,
			dropdownIcon: String,
			options: {
				type: Array,
				default: () => []
			},
			optionValue: [Function, String],
			optionLabel: [Function, String],
			optionDisable: [Function, String],
			hideSelected: Boolean,
			hideDropdownIcon: Boolean,
			hideDialogClose: Boolean,
			fillInput: Boolean,
			maxValues: [Number, String],
			optionsDense: Boolean,
			optionsDark: {
				type: Boolean,
				default: null
			},
			optionsSelectedClass: String,
			optionsHtml: Boolean,
			optionsCover: Boolean,
			noOptionLabel: String,
			menuShrink: Boolean,
			menuAnchor: String,
			menuSelf: String,
			menuOffset: Array,
			popupContentClass: String,
			popupContentStyle: [
				String,
				Array,
				Object
			],
			popupNoRouteDismiss: Boolean,
			useInput: Boolean,
			useChips: Boolean,
			noChipRemove: Boolean,
			newValueMode: {
				type: String,
				validator: validateNewValueMode
			},
			mapOptions: Boolean,
			emitValue: Boolean,
			noOptionPrefetch: Boolean,
			disableTabSelection: Boolean,
			inputDebounce: {
				type: [Number, String],
				default: 500
			},
			inputClass: [
				Array,
				String,
				Object
			],
			inputStyle: [
				Array,
				String,
				Object
			],
			tabindex: {
				type: [String, Number],
				default: 0
			},
			autocomplete: String,
			transitionShow: {},
			transitionHide: {},
			transitionDuration: {},
			behavior: {
				type: String,
				validator: (v) => [
					"default",
					"menu",
					"dialog"
				].includes(v),
				default: "default"
			},
			...useHoverProps,
			virtualScrollItemSize: useVirtualScrollProps.virtualScrollItemSize.type,
			onNewValue: Function,
			onFilter: Function
		},
		emits: [
			...useFieldEmits,
			"add",
			"remove",
			"inputValue",
			"keyup",
			"keypress",
			"keydown",
			"popupShow",
			"popupHide",
			"filterAbort"
		],
		setup(props, { slots, emit }) {
			const { proxy } = getCurrentInstance();
			const $q = useQuasar();
			const menu = /* @__PURE__ */ ref(false);
			const dialog = /* @__PURE__ */ ref(false);
			const optionIndex = /* @__PURE__ */ ref(-1);
			const inputValue = /* @__PURE__ */ ref("");
			const dialogFieldFocused = /* @__PURE__ */ ref(false);
			const innerLoadingIndicator = /* @__PURE__ */ ref(false);
			let filterTimer = null, inputValueTimer = null, hoverShown = false, hoverShownAt = 0, innerValueCache, prefetchPending = false, hasDialog, userInputValue, optionIndexFromModel = false, filterId = null, defaultInputValue, transitionShowComputed, searchBuffer, searchBufferExp;
			const inputRef = /* @__PURE__ */ shallowRef(null);
			const targetRef = /* @__PURE__ */ shallowRef(null);
			const menuRef = /* @__PURE__ */ shallowRef(null);
			const dialogRef = /* @__PURE__ */ shallowRef(null);
			const menuContentRef = /* @__PURE__ */ shallowRef(null);
			const nameProp = useFormInputNameAttr(props);
			const onComposition = useKeyComposition(onInput);
			const virtualScrollLength = computed(() => Array.isArray(props.options) ? props.options.length : 0);
			const { virtualScrollSliceRange, virtualScrollSliceSizeComputed, localResetVirtualScroll, padVirtualScroll, onVirtualScrollEvt, scrollTo, setVirtualScrollSize } = useVirtualScroll({
				virtualScrollLength,
				getVirtualScrollTarget,
				getVirtualScrollEl,
				virtualScrollItemSizeComputed: computed(() => props.virtualScrollItemSize === void 0 ? props.optionsDense ? 24 : 48 : props.virtualScrollItemSize)
			});
			const state = useFieldState();
			const innerValue = computed(() => {
				const mapNull = props.mapOptions && !props.multiple, val = props.modelValue !== void 0 && (props.modelValue !== null || mapNull) ? props.multiple && Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue] : [];
				if (props.mapOptions && Array.isArray(props.options)) {
					const cache = props.mapOptions && innerValueCache !== void 0 ? innerValueCache : [];
					const values = val.map((v) => getOption(v, cache));
					return props.modelValue === null && mapNull ? values.filter((v) => v !== null) : values;
				}
				return val;
			});
			const innerFieldProps = computed(() => {
				const acc = {};
				fieldPropsList.forEach((key) => {
					const val = props[key];
					if (val !== void 0) acc[key] = val;
				});
				return acc;
			});
			const isOptionsDark = computed(() => props.optionsDark === null ? state.isDark() : props.optionsDark);
			const hasValue = computed(() => fieldValueIsFilled(innerValue.value));
			const computedInputClass = computed(() => {
				let cls = "q-field__input q-placeholder col";
				if (props.hideSelected || innerValue.value.length === 0) return [cls, props.inputClass];
				cls += " q-field__input--padding";
				return props.inputClass === void 0 ? cls : [cls, props.inputClass];
			});
			const menuContentClass = computed(() => (props.virtualScrollHorizontal ? "q-virtual-scroll--horizontal" : "") + (props.popupContentClass ? " " + props.popupContentClass : ""));
			const noOptions = computed(() => virtualScrollLength.value === 0);
			function hasNoOptionDisplay() {
				return slots["no-option"] !== void 0 || props.noOptionLabel !== void 0;
			}
			const selectedString = computed(() => innerValue.value.map((opt) => getOptionLabel.value(opt)).join(", "));
			const ariaCurrentValue = computed(() => props.displayValue !== void 0 ? props.displayValue : selectedString.value);
			const needsHtmlFn = computed(() => props.optionsHtml ? () => true : (opt) => opt?.html === true);
			const valueAsHtml = computed(() => props.displayValueHtml || props.displayValue === void 0 && (props.optionsHtml || innerValue.value.some(needsHtmlFn.value)));
			const tabindex = computed(() => state.focused.value ? props.tabindex : -1);
			const comboboxAttrs = computed(() => {
				const attrs = {
					tabindex: props.disable === true ? void 0 : props.tabindex,
					role: "combobox",
					"aria-label": props.label,
					"aria-readonly": props.readonly ? "true" : "false",
					"aria-autocomplete": props.useInput ? "list" : "none",
					"aria-expanded": menu.value ? "true" : "false"
				};
				if (menu.value && !noOptions.value) attrs["aria-controls"] = `${state.targetUid.value}_lb`;
				if (optionIndex.value >= 0) attrs["aria-activedescendant"] = `${state.targetUid.value}_${optionIndex.value}`;
				return attrs;
			});
			const listboxAttrs = computed(() => ({
				id: `${state.targetUid.value}_lb`,
				role: "listbox",
				"aria-multiselectable": props.multiple ? "true" : "false"
			}));
			const selectedScope = computed(() => innerValue.value.map((opt, i) => ({
				index: i,
				opt,
				html: needsHtmlFn.value(opt),
				selected: true,
				removeAtIndex: removeAtIndexAndFocus,
				toggleOption,
				tabindex: tabindex.value
			})));
			const optionScope = computed(() => {
				if (virtualScrollLength.value === 0) return [];
				const { from, to } = virtualScrollSliceRange.value;
				return props.options.slice(from, to).map((opt, i) => {
					const disable = isOptionDisabled.value(opt) === true;
					const active = isOptionSelected(opt);
					const index = from + i;
					const itemProps = {
						clickable: true,
						active,
						activeClass: computedOptionsSelectedClass.value,
						manualFocus: true,
						focused: false,
						disable,
						tabindex: -1,
						dense: props.optionsDense,
						dark: isOptionsDark.value,
						role: "option",
						"aria-selected": active ? "true" : "false",
						"aria-setsize": virtualScrollLength.value,
						"aria-posinset": index + 1,
						id: `${state.targetUid.value}_${index}`,
						onClick: () => {
							toggleOption(opt);
						}
					};
					if (!disable) {
						if (optionIndex.value === index) itemProps.focused = true;
						itemProps.onPointermove = (evt) => {
							if (evt.pointerType !== "touch" && menu.value) setOptionIndex(index);
						};
					}
					return {
						index,
						opt,
						html: needsHtmlFn.value(opt),
						label: getOptionLabel.value(opt),
						selected: itemProps.active,
						focused: itemProps.focused,
						toggleOption,
						setOptionIndex,
						itemProps
					};
				});
			});
			const dropdownArrowIcon = computed(() => props.dropdownIcon !== void 0 ? props.dropdownIcon : $q.iconSet.arrow.dropdown);
			const squaredMenu = computed(() => !props.optionsCover && !props.outlined && !props.standout && !props.borderless && !props.rounded);
			const computedOptionsSelectedClass = computed(() => props.optionsSelectedClass !== void 0 ? props.optionsSelectedClass : props.color !== void 0 ? `text-${props.color}` : "");
			const getOptionValue = computed(() => getPropValueFn(props.optionValue, "value"));
			const getOptionLabel = computed(() => getPropValueFn(props.optionLabel, "label"));
			const isOptionDisabled = computed(() => getPropValueFn(props.optionDisable, "disable"));
			const innerOptionsValue = computed(() => innerValue.value.map(getOptionValue.value));
			const inputControlEvents = computed(() => {
				const evt = {
					onInput,
					onChange: onComposition,
					onKeydown: onTargetKeydown,
					onKeyup: onTargetAutocomplete,
					onKeypress: onTargetKeypress,
					onFocus: selectInputText,
					onClick(e) {
						if (hasDialog) stop(e);
					}
				};
				evt.onCompositionstart = evt.onCompositionupdate = evt.onCompositionend = onComposition;
				return evt;
			});
			watch(innerValue, (val) => {
				innerValueCache = val;
				if (props.useInput && props.fillInput && !props.multiple && !state.innerLoading.value && (!dialog.value && !menu.value || !hasValue.value)) {
					if (!userInputValue) resetInputValue();
					if (dialog.value || menu.value) filter("");
				}
				if (prefetchPending && prefetchUnmappedOptions()) prefetchPending = false;
			}, { immediate: true });
			watch(() => props.fillInput, resetInputValue);
			watch(menu, updateMenu);
			watch(virtualScrollLength, rerenderMenu);
			function getEmittingOptionValue(opt) {
				return props.emitValue ? getOptionValue.value(opt) : opt;
			}
			function removeAtIndex(index) {
				if (index !== -1 && index < innerValue.value.length) {
					if (props.multiple) {
						const model = [...props.modelValue];
						emit("remove", {
							index,
							value: model.splice(index, 1)[0]
						});
						emit("update:modelValue", model);
					} else emit("update:modelValue", null);
				}
			}
			function removeAtIndexAndFocus(index) {
				removeAtIndex(index);
				state.focus();
			}
			function add(opt, unique) {
				const val = getEmittingOptionValue(opt);
				if (!props.multiple) {
					if (props.fillInput) updateInputValue(getOptionLabel.value(opt), true, true);
					emit("update:modelValue", val);
					return;
				}
				if (innerValue.value.length === 0) {
					emit("add", {
						index: 0,
						value: val
					});
					emit("update:modelValue", props.multiple ? [val] : val);
					return;
				}
				if (unique && isOptionSelected(opt)) return;
				if (props.maxValues !== void 0 && props.modelValue.length >= props.maxValues) return;
				const model = [...props.modelValue];
				emit("add", {
					index: model.length,
					value: val
				});
				model.push(val);
				emit("update:modelValue", model);
			}
			function toggleOption(opt, keepOpen) {
				if (!state.editable.value || opt === void 0 || isOptionDisabled.value(opt) === true) return;
				const optValue = getOptionValue.value(opt);
				if (!props.multiple) {
					const closesDialog = !keepOpen && dialog.value;
					if (!keepOpen) {
						updateInputValue(props.fillInput ? getOptionLabel.value(opt) : "", true, true);
						hidePopup();
					}
					if (!closesDialog) targetRef.value?.focus();
					if (innerValue.value.length === 0 || !isDeepEqual(getOptionValue.value(innerValue.value[0]), optValue)) emit("update:modelValue", props.emitValue ? optValue : opt);
					return;
				}
				if (!hasDialog || dialogFieldFocused.value) state.focus();
				selectInputText();
				if (innerValue.value.length === 0) {
					const val = props.emitValue ? optValue : opt;
					emit("add", {
						index: 0,
						value: val
					});
					emit("update:modelValue", props.multiple ? [val] : val);
					return;
				}
				const model = [...props.modelValue], index = innerOptionsValue.value.findIndex((v) => isDeepEqual(v, optValue));
				if (index !== -1) emit("remove", {
					index,
					value: model.splice(index, 1)[0]
				});
				else {
					if (props.maxValues !== void 0 && model.length >= props.maxValues) return;
					const val = props.emitValue ? optValue : opt;
					emit("add", {
						index: model.length,
						value: val
					});
					model.push(val);
				}
				emit("update:modelValue", model);
			}
			function setOptionIndex(index) {
				const val = index !== -1 && index < virtualScrollLength.value ? index : -1;
				if (optionIndex.value !== val) {
					optionIndex.value = val;
					optionIndexFromModel = false;
				}
			}
			function moveOptionSelection(localOffset = 1, skipInputValue) {
				if (menu.value) {
					let index = optionIndex.value;
					do
						index = normalizeToInterval(index + localOffset, -1, virtualScrollLength.value - 1);
					while (index !== -1 && index !== optionIndex.value && isOptionDisabled.value(props.options[index]) === true);
					if (optionIndex.value !== index) {
						setOptionIndex(index);
						scrollTo(index);
						if (!skipInputValue && props.useInput && props.fillInput) setInputValue(index >= 0 ? getOptionLabel.value(props.options[index]) : defaultInputValue, true);
					}
				}
			}
			function getOption(value, valueCache) {
				const fn = (opt) => isDeepEqual(getOptionValue.value(opt), value);
				return props.options.find(fn) || valueCache.find(fn) || value;
			}
			function isOptionSelected(opt) {
				const val = getOptionValue.value(opt);
				return innerOptionsValue.value.find((v) => isDeepEqual(v, val)) !== void 0;
			}
			function selectInputText(e) {
				if (props.useInput && targetRef.value !== null && (e === void 0 || targetRef.value === e.target && e.target.value === selectedString.value)) targetRef.value.select();
			}
			function onTargetKeyup(e) {
				if (isKeyCode(e, 27) && menu.value) {
					stop(e);
					hidePopup(e);
					resetInputValue();
				}
				emit("keyup", e);
			}
			function onTargetAutocomplete(e) {
				const { value } = e.target;
				if (e.keyCode !== void 0) {
					onTargetKeyup(e);
					return;
				}
				e.target.value = "";
				if (filterTimer !== null) {
					clearTimeout(filterTimer);
					filterTimer = null;
				}
				if (inputValueTimer !== null) {
					clearTimeout(inputValueTimer);
					inputValueTimer = null;
				}
				resetInputValue();
				if (typeof value === "string" && value.length !== 0) {
					const needle = value.toLocaleLowerCase();
					const findFn = (extractFn) => {
						const option = props.options.find((opt) => String(extractFn.value(opt)).toLocaleLowerCase() === needle);
						if (option === void 0) return false;
						if (innerValue.value.includes(option)) hidePopup();
						else toggleOption(option);
						return true;
					};
					const fillFn = (afterFilter) => {
						if (!findFn(getOptionValue) && !afterFilter && !findFn(getOptionLabel)) filter(value, true, () => fillFn(true));
					};
					fillFn();
				} else state.clearValue(e);
			}
			function onTargetKeypress(e) {
				emit("keypress", e);
			}
			function onTargetKeydown(e) {
				emit("keydown", e);
				if (e.defaultPrevented || shouldIgnoreKey(e)) return;
				const newValueModeValid = inputValue.value.length !== 0 && (props.newValueMode !== void 0 || props.onNewValue !== void 0);
				const tabShouldSelect = !e.shiftKey && !props.disableTabSelection && !props.multiple && (optionIndex.value !== -1 || newValueModeValid);
				if (e.keyCode === 27) {
					prevent(e);
					return;
				}
				if (e.keyCode === 9 && !tabShouldSelect) {
					closeMenu(e);
					return;
				}
				if (e.target === void 0 || e.target.id !== state.targetUid.value || !state.editable.value) return;
				if ((e.keyCode === 40 || e.keyCode === 38) && !state.innerLoading.value && !menu.value) {
					stopAndPrevent(e);
					showPopup(e);
					return;
				}
				if (e.keyCode === 8 && (props.useChips && !props.noChipRemove || props.clearable) && !props.hideSelected && inputValue.value.length === 0) {
					if (props.clearable || isOptionDisabled.value(innerValue.value.at(-1)) !== true) {
						if (props.multiple && Array.isArray(props.modelValue)) removeAtIndex(props.modelValue.length - 1);
						else if (!props.multiple && props.modelValue !== null) emit("update:modelValue", null);
					}
					return;
				}
				if ((e.keyCode === 35 || e.keyCode === 36) && (typeof inputValue.value !== "string" || inputValue.value.length === 0)) {
					stopAndPrevent(e);
					optionIndex.value = -1;
					moveOptionSelection(e.keyCode === 36 ? 1 : -1, props.multiple);
				}
				if ((e.keyCode === 33 || e.keyCode === 34) && virtualScrollSliceSizeComputed.value !== void 0) {
					stopAndPrevent(e);
					optionIndex.value = Math.max(-1, Math.min(virtualScrollLength.value, optionIndex.value + (e.keyCode === 33 ? -1 : 1) * virtualScrollSliceSizeComputed.value.view));
					moveOptionSelection(e.keyCode === 33 ? 1 : -1, props.multiple);
				}
				if (e.keyCode === 38 || e.keyCode === 40) {
					stopAndPrevent(e);
					moveOptionSelection(e.keyCode === 38 ? -1 : 1, props.multiple);
				}
				const optionsLength = virtualScrollLength.value;
				if (searchBuffer === void 0 || searchBufferExp < Date.now()) searchBuffer = "";
				if (optionsLength > 0 && !props.useInput && e.key !== void 0 && e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey && (e.keyCode !== 32 || searchBuffer.length !== 0)) {
					if (!menu.value) showPopup(e);
					const char = e.key.toLocaleLowerCase(), keyRepeat = searchBuffer.length === 1 && searchBuffer[0] === char;
					searchBufferExp = Date.now() + 1500;
					if (!keyRepeat) {
						stopAndPrevent(e);
						searchBuffer += char;
					}
					const searchRe = new RegExp("^" + [...searchBuffer].map((l) => reEscapeList.includes(l) ? "\\" + l : l).join(".*"), "i");
					let index = optionIndex.value;
					if (keyRepeat || index < 0 || !searchRe.test(getOptionLabel.value(props.options[index]))) do
						index = normalizeToInterval(index + 1, -1, optionsLength - 1);
					while (index !== optionIndex.value && (isOptionDisabled.value(props.options[index]) === true || !searchRe.test(getOptionLabel.value(props.options[index]))));
					if (optionIndex.value !== index) nextTick(() => {
						setOptionIndex(index);
						scrollTo(index);
						if (index >= 0 && props.useInput && props.fillInput) setInputValue(getOptionLabel.value(props.options[index]), true);
					});
					return;
				}
				if (e.keyCode !== 13 && (e.keyCode !== 32 || props.useInput || searchBuffer !== "") && (e.keyCode !== 9 || !tabShouldSelect)) return;
				if (e.keyCode !== 9) stopAndPrevent(e);
				if (optionIndex.value !== -1 && optionIndex.value < optionsLength && !(newValueModeValid && userInputValue && optionIndexFromModel)) {
					toggleOption(props.options[optionIndex.value]);
					return;
				}
				if (newValueModeValid) {
					const done = (val, mode) => {
						if (mode) {
							if (!validateNewValueMode(mode)) return;
						} else mode = props.newValueMode;
						updateInputValue("", !props.multiple, true);
						if (val === void 0 || val === null) return;
						(mode === "toggle" ? toggleOption : add)(val, mode === "add-unique");
						if (!props.multiple) {
							targetRef.value?.focus();
							hidePopup();
						}
					};
					if (props.onNewValue !== void 0) emit("newValue", inputValue.value, done);
					else done(inputValue.value);
					if (!props.multiple) return;
				}
				if (menu.value) closeMenu(e);
				else if (!state.innerLoading.value) showPopup(e);
			}
			function getVirtualScrollEl() {
				return hasDialog ? menuContentRef.value : menuRef.value !== null && menuRef.value.contentEl !== null ? menuRef.value.contentEl : void 0;
			}
			function getVirtualScrollTarget() {
				return getVirtualScrollEl();
			}
			function getSelection() {
				if (props.hideSelected) return [];
				if (slots["selected-item"] !== void 0) return selectedScope.value.map((scope) => slots["selected-item"](scope));
				if (slots.selected !== void 0) return [slots.selected()].flat();
				if (props.useChips) return selectedScope.value.map((scope, i) => h(QChip_default, {
					key: "option-" + i,
					removable: !props.noChipRemove && state.editable.value && isOptionDisabled.value(scope.opt) !== true,
					dense: true,
					textColor: props.color,
					tabindex: tabindex.value,
					onRemove() {
						scope.removeAtIndex(i);
					}
				}, () => h("span", {
					class: "ellipsis",
					[scope.html ? "innerHTML" : "textContent"]: getOptionLabel.value(scope.opt)
				})));
				return [h("span", {
					class: "q-select__selected-value ellipsis",
					[valueAsHtml.value ? "innerHTML" : "textContent"]: ariaCurrentValue.value
				})];
			}
			function getAllOptions() {
				if (noOptions.value) {
					if (slots["no-option"] !== void 0) return slots["no-option"]({ inputValue: inputValue.value });
					return props.noOptionLabel !== void 0 ? [h(QItem_default, () => h(QItemSection_default, { class: "text-grey" }, () => h(QItemLabel_default, () => props.noOptionLabel)))] : void 0;
				}
				const fn = slots.option !== void 0 ? slots.option : (scope) => h(QItem_default, {
					key: scope.index,
					...scope.itemProps
				}, () => h(QItemSection_default, () => h(QItemLabel_default, () => h("span", { [scope.html ? "innerHTML" : "textContent"]: scope.label }))));
				let options = padVirtualScroll("div", optionScope.value.map(fn), listboxAttrs.value);
				if (slots["before-options"] !== void 0) options = [slots["before-options"](), ...options].flat();
				return hMergeSlot(slots["after-options"], options);
			}
			function getInput(fromDialog, isTarget) {
				const attrs = isTarget ? {
					...comboboxAttrs.value,
					...state.splitAttrs.attributes.value
				} : void 0;
				const data = {
					ref: isTarget ? targetRef : void 0,
					key: "i_t",
					class: computedInputClass.value,
					style: props.inputStyle,
					value: inputValue.value !== void 0 ? inputValue.value : "",
					type: "search",
					...attrs,
					id: isTarget ? state.targetUid.value : void 0,
					maxlength: props.maxlength,
					autocomplete: props.autocomplete,
					"data-autofocus": fromDialog === true || props.autofocus || void 0,
					disabled: props.disable,
					readonly: props.readonly,
					...inputControlEvents.value
				};
				if (isTarget) Object.assign(data, state.getErrorAriaAttrs(data));
				if (!fromDialog && hasDialog) {
					if (Array.isArray(data.class)) data.class = [...data.class, "no-pointer-events"];
					else data.class += " no-pointer-events";
				}
				return h("input", data);
			}
			function onInput(e) {
				if (filterTimer !== null) {
					clearTimeout(filterTimer);
					filterTimer = null;
				}
				if (inputValueTimer !== null) {
					clearTimeout(inputValueTimer);
					inputValueTimer = null;
				}
				if (e?.target?.qComposing) return;
				setInputValue(e.target.value || "");
				userInputValue = true;
				defaultInputValue = inputValue.value;
				if (!state.focused.value && (!hasDialog || dialogFieldFocused.value)) state.focus();
				if (props.onFilter !== void 0) {
					if (hasDialog && !dialog.value) showPopup(e);
					else filterTimer = setTimeout(() => {
						filterTimer = null;
						filter(inputValue.value);
					}, props.inputDebounce);
				}
			}
			function setInputValue(val, emitImmediately) {
				if (inputValue.value !== val) {
					if (inputValueTimer !== null) {
						clearTimeout(inputValueTimer);
						inputValueTimer = null;
					}
					inputValue.value = val;
					if (emitImmediately || props.inputDebounce === 0 || props.inputDebounce === "0") emit("inputValue", val);
					else inputValueTimer = setTimeout(() => {
						inputValueTimer = null;
						emit("inputValue", val);
					}, props.inputDebounce);
				}
			}
			function updateInputValue(val, noFiltering, internal) {
				userInputValue = internal !== true;
				if (props.useInput) {
					setInputValue(val, true);
					if (noFiltering || userInputValue) defaultInputValue = val;
					if (!noFiltering) filter(val);
				}
			}
			function filter(val, keepClosed, afterUpdateFn) {
				if (props.onFilter === void 0 || !keepClosed && !state.focused.value && !hoverShown) return;
				if (state.innerLoading.value) emit("filterAbort");
				else {
					state.innerLoading.value = true;
					innerLoadingIndicator.value = true;
				}
				if (val !== "" && !props.multiple && innerValue.value.length !== 0 && !userInputValue && val === getOptionLabel.value(innerValue.value[0])) val = "";
				const localFilterId = setTimeout(() => {
					if (menu.value) menu.value = false;
				}, 10);
				if (filterId !== null) clearTimeout(filterId);
				filterId = localFilterId;
				emit("filter", val, (fn, afterFn) => {
					if ((keepClosed || state.focused.value || hoverShown) && filterId === localFilterId) {
						clearTimeout(filterId);
						if (typeof fn === "function") fn();
						innerLoadingIndicator.value = false;
						nextTick(() => {
							state.innerLoading.value = false;
							if (state.editable.value) {
								if (keepClosed) {
									if (menu.value) hidePopup();
								} else if (menu.value) updateMenu(true);
								else menu.value = true;
							}
							if (typeof afterFn === "function") nextTick(() => {
								afterFn(proxy);
							});
							if (typeof afterUpdateFn === "function") nextTick(() => {
								afterUpdateFn(proxy);
							});
						});
					}
				}, () => {
					if ((keepClosed || state.focused.value || hoverShown) && filterId === localFilterId) {
						clearTimeout(filterId);
						state.innerLoading.value = false;
						innerLoadingIndicator.value = false;
					}
					if (menu.value) menu.value = false;
				});
			}
			function prefetchUnmappedOptions() {
				if (virtualScrollLength.value !== 0 || innerValue.value.every((opt) => opt !== null && typeof opt === "object")) return false;
				filter("", true, resetInputValue);
				return true;
			}
			function getMenu() {
				return h(QMenu_default, {
					ref: menuRef,
					class: menuContentClass.value,
					style: props.popupContentStyle,
					modelValue: menu.value,
					fit: !props.menuShrink,
					cover: props.optionsCover && !noOptions.value && !props.useInput,
					anchor: props.menuAnchor,
					self: props.menuSelf,
					offset: props.menuOffset,
					dark: isOptionsDark.value,
					noParentEvent: true,
					noRefocus: true,
					noFocus: true,
					noRouteDismiss: props.popupNoRouteDismiss,
					square: squaredMenu.value,
					transitionShow: props.transitionShow,
					transitionHide: props.transitionHide,
					transitionDuration: props.transitionDuration,
					separateClosePopup: true,
					onScrollPassive: onVirtualScrollEvt,
					onBeforeShow: onControlPopupShow,
					onBeforeHide: onMenuBeforeHide,
					onShow: onMenuShow,
					...props.hover ? {
						onPointerenter: onHoverContentEnter,
						onPointerleave: hoverHide
					} : {}
				}, getAllOptions);
			}
			function onMenuBeforeHide(e) {
				onControlPopupHide(e);
				closeMenu();
			}
			function onMenuShow() {
				setVirtualScrollSize();
			}
			function onDialogFieldFocus(e) {
				stop(e);
				targetRef.value?.focus();
				dialogFieldFocused.value = true;
				if ($q.platform.is.ios) window.scrollTo(window.scrollX, 0);
			}
			function onDialogFieldBlur(e) {
				stop(e);
				nextTick(() => {
					dialogFieldFocused.value = false;
				});
			}
			function getDialog() {
				const content = [h(QField_default, {
					class: `col-auto ${state.fieldClass.value}`,
					...innerFieldProps.value,
					for: state.targetUid.value,
					dark: isOptionsDark.value,
					square: true,
					loading: innerLoadingIndicator.value,
					itemAligned: false,
					filled: true,
					stackLabel: inputValue.value.length !== 0,
					...state.splitAttrs.listeners.value,
					onFocus: onDialogFieldFocus,
					onBlur: onDialogFieldBlur
				}, {
					...slots,
					rawControl: () => state.getControl(true),
					before: void 0,
					after: void 0,
					append: props.hideDialogClose ? slots.append : () => {
						const closeBtn = h("button", {
							class: "q-select__dialog-close" + (props.color !== void 0 ? ` text-${props.color}` : ""),
							type: "button",
							tabindex: 0,
							onClick: hidePopup
						}, $q.lang.label.close);
						return slots.append !== void 0 ? [...slots.append(), closeBtn] : [closeBtn];
					}
				})];
				if (menu.value) content.push(h("div", {
					ref: menuContentRef,
					class: menuContentClass.value + " scroll",
					style: props.popupContentStyle,
					onClick: prevent,
					onScrollPassive: onVirtualScrollEvt
				}, getAllOptions()));
				return h(QDialog_default, {
					ref: dialogRef,
					modelValue: dialog.value,
					position: props.useInput ? "top" : void 0,
					noFocus: true,
					transitionShow: transitionShowComputed,
					transitionHide: props.transitionHide,
					transitionDuration: props.transitionDuration,
					noRouteDismiss: props.popupNoRouteDismiss,
					onBeforeShow: onControlPopupShow,
					onBeforeHide: onDialogBeforeHide,
					onHide: onDialogHide,
					onShow: onDialogShow
				}, () => h("div", { class: "q-select__dialog" + (isOptionsDark.value ? " q-select__dialog--dark q-dark" : "") + (dialogFieldFocused.value ? " q-select__dialog--focused" : "") }, content));
			}
			function onDialogBeforeHide(e) {
				onControlPopupHide(e);
				if (dialogRef.value !== null) {
					const refocusTarget = !$q.platform.is.mobile || !props.useInput || e !== void 0 && (e.type.indexOf("key") === 0 || e.type === "click" && e.detail === 0) ? state.rootRef.value.querySelector(".q-field__native > .q-select__focus-target, .q-field__native > .q-field__input") : null;
					dialogRef.value.__updateRefocusTarget(refocusTarget);
				}
				state.focused.value = false;
			}
			function onDialogHide(e) {
				hidePopup();
				if (!state.focused.value) emit("blur", e);
				resetInputValue();
			}
			function onDialogShow() {
				const el = document.activeElement;
				if ((el === null || el.id !== state.targetUid.value) && targetRef.value !== null && targetRef.value !== el) targetRef.value.focus();
				setVirtualScrollSize();
			}
			function closeMenu(e) {
				if (dialog.value) return;
				clearHoverTimer();
				hoverShown = false;
				optionIndex.value = -1;
				if (menu.value) {
					if (e !== void 0) e.qSelectHandled = true;
					menu.value = false;
					menuRef.value?.hide(e);
				}
				if (!state.focused.value) {
					if (filterId !== null) {
						clearTimeout(filterId);
						filterId = null;
					}
					if (state.innerLoading.value) {
						emit("filterAbort");
						state.innerLoading.value = false;
						innerLoadingIndicator.value = false;
					}
				}
			}
			function hoverWithinScope(el) {
				if (el === null || el === void 0) return false;
				const menuContent = menuRef.value !== null ? menuRef.value.contentEl : null;
				if (state.controlRef.value !== null && state.controlRef.value.contains(el) || menuContent !== null && menuContent.contains(el)) return true;
				let portalProxy = getPortalProxy(el);
				while (portalProxy !== void 0 && portalProxy !== null) {
					if (portalProxy === proxy) return true;
					portalProxy = getParentProxy(portalProxy);
				}
				return false;
			}
			const { clearHoverTimer, hoverShow, hoverHide, onHoverContentEnter } = useHover({
				props,
				canShow: () => !hasDialog && !hoverShown && !menu.value && state.editable.value,
				show: hoverShowPopup,
				canHide: (evt) => hoverShown && !hoverWithinScope(evt.relatedTarget),
				hide: hidePopup
			});
			function hoverShowPopup(evt) {
				if (props.onFilter === void 0 && noOptions.value && !hasNoOptionDisplay()) return;
				hoverShown = true;
				hoverShownAt = Date.now();
				evt.qSelectHandled = true;
				if (props.onFilter !== void 0) filter(inputValue.value);
				else {
					menu.value = true;
					menuRef.value?.show(evt);
				}
			}
			function showPopup(e) {
				if (!state.editable.value) return;
				clearHoverTimer();
				hoverShown = false;
				if (e !== void 0) e.qSelectHandled = true;
				if (hasDialog) {
					state.onControlFocusin(e);
					state.focus();
					dialog.value = true;
					dialogRef.value?.show(e);
					nextTick(() => {
						state.focus();
					});
				} else state.focus();
				if (props.onFilter !== void 0) filter(inputValue.value);
				else if (!noOptions.value || hasNoOptionDisplay()) {
					menu.value = true;
					menuRef.value?.show(e);
				}
			}
			function hidePopup(e) {
				if (dialog.value) {
					if (e !== void 0) e.qSelectHandled = true;
					dialog.value = false;
					dialogRef.value?.hide(e);
				}
				closeMenu(e);
			}
			function resetInputValue() {
				if (props.useInput) updateInputValue(!props.multiple && props.fillInput && innerValue.value.length !== 0 ? getOptionLabel.value(innerValue.value[0]) ?? "" : "", true, true);
			}
			function updateMenu(show) {
				let localOptionIndex = -1;
				if (show) {
					if (innerValue.value.length !== 0) {
						const val = getOptionValue.value(innerValue.value[0]);
						localOptionIndex = props.options.findIndex((v) => isDeepEqual(getOptionValue.value(v), val));
					}
					localResetVirtualScroll(localOptionIndex);
				}
				setOptionIndex(localOptionIndex);
				optionIndexFromModel = localOptionIndex !== -1;
			}
			function rerenderMenu(newLength, oldLength) {
				if (menu.value && !state.innerLoading.value) {
					localResetVirtualScroll(-1, true);
					nextTick(() => {
						if (menu.value && !state.innerLoading.value) {
							if (newLength > oldLength) localResetVirtualScroll();
							else updateMenu(true);
						}
					});
				}
			}
			function updateMenuPosition() {
				if (!dialog.value) menuRef.value?.updatePosition();
			}
			function onControlPopupShow(e) {
				if (e !== void 0 && e.qSelectHandled !== true) stop(e);
				emit("popupShow", e);
				state.hasPopupOpen = true;
				if (!hoverShown) state.onControlFocusin(e);
			}
			function onControlPopupHide(e) {
				if (e !== void 0 && e.qSelectHandled !== true) stop(e);
				emit("popupHide", e);
				state.hasPopupOpen = false;
				state.onControlFocusout(e, resetInputValue);
			}
			function updatePreState() {
				hasDialog = !$q.platform.is.mobile && props.behavior !== "dialog" ? false : props.behavior !== "menu" && (props.useInput ? hasNoOptionDisplay() || props.onFilter !== void 0 || !noOptions.value : true);
				transitionShowComputed = $q.platform.is.ios && hasDialog && props.useInput ? "fade" : props.transitionShow;
			}
			onBeforeUpdate(updatePreState);
			onUpdated(updateMenuPosition);
			if (!props.noOptionPrefetch && props.mapOptions && props.onFilter !== void 0) onMounted(() => {
				prefetchPending = !prefetchUnmappedOptions();
			});
			updatePreState();
			onBeforeUnmount(() => {
				if (filterTimer !== null) clearTimeout(filterTimer);
				if (inputValueTimer !== null) clearTimeout(inputValueTimer);
			});
			Object.assign(proxy, {
				showPopup,
				hidePopup,
				removeAtIndex,
				add,
				toggleOption,
				getOptionIndex: () => optionIndex.value,
				setOptionIndex,
				moveOptionSelection,
				filter,
				updateMenuPosition,
				updateInputValue,
				isOptionSelected,
				getEmittingOptionValue,
				isOptionDisabled: (...args) => isOptionDisabled.value(...args) === true,
				getOptionValue: (...args) => getOptionValue.value(...args),
				getOptionLabel: (...args) => getOptionLabel.value(...args)
			});
			Object.assign(state, {
				innerValue,
				fieldClass: computed(() => `q-select q-field--auto-height q-select--with${props.useInput ? "" : "out"}-input q-select--with${props.useChips ? "" : "out"}-chips q-select--${props.multiple ? "multiple" : "single"}`),
				inputRef,
				targetRef,
				hasValue,
				showPopup,
				floatingLabel: computed(() => !props.hideSelected && hasValue.value || typeof inputValue.value === "number" || inputValue.value.length !== 0 || fieldValueIsFilled(props.displayValue)),
				getControlChild: () => {
					if (state.editable.value && (dialog.value || !noOptions.value || hasNoOptionDisplay())) return hasDialog ? getDialog() : getMenu();
					else if (state.hasPopupOpen) state.hasPopupOpen = false;
				},
				controlEvents: {
					onFocusin(e) {
						clearHoverTimer();
						hoverShown = false;
						state.onControlFocusin(e);
					},
					onFocusout(e) {
						state.onControlFocusout(e, () => {
							resetInputValue();
							closeMenu(e);
						});
					},
					onClick(e) {
						prevent(e);
						if (!hasDialog && menu.value) {
							if (hoverShown && Date.now() - hoverShownAt < (props.transitionDuration !== void 0 ? Number(props.transitionDuration) : 300)) {
								hoverShown = false;
								state.focus();
								return;
							}
							closeMenu(e);
							targetRef.value?.focus();
							return;
						}
						showPopup(e);
					},
					onPointerenter: hoverShow,
					onPointerleave: hoverHide
				},
				getControl: (fromDialog) => {
					const child = getSelection();
					const isTarget = fromDialog === true || !dialog.value || !hasDialog;
					if (props.useInput) child.push(getInput(fromDialog, isTarget));
					else {
						const attrs = isTarget ? {
							...comboboxAttrs.value,
							...state.splitAttrs.attributes.value
						} : void 0;
						const data = {
							ref: isTarget ? targetRef : void 0,
							key: "d_t",
							class: "q-select__focus-target",
							value: ariaCurrentValue.value,
							readonly: true,
							"data-autofocus": fromDialog === true || props.autofocus || void 0,
							...attrs,
							disabled: props.disable,
							id: isTarget ? state.targetUid.value : void 0,
							onKeydown: onTargetKeydown,
							onKeyup: onTargetKeyup,
							onKeypress: onTargetKeypress
						};
						if (isTarget) Object.assign(data, state.getErrorAriaAttrs(data));
						child.push(h("input", data));
						if (isTarget && state.editable.value && typeof props.autocomplete === "string" && props.autocomplete.length !== 0) child.push(h("input", {
							class: "q-select__autocomplete-input",
							autocomplete: props.autocomplete,
							tabindex: -1,
							onKeyup: onTargetAutocomplete
						}));
					}
					if (!props.disable) {
						const name = nameProp();
						if (name !== void 0) {
							const opts = innerOptionsValue.value.map((value) => h("option", {
								value,
								selected: true
							}));
							child.push(h("select", {
								class: "hidden",
								name,
								multiple: props.multiple
							}, opts));
						}
					}
					return h("div", {
						class: "q-field__native row items-center",
						...state.splitAttrs.listeners.value
					}, child);
				},
				shouldHideLoadingIndicator: () => props.hideDropdownIcon === true,
				getInnerAppend: () => !props.loading && !innerLoadingIndicator.value && !props.hideDropdownIcon ? [h(QIcon_default, {
					class: "q-select__dropdown-icon" + (menu.value ? " rotate-180" : ""),
					name: dropdownArrowIcon.value
				})] : null
			});
			return useField(state);
		}
	});
	({ ...useDarkProps });
	({ ...useDarkProps });
	var QSpace_default = /*#__PURE__*/ createComponent({
		name: "QSpace",
		setup() {
			const space = h("div", { class: "q-space" });
			return () => space;
		}
	});
	({ ...useDarkProps });
	({ ...usePanelChildProps });
	({
		...useDarkProps,
		...usePanelProps
	});
	var QTh_default = /*#__PURE__*/ createComponent({
		name: "QTh",
		props: {
			props: Object,
			colName: String,
			autoWidth: Boolean
		},
		emits: ["click"],
		setup(props, { slots, emit }) {
			const vm = getCurrentInstance();
			const $q = useQuasar();
			const onClick = (evt) => {
				emit("click", evt);
			};
			const onKeyup = (evt, col) => {
				if (evt.key === "Enter" || evt.key === " ") {
					props.props.sort(col);
					onClick(evt);
					evt.preventDefault();
				}
			};
			return () => {
				if (props.props === void 0) return h("th", {
					class: props.autoWidth ? "q-table--col-auto-width" : "",
					onClick
				}, hSlot(slots.default));
				let col, child;
				const name = props.colName !== void 0 ? props.colName : vm.vnode.key;
				if (name !== null) {
					col = props.props.colsMap[name];
					if (col === void 0) return;
				} else col = props.props.col;
				if (col.sortable) {
					const action = col.align === "right" ? "unshift" : "push";
					child = hUniqueSlot(slots.default, []);
					child[action](h(QIcon_default, {
						class: col.__iconClass,
						name: $q.iconSet.table.arrowUp
					}));
				} else child = hSlot(slots.default);
				const data = {
					class: col.__thClass + (props.autoWidth ? " q-table--col-auto-width" : ""),
					style: col.headerStyle,
					onClick: (evt) => {
						if (col.sortable) props.props.sort(col);
						onClick(evt);
					}
				};
				if (col.sortable) {
					data.tabindex = 0;
					data["aria-sort"] = col.__ariaSort;
					data.onKeydown = (evt) => {
						if (evt.key === " ") evt.preventDefault();
					};
					data.onKeyup = (evt) => {
						onKeyup(evt, col);
					};
				}
				return h("th", data, child);
			};
		}
	});
	function getTableMiddle(props, content) {
		return h("div", props, [h("table", { class: "q-table" }, content)]);
	}
	var comps = {
		list: QList_default,
		table: QMarkupTable_default
	};
	var typeOptions = [
		"list",
		"table",
		"__qtable"
	];
	var QVirtualScroll_default = /*#__PURE__*/ createComponent({
		name: "QVirtualScroll",
		props: {
			...useVirtualScrollProps,
			type: {
				type: String,
				default: "list",
				validator: (v) => typeOptions.includes(v)
			},
			items: {
				type: Array,
				default: () => []
			},
			itemsFn: Function,
			itemsSize: Number,
			scrollTarget: scrollTargetProp
		},
		setup(props, { slots, attrs }) {
			let localScrollTarget;
			const rootRef = /* @__PURE__ */ shallowRef(null);
			const virtualScrollLength = computed(() => props.itemsSize >= 0 && props.itemsFn !== void 0 ? Number.parseInt(props.itemsSize, 10) : Array.isArray(props.items) ? props.items.length : 0);
			const { virtualScrollSliceRange, localResetVirtualScroll, padVirtualScroll, onVirtualScrollEvt } = useVirtualScroll({
				virtualScrollLength,
				getVirtualScrollTarget,
				getVirtualScrollEl
			});
			const virtualScrollScope = computed(() => {
				if (virtualScrollLength.value === 0) return [];
				const mapFn = (item, i) => ({
					index: virtualScrollSliceRange.value.from + i,
					item
				});
				return props.itemsFn === void 0 ? props.items.slice(virtualScrollSliceRange.value.from, virtualScrollSliceRange.value.to).map(mapFn) : props.itemsFn(virtualScrollSliceRange.value.from, virtualScrollSliceRange.value.to - virtualScrollSliceRange.value.from).map(mapFn);
			});
			const classes = computed(() => "q-virtual-scroll q-virtual-scroll" + (props.virtualScrollHorizontal ? "--horizontal" : "--vertical") + (props.scrollTarget !== void 0 ? "" : " scroll"));
			const attributes = computed(() => props.scrollTarget !== void 0 ? {} : { tabindex: 0 });
			watch(virtualScrollLength, () => {
				localResetVirtualScroll();
			});
			watch(() => props.scrollTarget, () => {
				unconfigureScrollTarget();
				configureScrollTarget();
			});
			function getVirtualScrollEl() {
				const el = rootRef.value;
				return el === null ? null : el.$el || el;
			}
			function getVirtualScrollTarget() {
				return localScrollTarget;
			}
			function configureScrollTarget() {
				const el = getVirtualScrollEl();
				if (el === null) return;
				localScrollTarget = getScrollTarget(el, props.scrollTarget);
				localScrollTarget.addEventListener("scroll", onVirtualScrollEvt, listenOpts.passive);
			}
			function unconfigureScrollTarget() {
				if (localScrollTarget !== void 0) {
					localScrollTarget.removeEventListener("scroll", onVirtualScrollEvt, listenOpts.passive);
					localScrollTarget = void 0;
				}
			}
			function __getVirtualChildren() {
				let child = padVirtualScroll(props.type === "list" ? "div" : "tbody", virtualScrollScope.value.map(slots.default));
				if (slots.before !== void 0) child = slots.before().concat(child);
				return hMergeSlot(slots.after, child);
			}
			localResetVirtualScroll();
			onMounted(() => {
				configureScrollTarget();
			});
			onActivated(() => {
				configureScrollTarget();
			});
			onDeactivated(() => {
				unconfigureScrollTarget();
			});
			onBeforeUnmount(() => {
				unconfigureScrollTarget();
			});
			return () => {
				if (slots.default === void 0) {
					console.error("QVirtualScroll: default scoped slot is required for rendering");
					return;
				}
				return props.type === "__qtable" ? getTableMiddle({
					ref: rootRef,
					class: "q-table__middle " + classes.value,
					tabindex: 0
				}, __getVirtualChildren()) : h(comps[props.type], {
					...attrs,
					ref: rootRef,
					class: [attrs.class, classes.value],
					...attributes.value
				}, __getVirtualChildren);
			};
		}
	});
	function sortDate(a, b) {
		return new Date(a) - new Date(b);
	}
	var useTableSortProps = {
		sortMethod: Function,
		binaryStateSort: Boolean,
		columnSortOrder: {
			type: String,
			validator: (v) => v === "ad" || v === "da",
			default: "ad"
		}
	};
	function useTableSort(props, computedPagination, colList, setPagination) {
		const columnToSort = computed(() => {
			const { sortBy } = computedPagination.value;
			return sortBy ? colList.value.find((def) => def.name === sortBy) || null : null;
		});
		const computedSortMethod = computed(() => props.sortMethod !== void 0 ? props.sortMethod : (data, sortBy, descending) => {
			const col = colList.value.find((def) => def.name === sortBy);
			if (col === void 0 || col.field === void 0) return data;
			const dir = descending ? -1 : 1, val = typeof col.field === "function" ? (v) => col.field(v) : (v) => v[col.field];
			return data.sort((a, b) => {
				let A = val(a), B = val(b);
				if (col.rawSort !== void 0) return col.rawSort(A, B, a, b) * dir;
				if (A === null || A === void 0) return -1 * dir;
				if (B === null || B === void 0) return Number(dir);
				if (col.sort !== void 0) return col.sort(A, B, a, b) * dir;
				if (isNumber(A) && isNumber(B)) return (A - B) * dir;
				if (isDate(A) && isDate(B)) return sortDate(A, B) * dir;
				if (typeof A === "boolean" && typeof B === "boolean") return (A - B) * dir;
				[A, B] = [A, B].map((s) => String(s).toLocaleString().toLowerCase());
				return A < B ? -1 * dir : A === B ? 0 : dir;
			});
		});
		function sort(col) {
			let sortOrder = props.columnSortOrder;
			if (isObject(col)) {
				if (col.sortOrder) sortOrder = col.sortOrder;
				col = col.name;
			} else {
				const def = colList.value.find((item) => item.name === col);
				if (def?.sortOrder) sortOrder = def.sortOrder;
			}
			let { sortBy, descending } = computedPagination.value;
			if (sortBy !== col) {
				sortBy = col;
				descending = sortOrder === "da";
			} else if (props.binaryStateSort) descending = !descending;
			else if (descending) {
				if (sortOrder === "ad") sortBy = null;
				else descending = false;
			} else if (sortOrder === "ad") descending = true;
			else sortBy = null;
			setPagination({
				sortBy,
				descending,
				page: 1
			});
		}
		return {
			columnToSort,
			computedSortMethod,
			sort
		};
	}
	var useTableFilterProps = {
		filter: [String, Object],
		filterMethod: Function
	};
	function useTableFilter(props, setPagination) {
		const computedFilterMethod = computed(() => props.filterMethod !== void 0 ? props.filterMethod : (rows, terms, cols, cellValue) => {
			const lowerTerms = terms ? terms.toLowerCase() : "";
			return rows.filter((row) => cols.some((col) => {
				const val = String(cellValue(col, row));
				return (val === "undefined" || val === "null" ? "" : val.toLowerCase()).includes(lowerTerms);
			}));
		});
		watch(() => props.filter, () => {
			nextTick(() => {
				setPagination({ page: 1 }, true);
			});
		}, { deep: true });
		return { computedFilterMethod };
	}
	function samePagination(oldPag, newPag) {
		for (const prop in newPag) if (newPag[prop] !== oldPag[prop]) return false;
		return true;
	}
	function fixPagination(p) {
		if (p.page < 1) p.page = 1;
		if (p.rowsPerPage !== void 0 && p.rowsPerPage < 1) p.rowsPerPage = 0;
		return p;
	}
	var useTablePaginationProps = {
		pagination: Object,
		rowsPerPageOptions: {
			type: Array,
			default: () => [
				5,
				7,
				10,
				15,
				20,
				25,
				50,
				0
			]
		},
		"onUpdate:pagination": [Function, Array]
	};
	function useTablePaginationState(vm, getCellValue) {
		const { props, emit } = vm;
		const innerPagination = /* @__PURE__ */ ref({
			sortBy: null,
			descending: false,
			page: 1,
			rowsPerPage: props.rowsPerPageOptions.length !== 0 ? props.rowsPerPageOptions[0] : 5,
			...props.pagination
		});
		const computedPagination = computed(() => {
			return fixPagination(props["onUpdate:pagination"] !== void 0 ? {
				...innerPagination.value,
				...props.pagination
			} : innerPagination.value);
		});
		const isServerSide = computed(() => computedPagination.value.rowsNumber !== void 0);
		function sendServerRequest(pagination) {
			requestServerInteraction({
				pagination,
				filter: props.filter
			});
		}
		function requestServerInteraction(prop = {}) {
			nextTick(() => {
				emit("request", {
					pagination: prop.pagination === void 0 ? computedPagination.value : prop.pagination,
					filter: prop.filter === void 0 ? props.filter : prop.filter,
					getCellValue
				});
			});
		}
		function setPagination(val, forceServerRequest) {
			const newPagination = fixPagination({
				...computedPagination.value,
				...val
			});
			if (samePagination(computedPagination.value, newPagination)) {
				if (isServerSide.value && forceServerRequest) sendServerRequest(newPagination);
				return;
			}
			if (isServerSide.value) {
				sendServerRequest(newPagination);
				return;
			}
			if (props.pagination !== void 0 && props["onUpdate:pagination"] !== void 0) emit("update:pagination", newPagination);
			else innerPagination.value = newPagination;
		}
		return {
			innerPagination,
			computedPagination,
			isServerSide,
			requestServerInteraction,
			setPagination
		};
	}
	function useTablePagination(vm, computedPagination, isServerSide, setPagination, filteredSortedRowsNumber) {
		const { props, emit } = vm;
		const $q = useQuasar();
		const computedRowsNumber = computed(() => isServerSide.value ? computedPagination.value.rowsNumber || 0 : filteredSortedRowsNumber.value);
		const firstRowIndex = computed(() => {
			const { page, rowsPerPage } = computedPagination.value;
			return (page - 1) * rowsPerPage;
		});
		const lastRowIndex = computed(() => {
			const { page, rowsPerPage } = computedPagination.value;
			return page * rowsPerPage;
		});
		const isFirstPage = computed(() => computedPagination.value.page === 1);
		const pagesNumber = computed(() => computedPagination.value.rowsPerPage === 0 ? 1 : Math.max(1, Math.ceil(computedRowsNumber.value / computedPagination.value.rowsPerPage)));
		const isLastPage = computed(() => lastRowIndex.value === 0 ? true : computedPagination.value.page >= pagesNumber.value);
		const currentRowsPerPage = computed(() => computedPagination.value.rowsPerPage);
		const computedRowsPerPageOptions = computed(() => {
			return (props.rowsPerPageOptions.includes(currentRowsPerPage.value) ? props.rowsPerPageOptions : [currentRowsPerPage.value, ...props.rowsPerPageOptions]).map((count) => ({
				label: count === 0 ? $q.lang.table.allRows : String(count),
				value: count
			}));
		});
		watch(pagesNumber, (newLastPage, oldLastPage) => {
			if (newLastPage === oldLastPage) return;
			const currentPage = computedPagination.value.page;
			if (newLastPage && !currentPage) setPagination({ page: 1 });
			else if (newLastPage < currentPage) setPagination({ page: newLastPage });
		});
		function firstPage() {
			setPagination({ page: 1 });
		}
		function prevPage() {
			const { page } = computedPagination.value;
			if (page > 1) setPagination({ page: page - 1 });
		}
		function nextPage() {
			const { page, rowsPerPage } = computedPagination.value;
			if (lastRowIndex.value > 0 && page * rowsPerPage < computedRowsNumber.value) setPagination({ page: page + 1 });
		}
		function lastPage() {
			setPagination({ page: pagesNumber.value });
		}
		if (props["onUpdate:pagination"] !== void 0) emit("update:pagination", { ...computedPagination.value });
		return {
			firstRowIndex,
			lastRowIndex,
			isFirstPage,
			isLastPage,
			pagesNumber,
			computedRowsPerPageOptions,
			computedRowsNumber,
			firstPage,
			prevPage,
			nextPage,
			lastPage
		};
	}
	var useTableRowSelectionProps = {
		selection: {
			type: String,
			default: "none",
			validator: (v) => [
				"single",
				"multiple",
				"none"
			].includes(v)
		},
		selected: {
			type: Array,
			default: () => []
		}
	};
	var useTableRowSelectionEmits = ["update:selected", "selection"];
	function useTableRowSelection(props, emit, computedRows, getRowKey) {
		const selectedKeys = computed(() => new Set(props.selected.map(getRowKey.value)));
		const hasSelectionMode = computed(() => props.selection !== "none");
		const singleSelection = computed(() => props.selection === "single");
		const multipleSelection = computed(() => props.selection === "multiple");
		const allRowsSelected = computed(() => computedRows.value.length !== 0 && computedRows.value.every((row) => selectedKeys.value.has(getRowKey.value(row))));
		const someRowsSelected = computed(() => !allRowsSelected.value && computedRows.value.some((row) => selectedKeys.value.has(getRowKey.value(row))));
		const rowsSelectedNumber = computed(() => props.selected.length);
		function isRowSelected(key) {
			return selectedKeys.value.has(key);
		}
		function clearSelection() {
			emit("update:selected", []);
		}
		function updateSelection(keys, rows, added, evt) {
			emit("selection", {
				rows,
				added,
				keys,
				evt
			});
			emit("update:selected", singleSelection.value ? added ? rows : [] : added ? [...props.selected, ...rows] : props.selected.filter((row) => !keys.includes(getRowKey.value(row))));
		}
		return {
			hasSelectionMode,
			singleSelection,
			multipleSelection,
			allRowsSelected,
			someRowsSelected,
			rowsSelectedNumber,
			isRowSelected,
			clearSelection,
			updateSelection
		};
	}
	function getVal(val) {
		return Array.isArray(val) ? [...val] : [];
	}
	var useTableRowExpandProps = { expanded: Array };
	var useTableRowExpandEmits = ["update:expanded"];
	function useTableRowExpand(props, emit) {
		const innerExpanded = /* @__PURE__ */ ref(getVal(props.expanded));
		watch(() => props.expanded, (val) => {
			innerExpanded.value = getVal(val);
		});
		function isRowExpanded(key) {
			return innerExpanded.value.includes(key);
		}
		function setExpanded(val) {
			if (props.expanded !== void 0) emit("update:expanded", val);
			else innerExpanded.value = val;
		}
		function updateExpanded(key, add) {
			const target = [...innerExpanded.value];
			const index = target.indexOf(key);
			if (add) {
				if (index === -1) {
					target.push(key);
					setExpanded(target);
				}
			} else if (index !== -1) {
				target.splice(index, 1);
				setExpanded(target);
			}
		}
		return {
			isRowExpanded,
			setExpanded,
			updateExpanded
		};
	}
	var useTableColumnSelectionProps = { visibleColumns: Array };
	function useTableColumnSelection(props, computedPagination, hasSelectionMode) {
		const colList = computed(() => {
			if (props.columns !== void 0) return props.columns;
			const row = props.rows[0];
			return row !== void 0 ? Object.keys(row).map((name) => ({
				name,
				label: name.toUpperCase(),
				field: name,
				align: isNumber(row[name]) ? "right" : "left",
				sortable: true
			})) : [];
		});
		const computedCols = computed(() => {
			const { sortBy, descending } = computedPagination.value;
			return (props.visibleColumns !== void 0 ? colList.value.filter((col) => col.required || props.visibleColumns.includes(col.name)) : colList.value).map((col) => {
				const align = col.align || "right";
				const baseClass = `text-${align}` + (col.autoWidth === true ? " q-table--col-auto-width" : "");
				return {
					...col,
					align,
					__iconClass: `q-table__sort-icon q-table__sort-icon--${align}`,
					__ariaSort: col.sortable === true ? col.name === sortBy ? descending ? "descending" : "ascending" : "none" : void 0,
					__thClass: baseClass + (col.headerClasses !== void 0 ? " " + col.headerClasses : "") + (col.sortable ? " sortable" : "") + (col.name === sortBy ? ` sorted ${descending ? "sort-desc" : ""}` : col.sortable && (col.sortOrder || props.columnSortOrder) === "da" ? " sort-desc" : ""),
					__tdStyle: col.style !== void 0 ? typeof col.style !== "function" ? () => col.style : col.style : () => null,
					__tdClass: col.classes !== void 0 ? typeof col.classes !== "function" ? () => baseClass + " " + col.classes : (row) => baseClass + " " + col.classes(row) : () => baseClass
				};
			});
		});
		return {
			colList,
			computedCols,
			computedColsMap: computed(() => {
				const names = Object.create(null);
				computedCols.value.forEach((col) => {
					names[col.name] = col;
				});
				return names;
			}),
			computedColspan: computed(() => props.tableColspan !== void 0 ? props.tableColspan : computedCols.value.length + (hasSelectionMode.value ? 1 : 0))
		};
	}
	var bottomClass = "q-table__bottom row items-center";
	var virtScrollPassthroughProps = {};
	commonVirtScrollPropsList.forEach((p) => {
		virtScrollPassthroughProps[p] = {};
	});
	function getCellValue(col, row) {
		const val = typeof col.field === "function" ? col.field(row) : row[col.field];
		return col.format !== void 0 ? col.format(val, row) : val;
	}
	var QTable_default = /*#__PURE__*/ createComponent({
		name: "QTable",
		props: {
			rows: {
				type: Array,
				required: true
			},
			rowKey: {
				type: [String, Function],
				default: "id"
			},
			columns: Array,
			loading: Boolean,
			iconFirstPage: String,
			iconPrevPage: String,
			iconNextPage: String,
			iconLastPage: String,
			title: String,
			hideHeader: Boolean,
			grid: Boolean,
			gridHeader: Boolean,
			dense: Boolean,
			flat: Boolean,
			bordered: Boolean,
			square: Boolean,
			separator: {
				type: String,
				default: "horizontal",
				validator: (v) => [
					"horizontal",
					"vertical",
					"cell",
					"none"
				].includes(v)
			},
			wrapCells: Boolean,
			virtualScroll: Boolean,
			virtualScrollTarget: {},
			...virtScrollPassthroughProps,
			noDataLabel: String,
			noResultsLabel: String,
			loadingLabel: String,
			selectedRowsLabel: Function,
			rowsPerPageLabel: String,
			paginationLabel: Function,
			color: {
				type: String,
				default: "grey-8"
			},
			titleClass: [
				String,
				Array,
				Object
			],
			tableStyle: [
				String,
				Array,
				Object
			],
			tableClass: [
				String,
				Array,
				Object
			],
			tableHeaderStyle: [
				String,
				Array,
				Object
			],
			tableHeaderClass: [
				String,
				Array,
				Object
			],
			tableRowStyleFn: Function,
			tableRowClassFn: Function,
			cardContainerClass: [
				String,
				Array,
				Object
			],
			cardContainerStyle: [
				String,
				Array,
				Object
			],
			cardStyle: [
				String,
				Array,
				Object
			],
			cardClass: [
				String,
				Array,
				Object
			],
			cardStyleFn: Function,
			cardClassFn: Function,
			hideBottom: Boolean,
			hideSelectedBanner: Boolean,
			hideNoData: Boolean,
			hidePagination: Boolean,
			onRowClick: Function,
			onRowDblclick: Function,
			onRowContextmenu: Function,
			...useDarkProps,
			...useFullscreenProps,
			...useTableColumnSelectionProps,
			...useTableFilterProps,
			...useTablePaginationProps,
			...useTableRowExpandProps,
			...useTableRowSelectionProps,
			...useTableSortProps
		},
		emits: [
			"request",
			"virtualScroll",
			...useFullscreenEmits,
			...useTableRowExpandEmits,
			...useTableRowSelectionEmits
		],
		setup(props, { slots, emit }) {
			const vm = getCurrentInstance();
			const $q = useQuasar();
			const isDark = useDark(props, $q);
			const { inFullscreen, toggleFullscreen } = useInternalFullscreen();
			const getRowKey = computed(() => typeof props.rowKey === "function" ? props.rowKey : (row) => row[props.rowKey]);
			const rootRef = /* @__PURE__ */ shallowRef(null);
			const virtScrollRef = /* @__PURE__ */ shallowRef(null);
			const hasVirtScroll = computed(() => !props.grid && props.virtualScroll);
			const cardDefaultClass = computed(() => " q-table__card" + (isDark() ? " q-table__card--dark q-dark" : "") + (props.square ? " q-table--square" : "") + (props.flat ? " q-table--flat" : "") + (props.bordered ? " q-table--bordered" : ""));
			const containerClass = computed(() => `q-table__container q-table--${props.separator}-separator column no-wrap` + (props.grid ? " q-table--grid" : cardDefaultClass.value) + (isDark() ? " q-table--dark" : "") + (props.dense ? " q-table--dense" : "") + (props.wrapCells ? "" : " q-table--no-wrap") + (inFullscreen.value ? " fullscreen scroll" : ""));
			const rootContainerClass = computed(() => containerClass.value + (props.loading ? " q-table--loading" : ""));
			watch([
				() => props.tableStyle,
				() => props.tableClass,
				() => props.tableHeaderStyle,
				() => props.tableHeaderClass,
				containerClass
			], () => {
				if (hasVirtScroll.value) virtScrollRef.value?.reset();
			}, { deep: true });
			const { computedPagination, isServerSide, requestServerInteraction, setPagination } = useTablePaginationState(vm, getCellValue);
			const { computedFilterMethod } = useTableFilter(props, setPagination);
			const { isRowExpanded, setExpanded, updateExpanded } = useTableRowExpand(props, emit);
			const filteredSortedRows = computed(() => {
				let rows = props.rows;
				if (isServerSide.value || rows.length === 0) return rows;
				const { sortBy, descending } = computedPagination.value;
				if (props.filter) rows = computedFilterMethod.value(rows, props.filter, computedCols.value, getCellValue);
				if (columnToSort.value !== null) rows = computedSortMethod.value(props.rows === rows ? [...rows] : rows, sortBy, descending);
				return rows;
			});
			const filteredSortedRowsNumber = computed(() => filteredSortedRows.value.length);
			const computedRows = computed(() => {
				let rows = filteredSortedRows.value;
				if (isServerSide.value) return rows;
				const { rowsPerPage } = computedPagination.value;
				if (rowsPerPage !== 0) {
					if (firstRowIndex.value === 0 && props.rows !== rows) {
						if (rows.length > lastRowIndex.value) rows = rows.slice(0, lastRowIndex.value);
					} else rows = rows.slice(firstRowIndex.value, lastRowIndex.value);
				}
				return rows;
			});
			const { hasSelectionMode, singleSelection, multipleSelection, allRowsSelected, someRowsSelected, rowsSelectedNumber, isRowSelected, clearSelection, updateSelection } = useTableRowSelection(props, emit, computedRows, getRowKey);
			const { colList, computedCols, computedColsMap, computedColspan } = useTableColumnSelection(props, computedPagination, hasSelectionMode);
			const { columnToSort, computedSortMethod, sort } = useTableSort(props, computedPagination, colList, setPagination);
			const { firstRowIndex, lastRowIndex, isFirstPage, isLastPage, pagesNumber, computedRowsPerPageOptions, computedRowsNumber, firstPage, prevPage, nextPage, lastPage } = useTablePagination(vm, computedPagination, isServerSide, setPagination, filteredSortedRowsNumber);
			const nothingToDisplay = computed(() => computedRows.value.length === 0);
			const virtProps = computed(() => {
				const acc = {};
				commonVirtScrollPropsList.forEach((p) => {
					acc[p] = props[p];
				});
				if (acc.virtualScrollItemSize === void 0) acc.virtualScrollItemSize = props.dense ? 28 : 48;
				return acc;
			});
			function resetVirtualScroll() {
				if (hasVirtScroll.value) virtScrollRef.value.reset();
			}
			function getBody() {
				if (props.grid) return getGridBody();
				const header = props.hideHeader ? null : getTHead;
				if (hasVirtScroll.value) {
					const topRow = slots["top-row"];
					const bottomRow = slots["bottom-row"];
					const footer = slots.footer;
					const virtSlots = { default: (slotProps) => getTBodyTR(slotProps.item, slots.body, slotProps.index) };
					if (topRow !== void 0) {
						const topContent = h("tbody", topRow({ cols: computedCols.value }));
						virtSlots.before = header === null ? () => topContent : () => [header(), topContent];
					} else if (header !== null) virtSlots.before = header;
					if (bottomRow !== void 0 || footer !== void 0) virtSlots.after = () => {
						const acc = [];
						if (bottomRow !== void 0) acc.push(h("tbody", bottomRow({ cols: computedCols.value })));
						if (footer !== void 0) acc.push(h("tfoot", footer({ cols: computedCols.value })));
						return acc;
					};
					return h(QVirtualScroll_default, {
						ref: virtScrollRef,
						class: props.tableClass,
						style: props.tableStyle,
						...virtProps.value,
						scrollTarget: props.virtualScrollTarget,
						items: computedRows.value,
						type: "__qtable",
						tableColspan: computedColspan.value,
						onVirtualScroll: onVScroll
					}, virtSlots);
				}
				const child = [getTBody()];
				if (header !== null) child.unshift(header());
				if (slots.footer !== void 0) child.push(h("tfoot", slots.footer({ cols: computedCols.value })));
				return getTableMiddle({
					class: ["q-table__middle scroll", props.tableClass],
					tabindex: 0,
					style: props.tableStyle
				}, child);
			}
			function scrollTo(toIndex, edge) {
				if (virtScrollRef.value !== null) {
					virtScrollRef.value.scrollTo(toIndex, edge);
					return;
				}
				toIndex = Math.max(0, Number.parseInt(toIndex, 10) || 0);
				const rowEl = rootRef.value.querySelector(`tbody tr:nth-of-type(${toIndex + 1})`);
				if (rowEl !== null) {
					const scrollTarget = rootRef.value.querySelector(".q-table__middle.scroll");
					const offsetTop = rowEl.offsetTop - (props.virtualScrollStickySizeStart || 0);
					const direction = offsetTop < scrollTarget.scrollTop ? "decrease" : "increase";
					scrollTarget.scrollTop = offsetTop;
					emit("virtualScroll", {
						index: toIndex,
						from: 0,
						to: computedRows.value.length - 1,
						direction
					});
				}
			}
			function onVScroll(info) {
				emit("virtualScroll", info);
			}
			function getProgress() {
				return [h(QLinearProgress_default, {
					class: "q-table__linear-progress",
					color: props.color,
					dark: isDark(),
					indeterminate: true,
					trackColor: "transparent",
					"aria-label": $q.lang.table.loading
				})];
			}
			function getTBodyTR(row, bodySlot, pageIndex) {
				const key = getRowKey.value(row), selected = isRowSelected(key);
				if (bodySlot !== void 0) {
					const cls = props.tableRowClassFn?.(row);
					return bodySlot(getBodyScope({
						key,
						row,
						pageIndex,
						__trStyle: props.tableRowStyleFn?.(row),
						__trClass: (cls ? ` ${cls}` : "") + (selected ? " selected" : "")
					}));
				}
				const bodyCell = slots["body-cell"], child = computedCols.value.map((col) => {
					const bodyCellCol = slots[`body-cell-${col.name}`], slot = bodyCellCol !== void 0 ? bodyCellCol : bodyCell;
					return slot !== void 0 ? h(Fragment, { key: col.name }, slot(getBodyCellScope({
						key,
						row,
						pageIndex,
						col
					}))) : h("td", {
						key: col.name,
						class: col.__tdClass(row),
						style: col.__tdStyle(row)
					}, getCellValue(col, row));
				});
				if (hasSelectionMode.value) {
					const slot = slots["body-selection"];
					const content = slot !== void 0 ? slot(getBodyRowScope({
						key,
						row,
						pageIndex
					})) : [h(QCheckbox_default, {
						modelValue: selected,
						color: props.color,
						dark: isDark(),
						dense: props.dense,
						"aria-label": $q.lang.table.selectRow,
						"onUpdate:modelValue": (adding, evt) => {
							updateSelection([key], [row], adding, evt);
						}
					})];
					child.unshift(h("td", { class: "q-table--col-auto-width" }, content));
				}
				const data = {
					key,
					class: { selected },
					style: props.tableRowStyleFn?.(row)
				};
				if (props.onRowClick !== void 0) {
					data.class["cursor-pointer"] = true;
					data.onClick = (evt) => {
						emit("rowClick", evt, row, pageIndex);
					};
				}
				if (props.onRowDblclick !== void 0) {
					data.class["cursor-pointer"] = true;
					data.onDblclick = (evt) => {
						emit("rowDblclick", evt, row, pageIndex);
					};
				}
				if (props.onRowContextmenu !== void 0) {
					data.class["cursor-pointer"] = true;
					data.onContextmenu = (evt) => {
						emit("rowContextmenu", evt, row, pageIndex);
					};
				}
				const rowCls = props.tableRowClassFn?.(row);
				if (rowCls) data.class[rowCls] = true;
				const tr = h("tr", data, child);
				const bodyExpand = slots["body-expand"];
				if (bodyExpand === void 0) return tr;
				return h(Fragment, { key }, [tr, ...bodyExpand(getBodyRowScope({
					key,
					row,
					pageIndex,
					__trStyle: data.style,
					__trClass: (rowCls ? ` ${rowCls}` : "") + (selected ? " selected" : "")
				}))]);
			}
			function getTBody() {
				const body = slots.body, topRow = slots["top-row"], bottomRow = slots["bottom-row"];
				const child = computedRows.value.map((row, pageIndex) => getTBodyTR(row, body, pageIndex));
				return h("tbody", [
					topRow !== void 0 ? h(Fragment, { key: "top-row" }, topRow({ cols: computedCols.value })) : null,
					...child,
					bottomRow !== void 0 ? h(Fragment, { key: "bottom-row" }, bottomRow({ cols: computedCols.value })) : null
				].flat());
			}
			function getBodyScope(data) {
				injectBodyCommonScope(data);
				data.cols = data.cols.map((col) => injectProp({ ...col }, "value", () => getCellValue(col, data.row)));
				return data;
			}
			function getBodyCellScope(data) {
				injectBodyCommonScope(data);
				injectProp(data, "value", () => getCellValue(data.col, data.row));
				return data;
			}
			function getBodyRowScope(data) {
				injectBodyCommonScope(data);
				return data;
			}
			function injectBodyCommonScope(data) {
				Object.assign(data, {
					cols: computedCols.value,
					colsMap: computedColsMap.value,
					sort,
					rowIndex: firstRowIndex.value + data.pageIndex,
					color: props.color,
					dark: isDark(),
					dense: props.dense
				});
				if (hasSelectionMode.value) injectProp(data, "selected", () => isRowSelected(data.key), (adding, evt) => {
					updateSelection([data.key], [data.row], adding, evt);
				});
				injectProp(data, "expand", () => isRowExpanded(data.key), (adding) => {
					updateExpanded(data.key, adding);
				});
			}
			const marginalsScope = computed(() => ({
				pagination: computedPagination.value,
				pagesNumber: pagesNumber.value,
				isFirstPage: isFirstPage.value,
				isLastPage: isLastPage.value,
				firstPage,
				prevPage,
				nextPage,
				lastPage,
				inFullscreen: inFullscreen.value,
				toggleFullscreen
			}));
			function getTopDiv() {
				const top = slots.top, topLeft = slots["top-left"], topRight = slots["top-right"], topSelection = slots["top-selection"], hasSelection = hasSelectionMode.value && topSelection !== void 0 && rowsSelectedNumber.value > 0, topClass = "q-table__top relative-position row items-center";
				if (top !== void 0) return h("div", { class: topClass }, [top(marginalsScope.value)]);
				let child;
				if (hasSelection) child = [h(Fragment, { key: "top-selection" }, topSelection(marginalsScope.value))];
				else {
					child = [];
					if (topLeft !== void 0) child.push(h("div", { class: "q-table__control" }, [topLeft(marginalsScope.value)]));
					else if (props.title) child.push(h("div", { class: "q-table__control" }, [h("div", { class: ["q-table__title", props.titleClass] }, props.title)]));
				}
				if (topRight !== void 0) child.push(h("div", { class: "q-table__separator col" }), h("div", { class: "q-table__control" }, [topRight(marginalsScope.value)]));
				if (child.length === 0) return;
				return h("div", { class: topClass }, child);
			}
			const headerSelectedValue = computed(() => someRowsSelected.value ? null : allRowsSelected.value);
			function getTHead() {
				const child = getTHeadTR();
				if (props.loading && slots.loading === void 0) child.push(h("tr", { class: "q-table__progress" }, [h("th", {
					class: "relative-position",
					colspan: computedColspan.value
				}, getProgress())]));
				return h("thead", child);
			}
			function getTHeadTR() {
				const header = slots.header, headerCell = slots["header-cell"];
				if (header !== void 0) return [header(getHeaderScope({ header: true }))].flat();
				const child = computedCols.value.map((col) => {
					const headerCellCol = slots[`header-cell-${col.name}`], slot = headerCellCol !== void 0 ? headerCellCol : headerCell, slotProps = getHeaderScope({ col });
					return slot !== void 0 ? h(Fragment, { key: col.name }, slot(slotProps)) : h(QTh_default, {
						key: col.name,
						props: slotProps
					}, () => col.label);
				});
				if (singleSelection.value && !props.grid) child.unshift(h("th", { class: "q-table--col-auto-width" }, " "));
				else if (multipleSelection.value) {
					const slot = slots["header-selection"];
					const content = slot !== void 0 ? slot(getHeaderScope({})) : [h(QCheckbox_default, {
						color: props.color,
						modelValue: headerSelectedValue.value,
						dark: isDark(),
						dense: props.dense,
						"aria-label": $q.lang.table.selectAllRows,
						"onUpdate:modelValue": onMultipleSelectionSet
					})];
					child.unshift(h("th", {
						class: "q-table--col-auto-width",
						"aria-label": $q.lang.table.selectAllRows
					}, content));
				}
				return [h("tr", {
					class: props.tableHeaderClass,
					style: props.tableHeaderStyle
				}, child)];
			}
			function getHeaderScope(data) {
				Object.assign(data, {
					cols: computedCols.value,
					sort,
					colsMap: computedColsMap.value,
					color: props.color,
					dark: isDark(),
					dense: props.dense
				});
				if (multipleSelection.value) injectProp(data, "selected", () => headerSelectedValue.value, onMultipleSelectionSet);
				return data;
			}
			function onMultipleSelectionSet(val) {
				if (someRowsSelected.value) val = false;
				updateSelection(computedRows.value.map(getRowKey.value), computedRows.value, val);
			}
			const navIcon = computed(() => {
				const ico = [
					props.iconFirstPage || $q.iconSet.table.firstPage,
					props.iconPrevPage || $q.iconSet.table.prevPage,
					props.iconNextPage || $q.iconSet.table.nextPage,
					props.iconLastPage || $q.iconSet.table.lastPage
				];
				return $q.lang.rtl ? ico.reverse() : ico;
			});
			function getBottomDiv() {
				if (props.hideBottom) return;
				if (nothingToDisplay.value) {
					if (props.hideNoData) return;
					const message = props.loading ? props.loadingLabel || $q.lang.table.loading : props.filter ? props.noResultsLabel || $q.lang.table.noResults : props.noDataLabel || $q.lang.table.noData;
					const noData = slots["no-data"];
					const children = noData !== void 0 ? [h(Fragment, { key: "no-data" }, noData({
						message,
						icon: $q.iconSet.table.warning,
						filter: props.filter
					}))] : [h(QIcon_default, {
						class: "q-table__bottom-nodata-icon",
						name: $q.iconSet.table.warning
					}), message];
					return h("div", { class: bottomClass + " q-table__bottom--nodata" }, children);
				}
				const bottom = slots.bottom;
				if (bottom !== void 0) return h("div", { class: bottomClass }, [h(Fragment, { key: "bottom" }, bottom(marginalsScope.value))]);
				const child = !props.hideSelectedBanner && hasSelectionMode.value && rowsSelectedNumber.value > 0 ? [h("div", { class: "q-table__control" }, [h("div", [(props.selectedRowsLabel || $q.lang.table.selectedRecords)(rowsSelectedNumber.value)])])] : [];
				if (!props.hidePagination) return h("div", { class: bottomClass + " justify-end" }, getPaginationDiv(child));
				if (child.length !== 0) return h("div", { class: bottomClass }, child);
			}
			function onPagSelection(pag) {
				setPagination({
					page: 1,
					rowsPerPage: pag.value
				});
			}
			function getPaginationDiv(child) {
				let control;
				const { rowsPerPage } = computedPagination.value, paginationLabel = props.paginationLabel || $q.lang.table.pagination, paginationSlot = slots.pagination, hasOpts = props.rowsPerPageOptions.length > 1;
				child.push(h("div", { class: "q-table__separator col" }));
				if (hasOpts) {
					const recordsPerPageLabel = props.rowsPerPageLabel || $q.lang.table.recordsPerPage;
					child.push(h("div", { class: "q-table__control" }, [h("span", { class: "q-table__bottom-item" }, [recordsPerPageLabel]), h(QSelect_default, {
						class: "q-table__select inline q-table__bottom-item",
						color: props.color,
						modelValue: rowsPerPage,
						"aria-label": recordsPerPageLabel,
						options: computedRowsPerPageOptions.value,
						displayValue: rowsPerPage === 0 ? $q.lang.table.allRows : rowsPerPage,
						dark: isDark(),
						borderless: true,
						dense: true,
						optionsDense: true,
						optionsCover: true,
						"onUpdate:modelValue": onPagSelection
					})]));
				}
				if (paginationSlot !== void 0) control = paginationSlot(marginalsScope.value);
				else {
					control = [h("span", rowsPerPage !== 0 ? { class: "q-table__bottom-item" } : {}, [rowsPerPage ? paginationLabel(firstRowIndex.value + 1, Math.min(lastRowIndex.value, computedRowsNumber.value), computedRowsNumber.value) : paginationLabel(1, filteredSortedRowsNumber.value, computedRowsNumber.value)])];
					if (rowsPerPage !== 0 && pagesNumber.value > 1) {
						const btnProps = {
							color: props.color,
							round: true,
							dense: true,
							flat: true
						};
						if (props.dense) btnProps.size = "sm";
						if (pagesNumber.value > 2) control.push(h(QBtn_default, {
							key: "pgFirst",
							...btnProps,
							icon: navIcon.value[0],
							disable: isFirstPage.value,
							"aria-label": $q.lang.pagination.first,
							onClick: firstPage
						}));
						control.push(h(QBtn_default, {
							key: "pgPrev",
							...btnProps,
							icon: navIcon.value[1],
							disable: isFirstPage.value,
							"aria-label": $q.lang.pagination.prev,
							onClick: prevPage
						}), h(QBtn_default, {
							key: "pgNext",
							...btnProps,
							icon: navIcon.value[2],
							disable: isLastPage.value,
							"aria-label": $q.lang.pagination.next,
							onClick: nextPage
						}));
						if (pagesNumber.value > 2) control.push(h(QBtn_default, {
							key: "pgLast",
							...btnProps,
							icon: navIcon.value[3],
							disable: isLastPage.value,
							"aria-label": $q.lang.pagination.last,
							onClick: lastPage
						}));
					}
				}
				child.push(h("div", { class: "q-table__control" }, control));
				return child;
			}
			function getGridHeader() {
				return h("div", { class: "q-table__middle" }, props.gridHeader ? [h("table", { class: "q-table" }, [getTHead(h)])] : props.loading && slots.loading === void 0 ? getProgress(h) : void 0);
			}
			function getGridBody() {
				const item = slots.item !== void 0 ? slots.item : (scope) => {
					const child = scope.cols.map((col) => h("div", { class: "q-table__grid-item-row" }, [h("div", { class: "q-table__grid-item-title" }, [col.label]), h("div", { class: "q-table__grid-item-value" }, [col.value])]));
					if (hasSelectionMode.value) {
						const slot = slots["body-selection"];
						const content = slot !== void 0 ? slot(scope) : [h(QCheckbox_default, {
							modelValue: scope.selected,
							color: props.color,
							dark: isDark(),
							dense: props.dense,
							"aria-label": $q.lang.table.selectRow,
							"onUpdate:modelValue": (adding, evt) => {
								updateSelection([scope.key], [scope.row], adding, evt);
							}
						})];
						child.unshift(h("div", { class: "q-table__grid-item-row" }, content), h(QSeparator_default, { dark: isDark() }));
					}
					const data = {
						class: ["q-table__grid-item-card" + cardDefaultClass.value, props.cardClass],
						style: props.cardStyle
					};
					if (props.cardStyleFn !== void 0) data.style = [data.style, props.cardStyleFn(scope.row)];
					if (props.cardClassFn !== void 0) {
						const cls = props.cardClassFn(scope.row);
						if (cls) data.class[0] += ` ${cls}`;
					}
					if (props.onRowClick !== void 0 || props.onRowDblclick !== void 0 || props.onRowContextmenu !== void 0) {
						data.class[0] += " cursor-pointer";
						if (props.onRowClick !== void 0) data.onClick = (evt) => {
							emit("rowClick", evt, scope.row, scope.pageIndex);
						};
						if (props.onRowDblclick !== void 0) data.onDblclick = (evt) => {
							emit("rowDblclick", evt, scope.row, scope.pageIndex);
						};
						if (props.onRowContextmenu !== void 0) data.onContextmenu = (evt) => {
							emit("rowContextmenu", evt, scope.row, scope.pageIndex);
						};
					}
					return h("div", { class: "q-table__grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3" + (scope.selected ? " q-table__grid-item--selected" : "") }, [h("div", data, child)]);
				};
				return h("div", {
					class: ["q-table__grid-content row", props.cardContainerClass],
					style: props.cardContainerStyle
				}, computedRows.value.flatMap((row, pageIndex) => item(getBodyScope({
					key: getRowKey.value(row),
					row,
					pageIndex
				}))));
			}
			Object.assign(vm.proxy, {
				requestServerInteraction,
				setPagination,
				firstPage,
				prevPage,
				nextPage,
				lastPage,
				isRowSelected,
				clearSelection,
				isRowExpanded,
				setExpanded,
				sort,
				resetVirtualScroll,
				scrollTo,
				getCellValue: (colName, row) => {
					const col = computedColsMap.value[colName];
					if (col !== void 0) return getCellValue(col, row);
				}
			});
			injectMultipleProps(vm.proxy, {
				filteredSortedRows: () => filteredSortedRows.value,
				computedRows: () => computedRows.value,
				computedRowsNumber: () => computedRowsNumber.value
			});
			return () => {
				const child = [getTopDiv()];
				const data = {
					ref: rootRef,
					class: rootContainerClass.value
				};
				if (props.grid) child.push(getGridHeader());
				else Object.assign(data, {
					class: [data.class, props.cardClass],
					style: props.cardStyle
				});
				child.push(getBody(), getBottomDiv());
				if (props.loading && slots.loading !== void 0) child.push(slots.loading());
				return h("div", data, child);
			};
		}
	});
	var QTr_default = /*#__PURE__*/ createComponent({
		name: "QTr",
		props: {
			props: Object,
			noHover: Boolean,
			expandable: Boolean
		},
		setup(props, { slots }) {
			return () => h("tr", {
				style: props.props?.__trStyle,
				class: "q-tr" + (props.props === void 0 || props.props.header || !props.props.__trClass ? "" : props.props.__trClass) + (props.noHover ? " q-tr--no-hover" : "") + (props.expandable ? ` q-tr--expandable q-tr--${props.props?.expand ? "expanded" : "collapsed"}` : "")
			}, hSlot(slots.default));
		}
	});
	var QTd_default = /*#__PURE__*/ createComponent({
		name: "QTd",
		props: {
			props: Object,
			colName: String,
			autoWidth: Boolean,
			noHover: Boolean
		},
		setup(props, { slots }) {
			const vm = getCurrentInstance();
			const classes = computed(() => "q-td" + (props.autoWidth ? " q-table--col-auto-width" : "") + (props.noHover ? " q-td--no-hover" : "") + " ");
			return () => {
				if (props.props === void 0) return h("td", { class: classes.value }, hSlot(slots.default));
				const name = props.colName !== void 0 ? props.colName : vm.vnode.key;
				const col = (props.props.colsMap !== void 0 ? props.props.colsMap[name] : null) || props.props.col;
				if (col === void 0) return;
				const { row } = props.props;
				return h("td", {
					class: classes.value + col.__tdClass(row),
					style: col.__tdStyle(row)
				}, hSlot(slots.default));
			};
		}
	});
	({
		...useRouterLinkProps,
		...useTabProps
	});
	({
		...useDarkProps,
		...useFormProps,
		...useDatetimeProps
	}), { ...useDatetimeProps.mask };
	({ ...useDarkProps });
	var treeCtxKey = Symbol("QTree");
	createComponent({
		name: "QTreeNode",
		props: { node: {
			type: Object,
			required: true
		} },
		setup(props) {
			const ctx = inject(treeCtxKey);
			const collapsible = ctx.useCollapsible(props);
			return () => ctx.renderNode(props.node, collapsible);
		}
	});
	({ ...useDarkProps }), useVirtualScrollProps.virtualScrollItemSize.type, useVirtualScrollProps.virtualScrollSliceSize, useVirtualScrollProps.virtualScrollSliceRatioBefore, useVirtualScrollProps.virtualScrollSliceRatioAfter, useVirtualScrollProps.virtualScrollStickySizeStart, useVirtualScrollProps.virtualScrollStickySizeEnd;
	({
		...useDarkProps,
		...useFileProps
	});
	[...useFileEmits];
	var trueFn = () => true;
	function getEmitsObject(emitsArray) {
		const emitsObject = {};
		emitsArray.forEach((val) => {
			emitsObject[val] = trueFn;
		});
		return emitsObject;
	}
	({ ...useRatioProps });
	function getDepth(value) {
		if (value === false) return 0;
		if (value === true || value === void 0) return 1;
		return Number.parseInt(value, 10) || 0;
	}
	function onClick(evt) {
		const el = evt.currentTarget;
		const depth = el.__qclosepopup;
		if (depth !== 0) setTimeout(() => {
			const proxy = getPortalProxy(el);
			if (proxy !== void 0) closePortals(proxy, evt, depth);
		}, 0);
	}
	function onKeyup(evt) {
		if (isKeyCode(evt, 13)) onClick(evt);
	}
	var ClosePopup_default = /*#__PURE__*/ createDirective({
		name: "close-popup",
		beforeMount(el, { value }) {
			el.__qclosepopup = getDepth(value);
			el.addEventListener("click", onClick);
			el.addEventListener("keyup", onKeyup);
		},
		updated(el, { value, oldValue }) {
			if (value !== oldValue && el.__qclosepopup !== void 0) el.__qclosepopup = getDepth(value);
		},
		beforeUnmount(el) {
			if (el.__qclosepopup !== void 0) {
				el.removeEventListener("click", onClick);
				el.removeEventListener("keyup", onKeyup);
				el.__qclosepopup = void 0;
			}
		}
	});
	var { passive: passive$1, passiveCapture: passiveCapture$1, notPassiveCapture: notPassiveCapture$1 } = listenOpts;
	var { passive, passiveCapture, notPassive, notPassiveCapture } = listenOpts;
	client.is.mobile && (client.is.nativeMobile || client.is.safari || client.is.webkit || client.is.vivaldi);
	function assignFn$1(fn) {
		Object.assign(Plugin, {
			request: fn,
			exit: fn,
			toggle: fn
		});
	}
	function updateEl() {
		const newEl = Plugin.activeEl = Plugin.isActive ? document.fullscreenElement : null;
		changeGlobalNodesTarget(newEl === null || newEl === document.documentElement ? document.body : newEl);
	}
	function togglePluginState() {
		Plugin.isActive = !Plugin.isActive;
		updateEl();
	}
	var Plugin = /*#__PURE__*/ createReactivePlugin({
		isActive: false,
		activeEl: null
	}, {
		isCapable: false,
		install({ $q }) {
			$q.fullscreen = this;
		}
	});
	Plugin.isCapable = document.documentElement.requestFullscreen !== void 0;
	if (!Plugin.isCapable) assignFn$1(() => Promise.reject(/* @__PURE__ */ new Error("Not capable")));
	else {
		Object.assign(Plugin, {
			request(target) {
				const el = target || document.documentElement;
				const { activeEl } = Plugin;
				if (el === activeEl) return Promise.resolve();
				return (activeEl !== null && el.contains(activeEl) ? Plugin.exit() : Promise.resolve()).finally(() => el.requestFullscreen());
			},
			exit() {
				return Plugin.isActive ? document.exitFullscreen() : Promise.resolve();
			},
			toggle(target) {
				return Plugin.isActive ? Plugin.exit() : Plugin.request(target);
			}
		});
		Plugin.isActive = Boolean(document.fullscreenElement);
		if (Plugin.isActive) updateEl();
		document.addEventListener("fullscreenchange", togglePluginState);
	}
	({ ...Object.fromEntries([
		"effectiveType",
		"downlink",
		"rtt",
		"saveData"
	].map((key) => [key, void 0])) });
	var Plugin$2 = /*#__PURE__*/ createReactivePlugin({ appVisible: true }, { install({ $q }) {
		injectProp($q, "appVisible", () => this.appVisible);
	} });
	document.addEventListener("visibilitychange", () => {
		Plugin$2.appVisible = !document.hidden;
	}, false);
	function assignFn(fn) {
		Object.assign(Plugin$3, {
			request: fn,
			release: fn,
			toggle: fn
		});
	}
	var sentinel = null;
	var pending = null;
	var wanted = false;
	function onRelease() {
		sentinel = null;
		Plugin$3.isActive = false;
	}
	function acquire() {
		if (pending === null) pending = navigator.wakeLock.request("screen").then((lock) => {
			pending = null;
			if (!wanted) return lock.release();
			sentinel = lock;
			Plugin$3.isActive = true;
			lock.addEventListener("release", onRelease, { once: true });
		}, (err) => {
			pending = null;
			throw err;
		});
		return pending;
	}
	var isCapable = navigator.wakeLock !== void 0;
	var Plugin$3 = /*#__PURE__*/ createReactivePlugin({
		isCapable: false,
		isActive: false
	}, { install({ $q, onSSRHydrated }) {
		$q.wakeLock = this;
		if (this.__installed || !isCapable) return;
		const start = () => {
			this.isCapable = true;
		};
		if (isRuntimeSsrPreHydration.value) onSSRHydrated.push(start);
		else start();
	} });
	if (!isCapable) assignFn(() => Promise.reject(/* @__PURE__ */ new Error("Not capable")));
	else {
		Object.assign(Plugin$3, {
			request() {
				wanted = true;
				return sentinel !== null ? Promise.resolve() : acquire().catch((err) => {
					if (sentinel === null) wanted = false;
					throw err;
				});
			},
			release() {
				wanted = false;
				return sentinel !== null ? sentinel.release() : Promise.resolve();
			},
			toggle() {
				return Plugin$3.isActive ? Plugin$3.release() : Plugin$3.request();
			}
		});
		document.addEventListener("visibilitychange", () => {
			if (wanted && sentinel === null && !document.hidden) acquire().catch(() => {});
		}, false);
	}
	function getDismissReason(evt) {
		return evt === void 0 ? "programmatic" : evt.type.indexOf("key") === 0 ? "escape" : "backdrop";
	}
	({ ...useDarkProps });
	function merge(target, source) {
		for (const key in source) if (key !== "spinner" && Object(source[key]) === source[key] && !Array.isArray(source[key])) {
			target[key] = Object(target[key]) !== target[key] ? {} : { ...target[key] };
			merge(target[key], source[key]);
		} else target[key] = source[key];
	}
	function createDialog(DefaultComponent, supportsCustomComponent, parentApp) {
		return (pluginProps) => {
			let DialogComponent, props;
			const isCustom = supportsCustomComponent && pluginProps.component !== void 0;
			if (isCustom) {
				const { component, componentProps } = pluginProps;
				DialogComponent = typeof component === "string" ? parentApp.component(component) : component;
				props = componentProps || {};
			} else {
				const { class: klass, style, ...otherProps } = pluginProps;
				DialogComponent = DefaultComponent;
				props = otherProps;
				if (klass !== void 0) otherProps.cardClass = klass;
				if (style !== void 0) otherProps.cardStyle = style;
			}
			let vm;
			let emittedOK = false;
			const dialogRef = /* @__PURE__ */ shallowRef(null);
			const el = createGlobalNode(false, "dialog");
			const applyState = (cmd) => {
				if (dialogRef.value?.[cmd] !== void 0) {
					dialogRef.value[cmd]();
					return;
				}
				let target = vm.$.subTree?.component;
				while (target) {
					if (typeof target.proxy?.[cmd] === "function") {
						target.proxy[cmd]();
						return;
					}
					target = target.subTree?.component;
				}
				console.error("[Quasar] Incorrectly defined Dialog component");
			};
			const okFns = [], cancelFns = [], API = {
				onOk(fn) {
					okFns.push(fn);
					return API;
				},
				onCancel(fn) {
					cancelFns.push(fn);
					return API;
				},
				onDismiss(fn) {
					okFns.push(fn);
					cancelFns.push(fn);
					return API;
				},
				hide() {
					applyState("hide");
					return API;
				},
				update(componentProps) {
					if (vm !== null) {
						if (isCustom) Object.assign(props, componentProps);
						else {
							const { class: klass, style, ...cfg } = componentProps;
							if (klass !== void 0) cfg.cardClass = klass;
							if (style !== void 0) cfg.cardStyle = style;
							merge(props, cfg);
						}
						vm.$forceUpdate();
					}
					return API;
				}
			};
			const onOk = (data) => {
				emittedOK = true;
				okFns.forEach((fn) => {
					fn(data);
				});
			};
			const onHide = (reason) => {
				app.unmount(el);
				removeGlobalNode(el);
				app = null;
				vm = null;
				if (!emittedOK) cancelFns.forEach((fn) => {
					fn(reason);
				});
			};
			let app = createChildApp({
				name: "QGlobalDialog",
				setup: () => () => h(DialogComponent, {
					...props,
					ref: dialogRef,
					onOk,
					onHide,
					onVnodeMounted(...args) {
						if (typeof props.onVnodeMounted === "function") props.onVnodeMounted(...args);
						nextTick(() => applyState("show"));
					}
				})
			}, parentApp);
			vm = app.mount(el);
			return API;
		};
	}
	function stringifyCookieValue(value) {
		return encodeURIComponent(value === Object(value) ? JSON.stringify(value) : String(value));
	}
	function read(string) {
		if (string === "") return string;
		if (string.indexOf("\"") === 0) string = string.slice(1, -1).replaceAll(String.raw`\"`, "\"").replaceAll(String.raw`\\`, "\\");
		try {
			string = decodeURIComponent(string.replaceAll("+", " "));
		} catch {
			return;
		}
		try {
			const parsed = JSON.parse(string);
			if (parsed === Object(parsed) || Array.isArray(parsed)) string = parsed;
		} catch {}
		return string;
	}
	var numberUnitRE = /(\d+)([dhms])/g;
	var numberUnitMultiplierMap = {
		d: 86400,
		h: 3600,
		m: 60,
		s: 1
	};
	function parseExpireToSeconds(str) {
		let totalSeconds = 0;
		let hasMatch = false;
		const matches = str.matchAll(numberUnitRE);
		for (const match of matches) {
			hasMatch = true;
			const value = Number.parseInt(match[1], 10);
			const unit = match[2];
			totalSeconds += value * numberUnitMultiplierMap[unit];
		}
		if (hasMatch) return totalSeconds;
		const timestamp = Date.parse(str);
		return Number.isNaN(timestamp) ? void 0 : Math.round((timestamp - Date.now()) / 1e3);
	}
	function set(key, val, opts = {}, ssr) {
		let maxAge;
		let isDeletion = false;
		if (opts.expires !== void 0) {
			if (Number.isFinite(opts.expires)) maxAge = Math.round(opts.expires * 86400);
			else if (opts.expires instanceof Date) {
				const timestamp = opts.expires.getTime();
				if (Number.isFinite(timestamp)) maxAge = Math.round((timestamp - Date.now()) / 1e3);
			} else if (typeof opts.expires === "string") maxAge = parseExpireToSeconds(opts.expires);
			if (maxAge !== void 0) isDeletion = maxAge <= 0;
		}
		const keyValue = `${encodeURIComponent(key)}=${stringifyCookieValue(val)}`;
		const cookie = [
			keyValue,
			maxAge !== void 0 ? `; Max-Age=${maxAge}` : "",
			opts.path ? `; Path=${opts.path}` : "",
			opts.domain ? `; Domain=${opts.domain}` : "",
			opts.sameSite ? `; SameSite=${opts.sameSite}` : "",
			opts.httpOnly ? "; HttpOnly" : "",
			opts.secure ? "; Secure" : "",
			opts.other ? `; ${opts.other}` : ""
		].join("");
		if (ssr) {
			if (ssr.req.qCookies) ssr.req.qCookies.push(cookie);
			else ssr.req.qCookies = [cookie];
			ssr.res.setHeader("Set-Cookie", ssr.req.qCookies);
			const encodedKey = encodeURIComponent(key);
			const others = ssr.req.headers.cookie ? ssr.req.headers.cookie.split("; ").filter((entry) => entry.split("=", 1)[0] !== encodedKey) : [];
			ssr.req.headers.cookie = (isDeletion ? others : [keyValue, ...others]).join("; ");
		} else document.cookie = cookie;
	}
	function get(key, ssr) {
		const cookieSource = ssr ? ssr.req.headers : document, cookies = cookieSource.cookie ? cookieSource.cookie.split("; ") : [], l = cookies.length;
		let result = key ? null : {}, i = 0, parts, name, cookie;
		for (; i < l; i++) {
			parts = cookies[i].split("=");
			try {
				name = decodeURIComponent(parts.shift());
			} catch {
				continue;
			}
			cookie = parts.join("=");
			if (!key) {
				if (name !== "__proto__" && !Object.hasOwn(result, name)) {
					const value = read(cookie);
					if (value !== void 0) result[name] = value;
				}
			} else if (key === name) {
				result = read(cookie) ?? null;
				break;
			}
		}
		return result;
	}
	function remove(key, options, ssr) {
		set(key, "", {
			expires: -1,
			...options
		}, ssr);
	}
	function has(key, ssr) {
		return get(key, ssr) !== null;
	}
	function noDefault$1() {
		return null;
	}
	function getCookieRefOptions(options) {
		const { default: getDefault = noDefault$1, deep = true, disabled, ...cookieOpts } = options ?? {};
		return {
			getDefault,
			deep,
			disabled,
			cookieOpts
		};
	}
	function getObject(ssr) {
		const attached = /* @__PURE__ */ new Map();
		function notify(name, value, except) {
			attached.get(name)?.forEach((receive) => {
				if (receive !== except) receive(value);
			});
		}
		function onChange(evt) {
			const names = /* @__PURE__ */ new Set();
			for (const cookie of [...evt.changed, ...evt.deleted]) try {
				names.add(decodeURIComponent(cookie.name));
			} catch {}
			names.forEach((name) => {
				if (attached.has(name)) notify(name, get(name));
			});
		}
		function attach(name, receive) {
			let receivers = attached.get(name);
			if (receivers === void 0) {
				if (attached.size === 0 && ssr === void 0) window.cookieStore?.addEventListener("change", onChange);
				receivers = /* @__PURE__ */ new Set();
				attached.set(name, receivers);
			}
			receivers.add(receive);
		}
		function detach(name, receive) {
			const receivers = attached.get(name);
			if (receivers?.delete(receive) && receivers.size === 0) {
				attached.delete(name);
				if (attached.size === 0 && ssr === void 0) window.cookieStore?.removeEventListener("change", onChange);
			}
		}
		function useCookie(name, options) {
			const { getDefault, deep, disabled, cookieOpts } = getCookieRefOptions(options);
			const { expires: _, ...removeOpts } = cookieOpts;
			let value = getDefault(), synced = null, isAttached = false, trigger;
			const cookieRef = customRef((track, triggerRef) => {
				trigger = triggerRef;
				return {
					get() {
						track();
						return deep && (isObject(value) || Array.isArray(value)) ? /* @__PURE__ */ reactive(value) : value;
					},
					set(newValue) {
						assign(newValue === null || newValue === void 0 ? getDefault() : newValue);
						persist();
					}
				};
			});
			function assign(newValue) {
				value = newValue;
				trigger();
			}
			function persist() {
				if (!isAttached) return;
				const encoded = value === null ? null : stringifyCookieValue(value);
				if (encoded === synced) return;
				if (encoded === null) {
					remove(name, removeOpts, ssr);
					synced = null;
				} else {
					set(name, value, cookieOpts, ssr);
					const stored = get(name, ssr);
					synced = stored === null ? null : stringifyCookieValue(stored);
					assign(stored);
				}
				notify(name, value, receive);
			}
			function receive(newValue) {
				if (newValue === null) newValue = get(name, ssr);
				const encoded = newValue === null ? null : stringifyCookieValue(newValue);
				if (encoded === synced) return;
				synced = encoded;
				assign(newValue === null ? getDefault() : newValue);
				persist();
			}
			function seed() {
				const stored = get(name, ssr);
				if (stored === null) synced = null;
				else {
					synced = stringifyCookieValue(stored);
					assign(stored);
				}
				if (ssr === void 0) persist();
			}
			const scope = effectScope(true);
			scope.run(() => {
				watch(() => toValue(disabled) !== true, (on) => {
					if (on) {
						isAttached = true;
						attach(name, receive);
						seed();
					} else if (isAttached) {
						isAttached = false;
						detach(name, receive);
					}
				}, { immediate: true });
				if (deep && ssr === void 0) watch(cookieRef, persist, { deep: true });
			});
			cookieRef.stop = () => {
				scope.stop();
				if (isAttached) {
					isAttached = false;
					detach(name, receive);
				}
			};
			if (getCurrentScope() !== void 0) onScopeDispose(cookieRef.stop);
			return cookieRef;
		}
		return {
			get: (key) => get(key, ssr),
			set: (key, val, opts) => {
				set(key, val, opts, ssr);
				notify(key, get(key, ssr));
			},
			has: (key) => has(key, ssr),
			remove: (key, options) => {
				remove(key, options, ssr);
				notify(key, null);
			},
			getAll: () => get(null, ssr),
			useCookie
		};
	}
	var Plugin$4 = { install({ $q, ssrContext }) {
		$q.cookies = this;
	} };
	if (__QUASAR_SSR__) Plugin$4.parseSSR = (ssrContext) => {
		if (ssrContext !== void 0) return getObject(ssrContext);
	};
	Object.assign(Plugin$4, getObject());
	function useDialogPluginComponent() {
		const { emit, proxy } = getCurrentInstance();
		const dialogRef = /* @__PURE__ */ shallowRef(null);
		let dismissReason = null;
		function show() {
			dismissReason = null;
			dialogRef.value.show();
		}
		function hide() {
			dialogRef.value.hide();
		}
		function onDialogOK(payload) {
			emit("ok", payload);
			hide();
		}
		function onDialogCancel() {
			dismissReason = "cancel";
			hide();
		}
		function onDialogHide(evt) {
			emit("hide", dismissReason !== null ? dismissReason : getDismissReason(evt));
		}
		Object.assign(proxy, {
			show,
			hide
		});
		return {
			dialogRef,
			onDialogHide,
			onDialogOK,
			onDialogCancel
		};
	}
	var emits = ["ok", "hide"];
	useDialogPluginComponent.emits = emits;
	useDialogPluginComponent.emitsObject = getEmitsObject(emits);
	var DialogPluginComponent_default = /*#__PURE__*/ createComponent({
		name: "DialogPluginComponent",
		props: {
			...useDarkProps,
			title: String,
			message: String,
			prompt: Object,
			options: Object,
			progress: [Boolean, Object],
			html: Boolean,
			ok: {
				type: [
					String,
					Object,
					Boolean
				],
				default: true
			},
			cancel: [
				String,
				Object,
				Boolean
			],
			focus: {
				type: String,
				default: "ok",
				validator: (v) => [
					"ok",
					"cancel",
					"none"
				].includes(v)
			},
			stackButtons: Boolean,
			color: String,
			cardClass: [
				String,
				Array,
				Object
			],
			cardStyle: [
				String,
				Array,
				Object
			]
		},
		emits: ["ok", "hide"],
		setup(props) {
			const $q = useQuasar();
			const isDark = useDark(props, $q);
			const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
			const model = /* @__PURE__ */ ref(props.prompt !== void 0 ? props.prompt.model : props.options !== void 0 ? props.options.model : void 0);
			const classes = computed(() => "q-dialog-plugin" + (isDark() ? " q-dialog-plugin--dark q-dark" : "") + (props.progress !== false ? " q-dialog-plugin--progress" : ""));
			const vmColor = computed(() => props.color || (isDark() ? "amber" : "primary"));
			const spinner = computed(() => props.progress === false ? null : isObject(props.progress) ? {
				component: props.progress.spinner || QSpinner_default,
				props: { color: props.progress.color || vmColor.value }
			} : {
				component: QSpinner_default,
				props: { color: vmColor.value }
			});
			const hasForm = computed(() => props.prompt !== void 0 || props.options !== void 0);
			const formProps = computed(() => {
				if (!hasForm.value) return {};
				const { model, isValid, items, ...acc } = props.prompt !== void 0 ? props.prompt : props.options;
				return acc;
			});
			const okLabel = computed(() => isObject(props.ok) ? $q.lang.label.ok : props.ok === true ? $q.lang.label.ok : props.ok);
			const cancelLabel = computed(() => isObject(props.cancel) ? $q.lang.label.cancel : props.cancel === true ? $q.lang.label.cancel : props.cancel);
			const okDisabled = computed(() => {
				if (props.prompt !== void 0) return props.prompt.isValid !== void 0 && !props.prompt.isValid(model.value);
				if (props.options !== void 0) return props.options.isValid !== void 0 && !props.options.isValid(model.value);
				return false;
			});
			const okProps = computed(() => ({
				color: vmColor.value,
				label: okLabel.value,
				ripple: false,
				disable: okDisabled.value,
				...isObject(props.ok) ? props.ok : { flat: true },
				"data-autofocus": props.focus === "ok" && !hasForm.value || void 0,
				onClick: onOk
			}));
			const cancelProps = computed(() => ({
				color: vmColor.value,
				label: cancelLabel.value,
				ripple: false,
				...isObject(props.cancel) ? props.cancel : { flat: true },
				"data-autofocus": props.focus === "cancel" && !hasForm.value || void 0,
				onClick: onDialogCancel
			}));
			watch(() => props.prompt && props.prompt.model, onUpdateModel);
			watch(() => props.options && props.options.model, onUpdateModel);
			function onOk() {
				onDialogOK(/* @__PURE__ */ toRaw(model.value));
			}
			function onUpdateModel(val) {
				model.value = val;
			}
			function onInputKeyup(evt) {
				if (!okDisabled.value && props.prompt.type !== "textarea" && isKeyCode(evt, 13)) onOk();
			}
			function getSection(sectionClass, text) {
				return props.html ? h(QCardSection_default, {
					class: sectionClass,
					innerHTML: text
				}) : h(QCardSection_default, { class: sectionClass }, () => text);
			}
			function getPrompt() {
				return [h(QInput_default, {
					color: vmColor.value,
					dense: true,
					autofocus: true,
					dark: isDark(),
					...formProps.value,
					modelValue: model.value,
					"onUpdate:modelValue": onUpdateModel,
					onKeyup: onInputKeyup
				})];
			}
			function getOptions() {
				return [h(QOptionGroup_default, {
					color: vmColor.value,
					options: props.options.items,
					dark: isDark(),
					...formProps.value,
					modelValue: model.value,
					"onUpdate:modelValue": onUpdateModel
				})];
			}
			function getButtons() {
				const child = [];
				if (props.cancel) child.push(h(QBtn_default, cancelProps.value));
				if (props.ok) child.push(h(QBtn_default, okProps.value));
				return h(QCardActions_default, {
					class: props.stackButtons ? "items-end" : "",
					vertical: props.stackButtons,
					align: "right"
				}, () => child);
			}
			function getCardContent() {
				const child = [];
				if (props.title) child.push(getSection("q-dialog__title", props.title));
				if (props.progress !== false) child.push(h(QCardSection_default, { class: "q-dialog__progress" }, () => h(spinner.value.component, spinner.value.props)));
				if (props.message) child.push(getSection("q-dialog__message", props.message));
				if (props.prompt !== void 0) child.push(h(QCardSection_default, { class: "scroll q-dialog-plugin__form" }, getPrompt));
				else if (props.options !== void 0) child.push(h(QSeparator_default, { dark: isDark() }), h(QCardSection_default, { class: "scroll q-dialog-plugin__form" }, getOptions), h(QSeparator_default, { dark: isDark() }));
				if (props.ok || props.cancel) child.push(getButtons());
				return child;
			}
			function getContent() {
				return [h(QCard_default, {
					class: [classes.value, props.cardClass],
					style: props.cardStyle,
					dark: isDark()
				}, getCardContent)];
			}
			return () => h(QDialog_default, {
				ref: dialogRef,
				onHide: onDialogHide
			}, getContent);
		}
	});
	var Dialog_default = { install({ $q, parentApp }) {
		$q.dialog = this.create = createDialog(DialogPluginComponent_default, true, parentApp);
	} };
	String.raw`\u003C`, String.raw`\u003E`, String.raw`\u0026`, String.raw`\u2028`, String.raw`\u2029`;
	var uid = 0;
	var defaults = {};
	var groups = {};
	var notificationsList = {};
	var positionClass = {};
	var emptyRE = /^\s*$/;
	var notifRefs = [];
	var invalidTimeoutValues = [
		void 0,
		null,
		true,
		false,
		""
	];
	var positionList = [
		"top-left",
		"top-right",
		"bottom-left",
		"bottom-right",
		"top",
		"bottom",
		"left",
		"right",
		"center"
	];
	var badgePositions = [
		"top-left",
		"top-right",
		"bottom-left",
		"bottom-right"
	];
	var notifTypes = {
		positive: {
			icon: ($q) => $q.iconSet.type.positive,
			color: "positive"
		},
		negative: {
			icon: ($q) => $q.iconSet.type.negative,
			color: "negative"
		},
		warning: {
			icon: ($q) => $q.iconSet.type.warning,
			color: "warning",
			textColor: "dark"
		},
		info: {
			icon: ($q) => $q.iconSet.type.info,
			color: "info"
		},
		ongoing: {
			group: false,
			timeout: 0,
			spinner: true,
			color: "grey-8"
		}
	};
	function addNotification(config, $q, originalApi) {
		if (!config) return logError("parameter required");
		let Api;
		const notif = { textColor: "white" };
		if (!config.ignoreDefaults) Object.assign(notif, defaults);
		if (!isObject(config)) {
			if (notif.type) Object.assign(notif, notifTypes[notif.type]);
			config = { message: config };
		}
		Object.assign(notif, notifTypes[config.type || notif.type], config);
		if (typeof notif.icon === "function") notif.icon = notif.icon($q);
		if (!notif.spinner) notif.spinner = false;
		else notif.spinner = notif.spinner === true ? QSpinner_default : markRaw(notif.spinner);
		notif.meta = {
			hasMedia: Boolean(notif.spinner || notif.icon || notif.avatar),
			hasText: hasContent(notif.message) || hasContent(notif.caption)
		};
		if (notif.position) {
			if (!positionList.includes(notif.position)) return logError("wrong position", config);
		} else notif.position = "bottom";
		if (invalidTimeoutValues.includes(notif.timeout)) notif.timeout = 5e3;
		else {
			const t = Number.parseFloat(notif.timeout);
			if (!Number.isFinite(t) || t < 0) return logError("wrong timeout", config);
			notif.timeout = t;
		}
		if (notif.timeout === 0) notif.progress = false;
		else if (notif.progress) {
			notif.meta.progressClass = "q-notification__progress" + (notif.progressClass ? ` ${notif.progressClass}` : "");
			notif.meta.progressStyle = { animationDuration: `${notif.timeout + 1e3}ms` };
		}
		const actions = [
			...Array.isArray(config.actions) ? config.actions : [],
			...!config.ignoreDefaults && Array.isArray(defaults.actions) ? defaults.actions : [],
			...Array.isArray(notifTypes[config.type]?.actions) ? notifTypes[config.type].actions : []
		];
		const { closeBtn } = notif;
		if (closeBtn) actions.push({ label: typeof closeBtn === "string" ? closeBtn : $q.lang.label.close });
		notif.actions = actions.map(({ handler, noDismiss, ...item }) => ({
			flat: true,
			...item,
			onClick: typeof handler === "function" ? () => {
				handler();
				if (!noDismiss) dismiss();
			} : () => {
				dismiss();
			}
		}));
		if (notif.multiLine === void 0) notif.multiLine = notif.actions.length > 1;
		Object.assign(notif.meta, {
			class: `q-notification row items-stretch q-notification--${notif.multiLine ? "multi-line" : "standard"}` + (notif.color !== void 0 ? ` bg-${notif.color}` : "") + (notif.textColor !== void 0 ? ` text-${notif.textColor}` : "") + (notif.classes !== void 0 ? ` ${notif.classes}` : ""),
			wrapperClass: "q-notification__wrapper col relative-position border-radius-inherit " + (notif.multiLine ? "column no-wrap justify-center" : "row items-center"),
			contentClass: "q-notification__content row items-center" + (notif.multiLine ? "" : " col"),
			leftClass: notif.meta.hasText ? "additional" : "single",
			attrs: {
				role: "alert",
				...notif.attrs
			}
		});
		if (notif.group === false) {
			notif.group = void 0;
			notif.meta.group = void 0;
		} else {
			if (notif.group === void 0 || notif.group === true) notif.group = [
				notif.message,
				notif.caption,
				notif.multiLine,
				...notif.actions.map((props) => `${props.label}*${props.icon}`)
			].join("|");
			notif.meta.group = notif.group + "|" + notif.position;
		}
		if (notif.actions.length === 0) notif.actions = void 0;
		else notif.meta.actionsClass = "q-notification__actions row items-center " + (notif.multiLine ? "justify-end" : "col-auto") + (notif.meta.hasMedia ? " q-notification__actions--with-media" : "");
		if (originalApi !== void 0) {
			if (originalApi.notif.meta.timer) {
				clearTimeout(originalApi.notif.meta.timer);
				originalApi.notif.meta.timer = void 0;
			}
			notif.meta.uid = originalApi.notif.meta.uid;
			const index = notificationsList[notif.position].value.indexOf(originalApi.notif);
			notificationsList[notif.position].value[index] = notif;
		} else {
			const original = groups[notif.meta.group];
			if (original === void 0) {
				notif.meta.uid = uid++;
				notif.meta.badge = 1;
				if ([
					"left",
					"right",
					"center"
				].includes(notif.position)) notificationsList[notif.position].value.splice(Math.floor(notificationsList[notif.position].value.length / 2), 0, notif);
				else {
					const action = notif.position.includes("top") ? "unshift" : "push";
					notificationsList[notif.position].value[action](notif);
				}
				if (notif.group !== void 0) groups[notif.meta.group] = notif;
			} else {
				if (original.meta.timer) {
					clearTimeout(original.meta.timer);
					original.meta.timer = void 0;
				}
				if (notif.badgePosition !== void 0) {
					if (!badgePositions.includes(notif.badgePosition)) return logError("wrong badgePosition", config);
				} else notif.badgePosition = `top-${notif.position.includes("left") ? "right" : "left"}`;
				notif.meta.uid = original.meta.uid;
				notif.meta.badge = original.meta.badge + 1;
				notif.meta.badgeClass = `q-notification__badge q-notification__badge--${notif.badgePosition}` + (notif.badgeColor !== void 0 ? ` bg-${notif.badgeColor}` : "") + (notif.badgeTextColor !== void 0 ? ` text-${notif.badgeTextColor}` : "") + (notif.badgeClass ? ` ${notif.badgeClass}` : "");
				const index = notificationsList[notif.position].value.indexOf(original);
				notificationsList[notif.position].value[index] = groups[notif.meta.group] = notif;
			}
		}
		const dismiss = () => {
			removeNotification(notif);
			Api = void 0;
		};
		if (notif.timeout > 0) notif.meta.timer = setTimeout(() => {
			notif.meta.timer = void 0;
			dismiss();
		}, notif.timeout + 1e3);
		if (notif.group !== void 0) return (props) => {
			if (props !== void 0) logError("trying to update a grouped one which is forbidden", config);
			else dismiss();
		};
		Api = {
			dismiss,
			config,
			notif
		};
		if (originalApi !== void 0) {
			Object.assign(originalApi, Api);
			return;
		}
		return (props) => {
			if (Api !== void 0) {
				if (props === void 0) Api.dismiss();
				else addNotification({
					...Api.config,
					...props,
					group: false,
					position: notif.position
				}, $q, Api);
			}
		};
	}
	function removeNotification(notif) {
		if (notif.meta.timer) {
			clearTimeout(notif.meta.timer);
			notif.meta.timer = void 0;
		}
		const index = notificationsList[notif.position].value.indexOf(notif);
		if (index !== -1) {
			if (notif.group !== void 0) delete groups[notif.meta.group];
			const el = notifRefs[String(notif.meta.uid)];
			if (el) {
				const { width, height } = getComputedStyle(el);
				el.style.left = `${el.offsetLeft}px`;
				el.style.width = width;
				el.style.height = height;
			}
			notificationsList[notif.position].value.splice(index, 1);
			if (typeof notif.onDismiss === "function") notif.onDismiss();
		}
	}
	function hasContent(str) {
		return str !== void 0 && str !== null && !emptyRE.test(str);
	}
	function logError(error, config) {
		console.error(`Notify: ${error}`, config);
		return false;
	}
	function getComponent() {
		return createComponent({
			name: "QNotifications",
			devtools: { hide: true },
			setup() {
				return () => h("div", { class: "q-notifications" }, positionList.map((pos) => h(TransitionGroup, {
					key: pos,
					class: positionClass[pos],
					tag: "div",
					name: `q-notification--${pos}`
				}, () => notificationsList[pos].value.map((notif) => {
					const meta = notif.meta;
					const mainChild = [];
					if (meta.hasMedia) {
						if (notif.spinner) mainChild.push(h(notif.spinner, {
							class: "q-notification__spinner q-notification__spinner--" + meta.leftClass,
							color: notif.spinnerColor,
							size: notif.spinnerSize
						}));
						else if (notif.icon) mainChild.push(h(QIcon_default, {
							class: "q-notification__icon q-notification__icon--" + meta.leftClass,
							name: notif.icon,
							color: notif.iconColor,
							size: notif.iconSize,
							role: "img"
						}));
						else if (notif.avatar) mainChild.push(h(QAvatar_default, { class: "q-notification__avatar q-notification__avatar--" + meta.leftClass }, () => h("img", {
							src: notif.avatar,
							"aria-hidden": "true"
						})));
					}
					if (meta.hasText) {
						let msgChild;
						const msgData = { class: "q-notification__message col" };
						if (notif.html) msgData.innerHTML = notif.caption ? `<div>${notif.message}</div><div class="q-notification__caption">${notif.caption}</div>` : notif.message;
						else {
							const msgNode = [notif.message];
							msgChild = notif.caption ? [h("div", msgNode), h("div", { class: "q-notification__caption" }, [notif.caption])] : msgNode;
						}
						mainChild.push(h("div", msgData, msgChild));
					}
					const child = [h("div", { class: meta.contentClass }, mainChild)];
					if (notif.progress) child.push(h("div", {
						key: `${meta.uid}|p|${meta.badge}`,
						class: meta.progressClass,
						style: meta.progressStyle
					}));
					if (notif.actions) child.push(h("div", { class: meta.actionsClass }, notif.actions.map((props) => h(QBtn_default, props))));
					if (meta.badge > 1) child.push(h("div", {
						key: `${meta.uid}|${meta.badge}`,
						class: notif.meta.badgeClass,
						style: notif.badgeStyle
					}, [meta.badge]));
					return h("div", {
						ref: (el) => {
							notifRefs[String(meta.uid)] = el;
						},
						key: meta.uid,
						class: meta.class,
						...meta.attrs
					}, [h("div", { class: meta.wrapperClass }, child)]);
				}))));
			}
		});
	}
	var Notify_default = {
		setDefaults(opts) {
			if (isObject(opts)) Object.assign(defaults, opts);
		},
		registerType(typeName, typeOpts) {
			if (isObject(typeOpts)) notifTypes[typeName] = typeOpts;
		},
		install({ $q, parentApp }) {
			$q.notify = this.create = (opts) => addNotification(opts, $q);
			$q.notify.setDefaults = this.setDefaults;
			$q.notify.registerType = this.registerType;
			if ($q.config.notify !== void 0) this.setDefaults($q.config.notify);
			if (!this.__installed) {
				positionList.forEach((pos) => {
					notificationsList[pos] = /* @__PURE__ */ ref([]);
					const vert = pos === "left" || pos === "center" || pos === "right" ? "center" : pos.includes("top") ? "top" : "bottom", align = pos.includes("left") ? "start" : pos.includes("right") ? "end" : "center";
					positionClass[pos] = `q-notifications__list q-notifications__list--${vert} fixed column no-wrap ${pos === "left" || pos === "right" ? `items-${pos === "left" ? "start" : "end"} justify-center` : pos === "center" ? "flex-center" : `items-${align}`}`;
				});
				const el = createGlobalNode("q-notify");
				createChildApp(getComponent(), parentApp).mount(el);
			}
		}
	};
	function encode$1(value) {
		if (isDate(value)) return "__q_date|" + value.getTime();
		if (isRegexp(value)) return "__q_expr|/" + value.source + "/" + value.flags;
		if (typeof value === "number") return "__q_numb|" + value;
		if (typeof value === "boolean") return "__q_bool|" + (value ? "1" : "0");
		if (typeof value === "string") return "__q_strn|" + value;
		if (typeof value === "function") return "__q_strn|" + value.toString();
		if (value === Object(value)) return "__q_objt|" + JSON.stringify(value);
		return value;
	}
	var numberRE = /^-?\d+$/;
	function decode(value) {
		if (value.length < 9) return value;
		const type = value.slice(0, 8);
		const source = value.slice(9);
		switch (type) {
			case "__q_date": return new Date(numberRE.test(source) ? Number.parseInt(source, 10) : source);
			case "__q_expr":
				if (source.startsWith("/")) {
					const index = source.lastIndexOf("/");
					return new RegExp(source.slice(1, index), source.slice(index + 1));
				}
				return new RegExp(source);
			case "__q_numb": return Number(source);
			case "__q_bool": return Boolean(source === "1");
			case "__q_strn": return String(source);
			case "__q_objt": return JSON.parse(source);
			default: return value;
		}
	}
	function noDefault() {
		return null;
	}
	function getStorageRefOptions(options) {
		return {
			getDefault: options?.default ?? noDefault,
			deep: options?.deep !== false,
			disabled: options?.disabled,
			onError: options?.onError
		};
	}
	function isDeepValue(value) {
		return isObject(value) || Array.isArray(value);
	}
	function getEmptyStorageRef(key, options) {
		const { getDefault, deep } = getStorageRefOptions(options);
		let value = getDefault();
		const storageRef = customRef((track, trigger) => ({
			get() {
				track();
				return deep && isDeepValue(value) ? /* @__PURE__ */ reactive(value) : value;
			},
			set(newValue) {
				value = newValue === null || newValue === void 0 ? getDefault() : newValue;
				trigger();
			}
		}));
		storageRef.stop = noop;
		return storageRef;
	}
	function getEmptyStorage() {
		return {
			has: () => false,
			hasItem: () => false,
			getLength: () => 0,
			getItem: () => null,
			getIndex: () => null,
			getKey: () => null,
			getAll: () => ({}),
			getAllKeys: () => [],
			set: noop,
			setItem: noop,
			remove: noop,
			removeItem: noop,
			clear: noop,
			isEmpty: () => true,
			useStorage: getEmptyStorageRef
		};
	}
	function getStorage(type) {
		const webStorage = window[type + "Storage"], get = (key) => {
			const item = webStorage.getItem(key);
			return item === null ? null : decode(item);
		};
		const attached = /* @__PURE__ */ new Map();
		function notify(key, value, encoded, except, error) {
			attached.get(key)?.forEach((receive) => {
				if (receive !== except) receive(value, encoded, error);
			});
		}
		function notifyAll() {
			attached.forEach((receivers) => {
				receivers.forEach((receive) => {
					receive(null, null);
				});
			});
		}
		function onStorage(evt) {
			if (evt.storageArea !== webStorage) return;
			if (evt.key === null) notifyAll();
			else if (attached.has(evt.key)) {
				const raw = evt.newValue;
				let value = null;
				try {
					if (raw !== null) value = decode(raw);
				} catch (err) {
					notify(evt.key, null, raw, void 0, err);
					return;
				}
				notify(evt.key, value, raw);
			}
		}
		function attach(key, receive) {
			let receivers = attached.get(key);
			if (receivers === void 0) {
				if (attached.size === 0) window.addEventListener("storage", onStorage);
				receivers = /* @__PURE__ */ new Set();
				attached.set(key, receivers);
			}
			receivers.add(receive);
		}
		function detach(key, receive) {
			const receivers = attached.get(key);
			if (receivers?.delete(receive) && receivers.size === 0) {
				attached.delete(key);
				if (attached.size === 0) window.removeEventListener("storage", onStorage);
			}
		}
		const hasItem = (key) => webStorage.getItem(key) !== null;
		const removeItem = (key) => {
			webStorage.removeItem(key);
			notify(key, null, null);
		};
		const setItem = (key, value) => {
			if (value === null || value === void 0) {
				removeItem(key);
				return;
			}
			webStorage.setItem(key, encode$1(value));
			if (attached.has(key)) {
				const stored = get(key);
				notify(key, stored, encode$1(stored));
			}
		};
		function useStorage(key, options) {
			const { getDefault, deep, disabled, onError } = getStorageRefOptions(options);
			let value = getDefault(), synced = null, isAttached = false, trigger;
			const fail = (err) => {
				if (onError !== void 0) onError(err);
				else throw err;
			};
			const storageRef = customRef((track, triggerRef) => {
				trigger = triggerRef;
				return {
					get() {
						track();
						return deep && isDeepValue(value) ? /* @__PURE__ */ reactive(value) : value;
					},
					set(newValue) {
						assign(newValue === null || newValue === void 0 ? getDefault() : newValue);
						persist();
					}
				};
			});
			function assign(newValue) {
				value = newValue;
				trigger();
			}
			function persist() {
				if (!isAttached) return;
				let encoded = value === null ? null : encode$1(value);
				if (encoded === synced) return;
				try {
					if (encoded === null) webStorage.removeItem(key);
					else {
						webStorage.setItem(key, encoded);
						if (typeof encoded !== "string" || typeof value === "function") {
							assign(get(key));
							encoded = encode$1(value);
						}
					}
				} catch (err) {
					fail(err);
					return;
				}
				synced = encoded;
				notify(key, value, encoded, receive);
			}
			function receive(newValue, encoded, error) {
				if (error !== void 0) {
					fail(error);
					return;
				}
				if (newValue === null) {
					const raw = webStorage.getItem(key);
					if (raw !== null) {
						newValue = decode(raw);
						encoded = encode$1(newValue);
					}
				}
				if (newValue === null) {
					synced = null;
					assign(getDefault());
				} else {
					synced = encoded;
					assign(newValue);
				}
				persist();
			}
			function seed() {
				try {
					const raw = webStorage.getItem(key);
					if (raw === null) synced = null;
					else {
						const stored = decode(raw);
						synced = encode$1(stored);
						assign(stored);
					}
				} catch (err) {
					fail(err);
					return;
				}
				persist();
			}
			const scope = effectScope(true);
			scope.run(() => {
				watch(() => !isRuntimeSsrPreHydration.value && toValue(disabled) !== true, (on) => {
					if (on) {
						isAttached = true;
						attach(key, receive);
						seed();
					} else if (isAttached) {
						isAttached = false;
						detach(key, receive);
					}
				}, { immediate: true });
				if (deep) watch(storageRef, persist, { deep: true });
			});
			storageRef.stop = () => {
				scope.stop();
				if (isAttached) {
					isAttached = false;
					detach(key, receive);
				}
			};
			if (getCurrentScope() !== void 0) onScopeDispose(storageRef.stop);
			return storageRef;
		}
		return {
			has: hasItem,
			hasItem,
			getLength: () => webStorage.length,
			getItem: get,
			getIndex: (index) => index < webStorage.length ? get(webStorage.key(index)) : null,
			getKey: (index) => index < webStorage.length ? webStorage.key(index) : null,
			getAll: () => {
				let key;
				const result = {}, len = webStorage.length;
				for (let i = 0; i < len; i++) {
					key = webStorage.key(i);
					result[key] = get(key);
				}
				return result;
			},
			getAllKeys: () => {
				const result = [], len = webStorage.length;
				for (let i = 0; i < len; i++) result.push(webStorage.key(i));
				return result;
			},
			set: setItem,
			setItem,
			remove: removeItem,
			removeItem,
			clear: () => {
				webStorage.clear();
				notifyAll();
			},
			isEmpty: () => webStorage.length === 0,
			useStorage
		};
	}
	({ ...!client.has.webStorage ? getEmptyStorage() : getStorage("local") });
	({ ...!client.has.webStorage ? getEmptyStorage() : getStorage("session") });
	function ssrDebounceFn() {}
	ssrDebounceFn.cancel = noop;
	ssrDebounceFn.flush = noop;
	ssrDebounceFn.isPending = false;
	client.is.mac;
	function ssrThrottleFn() {}
	ssrThrottleFn.cancel = noop;
	ssrThrottleFn.flush = noop;
	var Quasar = {
		version: "2.34.0",
		install: install_quasar_default,
		lang: Plugin$7,
		iconSet: Plugin$6
	};
	//#endregion
	//#region node_modules/@quasar/extras/material-icons/index.mjs
	var matAccessTime = "M0 0h24v24H0z@@fill:none;&&M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z&&M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z";
	var matAdd = "M0 0h24v24H0z@@fill:none;&&M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z";
	var matAddBox = "M0 0h24v24H0z@@fill:none;&&M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z";
	var matArrowBack = "M0 0h24v24H0z@@fill:none;&&M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z";
	var matArrowDownward = "M0 0h24v24H0V0z@@fill:none;&&M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z";
	var matArrowDropDown = "M0 0h24v24H0z@@fill:none;&&M7 10l5 5 5-5z";
	var matArrowForward = "M0 0h24v24H0z@@fill:none;&&M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z";
	var matArrowUpward = "M0 0h24v24H0V0z@@fill:none;&&M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z";
	var matCancel = "M0 0h24v24H0z@@fill:none;&&M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z";
	var matCheck = "M0 0h24v24H0z@@fill:none;&&M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z";
	var matCheckCircle = "M0 0h24v24H0z@@fill:none;&&M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";
	var matChevronLeft = "M0 0h24v24H0z@@fill:none;&&M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z";
	var matChevronRight = "M0 0h24v24H0z@@fill:none;&&M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z";
	var matClear = "M0 0h24v24H0z@@fill:none;&&M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";
	var matClearAll = "M0 0h24v24H0z@@fill:none;&&M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z";
	var matClose = "M0 0h24v24H0z@@fill:none;&&M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";
	var matCloudUpload = "M0 0h24v24H0z@@fill:none;&&M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z";
	var matCode = "M0 0h24v24H0V0z@@fill:none;&&M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z";
	var matDelete = "M0 0h24v24H0z@@fill:none;&&M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z";
	var matDone = "M0 0h24v24H0z@@fill:none;&&M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z";
	var matDoneAll = "M0 0h24v24H0z@@fill:none;&&M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z";
	var matEdit = "M0 0h24v24H0z@@fill:none;&&M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z";
	var matError = "M0 0h24v24H0z@@fill:none;&&M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z";
	var matEvent = "M0 0h24v24H0z@@fill:none;&&M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z";
	var matFirstPage = "M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z&&M24 24H0V0h24v24z@@fill:none;";
	var matFontDownload = "M0 0h24v24H0V0z@@fill:none;&&M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z";
	var matFormatAlignCenter = "M0 0h24v24H0z@@fill:none;&&M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z";
	var matFormatAlignJustify = "M0 0h24v24H0z@@fill:none;&&M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z";
	var matFormatAlignLeft = "M0 0h24v24H0z@@fill:none;&&M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z";
	var matFormatAlignRight = "M0 0h24v24H0z@@fill:none;&&M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z";
	var matFormatBold = "M0 0h24v24H0z@@fill:none;&&M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z";
	var matFormatClear = "M0 0h24v24H0z@@fill:none;&&M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z";
	var matFormatIndentDecrease = "M0 0h24v24H0z@@fill:none;&&M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z";
	var matFormatIndentIncrease = "M0 0h24v24H0z@@fill:none;&&M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z";
	var matFormatItalic = "M0 0h24v24H0z@@fill:none;&&M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z";
	var matFormatListBulleted = "M0 0h24v24H0V0z@@fill:none;&&M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z";
	var matFormatListNumbered = "M0 0h24v24H0z@@fill:none;&&M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z";
	var matFormatQuote = "M0 0h24v24H0z@@fill:none;&&M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z";
	var matFormatSize = "M0 0h24v24H0z@@fill:none;&&M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z";
	var matFormatUnderlined = "M0 0h24v24H0z@@fill:none;&&M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z";
	var matFullscreen = "M0 0h24v24H0z@@fill:none;&&M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z";
	var matGrade = "M0 0h24v24H0z@@fill:none;&&M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
	var matGradient = "M0 0h24v24H0z@@fill:none;&&M11 9h2v2h-2zm-2 2h2v2H9zm4 0h2v2h-2zm2-2h2v2h-2zM7 9h2v2H7zm12-6H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm2-7h-2v2h2v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5V5h14v6z";
	var matInfo = "M0 0h24v24H0z@@fill:none;&&M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z";
	var matKeyboardArrowDown = "M0 0h24v24H0V0z@@fill:none;&&M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z";
	var matKeyboardArrowLeft = "M0 0h24v24H0V0z@@fill:none;&&M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z";
	var matKeyboardArrowRight = "M0 0h24v24H0V0z@@fill:none;&&M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z";
	var matKeyboardArrowUp = "M0 0h24v24H0z@@fill:none;&&M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z";
	var matLastPage = "M0 0h24v24H0V0z@@fill:none;&&M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z";
	var matLens = "M0 0h24v24H0z@@fill:none;&&M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z";
	var matLink = "M0 0h24v24H0z@@fill:none;&&M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z";
	var matList = "M0 0h24v24H0z@@fill:none;&&M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z";
	var matPlayArrow = "M0 0h24v24H0z@@fill:none;&&M8 5v14l11-7z";
	var matPrint = "M0 0h24v24H0z@@fill:none;&&M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z";
	var matPriorityHigh = "M0 0h24v24H0z@@fill:none;&&M12 19 m-2, 0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0&&M10 3h4v12h-4z";
	var matRedo = "M0 0h24v24H0z@@fill:none;&&M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z";
	var matRefresh = "M0 0h24v24H0z@@fill:none;&&M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z";
	var matRemove = "M0 0h24v24H0z@@fill:none;&&M19 13H5v-2h14v2z";
	var matStrikethroughS = "M0 0 H24 V24 H0 V0 z@@fill:none;&&M6.85,7.08C6.85,4.37,9.45,3,12.24,3c1.64,0,3,0.49,3.9,1.28c0.77,0.65,1.46,1.73,1.46,3.24h-3.01 c0-0.31-0.05-0.59-0.15-0.85c-0.29-0.86-1.2-1.28-2.25-1.28c-1.86,0-2.34,1.02-2.34,1.7c0,0.48,0.25,0.88,0.74,1.21 C10.97,8.55,11.36,8.78,12,9H7.39C7.18,8.66,6.85,8.11,6.85,7.08z M21,12v-2H3v2h9.62c1.15,0.45,1.96,0.75,1.96,1.97 c0,1-0.81,1.67-2.28,1.67c-1.54,0-2.93-0.54-2.93-2.51H6.4c0,0.55,0.08,1.13,0.24,1.58c0.81,2.29,3.29,3.3,5.67,3.3 c2.27,0,5.3-0.89,5.3-4.05c0-0.3-0.01-1.16-0.48-1.94H21V12z";
	var matStyle = "M0 0h24v24H0z@@fill:none;&&M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61zm19.5-3.7L17.07 3.98c-.31-.75-1.04-1.21-1.81-1.23-.26 0-.53.04-.79.15L7.1 5.95c-.75.31-1.21 1.03-1.23 1.8-.01.27.04.54.15.8l4.96 11.97c.31.76 1.05 1.22 1.83 1.23.26 0 .52-.05.77-.15l7.36-3.05c1.02-.42 1.51-1.59 1.09-2.6zM7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2 11c0 1.1.9 2 2 2h1.45l-3.45-8.34v6.34z";
	var matTextFormat = "M0 0h24v24H0z@@fill:none;&&M5 17v2h14v-2H5zm4.5-4.2h5l.9 2.2h2.1L12.75 4h-1.5L6.5 15h2.1l.9-2.2zM12 5.98L13.87 11h-3.74L12 5.98z";
	var matToday = "M0 0h24v24H0z@@fill:none;&&M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z";
	var matTune = "M0 0h24v24H0z@@fill:none;&&M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z";
	var matUndo = "M0 0h24v24H0z@@fill:none;&&M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z";
	var matVerticalAlignBottom = "M0 0h24v24H0z@@fill:none;&&M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z";
	var matVerticalAlignTop = "M0 0h24v24H0z@@fill:none;&&M8 11h3v10h2V11h3l-4-4-4 4zM4 3v2h16V3H4z";
	var matWarning = "M0 0h24v24H0z@@fill:none;&&M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z";
	//#endregion
	//#region node_modules/quasar/icon-set/svg-material-icons.js
	var svg_material_icons_default = {
		name: "svg-material-icons",
		type: {
			positive: matCheckCircle,
			negative: matWarning,
			info: matInfo,
			warning: matPriorityHigh
		},
		arrow: {
			up: matArrowUpward,
			right: matArrowForward,
			down: matArrowDownward,
			left: matArrowBack,
			dropdown: matArrowDropDown
		},
		chevron: {
			left: matChevronLeft,
			right: matChevronRight
		},
		colorPicker: {
			spectrum: matGradient,
			tune: matTune,
			palette: matStyle
		},
		pullToRefresh: { icon: matRefresh },
		carousel: {
			left: matChevronLeft,
			right: matChevronRight,
			up: matKeyboardArrowUp,
			down: matKeyboardArrowDown,
			navigationIcon: matLens
		},
		chip: {
			remove: matCancel,
			selected: matCheck
		},
		datetime: {
			arrowLeft: matChevronLeft,
			arrowRight: matChevronRight,
			now: matAccessTime,
			today: matToday
		},
		editor: {
			bold: matFormatBold,
			italic: matFormatItalic,
			strikethrough: matStrikethroughS,
			underline: matFormatUnderlined,
			unorderedList: matFormatListBulleted,
			orderedList: matFormatListNumbered,
			subscript: matVerticalAlignBottom,
			superscript: matVerticalAlignTop,
			hyperlink: matLink,
			toggleFullscreen: matFullscreen,
			quote: matFormatQuote,
			left: matFormatAlignLeft,
			center: matFormatAlignCenter,
			right: matFormatAlignRight,
			justify: matFormatAlignJustify,
			print: matPrint,
			outdent: matFormatIndentDecrease,
			indent: matFormatIndentIncrease,
			removeFormat: matFormatClear,
			formatting: matTextFormat,
			fontSize: matFormatSize,
			align: matFormatAlignLeft,
			hr: matRemove,
			undo: matUndo,
			redo: matRedo,
			heading: matFormatSize,
			code: matCode,
			size: matFormatSize,
			font: matFontDownload,
			viewSource: matCode
		},
		expansionItem: {
			icon: matKeyboardArrowDown,
			denseIcon: matArrowDropDown
		},
		fab: {
			icon: matAdd,
			activeIcon: matClose
		},
		field: {
			clear: matCancel,
			error: matError
		},
		pagination: {
			first: matFirstPage,
			prev: matKeyboardArrowLeft,
			next: matKeyboardArrowRight,
			last: matLastPage
		},
		rating: { icon: matGrade },
		stepper: {
			done: matCheck,
			active: matEdit,
			error: matWarning
		},
		tabs: {
			left: matChevronLeft,
			right: matChevronRight,
			up: matKeyboardArrowUp,
			down: matKeyboardArrowDown
		},
		table: {
			arrowUp: matArrowUpward,
			warning: matWarning,
			firstPage: matFirstPage,
			prevPage: matChevronLeft,
			nextPage: matChevronRight,
			lastPage: matLastPage
		},
		tree: { icon: matPlayArrow },
		uploader: {
			done: matDone,
			clear: matClear,
			add: matAddBox,
			upload: matCloudUpload,
			removeQueue: matClearAll,
			removeUploaded: matDoneAll
		}
	};
	//#endregion
	//#region src/api.js
	/**
	* Requests to the CRUD server: same protocol as the jTable renderer
	* (form-encoded POST, jTable-style JSON answers).
	*/
	var CrudError = class extends Error {
		constructor(message, errors) {
			super(message);
			this.errors = errors || {};
		}
	};
	function encode(params) {
		const body = new URLSearchParams();
		Object.keys(params).forEach((name) => {
			const value = params[name];
			if (value !== void 0 && value !== null) body.append(name, value);
		});
		return body;
	}
	/**
	* @returns {Promise<object>} the payload when Result is OK (or the raw array for autocomplete)
	*/
	async function post(url, params, communicationError) {
		let response;
		try {
			response = await fetch(url, {
				method: "POST",
				credentials: "same-origin",
				headers: { "X-Requested-With": "XMLHttpRequest" },
				body: encode(params || {})
			});
		} catch (e) {
			throw new CrudError(communicationError);
		}
		let payload;
		try {
			payload = await response.json();
		} catch (e) {
			throw new CrudError(communicationError);
		}
		if (Array.isArray(payload)) return payload;
		if (!payload || payload.Result !== "OK") throw new CrudError(payload && payload.Message ? payload.Message : communicationError, payload && payload.Errors);
		return payload;
	}
	//#endregion
	//#region \0plugin-vue:export-helper
	var _plugin_vue_export_helper_default = (sfc, props) => {
		const target = sfc.__vccOpts || sfc;
		for (const [key, val] of props) target[key] = val;
		return target;
	};
	//#endregion
	//#region src/LookupSelect.vue
	/**
	* Search box of an autocomplete field: shows the text, keeps the value (code).
	*/
	var _sfc_main$3 = {
		__name: "LookupSelect",
		props: {
			modelValue: {
				type: [String, Number],
				default: ""
			},
			initialText: {
				type: String,
				default: ""
			},
			url: {
				type: String,
				required: true
			},
			label: {
				type: String,
				default: ""
			},
			rules: {
				type: Array,
				default: () => []
			},
			error: {
				type: Boolean,
				default: null
			},
			errorMessage: {
				type: String,
				default: void 0
			},
			dense: {
				type: Boolean,
				default: false
			},
			outlined: {
				type: Boolean,
				default: false
			},
			noResults: {
				type: String,
				default: "—"
			},
			communicationError: {
				type: String,
				default: "Error"
			},
			requestParams: {
				type: Object,
				default: () => ({})
			},
			dependencyContext: {
				type: Object,
				default: null
			},
			dependencyReady: {
				type: Boolean,
				default: true
			}
		},
		emits: ["update:modelValue"],
		setup(__props, { expose: __expose, emit: __emit }) {
			__expose();
			const props = __props;
			const emit = __emit;
			const selectedText = /* @__PURE__ */ ref(props.initialText);
			function initialOptions() {
				return props.modelValue !== "" && props.modelValue !== null && props.modelValue !== void 0 ? [{
					value: props.modelValue,
					label: selectedText.value || String(props.modelValue)
				}] : [];
			}
			const options = /* @__PURE__ */ ref(initialOptions());
			const contextKey = computed(() => JSON.stringify(props.dependencyContext));
			let generation = 0;
			let pendingAbort = null;
			watch(contextKey, () => {
				generation++;
				if (pendingAbort) pendingAbort();
				pendingAbort = null;
				selectedText.value = "";
				options.value = [];
			});
			onBeforeUnmount(() => {
				generation++;
			});
			watch(() => props.initialText, (text) => {
				selectedText.value = text;
				options.value = initialOptions();
			});
			function select(value) {
				const option = options.value.find((item) => item.value === value);
				selectedText.value = option ? option.label : "";
				emit("update:modelValue", value === null ? "" : value);
			}
			async function search(term, update, abort) {
				const version = ++generation;
				const context = contextKey.value;
				pendingAbort = abort;
				if (!props.dependencyReady) {
					update(() => {
						options.value = [];
					});
					return;
				}
				if (!term) {
					update(() => {
						options.value = initialOptions();
					});
					return;
				}
				try {
					const params = {
						...props.requestParams,
						term
					};
					if (props.dependencyContext) params.lookup_context = context;
					const items = await post(props.url, params, props.communicationError);
					if (version !== generation || context !== contextKey.value) return;
					pendingAbort = null;
					update(() => {
						options.value = items.map((item) => ({
							value: item.id,
							label: item.label,
							caption: item.caption || ""
						}));
					});
				} catch (e) {
					if (version === generation && context === contextKey.value) {
						pendingAbort = null;
						abort();
					}
				}
			}
			const __returned__ = {
				props,
				emit,
				selectedText,
				initialOptions,
				options,
				contextKey,
				get generation() {
					return generation;
				},
				set generation(v) {
					generation = v;
				},
				get pendingAbort() {
					return pendingAbort;
				},
				set pendingAbort(v) {
					pendingAbort = v;
				},
				select,
				search,
				computed,
				onBeforeUnmount,
				ref,
				watch,
				get QSelect() {
					return QSelect_default;
				},
				get QItem() {
					return QItem_default;
				},
				get QItemLabel() {
					return QItemLabel_default;
				},
				get QItemSection() {
					return QItemSection_default;
				},
				get QSpinner() {
					return QSpinner_default;
				},
				get post() {
					return post;
				}
			};
			Object.defineProperty(__returned__, "__isScriptSetup", {
				enumerable: false,
				value: true
			});
			return __returned__;
		}
	};
	function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
		return openBlock(), createBlock($setup["QSelect"], {
			key: $setup.contextKey,
			"model-value": $props.modelValue,
			options: $setup.options,
			label: $props.label,
			rules: $props.rules,
			error: $props.error,
			"error-message": $props.errorMessage,
			dense: $props.dense,
			outlined: $props.outlined,
			disable: !$props.dependencyReady,
			"use-input": "",
			"input-debounce": "300",
			"emit-value": "",
			"map-options": "",
			clearable: "",
			"hide-dropdown-icon": "",
			autocomplete: "off",
			onFilter: $setup.search,
			"onUpdate:modelValue": $setup.select
		}, {
			loading: withCtx(() => [createVNode($setup["QSpinner"], {
				color: "primary",
				size: "1.2em"
			})]),
			option: withCtx((scope) => [createVNode($setup["QItem"], normalizeProps(guardReactiveProps(scope.itemProps)), {
				default: withCtx(() => [createVNode($setup["QItemSection"], null, {
					default: withCtx(() => [createVNode($setup["QItemLabel"], null, {
						default: withCtx(() => [createTextVNode(toDisplayString(scope.opt.label), 1)]),
						_: 2
					}, 1024), scope.opt.caption ? (openBlock(), createBlock($setup["QItemLabel"], {
						key: 0,
						caption: ""
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(scope.opt.caption), 1)]),
						_: 2
					}, 1024)) : createCommentVNode("", true)]),
					_: 2
				}, 1024)]),
				_: 2
			}, 1040)]),
			"no-option": withCtx(() => [createVNode($setup["QItem"], null, {
				default: withCtx(() => [createVNode($setup["QItemSection"], { class: "text-grey" }, {
					default: withCtx(() => [createTextVNode(toDisplayString($props.noResults), 1)]),
					_: 1
				})]),
				_: 1
			})]),
			_: 1
		}, 8, [
			"model-value",
			"options",
			"label",
			"rules",
			"error",
			"error-message",
			"dense",
			"outlined",
			"disable"
		]);
	}
	var LookupSelect_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$3, [["render", _sfc_render$3], ["__file", "LookupSelect.vue"]]);
	//#endregion
	//#region src/rules.js
	/**
	* Same validation rules as the server (Validator.php) and the jTable renderer.
	*/
	function format(text, value) {
		return String(text).replace("{value}", value === void 0 || value === null ? "" : value);
	}
	function isNumeric(text) {
		return text !== "" && !isNaN(text) && isFinite(text);
	}
	/**
	* @returns {string|null} first error message or null
	*/
	function ruleError(rules, value, texts) {
		const text = value === void 0 || value === null ? "" : String(value).trim();
		if (text === "") return rules.required ? texts["rule.required"] : null;
		if (rules.minLength !== void 0 && text.length < rules.minLength) return format(texts["rule.minLength"], rules.minLength);
		if (rules.maxLength !== void 0 && text.length > rules.maxLength) return format(texts["rule.maxLength"], rules.maxLength);
		if (rules.numeric && !isNumeric(text)) return texts["rule.numeric"];
		if (rules.integer && !/^-?\d+$/.test(text)) return texts["rule.integer"];
		if (rules.min !== void 0 && isNumeric(text) && parseFloat(text) < rules.min) return format(texts["rule.min"], rules.min);
		if (rules.max !== void 0 && isNumeric(text) && parseFloat(text) > rules.max) return format(texts["rule.max"], rules.max);
		if (rules.pattern !== void 0 && !new RegExp(rules.pattern).test(text)) return texts["rule.pattern"];
		if (rules.in !== void 0 && !rules.in.map(String).includes(text)) return format(texts["rule.in"], rules.in.join(", "));
		return null;
	}
	/**
	* Quasar "rules" prop for a field.
	*/
	function quasarRules(rules, texts) {
		return [(value) => ruleError(rules || {}, value, texts) || true];
	}
	//#endregion
	//#region src/lookupDependencies.js
	function lookupContext(field, fields, values) {
		if (!field.dependsOn) return null;
		const context = Object.create(null), visited = /* @__PURE__ */ new Set([field.name]);
		let parent = field.dependsOn;
		while (parent && !visited.has(parent)) {
			visited.add(parent);
			context[parent] = values[parent] ?? null;
			parent = fields.find((item) => item.name === parent)?.dependsOn;
		}
		return context;
	}
	function dependenciesReady(context) {
		return !context || Object.values(context).every((value) => value !== "" && value !== null && value !== void 0);
	}
	function clearDependentValues(name, fields, values) {
		const cleared = [], visited = /* @__PURE__ */ new Set([name]);
		function clear(parent) {
			for (const field of fields) if (field.dependsOn === parent && !visited.has(field.name)) {
				visited.add(field.name);
				values[field.name] = "";
				cleared.push(field.name);
				clear(field.name);
			}
		}
		clear(name);
		return cleared;
	}
	//#endregion
	//#region src/FieldInput.vue
	/**
	* Form input of a field, by type.
	*/
	var _sfc_main$2 = {
		__name: "FieldInput",
		props: {
			field: {
				type: Object,
				required: true
			},
			modelValue: {
				type: [
					String,
					Number,
					Boolean
				],
				default: ""
			},
			initialText: {
				type: String,
				default: ""
			},
			texts: {
				type: Object,
				required: true
			},
			error: {
				type: String,
				default: ""
			},
			readonly: {
				type: Boolean,
				default: false
			},
			requestParams: {
				type: Object,
				default: () => ({})
			},
			formValues: {
				type: Object,
				default: () => ({})
			},
			allFields: {
				type: Array,
				default: () => []
			}
		},
		emits: ["update:modelValue"],
		setup(__props, { expose: __expose, emit: __emit }) {
			__expose();
			const props = __props;
			const emit = __emit;
			const calendarIcon = matEvent;
			const dependencyContext = computed(() => lookupContext(props.field, props.allFields, props.formValues));
			const dependencyReady = computed(() => dependenciesReady(dependencyContext.value));
			const rules = computed(() => quasarRules(props.field.rules, props.texts));
			const inputType = computed(() => ({
				textarea: "textarea",
				password: "password"
			})[props.field.type] || "text");
			const selectOptions = computed(() => (props.field.options || []).map((option) => ({
				value: String(option.value),
				label: option.label
			})));
			const selectValue = computed(() => {
				if (props.modelValue === null || props.modelValue === void 0) return null;
				if (props.modelValue === "" && !selectOptions.value.some((option) => option.value === "")) return null;
				return String(props.modelValue);
			});
			const uncheckedValue = computed(() => props.field.options && props.field.options[0] ? props.field.options[0].value : 0);
			const checkedValue = computed(() => props.field.options && props.field.options[1] ? props.field.options[1].value : 1);
			function update(value) {
				emit("update:modelValue", value === null ? "" : value);
			}
			const __returned__ = {
				props,
				emit,
				calendarIcon,
				dependencyContext,
				dependencyReady,
				rules,
				inputType,
				selectOptions,
				selectValue,
				uncheckedValue,
				checkedValue,
				update,
				computed,
				get QInput() {
					return QInput_default;
				},
				get QSelect() {
					return QSelect_default;
				},
				get QToggle() {
					return QToggle_default;
				},
				get QIcon() {
					return QIcon_default;
				},
				get QPopupProxy() {
					return QPopupProxy_default;
				},
				get QDate() {
					return QDate_default;
				},
				get matEvent() {
					return matEvent;
				},
				LookupSelect: LookupSelect_default,
				get quasarRules() {
					return quasarRules;
				},
				get lookupContext() {
					return lookupContext;
				},
				get dependenciesReady() {
					return dependenciesReady;
				}
			};
			Object.defineProperty(__returned__, "__isScriptSetup", {
				enumerable: false,
				value: true
			});
			return __returned__;
		}
	};
	function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
		return $props.field.type === "autocomplete" ? (openBlock(), createBlock($setup["LookupSelect"], {
			key: 0,
			readonly: $props.readonly,
			"model-value": $props.modelValue,
			"initial-text": $props.initialText,
			url: $props.field.autocompleteUrl,
			"request-params": $props.requestParams,
			"dependency-context": $setup.dependencyContext,
			"dependency-ready": $setup.dependencyReady,
			label: $props.field.title,
			rules: $setup.rules,
			error: !!$props.error,
			"error-message": $props.error,
			"no-results": $props.texts.noDataAvailable,
			"communication-error": $props.texts.serverCommunicationError,
			outlined: "",
			"onUpdate:modelValue": $setup.update
		}, null, 8, [
			"readonly",
			"model-value",
			"initial-text",
			"url",
			"request-params",
			"dependency-context",
			"dependency-ready",
			"label",
			"rules",
			"error",
			"error-message",
			"no-results",
			"communication-error"
		])) : $props.field.type === "select" ? (openBlock(), createBlock($setup["QSelect"], {
			key: 1,
			readonly: $props.readonly,
			"model-value": $setup.selectValue,
			options: $setup.selectOptions,
			label: $props.field.title,
			rules: $setup.rules,
			error: !!$props.error,
			"error-message": $props.error,
			"emit-value": "",
			"map-options": "",
			outlined: "",
			"onUpdate:modelValue": $setup.update
		}, null, 8, [
			"readonly",
			"model-value",
			"options",
			"label",
			"rules",
			"error",
			"error-message"
		])) : $props.field.type === "checkbox" ? (openBlock(), createBlock($setup["QToggle"], {
			key: 2,
			disable: $props.readonly,
			"model-value": String($props.modelValue),
			"true-value": String($setup.checkedValue),
			"false-value": String($setup.uncheckedValue),
			label: $props.field.title,
			"onUpdate:modelValue": $setup.update
		}, null, 8, [
			"disable",
			"model-value",
			"true-value",
			"false-value",
			"label"
		])) : $props.field.type === "date" ? (openBlock(), createBlock($setup["QInput"], {
			key: 3,
			readonly: $props.readonly,
			autocomplete: "off",
			"model-value": $props.modelValue,
			label: $props.field.title,
			rules: $setup.rules,
			error: !!$props.error,
			"error-message": $props.error,
			mask: "####-##-##",
			outlined: "",
			"onUpdate:modelValue": $setup.update
		}, {
			append: withCtx(() => [createVNode($setup["QIcon"], {
				name: $setup.calendarIcon,
				class: "cursor-pointer"
			}, {
				default: withCtx(() => [createVNode($setup["QPopupProxy"], {
					cover: "",
					"transition-show": "scale",
					"transition-hide": "scale"
				}, {
					default: withCtx(() => [createVNode($setup["QDate"], {
						"model-value": $props.modelValue,
						mask: "YYYY-MM-DD",
						minimal: "",
						"onUpdate:modelValue": $setup.update
					}, null, 8, ["model-value"])]),
					_: 1
				})]),
				_: 1
			}, 8, ["name"])]),
			_: 1
		}, 8, [
			"readonly",
			"model-value",
			"label",
			"rules",
			"error",
			"error-message"
		])) : (openBlock(), createBlock($setup["QInput"], {
			key: 4,
			readonly: $props.readonly,
			autocomplete: "off",
			"model-value": $props.modelValue,
			label: $props.field.title,
			type: $setup.inputType,
			rules: $setup.rules,
			error: !!$props.error,
			"error-message": $props.error,
			autogrow: $props.field.type === "textarea",
			outlined: "",
			"onUpdate:modelValue": $setup.update
		}, null, 8, [
			"readonly",
			"model-value",
			"label",
			"type",
			"rules",
			"error",
			"error-message",
			"autogrow"
		]));
	}
	var FieldInput_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$2, [["render", _sfc_render$2], ["__file", "FieldInput.vue"]]);
	//#endregion
	//#region src/SuggestInput.vue
	/**
	* Free-text filter that suggests the values already stored (Field::suggestions()): what is
	* typed is the filter, picking a suggestion only fills it in. A suggestion may bring a second
	* line (caption) that tells apart records with the same value.
	*/
	var _sfc_main$1 = {
		__name: "SuggestInput",
		props: {
			modelValue: {
				type: [String, Number],
				default: ""
			},
			url: {
				type: String,
				required: true
			},
			requestParams: {
				type: Object,
				default: () => ({})
			},
			label: {
				type: String,
				default: ""
			},
			dense: {
				type: Boolean,
				default: false
			},
			outlined: {
				type: Boolean,
				default: false
			},
			communicationError: {
				type: String,
				default: "Error"
			}
		},
		emits: ["update:modelValue"],
		setup(__props, { expose: __expose, emit: __emit }) {
			__expose();
			const props = __props;
			const emit = __emit;
			const options = /* @__PURE__ */ ref([]);
			function type(text) {
				emit("update:modelValue", text || "");
			}
			function select(option) {
				emit("update:modelValue", option === null || option === void 0 ? "" : typeof option === "object" ? option.value : option);
			}
			async function search(term, update, abort) {
				if (!term) {
					update(() => {
						options.value = [];
					});
					return;
				}
				try {
					const items = await post(props.url, {
						...props.requestParams,
						term
					}, props.communicationError);
					update(() => {
						options.value = items.map((item, index) => ({
							key: index,
							value: item.value,
							label: item.label,
							caption: item.caption || ""
						}));
					});
				} catch (e) {
					abort();
				}
			}
			const __returned__ = {
				props,
				emit,
				options,
				type,
				select,
				search,
				ref,
				get QItem() {
					return QItem_default;
				},
				get QItemLabel() {
					return QItemLabel_default;
				},
				get QItemSection() {
					return QItemSection_default;
				},
				get QSelect() {
					return QSelect_default;
				},
				get QSpinner() {
					return QSpinner_default;
				},
				get post() {
					return post;
				}
			};
			Object.defineProperty(__returned__, "__isScriptSetup", {
				enumerable: false,
				value: true
			});
			return __returned__;
		}
	};
	function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
		return openBlock(), createBlock($setup["QSelect"], {
			"model-value": $props.modelValue || null,
			options: $setup.options,
			"option-value": "key",
			"option-label": "label",
			label: $props.label,
			dense: $props.dense,
			outlined: $props.outlined,
			"use-input": "",
			"fill-input": "",
			"hide-selected": "",
			"hide-dropdown-icon": "",
			"input-debounce": "300",
			clearable: "",
			autocomplete: "off",
			onFilter: $setup.search,
			onInputValue: $setup.type,
			"onUpdate:modelValue": $setup.select
		}, {
			option: withCtx((scope) => [createVNode($setup["QItem"], normalizeProps(guardReactiveProps(scope.itemProps)), {
				default: withCtx(() => [createVNode($setup["QItemSection"], null, {
					default: withCtx(() => [createVNode($setup["QItemLabel"], null, {
						default: withCtx(() => [createTextVNode(toDisplayString(scope.opt.label), 1)]),
						_: 2
					}, 1024), scope.opt.caption ? (openBlock(), createBlock($setup["QItemLabel"], {
						key: 0,
						caption: ""
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(scope.opt.caption), 1)]),
						_: 2
					}, 1024)) : createCommentVNode("", true)]),
					_: 2
				}, 1024)]),
				_: 2
			}, 1040)]),
			loading: withCtx(() => [createVNode($setup["QSpinner"], {
				color: "primary",
				size: "1.2em"
			})]),
			_: 1
		}, 8, [
			"model-value",
			"options",
			"label",
			"dense",
			"outlined"
		]);
	}
	var SuggestInput_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$1, [["render", _sfc_render$1], ["__file", "SuggestInput.vue"]]);
	//#endregion
	//#region src/createSequence.js
	/** Current wall clock in the configured business timezone, independently of the browser's timezone. */
	function sequenceNow(timeZone = "UTC", date = /* @__PURE__ */ new Date()) {
		const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hourCycle: "h23"
		}).formatToParts(date).map(({ type, value }) => [type, value]));
		return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
	}
	function sequenceRange(values, options) {
		const total = Number(values[options.totalField]);
		const start = Number(values[options.incrementField]);
		const max = options.maxValue || Number.MAX_SAFE_INTEGER;
		const end = options.totalIsLastNumber ? total : start + total - 1;
		return Number.isSafeInteger(total) && total > 0 && Number.isSafeInteger(start) && start > 0 && end >= start && end <= max ? {
			total,
			start,
			end
		} : null;
	}
	//#endregion
	//#region src/CrudTable.vue
	var _sfc_main = /*@__PURE__*/ Object.assign({
		name: "CrudTable",
		directives: { ClosePopup: ClosePopup_default }
	}, {
		__name: "CrudTable",
		props: {
			schema: {
				type: Object,
				required: true
			},
			/** link values sent by the parent row (child tables) */
			fixedFilters: {
				type: Object,
				default: () => ({})
			},
			nested: {
				type: Boolean,
				default: false
			}
		},
		emits: ["close"],
		setup(__props, { expose: __expose }) {
			const props = __props;
			const $q = useQuasar();
			const formEpoch = /* @__PURE__ */ ref(0);
			const icons = {
				add: matAdd,
				close: matClose,
				delete: matDelete,
				edit: matEdit,
				list: matList,
				refresh: matRefresh
			};
			const texts = props.schema.texts;
			const urls = props.schema.urls;
			const requestParams = props.schema.requestParams || {};
			const selectionActions = props.schema.selectionActions || [];
			const canSelect = computed(() => props.schema.selection && (urls.delete || selectionActions.length > 0));
			const selectionBusy = /* @__PURE__ */ ref(false);
			const selectionProgress = /* @__PURE__ */ ref(null);
			const selectionCounts = computed(() => {
				const items = selectionProgress.value?.items || [];
				const success = items.filter((item) => item.status === "success").length;
				const error = items.filter((item) => item.status === "error").length;
				return {
					success,
					error,
					processed: success + error,
					current: items.find((item) => item.status === "running")
				};
			});
			const fields = props.schema.fields;
			const keyFields = fields.filter((field) => field.key).map((field) => field.name);
			const rowKey = keyFields.length === 1 ? keyFields[0] : "__rowId";
			const rows = /* @__PURE__ */ ref([]);
			const selected = /* @__PURE__ */ ref([]);
			const loading = /* @__PURE__ */ ref(false);
			const visible = /* @__PURE__ */ ref(props.nested || props.schema.loadOnStart);
			const pagination = /* @__PURE__ */ ref({
				page: 1,
				rowsPerPage: props.schema.pageSize,
				sortBy: props.schema.sortBy || null,
				descending: !!props.schema.descending,
				rowsNumber: 0
			});
			const filters = /* @__PURE__ */ reactive({});
			const appliedFilters = /* @__PURE__ */ ref({});
			const openChildren = /* @__PURE__ */ reactive({});
			const formRef = /* @__PURE__ */ ref(null);
			const rootRef = /* @__PURE__ */ ref(null);
			const visibleWidth = /* @__PURE__ */ ref(0);
			let resizeObserver = null;
			let refreshTimer = null;
			let refreshErrorShown = false;
			const childPanelStyle = computed(() => visibleWidth.value > 0 ? { width: `${visibleWidth.value - 34}px` } : {});
			const form = /* @__PURE__ */ reactive({
				open: false,
				record: null,
				values: {},
				errors: {},
				saving: false,
				completed: 0,
				sequenceTotal: 0,
				sequenceStart: 0,
				sequenceCommon: {}
			});
			const sequence = props.schema.createSequence || null;
			const sequenceProgress = computed(() => {
				const total = form.sequenceTotal || Number(sequence && form.values[sequence.totalField]);
				const current = sequence && sequence.totalIsLastNumber ? form.sequenceStart ? form.sequenceStart + form.completed : Number(form.values[sequence.incrementField]) || 1 : form.completed + 1;
				return total > 0 ? String(sequence.progressLabel || "Record {current} of {total}").replace("{current}", String(Math.min(current, total))).replace("{total}", String(total)) : "";
			});
			function sequenceReadonly(name) {
				return Boolean(!form.record && sequence && form.completed > 0 && [
					sequence.totalField,
					sequence.incrementField,
					...sequence.commonFields || []
				].includes(name));
			}
			const filterFields = computed(() => props.nested ? [] : fields.filter((field) => field.filter));
			const formFields = computed(() => fields.filter((field) => (form.record ? field.edit : field.create) && field.type !== "hidden"));
			const columns = computed(() => {
				const list = fields.filter((field) => field.list).map((field) => ({
					name: field.name,
					label: field.title,
					field,
					align: "left",
					sortable: field.sortable,
					style: field.width ? `width: ${field.width}` : void 0,
					headerStyle: field.width ? `width: ${field.width}` : void 0
				}));
				if (props.schema.children.length > 0) list.unshift({
					name: "__children",
					label: "",
					field: {},
					align: "center",
					style: "width: 1%; white-space: nowrap"
				});
				if (urls.update || urls.delete) list.push({
					name: "__actions",
					label: "",
					field: {},
					align: "center",
					style: "width: 1%"
				});
				return list;
			});
			function paginationLabel(first, last, total) {
				return String(texts.pagingInfo || "{0}-{1} / {2}").replace("{0}", first).replace("{1}", last).replace("{2}", total);
			}
			function notifyError(error) {
				$q.notify({
					type: "negative",
					message: error instanceof CrudError ? error.message : texts.serverCommunicationError,
					position: "top"
				});
			}
			function cellText(field, row) {
				const value = row[field.name];
				if (field.textField && row[field.textField] !== void 0 && row[field.textField] !== null && row[field.textField] !== "") return row[field.textField];
				if (field.options) {
					const option = field.options.find((item) => String(item.value) === String(value));
					if (option) return option.label;
				}
				return value === null || value === void 0 ? "" : value;
			}
			let lastRequest = 0;
			async function onRequest(request) {
				const { page, rowsPerPage, sortBy, descending } = request.pagination;
				const current = ++lastRequest;
				loading.value = true;
				try {
					const params = Object.assign({}, requestParams, appliedFilters.value, props.fixedFilters, {
						jtStartIndex: (page - 1) * rowsPerPage,
						jtPageSize: rowsPerPage,
						jtSorting: sortBy ? `${sortBy} ${descending ? "DESC" : "ASC"}` : ""
					});
					const payload = await post(urls.list, params, texts.serverCommunicationError);
					if (current !== lastRequest) return;
					rows.value = payload.Records.map((record, index) => Object.assign({ __rowId: `${page}-${index}` }, record));
					refreshErrorShown = false;
					selected.value = [];
					pagination.value = {
						page,
						rowsPerPage,
						sortBy,
						descending,
						rowsNumber: Number(payload.TotalRecordCount)
					};
				} catch (error) {
					if (current === lastRequest) {
						if (!request.background || !refreshErrorShown) notifyError(error);
						refreshErrorShown = true;
					}
				} finally {
					if (current === lastRequest) loading.value = false;
				}
			}
			function reload(firstPage, background = false) {
				const current = pagination.value;
				return onRequest({
					pagination: Object.assign({}, current, firstPage ? { page: 1 } : {}),
					background
				});
			}
			function applyFilters() {
				if (loading.value || form.saving || selectionBusy.value) return;
				const values = {};
				Object.keys(filters).forEach((name) => {
					if (filters[name] !== null && filters[name] !== void 0 && filters[name] !== "") values[name] = filters[name];
				});
				appliedFilters.value = values;
				visible.value = true;
				rootRef.value?.dispatchEvent(new CustomEvent("crud-kit:filtered", {
					bubbles: true,
					detail: {
						crud: props.schema.id,
						filters: { ...values }
					}
				}));
				reload(true);
			}
			function filterFromOutside(values = {}) {
				filterFields.value.forEach((field) => {
					filters[field.name] = values[field.name] ?? "";
				});
				applyFilters();
			}
			__expose({
				filter: filterFromOutside,
				reload: () => reload(false)
			});
			function changed() {
				rootRef.value?.dispatchEvent(new CustomEvent("crud-kit:changed", {
					bubbles: true,
					detail: { crud: props.schema.id }
				}));
			}
			function keyParams(row) {
				const params = {};
				keyFields.forEach((name) => {
					params[name] = row[name];
				});
				return params;
			}
			async function runSelectionAction(action) {
				if (selectionBusy.value || selected.value.length === 0) return;
				const records = selected.value.map(keyParams);
				selectionBusy.value = true;
				const failures = [];
				let completed = 0;
				try {
					if (action.confirmation && !await new Promise((resolve) => {
						$q.dialog({
							title: action.label,
							message: action.confirmation,
							cancel: {
								label: texts.cancel,
								flat: true
							},
							ok: {
								label: action.label,
								color: "primary"
							},
							persistent: true
						}).onOk(() => resolve(true)).onCancel(() => resolve(false));
					})) return;
					selectionProgress.value = {
						label: action.label,
						items: records.map((record) => ({
							label: keyFields.map((key) => `${fields.find((field) => field.name === key).title}: ${record[key]}`).join(", "),
							status: "pending",
							error: ""
						}))
					};
					for (const [index, record] of records.entries()) {
						const item = selectionProgress.value.items[index];
						item.status = "running";
						try {
							await post(action.url, Object.assign({}, requestParams, action.params, { selected: JSON.stringify([record]) }), texts.serverCommunicationError);
							completed++;
							item.status = "success";
						} catch (error) {
							item.status = "error";
							item.error = error.message;
							failures.push(`${JSON.stringify(record)}: ${error.message}`);
						}
					}
					$q.notify({
						type: failures.length ? "warning" : "positive",
						message: `${action.label}: ${completed}/${records.length}. ${[...new Set(failures)].join(" ")}`,
						timeout: failures.length ? 0 : 6e3,
						closeBtn: true,
						position: "top"
					});
					selected.value = [];
					if (completed) changed();
					reload(false);
				} finally {
					selectionBusy.value = false;
				}
			}
			function openForm(record) {
				formEpoch.value++;
				if (form.saving) return;
				form.record = record;
				form.completed = 0;
				form.sequenceTotal = 0;
				form.sequenceStart = 0;
				form.sequenceCommon = {};
				form.errors = {};
				form.values = {};
				fields.forEach((field) => {
					let value = record ? record[field.name] : field.default;
					if (!record && props.schema.createFromFilters && appliedFilters.value[field.name] !== void 0) value = appliedFilters.value[field.name];
					if (!record && props.fixedFilters[field.name] !== void 0) value = props.fixedFilters[field.name];
					form.values[field.name] = value === null || value === void 0 ? "" : value;
					filledWith[field.name] = form.values[field.name];
				});
				if (!record && sequence) form.values[sequence.nowField] = sequenceNow(sequence.timeZone);
				form.open = true;
			}
			const filledWith = {};
			function updateField(field, value) {
				const previous = form.values[field.name];
				form.values[field.name] = value;
				if (String(previous ?? "") !== String(value ?? "")) for (const name of clearDependentValues(field.name, fields, form.values)) delete form.errors[name];
				if (field.type === "select") fillFrom(field);
			}
			function updateFilter(field, value) {
				const previous = filters[field.name];
				filters[field.name] = value;
				if (String(previous ?? "") !== String(value ?? "")) clearDependentValues(field.name, fields, filters);
			}
			async function fillFrom(field) {
				const value = form.values[field.name];
				if (!field.fillUrl || value === "" || value === null || value === void 0 || filledWith[field.name] === value) return;
				filledWith[field.name] = value;
				try {
					const values = Object.assign({}, requestParams, form.values, props.fixedFilters, form.record ? keyParams(form.record) : {});
					const payload = await post(field.fillUrl, values, texts.serverCommunicationError);
					const record = payload && payload.Record || {};
					Object.keys(record).forEach((name) => {
						if (name !== field.name && Object.prototype.hasOwnProperty.call(form.values, name)) form.values[name] = record[name] === null || record[name] === void 0 ? "" : record[name];
					});
				} catch (error) {
					notifyError(error);
				}
			}
			async function save() {
				if (form.saving) return;
				form.saving = true;
				form.errors = {};
				try {
					let range = null;
					if (!form.record && sequence) {
						range = form.sequenceTotal ? sequenceRange({
							[sequence.totalField]: form.sequenceTotal,
							[sequence.incrementField]: form.sequenceStart
						}, sequence) : sequenceRange(form.values, sequence);
						if (!range) throw new CrudError(sequence.invalidMessage || "Invalid sequence range.");
					}
					const values = Object.assign({}, requestParams, form.values, props.fixedFilters, form.record ? keyParams(form.record) : {});
					await post(form.record ? urls.update : urls.create, values, texts.serverCommunicationError);
					if (range) {
						if (form.completed === 0) {
							form.sequenceTotal = range.total;
							form.sequenceStart = range.start;
							form.sequenceCommon = Object.fromEntries((sequence.commonFields || []).map((name) => [name, values[name]]));
						}
						form.completed++;
					}
					if (range && form.sequenceStart + form.completed <= range.end) {
						Object.assign(form.values, form.sequenceCommon, sequence.resetValues || {}, {
							[sequence.totalField]: form.sequenceTotal,
							[sequence.incrementField]: form.sequenceStart + form.completed,
							[sequence.nowField]: sequenceNow(sequence.timeZone)
						});
						await nextTick();
						if (formRef.value) formRef.value.resetValidation();
					} else form.open = false;
					reload(false);
				} catch (error) {
					if (error instanceof CrudError && Object.keys(error.errors).length > 0) form.errors = error.errors;
					notifyError(error);
				} finally {
					form.saving = false;
				}
			}
			function confirm(message) {
				return new Promise((resolve) => {
					$q.dialog({
						title: texts.areYouSure,
						message,
						cancel: {
							label: texts.cancel,
							flat: true
						},
						ok: {
							label: texts.deleteText,
							color: "negative",
							unelevated: true
						},
						persistent: true
					}).onOk(() => resolve(true)).onCancel(() => resolve(false));
				});
			}
			async function confirmDelete(row) {
				if (!await confirm(texts.deleteConfirmation)) return;
				try {
					await post(urls.delete, Object.assign({}, requestParams, keyParams(row)), texts.serverCommunicationError);
					changed();
					reload(false);
				} catch (error) {
					notifyError(error);
				}
			}
			async function deleteSelected() {
				if (selected.value.length === 0) {
					$q.notify({
						type: "warning",
						message: texts.noneSelected,
						position: "top"
					});
					return;
				}
				if (!await confirm(String(texts.deleteSelectedConfirm).replace("{count}", selected.value.length))) return;
				const failures = [];
				for (const row of selected.value) try {
					await post(urls.delete, Object.assign({}, requestParams, keyParams(row)), texts.serverCommunicationError);
				} catch (error) {
					failures.push(error);
				}
				if (failures.length > 0) $q.notify({
					type: "negative",
					position: "top",
					message: String(texts.canNotDeletedRecords || "{0}/{1}").replace("{0}", failures.length).replace("{1}", selected.value.length),
					caption: failures[0].message
				});
				if (failures.length < selected.value.length) changed();
				reload(false);
			}
			function openChild(row) {
				return openChildren[row[rowKey]] || null;
			}
			function toggleChild(row, name) {
				const key = row[rowKey];
				if (openChildren[key] === name) {
					delete openChildren[key];
					return;
				}
				Object.keys(openChildren).forEach((other) => delete openChildren[other]);
				openChildren[key] = name;
			}
			function closeChild(row) {
				delete openChildren[row[rowKey]];
			}
			function childSchema(name) {
				return props.schema.children.find((child) => child.name === name).schema;
			}
			function childFilters(row, name) {
				const child = props.schema.children.find((item) => item.name === name);
				const values = {};
				Object.keys(child.links).forEach((childField) => {
					values[childField] = row[child.links[childField]];
				});
				return values;
			}
			function isFontIcon(icon) {
				return /^(fas|far|fab|fa) /.test(icon || "");
			}
			onMounted(() => {
				if (visible.value) reload(true);
				if (props.schema.refreshSeconds) refreshTimer = setInterval(() => {
					if (visible.value && !loading.value && !form.open && !selectionBusy.value && selected.value.length === 0 && document.visibilityState !== "hidden") reload(false, true);
				}, Math.max(5, Number(props.schema.refreshSeconds)) * 1e3);
				if (typeof ResizeObserver !== "undefined" && rootRef.value) {
					resizeObserver = new ResizeObserver(() => {
						visibleWidth.value = rootRef.value ? rootRef.value.clientWidth : 0;
					});
					resizeObserver.observe(rootRef.value);
				}
			});
			onBeforeUnmount(() => {
				if (refreshTimer !== null) clearInterval(refreshTimer);
				if (resizeObserver) resizeObserver.disconnect();
			});
			const __returned__ = {
				props,
				$q,
				formEpoch,
				icons,
				texts,
				urls,
				requestParams,
				selectionActions,
				canSelect,
				selectionBusy,
				selectionProgress,
				selectionCounts,
				fields,
				keyFields,
				rowKey,
				rows,
				selected,
				loading,
				visible,
				pagination,
				filters,
				appliedFilters,
				openChildren,
				formRef,
				rootRef,
				visibleWidth,
				get resizeObserver() {
					return resizeObserver;
				},
				set resizeObserver(v) {
					resizeObserver = v;
				},
				get refreshTimer() {
					return refreshTimer;
				},
				set refreshTimer(v) {
					refreshTimer = v;
				},
				get refreshErrorShown() {
					return refreshErrorShown;
				},
				set refreshErrorShown(v) {
					refreshErrorShown = v;
				},
				childPanelStyle,
				form,
				sequence,
				sequenceProgress,
				sequenceReadonly,
				filterFields,
				formFields,
				columns,
				paginationLabel,
				notifyError,
				cellText,
				get lastRequest() {
					return lastRequest;
				},
				set lastRequest(v) {
					lastRequest = v;
				},
				onRequest,
				reload,
				applyFilters,
				filterFromOutside,
				changed,
				keyParams,
				runSelectionAction,
				openForm,
				filledWith,
				updateField,
				updateFilter,
				fillFrom,
				save,
				confirm,
				confirmDelete,
				deleteSelected,
				openChild,
				toggleChild,
				closeChild,
				childSchema,
				childFilters,
				isFontIcon,
				computed,
				nextTick,
				onBeforeUnmount,
				onMounted,
				reactive,
				ref,
				get useQuasar() {
					return useQuasar;
				},
				get QTable() {
					return QTable_default;
				},
				get QTr() {
					return QTr_default;
				},
				get QTd() {
					return QTd_default;
				},
				get QBtn() {
					return QBtn_default;
				},
				get QSpace() {
					return QSpace_default;
				},
				get QForm() {
					return QForm_default;
				},
				get QInput() {
					return QInput_default;
				},
				get QSelect() {
					return QSelect_default;
				},
				get QDialog() {
					return QDialog_default;
				},
				get QCard() {
					return QCard_default;
				},
				get QCardSection() {
					return QCardSection_default;
				},
				get QCardActions() {
					return QCardActions_default;
				},
				get QCheckbox() {
					return QCheckbox_default;
				},
				get QIcon() {
					return QIcon_default;
				},
				get QTooltip() {
					return QTooltip_default;
				},
				get QLinearProgress() {
					return QLinearProgress_default;
				},
				get ClosePopup() {
					return ClosePopup_default;
				},
				get matAdd() {
					return matAdd;
				},
				get matClose() {
					return matClose;
				},
				get matDelete() {
					return matDelete;
				},
				get matEdit() {
					return matEdit;
				},
				get matList() {
					return matList;
				},
				get matRefresh() {
					return matRefresh;
				},
				FieldInput: FieldInput_default,
				LookupSelect: LookupSelect_default,
				SuggestInput: SuggestInput_default,
				get post() {
					return post;
				},
				get CrudError() {
					return CrudError;
				},
				get sequenceNow() {
					return sequenceNow;
				},
				get sequenceRange() {
					return sequenceRange;
				},
				get lookupContext() {
					return lookupContext;
				},
				get dependenciesReady() {
					return dependenciesReady;
				},
				get clearDependentValues() {
					return clearDependentValues;
				}
			};
			Object.defineProperty(__returned__, "__isScriptSetup", {
				enumerable: false,
				value: true
			});
			return __returned__;
		}
	});
	var _hoisted_1 = {
		ref: "rootRef",
		class: "ck-crud-quasar"
	};
	var _hoisted_2 = ["aria-label", "aria-busy"];
	var _hoisted_3 = {
		role: "status",
		"aria-live": "polite",
		"aria-atomic": "true"
	};
	var _hoisted_4 = { key: 0 };
	var _hoisted_5 = {
		class: "q-my-none q-pl-md",
		style: {
			"max-height": "180px",
			"overflow-y": "auto"
		}
	};
	var _hoisted_6 = ["data-status"];
	var _hoisted_7 = { key: 0 };
	var _hoisted_8 = { class: "ck-q-title" };
	var _hoisted_9 = ["innerHTML"];
	function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
		const _component_CrudTable = resolveComponent("CrudTable", true);
		const _directive_close_popup = resolveDirective("close-popup");
		return openBlock(), createElementBlock("div", _hoisted_1, [
			$setup.filterFields.length > 0 ? (openBlock(), createBlock($setup["QForm"], {
				key: 0,
				class: "ck-q-filters",
				onSubmit: withModifiers($setup.applyFilters, ["prevent"])
			}, {
				default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList($setup.filterFields, (field) => {
					return openBlock(), createElementBlock(Fragment, { key: field.name }, [field.type === "autocomplete" ? (openBlock(), createBlock($setup["LookupSelect"], {
						key: 0,
						"model-value": $setup.filters[field.name],
						"onUpdate:modelValue": ($event) => $setup.updateFilter(field, $event),
						class: "ck-q-filter",
						url: field.autocompleteUrl,
						"request-params": $setup.requestParams,
						"dependency-context": $setup.lookupContext(field, $setup.fields, $setup.filters),
						"dependency-ready": $setup.dependenciesReady($setup.lookupContext(field, $setup.fields, $setup.filters)),
						label: field.title,
						"no-results": $setup.texts.noDataAvailable,
						"communication-error": $setup.texts.serverCommunicationError,
						dense: "",
						outlined: ""
					}, null, 8, [
						"model-value",
						"onUpdate:modelValue",
						"url",
						"request-params",
						"dependency-context",
						"dependency-ready",
						"label",
						"no-results",
						"communication-error"
					])) : field.suggestUrl ? (openBlock(), createBlock($setup["SuggestInput"], {
						key: 1,
						"model-value": $setup.filters[field.name],
						"onUpdate:modelValue": ($event) => $setup.updateFilter(field, $event),
						class: "ck-q-filter",
						url: field.suggestUrl,
						"request-params": $setup.requestParams,
						label: field.title,
						"communication-error": $setup.texts.serverCommunicationError,
						dense: "",
						outlined: ""
					}, null, 8, [
						"model-value",
						"onUpdate:modelValue",
						"url",
						"request-params",
						"label",
						"communication-error"
					])) : field.options ? (openBlock(), createBlock($setup["QSelect"], {
						key: 2,
						"model-value": $setup.filters[field.name],
						"onUpdate:modelValue": ($event) => $setup.updateFilter(field, $event),
						class: "ck-q-filter",
						options: field.options,
						label: field.title,
						"emit-value": "",
						"map-options": "",
						clearable: "",
						dense: "",
						outlined: ""
					}, null, 8, [
						"model-value",
						"onUpdate:modelValue",
						"options",
						"label"
					])) : (openBlock(), createBlock($setup["QInput"], {
						key: 3,
						"model-value": $setup.filters[field.name],
						"onUpdate:modelValue": ($event) => $setup.updateFilter(field, $event),
						class: "ck-q-filter",
						autocomplete: "off",
						label: field.title,
						dense: "",
						outlined: "",
						clearable: ""
					}, null, 8, [
						"model-value",
						"onUpdate:modelValue",
						"label"
					]))], 64);
				}), 128)), createVNode($setup["QBtn"], {
					type: "submit",
					color: "primary",
					unelevated: "",
					label: $setup.texts.filter,
					loading: $setup.loading,
					disable: $setup.loading || $setup.form.saving || $setup.selectionBusy
				}, null, 8, [
					"label",
					"loading",
					"disable"
				])]),
				_: 1
			})) : createCommentVNode("", true),
			$setup.selectionProgress ? (openBlock(), createElementBlock("section", {
				key: 1,
				class: "ck-q-selection-progress q-pa-md q-mb-md bg-grey-2 rounded-borders",
				"aria-label": $setup.selectionProgress.label,
				"aria-busy": $setup.selectionBusy
			}, [
				createBaseVNode("div", _hoisted_3, [
					createBaseVNode("strong", null, toDisplayString($setup.selectionProgress.label), 1),
					createTextVNode(": " + toDisplayString($setup.selectionCounts.success) + " " + toDisplayString($setup.texts.progressSucceeded) + ", " + toDisplayString($setup.selectionCounts.error) + " " + toDisplayString($setup.texts.progressFailed) + ". " + toDisplayString($setup.selectionCounts.processed) + "/" + toDisplayString($setup.selectionProgress.items.length) + " ", 1),
					$setup.selectionCounts.current ? (openBlock(), createElementBlock("span", _hoisted_4, " — " + toDisplayString($setup.texts.progressRunning) + ": " + toDisplayString($setup.selectionCounts.current.label), 1)) : createCommentVNode("", true)
				]),
				createVNode($setup["QLinearProgress"], {
					class: "q-my-sm",
					size: "8px",
					value: $setup.selectionCounts.processed / $setup.selectionProgress.items.length
				}, null, 8, ["value"]),
				createBaseVNode("ul", _hoisted_5, [(openBlock(true), createElementBlock(Fragment, null, renderList($setup.selectionProgress.items, (item, index) => {
					return openBlock(), createElementBlock("li", {
						key: index,
						"data-status": item.status
					}, [createTextVNode(toDisplayString(item.label) + " — " + toDisplayString($setup.texts[{
						pending: "progressPending",
						running: "progressRunning",
						success: "progressDone",
						error: "progressFailed"
					}[item.status]]), 1), item.error ? (openBlock(), createElementBlock("span", _hoisted_7, ": " + toDisplayString(item.error), 1)) : createCommentVNode("", true)], 8, _hoisted_6);
				}), 128))])
			], 8, _hoisted_2)) : createCommentVNode("", true),
			withDirectives(createVNode($setup["QTable"], {
				dense: "",
				pagination: $setup.pagination,
				"onUpdate:pagination": _cache[3] || (_cache[3] = ($event) => $setup.pagination = $event),
				selected: $setup.selected,
				"onUpdate:selected": _cache[4] || (_cache[4] = ($event) => $setup.selected = $event),
				title: $props.schema.title,
				rows: $setup.rows,
				columns: $setup.columns,
				"row-key": $setup.rowKey,
				loading: $setup.loading,
				selection: $setup.canSelect ? $props.schema.selection : "none",
				"rows-per-page-options": [
					5,
					10,
					25,
					50,
					100
				],
				"rows-per-page-label": $setup.texts.pageSizeChangeLabel,
				"no-data-label": $setup.texts.noDataAvailable,
				"loading-label": $setup.texts.loadingMessage,
				"pagination-label": $setup.paginationLabel,
				"binary-state-sort": "",
				flat: "",
				bordered: "",
				class: "ck-q-table",
				onRequest: $setup.onRequest
			}, {
				top: withCtx(() => [
					createBaseVNode("div", _hoisted_8, toDisplayString($props.schema.title), 1),
					createVNode($setup["QSpace"]),
					$props.schema.refreshSeconds ? (openBlock(), createBlock($setup["QBtn"], {
						key: 0,
						class: "ck-q-refresh q-mr-sm",
						icon: $setup.icons.refresh,
						label: $setup.texts.refresh,
						color: "white",
						flat: "",
						dense: "",
						"no-caps": "",
						disable: $setup.loading || $setup.form.saving || $setup.selectionBusy,
						onClick: _cache[0] || (_cache[0] = ($event) => $setup.reload(false))
					}, null, 8, [
						"icon",
						"label",
						"disable"
					])) : createCommentVNode("", true),
					(openBlock(true), createElementBlock(Fragment, null, renderList($setup.selectionActions, (action) => {
						return openBlock(), createBlock($setup["QBtn"], {
							key: action.name,
							class: "q-mr-sm",
							label: action.label,
							color: "white",
							outline: "",
							dense: "",
							"no-caps": "",
							loading: $setup.selectionBusy,
							disable: $setup.selectionBusy || $setup.loading || $setup.selected.length === 0,
							onClick: ($event) => $setup.runSelectionAction(action)
						}, null, 8, [
							"label",
							"loading",
							"disable",
							"onClick"
						]);
					}), 128)),
					$props.schema.selection === "multiple" && $setup.urls.delete ? (openBlock(), createBlock($setup["QBtn"], {
						key: 1,
						class: "q-mr-sm",
						icon: $setup.icons.delete,
						label: $setup.texts.deleteSelected,
						outline: "",
						dense: "",
						"no-caps": "",
						onClick: $setup.deleteSelected
					}, null, 8, ["icon", "label"])) : createCommentVNode("", true),
					$setup.urls.create ? (openBlock(), createBlock($setup["QBtn"], {
						key: 2,
						icon: $setup.icons.add,
						label: $setup.texts.addNewRecord,
						color: "primary",
						unelevated: "",
						dense: "",
						"no-caps": "",
						onClick: _cache[1] || (_cache[1] = ($event) => $setup.openForm(null))
					}, null, 8, ["icon", "label"])) : createCommentVNode("", true),
					$props.nested ? (openBlock(), createBlock($setup["QBtn"], {
						key: 3,
						class: "ck-q-close-child q-ml-sm",
						icon: $setup.icons.close,
						"aria-label": $setup.texts.close,
						color: "white",
						flat: "",
						round: "",
						dense: "",
						disable: $setup.form.saving || $setup.selectionBusy,
						onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("close"))
					}, {
						default: withCtx(() => [createVNode($setup["QTooltip"], null, {
							default: withCtx(() => [createTextVNode(toDisplayString($setup.texts.close), 1)]),
							_: 1
						})]),
						_: 1
					}, 8, [
						"icon",
						"aria-label",
						"disable"
					])) : createCommentVNode("", true)
				]),
				body: withCtx((props) => [(openBlock(), createBlock($setup["QTr"], {
					key: `row-${props.key}`,
					props
				}, {
					default: withCtx(() => [$setup.canSelect ? (openBlock(), createBlock($setup["QTd"], {
						key: 0,
						"auto-width": ""
					}, {
						default: withCtx(() => [createVNode($setup["QCheckbox"], {
							modelValue: props.selected,
							"onUpdate:modelValue": ($event) => props.selected = $event,
							dense: ""
						}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
						_: 2
					}, 1024)) : createCommentVNode("", true), (openBlock(true), createElementBlock(Fragment, null, renderList(props.cols, (column) => {
						return openBlock(), createBlock($setup["QTd"], {
							key: column.name,
							props
						}, {
							default: withCtx(() => [column.name === "__children" ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList($props.schema.children, (child) => {
								return openBlock(), createBlock($setup["QBtn"], {
									key: child.name,
									class: normalizeClass(["ck-q-child-button", { "ck-q-child-open": $setup.openChild(props.row) === child.name }]),
									flat: "",
									dense: "",
									onClick: ($event) => $setup.toggleChild(props.row, child.name)
								}, {
									default: withCtx(() => [$setup.isFontIcon(child.icon) ? (openBlock(), createElementBlock("i", {
										key: 0,
										class: normalizeClass(["ck-host-icon", child.icon]),
										"aria-hidden": "true"
									}, null, 2)) : (openBlock(), createBlock($setup["QIcon"], {
										key: 1,
										name: child.icon || $setup.icons.list
									}, null, 8, ["name"])), createVNode($setup["QTooltip"], null, {
										default: withCtx(() => [createTextVNode(toDisplayString(child.title), 1)]),
										_: 2
									}, 1024)]),
									_: 2
								}, 1032, ["class", "onClick"]);
							}), 128)) : column.name === "__actions" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [$setup.urls.update ? (openBlock(), createBlock($setup["QBtn"], {
								key: 0,
								icon: $setup.icons.edit,
								size: "sm",
								flat: "",
								dense: "",
								round: "",
								onClick: ($event) => $setup.openForm(props.row)
							}, {
								default: withCtx(() => [createVNode($setup["QTooltip"], null, {
									default: withCtx(() => [createTextVNode(toDisplayString($setup.texts.editRecord), 1)]),
									_: 1
								})]),
								_: 1
							}, 8, ["icon", "onClick"])) : createCommentVNode("", true), $setup.urls.delete ? (openBlock(), createBlock($setup["QBtn"], {
								key: 1,
								icon: $setup.icons.delete,
								size: "sm",
								flat: "",
								dense: "",
								round: "",
								onClick: ($event) => $setup.confirmDelete(props.row)
							}, {
								default: withCtx(() => [createVNode($setup["QTooltip"], null, {
									default: withCtx(() => [createTextVNode(toDisplayString($setup.texts.deleteText), 1)]),
									_: 1
								})]),
								_: 1
							}, 8, ["icon", "onClick"])) : createCommentVNode("", true)], 64)) : column.field.html ? (openBlock(), createElementBlock("span", {
								key: 2,
								innerHTML: props.row[column.name]
							}, null, 8, _hoisted_9)) : (openBlock(), createElementBlock(Fragment, { key: 3 }, [createTextVNode(toDisplayString($setup.cellText(column.field, props.row)), 1)], 64))]),
							_: 2
						}, 1032, ["props"]);
					}), 128))]),
					_: 2
				}, 1032, ["props"])), $setup.openChild(props.row) ? (openBlock(), createBlock($setup["QTr"], {
					key: `child-${props.key}-${$setup.openChild(props.row)}`,
					class: "ck-q-child-row"
				}, {
					default: withCtx(() => [createVNode($setup["QTd"], { colspan: "100%" }, {
						default: withCtx(() => [createBaseVNode("div", {
							class: "ck-q-child-panel",
							style: normalizeStyle($setup.childPanelStyle)
						}, [(openBlock(), createBlock(_component_CrudTable, {
							key: `${props.key}-${$setup.openChild(props.row)}`,
							schema: $setup.childSchema($setup.openChild(props.row)),
							"fixed-filters": $setup.childFilters(props.row, $setup.openChild(props.row)),
							nested: "",
							onClose: ($event) => $setup.closeChild(props.row)
						}, null, 8, [
							"schema",
							"fixed-filters",
							"onClose"
						]))], 4)]),
						_: 2
					}, 1024)]),
					_: 2
				}, 1024)) : createCommentVNode("", true)]),
				_: 1
			}, 8, [
				"pagination",
				"selected",
				"title",
				"rows",
				"columns",
				"row-key",
				"loading",
				"selection",
				"rows-per-page-label",
				"no-data-label",
				"loading-label"
			]), [[vShow, $setup.visible]]),
			createVNode($setup["QDialog"], {
				modelValue: $setup.form.open,
				"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.form.open = $event),
				persistent: ""
			}, {
				default: withCtx(() => [createVNode($setup["QCard"], { class: "ck-q-form-card" }, {
					default: withCtx(() => [
						createVNode($setup["QCardSection"], { class: "ck-q-dialog-title" }, {
							default: withCtx(() => [createTextVNode(toDisplayString($setup.form.record ? $setup.texts.editRecord : $setup.texts.addNewRecord), 1)]),
							_: 1
						}),
						!$setup.form.record && $setup.sequence && $setup.sequenceProgress ? (openBlock(), createBlock($setup["QCardSection"], {
							key: 0,
							class: "q-py-none text-primary text-weight-medium"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString($setup.sequenceProgress), 1)]),
							_: 1
						})) : createCommentVNode("", true),
						createVNode($setup["QForm"], {
							ref: "formRef",
							onSubmit: withModifiers($setup.save, ["prevent"])
						}, {
							default: withCtx(() => [createVNode($setup["QCardSection"], { class: "ck-q-form-fields" }, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList($setup.formFields, (field) => {
									return openBlock(), createBlock($setup["FieldInput"], {
										key: field.name + ":" + $setup.formEpoch,
										"model-value": $setup.form.values[field.name],
										field,
										"request-params": $setup.requestParams,
										"form-values": $setup.form.values,
										"all-fields": $setup.fields,
										"initial-text": $setup.form.record && field.textField ? String($setup.form.record[field.textField] || "") : "",
										texts: $setup.texts,
										error: $setup.form.errors[field.name] || "",
										readonly: $setup.form.saving || $setup.sequenceReadonly(field.name),
										onFocusout: ($event) => $setup.fillFrom(field),
										"onUpdate:modelValue": ($event) => $setup.updateField(field, $event)
									}, null, 8, [
										"model-value",
										"field",
										"request-params",
										"form-values",
										"all-fields",
										"initial-text",
										"texts",
										"error",
										"readonly",
										"onFocusout",
										"onUpdate:modelValue"
									]);
								}), 128))]),
								_: 1
							}), createVNode($setup["QCardActions"], { align: "right" }, {
								default: withCtx(() => [withDirectives(createVNode($setup["QBtn"], {
									flat: "",
									label: $setup.texts.cancel,
									disable: $setup.form.saving
								}, null, 8, ["label", "disable"]), [[_directive_close_popup]]), createVNode($setup["QBtn"], {
									type: "submit",
									color: "primary",
									unelevated: "",
									label: $setup.form.saving ? $setup.texts.saving : $setup.texts.save,
									loading: $setup.form.saving
								}, null, 8, ["label", "loading"])]),
								_: 1
							})]),
							_: 1
						}, 512)
					]),
					_: 1
				})]),
				_: 1
			}, 8, ["modelValue"])
		], 512);
	}
	var CrudTable_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["render", _sfc_render], ["__file", "CrudTable.vue"]]);
	//#endregion
	//#region src/main.js
	var instances = /* @__PURE__ */ new WeakMap();
	function elementFor(selector) {
		return typeof selector === "string" ? document.querySelector(selector) : selector;
	}
	function filter(selector, values) {
		const instance = instances.get(elementFor(selector));
		if (instance) instance.filter(values);
	}
	function reload(selector) {
		const instance = instances.get(elementFor(selector));
		if (instance) return instance.reload();
	}
	/**
	* Mounts a CRUD described by the PHP QuasarRenderer schema.
	*
	* @param {string} selector element where the CRUD is painted
	* @param {object} schema see Ivandzb\CrudKit\Render\Quasar\QuasarRenderer::schema()
	*/
	function mount(selector, schema) {
		const element = elementFor(selector);
		if (!element) throw new Error(`crud-kit: element not found: ${selector}`);
		const app = createApp(CrudTable_default, { schema });
		app.use(Quasar, {
			plugins: {
				Notify: Notify_default,
				Dialog: Dialog_default
			},
			iconSet: svg_material_icons_default,
			config: { dark: false }
		});
		const instance = app.mount(element);
		instances.set(element, instance);
		return instance;
	}
	//#endregion
	exports.filter = filter;
	exports.mount = mount;
	exports.reload = reload;
	return exports;
})({});

//# sourceMappingURL=crud-kit-quasar.js.map