const videos = [];
fetch('videos.csv')
  .then((response) => response.text())
  .then((csv) => {
    const rows = csv.trim().split('\n');
    const headers = rows.shift().split(',');
    rows.forEach((row) => {
      const values = row.split(',');
      const video = {};
      headers.forEach((header, i) => (video[header] = values[i]));
      videos.push(video);
    });

    
    rendervideos(generatevideoHTML(videos, 1)); 
    renderPaginationButtons(videos); 
  });

function generatevideoHTML(targetvideos, page) {
  const startIndex = (page - 1) * 10;
  const endIndex = startIndex + 10;
  const pagevideos = targetvideos.slice(startIndex, endIndex);

  return pagevideos
    .map(
      (video) =>
        `<a href="https://www.youtube.com/watch?v=${video['href']}" class="container" target="_blank">
            <div class="text">
              <h2>${video['title']}</h2>
            </div>
            <span class="box">
              <img src="https://i.ytimg.com/vi/${video['href']}/mqdefault.jpg">
            </span>
          </a>`
    )
    .join('');
}
// https://i.ytimg.com/vi/uz6G4yiqLT0/mqdefault.jpg
function rendervideos(targetHTML) {
  const videoList = document.querySelector('[data-videos]');
  videoList.innerHTML = targetHTML;
}

function renderPaginationButtons(targetvideos) {
  const totalPages = Math.ceil(targetvideos.length / 10);
  const paginationContainer = document.querySelector('.pagination');
  paginationContainer.dataset.currentPage = 1; 

  paginationContainer.innerHTML = ''; 

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement('button');
    button.textContent = page;
    button.dataset.page = page;
    button.classList.add('pagination-button');
    if (page === 1) {
      button.classList.add('current-page'); 
    }
    paginationContainer.appendChild(button);
  }

  document.querySelectorAll('.pagination-button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const page = parseInt(e.target.dataset.page);
      const searchInput = document.querySelector('[data-videofinder-form] input[name="search"]');
      const searchValue = searchInput.value;
      rendervideos(generatevideoHTML(videosFilter(searchValue), page)); 
      paginationContainer.dataset.currentPage = page; 
      updateCurrentPageButtonStyle(paginationContainer, page); 
    });
  });
}

function videosFilter(targetvideo, allvideos = videos) {
  if (targetvideo.trim() === '') {
    return allvideos;
  }
  return allvideos.filter((video) => {
    const regex = new RegExp(targetvideo, 'i');
    return Object.values(video).some((value) => regex.test(value));
  });
}

document.querySelector('[data-videofinder-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const searchInput = e.target.search;
  const searchValue = searchInput.value;
  rendervideos(generatevideoHTML(videosFilter(searchValue), 1)); 
  renderPaginationButtons(videosFilter(searchValue)); 
  searchInput.value = searchValue; 
});

function updateCurrentPageButtonStyle(paginationContainer, currentPage) {
  const buttons = paginationContainer.querySelectorAll('.pagination-button');
  buttons.forEach((button) => {
    button.classList.remove('current-page');
  });

  const currentPageButton = paginationContainer.querySelector(`button[data-page="${currentPage}"]`);
  if (currentPageButton) {
    currentPageButton.classList.add('current-page');
  }
}
