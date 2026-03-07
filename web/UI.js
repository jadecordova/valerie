class UI {

    static StarThumbsPath = './val/';
    static MovieThumbsPath = './lin/';

    static HideDialog(dialog) {
        dialog.close();
    }

    static ShowDialog(dialog) {
        dialog.showModal();
    }

    static GetElementFromTemplate(templateId) {
        const template = document.getElementById(templateId);
        return template.content.cloneNode(true).firstElementChild;
    }

    static GetElements() {

        // Menu
        UI.menu = document.getElementById('menu');
        UI.importMoviesMenu = document.getElementById('import-movies-menu');
        UI.searchMoviesMenu = document.getElementById('search-movies-menu');
        UI.addStarMenu = document.getElementById('add-star-menu');

        // Main sections
        UI.starsSection = document.getElementById('stars-section');
        UI.moviesSection = document.getElementById('movies-section');

        // Search dialog
        UI.searchDialog = document.getElementById('search-dialog');
        UI.searchDialogDisk = UI.searchDialog.querySelector('#search-disk');
        UI.searchDialogContainer = UI.searchDialog.querySelector('#search-container');
        UI.searchDialogScore = UI.searchDialog.querySelector('#search-score');
        UI.searchDialogStars = UI.searchDialog.querySelector('#stars-container');
        UI.searchDialogTags = UI.searchDialog.querySelector('#tags-container');
        UI.searchDialogAddStarButton = UI.searchDialog.querySelector('#add-star-button');
        UI.searchDialogAddTagButton = UI.searchDialog.querySelector('#add-tag-button');
        UI.searchDialogSearchButton = UI.searchDialog.querySelector('#search-dialog-search-button');
        UI.searchDialogCancelButton = UI.searchDialog.querySelector('#search-dialog-cancel-button');

        // Info dialog
        UI.infoDialog = document.getElementById('info-dialog');
        UI.infoDialogHeader = document.getElementById('info-dialog-header');
        UI.infoDialogMessage = document.getElementById('info-dialog-message');
        UI.infoDialogOKButton = document.getElementById('info-dialog-ok-button');

        // Add star/tag dialog
        UI.addStarTagDialog = document.getElementById('add-star-tag-dialog');
        UI.addStarTagDialogHeader = document.getElementById('add-star-tag-dialog-header');
        UI.addStarTagDialogSelect = document.getElementById('add-star-tag-dialog-select');
        UI.addStarTagDialogCancelButton = document.getElementById('add-star-tag-dialog-cancel-button');
        UI.addStarTagDialogOKButton = document.getElementById('add-star-tag-dialog-ok-button');

        // Disk and container dialog
        UI.diskContainerDialog = document.getElementById('disk-container-dialog');
        UI.diskContainerDialogHeader = document.getElementById('disk-container-dialog-header');
        UI.diskInput = document.getElementById('disk-input');
        UI.containerInput = document.getElementById('container-input');
        UI.diskContainerDialogCancelButton = document.getElementById('disk-container-dialog-cancel-button');
        UI.diskContainerDialogOKButton = document.getElementById('disk-container-dialog-ok-button');

        // Confirm dialog
        UI.confirmDialog = document.getElementById('confirm-dialog');
        UI.confirmDialogHeader = document.getElementById('confirm-dialog-header');
        UI.confirmDialogMessage = document.getElementById('confirm-dialog-message');
        UI.confirmDialogCancelButton = document.getElementById('confirm-dialog-cancel-button');
        UI.confirmDialogOKButton = document.getElementById('confirm-dialog-ok-button');

        // Alert dialog
        UI.alertDialog = document.getElementById('alert-dialog');
        UI.alertDialogHeader = document.getElementById('alert-dialog-header');
        UI.alertDialogMessage = document.getElementById('alert-dialog-message');
        UI.alertDialogOKButton = document.getElementById('alert-dialog-ok-button');

        // New elements dialog
        UI.newElementsDialog = document.getElementById('new-elements-dialog');
        UI.newElementsDialogHeader = document.getElementById('new-elements-dialog-header');
        UI.newElementsDialogStarsMessage = document.getElementById('new-elements-dialog-stars-message');
        UI.newElementsDialogTagsMessage = document.getElementById('new-elements-dialog-tags-message');
        UI.newStarsList = document.getElementById('new-stars-list');
        UI.newTagsList = document.getElementById('new-tags-list');
        UI.newElementsDialogCancelButton = document.getElementById('new-elements-dialog-cancel-button');
        UI.newElementsDialogOKButton = document.getElementById('new-elements-dialog-ok-button');

        // Progress dialog
        UI.progressDialog = document.getElementById('progress-dialog');
        UI.progressDialogHeader = document.getElementById('progress-dialog-header');
        UI.progressDialogMessage = document.getElementById('progress-dialog-message');
        UI.progressDialogProgressBar = document.querySelector('#progress-dialog #progress-bar');
        UI.progressDialogOKButton = document.getElementById('progress-dialog-ok-button');
    }

    // Search dialog
    static InitSearchDialog() {
        UI.InitSearchDialogAddStarButton();
        UI.InitSearchDialogAddTagButton();
        UI.InitSearchDialogCancelButton();
        UI.InitSearchDialogSearchButton();
    }

    static InitSearchDialogAddStarButton() {
        UI.searchDialogAddStarButton.addEventListener('click', () => {
            UI.PopulateAddStarTagDialogSelect('stars');
            UI.ShowAddStarTagDialog(null, UI.searchDialogStars, null);
        });
    }

    static InitSearchDialogAddTagButton() {
        UI.searchDialogAddTagButton.addEventListener('click', () => {
            UI.PopulateAddStarTagDialogSelect('tags');
            UI.ShowAddStarTagDialog(null, UI.searchDialogTags, null);
        });
    }

    static InitSearchDialogCancelButton() {
        UI.searchDialogCancelButton.addEventListener('click', () => {
            UI.HideDialog(UI.searchDialog);
        });
    }

    static InitSearchDialogSearchButton() {
        UI.searchDialogSearchButton.addEventListener('click', async () => {
            const searchValues = UI.GetSearchDialogValues();
            const result = await eel.Get_Movies(
                searchValues.stars,
                searchValues.tags,
                searchValues.score,
                searchValues.disk,
                searchValues.container)();
            console.log('Search results:', result);
            if (result && result.length) {
                Movie.movies = result.map(m => new Movie(m));
                Movie.ShowMovies();
            }
            else {
                UI.ShowAlertDialog("No Results", "No movies found matching the search criteria.");
            }
        });
    }

    static GetSearchDialogValues() {
        const disk = UI.searchDialogDisk.value.trim();
        const container = UI.searchDialogContainer.value.trim();
        const score = parseInt(UI.searchDialogScore.value) || 0;
        const stars = [...UI.searchDialogStars.querySelectorAll('.movie-card-badge')].map(badge => Number(badge.id));
        const tags = [...UI.searchDialogTags.querySelectorAll('.movie-card-badge')].map(badge => Number(badge.id));
        return { disk, container, score, stars, tags };
    }

    // Info dialog
    static ShowInfoDialog(header, message) {
        UI.infoDialogHeader.textContent = header;
        UI.infoDialogMessage.textContent = message;
        UI.infoDialog.showModal();
    }

    // Add star/tag dialog
    static InitAddStarTagDialog() {
        UI.InitAddStarTagDialogCancelButton();
        UI.InitAddStarTagDialogOKButton();
    }

    static InitAddStarTagDialogCancelButton() {
        UI.addStarTagDialogCancelButton.addEventListener('click', () => {
            UI.HideDialog(UI.addStarTagDialog);
        });
    }

    static PopulateAddStarTagDialogSelect(selector) {
        const elements = selector == 'stars' ? Star.stars : Tag.tags;
        const property = selector == 'stars' ? 'name' : 'tag';

        UI.addStarTagDialogSelect.innerHTML = '';
        UI.addStarTagDialogHeader.textContent = `Add new ${selector}`

        elements.forEach(el => {
            const option = document.createElement('option');
            option.value = el.id;
            option.textContent = el[property];
            option.objectRef = el;
            UI.addStarTagDialogSelect.appendChild(option);
        });
    }

    static InitAddStarTagDialogOKButton() {
        UI.addStarTagDialogOKButton.addEventListener('click', () => {
            const selected = [...UI.addStarTagDialogSelect.selectedOptions].map(option => option.objectRef);
            if (selected.length) {
                const container = UI.addStarTagDialog.container;
                selected.forEach(el => {
                    UI.addStarTagDialog.items?.add(el.text);
                    //TODO: Now we're passing the star or tag object to CreateBadge. NEEDS UPDATE.
                    const badge = Movie.CreateBadge(el, UI.addStarTagDialog.movie, UI.addStarTagDialog.items);
                    container.appendChild(badge);
                });
                UI.HideDialog(UI.addStarTagDialog);
            }
        });
    }

    static ShowAddStarTagDialog(movie, container, items) {
        UI.addStarTagDialog.movie = movie;
        UI.addStarTagDialog.container = container;
        UI.addStarTagDialog.items = items;
        UI.addStarTagDialog.showModal();
    }

    // Disk and container dialog
    static InitDiskContainerDialog() {
        UI.InitDiskContainerDialogCancelButton();
        UI.InitDiskContainerDialogOKButton();
    }

    static InitDiskContainerDialogOKButton() {
        UI.diskContainerDialogOKButton.addEventListener('click', async () => {
            Movie.disk = UI.diskInput.value.trim();
            Movie.container = UI.containerInput.value.trim();
            if (Movie.disk && Movie.container) {
                UI.HideConfirmImportButton();
                // Pass the values back to the caller (e.g., MovieCard)
                const result = await eel.Import_Videos()();
                if (result && result.status == 'started') {
                    UI.ShowProgressDialog("Importing Videos", "Please wait while videos are being imported...", 100);
                }
                UI.HideDialog(UI.diskContainerDialog);
            } else {
                UI.ShowAlertDialog("Error", "Please enter both disk and container.");
            }
        });
    }

    static InitDiskContainerDialogCancelButton() {
        UI.diskContainerDialogCancelButton.addEventListener('click', () => {
            UI.HideDialog(UI.diskContainerDialog);
        });
    }

    // Confirm dialog 
    static ShowConfirmDialog(title, message) {
        UI.confirmDialogHeader.textContent = title;
        UI.confirmDialogMessage.textContent = message;
        return new Promise((resolve) => {
            UI.confirmDialogOKButton.addEventListener('click', () => {
                UI.HideDialog(UI.confirmDialog);
                resolve(true);
            });
            UI.confirmDialogCancelButton.addEventListener('click', () => {
                UI.HideDialog(UI.confirmDialog);
                resolve(false);
            });
            UI.confirmDialog.onclose = () => {
                resolve(false);
            };

            UI.confirmDialog.showModal();
        });
    }

    // Alert dialog
    static InitAlertDialog() {
        UI.InitAlertDialogOKButton();
    }

    static InitAlertDialogOKButton() {
        UI.alertDialogOKButton.addEventListener('click', () => {
            UI.HideDialog(UI.alertDialog);
        });
    }

    static ShowAlertDialog(header, message) {
        UI.alertDialogHeader.textContent = header;
        UI.alertDialogMessage.textContent = message;
        UI.alertDialog.showModal();
    }

    // Progress dialog
    static InitProgressDialog() {
        UI.InitProgressDialogOKButton();
    }

    static InitProgressDialogOKButton() {
        UI.progressDialogOKButton.addEventListener('click', () => {
            UI.HideDialog(UI.progressDialog);
        });
    }

    static ShowProgressDialog(header, message, max = 100) {
        UI.progressDialogHeader.textContent = header;
        UI.progressDialogMessage.textContent = message;
        UI.progressDialogOKButton.disabled = true;
        UI.progressDialogProgressBar.value = 0;
        UI.progressDialogProgressBar.max = max;
        UI.progressDialog.showModal();
    }

    static UpdateProgressDialog(progress, max = 100, message = "") {
        UI.progressDialogMessage.textContent = message;
        UI.progressDialogProgressBar.value = progress;
        UI.progressDialogProgressBar.max = max;
    }

    // New elements dialog


    static Init() {
        UI.GetElements();
        UI.InitSearchDialog();
        UI.InitAddStarTagDialog();
        UI.InitDiskContainerDialog();
        UI.InitAlertDialog();
        UI.InitProgressDialog();
    }
}