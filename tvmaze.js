"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShows(term) {
  
  let result = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
  let resultArray = [];

  for (let show of result.data) {
    resultArray.push(
      {
        id: show.show.id,
        name: show.show.name,
        summary: show.show.summary,
        image: (show.show.image === null) ? 'https://tinyurl.com/tv-missing' : show.show.image.medium
      }
    )
  }
  return resultArray;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="Bletchly Circle San Francisco" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await searchShows(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  let result = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  let resultArray = [];

  for (let episode of result.data) {
    resultArray.push(
      {
        id: episode.id,
        name: episode.name,
        season: episode.season,
        number: episode.number
      }
    )
  }
  return resultArray;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $episodesArea.empty();

  for (let episode of episodes) {
    const $episode = $(`
        <li>${episode.name} (Season ${episode.season}, number ${episode.number})</li>
      `);

      $episodesArea.append($episode);
    }
}

$('#shows-list').on('click', '.btn-sm', async function(evt){
  let id = $(evt.target).closest('.Show').data('show-id');
  const episodes = await getEpisodes(id);
  $episodesArea.show();
  populateEpisodes(episodes);
})
