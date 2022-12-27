(() => {
  // node_modules/svelte/internal/index.mjs
  function noop() {
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  var is_hydrating = false;
  function start_hydrating() {
    is_hydrating = true;
  }
  function end_hydrating() {
    is_hydrating = false;
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  var current_component;
  function set_current_component(component) {
    current_component = component;
  }
  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  var seen_callbacks = /* @__PURE__ */ new Set();
  var flushidx = 0;
  function flush() {
    const saved_component = current_component;
    do {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length)
        binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  var outroing = /* @__PURE__ */ new Set();
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
  function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
        if (component.$$.on_destroy) {
          component.$$.on_destroy.push(...new_on_destroy);
        } else {
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance3, create_fragment3, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: [],
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance3 ? instance3(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment3 ? create_fragment3($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        start_hydrating();
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      end_hydrating();
      flush();
    }
    set_current_component(parent_component);
  }
  var SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const { on_mount } = this.$$;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function);
        for (const key in this.$$.slotted) {
          this.appendChild(this.$$.slotted[key]);
        }
      }
      attributeChangedCallback(attr2, _oldValue, newValue) {
        this[attr2] = newValue;
      }
      disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
      $on(type, callback) {
        if (!is_function(callback)) {
          return noop;
        }
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1)
            callbacks.splice(index, 1);
        };
      }
      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    };
  }
  var SvelteComponent = class {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      if (!is_function(callback)) {
        return noop;
      }
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };

  // src/music.js
  var context = new AudioContext();
  function note(str, length = 5) {
    console.log("note", str);
    let o = context.createOscillator();
    let g = context.createGain();
    o.connect(g);
    g.connect(context.destination);
    o.frequency.value = freqForNote(str);
    o.start(0);
    g.gain.exponentialRampToValueAtTime(
      1e-5,
      context.currentTime + length
    );
  }
  function freqForNote(str) {
    console.log("freqForNote", str);
    let A0 = 440 / 16;
    str = str.toUpperCase();
    let letter = str[0];
    let map = { A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10 };
    let mod = str[1] == "B" ? -1 : str[1] == "#" ? 1 : 0;
    let nb = str.at(-1);
    let base = Math.pow(2, 1 / 12);
    let exp = nb * 12 + map[letter] + mod;
    let freq = A0 * Math.pow(base, exp);
    return freq;
  }

  // src/svelte/metronome.svelte
  function create_fragment(ctx) {
    let h1;
    let t1;
    let button0;
    let t3;
    let button1;
    let mounted;
    let dispose;
    return {
      c() {
        h1 = element("h1");
        h1.textContent = "Metronome";
        t1 = space();
        button0 = element("button");
        button0.textContent = "Start";
        t3 = space();
        button1 = element("button");
        button1.textContent = "Stop";
        attr(button0, "type", "button");
        attr(button1, "type", "button");
      },
      m(target, anchor) {
        insert(target, h1, anchor);
        insert(target, t1, anchor);
        insert(target, button0, anchor);
        insert(target, t3, anchor);
        insert(target, button1, anchor);
        if (!mounted) {
          dispose = [
            listen(button0, "click", ctx[2]),
            listen(button1, "click", ctx[3])
          ];
          mounted = true;
        }
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(h1);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(button0);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(button1);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance($$self, $$props, $$invalidate) {
    let { interval = null } = $$props;
    let { delayMs = 1e3 } = $$props;
    const click_handler = () => {
      if (!interval) {
        $$invalidate(0, interval = setInterval(() => note("A4", 0.5), delayMs));
      }
    };
    const click_handler_1 = () => {
      clearInterval(interval);
      $$invalidate(0, interval = null);
    };
    $$self.$$set = ($$props2) => {
      if ("interval" in $$props2)
        $$invalidate(0, interval = $$props2.interval);
      if ("delayMs" in $$props2)
        $$invalidate(1, delayMs = $$props2.delayMs);
    };
    return [interval, delayMs, click_handler, click_handler_1];
  }
  var Metronome = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, { interval: 0, delayMs: 1 });
    }
  };
  var metronome_default = Metronome;

  // src/svelte/guitar.svelte
  function create_fragment2(ctx) {
    let h1;
    let t1;
    let button0;
    let t3;
    let button1;
    let t5;
    let button2;
    let t7;
    let button3;
    let t9;
    let button4;
    let t11;
    let button5;
    let mounted;
    let dispose;
    return {
      c() {
        h1 = element("h1");
        h1.textContent = "Guitar";
        t1 = space();
        button0 = element("button");
        button0.textContent = "E";
        t3 = space();
        button1 = element("button");
        button1.textContent = "A";
        t5 = space();
        button2 = element("button");
        button2.textContent = "D";
        t7 = space();
        button3 = element("button");
        button3.textContent = "G";
        t9 = space();
        button4 = element("button");
        button4.textContent = "B";
        t11 = space();
        button5 = element("button");
        button5.textContent = "E";
        attr(button0, "type", "button");
        attr(button1, "type", "button");
        attr(button2, "type", "button");
        attr(button3, "type", "button");
        attr(button4, "type", "button");
        attr(button5, "type", "button");
      },
      m(target, anchor) {
        insert(target, h1, anchor);
        insert(target, t1, anchor);
        insert(target, button0, anchor);
        insert(target, t3, anchor);
        insert(target, button1, anchor);
        insert(target, t5, anchor);
        insert(target, button2, anchor);
        insert(target, t7, anchor);
        insert(target, button3, anchor);
        insert(target, t9, anchor);
        insert(target, button4, anchor);
        insert(target, t11, anchor);
        insert(target, button5, anchor);
        if (!mounted) {
          dispose = [
            listen(button0, "click", ctx[0]),
            listen(button1, "click", ctx[1]),
            listen(button2, "click", ctx[2]),
            listen(button3, "click", ctx[3]),
            listen(button4, "click", ctx[4]),
            listen(button5, "click", ctx[5])
          ];
          mounted = true;
        }
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(h1);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(button0);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(button1);
        if (detaching)
          detach(t5);
        if (detaching)
          detach(button2);
        if (detaching)
          detach(t7);
        if (detaching)
          detach(button3);
        if (detaching)
          detach(t9);
        if (detaching)
          detach(button4);
        if (detaching)
          detach(t11);
        if (detaching)
          detach(button5);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance2($$self) {
    const click_handler = () => note("E2");
    const click_handler_1 = () => note("A3");
    const click_handler_2 = () => note("D3");
    const click_handler_3 = () => note("G3");
    const click_handler_4 = () => note("B4");
    const click_handler_5 = () => note("E4");
    return [
      click_handler,
      click_handler_1,
      click_handler_2,
      click_handler_3,
      click_handler_4,
      click_handler_5
    ];
  }
  var Guitar = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance2, create_fragment2, safe_not_equal, {});
    }
  };
  var guitar_default = Guitar;

  // src/svelte/index.js
  var metronome = new metronome_default({
    target: document.getElementById("metronome"),
    props: {
      name: "world"
    }
  });
  var guitar = new guitar_default({
    target: document.getElementById("guitar"),
    props: {
      name: "world"
    }
  });
})();
