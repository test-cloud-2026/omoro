/* =====================================================================
 データ層
 - 各お題は { id, text, category, image } の形式
 - image: null | DataURL文字列
 - image はTOPICSオブジェクト自体に保持する（stateとデータを統合）
 - 将来: Supabase移行時は image を Storage URL に置き換える
    ===================================================================== */
const TOPICS = [
  // ── ホラー ──────────────────────────────────
  { id: "h01", text: "視線を強く感じさせる存在。観察時は静止しているが、目を離した直後に位置変化が確認されている。", category: "horror", image: null, name: null },
  { id: "h02", text: "周囲の空間を歪ませる存在。接近した観察者に原因不明の恐怖感を誘発する。", category: "horror", image: null, name: null },
  { id: "h03", text: "接触対象の記憶を曖昧化する物体。詳細や存在自体の想起が困難になる。", category: "horror", image: null, name: null },
  { id: "h04", text: "反射面にのみ出現する存在。実空間での観測は確認されていない。", category: "horror", image: null, name: null },
  { id: "h05", text: "撮影のたびに影が増加する現象を伴う存在。増加分は肉眼で確認できない場合が多い。", category: "horror", image: null, name: null },
  { id: "h06", text: "深夜帯にのみ記録される未知の発信源。送信元は特定されていない。", category: "horror", image: null, name: null },
  { id: "h07", text: "発声と同時に意味を失う言語的存在。録音や記録への保持は不可能とされる。", category: "horror", image: null, name: null },
  { id: "h08", text: "視界の端にのみ現れる移動体。正面からの観測は成立しない。", category: "horror", image: null, name: null },
  { id: "h09", text: "音のみが先行して観測される存在。発生源の特定には至っていない。", category: "horror", image: null, name: null },
  { id: "h10", text: "接触なしで触覚を発生させる存在。特に背後での報告が多い。", category: "horror", image: null, name: null },
  { id: "h11", text: "観測のたび距離を縮める影状存在。振り返るごとに接近が確認される。", category: "horror", image: null, name: null },
  { id: "h12", text: "無人空間で呼吸音のみが発生する現象。音源の実体は確認されていない。", category: "horror", image: null, name: null },

  // ── 日常 ────────────────────────────────────
  { id: "d01", text: "使用されていないのに温もりを保持する椅子。直前までの使用状態が維持される。", category: "daily", image: null, name: null },
  { id: "d02", text: "特定時刻で停止する時計。機構異常はなく、毎日同時刻で動作が止まる。", category: "daily", image: null, name: null },
  { id: "d03", text: "記録に存在しないが記憶に残る家具。周囲との認識に齟齬が生じる。", category: "daily", image: null, name: null },
  { id: "d04", text: "数が増加する食器類。追加経路は不明で、保管数のみが変化する。", category: "daily", image: null, name: null },
  { id: "d05", text: "特定時間帯にのみ遠方から呼び声が聞こえる現象。発生源は特定されていない。", category: "daily", image: null, name: null },
  { id: "d06", text: "記録と異なる開閉状態を示す扉。状態変化の過程は観測されていない。", category: "daily", image: null, name: null },
  { id: "d07", text: "記憶に対応しない懐かしさを伴う匂い。発生源の特定は困難とされる。", category: "daily", image: null, name: null },
  { id: "d08", text: "紛失後に元の位置へ戻る物体。移動経路は確認されていない。", category: "daily", image: null, name: null },
  { id: "d09", text: "未使用でも減少する消耗品。消費過程は一切観測されていない。", category: "daily", image: null, name: null },
  { id: "d10", text: "内部で時間感覚が変化する空間。外部との時間差が発生する場合がある。", category: "daily", image: null, name: null },
  { id: "d11", text: "訪問記憶がないのに既視感を伴う風景。再訪時に印象が変化する。", category: "daily", image: null, name: null },
  { id: "d12", text: "認識と異なる配置に変化する家具。移動の過程は確認されていない。", category: "daily", image: null, name: null },

  // ── SF ──────────────────────────────────────
  { id: "s01", text: "観測ごとに形状が変化する物質。観測手段によって結果が異なる。", category: "sf", image: null, name: null },
  { id: "s02", text: "重力方向が反転する空間領域。境界は不可視で侵入時に認識される。", category: "sf", image: null, name: null },
  { id: "s03", text: "記録には残るが記憶されない出来事。複数媒体に痕跡のみが残る。", category: "sf", image: null, name: null },
  { id: "s04", text: "時間進行が周囲と異なる領域。長時間滞在で差異が顕著になる。", category: "sf", image: null, name: null },
  { id: "s05", text: "異なる世界線由来とされる手書き記録。内容の解読は進んでいない。", category: "sf", image: null, name: null },
  { id: "s06", text: "辞書に存在しないが意味が共有される語。発生源は不明とされる。", category: "sf", image: null, name: null },
  { id: "s07", text: "接触しても温度変化が生じない物体。熱伝達が確認されていない。", category: "sf", image: null, name: null },
  { id: "s08", text: "未来から送信されたと推定されるデータ。解析は未完了である。", category: "sf", image: null, name: null },
  { id: "s09", text: "周期的に消失と出現を繰り返す構造物。消失中は観測不能となる。", category: "sf", image: null, name: null },
  { id: "s10", text: "存在は確認されるが直接観測できない対象。影響のみが記録される。", category: "sf", image: null, name: null },
  { id: "s11", text: "一部の観測者に認識できない色彩。機器では存在が確認されている。", category: "sf", image: null, name: null },
  { id: "s12", text: "接触時に局所的な時間逆行を引き起こす地点。影響範囲は限定的。", category: "sf", image: null, name: null },

  // ── 乙女 ────────────────────────────────────
  { id: "r01", text: "視線接触時に心拍数が上昇する現象。対象との関係性が影響するとされる。", category: "romance", image: null, name: null },
  { id: "r02", text: "記憶内にのみ存在する香り。物理的再現は確認されていない。", category: "romance", image: null, name: null },
  { id: "r03", text: "特定の呼称で体温が上昇する現象。関係性により強度が変化する。", category: "romance", image: null, name: null },
  { id: "r04", text: "夢の中でのみ接触可能な人物像。現実空間では観測されていない。", category: "romance", image: null, name: null },
  { id: "r05", text: "無意識に探索行動を引き起こす対象。触覚記憶の影響が強い。", category: "romance", image: null, name: null },
  { id: "r06", text: "言語化されず消失する感情の残留。記録は困難だが存在は確認される。", category: "romance", image: null, name: null },
  { id: "r07", text: "偶然を超えて反復される出会い。発生要因は解明されていない。", category: "romance", image: null, name: null },
  { id: "r08", text: "接触後も感覚が持続する現象。特に指先で顕著に現れる。", category: "romance", image: null, name: null },
  { id: "r09", text: "想起ごとに細部が変化する記憶対象。固定された形状を持たない。", category: "romance", image: null, name: null },
  { id: "r10", text: "発話されなかった感情が残留する現象。視覚的な確認はできない。", category: "romance", image: null, name: null },
  { id: "r11", text: "距離に反比例して心理的距離が縮まる関係性。逆転した感覚を持つ。", category: "romance", image: null, name: null },
  { id: "r12", text: "非接触でも安心感を与える存在。過度な接近で不安定化する。", category: "romance", image: null, name: null },
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

/* =====================================================================
 保存層
 - collectCurrentWork(): 現在表示中の6件を DB スキーマ形式に整形
 - saveWork(): Supabase の works テーブルに insert して id を返す
 - handleSave(): UI の状態管理（loading / success / error）
    ===================================================================== */

/**
 * DOM のカード一覧から現在表示中の作品データを収集する
 * - topics:   テキスト情報のみの配列（DB の topics カラムに対応）
 * - dataURLs: { topicId: DataURL | null }（Storage アップロード用・DB には保存しない）
 */
function collectCurrentWork() {
  const cards = [...document.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate) .card")];
  const topics = cards.map((card) => {
    const t = TOPICS.find((tp) => tp.id === card.dataset.id);
    return { id: t.id, text: t.text, category: t.category, name: t.name ?? null };
  });
  const dataURLs = Object.fromEntries(topics.map((t) => [t.id, TOPICS.find((tp) => tp.id === t.id)?.image ?? null]));
  return { topics, dataURLs };
}

/**
 * works テーブルに insert して生成された id を返す
 * - DataURL を Storage にアップロードしてパスを images カラムに保存する
 * - アップロード失敗した画像は null で保存する
 * @returns {Promise<string>} 保存された作品の id
 */
async function saveWork() {
  if (!supabaseClient) {
    throw new Error("Supabase未設定：SUPABASE_URL と SUPABASE_ANON_KEY を入力してください");
  }

  const { topics, dataURLs } = collectCurrentWork();

  // DataURL → Storage アップロード → パスを収集（失敗は null）
  const imageEntries = await Promise.all(
    topics.map(async (t) => {
      const dataURL = dataURLs[t.id];
      if (!dataURL) return [t.id, null];
      try {
        const blob = dataURLtoBlob(dataURL);
        const ext = blob.type.split("/")[1] || "png";
        const path = `works/${Date.now()}/${t.id}.${ext}`;
        const { error } = await supabaseClient.storage.from("work-images").upload(path, blob);
        if (error) throw error;
        return [t.id, path];
      } catch {
        return [t.id, null];
      }
    }),
  );
  const images = Object.fromEntries(imageEntries);

  const { data, error } = await supabaseClient.from("works").insert({ title: "おもろ図鑑", topics, images }).select("id").single();

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
let currentWorkId = crypto.randomUUID();

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
 * DataURL を Blob に変換する（Storage アップロード用）
 * @param {string} dataURL
 * @returns {Blob}
 */
function dataURLtoBlob(dataURL) {
  const [header, base64] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

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
async function handleImageUpload(id, file) {
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("画像は5MB以下にしてください");
    return;
  }

  const dataURL = await readFileAsDataURL(file);

  // TOPICSオブジェクトに直接書き込む（stateとデータを統合）
  const topic = TOPICS.find((t) => t.id === id);
  if (!topic) return;
  topic.image = dataURL;

  // カード単体のメディアエリアだけ差し替え（全再描画しない）
  updateCardMedia(id);

  // Supabase Storage にアップロード（UIブロックなし・バックグラウンド）
  if (supabaseClient) {
    const path = `works/${currentWorkId}/${id}.png`;
    const { error } = await supabaseClient.storage.from("work-images").upload(path, file, { upsert: true });
    if (error) {
      console.error("upload error", error);
    } else {
      console.log("upload success", path);
    }
  }
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
function createCardHTML(topic, index) {
  const num = String(index + 1).padStart(2, "0");
  return `
  <div class="swiper-slide">
    <article class="card" data-id="${topic.id}" data-category="${topic.category}" data-num="${num}">
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
function restoreWork(work) {
  const topicsWithImages = work.topics.map((t) => {
    const storagePath = work.images?.[t.id] ?? null;
    const image = storagePath ? `${SUPABASE_URL}/storage/v1/object/public/work-images/${storagePath}` : null;
    return { ...t, image };
  });

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
    restoreWork(work);
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
  const grid = document.getElementById("cardGrid");
  const picks = await fetchTopics(category);
  destroySwiper();
  grid.innerHTML = buildSwiperHTML(picks.map(createCardHTML).join(""));
  initSwiper();
  updateSaveSection();
  updateShareBar();
}

/** フィルターバーをCATEGORIES配列から生成 */
function initFilterBar() {
  const bar = document.getElementById("filterBar");
  bar.innerHTML =
    CATEGORIES.map(
      (cat, i) => `
  <button
    class="filter-btn${i === 0 ? " is-active" : ""}"
    data-category="${cat.key ?? ""}"
  >${cat.label}</button>
`,
    ).join("") + `<button class="btn-reset-all" id="btnResetAll">リセット</button>`;
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

/* リセットボタン */
document.getElementById("filterBar").addEventListener("click", (e) => {
  if (!e.target.closest("#btnResetAll")) return;

  const cards = [...document.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate) .card")];
  if (cards.length === 0) return;

  const currentIds = cards.map((c) => c.dataset.id);
  currentIds.forEach((id) => {
    const t = TOPICS.find((tp) => tp.id === id);
    if (t) {
      t.image = null;
      t.name = null;
    }
  });

  const picks = currentIds.map((id) => TOPICS.find((t) => t.id === id));
  const grid = document.getElementById("cardGrid");
  destroySwiper();
  grid.innerHTML = buildSwiperHTML(picks.map(createCardHTML).join(""));
  initSwiper();
  currentWorkId = crypto.randomUUID();
  updateSaveSection();
  updateShareBar();
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

/* スクショモード解除（サブタイトル下ボタン） */
document.getElementById("btnExitScreenshot").addEventListener("click", () => {
  document.getElementById("btnScreenshot").click();
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
