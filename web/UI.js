class UI {

    static StarThumbsPath = './val/';
    static MovieThumbsPath = './lin/';

    static ShowDialog(dialog) {
        dialog.showModal();
    }

    static HideDialog(dialog) {
        dialog.close();
    }

    static GetElementFromTemplate(templateId) {
        const template = document.getElementById(templateId);
        return template.content.cloneNode(true).firstElementChild;
    }

    static GetElements() {

        // Main sections
        UI.starsSection = document.getElementById('stars');
        UI.moviesSection = document.getElementById('movies');

        // Menu
        UI.importMoviesMenu = document.getElementById('import-movies-menu');
        UI.confirmImportMoviesButton = document.getElementById('confirm-import-movies-button');
        UI.searchMoviesMenu = document.getElementById('search-movies-menu');
        UI.addStarMenu = document.getElementById('add-star-menu');

        // Disk and container dialog
        UI.diskContainerDialog = document.getElementById('disk-container-dialog');
        UI.diskContainerDialogHeader = document.getElementById('disk-container-dialog-header');
        UI.diskInput = document.getElementById('disk-input');
        UI.containerInput = document.getElementById('container-input');
        UI.diskContainerDialogCancelButton = document.getElementById('disk-container-dialog-cancel-button');
        UI.diskContainerDialogOKButton = document.getElementById('disk-container-dialog-ok-button');

        // Progress dialog
        UI.progressDialog = document.getElementById('progress-dialog');
        UI.progressDialogHeader = document.getElementById('progress-dialog-header');
        UI.progressDialogMessage = document.getElementById('progress-dialog-message');
        UI.progressDialogProgressBar = document.querySelector('#progress-dialog #progress-bar');
        UI.progressDialogOKButton = document.getElementById('progress-dialog-ok-button');

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

        // Add star/tag dialog
        UI.addStarTagDialog = document.getElementById('add-star-tag-dialog');
        UI.addStarTagDialogHeader = document.getElementById('add-star-tag-dialog-header');
        UI.addStarTagDialogSelect = document.getElementById('add-star-tag-dialog-select');
        UI.addStarTagDialogCancelButton = document.getElementById('add-star-tag-dialog-cancel-button');
        UI.addStarTagDialogOKButton = document.getElementById('add-star-tag-dialog-ok-button');

        // Confirm dialog
        UI.confirmDialog = document.getElementById('confirm-dialog');
        UI.confirmDialogHeader = document.getElementById('confirm-dialog-header');
        UI.confirmDialogMessage = document.getElementById('confirm-dialog-message');
        UI.confirmDialogCancelButton = document.getElementById('confirm-dialog-cancel-button');
        UI.confirmDialogOKButton = document.getElementById('confirm-dialog-ok-button');

        // Info dialog
        UI.infoDialog = document.getElementById('info-dialog');
        UI.infoDialogHeader = document.getElementById('info-dialog-header');
        UI.infoDialogMessage = document.getElementById('info-dialog-message');
        UI.infoDialogOKButton = document.getElementById('info-dialog-ok-button');

    }

    // Menu items
    static InitMenu() {
        UI.InitImportMoviesMenu();
        UI.InitKeyboardShortcuts();
    }

    static InitImportMoviesMenu() {
        UI.importMoviesMenu.addEventListener('click', () => {
            UI.ShowDialog(UI.diskContainerDialog);
        });
    }

    static InitKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                UI.ShowDialog(UI.diskContainerDialog);
            }
            else if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                UI.ShowDialog(UI.searchDialog);
            }
        });
    }

    // Disk and container dialog
    static InitDiskContainerDialog() {
        UI.InitDiskContainerDialogCancelButton();
        UI.InitDiskContainerDialogOKButton();
    }

    static InitDiskContainerDialogCancelButton() {
        UI.diskContainerDialogCancelButton.addEventListener('click', () => {
            UI.HideDialog(UI.diskContainerDialog);
        });
    }

    static InitDiskContainerDialogOKButton() {
        UI.diskContainerDialogOKButton.addEventListener('click', async () => {
            Movie.disk = UI.diskInput.value.trim();
            Movie.container = UI.containerInput.value.trim();
            if (Movie.disk && Movie.container) {
                UI.HideDialog(UI.diskContainerDialog);
                const result = await eel.Import_Videos()();
                if (result && result.status == 'started') {
                    UI.ShowProgressDialog("Importing Videos", "Please wait while videos are being imported...", 0);
                }
            } else {
                UI.ShowAlertDialog("Error", "Please enter both disk and container.");
            }
        });
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

    // New elements dialog
    static InitNewElementsDialog() {
        UI.InitNewElementsDialogCancelButton();
    }

    static InitNewElementsDialogCancelButton() {
        UI.newElementsDialogCancelButton.addEventListener('click', () => {
            UI.newElementsDialog.close();
        });
    }

    static InitNewElementsDialogSpecialButton(starRow) {
        const specialButton = starRow.querySelector('.special-icon').parentElement;
        specialButton.addEventListener('click', () => {
            specialButton.classList.toggle('new-star-special');
        });
    }

    static InitNewElementsDialogRemoveButton(row, listElement, messageElement) {
        const removeButton = row.querySelector('.delete-icon').parentElement;
        removeButton.addEventListener('click', () => {
            row.remove();
            if (listElement.children.length === 0) {
                messageElement.style.display = 'none';
                listElement.style.display = 'none';
            }
        });
    }

    static ShowNewElementsDialog(stars, tags) {
        if ((!stars || stars.length === 0) && (!tags || tags.length === 0)) {
            return;
        }

        UI.newStarsList.innerHTML = '';
        UI.newTagsList.innerHTML = '';

        if (stars && stars.length) {
            stars.forEach(star => {
                const newStarRow = UI.GetElementFromTemplate('new-element-row-template');
                newStarRow.classList.add('new-star-row');
                newStarRow.querySelector('.new-element-name').value = star;
                UI.InitNewElementsDialogSpecialButton(newStarRow);
                UI.InitNewElementsDialogRemoveButton(newStarRow, UI.newStarsList, UI.newElementsDialogStarsMessage);
                UI.newStarsList.appendChild(newStarRow);
            });
        }
        else {
            UI.newElementsDialogStarsMessage.style.display = 'none';
            UI.newStarsList.style.display = 'none';
        }
        if (tags && tags.length) {
            tags.forEach(tag => {
                const newTagRow = UI.GetElementFromTemplate('new-element-row-template');
                newTagRow.classList.add('new-tag-row');
                newTagRow.querySelector('.new-element-name').value = tag;
                const specialIcon = newTagRow.querySelector('.special-icon').parentElement;
                specialIcon.style.display = 'none';
                specialIcon.style.pointerEvents = 'none';
                specialIcon.style.cursor = 'default';
                UI.InitNewElementsDialogRemoveButton(newTagRow, UI.newTagsList, UI.newElementsDialogTagsMessage);
                UI.newTagsList.appendChild(newTagRow);
            });
        }
        else {
            UI.newElementsDialogTagsMessage.style.display = 'none';
            UI.newTagsList.style.display = 'none';
        }

        return new Promise((resolve) => {
            UI.newElementsDialogOKButton.addEventListener('click', () => {
                UI.HideDialog(UI.newElementsDialog);
                resolve(true);
            });
            UI.newElementsDialogCancelButton.addEventListener('click', () => {
                UI.HideDialog(UI.newElementsDialog);
                resolve(false);
            });
            UI.newElementsDialog.onclose = () => {
                resolve(false);
            };

            UI.newElementsDialog.showModal();
        });
    }

    static async AddNewElements() {
        const newStars = UI.GetNewStarsFromDialog();
        const newTags = UI.GetNewTagsFromDialog();

        try {
            //TODO: Check what the Add_New_Elements function is expecting now that we're passing full objects instead of just names. NEEDS UPDATE.
            const result = await eel.Add_New_Elements(newStars, newTags)();
            if (result && result.error) {
                UI.ShowAlertDialog("Error", result.error);
                console.error('Insert error:', result.error);
            } else {
                Star.stars = result.stars.map(s => new Star(s));
                Tag.tags = result.tags.map(t => new Tag(t));
                Star.CreateScoreMap();
                Tag.CreateScoreMap();
                Star.ShowStarCards();
                UI.HideDialog(UI.alertDialog);
                UI.HideDialog(UI.newElementsDialog);
            }
        } catch (err) {
            UI.ShowAlertDialog("Error", "Error: " + err);
        }
    }

    static GetNewStarsFromDialog() {
        const newStars = [];
        const starRows = UI.newStarsList.querySelectorAll('.new-star-row');
        starRows.forEach(row => {
            const starName = row.querySelector('.new-element-name').value.trim();
            if (starName) {
                const isSpecial = row.querySelector('.special-icon').parentElement.classList.contains('new-star-special');
                const score = parseInt(row.querySelector('.new-element-score').value) || 0;
                //TODO: We're now returning a full star object. NEEDS UPDATE.
                newStars.push(new Star({ name: starName, special: isSpecial, score: score, movies: 0 }));
            }
        });
        return newStars;
    }

    static GetNewTagsFromDialog() {
        const newTags = [];
        const tagRows = UI.newTagsList.querySelectorAll('.new-tag-row');
        tagRows.forEach(row => {
            const tagName = row.querySelector('.new-element-name').value.trim();
            if (tagName) {
                const score = parseInt(row.querySelector('.new-element-score').value) || 0;
                //TODO: We're now returning a full tag object. NEEDS UPDATE.
                newTags.push(new Tag({ tag: tagName, score: score }));
            }
        });
        return newTags;
    }

    static CreateBadge(objectRef) {
        const badge = UI.GetElementFromTemplate('badge-template');
        badge.objectRef = objectRef;
        badge.textContent = objectRef.name || objectRef.tag;
        return badge;
    }

    // Confirm import button
    static InitConfirmImportButton() {

        UI.confirmImportMoviesButton.addEventListener('click', async () => {
            let payload = [];
            Movie.movies.forEach(movie => {
                payload.push(movie.Export());
            });
            const failedMovies = payload.filter(movie => !movie.success);
            if (failedMovies.length) {
                const confirm = await UI.ShowConfirmDialog('Fialed movies', 'There are invalid movies in the container. They will be removed.');
                if (!confirm) return;
                failedMovies.forEach(movie => {
                    if (!movie.success) {
                        Movie.movies.find(m => m.id === movie.id).card.remove();
                        payload = UI.RemoveById(payload, movie.id);
                    }
                });
                console.log('payload', payload);
            }
            const renamed = await eel.Rename_Movies(payload, Movie.folder)();
            const result = await eel.Insert_Movies(renamed)();
            Star.RefreshStars();
            console.log('Result: ', result);
            await UI.ShowImportResultsDialog(result);
            const moviesToGenerate = result.successful.map(m => m.name);
            const thumbsResult = await eel.Generate_Thumbnails(moviesToGenerate, Movie.folder)();
            if (thumbsResult && thumbsResult.status === 'started') {
                UI.ShowProgressDialog("Generating Thumbnails", "Please wait while thumbnails are being generated...", 100);
            }
        });
    }

    static ShowConfirmImportButton() {
        UI.confirmImportMoviesButton.classList.remove('display-none');
    }

    static HideConfirmImportButton() {
        UI.confirmImportMoviesButton.classList.add('display-none');
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

    static InitAddStarTagDialogOKButton() {
        UI.addStarTagDialogOKButton.addEventListener('click', () => {
            const selected = [...UI.addStarTagDialogSelect.selectedOptions].map(option => option.objectRef);
            if (selected.length) {
                selected.forEach(el => {
                    UI.addStarTagDialog.items?.push(el);
                    const badge = el.CreateBadge();
                    UI.addStarTagDialog.container.appendChild(badge);
                });
                UI.addStarTagDialog.movie?.CalculateScore();
                UI.addStarTagDialog.movie?.CreateNewName();
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

    // Info dialog
    static ShowInfoDialog(header, message) {
        UI.infoDialogHeader.textContent = header;
        UI.infoDialogMessage.textContent = message;
        UI.infoDialog.showModal();
    }

    static Init() {
        UI.GetElements();
        UI.InitMenu();
        UI.InitDiskContainerDialog();
        UI.InitProgressDialog();
        UI.InitAlertDialog();
        UI.InitNewElementsDialog();
        UI.InitAddStarTagDialog();
        UI.InitConfirmImportButton();
    }

}