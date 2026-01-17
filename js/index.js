// ======== config ========
const basePath = './../data/';
const files = {
    behaviors: basePath + 'egypt2015_behaviors.csv',
    identities: basePath + 'egypt2015_identities.csv',
    mods: basePath + 'egypt2015_mods.csv',
    settings: basePath + 'egypt2015_settings.csv'
};

// state
let currentCulture = 'egypt2015';
let data = { behaviors: [], identities: [], mods: [], settings:[], words: [] };
let selectedMap = new Map(); // culture::term -> {term, type, culture, E, P, A}
let unifiedListItems = new Map(); // cache of list item elements
let selectedPanelItems = new Map(); // cache of selected panel item elements
let firstItem = 'E';
let secondItem = 'P';

// containers
const unifiedListContainer = document.getElementById('unifiedList');
const selectedListContainer = document.getElementById('selectedList');

const loader = document.getElementById('loader');

function showLoader(on) { loader.style.display = on ? 'inline-block' : 'none'; }

// deterministic color helper for selected item borders (optional)
function colorForTerm(term) {
    let h = 0; for (let i=0;i<term.length;i++) h = ((h<<5)-h) + term.charCodeAt(i);
    h = Math.abs(h) % 360;

    return `hsl(${h} 70% 40%)`;
}

// key helper
function keyForTerm(term, culture) {
    const lowerTerm = term.toLowerCase();
    return `${culture}::${lowerTerm}`;
}

// ======== Create List Item Elements ========
function createUnifiedListItem(r, filterString)
{
    const term = r.term || '';
    if (!term) return;
    if (filterString && !term.toLowerCase().includes(filterString)) return;

    const typeLabel = r.type;

    const li = document.createElement('div');
    li.className = 'list-item';
    if (selectedMap.has(keyForTerm(term, currentCulture))) li.classList.add('selected');

    const left = document.createElement('div');
    left.style.flex = '1';
    left.style.overflow = 'hidden';
    left.innerText = term;

    const right = document.createElement('div');
    right.className = 'type-badge text-end';
    right.innerText = typeLabel;

    li.appendChild(left);
    li.appendChild(right);

    li.addEventListener('click', ()=>{
        if (li.classList.contains('selected')) {
            removeFromSelected(term, currentCulture);
        }
        else {
            addToSelected(term, typeLabel, r);
        }
    });
    return li;
}

function createSelectedPanelItem(obj) {
    const row = document.createElement('div');
    row.className = 'sel-row';
    row.style.background = '#f7f7f9';
    row.style.border = '1px solid rgba(0,0,0,0.04)';
    row.style.borderLeft = `4px solid ${colorForTerm(obj.term)}`;
    // left term
    const tdiv = document.createElement('div'); tdiv.className = 'term'; tdiv.innerText = obj.term;
    // right badge + remove
    const right = document.createElement('div'); right.style.display='flex'; right.style.alignItems='center'; right.style.gap='8px';
    const badge = document.createElement('span'); badge.className='badge bg-secondary'; badge.innerText = obj.type;
    const badge_culture = document.createElement('span'); badge_culture.className='badge bg-secondary'; badge_culture.innerText = obj.culture;
    const rem = document.createElement('button'); rem.className='remove-btn'; rem.innerHTML='✕';
    rem.title = '제거';
    rem.addEventListener('click', ()=> {
        removeFromSelected(obj.term, obj.culture);
    });
    right.appendChild(badge); right.appendChild(badge_culture); right.appendChild(rem);
    row.appendChild(tdiv); row.appendChild(right);
    return row;
}


// ======== CSV load ========
async function loadAll() {
    showLoader(true);
    try {
        const results = await Promise.allSettled([
            d3.csv(files.behaviors),
            d3.csv(files.identities),
            d3.csv(files.mods),
            d3.csv(files.settings)
        ]);

        const [bRes, iRes, mRes, sRes] = results;

        // 정상적으로 로드된 파일만 사용
        data.behaviors = bRes.status === 'fulfilled' ? bRes.value.map(r => normalizeRow(r, 'behavior')) : [];
        data.identities = iRes.status === 'fulfilled' ? iRes.value.map(r => normalizeRow(r, 'identity')) : [];
        data.mods       = mRes.status === 'fulfilled' ? mRes.value.map(r => normalizeRow(r, 'mod')) : [];
        data.settings  = sRes.status === 'fulfilled' ? sRes.value.map(r => normalizeRow(r, 'setting')) : [];

        // 합치기
        data.words = [...data.behaviors, ...data.identities, ...data.mods, ...data.settings];
        data.words.sort((a,b)=> (a.term||'').localeCompare(b.term||''));

        const searchBox = document.getElementById('globalSearch');
        renderLists(searchBox.value); // initial render
    } catch(err) {
        console.error('예상치 못한 에러:', err);
        alert('CSV 로드 중 문제가 발생했습니다. 콘솔을 확인하세요.');
    } finally {
        showLoader(false);
    }
}


function normalizeRow(r, type) {
    const obj = r;
    console.log(r);
    obj['type'] = type;
    // ensure term exists
    return obj;
}

// ======== rendering lists ========
function renderLists(filter='') {
    const q = (filter || '').toString().trim().toLowerCase();
    renderUnifiedList(data.words, q);
}


function renderUnifiedList(rows, q) {
    unifiedListContainer.innerHTML = '';
    for (const r of rows) {
        const li = createUnifiedListItem(r, q);
        if (li)
        {
            unifiedListContainer.appendChild(li);
            unifiedListItems.set(keyForTerm(r.term, currentCulture), li);
        }
    }
}


// ======== selection logic ========
function addToSelected(term, typeLabel, row)
{
    const key = keyForTerm(term, currentCulture);
    if (!selectedMap.has(key) && row) {
        // store E,P,A if present (parseFloat), else null
        const E1 = (row.e || row.E) ? parseFloat(row.e || row.E) : NaN;
        const P1 = (row.p || row.P) ? parseFloat(row.p || row.P) : NaN;
        const A1 = (row.a || row.A) ? parseFloat(row.a || row.A) : NaN;

        const E2 = (row.e2 || row.E2) ? parseFloat(row.e2 || row.E2) : NaN;
        const P2 = (row.p2 || row.P2) ? parseFloat(row.p2 || row.P2) : NaN;
        const A2 = (row.a2 || row.A2) ? parseFloat(row.a2 || row.A2) : NaN;

        const E = isFinite(E1) && isFinite(E2) ? (E1 + E2) / 2 : NaN;
        const P = isFinite(P1) && isFinite(P2) ? (P1 + P2) / 2 : NaN;
        const A = isFinite(A1) && isFinite(A2) ? (A1 + A2) / 2 : NaN;

        selectedMap.set(key, { term, type: typeLabel, culture: currentCulture, E, P, A });

        const li = unifiedListItems.get(key);
        if(li) li.classList.add('selected');

        addToSelectedPanel({ term, type: typeLabel, culture: currentCulture, E, P, A });
        updateEPPlot();
    }
}

function removeFromSelected(term, culture)
{
    const key = keyForTerm(term, culture);
    if (selectedMap.has(key)) {
        selectedMap.delete(key);

        if(unifiedListItems.has(key)) {
            const li = unifiedListItems.get(key);
            li.classList.remove('selected');
        }

        if (selectedPanelItems.has(key)) {
            const li = selectedPanelItems.get(key); 
            selectedListContainer.removeChild(li);
            selectedPanelItems.delete(key);
        }
        updateEPPlot();
    }
}


function addToSelectedPanel(obj) {
    const selList = document.getElementById('selectedList');
    const row = createSelectedPanelItem(obj);

    if (selectedMap.size === 1) selList.innerHTML = '';
    selList.appendChild(row);

    selectedPanelItems.set(keyForTerm(obj.term, obj.culture), row);
}

function renderSelectedPanel() {
    selectedListContainer.innerHTML = '';
    if (selectedMap.size === 0) {
        selectedListContainer.innerHTML = '<div class="small-note">선택된 단어가 없습니다.</div>';
        return;
    }
    for (const [k,obj] of selectedMap) {
        const row = createSelectedPanelItem(obj);
        selectedListContainer.appendChild(row);
    }
}

function updateEPPlot() {
    const container = document.getElementById('epPlot');
    if (!container) return;


    // --- 1. 문화권별 그룹화 ---
    const grouped = new Map(); // culture -> {E:[], P:[], A:[], terms:[], colors:[]}

    for (const [_, obj] of selectedMap) {
        if (!isFinite(obj.E) || !isFinite(obj.P) || !isFinite(obj.A)) continue;
        if (!grouped.has(obj.culture)) {
            grouped.set(obj.culture, { E: [], P: [], A: [], terms: [], colors: [] });
        }
        const g = grouped.get(obj.culture);
        g.E.push(obj.E);
        g.P.push(obj.P);
        g.A.push(obj.A);
        g.terms.push(obj.term);
        g.colors.push(colorForTerm(obj.term));
    }

    // --- 2. 문화권별로 다른 모양 설정 ---
    const markerShapes = ['circle', 'square', 'triangle-up', 'diamond', 'cross', 'x', 'star'];
    const cultures = Array.from(grouped.keys());
    const traces = [];

    cultures.forEach((culture, idx) => {
        const g = grouped.get(culture);
        const markerSymbol = markerShapes[idx % markerShapes.length];
        const trace = {
            x: g[firstItem],
            y: g[secondItem],
            mode: 'markers+text',
            text: g.terms,
            textposition: 'top center',
            name: culture, // 범례용
            type: 'scatter',
            marker: {
                size: 10,
                color: g.colors,
                symbol: markerSymbol,
                line: { width: 1, color: '#333' }
            },
            customdata: g.E.map((_, i) => [
                g.E[i],
                g.P[i],
                g.A[i],
                culture
            ]),
            hovertemplate:
                '<b>%{text}</b> <br>from %{customdata[3]}<br>' +
                'E: %{customdata[0]:.2f} / ' +
                'P: %{customdata[1]:.2f} / ' +
                'A: %{customdata[2]:.2f}<extra></extra>'
        };
        traces.push(trace);
    });

    // --- 3. 레이아웃 설정 ---
    const layout = {
        title: `${firstItem}-${secondItem} Plot`,
        xaxis: { title: firstItem, range: [-4.5, 4.5] },
        yaxis: { title: secondItem, range: [-4.5, 4.5] },
        margin: { t: 40, r: 20, b: 40, l: 40 },
        legend: {
            title: { text: 'Culture' },
            orientation: 'h',
            y: -0.2
        }
    };

    Plotly.newPlot(container, traces, layout, { responsive: true });
}



function plotButtonPressed(activeId) {
    ['epBtn', 'eaBtn', 'paBtn'].forEach(id => {
        document.getElementById(id).classList.toggle('active', id === activeId);
    });

    firstItem = activeId.charAt(0).toUpperCase();
    secondItem = activeId.charAt(1).toUpperCase();

    updateEPPlot(firstItem, secondItem);
}


// clear selection
document.addEventListener('click', function(e){
    // nothing here
});
document.getElementById('clearSelected').addEventListener('click', ()=>{
    for (const [key, obj] of selectedMap) {
        removeFromSelected(obj.term, obj.culture);
    }
});

// ======== culture select logic ========
const cultureSelect = document.getElementById('cultureSelect');

if (cultureSelect) {
    cultureSelect.addEventListener('change', async (e) => {
        const culture = e.target.value;
        showLoader(true);

        // 파일 경로 업데이트
        files.behaviors = `${basePath}${culture}_behaviors.csv`;
        files.identities = `${basePath}${culture}_identities.csv`;
        files.mods = `${basePath}${culture}_mods.csv`;
        files.settings = `${basePath}${culture}_settings.csv`;

        currentCulture = culture;

        // 데이터 초기화 및 재로드
        data = { behaviors: [], identities: [], mods: [], settings:[], words: [] };
        await loadAll();

        showLoader(false);
    });
}

// search wiring
const searchBox = document.getElementById('globalSearch');
searchBox.addEventListener('input', (e)=> renderLists(e.target.value));
document.getElementById('clearSearch').addEventListener('click', ()=> { searchBox.value=''; renderLists(''); searchBox.focus(); });

// initial load
loadAll().then(() => {
    updateEPPlot(); // Plot graph after data is loaded
});