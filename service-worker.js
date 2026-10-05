const CACHE_NAME = "travel-shiori-v2";

const CACHE_FILES = [
    "./",
    "./index.html",
    "./travel.html",
    "./favorite.html",
    "./setting.html",
    "./share.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/* -----------------------------------------
 * インストール
 * ----------------------------------------- */

self.addEventListener("install", function (event) {

    console.log("Service Workerをインストールしています。");

    event.waitUntil(

        caches.open(CACHE_NAME).then(function (cache) {

            return cache.addAll(CACHE_FILES);

        })

    );

});


/* -----------------------------------------
 * 古いキャッシュを削除
 * ----------------------------------------- */

self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys().then(function (cacheNames) {

            return Promise.all(

                cacheNames.map(function (cacheName) {

                    if (cacheName !== CACHE_NAME) {

                        return caches.delete(cacheName);

                    }

                })

            );

        })

    );

});


/* -----------------------------------------
 * ページやファイルを取得
 * ----------------------------------------- */

self.addEventListener("fetch", function (event) {

    event.respondWith(

        caches.match(event.request).then(function (response) {

            if (response) {

                return response;

            }

            return fetch(event.request);

        })

    );

});