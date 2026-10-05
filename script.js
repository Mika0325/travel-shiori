/* =========================================================
 * 旅のしおり
 * 共通JavaScript
 * ========================================================= */

/* =========================================================
 * 設定
 * ========================================================= */

const STORAGE_KEY = "travel-shiori-data";

/* =========================================================
 * データ取得
 * ========================================================= */

function getTrips() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);

        if (!data) {
            return [];
        }

        const trips = JSON.parse(data);

        if (!Array.isArray(trips)) {
            return [];
        }

        return trips;

    } catch (error) {
        console.error("旅行データの読み込みに失敗しました。", error);
        return [];
    }
}

/* =========================================================
 * データ保存
 * ========================================================= */

function saveTrips(trips) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(trips)
        );

        return true;

    } catch (error) {
        console.error("旅行データの保存に失敗しました。", error);

        alert(
            "旅行データを保存できませんでした。\n" +
            "ブラウザの保存容量を確認してください。"
        );

        return false;
    }
}

/* =========================================================
 * 編集中の旅行ID
 * ========================================================= */

let editingTripId = null;

/* =========================================================
 * HTMLエスケープ
 * ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
 * 日付表示
 * ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return (
        date.getFullYear() +
        "年" +
        (date.getMonth() + 1) +
        "月" +
        date.getDate() +
        "日"
    );
}

/* =========================================================
 * 日程の種類
 * ========================================================= */

const SCHEDULE_TYPES = [
    {
        value: "出発",
        label: "出発"
    },
    {
        value: "移動",
        label: "移動"
    },
    {
        value: "観光",
        label: "観光"
    },
    {
        value: "食事",
        label: "食事"
    },
    {
        value: "ホテル",
        label: "ホテル"
    },
    {
        value: "その他",
        label: "その他"
    }
];

/* =========================================================
 * 日程入力欄を追加
 * ========================================================= */

function addScheduleForm(schedule) {

    const scheduleList =
        document.getElementById("schedule-list");

    if (!scheduleList) {
        return;
    }

    const scheduleForm =
        document.createElement("div");

    scheduleForm.className =
        "schedule-form";

    scheduleForm.innerHTML = `

        <div class="form-group">

            <label>種類</label>

            <select class="schedule-type">

                ${SCHEDULE_TYPES.map(function (type) {

        return `
                        <option value="${type.value}">
                            ${type.label}
                        </option>
                    `;

    }).join("")}

            </select>

        </div>

        <div class="form-group">

            <label>時間</label>

            <input
                type="time"
                class="schedule-time"
            >

        </div>

        <div class="form-group">

            <label>場所・内容</label>

            <input
                type="text"
                class="schedule-place"
                placeholder="例：京都駅"
            >

        </div>

        <div class="form-group">

            <label>交通手段・詳細</label>

            <input
                type="text"
                class="schedule-detail"
                placeholder="例：〇〇線〇〇行き〇番ホーム"
            >

        </div>

        <div class="form-group">

            <label>メモ</label>

            <input
                type="text"
                class="schedule-memo"
                placeholder="例：10分前にホームへ"
            >

        </div>

        <button
            type="button"
            class="schedule-delete-button"
        >
            この日程を削除
        </button>

    `;

    const deleteButton =
        scheduleForm.querySelector(
            ".schedule-delete-button"
        );

    deleteButton.addEventListener(
        "click",
        function () {

            scheduleForm.remove();

        }
    );

    scheduleList.appendChild(scheduleForm);
}

/* =========================================================
 * 日程データ取得
 * ========================================================= */

function getScheduleData() {

    const scheduleList =
        document.getElementById("schedule-list");

    if (!scheduleList) {
        return [];
    }

    const forms =
        scheduleList.querySelectorAll(
            ".schedule-form"
        );

    const schedules = [];

    forms.forEach(function (form, index) {

        const type =
            form.querySelector(
                ".schedule-type"
            )?.value || "その他";

        const time =
            form.querySelector(
                ".schedule-time"
            )?.value || "";

        const place =
            form.querySelector(
                ".schedule-place"
            )?.value.trim() || "";

        const detail =
            form.querySelector(
                ".schedule-detail"
            )?.value.trim() || "";

        const memo =
            form.querySelector(
                ".schedule-memo"
            )?.value.trim() || "";

        schedules.push({

            id: Date.now().toString() + "-" + index,

            type: type,

            time: time,

            place: place,

            detail: detail,

            platform: "",

            destination: "",

            memo: memo

        });

    });

    return schedules;
}

/* =========================================================
 * 予算入力欄を追加
 * ========================================================= */

function addBudgetForm() {

    const budgetList =
        document.getElementById("budget-list");

    if (!budgetList) {
        return;
    }

    const budgetForm =
        document.createElement("div");

    budgetForm.className =
        "budget-form";

    budgetForm.innerHTML = `

        <div class="budget-input-row">

            <select class="budget-category">

                <option value="交通費">
                    交通費
                </option>

                <option value="宿泊費">
                    宿泊費
                </option>

                <option value="食費">
                    食費
                </option>

                <option value="観光費">
                    観光費
                </option>

                <option value="お土産">
                    お土産
                </option>

                <option value="その他">
                    その他
                </option>

            </select>

            <input
                type="number"
                class="budget-amount"
                placeholder="金額"
                min="0"
                inputmode="numeric"
            >

            <span>円</span>

        </div>

        <button
            type="button"
            class="budget-delete-button"
        >
            この予算を削除
        </button>

    `;

    const deleteButton =
        budgetForm.querySelector(
            ".budget-delete-button"
        );

    deleteButton.addEventListener(
        "click",
        function () {

            budgetForm.remove();

        }
    );

    budgetList.appendChild(
        budgetForm
    );
}

/* =========================================================
 * 予算データ取得
 * ========================================================= */

function getBudgetData() {

    const budgetList =
        document.getElementById("budget-list");

    if (!budgetList) {
        return [];
    }

    const forms =
        budgetList.querySelectorAll(
            ".budget-form"
        );

    const budgets = [];

    forms.forEach(function (form, index) {

        const category =
            form.querySelector(
                ".budget-category"
            )?.value || "その他";

        const amount =
            Number(
                form.querySelector(
                    ".budget-amount"
                )?.value || 0
            );

        if (amount > 0) {

            budgets.push({

                id:
                    Date.now().toString() +
                    "-" +
                    index,

                name:
                    category,

                category:
                    category,

                amount:
                    amount

            });

        }

    });

    return budgets;
}

/* =========================================================
 * 旅行作成
 * ========================================================= */

function createTrip() {

    const title =
        document.getElementById("trip-title").value.trim();

    const destination =
        document.getElementById("destination").value.trim();

    const startDate =
        document.getElementById("start-date").value;

    const endDate =
        document.getElementById("end-date").value;

    const memo =
        document.getElementById("trip-memo").value.trim();

    const schedules =
        getScheduleData();

    const budgets =
        getBudgetData();


    if (!title) {
        alert("旅行タイトルを入力してください。");
        return;
    }

    if (!destination) {
        alert("旅行先を入力してください。");
        return;
    }

    const trips = getTrips();

    /* =====================================================
       編集の場合
    ===================================================== */

    if (editingTripId) {

        const index = trips.findIndex(function (trip) {
            return trip.id === editingTripId;
        });

        if (index !== -1) {

            trips[index].title = title;
            trips[index].destination = destination;
            trips[index].startDate = startDate;
            trips[index].endDate = endDate;
            trips[index].memo = memo;
            trips[index].schedules = schedules;
            trips[index].budgets = budgets;
            trips[index].updatedAt = Date.now();

            saveTrips(trips);

            alert("しおりを更新しました。");

            editingTripId = null;

            resetTripForm();

            displayTrips();

            return;
        }
    }

    /* =====================================================
       新規作成
    ===================================================== */

    const newTrip = {

        id: Date.now().toString(),

        title: title,

        destination: destination,

        startDate: startDate,

        endDate: endDate,

        memo: memo,

        schedules: schedules,

        budgets: budgets,

        favorite: false,

        createdAt: Date.now(),

        updatedAt: Date.now()

    };

    trips.unshift(newTrip);

    saveTrips(trips);

    alert("旅のしおりを作成しました。");

    resetTripForm();

    displayTrips();
}

/* -----------------------------------------
 * 入力チェック
 * ----------------------------------------- */

if (!title) {

    alert("旅行タイトルを入力してください。");

    titleElement.focus();

    return;
}

if (!destination) {

    alert("旅行先を入力してください。");

    destinationElement.focus();

    return;
}

if (!startDate) {

    alert("旅行開始日を入力してください。");

    startDateElement.focus();

    return;
}

if (!endDate) {

    alert("旅行終了日を入力してください。");

    endDateElement.focus();

    return;
}

if (startDate > endDate) {

    alert(
        "旅行終了日は旅行開始日以降の日付にしてください。"
    );

    endDateElement.focus();

    return;
}

/* -----------------------------------------
 * 日程取得
 * ----------------------------------------- */

const schedules =
    getScheduleData();

const budgets =
    getBudgetData();

/* -----------------------------------------
 * 新しい旅行
 * ----------------------------------------- */

const newTrip = {

    id:
        Date.now().toString(),

    title:
        title,

    destination:
        destination,

    startDate:
        startDate,

    endDate:
        endDate,

    memo:
        memo,

    schedules:
        schedules,

    plans:
        [],

    budgets:
        budgets,

    favorite:
        false,

    createdAt:
        new Date().toISOString()

};

/* -----------------------------------------
 * 保存
 * ----------------------------------------- */

const trips =
    getTrips();

trips.push(newTrip);

const saved =
    saveTrips(trips);

if (!saved) {
    return;
}

/* -----------------------------------------
 * 入力欄をクリア
 * ----------------------------------------- */

titleElement.value = "";

destinationElement.value = "";

startDateElement.value = "";

endDateElement.value = "";

if (memoElement) {
    memoElement.value = "";
}

const scheduleList =
    document.getElementById("schedule-list");

if (scheduleList) {
    scheduleList.innerHTML = "";
}

/* -----------------------------------------
 * 表示更新
 * ----------------------------------------- */

displayTrips();

alert("旅のしおりを作成しました。");

/* =========================================================
 * 旅行カード表示
 * ========================================================= */

function displayTrips() {

    const trips =
        getTrips();

    const tripLists =
        document.querySelectorAll(
            ".trip-list"
        );

    tripLists.forEach(
        function (tripList) {

            let displayTripsData =
                trips;

            /* -----------------------------------------
             * ホーム
             * 最新3件
             * ----------------------------------------- */

            if (
                tripList.id ===
                "home-trip-list"
            ) {

                displayTripsData =
                    trips
                        .slice()
                        .reverse()
                        .slice(0, 3);
            }

            /* -----------------------------------------
             * お気に入り
             * ----------------------------------------- */

            else if (
                tripList.id ===
                "favorite-trip-list"
            ) {

                displayTripsData =
                    trips.filter(
                        function (trip) {
                            return trip.favorite === true;
                        }
                    );

            }

            /* -----------------------------------------
             * 旅行一覧
             * ----------------------------------------- */

            else if (
                tripList.id ===
                "travel-trip-list"
            ) {

                displayTripsData =
                    trips
                        .slice()
                        .reverse();

            }

            /* -----------------------------------------
             * 旅行がない場合
             * ----------------------------------------- */

            if (
                displayTripsData.length === 0
            ) {

                if (
                    tripList.id ===
                    "favorite-trip-list"
                ) {

                    tripList.innerHTML = `

                        <div class="empty-message">

                            <p>⭐</p>

                            <p>
                                お気に入りの旅行はありません。
                            </p>

                        </div>

                    `;

                } else {

                    tripList.innerHTML = `

                        <div class="empty-message">

                            <p>
                                まだ旅行がありません。
                            </p>

                            <p>
                                ホームから新しい旅を作成してください。
                            </p>

                        </div>

                    `;
                }

                return;
            }

            /* -----------------------------------------
             * 旅行カード作成
             * ----------------------------------------- */

            tripList.innerHTML =
                displayTripsData
                    .map(
                        function (trip) {

                            const schedules =
                                Array.isArray(
                                    trip.schedules
                                )
                                    ? trip.schedules
                                    : [];

                            return `

                                <article class="trip-card">

                                    <div class="trip-card-header">

                                        <div>

                                            <h3>
                                                ${escapeHTML(
                                trip.title
                            )}
                                            </h3>

                                            <p class="trip-destination">
                                                ${escapeHTML(
                                trip.destination
                            )}
                                            </p>

                                        </div>

                                        <button
                                            type="button"
                                            class="favorite-button"
                                            onclick="toggleFavorite('${escapeHTML(trip.id)}')"
                                        >
                                            ${trip.favorite
                                    ? "★"
                                    : "☆"
                                }
                                        </button>

                                    </div>

                                    <p class="trip-date">

                                        ${formatDate(
                                    trip.startDate
                                )}

                                        ～

                                        ${formatDate(
                                    trip.endDate
                                )}

                                    </p>

                                    ${schedules.length > 0
                                    ? `
                                                <p class="trip-schedule-count">
                                                    日程 ${schedules.length}件
                                                </p>
                                              `
                                    : ""
                                }

                                    ${trip.memo
                                    ? `
                                                <p class="trip-memo">
                                                    ${escapeHTML(
                                        trip.memo
                                    )}
                                                </p>
                                              `
                                    : ""
                                }

                                    <div class="trip-card-buttons">

                                        <button
                                            type="button"
                                            class="detail-button"
                                            onclick="openTrip('${escapeHTML(trip.id)}')"
                                        >
                                            しおりを見る
                                        </button>

                                        <button
                                            type="button"
                                            class="share-button"
                                            onclick="shareTrip('${escapeHTML(trip.id)}')"
                                        >
                                            🔗 共有する
                                        </button>

                                    </div>

                                    <button
                                        class="edit-trip-button"
                                        onclick="editTrip('${trip.id}')"
                                    >
                                        編集
                                    </button>

                                    <button
                                        type="button"
                                        class="delete-button"
                                        onclick="deleteTrip('${escapeHTML(trip.id)}')"
                                    >
                                        この旅行を削除
                                    </button>

                                </article>

                            `;

                        }
                    )
                    .join("");

        }
    );
}

/* =========================================================
 * 旅行を編集する
 * ========================================================= */

function editTrip(tripId) {

    const trips = getTrips();

    const trip = trips.find(function (item) {
        return item.id === tripId;
    });

    if (!trip) {
        alert("旅行データが見つかりません。");
        return;
    }

    editingTripId = tripId;

    /* 基本情報 */
    document.getElementById("trip-title").value =
        trip.title || "";

    document.getElementById("destination").value =
        trip.destination || "";

    document.getElementById("start-date").value =
        trip.startDate || "";

    document.getElementById("end-date").value =
        trip.endDate || "";

    document.getElementById("trip-memo").value =
        trip.memo || "";

    /* =====================================================
       日程を読み込む
    ===================================================== */

    const scheduleList =
        document.getElementById("schedule-list");

    if (scheduleList) {

        scheduleList.innerHTML = "";

        if (trip.schedules && trip.schedules.length > 0) {

            trip.schedules.forEach(function (schedule) {

                addScheduleForm(schedule);

            });

        }
    }

    /* =====================================================
       予算を読み込む
    ===================================================== */

    const budgetList =
        document.getElementById("budget-list");

    if (budgetList) {

        budgetList.innerHTML = "";

        if (trip.budgets && trip.budgets.length > 0) {

            trip.budgets.forEach(function (budget) {

                addBudgetForm(budget);

            });

        }
    }

    /* ボタンの表示を変更 */
    const createButton =
        document.getElementById("create-trip-button");

    if (createButton) {

        createButton.textContent =
            "✏️ しおりを更新";
    }

    /* キャンセルボタンを表示 */
    let cancelButton =
        document.getElementById("cancel-edit-button");

    if (!cancelButton) {

        cancelButton =
            document.createElement("button");

        cancelButton.type = "button";
        cancelButton.id = "cancel-edit-button";
        cancelButton.className = "secondary-button";

        cancelButton.textContent =
            "編集をキャンセル";

        createButton.parentNode.insertBefore(
            cancelButton,
            createButton
        );

        cancelButton.addEventListener(
            "click",
            cancelEdit
        );
    }

    /* ホーム画面へ移動 */
    window.location.href = "index.html#edit";

}

/* =========================================================
 * お気に入り切り替え
 * ========================================================= */

function toggleFavorite(tripId) {

    const trips =
        getTrips();

    const trip =
        trips.find(
            function (item) {
                return item.id === tripId;
            }
        );

    if (!trip) {
        return;
    }

    trip.favorite =
        !trip.favorite;

    saveTrips(trips);

    displayTrips();
}

/* =========================================================
 * 旅行を見る
 * ========================================================= */

function openTrip(tripId) {

    /*
     * 現時点では、旅行の詳細を
     * share.htmlではなくURLのパラメータで
     * 開く方式にしています。
     */

    const trips =
        getTrips();

    const trip =
        trips.find(
            function (item) {
                return item.id === tripId;
            }
        );

    if (!trip) {

        alert("旅行データが見つかりません。");

        return;
    }

    /*
     * 共有表示と同じ画面を利用
     */

    const data =
        encodeShareData(trip);

    const url =
        "share.html?data=" +
        encodeURIComponent(data);

    window.location.href =
        url;
}

/* =========================================================
 * 旅行削除
 * ========================================================= */

function deleteTrip(tripId) {

    const trips =
        getTrips();

    const trip =
        trips.find(
            function (item) {
                return item.id === tripId;
            }
        );

    if (!trip) {
        return;
    }

    const result =
        confirm(
            "「" +
            trip.title +
            "」を削除しますか？"
        );

    if (!result) {
        return;
    }

    const newTrips =
        trips.filter(
            function (item) {
                return item.id !== tripId;
            }
        );

    saveTrips(newTrips);

    displayTrips();
}

/* =========================================================
 * 全データ削除
 * ========================================================= */

function deleteAllTrips() {

    const trips =
        getTrips();

    if (trips.length === 0) {

        alert("削除する旅行データがありません。");

        return;
    }

    const result =
        confirm(
            "すべての旅行データを削除しますか？\n" +
            "この操作は元に戻せません。"
        );

    if (!result) {
        return;
    }

    localStorage.removeItem(
        STORAGE_KEY
    );

    displayTrips();

    alert("すべての旅行データを削除しました。");
}

/* =========================================================
 * 共有用データをBase64に変換
 * ========================================================= */

function encodeShareData(trip) {

    const json =
        JSON.stringify(trip);

    const bytes =
        new TextEncoder().encode(json);

    let binary = "";

    bytes.forEach(
        function (byte) {
            binary += String.fromCharCode(byte);
        }
    );

    const base64 =
        btoa(binary);

    /*
     * URLに使いやすい形へ変換
     */

    return base64
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

/* =========================================================
 * 共有トークン作成
 * ========================================================= */

function createShareToken() {

    const bytes =
        new Uint8Array(12);

    if (
        window.crypto &&
        crypto.getRandomValues
    ) {

        crypto.getRandomValues(bytes);

    } else {

        for (
            let i = 0;
            i < bytes.length;
            i++
        ) {

            bytes[i] =
                Math.floor(
                    Math.random() * 256
                );
        }
    }

    return Array.from(bytes)
        .map(
            function (byte) {
                return byte
                    .toString(16)
                    .padStart(2, "0");
            }
        )
        .join("");
}

/* =========================================================
 * 共有URL作成
 * ========================================================= */

function createShareURL(trip) {

    const token =
        createShareToken();

    const data =
        encodeShareData(trip);

    const baseURL =
        window.location.href
            .substring(
                0,
                window.location.href.lastIndexOf("/") + 1
            );

    return (
        baseURL +
        "share.html" +
        "?token=" +
        encodeURIComponent(token) +
        "&data=" +
        encodeURIComponent(data)
    );
}

/* =========================================================
 * 共有
 * ========================================================= */

async function shareTrip(tripId) {

    const trips =
        getTrips();

    const trip =
        trips.find(
            function (item) {
                return item.id === tripId;
            }
        );

    if (!trip) {

        alert("旅行データが見つかりません。");

        return;
    }

    const shareURL =
        createShareURL(trip);

    /*
     * スマートフォンの共有機能
     */

    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    "旅のしおり｜" +
                    trip.title,

                text:
                    trip.destination +
                    "の旅のしおりです。",

                url:
                    shareURL

            });

            return;

        } catch (error) {

            /*
             * ユーザーが共有をキャンセルした場合
             * 何もしない
             */

            if (
                error &&
                error.name ===
                "AbortError"
            ) {
                return;
            }

        }
    }

    /*
     * PCなどではコピー
     */

    copyShareURL(shareURL);
}

/* =========================================================
 * 共有URLコピー
 * ========================================================= */

async function copyShareURL(url) {

    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                url
            );

        } else {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                url;

            textarea.style.position =
                "fixed";

            textarea.style.left =
                "-9999px";

            document.body.appendChild(
                textarea
            );

            textarea.focus();

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();
        }

        showShareDialog(url);

    } catch (error) {

        console.error(
            "URLのコピーに失敗しました。",
            error
        );

        showShareDialog(url);
    }
}

/* =========================================================
 * 共有URLダイアログ
 * ========================================================= */

function showShareDialog(url) {

    const oldDialog =
        document.querySelector(
            ".share-dialog"
        );

    if (oldDialog) {
        oldDialog.remove();
    }

    const dialog =
        document.createElement(
            "div"
        );

    dialog.className =
        "share-dialog";

    dialog.innerHTML = `

        <div class="share-dialog-overlay"></div>

        <div class="share-dialog-content">

            <h2>
                共有URLを発行しました
            </h2>

            <p>
                下のURLをコピーして、
                一緒に旅行する人に送ってください。
            </p>


            <textarea
                id="share-url-text"
                readonly
            >${escapeHTML(url)}</textarea>


            <div class="share-dialog-buttons">

                <button
                    type="button"
                    class="primary-button"
                    id="copy-share-url-button"
                >
                    URLをコピー
                </button>


                <button
                    type="button"
                    class="secondary-button"
                    id="close-share-dialog-button"
                >
                    閉じる
                </button>

            </div>

        </div>

    `;

    document.body.appendChild(
        dialog
    );

    const copyButton =
        document.getElementById(
            "copy-share-url-button"
        );

    const closeButton =
        document.getElementById(
            "close-share-dialog-button"
        );

    copyButton.addEventListener(
        "click",
        async function () {

            try {

                await navigator.clipboard.writeText(
                    url
                );

                alert(
                    "共有URLをコピーしました。"
                );

            } catch (error) {

                const textarea =
                    document.getElementById(
                        "share-url-text"
                    );

                textarea.focus();

                textarea.select();

                document.execCommand(
                    "copy"
                );

                alert(
                    "共有URLをコピーしました。"
                );
            }

        }
    );

    closeButton.addEventListener(
        "click",
        function () {

            dialog.remove();

        }
    );

    const overlay =
        dialog.querySelector(
            ".share-dialog-overlay"
        );

    overlay.addEventListener(
        "click",
        function () {

            dialog.remove();

        }
    );
}

/* =========================================================
 * ページ読み込み時
 * ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* -----------------------------------------
         * 旅行作成ボタン
         * ----------------------------------------- */

        const createButton =
            document.getElementById(
                "create-trip-button"
            );

        if (createButton) {

            createButton.addEventListener(
                "click",
                createTrip
            );

        }

        /* -----------------------------------------
         * 日程追加ボタン
         * ----------------------------------------- */

        const addScheduleButton =
            document.getElementById(
                "add-schedule-button"
            );


        if (addScheduleButton) {

            addScheduleButton.addEventListener(
                "click",
                addScheduleForm
            );
        }

        const addBudgetButton =
            document.getElementById(
                "add-budget-button"
            );

        if (addBudgetButton) {

            addBudgetButton.addEventListener(
                "click",
                addBudgetForm
            );

        }

        /* -----------------------------------------
         * 全データ削除
         * ----------------------------------------- */

        const deleteAllButton =
            document.getElementById(
                "delete-all-data-button"
            );

        if (deleteAllButton) {

            deleteAllButton.addEventListener(
                "click",
                deleteAllTrips
            );

        }

        /* -----------------------------------------
         * 旅行一覧表示
         * ----------------------------------------- */

        displayTrips();

    }
);

/* =========================================================
 * 旅行作成フォームをリセット
 * ========================================================= */

function resetTripForm() {

    editingTripId = null;

    document.getElementById("trip-title").value = "";
    document.getElementById("destination").value = "";
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    document.getElementById("trip-memo").value = "";

    const scheduleList =
        document.getElementById("schedule-list");

    if (scheduleList) {
        scheduleList.innerHTML = "";
    }

    const budgetList =
        document.getElementById("budget-list");

    if (budgetList) {
        budgetList.innerHTML = "";
    }

    const createButton =
        document.getElementById("create-trip-button");

    if (createButton) {
        createButton.textContent =
            "＋ 旅のしおりを作成";
    }

    const cancelButton =
        document.getElementById("cancel-edit-button");

    if (cancelButton) {
        cancelButton.remove();
    }
}