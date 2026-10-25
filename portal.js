const resultTabs = document.querySelectorAll('.results-format-tab');
const resultPanels = document.querySelectorAll('.results-format-panel');

function selectResultsFormat(selectedTab) {
  resultTabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });
  resultPanels.forEach((panel) => {
    panel.hidden = panel.id !== selectedTab.getAttribute('aria-controls');
  });
}

resultTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectResultsFormat(tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = resultTabs[(index + offset + resultTabs.length) % resultTabs.length];
    nextTab.focus();
    selectResultsFormat(nextTab);
  });
});
