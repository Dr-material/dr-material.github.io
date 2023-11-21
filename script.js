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
  
    return pagevideos.map((video) => {
      const isSoundMaterial = video['title'].startsWith('#音效素材');
      var filename = isSoundMaterial ? 'mp3' : 'mp4';
      return `
        <a href="https://www.youtube.com/watch?v=${video['href']}" class="container" target="_blank">
          <div class="text">
            <h2>${video['title']}</h2>
            <span class="download-btn" data-filename="${video['title']}.${filename}" onClick="download(event)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cloud-arrow-down-fill" viewBox="0 0 16 16">
                <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 6.854-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5a.5.5 0 0 1 1 0v3.793l1.146-1.147a.5.5 0 0 1 .708.708z"/>
              </svg>
              下載 
            </span>
          </div>
          <span class="box">
            <img src="https://i.ytimg.com/vi/${video['href']}/mqdefault.jpg">
          </span>
        </a>`;
    }).join('');
  }
  
  // 新增下載函式
  function download(event) {
    event.preventDefault(); 
    var filename = event.target.getAttribute('data-filename');
    const path = filename[1]+filename[2]+filename[3]+filename[4]
    filename = encodeURIComponent(filename)
    console.log(path)
    window.open(`https://github.com/Dr-material/material/raw/main/${path}/${filename}`)
  }
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
