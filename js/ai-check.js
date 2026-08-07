/* ============================================
   AI活用度診断(AX成熟度チェック)
   ============================================ */
(() => {
  const QUESTIONS = [
    {
      cat: '利用状況',
      text: '社内で生成AI(ChatGPTなど)は、どの程度使われていますか?',
      options: [
        { label: '使っていない、または利用を禁止している', score: 0 },
        { label: '一部の社員が個人的に使っている', score: 1 },
        { label: 'チーム・部署単位で業務に使っている', score: 2 },
      ],
    },
    {
      cat: 'ルール整備',
      text: 'AI利用のガイドライン(入力してよい情報の範囲など)は整備されていますか?',
      options: [
        { label: '整備していない', score: 0 },
        { label: '口頭・暗黙のルールはある', score: 1 },
        { label: '明文化され、全社に共有されている', score: 2 },
      ],
    },
    {
      cat: '課題の把握',
      text: '「どの業務にどれだけ時間がかかっているか」を把握できていますか?',
      options: [
        { label: '把握できていない', score: 0 },
        { label: '感覚的には分かっている', score: 1 },
        { label: '業務の棚卸しを行い、数字で把握している', score: 2 },
      ],
    },
    {
      cat: '業務への組み込み',
      text: 'AIは業務フローやシステムに組み込まれていますか?',
      options: [
        { label: 'チャット画面で個別に使うだけ', score: 0 },
        { label: '一部の業務で定型的に使っている', score: 1 },
        { label: 'システムに組み込まれ、自動で動いている', score: 2 },
      ],
    },
    {
      cat: 'データ活用',
      text: '社内のマニュアルや過去資料は、AIが参照できる状態に整理されていますか?',
      options: [
        { label: '各所に散在していて整理されていない', score: 0 },
        { label: '一部は整理されている', score: 1 },
        { label: '整理され、検索・参照できる仕組みがある', score: 2 },
      ],
    },
    {
      cat: '推進体制',
      text: 'AI活用を推進する担当者・責任者は決まっていますか?',
      options: [
        { label: '決まっていない', score: 0 },
        { label: '兼任で担当している人がいる', score: 1 },
        { label: '責任者が明確で、定期的にレビューしている', score: 2 },
      ],
    },
    {
      cat: '効果測定',
      text: 'AI活用の効果(削減時間・利用率など)を測定していますか?',
      options: [
        { label: '測定していない', score: 0 },
        { label: '感覚的に効果を感じている程度', score: 1 },
        { label: '指標を決めて定期的に測定している', score: 2 },
      ],
    },
    {
      cat: '開発リソース',
      text: 'AIを使った仕組みを開発・改善できる体制はありますか?',
      options: [
        { label: '社内に知見がなく、相談先もない', score: 0 },
        { label: '相談できる先はあるが、体制は未整備', score: 1 },
        { label: '社内または外部パートナーと継続的に開発できる', score: 2 },
      ],
    },
  ];

  const LEVELS = [
    {
      max: 3,
      lv: 'Lv.0',
      name: '未着手',
      desc: 'AI活用はこれからの段階です。まずは「安全に使える環境」を整えることが最優先。いきなり大きな仕組みを作る必要はありません。日常業務の一部でAIを試すところから始めれば、社内の理解も自然に進みます。',
      actions: [
        'AI利用のガイドライン(入力してよい情報の範囲・確認ルール)を定める',
        '議事録の要約や文書のたたき台作成など、日常業務の1つで試す',
        '時間がかかっている業務を洗い出し、AIで代替できそうな候補を挙げる',
      ],
      articles: ['generative-ai-adoption', 'ax-guide', 'ai-glossary'],
    },
    {
      max: 7,
      lv: 'Lv.1',
      name: '個人利用',
      desc: '一部の社員がAIを使い始めている段階です。ここでの課題は「個人の工夫」を「組織の仕組み」に変えること。うまく使えている人のやり方を共有し、全社のルールとして整えることで、活用の裾野が一気に広がります。',
      actions: [
        '社内で使えているケースを集め、成功事例として共有する',
        'ガイドラインを明文化し、安心して使える状態にする',
        '効果が見えやすい業務(問い合わせ対応など)を1つ選び、チーム単位で試す',
      ],
      articles: ['generative-ai-adoption', 'business-automation', 'ax-guide'],
    },
    {
      max: 11,
      lv: 'Lv.2',
      name: '業務利用',
      desc: 'チーム単位でAIが業務に使われている段階です。多くの企業がここで足踏みします。次の壁は「使う」から「組み込む」への移行——チャット画面で個別に使う状態から、業務フローやシステムの中で自動的に動く状態へ進むことで、効果が大きく変わります。',
      actions: [
        '効果が実証できた業務を、AIエージェントとして業務フローに組み込む',
        '社内資料を整理し、RAG(社内ナレッジ検索)で活用できる状態にする',
        '削減時間・利用率などの指標を決めて、効果を数字で測る',
      ],
      articles: ['ai-agent-implementation-guide', 'rag', 'business-automation'],
    },
    {
      max: 14,
      lv: 'Lv.3',
      name: '業務組み込み',
      desc: 'AIが業務システムに組み込まれ、実際に稼働している段階です。ここまで来ると、次は「対象範囲の拡大」と「開発スピード」が論点になります。適用業務を広げつつ、AI駆動開発によって改善サイクル自体を高速化していく段階です。',
      actions: [
        '成功した仕組みを他部署・他業務へ横展開する',
        'AI駆動開発を取り入れ、改善サイクル自体を高速化する',
        '運用オーナーを明確にし、継続的な精度改善の体制を作る',
      ],
      articles: ['ai-driven-development-guide', 'ai-agent-implementation-guide', 'ax-guide'],
    },
    {
      max: 16,
      lv: 'Lv.4',
      name: '事業変革',
      desc: 'AIを前提に業務が設計されている、先進的な段階です。ここからは、社内効率化の枠を超えて「AIを前提とした新しい事業・サービス」を生み出すフェーズ。既存業務の改善と並行して、新規プロダクトの検証を回していくことが競争力につながります。',
      actions: [
        'AI前提の新サービス・新規事業をPoCで検証する',
        '開発体制の内製化を進め、改善スピードをさらに引き上げる',
        '得られた知見を組織の標準プロセスとして定着させる',
      ],
      articles: ['ai-driven-development-guide', 'poc-vs-mvp', 'ax-guide'],
    },
  ];

  const ARTICLES = {
    'generative-ai-adoption': '生成AIの社内導入ステップ|進め方・失敗しないポイント',
    'ax-guide': 'AX推進 完全ガイド|成熟度ステップ・体制づくり',
    'ai-glossary': 'AI用語集|重要用語18選をわかりやすく解説',
    'business-automation': '業務自動化の進め方|手順とAI活用のポイント',
    'ai-agent-implementation-guide': 'AIエージェント導入ガイド|メリット・事例・費用・進め方',
    'rag': 'RAGとは?仕組みと社内データ活用をわかりやすく解説',
    'ai-driven-development-guide': 'AI駆動開発 完全ガイド|工程別のAI活用・進め方',
    'poc-vs-mvp': 'PoCとMVPの違いとは?目的・使い分け・進める順番',
  };

  const intro = document.getElementById('checkIntro');
  const quiz = document.getElementById('checkQuiz');
  const result = document.getElementById('checkResult');
  if (!intro || !quiz || !result) return;

  const els = {
    start: document.getElementById('startBtn'),
    back: document.getElementById('backBtn'),
    retry: document.getElementById('retryBtn'),
    qCat: document.getElementById('qCat'),
    qText: document.getElementById('qText'),
    qOptions: document.getElementById('qOptions'),
    qCurrent: document.getElementById('qCurrent'),
    qTotal: document.getElementById('qTotal'),
    progress: document.getElementById('progressFill'),
    level: document.getElementById('resultLevel'),
    name: document.getElementById('resultName'),
    desc: document.getElementById('resultDesc'),
    gauge: document.getElementById('gaugeFill'),
    actions: document.getElementById('resultActions'),
    articles: document.getElementById('resultArticles'),
  };

  let index = 0;
  const answers = [];
  els.qTotal.textContent = QUESTIONS.length;

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function render() {
    const q = QUESTIONS[index];
    els.qCat.textContent = q.cat;
    els.qText.textContent = q.text;
    els.qCurrent.textContent = index + 1;
    els.progress.style.width = ((index / QUESTIONS.length) * 100) + '%';
    els.back.hidden = index === 0;

    els.qOptions.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'check-option';
      if (answers[index] === i) btn.classList.add('selected');
      btn.textContent = opt.label;
      btn.addEventListener('click', () => choose(i));
      els.qOptions.appendChild(btn);
    });
  }

  function choose(optionIndex) {
    answers[index] = optionIndex;
    if (index < QUESTIONS.length - 1) {
      index++;
      render();
    } else {
      showResult();
    }
  }

  function showResult() {
    const score = answers.reduce((sum, a, i) => sum + QUESTIONS[i].options[a].score, 0);
    const level = LEVELS.find((l) => score <= l.max) || LEVELS[LEVELS.length - 1];

    els.level.textContent = level.lv;
    els.name.textContent = level.name;
    els.desc.textContent = level.desc;
    els.progress.style.width = '100%';

    const lvNum = parseInt(level.lv.replace('Lv.', ''), 10);
    els.gauge.style.width = (((lvNum + 0.5) / 5) * 100) + '%';

    els.actions.innerHTML = '';
    level.actions.forEach((a) => {
      const li = document.createElement('li');
      li.textContent = a;
      els.actions.appendChild(li);
    });

    els.articles.innerHTML = '';
    level.articles.forEach((slug) => {
      const a = document.createElement('a');
      a.href = 'column/' + slug + '.html';
      a.textContent = ARTICLES[slug] + ' →';
      els.articles.appendChild(a);
    });

    quiz.hidden = true;
    result.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    track('diagnosis_complete', { diagnosis_level: level.lv, diagnosis_score: score });
  }

  els.start.addEventListener('click', () => {
    intro.hidden = true;
    quiz.hidden = false;
    index = 0;
    answers.length = 0;
    render();
    track('diagnosis_start');
  });

  els.back.addEventListener('click', () => {
    if (index > 0) { index--; render(); }
  });

  els.retry.addEventListener('click', () => {
    result.hidden = true;
    intro.hidden = false;
    index = 0;
    answers.length = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
