// キャッシュの名前
const CACHE_NAME = "travel-shiori-v1";


// キャッシュするファイル
const CACHE_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];


// =========================
// インストール
// =========================

self.addEventListener("install", function (event) {

    console.log(
        "Service Workerをインストールしています。"
    );

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function (cache) {

                return cache.addAll(CACHE_FILES);

            })

    );

});


// =========================
// 古いキャッシュを削除
// =========================

self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys()
            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames.map(function (cacheName) {

                        if (
                            cacheName !== CACHE_NAME
                        ) {

                            return caches.delete(
                                cacheName
                            );

                        }

                    })

                );

            })

    );

});


// =========================
// ページ・ファイルを取得
// =========================

self.addEventListener("fetch", function (event) {

    event.respondWith(

        caches.match(event.request)
            .then(function (response) {

                // キャッシュがあれば使用
                if (response) {

                    return response;

                }

                // なければネットワークから取得
                return fetch(event.request);

            })

    );

});