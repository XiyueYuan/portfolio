import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
  highlight: (code, lang) => {
    try {
      if (lang && typeof window !== 'undefined' && window.hljs && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      if (typeof window !== 'undefined' && window.hljs) {
        return hljs.highlightAuto(code).value;
      }
      return code;
    } catch (e) {
      return code;
    }
  }
});

const posts = [
  {
    slug: 'hello-world',
    date: '2025-11-13',
    category: 'Miscellany',
    title: { en: 'Hello World', zh: '你好世界' },
    excerpt: { en: 'My first blog', zh: '第一篇博客' },
    file: { en: '/blog/hello-world.en.md', zh: '/blog/hello-world.zh.md' }
  },
  {
    slug: 'N-Gram Markov',
    date: '2025-11-14',
    category: 'On Coding',
    title: { en: 'N-Gram Markov', zh: 'N-Gram Markov' },
    excerpt: { en: 'Dip into the basic idea of Markov chain', zh: '探索 Markov chain 基本原理' },
    file: { en: '/blog/2-gram_markov.en.md', zh: '/blog/2-gram_markov.zh.md' }
  }
];

let lang = 'en';
let sortMode = 'newest';
let currentCat = 'All';
let searchQuery = '';

const listEl = document.getElementById('post-list');
const contentEl = document.getElementById('post-content');
const innerEl = document.getElementById('content-inner');
const backBtn = document.getElementById('back-btn');
const titleEl = document.getElementById('blog-title');
const toolbarEl = document.getElementById('toolbar');
const sortSelect = document.getElementById('sort-select');
const themeSelect = document.getElementById('theme-select');
const searchInput = document.getElementById('search-input');

function sortedFiltered() {
  let arr = posts.slice();
  if (currentCat !== 'All') arr = arr.filter(p => p.category === currentCat);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    arr = arr.filter(p => {
      const t = (p.title[lang] || '').toLowerCase();
      const e = (p.excerpt[lang] || '').toLowerCase();
      const s = (p.slug || '').toLowerCase();
      return t.includes(q) || e.includes(q) || s.includes(q);
    });
  }
  if (sortMode === 'newest') arr.sort((a,b) => new Date(b.date) - new Date(a.date));
  else if (sortMode === 'oldest') arr.sort((a,b) => new Date(a.date) - new Date(b.date));
  else arr.sort((a,b) => a.category === b.category ? new Date(b.date) - new Date(a.date) : a.category.localeCompare(b.category));
  return arr;
}

function renderList() {
  listEl.innerHTML = '';
  sortedFiltered().forEach(p => {
    const div = document.createElement('div');
    div.className = 'post-item';
    div.innerHTML = `
      <div class="post-meta"><span class="post-cat">${p.category}</span><span class="post-date">${p.date}</span></div>
      <h3 class="post-title">${p.title[lang]}</h3>
      <p class="post-excerpt">${p.excerpt[lang]}</p>
      <a class="read-more" href="#">Read more</a>
    `;
    div.onclick = () => { window.location.hash = encodeURIComponent(p.slug); loadPost(p); };
    listEl.appendChild(div);
  });
}

async function loadPost(p) {
  listEl.style.display = 'none';
  contentEl.style.display = 'block';
  if (toolbarEl) toolbarEl.style.display = 'none';
  titleEl.textContent = p.title[lang];
  innerEl.innerHTML = '<p>Loading…</p>';
  try {
    const md = await getMarkdownWithFallback(p.file[lang]);
    const rawHtml = marked.parse(md);
    const safeHtml = (typeof window !== 'undefined' && window.DOMPurify) ? DOMPurify.sanitize(rawHtml) : rawHtml;
    innerEl.innerHTML = safeHtml;
    if (typeof window !== 'undefined' && window.hljs) {
      hljs.highlightAll();
    }
    enhanceCodeBlocks();
    if (typeof window !== 'undefined' && window.renderMathInElement) {
      renderMathInElement(innerEl, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    }
    buildAnchorsAndToc();
    document.getElementById('btn-en-in').classList.toggle('active', lang === 'en');
    document.getElementById('btn-zh-in').classList.toggle('active', lang === 'zh');
  } catch (e) {
    innerEl.innerHTML = '<p>Post not found.</p>';
  }
}

function switchLang(l) {
  lang = l;
  if (contentEl.style.display === 'none') renderList();
  else {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    const p = posts.find(x => x.slug === slug);
    if (p) loadPost(p);
  }

}

document.getElementById('btn-en-in').onclick = () => switchLang('en');
document.getElementById('btn-zh-in').onclick = () => switchLang('zh');
document.getElementById('btn-en-in').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchLang('en'); }
});
document.getElementById('btn-zh-in').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchLang('zh'); }
});

backBtn.onclick = (ev) => {
  ev.preventDefault();
  contentEl.style.display = 'none';
  listEl.style.display = 'grid';
  if (toolbarEl) toolbarEl.style.display = 'flex';
  titleEl.textContent = 'Blog';
  window.location.hash = '';
};

sortSelect.addEventListener('change', () => {
  sortMode = sortSelect.value;
  if (contentEl.style.display === 'none') renderList(); else {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    const p = posts.find(x => x.slug === slug);
    if (!p) renderList();
  }
});
themeSelect.addEventListener('change', () => {
  currentCat = themeSelect.value;
  if (contentEl.style.display === 'none') renderList(); else {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    const p = posts.find(x => x.slug === slug);
    if (!p) renderList();
  }
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  if (contentEl.style.display === 'none') renderList();
});

window.addEventListener('hashchange', () => {
  const slug = decodeURIComponent(window.location.hash.slice(1));
  if (slug) {
    const p = posts.find(x => x.slug === slug);
    if (p) loadPost(p);
  }
});

renderList();
async function getMarkdownWithFallback(url) {
  try {
    const primary = await fetch(url);
    if (primary.ok) return await primary.text();
  } catch (_) {}
  try {
    const u = new URL(url);
    const hosts = ['https://blog.evanyuan.dev', 'https://evan-blog-five.vercel.app'];
    for (const h of hosts) {
      const alt = h + u.pathname;
      try {
        const res = await fetch(alt);
        if (res.ok) return await res.text();
      } catch (_) {}
    }
  } catch (_) {}
  throw new Error('fallback_failed');
}

function buildAnchorsAndToc() {
  const tocEl = document.getElementById('toc');
  const listEl = tocEl ? tocEl.querySelector('ul') : null;
  if (!tocEl || !listEl) return;
  listEl.innerHTML = '';
  const hs = innerEl.querySelectorAll('h1, h2, h3, h4');
  hs.forEach(h => {
    const id = h.id || h.textContent.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
    if (!h.id) h.id = id;
    if (!h.querySelector('a.anchor')) {
      const a = document.createElement('a');
      a.className = 'anchor';
      a.href = `#${id}`;
      a.textContent = '#';
      a.style.marginLeft = '8px';
      a.style.opacity = '0.6';
      h.appendChild(a);
    }
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = h.textContent.replace('#','').trim();
    li.style.marginLeft = (h.tagName === 'H2') ? '8px' : (h.tagName === 'H3') ? '16px' : (h.tagName === 'H4') ? '24px' : '0px';
    li.appendChild(link);
    listEl.appendChild(li);
  });
}

function enhanceCodeBlocks() {
  const pres = innerEl.querySelectorAll('pre');
  pres.forEach(pre => {
    if (!pre.parentElement.classList.contains('code-wrap')) {
      const wrap = document.createElement('div');
      wrap.className = 'code-wrap';
      pre.parentElement.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.onclick = () => {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(() => { btn.textContent = 'Copied'; setTimeout(() => btn.textContent = 'Copy', 1200); });
      };
      wrap.appendChild(btn);
    }
  });
}
