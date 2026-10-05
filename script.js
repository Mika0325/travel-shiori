/* =========================================================
 * 旅のしおり
 * 共通JavaScript
 * ========================================================= */


/* =========================================================
 * 設定
 * ========================================================= */

const STORAGE_KEY = "travel-shiori-data";


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
 * 予算の種類
 * ========================================================= */

const BUDGET_CATEGORIES = [
    "交通費",
    "宿泊費",
    "食費",
    "観光費",
    "お土産",
    "その他"
];


/* =========================================================
 * 編集中の旅行ID
 * ========================================================= */

let editingTripId = null;


/* =========================================================
 * データ取得
 * ========================================================= */

function getTrips() {

    const data =
        localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return [];
    }

    try {

        const trips = JSON.parse(data);

        if (Array.isArray(trips)) {
            return trips;
        }

        return [];

    } catch (error) {

        console.error(
            "旅行データの読み込みに失敗しました。",
            error
        );

        return [];
    }
}


/* =========================================================
 * データ保存
 * ========================================================= */

function saveTrips(trips) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(trips)
    );
}


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

    const date =
        new Date(dateString + "T00:00:00");

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return (
        date.getFullYear() +
        "年" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "月" +
        String(date.getDate()).padStart(2, "0") +
        "日"
    );
}


/* =========================================================
 * 日付の範囲表示
 * ========================================================= */

function formatDateRange(startDate, endDate) {

    if (!startDate && !endDate) {
        return "";
    }

    if (!endDate || startDate === endDate) {
        return formatDate(startDate);
    }

    return (
        formatDate(startDate) +
        " ～ " +
        formatDate(endDate)
    );
}


/* =========================================================
 * 日程入力欄を追加
 *
 * 新規作成：
 * addScheduleForm()
 *
 * 編集：
 * addScheduleForm(schedule)
 * ========================================================= */

function addScheduleForm(schedule = null) {

    const scheduleList =
        document.getElementById("schedule-list");

    if (!scheduleList) {
        return;
    }

    const scheduleForm =
        document.createElement("div");

    scheduleForm.className =
        "schedule-form";


    /* -----------------------------------------
     * 保存済みデータ
     * ----------------------------------------- */

    const selectedType =
        schedule && schedule.type
            ? schedule.type
            : "その他";

    const scheduleTime =
        schedule && schedule.time
            ? schedule.time
            : "";

    const schedulePlace =
        schedule && schedule.place
            ? schedule.place
            : "";

    const scheduleDetail =
        schedule && schedule.detail
            ? schedule.detail
            : "";

    const scheduleMemo =
        schedule && schedule.memo
            ? schedule.memo
            : "";


    /* -----------------------------------------
     * HTML作成
     * ----------------------------------------- */

    scheduleForm.innerHTML = `

        <div class="form-group">

            <label>種類</label>

            <select class="schedule-type">

                ${SCHEDULE_TYPES.map(function (type) {

        return `
                        <option
                            value="${escapeHTML(type.value)}"
                            ${selectedType === type.value ? "selected" : ""}
                        >
                            ${escapeHTML(type.label)}
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
                value="${escapeHTML(scheduleTime)}"
            >

        </div>


        <div class="form-group">

            <label>場所・内容</label>

            <input
                type="text"
                class="schedule-place"
                placeholder="例：京都駅"
                value="${escapeHTML(schedulePlace)}"
            >

        </div>


        <div class="form-group">

            <label>交通手段・詳細</label>

            <input
                type="text"
                class="schedule-detail"
                placeholder="例：〇〇線〇〇行き〇番ホーム"
                value="${escapeHTML(scheduleDetail)}"
            >

        </div>


        <div class="form-group">

            <label>メモ</label>

            <input
                type="text"
                class="schedule-memo"
                placeholder="例：10分前にホームへ"
                value="${escapeHTML(scheduleMemo)}"
            >

        </div>


        <button
            type="button"
            class="schedule-delete-button"
        >
            この日程を削除
        </button>

    `;


    /* -----------------------------------------
     * 削除ボタン
     * ----------------------------------------- */

    const deleteButton =
        scheduleForm.querySelector(
            ".schedule-delete-button"
        );

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            function () {

                scheduleForm.remove();

            }
        );

    }


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
            );

        const time =
            form.querySelector(
                ".schedule-time"
            );

        const place =
            form.querySelector(
                ".schedule-place"
            );

        const detail =
            form.querySelector(
                ".schedule-detail"
            );

        const memo =
            form.querySelector(
                ".schedule-memo"
            );


        schedules.push({

            id:
                Date.now().toString() +
                "-schedule-" +
                index,

            type:
                type ? type.value : "その他",

            time:
                time ? time.value : "",

            place:
                place ? place.value : "",

            detail:
                detail ? detail.value : "",

            memo:
                memo ? memo.value : ""

        });

    });


    return schedules;
}


/* =========================================================
 * 予算入力欄を追加
 *
 * 新規：
 * addBudgetForm()
 *
 * 編集：
 * addBudgetForm(budget)
 * ========================================================= */

function addBudgetForm(budget = null) {

    const budgetList =
        document.getElementById("budget-list");

    if (!budgetList) {
        return;
    }

    const budgetForm =
        document.createElement("div");

    budgetForm.className =
        "budget-form";


    const selectedCategory =
        budget && (
            budget.category ||
            budget.name
        )
            ? (
                budget.category ||
                budget.name
            )
            : "交通費";


    const amount =
        budget && budget.amount !== undefined
            ? budget.amount
            : "";


    budgetForm.innerHTML = `

        <div class="budget-input-row">

            <select class="budget-category">

                ${BUDGET_CATEGORIES.map(function (category) {

        return `
                        <option
                            value="${escapeHTML(category)}"
                            ${selectedCategory === category
                ? "selected"
                : ""
            }
                        >
                            ${escapeHTML(category)}
                        </option>
                    `;

    }).join("")}

            </select>


            <input
                type="number"
                class="budget-amount"
                placeholder="0"
                min="0"
                value="${escapeHTML(amount)}"
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

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            function () {

                budgetForm.remove();

            }
        );

    }


    budgetList.appendChild(budgetForm);
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
            );

        const amount =
            form.querySelector(
                ".budget-amount"
            );


        const categoryValue =
            category
                ? category.value
                : "その他";


        const amountValue =
            amount && amount.value !== ""
                ? Number(amount.value)
                : 0;


        budgets.push({

            id:
                Date.now().toString() +
                "-budget-" +
                index,

            name:
                categoryValue,

            category:
                categoryValue,

            amount:
                amountValue

        });

    });


    return budgets;
}


/* =========================================================
 * 予算合計
 * ========================================================= */

function getBudgetTotal(budgets) {

    if (!Array.isArray(budgets)) {
        return 0;
    }

    return budgets.reduce(
        function (total, budget) {

            return total +
                Number(budget.amount || 0);

        },
        0
    );
}


/* =========================================================
 * 金額表示
 * ========================================================= */

function formatMoney(amount) {

    return Number(amount || 0)
        .toLocaleString("ja-JP");
}


/* =========================================================
 * 新しい旅行を作成
 *
 * 編集中の場合は既存データを更新
 * ========================================================= */

function createTrip() {

    const titleInput =
        document.getElementById("trip-title");

    const destinationInput =
        document.getElementById("destination");

    const startDateInput =
        document.getElementById("start-date");

    const endDateInput =
        document.getElementById("end-date");

    const memoInput =
        document.getElementById("trip-memo");


    const title =
        titleInput
            ? titleInput.value.trim()
            : "";

    const destination =
        destinationInput
            ? destinationInput.value.trim()
            : "";

    const startDate =
        startDateInput
            ? startDateInput.value
            : "";

    const endDate =
        endDateInput
            ? endDateInput.value
            : "";

    const memo =
        memoInput
            ? memoInput.value.trim()
            : "";


    /* -----------------------------------------
     * 入力チェック
     * ----------------------------------------- */

    if (!title) {

        alert(
            "旅行のタイトルを入力してください。"
        );

        if (titleInput) {
            titleInput.focus();
        }

        return;
    }


    if (!destination) {

        alert(
            "旅行先を入力してください。"
        );

        if (destinationInput) {
            destinationInput.focus();
        }

        return;
    }


    if (
        startDate &&
        endDate &&
        startDate > endDate
    ) {

        alert(
            "終了日は開始日以降の日付にしてください。"
        );

        return;
    }


    /* -----------------------------------------
     * 入力データ
     * ----------------------------------------- */

    const schedules =
        getScheduleData();

    const budgets =
        getBudgetData();


    const trips =
        getTrips();


    /* =================================================
     * 編集
     * ================================================= */

    if (editingTripId) {

        const trip =
            trips.find(function (item) {

                return item.id === editingTripId;

            });


        if (!trip) {

            alert(
                "編集するしおりが見つかりません。"
            );

            editingTripId = null;

            return;
        }


        trip.title =
            title;

        trip.destination =
            destination;

        trip.startDate =
            startDate;

        trip.endDate =
            endDate;

        trip.memo =
            memo;

        trip.schedules =
            schedules;

        trip.budgets =
            budgets;

        trip.updatedAt =
            new Date().toISOString();


        saveTrips(trips);


        alert(
            "しおりを更新しました。"
        );


        resetTripForm();


        displayTrips();


        return;
    }


    /* =================================================
     * 新規作成
     * ================================================= */

    const now =
        new Date().toISOString();


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

        budgets:
            budgets,

        favorite:
            false,

        createdAt:
            now,

        updatedAt:
            now

    };


    trips.push(newTrip);


    saveTrips(trips);


    alert(
        "しおりを作成しました。"
    );


    resetTripForm();


    displayTrips();
}


/* =========================================================
 * 入力フォームをリセット
 * ========================================================= */

function resetTripForm() {

    editingTripId = null;


    const titleInput =
        document.getElementById("trip-title");

    const destinationInput =
        document.getElementById("destination");

    const startDateInput =
        document.getElementById("start-date");

    const endDateInput =
        document.getElementById("end-date");

    const memoInput =
        document.getElementById("trip-memo");


    if (titleInput) {
        titleInput.value = "";
    }

    if (destinationInput) {
        destinationInput.value = "";
    }

    if (startDateInput) {
        startDateInput.value = "";
    }

    if (endDateInput) {
        endDateInput.value = "";
    }

    if (memoInput) {
        memoInput.value = "";
    }


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
        document.getElementById(
            "create-trip-button"
        );

    if (createButton) {

        createButton.textContent =
            "しおりを作成";

    }


    const cancelButton =
        document.getElementById(
            "cancel-edit-button"
        );

    if (cancelButton) {
        cancelButton.remove();
    }
}


/* =========================================================
 * 編集モードにする
 * ========================================================= */

function editTrip(tripId) {

    const trips =
        getTrips();


    const trip =
        trips.find(function (item) {

            return item.id === tripId;

        });


    if (!trip) {

        alert(
            "編集するしおりが見つかりません。"
        );

        return;
    }


    /* -----------------------------------------
     * 編集対象を保存
     * ----------------------------------------- */

    editingTripId =
        trip.id;


    /* -----------------------------------------
     * 入力欄へ設定
     * ----------------------------------------- */

    const titleInput =
        document.getElementById("trip-title");

    const destinationInput =
        document.getElementById("destination");

    const startDateInput =
        document.getElementById("start-date");

    const endDateInput =
        document.getElementById("end-date");

    const memoInput =
        document.getElementById("trip-memo");


    if (titleInput) {
        titleInput.value =
            trip.title || "";
    }

    if (destinationInput) {
        destinationInput.value =
            trip.destination || "";
    }

    if (startDateInput) {
        startDateInput.value =
            trip.startDate || "";
    }

    if (endDateInput) {
        endDateInput.value =
            trip.endDate || "";
    }

    if (memoInput) {
        memoInput.value =
            trip.memo || "";
    }


    /* -----------------------------------------
     * 日程を復元
     * ----------------------------------------- */

    const scheduleList =
        document.getElementById(
            "schedule-list"
        );

    if (scheduleList) {

        scheduleList.innerHTML = "";


        if (
            Array.isArray(trip.schedules)
        ) {

            trip.schedules.forEach(
                function (schedule) {

                    addScheduleForm(
                        schedule
                    );

                }
            );

        }
    }


    /* -----------------------------------------
     * 予算を復元
     * ----------------------------------------- */

    const budgetList =
        document.getElementById(
            "budget-list"
        );

    if (budgetList) {

        budgetList.innerHTML = "";


        if (
            Array.isArray(trip.budgets)
        ) {

            trip.budgets.forEach(
                function (budget) {

                    addBudgetForm(
                        budget
                    );

                }
            );

        }
    }


    /* -----------------------------------------
     * 作成ボタンを更新ボタンに変更
     * ----------------------------------------- */

    const createButton =
        document.getElementById(
            "create-trip-button"
        );

    if (createButton) {

        createButton.textContent =
            "しおりを更新";

    }


    /* -----------------------------------------
     * キャンセルボタン
     * ----------------------------------------- */

    let cancelButton =
        document.getElementById(
            "cancel-edit-button"
        );


    if (!cancelButton) {

        cancelButton =
            document.createElement("button");

        cancelButton.type =
            "button";

        cancelButton.id =
            "cancel-edit-button";

        cancelButton.className =
            "secondary-button";

        cancelButton.textContent =
            "編集をキャンセル";


        cancelButton.addEventListener(
            "click",
            function () {

                resetTripForm();

            }
        );


        if (createButton) {

            createButton.parentNode.insertBefore(
                cancelButton,
                createButton.nextSibling
            );

        }

    }


    /* -----------------------------------------
     * ホームページへ移動
     * ----------------------------------------- */

    if (
        !window.location.pathname.endsWith(
            "index.html"
        ) &&
        !window.location.pathname.endsWith("/")
    ) {

        window.location.href =
            "index.html?edit=" +
            encodeURIComponent(tripId);

        return;
    }


    /* -----------------------------------------
     * 入力欄までスクロール
     * ----------------------------------------- */

    const form =
        document.getElementById(
            "create-trip-button"
        );

    if (form) {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
}


/* =========================================================
 * URLの編集指定を確認
 * ========================================================= */

function checkEditParameter() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const editId =
        params.get("edit");


    if (!editId) {
        return;
    }


    const trips =
        getTrips();


    const trip =
        trips.find(function (item) {

            return item.id === editId;

        });


    if (!trip) {
        return;
    }


    /* -----------------------------------------
     * 少し待ってから編集フォームを表示
     * ----------------------------------------- */

    setTimeout(
        function () {

            editTripFromHome(
                trip
            );

        },
        100
    );
}


/* =========================================================
 * ホーム画面で編集フォームを開く
 * ========================================================= */

function editTripFromHome(trip) {

    editingTripId =
        trip.id;


    const titleInput =
        document.getElementById("trip-title");

    const destinationInput =
        document.getElementById("destination");

    const startDateInput =
        document.getElementById("start-date");

    const endDateInput =
        document.getElementById("end-date");

    const memoInput =
        document.getElementById("trip-memo");


    if (titleInput) {
        titleInput.value =
            trip.title || "";
    }

    if (destinationInput) {
        destinationInput.value =
            trip.destination || "";
    }

    if (startDateInput) {
        startDateInput.value =
            trip.startDate || "";
    }

    if (endDateInput) {
        endDateInput.value =
            trip.endDate || "";
    }

    if (memoInput) {
        memoInput.value =
            trip.memo || "";
    }


    /* -----------------------------------------
     * 日程
     * ----------------------------------------- */

    const scheduleList =
        document.getElementById(
            "schedule-list"
        );

    if (scheduleList) {

        scheduleList.innerHTML = "";

        if (
            Array.isArray(trip.schedules)
        ) {

            trip.schedules.forEach(
                function (schedule) {

                    addScheduleForm(
                        schedule
                    );

                }
            );

        }
    }


    /* -----------------------------------------
     * 予算
     * ----------------------------------------- */

    const budgetList =
        document.getElementById(
            "budget-list"
        );

    if (budgetList) {

        budgetList.innerHTML = "";

        if (
            Array.isArray(trip.budgets)
        ) {

            trip.budgets.forEach(
                function (budget) {

                    addBudgetForm(
                        budget
                    );

                }
            );

        }
    }


    /* -----------------------------------------
     * ボタン
     * ----------------------------------------- */

    const createButton =
        document.getElementById(
            "create-trip-button"
        );

    if (createButton) {

        createButton.textContent =
            "しおりを更新";

    }


    addCancelEditButton();


    /* -----------------------------------------
     * 編集フォームまで移動
     * ----------------------------------------- */

    if (createButton) {

        createButton.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
}


/* =========================================================
 * 編集キャンセルボタン
 * ========================================================= */

function addCancelEditButton() {

    const createButton =
        document.getElementById(
            "create-trip-button"
        );

    if (!createButton) {
        return;
    }


    if (
        document.getElementById(
            "cancel-edit-button"
        )
    ) {
        return;
    }


    const cancelButton =
        document.createElement("button");

    cancelButton.type =
        "button";

    cancelButton.id =
        "cancel-edit-button";

    cancelButton.className =
        "secondary-button";

    cancelButton.textContent =
        "編集をキャンセル";


    cancelButton.addEventListener(
        "click",
        function () {

            resetTripForm();

        }
    );


    createButton.parentNode.insertBefore(
        cancelButton,
        createButton.nextSibling
    );
}


/* =========================================================
 * 旅行一覧を表示
 * ========================================================= */

function displayTrips() {

    const trips =
        getTrips();


    /* -----------------------------------------
     * ホーム
     * ----------------------------------------- */

    const homeList =
        document.getElementById(
            "home-trip-list"
        );

    if (homeList) {

        displayTripList(
            homeList,
            trips.slice().reverse()
        );

    }


    /* -----------------------------------------
     * 旅行ページ
     * ----------------------------------------- */

    const travelList =
        document.getElementById(
            "travel-trip-list"
        );

    if (travelList) {

        displayTripList(
            travelList,
            trips.slice().reverse()
        );

    }


    /* -----------------------------------------
     * お気に入り
     * ----------------------------------------- */

    const favoriteTripList =
        document.getElementById(
            "favorite-trip-list"
        );

    const favoritePlanList =
        document.getElementById(
            "favorite-plan-list"
        );


    if (
        favoriteTripList ||
        favoritePlanList
    ) {

        const favoriteTrips =
            trips.filter(function (trip) {

                return trip.favorite === true;

            });


        if (favoriteTripList) {

            displayTripList(
                favoriteTripList,
                favoriteTrips
            );

        }


        if (favoritePlanList) {

            displayTripList(
                favoritePlanList,
                favoriteTrips
            );

        }

    }
}


/* =========================================================
 * 旅行カード一覧
 * ========================================================= */

function displayTripList(
    container,
    trips
) {

    if (!container) {
        return;
    }


    if (!trips.length) {

        container.innerHTML = `
            <p class="empty-message">
                まだしおりがありません。
            </p>
        `;

        return;
    }


    container.innerHTML =
        trips.map(function (trip) {

            const totalBudget =
                getBudgetTotal(
                    trip.budgets
                );


            return `

                <article
                    class="trip-card"
                >

                    <div class="trip-card-header">

                        <div>

                            <h3>
                                ${escapeHTML(
                trip.title
            )}
                            </h3>

                            <p>
                                ${escapeHTML(
                trip.destination
            )}
                            </p>

                        </div>


                        <button
                            type="button"
                            class="favorite-button ${trip.favorite
                    ? "is-favorite"
                    : ""
                }"
                            onclick="toggleFavorite('${trip.id}')"
                        >
                            ${trip.favorite
                    ? "お気に入り"
                    : "お気に入りに追加"
                }
                        </button>

                    </div>


                    <div class="trip-card-date">

                        ${formatDateRange(
                    trip.startDate,
                    trip.endDate
                )
                }

                    </div>


                    ${trip.memo
                    ? `
                                <p class="trip-card-memo">
                                    ${escapeHTML(
                        trip.memo
                    )}
                                </p>
                            `
                    : ""
                }


                    ${Array.isArray(trip.schedules) &&
                    trip.schedules.length
                    ? `
                                <p class="trip-card-info">
                                    日程：
                                    ${trip.schedules.length}件
                                </p>
                            `
                    : ""
                }


                    ${Array.isArray(trip.budgets) &&
                    trip.budgets.length
                    ? `
                                <p class="trip-card-info">
                                    予算：
                                    ${formatMoney(
                        totalBudget
                    )}円
                                </p>
                            `
                    : ""
                }


                    <div class="trip-card-buttons">

                        <button
                            type="button"
                            class="view-trip-button"
                            onclick="openTrip('${trip.id}')"
                        >
                            しおりを見る
                        </button>


                        <button
                            type="button"
                            class="edit-trip-button"
                            onclick="editTrip('${trip.id}')"
                        >
                            編集
                        </button>


                        <button
                            type="button"
                            class="delete-trip-button"
                            onclick="deleteTrip('${trip.id}')"
                        >
                            削除
                        </button>


                        <button
                            type="button"
                            class="share-trip-button"
                            onclick="shareTrip('${trip.id}')"
                        >
                            共有
                        </button>

                    </div>

                </article>

            `;

        }).join("");
}


/* =========================================================
 * お気に入り切り替え
 * ========================================================= */

function toggleFavorite(tripId) {

    const trips =
        getTrips();


    const trip =
        trips.find(function (item) {

            return item.id === tripId;

        });


    if (!trip) {
        return;
    }


    trip.favorite =
        !trip.favorite;


    trip.updatedAt =
        new Date().toISOString();


    saveTrips(trips);


    displayTrips();
}


/* =========================================================
 * 旅行を開く
 * ========================================================= */

function openTrip(tripId) {

    const trips =
        getTrips();


    const trip =
        trips.find(function (item) {

            return item.id === tripId;

        });


    if (!trip) {

        alert(
            "しおりが見つかりません。"
        );

        return;
    }


    /* -----------------------------------------
     * 旅行詳細を表示
     * ----------------------------------------- */

    const scheduleText =
        Array.isArray(trip.schedules)
            ? trip.schedules.map(
                function (schedule) {

                    return (
                        (schedule.time
                            ? schedule.time + " "
                            : "") +

                        (schedule.type
                            ? schedule.type + " "
                            : "") +

                        (schedule.place
                            ? schedule.place + " "
                            : "") +

                        (schedule.detail
                            ? schedule.detail + " "
                            : "") +

                        (schedule.memo
                            ? "(" +
                            schedule.memo +
                            ")"
                            : "")
                    );

                }
            ).join("\n")
            : "";


    const budgetTotal =
        getBudgetTotal(
            trip.budgets
        );


    let message =
        "【" +
        trip.title +
        "】\n\n";


    message +=
        "旅行先：" +
        trip.destination +
        "\n";


    message +=
        "日程：" +
        formatDateRange(
            trip.startDate,
            trip.endDate
        ) +
        "\n";


    if (trip.memo) {

        message +=
            "\nメモ：\n" +
            trip.memo +
            "\n";

    }


    if (scheduleText) {

        message +=
            "\n【日程】\n" +
            scheduleText +
            "\n";

    }


    if (trip.budgets &&
        trip.budgets.length) {

        message +=
            "\n【予算】\n";


        trip.budgets.forEach(
            function (budget) {

                message +=
                    (
                        budget.category ||
                        budget.name ||
                        "その他"
                    ) +
                    "：" +
                    formatMoney(
                        budget.amount
                    ) +
                    "円\n";

            }
        );


        message +=
            "合計：" +
            formatMoney(
                budgetTotal
            ) +
            "円\n";
    }


    alert(message);
}


/* =========================================================
 * 旅行削除
 * ========================================================= */

function deleteTrip(tripId) {

    const trips =
        getTrips();


    const trip =
        trips.find(function (item) {

            return item.id === tripId;

        });


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
        trips.filter(function (item) {

            return item.id !== tripId;

        });


    saveTrips(newTrips);


    displayTrips();
}


/* =========================================================
 * 全データ削除
 * ========================================================= */

function deleteAllTrips() {

    const trips =
        getTrips();


    if (!trips.length) {

        alert(
            "削除するデータがありません。"
        );

        return;
    }


    const result =
        confirm(
            "保存されているすべてのしおりを削除しますか？\nこの操作は元に戻せません。"
        );


    if (!result) {
        return;
    }


    localStorage.removeItem(
        STORAGE_KEY
    );


    displayTrips();


    alert(
        "すべてのしおりを削除しました。"
    );
}


/* =========================================================
 * 共有URL用データをエンコード
 * ========================================================= */

function encodeShareData(trip) {

    const json =
        JSON.stringify(trip);


    const bytes =
        new TextEncoder().encode(json);


    let binary = "";


    bytes.forEach(function (byte) {

        binary += String.fromCharCode(
            byte
        );

    });


    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}


/* =========================================================
 * 共有URL用データをデコード
 * ========================================================= */

function decodeShareData(encoded) {

    try {

        let base64 =
            encoded
                .replace(/-/g, "+")
                .replace(/_/g, "/");


        while (
            base64.length % 4 !== 0
        ) {

            base64 += "=";

        }


        const binary =
            atob(base64);


        const bytes =
            Uint8Array.from(
                binary,
                function (character) {

                    return character.charCodeAt(0);

                }
            );


        const json =
            new TextDecoder().decode(
                bytes
            );


        return JSON.parse(json);

    } catch (error) {

        console.error(
            "共有データの読み込みに失敗しました。",
            error
        );

        return null;
    }
}


/* =========================================================
 * 共有トークン作成
 * ========================================================= */

function createShareToken() {

    if (
        window.crypto &&
        window.crypto.getRandomValues
    ) {

        const array =
            new Uint32Array(2);


        window.crypto.getRandomValues(
            array
        );


        return (
            array[0].toString(36) +
            array[1].toString(36)
        );

    }


    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );
}


/* =========================================================
 * 共有URL作成
 * ========================================================= */

function createShareURL(trip) {

    const token =
        createShareToken();


    const data =
        encodeShareData(trip);


    const sharePage =
        new URL(
            "share.html",
            window.location.href
        );


    sharePage.searchParams.set(
        "token",
        token
    );


    sharePage.searchParams.set(
        "data",
        data
    );


    return sharePage.href;
}


/* =========================================================
 * 共有
 * ========================================================= */

function shareTrip(tripId) {

    const trips =
        getTrips();


    const trip =
        trips.find(function (item) {

            return item.id === tripId;

        });


    if (!trip) {

        alert(
            "共有するしおりが見つかりません。"
        );

        return;
    }


    const url =
        createShareURL(trip);


    copyShareURL(url);
}


/* =========================================================
 * 共有URLコピー
 * ========================================================= */

function copyShareURL(url) {

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard.writeText(
            url
        )
            .then(function () {

                showShareDialog(url);

            })
            .catch(function () {

                showShareDialog(url);

            });

        return;
    }


    showShareDialog(url);
}


/* =========================================================
 * 共有URL表示
 * ========================================================= */

function showShareDialog(url) {

    const result =
        confirm(
            "共有URLを作成しました。\n\nURLをコピーできない場合は「キャンセル」を押して、表示されたURLを確認してください。"
        );


    if (result) {

        /* -----------------------------------------
         * もう一度コピーを試す
         * ----------------------------------------- */

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            navigator.clipboard.writeText(
                url
            );

        }

    }


    /* -----------------------------------------
     * URLを画面上でも確認できるようにする
     * ----------------------------------------- */

    const shareWindow =
        window.open(
            "",
            "_blank",
            "width=600,height=500"
        );


    if (shareWindow) {

        shareWindow.document.write(`

            <!DOCTYPE html>

            <html lang="ja">

            <head>

                <meta charset="UTF-8">

                <title>共有URL</title>

                <style>

                    body {
                        font-family:
                            sans-serif;
                        padding: 30px;
                        line-height: 1.7;
                    }

                    textarea {
                        width: 100%;
                        height: 180px;
                        box-sizing:
                            border-box;
                        padding: 10px;
                    }

                    button {
                        margin-top: 15px;
                        padding: 10px 20px;
                    }

                </style>

            </head>

            <body>

                <h2>共有URL</h2>

                <p>
                    以下のURLをコピーして
                    共有してください。
                </p>

                <textarea
                    id="share-url"
                    readonly
                >${escapeHTML(url)}</textarea>

                <br>

                <button
                    onclick="
                        navigator.clipboard.writeText(
                            document.getElementById('share-url').value
                        );
                    "
                >
                    URLをコピー
                </button>

            </body>

            </html>

        `);


        shareWindow.document.close();

    }
}


/* =========================================================
 * 共有ページ用
 *
 * share.htmlから必要な場合に利用
 * ========================================================= */

function getSharedTripFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const encodedData =
        params.get("data");


    if (!encodedData) {
        return null;
    }


    return decodeShareData(
        encodedData
    );
}


/* =========================================================
 * 旅行データを正規化
 *
 * 古いデータにも対応
 * ========================================================= */

function normalizeTrip(trip) {

    if (!trip) {
        return null;
    }


    if (!Array.isArray(trip.schedules)) {
        trip.schedules = [];
    }


    if (!Array.isArray(trip.budgets)) {
        trip.budgets = [];
    }


    trip.schedules =
        trip.schedules.map(
            function (schedule) {

                return {

                    id:
                        schedule.id ||
                        Date.now()
                            .toString(),

                    type:
                        schedule.type ||
                        "その他",

                    time:
                        schedule.time ||
                        "",

                    place:
                        schedule.place ||
                        schedule.location ||
                        "",

                    detail:
                        schedule.detail ||
                        "",

                    memo:
                        schedule.memo ||
                        ""

                };

            }
        );


    trip.budgets =
        trip.budgets.map(
            function (budget) {

                const category =
                    budget.category ||
                    budget.name ||
                    "その他";


                return {

                    id:
                        budget.id ||
                        Date.now()
                            .toString(),

                    name:
                        category,

                    category:
                        category,

                    amount:
                        Number(
                            budget.amount || 0
                        )

                };

            }
        );


    return trip;
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
                function () {

                    createTrip();

                }
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
                function () {

                    addScheduleForm();

                }
            );

        }


        /* -----------------------------------------
         * 予算追加ボタン
         * ----------------------------------------- */

        const addBudgetButton =
            document.getElementById(
                "add-budget-button"
            );


        if (addBudgetButton) {

            addBudgetButton.addEventListener(
                "click",
                function () {

                    addBudgetForm();

                }
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
                function () {

                    deleteAllTrips();

                }
            );

        }


        /* -----------------------------------------
         * 旅行一覧表示
         * ----------------------------------------- */

        displayTrips();


        /* -----------------------------------------
         * 編集URL確認
         * ----------------------------------------- */

        if (
            window.location.pathname.endsWith(
                "index.html"
            ) ||
            window.location.pathname.endsWith("/")
        ) {

            checkEditParameter();

        }

    }
);


/* =========================================================
 * Service Worker登録
 * ========================================================= */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    function (registration) {

                        console.log(
                            "Service Workerを登録しました。",
                            registration
                        );

                    }
                )
                .catch(
                    function (error) {

                        console.error(
                            "Service Workerの登録に失敗しました。",
                            error
                        );

                    }
                );

        }
    );
}