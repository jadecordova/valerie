eel.expose(update_folder);
function update_folder(folder) {
    Movie.folder = folder;
}

eel.expose(update_progress);
function update_progress(current, total, message) {
    UI.UpdateProgressDialog(current, total, message);
}

eel.expose(show_results);
function show_results(data) {
    show_results_async(data).catch(error => {
        console.error('Error in show_results:', error);
    });
}

async function show_results_async(data) {
    try {
        UI.HideDialog(UI.progressDialog);
        let result = true;
        if (data.new_stars?.length || data.new_tags?.length) {
            result = await UI.ShowNewElementsDialog(data.new_stars, data.new_tags);
        }
        if (!result) return;
        await UI.AddNewElements();
        Movie.movies = data.videos.map(m => {
            m.disk = Movie.disk;
            m.container = Movie.container;
            m.stars = m.stars.map(s => Star.GetStarByName(s));
            m.tags = m.tags.map(t => Tag.GetTagByName(t));
            return new Movie(m);
        });
        Movie.ShowFolderMoviesToImport();
        UI.ShowConfirmImportButton();
    }
    catch (error) {
        console.error('Error in show_results:', error);
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    UI.Init();
    await Star.Init();
    await Tag.Init();
});
