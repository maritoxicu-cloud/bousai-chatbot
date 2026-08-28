import { Analytics } from '@vercel/analytics/react';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';
import './ChatBot.css';

// FINAL CACHE CLEAR: 2026-08-04 20:30:00
// This forces Vercel to rebuild with the latest condition check logic
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8001'
  : 'https://bousai-chatbot-production.up.railway.app';

// Axios インスタンス（API キーはバックエンドプロキシで隠蔽）
const apiClient = axios.create({
  baseURL: API_BASE_URL
});

const BANNER_ARRAY = [
  '<a href="//af.moshimo.com/af/c/click?a_id=5765392&p_id=6643&pc_id=18934&pl_id=84946" rel="nofollow" referrerpolicy="no-referrer-when-downgrade" attributionsrc><img src="//image.moshimo.com/af-img/6494/000000084946.jpg" width="728" height="90" style="border:none;"></a><img src="//i.moshimo.com/af/i/impression?a_id=5765392&p_id=6643&pc_id=18934&pl_id=84946" width="1" height="1" style="border:none;" loading="lazy">',
  '<a href="//af.moshimo.com/af/c/click?a_id=5765667&p_id=4412&pc_id=11419&pl_id=60612" rel="nofollow" referrerpolicy="no-referrer-when-downgrade" attributionsrc><img src="//image.moshimo.com/af-img/4017/000000060612.png" width="640" height="100" style="border:none;"></a><img src="//i.moshimo.com/af/i/impression?a_id=5765667&p_id=4412&pc_id=11419&pl_id=60612" width="1" height="1" style="border:none;" loading="lazy">',
  '<a href="//af.moshimo.com/af/c/click?a_id=5765391&amp;p_id=54&amp;pc_id=54&amp;pl_id=616&amp;url=https%3A%2F%2Fitem.rakuten.co.jp%2Flazo%2Fdp-toilet%2F&amp;m=http%3A%2F%2Fm.rakuten.co.jp%2Flazo%2Fi%2F10000269%2F" rel="nofollow" referrerpolicy="no-referrer-when-downgrade"><img src="//thumbnail.image.rakuten.co.jp/@0_mall/lazo/cabinet/11020203/dpto2601/imgrc0098292730.jpg?_ex=75x75" alt="" style="border: none;" /><br>防災用簡易トイレ FUTURE FOX 【防災士推奨】 災害用 防災トイレ ポータブルトイレ コンパクト 耐荷重150kg トイレキット付属 携帯トイレ 災害用トイレ</a><img src="//i.moshimo.com/af/i/impression?a_id=5765391&amp;p_id=54&amp;pc_id=54&amp;pl_id=616" alt="" loading="lazy" width="1" height="1" style="border: 0px;">',
  '<a href="//af.moshimo.com/af/c/click?a_id=5765662&p_id=4158&pc_id=10535&pl_id=62336" rel="nofollow" referrerpolicy="no-referrer-when-downgrade" attributionsrc><img src="//image.moshimo.com/af-img/3709/000000062336.jpg" width="468" height="60" style="border:none;"></a><img src="//i.moshimo.com/af/i/impression?a_id=5765662&p_id=4158&pc_id=10535&pl_id=62336" width="1" height="1" style="border:none;" loading="lazy">'
];

const ChatBot = () => {
  const [randomBannerIndex, setRandomBannerIndex] = useState(0);

  useEffect(() => {
    setRandomBannerIndex(Math.floor(Math.random() * BANNER_ARRAY.length));
  }, []);
  // Force rebuild: 2026-08-04 v3.0 FINAL
  const [messages, setMessages] = useState([
    { id: 1, text: 'こんにちは！防災について何でも聞いてね。クイズ、知識、避難所の検索ができるよ。', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentKnowledge, setCurrentKnowledge] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [mode, setMode] = useState('main'); // main, category_select, quiz, knowledge
  const [selectedType, setSelectedType] = useState(null); // quiz or knowledge
  const [currentCategory, setCurrentCategory] = useState(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const messagesEndRef = useRef(null);
  const previousMessagesLengthRef = useRef(0);
  const [sessionId, setSessionId] = useState(() => {
    let id = sessionStorage.getItem('quiz_session_id');
    if (!id) {
      id = `session_${uuidv4()}`;
      sessionStorage.setItem('quiz_session_id', id);
    }
    return id;
  });
  const [userScore, setUserScore] = useState({ total: 0, correct: 0 });
  const [showSplash, setShowSplash] = useState(true);
  const [showShelterModal, setShowShelterModal] = useState(false);

  // API キャッシング（5分間有効）
  const cacheRef = useRef({});
  const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  const getCacheKey = (endpoint, category) => `${endpoint}:${category || 'all'}`;

  const getFromCache = (endpoint, category) => {
    const key = getCacheKey(endpoint, category);
    const cached = cacheRef.current[key];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION_MS) {
      delete cacheRef.current[key];
      return null;
    }
    return cached.data;
  };

  const setCache = (endpoint, category, data) => {
    const key = getCacheKey(endpoint, category);
    cacheRef.current[key] = {
      data,
      timestamp: Date.now()
    };
  };

  // スプラッシュスクリーン表示・自動進む（毎回表示）
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 5000); // 5秒後に進む
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const handleResetScore = () => {
    // スコアをリセット
    setUserScore({ total: 0, correct: 0 });
    // 新しいセッション ID を生成
    const newSessionId = `session_${uuidv4()}`;
    setSessionId(newSessionId);
    sessionStorage.setItem('quiz_session_id', newSessionId);
    // リセット完了メッセージを表示
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: 'スコアがリセットされました。新しいセッションを開始しています。',
      sender: 'bot'
    }]);
  };

  // (ふりがな) を <ruby> に変換する関数
  // 『』が含まれる場合はテキストのまま、含まれない場合はrubyタグに変換
  const convertFuriganaToRuby = (text) => {
    // 『』が含まれる場合は（ふりがな）形式のまま返す（全角かぎかっこを確認）
    if (text.includes('「') || text.includes('」')) {
      return text;
    }

    // 改行で分割して、行ごとに処理してから復元
    const lines = text.split('\n');
    let globalKey = 0;

    const processLine = (line) => {
      let result = [];
      let i = 0;

      while (i < line.length) {
        const openParen = line.indexOf('(', i);
        const openParenZen = line.indexOf('（', i);
        const nextOpen = openParen === -1 ? openParenZen : (openParenZen === -1 ? openParen : Math.min(openParen, openParenZen));

        if (nextOpen === -1) {
          const remaining = line.substring(i);
          if (remaining) result.push(remaining);
          break;
        }

        const isZenParen = line[nextOpen] === '（';
        const closeParenChar = isZenParen ? '）' : ')';
        const closeParen = line.indexOf(closeParenChar, nextOpen);
        if (closeParen === -1) {
          const remaining = line.substring(i);
          if (remaining) result.push(remaining);
          break;
        }

        const ruby = line.substring(nextOpen + 1, closeParen);
        let j = nextOpen - 1;
        while (j >= 0 && /[一-鿿]/.test(line[j])) {
          j--;
        }
        j++;

        const kanji = line.substring(j, nextOpen);

        if (kanji && /^[ぁ-ん]+$/.test(ruby)) {
          const beforeText = line.substring(i, j);
          if (beforeText) result.push(beforeText);
          result.push(
            <ruby key={`ruby-${globalKey++}`}>{kanji}<rt>{ruby}</rt></ruby>
          );
          i = closeParen + 1;
        } else {
          result.push(line.substring(i, nextOpen + 1));
          i = nextOpen + 1;
        }
      }
      return result;
    };

    const allResults = [];
    lines.forEach((line, idx) => {
      allResults.push(...processLine(line));
      if (idx < lines.length - 1) {
        allResults.push(<br key={`br-${globalKey++}`} />);
      }
    });

    return allResults.length > 0 ? allResults : text;
  };

  // エラーメッセージを取得する関数
  const getErrorMessage = (error) => {
    if (error.response?.status === 401) {
      return 'APIキーが無効です。管理者にお問い合わせください。';
    } else if (error.response?.status === 429) {
      return 'リクエストが多すぎます。少しお待ちください。';
    } else if (error.response?.status === 400) {
      return 'リクエストが正しくありません。入力をご確認ください。';
    } else if (error.response?.status >= 500) {
      return 'サーバーエラーが発生しました。しばらく後にお試しください。';
    } else if (error.message === 'Network Error') {
      return 'ネットワークに接続できません。インターネット接続をご確認ください。';
    }
    return 'エラーが発生しました。もう一度お試しください。';
  };

  const quizCategories = ['地震', '洪水', '台風', '火災', '火山', '備蓄', 'その他'];
  const knowledgeCategories = ['地震', '洪水', '台風', '火災', '火山', '備蓄', 'ペット防災', 'その他'];
  const categoryEmojis = {
    '地震': '🌍',
    '洪水': '💧',
    '台風': '🌪️',
    '火災': '🔥',
    '火山': '🌋',
    '備蓄': '📦',
    'ペット防災': '🐾',
    'その他': '❓'
  };

  const scrollToNewMessage = () => {
    // 修正案4B：修正案2 + requestAnimationFrame（DOM完全レンダリング後）
    requestAnimationFrame(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer && messagesContainer.lastElementChild) {
        messagesContainer.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // 修正案6：メッセージの最初の子要素にスクロール（複雑なメッセージでも先頭で止まる）
    // requestAnimationFrame(() => {
    //   const messagesContainer = document.querySelector('.messages-container');
    //   if (messagesContainer) {
    //     const lastMessage = messagesContainer.querySelector('.message:last-of-type');
    //     if (lastMessage && lastMessage.firstElementChild) {
    //       lastMessage.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
    //     }
    //   }
    // });

    // 修正案5：setTimeout で遅延計算（メッセージ完全レンダリング後に offsetTop を正確に取得）
    // setTimeout(() => {
    //   const messagesContainer = document.querySelector('.messages-container');
    //   if (messagesContainer) {
    //     const lastMessage = messagesContainer.querySelector('.message:last-of-type');
    //     if (lastMessage) {
    //       const messageTop = lastMessage.offsetTop;
    //       messagesContainer.scrollTo({
    //         top: messageTop,
    //         behavior: 'smooth'
    //       });
    //     }
    //   }
    // }, 100);

    // 修正案4C：修正案2改（メッセージ全体にスクロール）+ requestAnimationFrame（DOM完全レンダリング後）
    // requestAnimationFrame(() => {
    //   const messagesContainer = document.querySelector('.messages-container');
    //   if (messagesContainer) {
    //     const lastMessage = messagesContainer.querySelector('.message:last-of-type');
    //     if (lastMessage) {
    //       lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    //     }
    //   }
    // });

    // 修正案4：requestAnimationFrame でDOM完全レンダリング後にスクロール
    // requestAnimationFrame(() => {
    //   const messagesContainer = document.querySelector('.messages-container');
    //   if (messagesContainer) {
    //     const lastMessage = messagesContainer.querySelector('.message:last-of-type');
    //     if (lastMessage) {
    //       const messageTop = lastMessage.offsetTop;
    //       messagesContainer.scrollTo({
    //         top: messageTop,
    //         behavior: 'smooth'
    //       });
    //     }
    //   }
    // });

    // 修正案3：メッセージの先頭ちょうどにスクロール位置を固定
    // const messagesContainer = document.querySelector('.messages-container');
    // if (messagesContainer) {
    //   const lastMessage = messagesContainer.querySelector('.message:last-of-type');
    //   if (lastMessage) {
    //     const messageTop = lastMessage.offsetTop;
    //     messagesContainer.scrollTo({
    //       top: messageTop,
    //       behavior: 'smooth'
    //     });
    //   }
    // }

    // 修正案2：新しいメッセージの先頭にスクロール（複雑なメッセージだと最後まで行く）
    // const messagesContainer = document.querySelector('.messages-container');
    // if (messagesContainer && messagesContainer.lastElementChild) {
    //   messagesContainer.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // }

    // 元の動作（最後の参照点にスクロール）
    // if (messagesEndRef.current) {
    //   messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // }
  };

  useEffect(() => {
    // 新しいメッセージが追加されたときだけスクロール
    if (messages.length > previousMessagesLengthRef.current) {
      scrollToNewMessage();
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages]);

  // 修正前：メッセージが変わるたびにスクロール実行（常にスクロール）
  // useEffect(() => {
  //   scrollToNewMessage();
  // }, [messages]);

  // ページロード時に SessionStorage から避難所情報と防災ラボ情報を復元
  useEffect(() => {
    const savedShelterState = sessionStorage.getItem('shelterState');
    if (savedShelterState) {
      try {
        const state = JSON.parse(savedShelterState);
        setMessages(prev => [...prev, state.message]);
        sessionStorage.removeItem('shelterState');
      } catch (error) {
        console.error('Error restoring shelter state:', error);
      }
    }

    const savedBousaiLabState = sessionStorage.getItem('bousaiLabState');
    if (savedBousaiLabState) {
      try {
        const state = JSON.parse(savedBousaiLabState);
        setMessages(prev => [...prev, state.message]);
        sessionStorage.removeItem('bousaiLabState');
      } catch (error) {
        console.error('Error restoring bousai lab state:', error);
      }
    }
  }, []);

  const getRandomItem = (data) => {
    return data[Math.floor(Math.random() * data.length)];
  };

  const displayQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentKnowledge(null);
    setAnswered(false);
    setShowNavigation(false);
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: `【${quiz.category}クイズ】\n\n${quiz.question}`,
      sender: 'bot',
      quiz: quiz,
      processAllContent: true
    }]);
  };

  // URL をリンク化する関数
  const convertUrlsToLinks = (text) => {
    // URL パターンを検出して <a> タグに変換
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlPattern);
    let globalKey = 0;

    return parts.flatMap((part, idx) => {
      if (!part) return [];

      if (part.match(urlPattern)) {
        // URL をリンク化
        return (
          <a
            key={`url-${globalKey++}`}
            href={part}
            target="_self"
            style={{
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            {part}
          </a>
        );
      }

      // テキスト部分を改行で分割して <br> を挿入
      const lines = part.split('\n');
      return lines.flatMap((line, lineIdx) => {
        if (!line && lineIdx < lines.length - 1) {
          // 空の行の場合、<br> だけ返す
          return <br key={`br-${globalKey++}`} />;
        }

        const elements = [line];
        if (lineIdx < lines.length - 1) {
          elements.push(<br key={`br-${globalKey++}`} />);
        }
        return elements;
      });
    });
  };

  // contentのふりがなをrubyタグに変換（『』チェックなし、改行対応）
  const processContentRuby = (text) => {
    const lines = text.split('\n');
    let globalKey = 0;

    const processLine = (line) => {
      let result = [];
      let i = 0;

      while (i < line.length) {
        const openParen = line.indexOf('(', i);
        const openParenZen = line.indexOf('（', i);
        const nextOpen = openParen === -1 ? openParenZen : (openParenZen === -1 ? openParen : Math.min(openParen, openParenZen));

        if (nextOpen === -1) {
          const remaining = line.substring(i);
          if (remaining) result.push(remaining);
          break;
        }

        const isZenParen = line[nextOpen] === '（';
        const closeParenChar = isZenParen ? '）' : ')';
        const closeParen = line.indexOf(closeParenChar, nextOpen);
        if (closeParen === -1) {
          const remaining = line.substring(i);
          if (remaining) result.push(remaining);
          break;
        }

        const ruby = line.substring(nextOpen + 1, closeParen);
        let j = nextOpen - 1;
        while (j >= 0 && /[一-鿿]/.test(line[j])) {
          j--;
        }
        j++;

        const kanji = line.substring(j, nextOpen);

        if (kanji && /^[ぁ-ん]+$/.test(ruby)) {
          const beforeText = line.substring(i, j);
          if (beforeText) result.push(beforeText);
          result.push(
            <ruby key={`content-${globalKey++}`}>{kanji}<rt>{ruby}</rt></ruby>
          );
          i = closeParen + 1;
        } else {
          result.push(line.substring(i, nextOpen + 1));
          i = nextOpen + 1;
        }
      }
      return result;
    };

    const allResults = [];
    lines.forEach((line, idx) => {
      allResults.push(...processLine(line));
      if (idx < lines.length - 1) {
        allResults.push(<br key={`br-${globalKey++}`} />);
      }
    });

    return allResults.length > 0 ? allResults : text;
  };

  const displayKnowledge = (knowledge) => {
    setCurrentQuiz(null);
    setCurrentKnowledge(knowledge);
    setShowNavigation(false);
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: `【${knowledge.category}】\n\n━━━━━━━━━━━━\n${knowledge.title}\n━━━━━━━━━━━━\n\n${knowledge.content}`,
      sender: 'bot',
      processAllContent: true  // contentのみrubyタグ処理フラグ
    }]);
    setShowNavigation(true);
  };

  const handleCategorySelect = async (category) => {
    setCurrentCategory(category);
    setLoading(true);
    setMode('quiz');

    try {
      if (selectedType === 'quiz') {
        let quizzes = getFromCache('/api/quizzes', category);
        if (!quizzes) {
          const response = await apiClient.post(`/api/proxy`, {
            endpoint: '/quizzes',
            params: { category }
          });
          quizzes = response.data.data;
          setCache('/api/quizzes', category, quizzes);
        }
        if (quizzes.length > 0) {
          const quiz = getRandomItem(quizzes);
          displayQuiz(quiz);
        }
      } else if (selectedType === 'knowledge') {
        setMode('knowledge');
        let knowledge_list = getFromCache('/api/knowledge', category);
        if (!knowledge_list) {
          const response = await apiClient.post(`/api/proxy`, {
            endpoint: '/knowledge',
            params: { category }
          });
          knowledge_list = response.data.data;
          setCache('/api/knowledge', category, knowledge_list);
        }
        if (knowledge_list.length > 0) {
          const knowledge = getRandomItem(knowledge_list);
          displayKnowledge(knowledge);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: getErrorMessage(error),
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNextSameCategory = async () => {
    setLoading(true);
    setAnswered(false);

    try {
      if (selectedType === 'quiz') {
        let quizzes = getFromCache('/api/quizzes', currentCategory);
        if (!quizzes) {
          const response = await apiClient.post(`/api/proxy`, {
            endpoint: '/quizzes',
            params: { category: currentCategory }
          });
          quizzes = response.data.data;
          setCache('/api/quizzes', currentCategory, quizzes);
        }
        if (quizzes.length > 0) {
          const quiz = getRandomItem(quizzes);
          displayQuiz(quiz);
        }
      } else if (selectedType === 'knowledge') {
        let knowledge_list = getFromCache('/api/knowledge', currentCategory);
        if (!knowledge_list) {
          const response = await apiClient.post(`/api/proxy`, {
            endpoint: '/knowledge',
            params: { category: currentCategory }
          });
          knowledge_list = response.data.data;
          setCache('/api/knowledge', currentCategory, knowledge_list);
        }
        if (knowledge_list.length > 0) {
          const knowledge = getRandomItem(knowledge_list);
          displayKnowledge(knowledge);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCategory = () => {
    setCurrentQuiz(null);
    setCurrentKnowledge(null);
    setShowNavigation(false);
    setMode('category_select');
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: selectedType === 'quiz' ? 'クイズのジャンルを選んでください！' : '防災知識のジャンルを選んでください！',
      sender: 'bot'
    }]);
  };

  const handleQuizSelect = () => {
    setSelectedType('quiz');
    setMode('category_select');
    setShowNavigation(false);
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: 'クイズのジャンルを選んでください！',
      sender: 'bot'
    }]);
  };

  const handleKnowledgeSelect = () => {
    setSelectedType('knowledge');
    setMode('category_select');
    setShowNavigation(false);
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: '防災知識のジャンルを選んでください！',
      sender: 'bot'
    }]);
  };

  // キーワードからカテゴリを検出して知識を表示
  const handleKnowledgeByKeyword = async (keyword) => {
    const categoryMap = {
      '地震': '地震',
      '洪水': '洪水',
      '水害': '洪水',
      '台風': '台風',
      '火災': '火災',
      '火山': '火山',
      '備蓄': '備蓄',
      'ペット': 'ペット災害'
    };

    let detectedCategory = null;
    for (const [key, category] of Object.entries(categoryMap)) {
      if (keyword.includes(key)) {
        detectedCategory = category;
        break;
      }
    }

    if (detectedCategory) {
      setCurrentCategory(detectedCategory);
      setSelectedType('knowledge');
      setMode('knowledge');
      setShowNavigation(false);
      setLoading(true);

      try {
        let knowledge_list = getFromCache('/api/knowledge', detectedCategory);
        if (!knowledge_list) {
          const response = await apiClient.post(`/api/proxy`, {
            endpoint: '/knowledge',
            params: { category: detectedCategory }
          });
          knowledge_list = response.data.data;
          setCache('/api/knowledge', detectedCategory, knowledge_list);
        }

        if (knowledge_list && knowledge_list.length > 0) {
          setCurrentKnowledge(knowledge_list);
          setMessages(prev => [...prev, {
            id: uuidv4(),
            text: `「${detectedCategory}」についての知識を表示します！`,
            sender: 'bot'
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            text: `申し訳ありません。「${detectedCategory}」の知識が見つかりませんでした。`,
            sender: 'bot'
          }]);
        }
      } catch (error) {
        console.error('Error fetching knowledge:', error);
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: '知識の取得に失敗しました。もう一度お試しください。',
          sender: 'bot'
        }]);
      }
    } else {
      handleKnowledgeSelect();
    }
    setLoading(false);
  };

  const handleShelterSelect = async () => {
    setCurrentQuiz(null);
    setCurrentKnowledge(null);
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: '現在地を取得中...',
      sender: 'bot'
    }]);

    try {
      setLoading(true);

      // Geolocation API で現在地を取得
      if (!navigator.geolocation) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: 'お使いのブラウザは位置情報に対応していません。',
          sender: 'bot'
        }]);
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // バックエンドに位置情報を送信
            const response = await apiClient.post(`/api/proxy`, {
              endpoint: '/shelters',
              params: {
                latitude,
                longitude,
                max_distance: 5,
                limit: 10
              }
            });

            // 緊急避難所のみをフィルタリング
            const emergencyShelters = response.data.data.filter(shelter => shelter.shelter_type === '緊急');

            if (emergencyShelters.length > 0) {
              // 避難所リストをまとめて表示
              let shelterList = '📍 現在地から ' + emergencyShelters.length + ' 件の緊急避難所が見つかりました!\n\n';

              emergencyShelters.forEach((shelter, idx) => {
                let eq, ts, fl, ht, ls, pet;
                eq = shelter['地震'] ? '○' : '❌';
                ts = shelter['津波'] ? '○' : '❌';
                fl = shelter['洪水'] ? '○' : '❌';
                ht = shelter['高潮'] ? '○' : '❌';
                ls = shelter['崖崩れ、土石流及び地滑り'] ? '○' : '❌';
                pet = shelter['ペット対応'] ? '○' : '✕';
                const mapsUrl = 'https://www.google.com/maps/dir/' + latitude + ',' + longitude + '/' + shelter['緯度'] + ',' + shelter['経度'];

                shelterList += '【' + (idx + 1) + '】【距離:' + shelter.distance + 'km】\n';
                shelterList += shelter['施設・場所名'] + '「緊急」ℹ️\n';
                shelterList += shelter['住所'] + '\n';
                shelterList += '対応:地震' + eq + ' 津波' + ts + ' 洪水' + fl + ' 高潮' + ht + ' 土砂' + ls + ' ペット' + pet + '\n';
                shelterList += '地図：\n' + mapsUrl + '\n\n';
              });

              // 注意書きと出典情報を追加
              shelterList += '\n【注意】\n';
              shelterList += '・ペット対応情報は随時更新中です。対応の有無は各施設に直接ご確認ください。\n';
              shelterList += '・避難所までの道では、通れない箇所や危険な箇所が生じていることがあります。避難行動の際は十分ご注意ください。\n';
              shelterList += '・避難所情報は変更される可能性があります。最新情報は各施設にお問い合わせください。\n';
              shelterList += '【出典】国土地理院（hinanmap.gsi.go.jp）\n';

              const shelterMessage = {
                id: uuidv4(),
                text: shelterList,
                sender: 'bot',
                isUrl: true,
                isShelterInfo: true
              };

              // SessionStorage に避難所情報を保存
              sessionStorage.setItem('shelterState', JSON.stringify({
                message: shelterMessage,
                currentPosition: { latitude, longitude }
              }));

              setMessages(prev => [...prev, shelterMessage]);
            } else {
              // 指定避難所をフィルタリング
              const designatedShelters = response.data.data.filter(shelter => shelter.shelter_type === '指定');

              if (designatedShelters.length > 0) {
                // 指定避難所リストをまとめて表示
                let shelterList = '📍 現在地から ' + designatedShelters.length + ' 件の指定避難所が見つかりました!\n\n';

                designatedShelters.forEach((shelter, idx) => {
                  const mapsUrl = 'https://www.google.com/maps/dir/' + latitude + ',' + longitude + '/' + shelter['緯度'] + ',' + shelter['経度'];

                  shelterList += '【' + (idx + 1) + '】【距離:' + shelter.distance + 'km】\n';
                  shelterList += shelter['施設・場所名'] + '（指定）ℹ️\n';
                  shelterList += shelter['住所'] + '\n';
                  shelterList += '地図：\n' + mapsUrl + '\n\n';
                });

                shelterList += '\n【注意事項】\n';
                shelterList += '・避難所までの道では、通れない箇所や危険な箇所が生じていることがあります。避難行動の際は十分ご注意ください。\n';
                shelterList += '・避難所情報は変更される可能性があります。最新情報は各自治体にお問い合わせください。\n';
                shelterList += '【出典】国土地理院 (hinanmap.gsi.go.jp)\n';

                const shelterMessage = {
                  id: uuidv4(),
                  text: shelterList,
                  sender: 'bot',
                  isUrl: true,
                  isShelterInfo: true
                };

                sessionStorage.setItem('shelterState', JSON.stringify({
                  message: shelterMessage,
                  currentPosition: { latitude, longitude }
                }));

                setMessages(prev => [...prev, shelterMessage]);
              } else {
                setMessages(prev => [...prev, {
                  id: uuidv4(),
                  text: '近くに避難所が見つかりませんでした。',
                  sender: 'bot'
                }]);
              }
            }
          } catch (error) {
            console.error('API Error:', error);
            setMessages(prev => [...prev, {
              id: uuidv4(),
              text: '避難所の検索に失敗しました。',
              sender: 'bot'
            }]);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          // 位置情報取得エラー
          console.error('Geolocation Error:', error);
          let errorMessage = '位置情報を取得できませんでした。';

          if (error.code === 1) {
            errorMessage = 'ブラウザの位置情報許可が拒否されています。設定を確認してください。';
          } else if (error.code === 2) {
            errorMessage = '位置情報の取得に失敗しました。しばらく待ってからお試しください。';
          } else if (error.code === 3) {
            errorMessage = '位置情報の取得がタイムアウトしました。';
          }

          setMessages(prev => [...prev, {
            id: uuidv4(),
            text: errorMessage,
            sender: 'bot'
          }]);

          setLoading(false);
        }
      );
    } catch (error) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: getErrorMessage(error),
        sender: 'bot'
      }]);
      setLoading(false);
    }
  };

  const handlePoliceTipsSelect = async () => {
    setCurrentQuiz(null);
    setCurrentKnowledge(null);
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: '防災ラボ呼び出し中...',
      sender: 'bot'
    }]);

    try {
      setLoading(true);
      let tips = getFromCache('/api/police-tips', 'all');
      if (!tips) {
        const response = await apiClient.post(`/api/proxy`, {
          endpoint: '/police-tips',
          params: {}
        });
        tips = response.data.data;
        setCache('/api/police-tips', 'all', tips);
      }

      if (tips && tips.length > 0) {
        let bousaiLabList = '防災ラボ\n\n';

        tips.forEach((tip, idx) => {
          bousaiLabList += '【' + tip.category + '】\n';
          bousaiLabList += tip.title + '\n';
          bousaiLabList += tip.content + '\n';
          bousaiLabList += 'リンク：' + tip.url + '\n\n';
        });

        const bousaiLabMessage = {
          id: Date.now(),
          text: bousaiLabList,
          sender: 'bot',
          isUrl: true
        };

        // SessionStorage に防災ラボ情報を保存
        sessionStorage.setItem('bousaiLabState', JSON.stringify({
          message: bousaiLabMessage
        }));

        setMessages(prev => [...prev, bousaiLabMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: '防災ラボの取得に失敗しました。',
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerOption = async (optionIndex) => {
    const selectedAnswer = currentQuiz.options[optionIndex];

    try {
      // 本来のエンドポイントに送信（quiz_idを文字列に変換）
      const response = await apiClient.post(`/api/proxy`, {
        endpoint: '/quiz-answer',
        params: {
          session_id: sessionId,
          quiz_id: String(currentQuiz.id),
          user_answer: selectedAnswer,
          category: currentQuiz.category
        }
      });

      const { is_correct, message } = response.data;

      // スコアを更新
      setUserScore(prev => ({
        total: prev.total + 1,
        correct: prev.correct + (is_correct ? 1 : 0)
      }));

      // 結果メッセージを表示
      const resultText = is_correct
        ? `◯ ${message}`
        : `✖ ${message}`;

      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: resultText,
        sender: 'bot',
        processAllContent: true
      }]);

      // 解説を表示
      if (currentQuiz.explanation) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            text: '解説：\n' + currentQuiz.explanation,
            sender: 'bot',
            processAllContent: true
          }]);
        }, 500);
      }

      setAnswered(true);
      setShowNavigation(true);
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: 'エラーが発生しました。もう一度お試しください。',
        sender: 'bot'
      }]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const sanitizedInput = DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
    const userInput = sanitizedInput.toLowerCase();
    setMessages([...messages, { id: uuidv4(), text: sanitizedInput, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      if (userInput.includes('クイズ')) {
        handleQuizSelect();
      } else if (userInput.includes('地震') || userInput.includes('洪水') || userInput.includes('水害') ||
                 userInput.includes('台風') || userInput.includes('火災') || userInput.includes('火山') ||
                 userInput.includes('備蓄') || userInput.includes('ペット')) {
        await handleKnowledgeByKeyword(userInput);
      } else if (userInput.includes('知識') || userInput.includes('防災知識')) {
        handleKnowledgeSelect();
      } else if (userInput.includes('避難')) {
        await handleShelterSelect();
      } else if (userInput.includes('便利技') || userInput.includes('便利')) {
        await handlePoliceTipsSelect();
      } else {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: 'クイズ、防災知識、避難所検索、便利技のいずれかを選んでください！',
          sender: 'bot'
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="splash-icon">
            <img src={`${process.env.PUBLIC_URL}/icon-512.png`} alt="防災コンシェルジュ" />
          </div>
          <div className="splash-message">
            <p>防災は『正解』が<br />ひとつではありません。</p>
            <p>学んだ知識を基に、あなたの環境・状況に合わせた対策を考えてみてください。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h1>防災コンシェルジュ</h1>
        {userScore.total > 0 && (
          <div className="score-display">
            <div className="score-info">
              スコア: <strong>{userScore.correct}/{userScore.total}</strong>
              {userScore.total > 0 && (
                <span className="accuracy">
                  ({Math.round((userScore.correct / userScore.total) * 100)}%)
                </span>
              )}
            </div>
            <button onClick={handleResetScore} className="reset-button">
              リセット
            </button>
          </div>
        )}
        <p>こんなことが聞けます：</p>
        <div className="quick-buttons">
          <button onClick={handleQuizSelect}>
            防災クイズ
          </button>
          <button onClick={handleKnowledgeSelect}>
            防災知識
          </button>
          <button onClick={handleShelterSelect}>
            📍 避難所を探す
          </button>
          <button onClick={handlePoliceTipsSelect}>
            防災ラボ
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={msg.id}>
            <div className={`message ${msg.sender}`}>
              <div className="message-content">
                {msg.isShelterInfo ? (
                  <>
                    {convertUrlsToLinks(msg.text).map((element, idx) => {
                      if (typeof element === 'string') {
                        const parts = element.split(/(i|ℹ️)/);
                        return (
                          <span key={idx}>
                            {parts.map((part, pidx) =>
                              part === 'i' || part === 'ℹ️' ? (
                                <button
                                  key={`info-${pidx}`}
                                  onClick={() => setShowShelterModal(true)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    padding: '0',
                                    fontSize: 'inherit',
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  {part}
                                </button>
                              ) : part
                            )}
                          </span>
                        );
                      }
                      return element;
                    })}
                  </>
                ) : (
                  msg.isUrl ? convertUrlsToLinks(msg.text) : (msg.processAllContent ? processContentRuby(msg.text) : convertFuriganaToRuby(msg.text))
                )}
              </div>
            </div>
            
            {mode === 'category_select' && idx === messages.length - 1 && (
              <div className="category-buttons">
                {(selectedType === 'quiz' ? quizCategories : knowledgeCategories).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="category-button"
                  >
                    {categoryEmojis[cat]} {cat}
                  </button>
                ))}
              </div>
            )}

            {msg.quiz && (
              <div className="quiz-options">
                {msg.quiz.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswerOption(optIdx)}
                    disabled={answered}
                    className="option-button"
                  >
                    {String.fromCharCode(65 + optIdx)}) {convertFuriganaToRuby(option)}
                  </button>
                ))}
              </div>
            )}

            {showNavigation && currentQuiz && idx === messages.length - 1 && (
              <div className="navigation-buttons">
                <button onClick={handleNextSameCategory} className="nav-button next">
                  ➡️ 次へ
                </button>
                <button onClick={handleChangeCategory} className="nav-button change">
                  他のジャンルを選ぶ
                </button>
              </div>
            )}

            {currentKnowledge && showNavigation && idx === messages.length - 1 && msg.sender === 'bot' && (
              <div className="navigation-buttons">
               <button onClick={handleNextSameCategory} className="nav-button next">
                  ➡️ 次へ
                </button>
                <button onClick={handleChangeCategory} className="nav-button change">
                   他のジャンルを選ぶ
                </button>
               </div>
            )}
          </div>
        ))}
        {loading && <div className="message bot"><div className="message-content">入力中...</div></div>}
        <div ref={messagesEndRef} />
      </div>

      {showShelterModal && (
        <div className="shelter-modal-overlay" onClick={() => setShowShelterModal(false)}>
          <div className="shelter-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowShelterModal(false)}>✕</button>
            <h3>避難所について</h3>
            <div className="modal-content">
              <p><strong>🔹指定「緊急」避難所</strong></p>
              <p>命を守るための一時的避難場所</p>
              <p style={{ marginTop: '16px' }}><strong>🔹（指定）避難所</strong></p>
              <p>災害後に生活するための施設</p>
            </div>
          </div>
        </div>
      )}

      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="何か聞いてみよう..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>送信</button>
      </form>

      <footer className="credits">
        <div className="affiliate-banner" style={{ textAlign: 'center', margin: '10px 0', maxWidth: '100%' }}>
          <div style={{ maxWidth: '100%', height: 'auto' }} dangerouslySetInnerHTML={{ __html: BANNER_ARRAY[randomBannerIndex] }} />
        </div>
        <p>
          <strong>クイズ・防災知識の参考引用元：</strong><br />
          内閣府（防災担当）、総務省消防庁、東京消防庁、気象庁、環境省、農林水産省、厚生労働省、東京都、警視庁、空飛ぶ捜索医療団"ARROWS"、Yahoo!天気・災害、ALSOK
        </p>
      </footer>
      <Analytics />
    </div>
  );
};

export default ChatBot;