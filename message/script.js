// script.js
(() => {
  const $ = (sel) => document.querySelector(sel);

  // ===== 스크롤 페이드 =====
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  // ===== 설문 추천 로직 =====
  const STORAGE_KEY = "privacyMessengerSurveyResults.v1";
  const form = $("#surveyForm");
  const banner = $("#surveyResult");
  const historyList = $("#historyList");
  const btnClear = $("#btnClear");

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveHistory(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function fmt(ts) {
    const d = new Date(ts);
    // 로컬 환경에 따라 표시가 달라질 수 있음
    return d.toLocaleString();
  }

  function renderHistory() {
    const list = loadHistory().slice(-6).reverse();
    if (list.length === 0) {
      historyList.textContent = "아직 기록이 없어.";
      return;
    }
    historyList.innerHTML = list
      .map((r) => {
        const a = r.answers;
        return `
          <div class="history-item">
            <div><strong>${escapeHtml(r.recommendation.name)}</strong> <span class="small">(${escapeHtml(r.recommendation.mode)})</span></div>
            <div class="small">${escapeHtml(fmt(r.ts))}</div>
            <div class="small">
              Q1 Meta거부감: ${escapeHtml(a.avoidMeta)} ·
              Q2 민감대화: ${escapeHtml(a.sensitiveWhere)} ·
              Q3 PC필요: ${escapeHtml(a.needPC)} ·
              Q4 분리운영: ${escapeHtml(a.acceptSplit)}
            </div>
          </div>
        `;
      })
      .join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /**
   * 추천 결과를 { name, mode, why[] }로 반환
   * - name: 메신저 이름
   * - mode: 추천 방식(예: 기본 사용 / Secret Chat 권장 등)
   * - why: 추천 이유 bullet
   */
  function recommend(answers) {
    const avoidMeta = answers.avoidMeta;           // yes/no
    const sensitiveWhere = answers.sensitiveWhere; // oneToOne/group/rare
    const needPC = answers.needPC;                 // high/mid/low
    const acceptSplit = answers.acceptSplit;       // yes/no

    // 규칙 기반(단순/투명) 추천:
    // 1) Meta 거부감이 크면 -> Telegram 쪽. 다만 민감 대화/분리 운영 가능 여부로 모드 분기
    if (avoidMeta === "yes") {
      if (acceptSplit === "yes") {
        return {
          name: "Telegram",
          mode: "민감대화는 Secret Chat 권장",
          why: [
            "Meta 계열 회피가 최우선이면 Telegram이 심리적으로 가장 맞을 수 있어.",
            "민감대화는 ‘Secret Chat(분리 운영)’로 본문 보호를 더 챙기는 전략이 현실적이야.",
            needPC === "high"
              ? "PC/웹 사용이 많다면 Cloud 편의성이 강점이지만, 민감대화는 분리해서 운영하는 게 좋아."
              : "폰 중심이면 Secret Chat로 민감대화를 분리해도 부담이 덜해."
          ]
        };
      }
      // Meta는 싫은데 분리 운영은 싫다 -> 텔레그램 Cloud로 쓰면 ‘기본 E2EE’ 관점에서 충돌이 생김
      return {
        name: "Telegram",
        mode: "편의성 중심(민감대화는 최소화 권장)",
        why: [
          "Meta 계열 회피가 우선이면 Telegram이 후보가 되기 쉬워.",
          "다만 ‘분리 운영’을 원치 않으면 민감대화는 앱 안에서 최소화하는 습관이 중요해.",
          "자동삭제/잠금/알림 최소화 같은 설정으로 ‘흔적’을 줄이는 쪽에 신경 써봐."
        ]
      };
    }

    // 2) Meta 상관없고, 민감대화가 1:1 중심이면 -> 기본 E2EE 쪽(WhatsApp) 추천이 단순함
    if (avoidMeta === "no" && sensitiveWhere === "oneToOne") {
      return {
        name: "WhatsApp",
        mode: "기본 E2EE 중심 사용",
        why: [
          "민감대화를 1:1에서 많이 하면 ‘기본 E2EE’가 단순하고 강력한 기준이 돼.",
          "백업이 약한 고리가 될 수 있으니, 백업 보안 설정은 꼭 점검해.",
          needPC === "high"
            ? "PC 사용이 많으면 기기 잠금/알림/화면 노출(회의실, 사무실)을 같이 관리해줘."
            : "폰 중심이면 자동삭제/알림 최소화 같은 습관이 체감이 커."
        ]
      };
    }

    // 3) Meta 상관없고, PC/업무 사용이 높고, 편의성 우선이면 -> Messenger도 선택지 (단, 표시/전환 확인)
    if (avoidMeta === "no" && needPC === "high") {
      return {
        name: "Messenger",
        mode: "E2EE 표시/설정 확인하며 사용",
        why: [
          "PC/업무 편의성이 최우선이면 Messenger는 접근성이 좋아.",
          "단, E2EE 적용/전환 구간이 섞일 수 있으니 ‘암호화 표시/설정’ 확인 습관이 중요해.",
          "민감대화는 가능하면 E2EE 상태에서만 하거나, 대화 자체를 최소화하는 게 안전해."
        ]
      };
    }

    // 4) 그 외: 기본값은 WhatsApp(단순) 또는 Messenger(이미 쓰는 생태계)로 갈리는데,
    // 여기서는 ‘회사 데이터 수집이 싫다’라는 원문 취지를 반영해 본문 보호(기본 E2EE) 쪽으로 기울임.
    return {
      name: "WhatsApp",
      mode: "기본 E2EE 중심 사용",
      why: [
        "Meta 상관없다면, ‘기본 E2EE’는 선택을 단순하게 만들어줘.",
        "단톡에서 민감 얘기를 자주 한다면, 단톡 자체를 줄이는 습관(분리/최소화)이 더 중요해.",
        "백업/알림/스크린 노출 같은 ‘암호화 밖의 구멍’도 꼭 같이 관리해줘."
      ]
    };
  }

  function setBanner(reco) {
    // 애니메이션 재실행: pop 클래스를 잠깐 제거했다가 다시 추가
    banner.innerHTML = `
      <div class="result-title">추천 결과</div>
      <div class="result-body">
        <span class="reco" id="recoName">${escapeHtml(reco.name)}</span>
        <span class="muted"> — ${escapeHtml(reco.mode)}</span>
        <ul class="muted" style="margin:10px 0 0; padding-left:18px;">
          ${reco.why.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}
        </ul>
      </div>
    `;

    const nameEl = $("#recoName");
    // reflow 트릭으로 animation restart
    nameEl.classList.remove("pop");
    void nameEl.offsetWidth;
    nameEl.classList.add("pop");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const answers = {
      avoidMeta: String(fd.get("avoidMeta")),
      sensitiveWhere: String(fd.get("sensitiveWhere")),
      needPC: String(fd.get("needPC")),
      acceptSplit: String(fd.get("acceptSplit")),
    };

    const recommendation = recommend(answers);

    // 저장(히스토리 누적)
    const hist = loadHistory();
    hist.push({
      ts: Date.now(),
      answers,
      recommendation,
    });
    saveHistory(hist);

    setBanner(recommendation);
    renderHistory();
  });

  btnClear.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
    banner.innerHTML = `
      <div class="result-title">추천 결과가 여기 표시돼</div>
      <div class="result-body muted">설문을 제출하면 “메신저 이름”이 애니메이션으로 뜰 거야.</div>
    `;
  });

  // 초기 렌더
  renderHistory();
})();
