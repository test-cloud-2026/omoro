/* =====================================================================
       データ層
       - 各お題は { id, text, category, image } の形式
       - image: null | DataURL文字列
       - image はTOPICSオブジェクト自体に保持する（stateとデータを統合）
       - 将来: Supabase移行時は image を Storage URL に置き換える
    ===================================================================== */
const TOPICS = [
  // ── ホラー ──────────────────────────────────
  { id: "h01", text: "一瞬で心を奪い、視線が離れなくなる存在", category: "horror", image: null, name: null },
  { id: "h02", text: "近づくと理由もなく不安になる気配", category: "horror", image: null, name: null },
  { id: "h03", text: "触れると記憶が少しだけ曖昧になる物体", category: "horror", image: null, name: null },
  { id: "h04", text: "鏡の中だけに映り込む、名前のないもの", category: "horror", image: null, name: null },
  { id: "h05", text: "写真を撮るたびに少しずつ増えている影", category: "horror", image: null, name: null },
  { id: "h06", text: "深夜にだけ届く、送信者不明のメッセージ", category: "horror", image: null, name: null },
  { id: "h07", text: "声に出した瞬間に忘れてしまう言葉", category: "horror", image: null, name: null },

  // ── 日常 ────────────────────────────────────
  { id: "d01", text: "誰も座っていないのに、ほんのり温かい椅子", category: "daily", image: null, name: null },
  { id: "d02", text: "毎朝同じ時刻に止まっている、壊れていない時計", category: "daily", image: null, name: null },
  { id: "d03", text: "昨日まで確かにあったはずなのに誰も知らない棚", category: "daily", image: null, name: null },
  { id: "d04", text: "いつの間にか増えている食器", category: "daily", image: null, name: null },
  { id: "d05", text: "夕暮れ時にだけ聞こえる遠くの呼び声", category: "daily", image: null, name: null },
  { id: "d06", text: "開けたはずなのに閉まっているドア", category: "daily", image: null, name: null },
  { id: "d07", text: "なぜか懐かしいのに、思い出せない場所の匂い", category: "daily", image: null, name: null },

  // ── SF ──────────────────────────────────────
  { id: "s01", text: "観測するたびに形が微妙に変わる物質", category: "sf", image: null, name: null },
  { id: "s02", text: "重力が逆に働く空間の、目に見えない境界線", category: "sf", image: null, name: null },
  { id: "s03", text: "記録には残っているのに誰も覚えていない出来事", category: "sf", image: null, name: null },
  { id: "s04", text: "時間の流れがほんの少しずれている場所", category: "sf", image: null, name: null },
  { id: "s05", text: "並行世界の自分が残した、読めない手書きのメモ", category: "sf", image: null, name: null },
  { id: "s06", text: "みんなが知っているのに、辞書に載っていない言葉", category: "sf", image: null, name: null },

  // ── 乙女 ────────────────────────────────────
  { id: "r01", text: "視線が合うたびに心拍数が上がる、その理由", category: "romance", image: null, name: null },
  { id: "r02", text: "記憶の中にしか残っていない甘い香り", category: "romance", image: null, name: null },
  { id: "r03", text: "名前を呼ばれると体温が少し上がる感覚", category: "romance", image: null, name: null },
  { id: "r04", text: "夢の中でだけ会える人の、見えない横顔", category: "romance", image: null, name: null },
  { id: "r05", text: "無意識に探してしまう、誰かの手の温もり", category: "romance", image: null, name: null },
  { id: "r06", text: "言葉にならないまま消えてしまった気持ち", category: "romance", image: null, name: null },
  { id: "r07", text: "偶然が重なりすぎる出会いと、その意味", category: "romance", image: null, name: null },
];

/* =====================================================================
       カテゴリ定義
       - ボタン生成・フィルタリング・ラベル表示の単一ソース
       - key: null = 全カテゴリ（ランダム）
    ===================================================================== */
const CATEGORIES = [
  { key: null, label: "ランダム" },
  { key: "horror", label: "ホラー" },
  { key: "daily", label: "日常" },
  { key: "sf", label: "SF" },
  { key: "romance", label: "乙女" },
];

/* =====================================================================
       Supabase設定
       ─ 自分のプロジェクトURLとAnon Keyに書き換えてください ─
    ===================================================================== */
const SUPABASE_URL = "https://pwrvjnmewcuithobsqke.supabase.co"; // 例: https://xxxxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = "sb_publishable_lTdnyAoLiDmSVnHpblWQag_MytaZZyw"; // 例: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

const { createClient } = window.supabase;
const supabaseClient = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// 現在セッションの作品ID（Storage パスに埋め込む）
let currentWorkId = crypto.randomUUID();
// { topicId: storagePath } — DB保存用。topic.image には signed URL を入れる
const imageStoragePaths = {};

/* =====================================================================
       保存層
       - collectCurrentWork(): 現在表示中の6件を DB スキーマ形式に整形
       - saveWork(): Supabase の works テーブルに insert して id を返す
       - handleSave(): UI の状態管理（loading / success / error）
    ===================================================================== */

/**
 * DOM のカード一覧から現在表示中の作品データを収集する
 * - topics: テキスト情報のみの配列（DB の topics カラムに対応）
 * - images: { topicId: DataURL | null }（DB の images カラムに対応）
 */
function collectCurrentWork() {
  const cards = [...document.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate) .card")];
  const topics = cards.map((card) => {
    const t = TOPICS.find((tp) => tp.id === card.dataset.id);
    return { id: t.id, text: t.text, category: t.category, name: t.name ?? null };
  });
  const images = Object.fromEntries(topics.map((t) => [t.id, imageStoragePaths[t.id] ?? null]));
  return { topics, images };
}

/**
 * works テーブルに insert して生成された id を返す
 * 将来: images 内の DataURL を Storage にアップロードしてから URL に差し替える
 * @returns {Promise<string>} 保存された作品の id
 */
async function saveWork() {
  if (!supabaseClient) {
    throw new Error("Supabase未設定：SUPABASE_URL と SUPABASE_ANON_KEY を入力してください");
  }

  const { topics, images } = collectCurrentWork();
  const { data, error } = await supabaseClient.from("works").insert({ id: currentWorkId, title: "おもろ図鑑", topics, images }).select("id").single();

  if (error) throw new Error(error.message);
  return data.id;
}

/**
 * works テーブルから id で1件取得する
 * @param {string} workId
 * @returns {Promise<{id, title, topics, images}>}
 */
async function fetchWork(workId) {
  if (!supabaseClient) {
    throw new Error("Supabase未設定：SUPABASE_URL と SUPABASE_ANON_KEY を入力してください");
  }
  const { data, error } = await supabaseClient.from("works").select("id, title, topics, images").eq("id", workId).single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * 保存ボタンのUIハンドラ
 * - 保存成功後、共有URLを「?work=<id>」形式に更新する
 */
async function handleSave() {
  const btn = document.getElementById("btnSave");
  const status = document.getElementById("saveStatus");

  btn.disabled = true;
  btn.textContent = "保存中...";
  status.hidden = true;
  status.className = "save-status";

  try {
    const savedId = await saveWork();
    console.log("[おもろ図鑑] 保存成功 id:", savedId);

    const workURL = `${location.origin}${location.pathname}?work=${savedId}`;
    status.innerHTML = `保存成功！ <a href="${workURL}" style="color:inherit;word-break:break-all;">${workURL}</a>`;
    status.className = "save-status save-status--success";
    status.hidden = false;
    updateShareBar(workURL);
  } catch (err) {
    console.error("[おもろ図鑑] 保存失敗:", err);
    status.textContent = `保存に失敗しました: ${err.message}`;
    status.className = "save-status save-status--error";
    status.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = "この作品を保存する";
  }
}

/* =====================================================================
       ロジック層
    ===================================================================== */

/** 配列からn件をランダムに重複なし抽出 */
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/* =====================================================================
       Swiper層
       - innerHTML 更新前に destroySwiper() で古いインスタンスをクリーンアップ
       - innerHTML 更新後に initSwiper() で新しいインスタンスを作成
    ===================================================================== */

let swiperInstance = null;

function destroySwiper() {
  if (!swiperInstance) return;
  try {
    swiperInstance.destroy(true, true);
  } catch (_) {}
  swiperInstance = null;
}

/** swiper-wrapper + ナビゲーションボタンを包んだHTMLを生成する */
function buildSwiperHTML(slidesHTML) {
  return `
          <div class="swiper-wrapper">${slidesHTML}</div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
        `;
}

function initSwiper() {
  swiperInstance = new Swiper("#cardGrid", {
    // slidesPerView: "auto",
    slidesPerView: 2,
    centeredSlides: true,
    effect: "coverflow",
    spaceBetween: 16,
    grabCursor: true,
    loop: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
}

/* =====================================================================
       データアクセス層
       - Supabase移行時はこの関数だけ書き換える
       - 現在はローカルの TOPICS 配列から取得（オブジェクト参照を返す）
       - 将来: const { data } = await supabase.from('topics').select('*').eq('category', category)
    ===================================================================== */
async function fetchTopics(category) {
  const pool = category ? TOPICS.filter((t) => t.category === category) : TOPICS;
  return pickRandom(pool, 6);
}

/* =====================================================================
       画像アップロード層
       - Supabase移行時: DataURL → Storage にアップロードして URL を返す関数に差し替え
    ===================================================================== */

/**
 * File を読み込み DataURL を返す
 * @param {File} file
 * @returns {Promise<string>}
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * 画像をTOPICSに保存してカードのメディアエリアだけ更新する
 * @param {string} id  - topic.id
 * @param {File}   file
 */
function showUploadError(id, message) {
  document.querySelectorAll(`.card[data-id="${id}"] .card__media`).forEach((media) => {
    const err = document.createElement("p");
    err.textContent = message;
    err.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" + "padding:8px;font-size:0.75rem;color:#8b1c2e;background:rgba(255,255,255,0.92);" + "border-radius:8px;text-align:center;pointer-events:none;";
    media.appendChild(err);
    setTimeout(() => err.remove(), 3000);
  });
}

async function handleImageUpload(id, file) {
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showUploadError(id, "5MB以下の画像を選択してください");
    return;
  }

  const topic = TOPICS.find((t) => t.id === id);
  if (!topic) return;

  if (!supabaseClient) {
    // Supabase未設定時はDataURLにフォールバック
    const dataURL = await readFileAsDataURL(file);
    topic.image = dataURL;
    updateCardMedia(id);
    return;
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/webp" ? "webp" : "png";
  const storagePath = `works/${currentWorkId}/${id}.${ext}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("work-images")
    .upload(storagePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    showUploadError(id, "アップロードに失敗しました");
    console.error("[おもろ図鑑] Storage upload error:", uploadError);
    return;
  }

  const { data: signedData, error: signedError } = await supabaseClient.storage
    .from("work-images")
    .createSignedUrl(storagePath, 3600);

  if (signedError) {
    showUploadError(id, "URL取得に失敗しました");
    console.error("[おもろ図鑑] createSignedUrl error:", signedError);
    return;
  }

  imageStoragePaths[id] = storagePath;
  topic.image = signedData.signedUrl;
  updateCardMedia(id);
}

/* =====================================================================
       UI層
    ===================================================================== */

/** カテゴリキーからラベルを引く */
function getCategoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

/**
 * カードのメディアエリアHTMLを生成
 * - image なし → プレースホルダー兼アップロードラベル
 * - image あり → <img> + 「変更」ラベル
 */
function createMediaHTML(topic) {
  const inputHTML = `<input type="file" accept="image/*" class="card__file-input" hidden>`;

  if (topic.image) {
    return `
          <div class="card__media">
            <img class="card__image" src="${topic.image}" alt="${topic.text}">
            <label class="card__replace-label">
              変更${inputHTML}
            </label>
          </div>
        `;
  }

  return `
        <div class="card__media">
          <label class="card__upload-label">
            <span class="card__upload-label__icon">＋</span>
            <span>画像を追加</span>
            ${inputHTML}
          </label>
        </div>
      `;
}

/**
 * カード1枚のHTMLを生成
 * - data-id でTOPICSと紐付け、画像保存・再描画に使う
 */
function createCardHTML(topic) {
  return `
        <div class="swiper-slide">
          <article class="card" data-id="${topic.id}" data-category="${topic.category}">
            ${createMediaHTML(topic)}
            <input
              type="text"
              class="card__name-input"
              placeholder="名前をつける"
              value="${topic.name ?? ""}"
            >
            <span class="card__category card__category--${topic.category}">
              ${getCategoryLabel(topic.category)}
            </span>
            <p class="card__text">${topic.text}</p>
          </article>
        </div>
      `;
}

/**
 * 指定IDのカードのメディアエリアだけを再描画する
 * 他カードの状態（アップロード済み画像など）は一切触らない
 */
function updateCardMedia(id) {
  const topic = TOPICS.find((t) => t.id === id);
  if (!topic) return;
  document.querySelectorAll(`.card[data-id="${id}"]`).forEach((card) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = createMediaHTML(topic);
    card.querySelector(".card__media").replaceWith(tmp.firstElementChild);
  });
}

/* =====================================================================
       SNS共有層
       - buildXShareURL / buildLINEShareURL は pageURL を引数で受け取る設計
       - Supabase移行後は renderCards 内の location.href を保存済みURLに差し替えるだけ
    ===================================================================== */

/**
 * 現在DOMに表示中のお題テキストを収集してX投稿用文字列を生成する
 * （DOMから取得することで表示と共有テキストを常に一致させる）
 */
function buildShareText() {
  const lines = [...document.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate) .card__text")].map((el) => `・${el.textContent.trim()}`);
  return `【おもろ図鑑】\n${lines.join("\n")}\n#おもろ図鑑`;
}

/** X（Twitter）共有URLを生成 */
function buildXShareURL(pageURL) {
  const text = buildShareText();
  return "https://twitter.com/intent/tweet" + `?text=${encodeURIComponent(text)}` + `&url=${encodeURIComponent(pageURL)}`;
}

/** LINE共有URLを生成 */
function buildLINEShareURL(pageURL) {
  return "https://social-plugins.line.me/lineit/share" + `?url=${encodeURIComponent(pageURL)}`;
}

/**
 * 保存セクションの表示切替
 * 新しいカード生成のたびにステータス表示をリセットする
 */
function updateSaveSection() {
  const section = document.getElementById("saveSection");
  const hasCards = document.querySelectorAll(".card").length > 0;
  section.hidden = !hasCards;

  // 新規生成時は前回の保存結果をリセット
  const status = document.getElementById("saveStatus");
  status.hidden = true;
  status.textContent = "";
  status.className = "save-status";
  const btn = document.getElementById("btnSave");
  btn.disabled = false;
  btn.textContent = "この作品を保存する";
}

/**
 * 共有バーの表示切替とhrefを更新する
 * @param {string} [pageURL] 省略時は location.href。保存後は workURL を渡す
 */
function updateShareBar(pageURL = location.href) {
  const shareBar = document.getElementById("shareBar");
  const hasCards = document.querySelectorAll(".card").length > 0;
  shareBar.hidden = !hasCards;
  if (!hasCards) return;

  document.getElementById("btnShareX").href = buildXShareURL(pageURL);
  document.getElementById("btnShareLine").href = buildLINEShareURL(pageURL);
}

/**
 * Supabase から取得した作品データを画面に復元する
 * - topics ({id, text, category}[]) と images ({topicId: DataURL|null}) をマージして描画
 * - TOPICS のimageフィールドも更新し、以降のupdateCardMediaと整合させる
 */
async function restoreWork(work) {
  const topicsWithImages = await Promise.all(
    work.topics.map(async (t) => {
      const stored = work.images?.[t.id] ?? null;
      let imageUrl = null;
      if (stored) {
        if (stored.startsWith("works/") && supabaseClient) {
          // Storage パス → signed URL に変換
          const { data } = await supabaseClient.storage.from("work-images").createSignedUrl(stored, 3600);
          imageUrl = data?.signedUrl ?? null;
        } else {
          // DataURL（レガシー）またはsupabaseClient未設定
          imageUrl = stored;
        }
      }
      return { ...t, image: imageUrl };
    })
  );

  // TOPICS本体のimage・nameを更新（以降の操作と整合させる）
  topicsWithImages.forEach((t) => {
    const master = TOPICS.find((tp) => tp.id === t.id);
    if (master) {
      master.image = t.image;
      master.name = t.name ?? null;
    }
  });

  const grid = document.getElementById("cardGrid");
  destroySwiper();
  grid.innerHTML = buildSwiperHTML(topicsWithImages.map(createCardHTML).join(""));
  initSwiper();
  updateSaveSection();
  updateShareBar(location.href);
}

/**
 * URLの ?work= パラメータを見て作品を自動復元する
 * - パラメータがある → Supabase から取得して restoreWork()
 * - パラメータがない → 何もしない（通常の生成UIを表示）
 * @returns {Promise<boolean>} 復元したかどうか
 */
async function loadFromURL() {
  const workId = new URLSearchParams(location.search).get("work");
  if (!workId) return false;

  const grid = document.getElementById("cardGrid");
  destroySwiper();
  grid.innerHTML = '<p class="empty-state">読み込み中...</p>';

  try {
    const work = await fetchWork(workId);
    await restoreWork(work);
    console.log("[おもろ図鑑] 作品を復元しました id:", work.id);
    return true;
  } catch (err) {
    console.error("[おもろ図鑑] 復元失敗:", err);
    grid.innerHTML = '<p class="empty-state">作品が見つかりません</p>';
    return false;
  }
}

/** カードグリッドを指定カテゴリのお題6件で更新 */
async function renderCards(category) {
  // 新しいセッション用にIDとStorage追跡をリセット
  currentWorkId = crypto.randomUUID();
  Object.keys(imageStoragePaths).forEach((k) => delete imageStoragePaths[k]);

  const grid = document.getElementById("cardGrid");
  const picks = await fetchTopics(category);
  picks.forEach((t) => { t.image = null; t.name = null; });
  destroySwiper();
  grid.innerHTML = buildSwiperHTML(picks.map(createCardHTML).join(""));
  initSwiper();
  updateSaveSection();
  updateShareBar();
}

/** フィルターバーをCATEGORIES配列から生成 */
function initFilterBar() {
  const bar = document.getElementById("filterBar");
  bar.innerHTML = CATEGORIES.map(
    (cat, i) => `
        <button
          class="filter-btn${i === 0 ? " is-active" : ""}"
          data-category="${cat.key ?? ""}"
        >${cat.label}</button>
      `,
  ).join("");
}

/* =====================================================================
       イベント登録
    ===================================================================== */

/* カテゴリフィルター（filterBar へ委譲） */
document.getElementById("filterBar").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");

  const category = btn.dataset.category || null;
  renderCards(category);
});

/* 画像ファイル選択（cardGrid へ委譲） */
document.getElementById("cardGrid").addEventListener("change", (e) => {
  if (!e.target.matches(".card__file-input")) return;

  const card = e.target.closest(".card");
  const id = card?.dataset.id;
  if (!id) return;

  handleImageUpload(id, e.target.files[0]);
});

/* 名前入力（cardGrid へ委譲） */
document.getElementById("cardGrid").addEventListener("input", (e) => {
  if (!e.target.matches(".card__name-input")) return;
  const id = e.target.closest(".card")?.dataset.id;
  if (!id) return;
  const topic = TOPICS.find((t) => t.id === id);
  if (topic) topic.name = e.target.value || null;
  // Swiper loop クローンにも値を同期する
  document.querySelectorAll(`.card[data-id="${id}"] .card__name-input`).forEach((input) => {
    if (input !== e.target) input.value = e.target.value;
  });
});

/* 保存ボタン */
document.getElementById("btnSave").addEventListener("click", handleSave);

/* スクショモード切替 */
document.getElementById("btnScreenshot").addEventListener("click", () => {
  const on = document.body.classList.toggle("screenshot-mode");
  document.getElementById("btnScreenshot").classList.toggle("is-active", on);
  document.getElementById("btnScreenshot").textContent = on ? "通常モードに戻る" : "スクショモード";
});

/* Escape で解除 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("screenshot-mode")) {
    document.getElementById("btnScreenshot").click();
  }
});

/* 起動時 */
initFilterBar();
loadFromURL().then((restored) => {
  if (!restored) renderCards(null);
});
