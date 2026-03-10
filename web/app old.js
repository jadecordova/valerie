




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

window.addEventListener('DOMContentLoaded', async () => {
    UI.Init();
    await Star.Init();
    await Tag.Init();
});
