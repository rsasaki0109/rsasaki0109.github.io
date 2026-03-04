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
      projectLoading: "最新リポジトリを取得中...",
      projectLoadError: "GitHubリポジトリを取得できませんでした。時間をおいて再読み込みしてください。",
      projectNotFound: "公開リポジトリが見つかりませんでした。",
      noPostsTitle: "投稿なし",
      noPostsText: "投稿情報を取得できませんでした。時間をおいて再取得してください。",
      unavailable: "未取得",
      unavailableText: "データ取得に失敗しました。少し時間をおいて再読み込みしてください。",
      githubError: "error",
      videoUnsupported:
        "お使いのブラウザは動画/GIFの再生に対応していません。投稿を開いて確認してください。",
    },
    en: {
      projectLoading: "Loading recent repositories...",
      projectLoadError: "Failed to load GitHub repositories. Please refresh again later.",
      projectNotFound: "No public repositories found.",
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

  const repoStatsImage = (repo) =>
    `https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${encodeURIComponent(
      repo.name
    )}&show_owner=true&show_icons=true&theme=transparent&hide_border=true`;

  const normalizeImageUrl = (repoName, branch, rawUrl) => {
    if (!rawUrl) return "";
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    if (trimmed.startsWith("/")) {
      return `https://raw.githubusercontent.com/${username}/${repoName}/${branch}${trimmed}`;
    }

    if (trimmed.startsWith("../")) {
      return `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/${trimmed.replace("../", "")}`;
    }

    if (trimmed.startsWith("./")) {
      return `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/${trimmed.slice(2)}`;
    }

    return `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/${trimmed}`;
  };

  const findReadmeImage = (text, repoName, branch) => {
    if (!text) return "";
    const md = text.match(/!\[[^\]]*?\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/);
    if (md?.[1]) {
      return normalizeImageUrl(repoName, branch, md[1].trim().replace(/\s+["'][^"']+["']$/, "").trim());
    }

    const html = text.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (html?.[1]) {
      return normalizeImageUrl(repoName, branch, html[1]);
    }

    return "";
  };

  const pickReadmeImage = async (repo) => {
    const uniqueBranches = [];
    if (repo.default_branch) {
      uniqueBranches.push(repo.default_branch);
    }
    uniqueBranches.push("main", "master");
    const branches = Array.from(new Set(uniqueBranches.filter(Boolean)));

    for (const branch of branches) {
      const readmePaths = [
        `https://raw.githubusercontent.com/${username}/${repo.name}/${branch}/README.md`,
        `https://raw.githubusercontent.com/${username}/${repo.name}/${branch}/readme.md`,
        `https://raw.githubusercontent.com/${username}/${repo.name}/${branch}/README.rst`,
        `https://raw.githubusercontent.com/${username}/${repo.name}/${branch}/readme.rst`,
      ];

      for (const readmePath of readmePaths) {
        try {
          const response = await fetch(readmePath, { cache: "no-store" });
          if (!response.ok) continue;
          const body = await response.text();
          const image = findReadmeImage(body, repo.name, branch);
          if (image) {
            return image;
          }
        } catch {
          // keep searching other paths
        }
      }
    }

    return "";
  };

  const repoCard = (repo, imageUrl) => `
    <article class="card project-card">
      <img
        class="repo-thumb"
        loading="lazy"
        alt="${repo.name} repository card"
        src="${imageUrl || repoStatsImage(repo)}"
        onerror="this.style.display='none'"
      />
      <h3><a class="subtle-link" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
      <p>${repo.description || "説明なし"}</p>
      <p class="meta">${repo.language || "Language N/A"} / stars: ${toText(repo.stargazers_count)}</p>
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

  const renderProjects = async (repos, fallbackContainer) => {
    if (!Array.isArray(repos) || !fallbackContainer) {
      return;
    }

    const sortedRepos = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));

    const topRepos = sortedRepos.slice(0, 6);
    const nodes = await Promise.all(
      topRepos.map(async (repo) => {
        let image = "";
        try {
          image = await pickReadmeImage(repo);
        } catch {
          image = "";
        }
        return repoCard(repo, image);
      })
    );

    fallbackContainer.innerHTML =
    nodes.join("") || `<article class="card project-card"><p class="muted">${t("projectNotFound")}</p></article>`;
  };

  const loadProjects = (repos, list) => {
    renderProjects(repos, list).catch(() => {
      list.innerHTML =
        `<article class="card project-card"><p class="muted">${t("projectLoadError")}</p></article>`;
    });
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
        list.innerHTML =
          `<article class="card project-card"><p class="muted">${t("projectLoadError")}</p></article>`;
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
