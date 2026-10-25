const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    mainNav.classList.toggle('open', !isOpen);
  });

  mainNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    }
  });
}

const schoolPhoto = document.querySelector('.hero-photo');
if (schoolPhoto) {
  schoolPhoto.addEventListener('error', () => {
    schoolPhoto.classList.add('hero-photo-unavailable');
  });
}

async function loadPublicSchoolContent() {
  if (window.location.protocol === 'file:') return;

  try {
    const response = await fetch('/api/site-content', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`School information request failed (${response.status}).`);
    const data = await response.json();
    Object.entries(data.content).forEach(([key, value]) => {
      const element = document.querySelector(`[data-site-content="${key}"]`);
      if (element) element.textContent = value;
    });

    const enrollmentYear = document.querySelector('[data-site-content="enrollment_year"]');
    if (enrollmentYear && data.content.enrollment_year) {
      enrollmentYear.textContent = ` · ${data.content.enrollment_year}`;
    }

    const gallery = document.querySelector('.gallery-grid');
    if (gallery && data.photos.length) {
      const cards = data.photos.map(({ caption, url }) => {
        const card = document.createElement('figure');
        card.className = 'gallery-card';
        const image = document.createElement('img');
        image.src = url;
        image.alt = caption;
        image.loading = 'lazy';
        image.decoding = 'async';
        const label = document.createElement('figcaption');
        label.textContent = caption;
        card.append(image, label);
        return card;
      });
      gallery.replaceChildren(...cards);
    }

    const resultsBody = document.querySelector('#kcse-results-body');
    if (resultsBody && data.kcse_results.length) {
      const resultsByYear = new Map(
        [...resultsBody.querySelectorAll('tr[data-kcse-year]')].map((row) => [
          Number(row.dataset.kcseYear),
          {
            year: Number(row.dataset.kcseYear),
            mean_score: Number(row.dataset.kcseMean),
            candidates: null,
            source: 'Secondary source'
          }
        ])
      );
      data.kcse_results.forEach((result) => resultsByYear.set(result.year, result));
      const rows = [...resultsByYear.values()]
        .sort((left, right) => left.year - right.year)
        .map((result) => {
          const row = document.createElement('tr');
          const year = document.createElement('th');
          year.scope = 'row';
          year.textContent = result.year;
          const mean = document.createElement('td');
          mean.textContent = Number(result.mean_score).toFixed(3);
          const candidates = document.createElement('td');
          candidates.textContent = result.candidates ? Number(result.candidates).toLocaleString() : '—';
          const trend = document.createElement('td');
          const bar = document.createElement('span');
          bar.className = 'score-bar';
          const fill = document.createElement('span');
          fill.style.setProperty('--score', `${Math.min(100, Math.max(0, Number(result.mean_score) / 12 * 100))}%`);
          bar.append(fill);
          trend.append(bar);
          const source = document.createElement('td');
          source.textContent = result.source === 'Secondary source'
            ? result.source
            : `School-published · ${result.source}`;
          row.append(year, mean, candidates, trend, source);
          return row;
        });
      resultsBody.replaceChildren(...rows);
    }
  } catch (error) {
    console.error('Could not load the latest school website information.', error);
  }
}

loadPublicSchoolContent();

const pathwayContent = {
  stem: {
    number: '01 / ASK WHAT\'S POSSIBLE',
    title: 'Curiosity can change everything.',
    description: 'Ask questions, explore new ideas, and build the knowledge to understand your community and the wider world.'
  },
  arts: {
    number: '02 / FIND YOUR VOICE',
    title: 'Her ideas deserve to be heard.',
    description: 'Creative thinking helps girls express themselves, share their perspectives, and imagine new possibilities.'
  },
  humanities: {
    number: '03 / SHAPE WHAT COMES NEXT',
    title: 'Learn today. Lead tomorrow.',
    description: 'Knowledge and confidence can help girls take part in their communities and shape the futures they want.'
  }
};

const pathwayTabs = document.querySelectorAll('.pathway-tab');
const pathwayPanel = document.querySelector('.pathway-panel');

pathwayTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    pathwayTabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
    const content = pathwayContent[tab.dataset.pathway];
    pathwayPanel.setAttribute('aria-labelledby', tab.id);
    pathwayPanel.querySelector('.panel-number').textContent = content.number;
    pathwayPanel.querySelector('h3').textContent = content.title;
    pathwayPanel.querySelector('p').textContent = content.description;
  });
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = pathwayTabs[(index + offset + pathwayTabs.length) % pathwayTabs.length];
    nextTab.focus();
    nextTab.click();
  });
});