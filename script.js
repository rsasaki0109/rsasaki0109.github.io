document.addEventListener("DOMContentLoaded", () => {
  const year = new Date().getFullYear();
  const yearElement = document.querySelector("#year");
  if (yearElement) {
    yearElement.textContent = String(year);
  }

  const pageLocale = ((window.__PAGE_LOCALE__ || (document.documentElement && document.documentElement.lang) || "ja").toString() || "ja").toLowerCase();
  const LOCALE = pageLocale.startsWith("en") ? "en" : "ja";
  const i18n = {
    ja: {
      projectNotFound: "表示できる主要リポジトリがありません。",
      projectLanguage: "主要言語",
      projectStars: "スター",
      projectRepo: "GitHubで開く",
      languageUnavailable: "未取得",
      noPostsTitle: "投稿なし",
      noPostsText: "投稿情報を取得できませんでした。時間をおいて再取得してください。",
      unavailable: "未取得",
      unavailableText: "データ取得に失敗しました。少し時間をおいて再読み込みしてください。",
      githubError: "error",
      videoUnsupported:
        "お使いのブラウザは動画/GIFの再生に対応していません。投稿を開いて確認してください。",
    },
    en: {
      projectNotFound: "No public repositories found.",
      projectLanguage: "Primary language",
      projectStars: "stars",
      projectRepo: "GitHub Repo",
      languageUnavailable: "Language N/A",
      noPostsTitle: "No posts",
      noPostsText: "Failed to load posts. Please refresh again later.",
      unavailable: "Unavailable",
      unavailableText: "Failed to load data. Please refresh again later.",
      githubError: "error",
      videoUnsupported:
        "Your browser does not support inline video/GIF playback. Open the post directly.",
    },
  };
  const t = (key) => i18n[LOCALE][key] || i18n.ja[key] || key;

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  const setTextById = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  const toText = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString(LOCALE === "en" ? "en-US" : "ja-JP");
    }
    return value || "-";
  };

  const setFallbackVisibility = (visible) => {
    const fallback = document.querySelector("#tweet-fallback");
    if (fallback) {
      if (visible) fallback.classList.add("visible");
      else fallback.classList.remove("visible");
    }
  };

  setFallbackVisibility(true);

  const toJson = (response) => {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  };

  const username = "rsasaki0109";
  const userApi = `https://api.github.com/users/${username}`;
  const reposApi = `${userApi}/repos?per_page=100`;

  const selectedProjects =
    LOCALE === "en"
      ? [
          {
            name: "lidarslam_ros2",
            description: "ROS 2 LiDAR SLAM for map authoring and benchmarking.",
            tags: ["ROS 2", "LiDAR SLAM", "Mapping"],
          },
          {
            name: "lidar_localization_ros2",
            description: "3D LiDAR localization in ROS 2.",
            tags: ["ROS 2", "Localization", "LiDAR"],
          },
          {
            name: "kalman_filter_localization_ros2",
            description: "GNSS/IMU localization with Kalman filtering.",
            tags: ["GNSS", "IMU", "Kalman Filter"],
          },
          {
            name: "rust_robotics",
            description: "Robotics algorithms implemented in Rust.",
            tags: ["Rust", "Robotics", "Algorithms"],
          },
          {
            name: "gnssplusplus-library",
            description: "Modern C++ GNSS / RTK / PPP / CLAS toolkit.",
            tags: ["C++", "GNSS", "RTK/PPP/CLAS"],
          },
        ]
      : [
          {
            name: "lidarslam_ros2",
            description: "ROS 2 向けの LiDAR SLAM。地図作成とベンチマーク用途をまとめて扱えます。",
            tags: ["ROS 2", "LiDAR SLAM", "Mapping"],
          },
          {
            name: "lidar_localization_ros2",
            description: "ROS 2 向けの 3D LiDAR localization 実装です。",
            tags: ["ROS 2", "Localization", "LiDAR"],
          },
          {
            name: "kalman_filter_localization_ros2",
            description: "Kalman filter を使った GNSS / IMU localization 実装です。",
            tags: ["GNSS", "IMU", "Kalman Filter"],
          },
          {
            name: "rust_robotics",
            description: "Rust で実装したロボティクス向けアルゴリズム集です。",
            tags: ["Rust", "Robotics", "Algorithms"],
          },
          {
            name: "gnssplusplus-library",
            description: "modern C++ による GNSS / RTK / PPP / CLAS toolkit です。",
            tags: ["C++", "GNSS", "RTK/PPP/CLAS"],
          },
        ];

  const repoCard = (project, repo) => `
    <article class="card project-card">
      <div class="project-card-head">
        <div>
          <h3><a class="subtle-link" href="${repo?.html_url || `https://github.com/${username}/${project.name}`}" target="_blank" rel="noopener noreferrer">${project.name}</a></h3>
          <p>${project.description}</p>
        </div>
        <a class="project-link" href="${repo?.html_url || `https://github.com/${username}/${project.name}`}" target="_blank" rel="noopener noreferrer">${t("projectRepo")}</a>
      </div>
      <div class="tag-list">
        ${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <p class="meta">${t("projectLanguage")}: ${repo?.language || t("languageUnavailable")} / ${t("projectStars")}: ${typeof repo?.stargazers_count === "number" ? toText(repo.stargazers_count) : "-"}</p>
    </article>
  `;

  const tweetMedia = (tweet) => {
    const link = tweet.url || "#";
    const media = tweet.media || {};
    const type = String(media.type || "").toLowerCase();
    const src = media.url || "";
    const poster = media.poster || tweet.image || "";
    const contentType = media.content_type || "video/mp4";

    if (["video", "gif", "animated_gif"].includes(type) && src) {
      return `<video controls playsinline preload="metadata" class="tweet-video" poster="${poster}">
        <source src="${src}" type="${contentType}" />
        ${t("videoUnsupported")}
      </video>`;
    }

    if (["photo", "image"].includes(type) && src) {
      return `<a href="${link}" target="_blank" rel="noopener noreferrer"><img src="${src}" alt="${tweet.text}" loading="lazy" /></a>`;
    }

    if (tweet.image) {
      return `<a href="${link}" target="_blank" rel="noopener noreferrer"><img src="${tweet.image}" alt="${tweet.text}" loading="lazy" /></a>`;
    }

    return "";
  };

  const tweetCard = (tweet) => `
    <article class="tweet-card">
      <p class="tweet-meta">${tweet.date}</p>
      <h3><a href="${tweet.url}" target="_blank" rel="noopener noreferrer">${tweet.text}</a></h3>
      <p>${tweet.desc}</p>
      ${tweetMedia(tweet)}
    </article>
  `;

  const loadFallbackTweets = (payload) => {
    const list = document.querySelector("#tweet-cards");
    if (!list) return;
    const records = Array.isArray(payload) ? payload : payload && payload.items ? payload.items : [];
    const updatedAt = payload.updated_at || "";
    const displayUpdated = updatedAt ? (updatedAt.split("T")[0] || updatedAt) : "不明";
    setTextById("tweets-updated", displayUpdated);
    if (!records.length) {
      list.innerHTML =
        `<article class="tweet-card"><p class="tweet-meta">${t("noPostsTitle")}</p><p>${t("noPostsText")}</p></article>`;
      return;
    }
    list.innerHTML = records
      .filter(Boolean)
      .map((tweet) => tweetCard(tweet))
      .join("");
  };

  const renderProjects = (repos, fallbackContainer) => {
    if (!Array.isArray(repos) || !fallbackContainer) {
      return;
    }

    const repoMap = new Map(
      repos
        .filter((repo) => !repo.fork)
        .map((repo) => [repo.name, repo])
    );
    const nodes = selectedProjects.map((project) => repoCard(project, repoMap.get(project.name)));

    fallbackContainer.innerHTML =
      nodes.join("") || `<article class="card project-card"><p class="muted">${t("projectNotFound")}</p></article>`;
  };

  const loadProjects = (repos, list) => {
    renderProjects(repos, list);
  };

  fetch(userApi)
    .then(toJson)
    .then((userData) => {
      setText("#gh-repos", toText(userData.public_repos));
      setText("#gh-followers", toText(userData.followers));
    })
    .catch(() => {
      setText("#gh-repos", t("githubError"));
      setText("#gh-followers", t("githubError"));
    });

  fetch(reposApi)
    .then(toJson)
    .then((repos) => {
      const list = document.querySelector("#project-list");
      if (!list) return;
      const repoItems = Array.isArray(repos) ? repos : repos.items || [];
      loadProjects(repoItems, list);
    })
    .catch(() => {
      const list = document.querySelector("#project-list");
      if (list) {
        loadProjects([], list);
      }
    });

  fetch("data/tweets.json", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load tweets.json");
      return res.json();
    })
    .then((tweets) => {
      const payload = {
        items: Array.isArray(tweets) ? tweets : (Array.isArray(tweets.items) ? tweets.items : []),
        updated_at: tweets.updated_at || "",
      };
      loadFallbackTweets(payload);
    })
    .catch(() => {
      const list = document.querySelector("#tweet-cards");
      if (list) {
        if (window.__TWEETS_CACHE__) {
          loadFallbackTweets(window.__TWEETS_CACHE__);
          return;
        }

        list.innerHTML =
          `<article class="tweet-card"><p class="tweet-meta">${t("unavailable")}</p><p>${t("unavailableText")}</p></article>`;
      }
    });
});
