
// EEL FUNCTIONS
//----------------------------------------------------------------------------------------------------------
// Progress update from Python (e.g. update a progress bar)
eel.expose(update_progress);
function update_progress(current, total, message) {
    UI.UpdateProgressDialog(current, total, message);
}


// Final results from Python
eel.expose(show_results);
function show_results(data) {
    show_results_async(data).catch(error => {
        console.error('Error in show_results:', error);
    });
}

async function show_results_async(data) {
    try {
        let result = true;
        UI.HideDialog(UI.progressDialog);
        if ((data.new_stars && data.new_stars.length > 0) || (data.new_tags && data.new_tags.length > 0)) {
            result = await UI.ShowNewElementsDialog(data.new_stars, data.new_tags);
        }
        if (!result) return;
        await UI.AddNewElements();
        Movie.movies = data.videos.map(m => {
            m.disk = Movie.disk;
            m.container = Movie.container;
            const movie = new Movie(m);
            return movie;
        });
        console.log('Data received from Python:', Movie.movies);
        Movie.ShowMovies();
        UI.ShowConfirmImportButton();
    }
    catch (error) {
        console.error('Error in show_results:', error);
    }
}

eel.expose(update_folder);
function update_folder(folder) {
    Movie.folder = folder;
}

eel.expose(show_thumbnail_results);
function show_thumbnail_results(response) {
    UI.HideDialog(UI.progressDialog);
    console.log("Thumbnail generation results:", response);
    if (response?.results.length) {
        const cards = [...document.querySelectorAll('.movie-card')];
        response.results.forEach(result => {
            const movie = cards.find(c => c.movie.id === Number(result.folder)).movie;
            console.log('movie', movie);
            if (movie) {
                movie.CreateThumbnails(result.thumbs);
            }
        });
    }
}

//---------------------------------------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', async () => {
    UI.Init();
    await Star.Init();
    await Tag.Init();
});


//TODO: Search results. Movie card creation needs to be reworked to accept ids for stars and tags.