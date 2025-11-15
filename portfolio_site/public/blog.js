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
    slug: 'test-one',
    date: '2025-11-14',
    category: 'On Music',
    title: { en: 'Test Post', zh: '测试文章' },
    excerpt: { en: 'A sample blog post', zh: '示例博客文章' },
    file: { en: '/blog/test.md', zh: '/blog/test.md' }
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
    div.onclick = () => { window.location.hash = p.slug; loadPost(p); };
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
    innerEl.innerHTML = marked.parse(md);
    if (typeof window !== 'undefined' && window.hljs) hljs.highlightAll();
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
    const slug = window.location.hash.slice(1);
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
    const slug = window.location.hash.slice(1);
    const p = posts.find(x => x.slug === slug);
    if (!p) renderList();
  }
});
themeSelect.addEventListener('change', () => {
  currentCat = themeSelect.value;
  if (contentEl.style.display === 'none') renderList(); else {
    const slug = window.location.hash.slice(1);
    const p = posts.find(x => x.slug === slug);
    if (!p) renderList();
  }
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  if (contentEl.style.display === 'none') renderList();
});

window.addEventListener('hashchange', () => {
  const slug = window.location.hash.slice(1);
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
