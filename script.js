"use strict";

/* =========================================================
   基本設定
   ========================================================= */

const STORAGE_KEY = "travel-shiori-data";


/* =========================================================
   日程の種類
   ========================================================= */

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
   予算カテゴリー
   ========================================================= */

const BUDGET_CATEGORIES = [
    "交通費",
    "宿泊費",
    "食費",
    "観光費",
    "お土産",
    "その他"
];


/* =========================================================
   編集中の旅行ID
   ========================================================= */

let editingTripId = null;


/* =========================================================
   データ取得
   ========================================================= */

function getTrips() {

    const data =
        localStorage.getItem(STORAGE_KEY);


    if (!data) {
        return [];
    }


    try {

        const trips =
            JSON.parse(data);


        if (!Array.isArray(trips)) {
            return [];
        }


        return trips;

    } catch (error) {

        console.error(
            "旅行データの読み込みに失敗しました。",
            error
        );

        return [];
    }
}


/* =========================================================
   データ保存
   ========================================================= */

function saveTrips(trips) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(trips)
    );
}


/* =========================================================
   HTMLエスケープ
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
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
   日付表示
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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
   日付範囲
   ========================================================= */

function formatDateRange(
    startDate,
    endDate
) {

    if (
        !startDate &&
        !endDate
    ) {
        return "";
    }


    if (
        !endDate ||
        startDate === endDate
    ) {
        return formatDate(startDate);
    }


    return (
        formatDate(startDate) +
        " ～ " +
        formatDate(endDate)
    );
}


/* =========================================================
   日程入力フォーム
   ========================================================= */

function addScheduleForm(
    schedule = null
) {

    const scheduleList =
        document.getElementById(
            "schedule-list"
        );


    if (!scheduleList) {
        return;
    }


    const scheduleForm =
        document.createElement("div");


    scheduleForm.className =
        "schedule-form";


    scheduleForm.innerHTML = `

        <div class="form-group">

            <label>
                種類
            </label>

            <select class="schedule-type">

                ${SCHEDULE_TYPES.map(
        function (type) {

            return `
                            <option value="${type.value}">
                                ${type.label}
                            </option>
                        `;

        }
    ).join("")}

            </select>

        </div>


        <div class="form-group">

            <label>
                時間
            </label>

            <input
                type="time"
                class="schedule-time"
            >

        </div>


        <div class="form-group">

            <label>
                場所・内容
            </label>

            <input
                type="text"
                class="schedule-place"
                placeholder="例：京都駅"
            >

        </div>


        <div class="form-group">

            <label>
                交通手段・詳細
            </label>

            <input
                type="text"
                class="schedule-detail"
                placeholder="例：〇〇線〇〇行き〇番ホーム"
            >

        </div>


        <div class="form-group">

            <label>
                メモ
            </label>

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


    /* -----------------------------------------
       編集時の値
       ----------------------------------------- */

    if (schedule) {

        const typeInput =
            scheduleForm.querySelector(
                ".schedule-type"
            );


        const timeInput =
            scheduleForm.querySelector(
                ".schedule-time"
            );


        const placeInput =
            scheduleForm.querySelector(
                ".schedule-place"
            );


        const detailInput =
            scheduleForm.querySelector(
                ".schedule-detail"
            );


        const memoInput =
            scheduleForm.querySelector(
                ".schedule-memo"
            );


        if (typeInput) {

            typeInput.value =
                schedule.type ||
                "その他";
        }


        if (timeInput) {

            timeInput.value =
                schedule.time ||
                "";
        }


        if (placeInput) {

            placeInput.value =
                schedule.place ||
                "";
        }


        if (detailInput) {

            detailInput.value =
                schedule.detail ||
                "";
        }


        if (memoInput) {

            memoInput.value =
                schedule.memo ||
                "";
        }
    }


    /* -----------------------------------------
       削除
       ----------------------------------------- */

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


    scheduleList.appendChild(
        scheduleForm
    );
}


/* =========================================================
   日程データ取得
   ========================================================= */

function getScheduleData() {

    const scheduleForms =
        document.querySelectorAll(
            ".schedule-form"
        );


    const schedules = [];


    scheduleForms.forEach(
        function (form) {

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

                type:
                    type
                        ? type.value
                        : "その他",

                time:
                    time
                        ? time.value
                        : "",

                place:
                    place
                        ? place.value
                        : "",

                detail:
                    detail
                        ? detail.value
                        : "",

                memo:
                    memo
                        ? memo.value
                        : ""

            });

        }
    );


    return schedules;
}


/* =========================================================
   予算入力フォーム
   ========================================================= */

function addBudgetForm(
    budget = null
) {

    const budgetList =
        document.getElementById(
            "budget-list"
        );


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

                ${BUDGET_CATEGORIES.map(
        function (category) {

            return `
                            <option value="${category}">
                                ${category}
                            </option>
                        `;

        }
    ).join("")}

            </select>


            <input
                type="number"
                class="budget-amount"
                min="0"
                placeholder="金額"
            >


            <span>
                円
            </span>

        </div>


        <button
            type="button"
            class="budget-delete-button"
        >
            この予算を削除
        </button>

    `;


    /* -----------------------------------------
       編集時の値
       ----------------------------------------- */

    if (budget) {

        const categoryInput =
            budgetForm.querySelector(
                ".budget-category"
            );


        const amountInput =
            budgetForm.querySelector(
                ".budget-amount"
            );


        if (categoryInput) {

            categoryInput.value =
                budget.category ||
                budget.name ||
                "その他";
        }


        if (amountInput) {

            amountInput.value =
                budget.amount ||
                "";
        }
    }


    /* -----------------------------------------
       削除
       ----------------------------------------- */

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


    budgetList.appendChild(
        budgetForm
    );
}


/* =========================================================
   予算データ取得
   ========================================================= */

function getBudgetData() {

    const budgetForms =
        document.querySelectorAll(
            ".budget-form"
        );


    const budgets = [];


    budgetForms.forEach(
        function (form, index) {

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
                amount
                    ? Number(amount.value) || 0
                    : 0;


            budgets.push({

                id:
                    Date.now().toString() +
                    "-" +
                    index,

                name:
                    categoryValue,

                category:
                    categoryValue,

                amount:
                    amountValue

            });

        }
    );


    return budgets;
}


/* =========================================================
   予算合計
   ========================================================= */

function getBudgetTotal(
    budgets
) {

    if (!Array.isArray(budgets)) {
        return 0;
    }


    return budgets.reduce(
        function (total, budget) {

            return (
                total +
                (
                    Number(
                        budget.amount
                    ) || 0
                )
            );

        },
        0
    );
}


/* =========================================================
   金額表示
   ========================================================= */

function formatMoney(
    amount
) {

    return Number(
        amount || 0
    ).toLocaleString("ja-JP");
}


/* =========================================================
   旅行作成・更新
   ========================================================= */

function createTrip() {

    const titleInput =
        document.getElementById(
            "trip-title"
        );


    const destinationInput =
        document.getElementById(
            "destination"
        );


    const startDateInput =
        document.getElementById(
            "start-date"
        );


    const endDateInput =
        document.getElementById(
            "end-date"
        );


    const memoInput =
        document.getElementById(
            "trip-memo"
        );


    if (
        !titleInput ||
        !destinationInput ||
        !startDateInput ||
        !endDateInput
    ) {
        return;
    }


    const title =
        titleInput.value.trim();


    const destination =
        destinationInput.value.trim();


    const startDate =
        startDateInput.value;


    const endDate =
        endDateInput.value;


    const memo =
        memoInput
            ? memoInput.value.trim()
            : "";


    if (!title) {

        alert(
            "旅行のタイトルを入力してください。"
        );

        titleInput.focus();

        return;
    }


    if (!destination) {

        alert(
            "旅行先を入力してください。"
        );

        destinationInput.focus();

        return;
    }


    if (!startDate) {

        alert(
            "開始日を入力してください。"
        );

        startDateInput.focus();

        return;
    }


    if (!endDate) {

        alert(
            "終了日を入力してください。"
        );

        endDateInput.focus();

        return;
    }


    if (endDate < startDate) {

        alert(
            "終了日は開始日以降にしてください。"
        );

        return;
    }


    const schedules =
        getScheduleData();


    const budgets =
        getBudgetData();


    const trips =
        getTrips();


    /* -----------------------------------------
       編集
       ----------------------------------------- */

    if (editingTripId) {

        const tripIndex =
            trips.findIndex(
                function (trip) {

                    return (
                        String(trip.id) ===
                        String(editingTripId)
                    );

                }
            );


        if (tripIndex !== -1) {

            trips[tripIndex].title =
                title;

            trips[tripIndex].destination =
                destination;

            trips[tripIndex].startDate =
                startDate;

            trips[tripIndex].endDate =
                endDate;

            trips[tripIndex].schedules =
                schedules;

            trips[tripIndex].budgets =
                budgets;

            trips[tripIndex].memo =
                memo;

            trips[tripIndex].updatedAt =
                new Date().toISOString();


            saveTrips(trips);


            alert(
                "旅のしおりを更新しました。"
            );


            resetTripForm();


            displayTrips();

            return;
        }
    }


    /* -----------------------------------------
       新規作成
       ----------------------------------------- */

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


    trips.push(
        newTrip
    );


    saveTrips(
        trips
    );


    alert(
        "旅のしおりを作成しました。"
    );


    resetTripForm();


    displayTrips();
}


/* =========================================================
   フォームリセット
   ========================================================= */

function resetTripForm() {

    const titleInput =
        document.getElementById(
            "trip-title"
        );


    const destinationInput =
        document.getElementById(
            "destination"
        );


    const startDateInput =
        document.getElementById(
            "start-date"
        );


    const endDateInput =
        document.getElementById(
            "end-date"
        );


    const memoInput =
        document.getElementById(
            "trip-memo"
        );


    const scheduleList =
        document.getElementById(
            "schedule-list"
        );


    const budgetList =
        document.getElementById(
            "budget-list"
        );


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


    if (scheduleList) {
        scheduleList.innerHTML = "";
    }


    if (budgetList) {
        budgetList.innerHTML = "";
    }


    editingTripId = null;


    const createButton =
        document.getElementById(
            "create-trip-button"
        );


    if (createButton) {

        createButton.textContent =
            "旅のしおりを作る";
    }


    const cancelButton =
        document.getElementById(
            "cancel-edit-button"
        );


    if (cancelButton) {
        cancelButton.remove();
    }


    /* -----------------------------------------
       URLのeditを削除
       ----------------------------------------- */

    if (
        window.location.search.includes(
            "edit="
        )
    ) {

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );
    }
}


/* =========================================================
   旅行編集
   ========================================================= */

function editTrip(
    tripId
) {

    const trips =
        getTrips();


    const trip =
        trips.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(tripId)
                );

            }
        );


    if (!trip) {

        alert(
            "旅行データが見つかりません。"
        );

        return;
    }


    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    if (
        currentPage !== "index.html" &&
        currentPage !== ""
    ) {

        window.location.href =
            "index.html?edit=" +
            encodeURIComponent(
                trip.id
            );

        return;
    }


    editTripFromHome(
        trip
    );
}


/* =========================================================
   ホームで編集内容を表示
   ========================================================= */

function editTripFromHome(
    trip
) {

    editingTripId =
        String(trip.id);


    const titleInput =
        document.getElementById(
            "trip-title"
        );


    const destinationInput =
        document.getElementById(
            "destination"
        );


    const startDateInput =
        document.getElementById(
            "start-date"
        );


    const endDateInput =
        document.getElementById(
            "end-date"
        );


    const memoInput =
        document.getElementById(
            "trip-memo"
        );


    const scheduleList =
        document.getElementById(
            "schedule-list"
        );


    const budgetList =
        document.getElementById(
            "budget-list"
        );


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
       日程
       ----------------------------------------- */

    if (scheduleList) {

        scheduleList.innerHTML = "";


        if (
            Array.isArray(
                trip.schedules
            )
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
       予算
       ----------------------------------------- */

    if (budgetList) {

        budgetList.innerHTML = "";


        if (
            Array.isArray(
                trip.budgets
            )
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
       ボタン変更
       ----------------------------------------- */

    const createButton =
        document.getElementById(
            "create-trip-button"
        );


    if (createButton) {

        createButton.textContent =
            "しおりを更新";
    }


    addCancelEditButton();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   編集キャンセルボタン
   ========================================================= */

function addCancelEditButton() {

    if (
        document.getElementById(
            "cancel-edit-button"
        )
    ) {
        return;
    }


    const createButton =
        document.getElementById(
            "create-trip-button"
        );


    if (!createButton) {
        return;
    }


    const cancelButton =
        document.createElement(
            "button"
        );


    cancelButton.type =
        "button";


    cancelButton.id =
        "cancel-edit-button";


    cancelButton.textContent =
        "編集をキャンセル";


    cancelButton.addEventListener(
        "click",
        function () {

            resetTripForm();

        }
    );


    createButton.parentNode.appendChild(
        cancelButton
    );
}


/* =========================================================
   URLのeditパラメータ確認
   ========================================================= */

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
        trips.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(editId)
                );

            }
        );


    if (!trip) {
        return;
    }


    editTripFromHome(
        trip
    );
}


/* =========================================================
   旅行一覧表示
   ========================================================= */

function displayTrips() {

    const trips =
        getTrips();


    /* -----------------------------------------
       ホーム
       ----------------------------------------- */

    const homeList =
        document.getElementById(
            "home-trip-list"
        );


    if (homeList) {

        displayTripList(
            homeList,
            trips.slice(0, 5)
        );
    }


    /* -----------------------------------------
       旅行ページ
       ----------------------------------------- */

    const travelList =
        document.getElementById(
            "travel-trip-list"
        );


    if (travelList) {

        displayTripList(
            travelList,
            trips
        );
    }


    /* -----------------------------------------
       お気に入り
       ----------------------------------------- */

    const favoriteTripList =
        document.getElementById(
            "favorite-trip-list"
        );


    const favoritePlanList =
        document.getElementById(
            "favorite-plan-list"
        );


    const favoriteTrips =
        trips.filter(
            function (trip) {

                return (
                    trip.favorite === true
                );

            }
        );


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


/* =========================================================
   旅行カード一覧
   ========================================================= */

function displayTripList(
    container,
    trips
) {

    if (!container) {
        return;
    }


    if (
        !trips ||
        trips.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-message">
                まだ旅のしおりがありません。
            </p>

        `;

        return;
    }


    container.innerHTML = "";


    trips
        .slice()
        .reverse()
        .forEach(
            function (trip) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "trip-card";


                const budgetTotal =
                    getBudgetTotal(
                        trip.budgets
                    );


                const favoriteMark =
                    trip.favorite
                        ? "★"
                        : "☆";


                card.innerHTML = `

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
                            class="favorite-button"
                            data-id="${escapeHTML(
                    trip.id
                )}"
                            aria-label="お気に入り"
                        >
                            ${favoriteMark}
                        </button>

                    </div>


                    <p class="trip-date">

                        ${escapeHTML(
                    formatDateRange(
                        trip.startDate,
                        trip.endDate
                    )
                )}

                    </p>

                    ${trip.memo
                        ? `<p class="trip-memo">${escapeHTML(trip.memo)}</p>`
                        : ""}

                    <div class="trip-summary">

                        <span>

                            日程
                            ${Array.isArray(
                        trip.schedules
                    )
                        ? trip.schedules.length
                        : 0
                    }
                            件

                        </span>


                        <span>

                            予算
                            ${formatMoney(
                        budgetTotal
                    )}
                            円

                        </span>

                    </div>


                    <div class="trip-card-buttons">

                        <button
                            type="button"
                            class="view-trip-button"
                            data-id="${escapeHTML(
                        trip.id
                    )}"
                        >
                            開く
                        </button>


                        <button
                            type="button"
                            class="edit-trip-button"
                            data-id="${escapeHTML(
                        trip.id
                    )}"
                        >
                            編集
                        </button>


                        <button
                            type="button"
                            class="share-trip-button"
                            data-id="${escapeHTML(
                        trip.id
                    )}"
                        >
                            共有
                        </button>


                        <button
                            type="button"
                            class="delete-trip-button"
                            data-id="${escapeHTML(
                        trip.id
                    )}"
                        >
                            削除
                        </button>

                    </div>

                `;


                /* -----------------------------------------
                   お気に入り
                   ----------------------------------------- */

                const favoriteButton =
                    card.querySelector(
                        ".favorite-button"
                    );


                if (favoriteButton) {

                    favoriteButton.addEventListener(
                        "click",
                        function () {

                            toggleFavorite(
                                trip.id
                            );

                        }
                    );
                }


                /* -----------------------------------------
                   開く
                   ----------------------------------------- */

                const viewButton =
                    card.querySelector(
                        ".view-trip-button"
                    );


                if (viewButton) {

                    viewButton.addEventListener(
                        "click",
                        function () {

                            openTrip(
                                trip.id
                            );

                        }
                    );
                }


                /* -----------------------------------------
                   編集
                   ----------------------------------------- */

                const editButton =
                    card.querySelector(
                        ".edit-trip-button"
                    );


                if (editButton) {

                    editButton.addEventListener(
                        "click",
                        function () {

                            editTrip(
                                trip.id
                            );

                        }
                    );
                }


                /* -----------------------------------------
                   共有
                   ----------------------------------------- */

                const shareButton =
                    card.querySelector(
                        ".share-trip-button"
                    );


                if (shareButton) {

                    shareButton.addEventListener(
                        "click",
                        function () {

                            shareTrip(
                                trip.id
                            );

                        }
                    );
                }


                /* -----------------------------------------
                   削除
                   ----------------------------------------- */

                const deleteButton =
                    card.querySelector(
                        ".delete-trip-button"
                    );


                if (deleteButton) {

                    deleteButton.addEventListener(
                        "click",
                        function () {

                            deleteTrip(
                                trip.id
                            );

                        }
                    );
                }


                container.appendChild(
                    card
                );

            }
        );
}


/* =========================================================
   お気に入り切り替え
   ========================================================= */

function toggleFavorite(
    tripId
) {

    const trips =
        getTrips();


    const trip =
        trips.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(tripId)
                );

            }
        );


    if (!trip) {
        return;
    }


    trip.favorite =
        !trip.favorite;


    trip.updatedAt =
        new Date().toISOString();


    saveTrips(
        trips
    );


    displayTrips();
}


/* =========================================================
   旅行を開く
   ========================================================= */

function openTrip(
    tripId
) {

    const trips =
        getTrips();


    const trip =
        trips.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(tripId)
                );

            }
        );


    if (!trip) {
        return;
    }


    let message = "";


    message +=
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
        "\n\n";


    /* -----------------------------------------
       日程
       ----------------------------------------- */

    message +=
        "【日程】\n";


    if (
        Array.isArray(
            trip.schedules
        ) &&
        trip.schedules.length > 0
    ) {

        trip.schedules.forEach(
            function (
                schedule,
                index
            ) {

                message +=
                    (index + 1) +
                    ". " +
                    (
                        schedule.time ||
                        ""
                    ) +
                    " " +
                    (
                        schedule.type ||
                        ""
                    ) +
                    "\n";


                message +=
                    "   " +
                    (
                        schedule.place ||
                        ""
                    ) +
                    "\n";


                if (
                    schedule.detail
                ) {

                    message +=
                        "   " +
                        schedule.detail +
                        "\n";
                }


                if (
                    schedule.memo
                ) {

                    message +=
                        "   メモ：" +
                        schedule.memo +
                        "\n";
                }


                message += "\n";

            }
        );

    } else {

        message +=
            "登録されている日程はありません。\n\n";
    }


    /* -----------------------------------------
       予算
       ----------------------------------------- */

    message +=
        "【予算】\n";


    if (
        Array.isArray(
            trip.budgets
        ) &&
        trip.budgets.length > 0
    ) {

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
            "\n合計：" +
            formatMoney(
                getBudgetTotal(
                    trip.budgets
                )
            ) +
            "円\n";

    } else {

        message +=
            "登録されている予算はありません。\n";
    }


    /* -----------------------------------------
       メモ
       ----------------------------------------- */

    if (trip.memo) {

        message +=
            "\n【メモ】\n" +
            trip.memo;
    }


    alert(
        message
    );
}


/* =========================================================
   旅行削除
   ========================================================= */

function deleteTrip(
    tripId
) {

    const trips =
        getTrips();


    const trip =
        trips.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(tripId)
                );

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

                return (
                    String(item.id) !==
                    String(tripId)
                );

            }
        );


    saveTrips(
        newTrips
    );


    displayTrips();
}


/* =========================================================
   全データ削除
   ========================================================= */

function deleteAllTrips() {

    const trips =
        getTrips();


    if (trips.length === 0) {

        alert(
            "削除するデータがありません。"
        );

        return;
    }


    const result =
        confirm(
            "すべての旅行データを削除しますか？\nこの操作は元に戻せません。"
        );


    if (!result) {
        return;
    }


    localStorage.removeItem(
        STORAGE_KEY
    );


    alert(
        "すべての旅行データを削除しました。"
    );


    displayTrips();
}


/* =========================================================
   共有データをBase64URLへ変換
   ========================================================= */

function encodeShareData(
    data
) {

    const json =
        JSON.stringify(data);


    const bytes =
        new TextEncoder().encode(
            json
        );


    let binary = "";


    bytes.forEach(
        function (byte) {

            binary +=
                String.fromCharCode(
                    byte
                );

        }
    );


    return btoa(binary)
        .replace(
            /\+/g,
            "-"
        )
        .replace(
            /\//g,
            "_"
        )
        .replace(
            /=+$/,
            ""
        );
}


/* =========================================================
   Base64URLをデータへ戻す
   ========================================================= */

function decodeShareData(
    encoded
) {

    try {

        const base64 =
            encoded
                .replace(
                    /-/g,
                    "+"
                )
                .replace(
                    /_/g,
                    "/"
                );


        const padding =
            "=".repeat(
                (
                    4 -
                    base64.length % 4
                ) % 4
            );


        const binary =
            atob(
                base64 + padding
            );


        const bytes =
            Uint8Array.from(
                binary,
                function (character) {

                    return character.charCodeAt(
                        0
                    );

                }
            );


        const json =
            new TextDecoder().decode(
                bytes
            );


        return JSON.parse(
            json
        );

    } catch (error) {

        console.error(
            "共有データの解析に失敗しました。",
            error
        );

        return null;
    }
}


/* =========================================================
   共有トークン作成
   ========================================================= */

function createShareToken() {

    if (
        window.crypto &&
        window.crypto.randomUUID
    ) {

        return window.crypto.randomUUID();
    }


    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
}


/* =========================================================
   共有URL作成
   ========================================================= */

function createShareURL(
    trip
) {

    const token =
        createShareToken();


    const encodedData =
        encodeShareData(
            trip
        );


    const url =
        new URL(
            "share.html",
            window.location.href
        );


    url.searchParams.set(
        "token",
        token
    );


    url.searchParams.set(
        "data",
        encodedData
    );


    return url.toString();
}


/* =========================================================
   旅行を共有
   ========================================================= */

function shareTrip(
    tripId
) {

    const trips =
        getTrips();


    const trip =
        trips.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(tripId)
                );

            }
        );


    if (!trip) {
        return;
    }


    const shareURL =
        createShareURL(
            trip
        );


    showShareDialog(
        shareURL
    );
}


/* =========================================================
   共有URLコピー
   ========================================================= */

function copyShareURL(
    url
) {

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard
            .writeText(url)
            .then(
                function () {

                    alert(
                        "共有URLをコピーしました。"
                    );

                }
            )
            .catch(
                function () {

                    window.prompt(
                        "以下のURLをコピーしてください。",
                        url
                    );

                }
            );

        return;
    }


    window.prompt(
        "以下のURLをコピーしてください。",
        url
    );
}


/* =========================================================
   共有ダイアログ
   ========================================================= */

function showShareDialog(
    url
) {

    const result =
        confirm(
            "共有URLを作成しました。\n\nOKを押すとURLをコピーします。"
        );


    if (result) {

        copyShareURL(
            url
        );

    } else {

        window.prompt(
            "共有URL",
            url
        );
    }
}


/* =========================================================
   共有ページ用データ取得
   ========================================================= */

function getSharedTripFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const encodedData =
        params.get(
            "data"
        );


    if (!encodedData) {
        return null;
    }


    return decodeShareData(
        encodedData
    );
}


/* =========================================================
   旅行データを補正
   ========================================================= */

function normalizeTrip(
    trip
) {

    if (!trip) {
        return null;
    }


    if (
        !Array.isArray(
            trip.schedules
        )
    ) {

        trip.schedules = [];
    }


    if (
        !Array.isArray(
            trip.budgets
        )
    ) {

        trip.budgets = [];
    }


    if (
        typeof trip.favorite !==
        "boolean"
    ) {

        trip.favorite = false;
    }


    return trip;
}


/* =========================================================
   ページ読み込み
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* -----------------------------------------
           旅行作成ボタン
           ----------------------------------------- */

        const createTripButton =
            document.getElementById(
                "create-trip-button"
            );


        if (createTripButton) {

            createTripButton.addEventListener(
                "click",
                createTrip
            );
        }


        /* -----------------------------------------
           日程追加ボタン
           ----------------------------------------- */

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
           予算追加ボタン
           ----------------------------------------- */

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
           全データ削除
           ----------------------------------------- */

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
           旅行一覧表示
           ----------------------------------------- */

        displayTrips();


        /* -----------------------------------------
           編集パラメータ確認
           ----------------------------------------- */

        checkEditParameter();


        /* -----------------------------------------
           Service Worker
           ----------------------------------------- */

        if (
            "serviceWorker" in
            navigator
        ) {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    function () {

                        console.log(
                            "Service Workerを登録しました。"
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

    }
);