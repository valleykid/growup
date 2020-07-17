import {
  getAppNames,
  getAppStatus,
  NOT_LOADED,
  MOUNTED,
  registerApplication,
  start,
} from 'single-spa';
import CustomEvent from 'custom-event';
import { importEntry } from 'import-html-entry';
import qs from 'qs';
import parse from 'url-parse';
// import * as otherApp from './src/other-app';
import IndexedDB from './src/indexeddb';
import { resolve } from 'upath';

// console.log('---------', otherApp);

const cacheDB = new IndexedDB('cacheAssets');
console.log('-------cacheDB.isSupported()', cacheDB.isSupported());

registerApplication({
  name: 'home',
  app: () => import('./src/home/home.app.js'),
  activeWhen: () =>
    location.pathname === '' ||
    location.pathname === '/' ||
    location.pathname.startsWith('/home'),
  customProps: {},
});

registerApplication({
  name: 'app',
  // app: () => Promise.resolve(otherApp),
  app: () =>
    new Promise((resolve) => {
      import('./src/other-app').then((res) => {
        console.log('---------', res);
        const appWrapper = document.createElement('section');
        appWrapper.id = 'appWrapper';
        document.body.appendChild(appWrapper);

        // const oldBootstrap = res.bootstrap;
        // const wrapper = document.getElementById('appWrapper');
        // if (wrapper) {
        //   res.bootstrap = oldBootstrap({ el: wrapper });
        // }

        setTimeout(() => {
          resolve(res);
        }, 0.06 * 1000);
      });
    }),
  activeWhen: () => location.pathname.startsWith('/space'),
  customProps: (appName) => {
    /* console.log('=============', appName);
    window.dispatchEvent(
      new CustomEvent(
        'single-spa:single-app-mount',
        (() => {
          const appNames = getAppNames();
          const detail = {};
          appNames.forEach((name) => {
            detail[name] = getAppStatus(name);
          });
          return { detail };
        })()
      )
    ); */
    return {};
  },
});

registerApplication({
  name: 'space',
  app: () =>
    new Promise((resolve) => {
      const url = 'https://render.alipay.com/p/w/occ-chipspace/index.html';
      /* const proxyUrl = `https://ptgproxy-office.alipay.net/proxy?target=${encodeURIComponent(
        url
      )}`; */
      const proxyUrl = 'http://localhost:7001/space';

      function render(entry) {
        const container = document.getElementById('space-app');
        const temp = entry.template
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .replace(/<\/?(html|head|body)[^>]*>/gi, '')
          .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
          .replace(/<(meta)\s+.*?>/gi, '');
        container.innerHTML = temp;
        const testx = '你ishi我的"奶茶"xxx';
        // HTMLElement.prototype.appendChild.call(container, createElement(temp));

        entry.execScripts(/* sandboxJS() */).then((scriptExports) => {
          // console.log(
          //   '----------scriptExports',
          //   scriptExports,
          //   entry.getExternalScripts(),
          //   entry.getExternalStyleSheets(),
          //   entry.template
          // );
          resolve(
            scriptExports.bootstrap
              ? scriptExports
              : window['occ-chipspace-umi']
          );
        });
      }

      importEntry(proxyUrl, {
        fetch: (url) => {
          const { pathname: targetPathname, query: targetQuery } = parse(url);
          let cacheKey = targetPathname;
          if (targetPathname === '/proxy' && targetQuery) {
            const q = qs.parse(targetQuery.slice(1));
            const realQuery = parse(q.target);
            cacheKey = realQuery.pathname;
          }
          // console.log('~~~~~~~~~~`', cacheKey, targetQuery);

          return new Promise((resolve, reject) => {
            // if (!cacheDB.hasStore('space'))
            /* cacheDB.addStore('space', {
              cacheKey: false,
              cacheValue: false,
            }); */

            /* const cacheScriptText = sessionStorage.getItem(cacheKey);
            if (cacheScriptText) {
              resolve({
                cacheKey,
                text: () => Promise.resolve(cacheScriptText),
              });
              return;
            } */

            window.fetch(url).then((data) => {
              data
                .text()
                .then((scriptText) => {
                  // sessionStorage.setItem(cacheKey, scriptText);
                  /* cacheDB.set(
                    'space',
                    { cacheKey, cacheValue: scriptText },
                    cacheKey
                  ); */
                  resolve({
                    cacheKey,
                    text: () => Promise.resolve(scriptText),
                  });
                })
                /* .then((st) => {
                  window.dispatchEvent(
                    new CustomEvent(
                      'vk-single-spa:one-app-mounted',
                      (() => {
                        const appNames = getAppNames();
                        const detail = {};
                        appNames.forEach((name) => {
                          detail[name] = getAppStatus(name);
                        });
                        return { detail };
                      })()
                    )
                  );
                  return st;
                }) */
                .catch((reason) => reject(reason));
            });
          });
        },
      }).then((entry) => {
        // console.log('----------entry', entry);
        if (getAppStatus('app') !== MOUNTED) {
          window.addEventListener('single-spa:single-app-lifecycle', (evt) => {
            const { current, appStatus = {} } = evt.detail;
            if (
              appStatus['app'] === MOUNTED &&
              current.name === 'space' &&
              current.status === NOT_LOADED
            )
              render(entry);
          });
          return;
        }
        render(entry);
      });
    }),
  activeWhen: () => location.pathname.startsWith('/space'),
  customProps: {},
});

/* window.addEventListener('popstate', (evt) => {
  if (evt.singleSpa) {
    console.log(
      'This event was fired by single-spa to forcibly trigger a re-render'
    );
    console.log(evt.singleSpaTrigger); // pushState | replaceState
  } else {
    console.log('This event was fired by native browser behavior');
  }
}); */

/* window.addEventListener('single-spa:before-mount-routing-event', (evt) => {
  console.log('single-spa is about to mount/unmount applications!');
  console.log(evt.detail);
  console.log(evt.detail.originalEvent);
  console.log('--------', JSON.stringify(evt.detail.newAppStatuses));
  console.log(evt.detail.appsByNewStatus);
  console.log(evt.detail.totalAppChanges);
}); */

window.addEventListener('single-spa:single-app-lifecycle', (evt) =>
  console.log('----------', evt.detail /* JSON.stringify(evt.detail) */)
);

/* window.addEventListener('single-spa:app-change', (evt) => {
  console.log(
    'A routing event occurred where at least one application was mounted/unmounted'
  );
  console.log(evt.detail.originalEvent); // PopStateEvent
  console.log(evt.detail.newAppStatuses); // { app1: MOUNTED, app2: NOT_MOUNTED }
  console.log(evt.detail.appsByNewStatus); // { MOUNTED: ['app1'], NOT_MOUNTED: ['app2'] }
  console.log(evt.detail.totalAppChanges); // 2
}); */

/* window.addEventListener('single-spa:routing-event', (evt) => {
  console.log('single-spa finished mounting/unmounting applications!');
  console.log(evt.detail.originalEvent); // PopStateEvent
  console.log(evt.detail.newAppStatuses); // { app1: MOUNTED, app2: NOT_MOUNTED }
  console.log(evt.detail.appsByNewStatus); // { MOUNTED: ['app1'], NOT_MOUNTED: ['app2'] }
  console.log(evt.detail.totalAppChanges); // 2
}); */

start();

/**
 * sandbox 1
 * ref: https://www.yuque.com/superf2e/rag8df/gw4of6
 */
function runProxy() {
  function compileCode(src) {
    const code = new Function('sandbox', src);
    return function (sandbox) {
      const sandboxProxy = new Proxy(sandbox, { has, get });
      return code(sandboxProxy);
    };
  }

  function has() {
    return true;
  }

  function get(target, key) {
    // Symbol.unscopables
    if (key === Symbol.unscopables) return undefined;

    const value = Reflect.get(target, key);
    if (value) return value;
    // 获取不到 value 就返回 'undefined_from_Reflect'
    return 'undefined_from_Reflect';
  }

  const script =
    'with (sandbox) { log("i am " + name + " and my age is " + age + " by use Proxy "); } ';

  const sandbox = Object.create(null);
  sandbox.log = console.log;
  sandbox.name = 'TOM';

  compileCode(script)(sandbox); // i am TOM and my age is undefined_from_Reflect by use Proxy
}

// runProxy();

/**
 * sandbox 2
 * ref: https://gist.github.com/getify/b0533d921c9c4dbbdf02325a4bbac43f
 */
const unscopables = {
  undefined: true,
  Array: true,
  Object: true,
  String: true,
  Boolean: true,
  Math: true,
  eval: true,
  Number: true,
  Symbol: true,
  parseFloat: true,
  Float32Array: true,
};

function sandboxJS(/* js */) {
  var whitelist = ['alert', 'console', 'navigator', 'location', 'eval'];
  var handlers = {
    has(target, key, context) {
      /* if (whitelist.indexOf(key) >= 0) {
        return Reflect.has(target, key, context);
      } else {
        throw new Error('Not allowed: ' + key);
      } */
      return key in unscopables || key in target || key in window;
    },
  };
  var proxy = new Proxy(window, handlers);
  var proxyName = `proxy${Math.floor(Math.random() * 1e9)}`;
  // var fn = new Function(proxyName, `with(${proxyName}){${js}}`);
  // return fn.call(this, proxy);
  return Promise.resolve(proxy);
}

// sandboxJS('console.log(2)'); // 2
// sandboxJS('console.log(history)'); // Error, Not allowed: history
