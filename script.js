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
      projectCategoryTop: "Top Starred",
      projectCategoryActive: "Recent Active",
      noPostsTitle: "投稿なし",
      noPostsText: "投稿情報を取得できませんでした。時間をおいて再取得してください。",
      unavailable: "未取得",
      unavailableText: "データ取得に失敗しました。少し時間をおいて再読み込みしてください。",
      githubError: "error",
      likes: "いいね",
      retweets: "リツイート",
      impressions: "インプレッション",
      videoUnsupported:
        "お使いのブラウザは動画/GIFの再生に対応していません。投稿を開いて確認してください。",
    },
    en: {
      projectNotFound: "No public repositories found.",
      projectLanguage: "Primary language",
      projectStars: "stars",
      projectRepo: "GitHub Repo",
      languageUnavailable: "Language N/A",
      projectCategoryTop: "Top Starred",
      projectCategoryActive: "Recent Active",
      noPostsTitle: "No posts",
      noPostsText: "Failed to load posts. Please refresh again later.",
      unavailable: "Unavailable",
      unavailableText: "Failed to load data. Please refresh again later.",
      githubError: "error",
      likes: "Likes",
      retweets: "Retweets",
      impressions: "Impressions",
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

  const formatMetric = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "-";
    }
    if (value < 1000) {
      return toText(value);
    }
    return new Intl.NumberFormat(LOCALE === "en" ? "en-US" : "ja-JP", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
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

  const featuredProjects = [
    {
      name: "lidarslam_ros2",
      category: "top",
      description: {
        ja: "Pointcloud map authoring、benchmarking、Autoware compatible workflow まで含む ROS 2 LiDAR SLAM です。",
        en: "ROS 2 LiDAR SLAM for pointcloud-map authoring, benchmarking, and Autoware-compatible map workflows.",
      },
      tags: ["ROS 2", "LiDAR SLAM", "Mapping"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/lidarslam_ros2/develop/lidarslam/images/social_autoware_map_authoring.png",
      previewAlt: "lidarslam_ros2 preview",
      fallbackStars: 799,
      fallbackLanguage: "C++",
    },
    {
      name: "lidar_localization_ros2",
      category: "top",
      description: {
        ja: "NDT / GICP と pointcloud map を使う ROS 2 向け 3D LiDAR localization です。",
        en: "3D LiDAR localization with NDT/GICP and pointcloud maps in ROS 2.",
      },
      tags: ["ROS 2", "Localization", "LiDAR"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/lidar_localization_ros2/main/images/path.png",
      previewAlt: "lidar_localization_ros2 preview",
      fallbackStars: 484,
      fallbackLanguage: "C++",
    },
    {
      name: "li_slam_ros2",
      category: "top",
      description: {
        ja: "Tightly-coupled な LiDAR inertial SLAM を ROS 2 で実装したプロジェクトです。",
        en: "Tightly-coupled LiDAR inertial SLAM for ROS 2.",
      },
      tags: ["ROS 2", "LiDAR-Inertial", "SLAM"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/li_slam_ros2/develop/scanmatcher/images/li_slam.gif",
      previewAlt: "li_slam_ros2 preview",
      fallbackStars: 416,
      fallbackLanguage: "C++",
    },
    {
      name: "kalman_filter_localization_ros2",
      category: "top",
      description: {
        ja: "Kalman filtering による GNSS / IMU localization 実装です。",
        en: "GNSS / IMU localization using Kalman filtering.",
      },
      tags: ["GNSS", "IMU", "Kalman Filter"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/kalman_filter_localization_ros2/devel/images/demo_ekfl.gif",
      previewAlt: "kalman_filter_localization_ros2 preview",
      fallbackStars: 342,
      fallbackLanguage: "C++",
    },
    {
      name: "rust_robotics",
      category: "top",
      description: {
        ja: "Rust による robotics algorithms と reference implementations です。",
        en: "Robotics algorithms and reference implementations in Rust.",
      },
      tags: ["Rust", "Robotics", "Algorithms"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/rust_robotics/main/docs/assets/social-preview.svg",
      previewAlt: "rust_robotics preview",
      fallbackStars: 184,
      fallbackLanguage: "Rust",
    },
    {
      name: "gnssplusplus-library",
      category: "top",
      description: {
        ja: "modern C++ で書かれた GNSS / RTK / PPP / CLAS toolkit です。",
        en: "Modern C++ GNSS / RTK / PPP / CLAS toolkit.",
      },
      tags: ["C++", "GNSS", "RTK/PPP/CLAS"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/gnssplusplus-library/develop/docs/driving_odaiba_social_card.png",
      previewAlt: "gnssplusplus-library preview",
      fallbackStars: 119,
      fallbackLanguage: "C++",
    },
    {
      name: "dynamic-3d-object-removal",
      category: "active",
      description: {
        ja: "Public demo と ROS 2 realtime node を含む LiDAR dynamic object removal です。",
        en: "LiDAR dynamic object removal with public demos and a ROS 2 realtime node.",
      },
      tags: ["ROS 2", "LiDAR", "Demo"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/dynamic-3d-object-removal/master/demo/story_mode.gif",
      previewAlt: "dynamic-3d-object-removal preview",
      fallbackStars: 29,
      fallbackLanguage: "Python",
    },
    {
      name: "localization_zoo",
      category: "active",
      description: {
        ja: "Recent localization baselines、derived variants、tests、benchmarks をまとめたリポジトリです。",
        en: "Recent localization baselines, derived variants, tests, and benchmarks.",
      },
      tags: ["Localization", "Benchmarks", "Tests"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/localization_zoo/main/docs/benchmarks/latest/trajectory.png",
      previewAlt: "localization_zoo preview",
      fallbackStars: 12,
      fallbackLanguage: "Python",
    },
    {
      name: "CloudAnalyzer",
      category: "active",
      description: {
        ja: "Point-cloud analysis CLI。metrics、ICP、GICP workflow を含みます。",
        en: "Active point-cloud analysis CLI with metrics, ICP, and GICP workflows.",
      },
      tags: ["Point Cloud", "CLI", "Analysis"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/CloudAnalyzer/main/docs/images/f1_voxel05.png",
      previewAlt: "CloudAnalyzer preview",
      fallbackStars: 7,
      fallbackLanguage: "Python",
    },
    {
      name: "gnss_gpu",
      category: "active",
      description: {
        ja: "CUDA + Python による GPU-accelerated GNSS signal processing です。",
        en: "GPU-accelerated GNSS signal processing in CUDA + Python.",
      },
      tags: ["CUDA", "GNSS", "GPU"],
      preview: "https://raw.githubusercontent.com/rsasaki0109/gnss_gpu/main/docs/assets/media/site_poster.png",
      previewAlt: "gnss_gpu preview",
      fallbackStars: 3,
      fallbackLanguage: "CUDA",
    },
  ];

  const projectCategoryLabel = (category) =>
    category === "active" ? t("projectCategoryActive") : t("projectCategoryTop");

  const repoCard = (project, repo) => `
    <article class="card project-card">
      <div class="project-card-top">
        <span class="project-badge">${projectCategoryLabel(project.category)}</span>
        <a class="project-link" href="${repo?.html_url || `https://github.com/${username}/${project.name}`}" target="_blank" rel="noopener noreferrer">${t("projectRepo")}</a>
      </div>
      <a class="project-media" href="${repo?.html_url || `https://github.com/${username}/${project.name}`}" target="_blank" rel="noopener noreferrer" aria-label="${project.name}">
        <img
          class="project-preview"
          loading="lazy"
          decoding="async"
          alt="${project.previewAlt}"
          src="${project.preview}"
        />
      </a>
      <div class="project-card-head">
        <div>
          <h3><a class="subtle-link" href="${repo?.html_url || `https://github.com/${username}/${project.name}`}" target="_blank" rel="noopener noreferrer">${project.name}</a></h3>
          <p>${project.description[LOCALE]}</p>
        </div>
      </div>
      <div class="tag-list">
        ${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <p class="meta">${t("projectLanguage")}: ${project.fallbackLanguage || repo?.language || t("languageUnavailable")} / ${t("projectStars")}: ${typeof repo?.stargazers_count === "number" ? toText(repo.stargazers_count) : toText(project.fallbackStars)}</p>
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
      ${tweetMetrics(tweet)}
      ${tweetMedia(tweet)}
    </article>
  `;

  const tweetMetrics = (tweet) => {
    const metrics = tweet && tweet.metrics ? tweet.metrics : {};
    const hasMetrics = ["likes", "retweets", "impressions"].some(
      (key) => typeof metrics[key] === "number"
    );
    if (!hasMetrics) {
      return "";
    }

    return `
      <div class="tweet-stats" aria-label="tweet metrics">
        <span class="tweet-stat"><strong>${formatMetric(metrics.likes)}</strong> ${t("likes")}</span>
        <span class="tweet-stat"><strong>${formatMetric(metrics.retweets)}</strong> ${t("retweets")}</span>
        <span class="tweet-stat"><strong>${formatMetric(metrics.impressions)}</strong> ${t("impressions")}</span>
      </div>
    `;
  };

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
    const nodes = featuredProjects.map((project) => repoCard(project, repoMap.get(project.name)));

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
