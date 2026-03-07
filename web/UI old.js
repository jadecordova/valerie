class UI {

    static StarThumbsPath = './val/';
    static MovieThumbsPath = './lin/';

    // Utility functions
    //----------------------------------------------------------------------------------------------------------





    static ShowSearchDialog() {
        UI.searchDialog.showModal();
    }



    // Disk and container dialog
    //----------------------------------------------------------------------------------------------------------

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

    static InitDiskContainerDialog() {
        UI.GetDiskContainerDialogElements();
        UI.InitDiskContainerDialogCancelButton();
        UI.InitDiskContainerDialogOKButton();
    }

    static ShowDiskContainerDialog() {
        UI.diskContainerDialog.showModal();
    }

    // Confirm dialog 
    //----------------------------------------------------------------------------------------------------------

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

    static InitConfirmDialog() {
        UI.GetConfirmDialogElements();
    }

    // Alert elements dialog
    //----------------------------------------------------------------------------------------------------------

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

    static InitAlertDialog() {
        UI.GetAlertDialogElements();
        UI.InitAlertDialogOKButton();
    }

    // New elements dialog
    //----------------------------------------------------------------------------------------------------------

    static GetNewStarsFromDialog() {
        const newStars = [];
        const starRows = UI.newStarsList.querySelectorAll('.new-star-row');
        starRows.forEach(row => {
            const starName = row.querySelector('.new-element-name').value.trim();
            if (starName) {
                const isSpecial = row.querySelector('.special-icon').parentElement.classList.contains('new-star-special');
                const score = parseInt(row.querySelector('.new-element-score').value) || 0;
                newStars.push({ name: starName, special: isSpecial, score: score, movies: 0 });
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
                newTags.push({ tag: tagName, score: score });
            }
        });
        return newTags;
    }

    static async AddNewElements() {
        const newStars = UI.GetNewStarsFromDialog();
        const newTags = UI.GetNewTagsFromDialog();

        try {
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
            console.error(err);
        }
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

    static InitNewElementsDialogCancelButton() {
        UI.newElementsDialogCancelButton.addEventListener('click', () => {
            UI.newElementsDialog.close();
        });
    }

    static InitNewElementsDialog() {
        UI.GetNewElementsDialogElements();
        UI.InitNewElementsDialogCancelButton();
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

    // Progress dialog elements
    //----------------------------------------------------------------------------------------------------------

    static InitProgressDialogOKButton() {
        UI.progressDialogOKButton.addEventListener('click', () => {
            UI.HideDialog(UI.progressDialog);
        });
    }

    static InitProgressDialog() {
        UI.GetProgressDialogElements();
        UI.InitProgressDialogOKButton();
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

    // Toolbar elements and buttons
    //----------------------------------------------------------------------------------------------------------
    static GetToolBarElements() {
        UI.ImportMoviesButton = document.getElementById('select-folder-button');
        UI.ConfirmImportMoviesButton = document.getElementById('confirm-import-movies-button');
        UI.SearchButton = document.getElementById('search-button');
    }

    static ShowConfirmImportButton() {
        UI.ConfirmImportMoviesButton.classList.remove('display-none');
    }

    static HideConfirmImportButton() {
        UI.ConfirmImportMoviesButton.classList.add('display-none');
    }

    static InitConfirmImportButton() {

        UI.ConfirmImportMoviesButton.addEventListener('click', async () => {
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

    static InitImportMoviesButton() {
        UI.ImportMoviesButton.addEventListener('click', async () => {
            UI.ShowDiskContainerDialog();
        });
    }

    static InitSearchButton() {
        UI.SearchButton.addEventListener('click', async () => {
            UI.ShowSearchDialog();
        });
    }

    static InitToolbarButtons() {
        UI.InitImportMoviesButton();
        UI.InitConfirmImportButton();
        UI.InitSearchButton();
    }

    static InitToolbar() {
        UI.GetToolBarElements();
        UI.InitToolbarButtons();
    }

    static CreateImportResultsDataBlock(elements, blockTitle) {
        const fragment = document.createDocumentFragment();
        const header = document.createElement('h4');
        const rule = document.createElement('hr');
        header.textContent = blockTitle;
        fragment.appendChild(header);
        fragment.appendChild(rule);
        elements.forEach(el => {
            const div = document.createElement('div');
            div.classList.add('import-results-data-item');
            div.textContent = el.name || el.originalName || el;
            fragment.appendChild(div);
        });
        return fragment;
    }

    static ShowImportResultsDialog(data) {
        UI.infoDialogHeader.textContent = 'Import Results';

        const summary = document.createElement('div');
        summary.classList.add('import-results-summary');
        summary.innerHTML = `
            <p>Successful Imports: ${data.successful.length}</p>
            <p>Failed Renames: ${data.failedRename.length}</p>
            <p>Failed Inserts: ${data.failedInsert.length}</p>
        `;
        if (data.successful.length) {
            summary.appendChild(UI.CreateImportResultsDataBlock(data.successful, 'Successful Imports'));
        }
        if (data.failedRename.length) {
            summary.appendChild(UI.CreateImportResultsDataBlock(data.failedRename, 'Failed Renames'));
        }
        if (data.failedInsert.length) {
            summary.appendChild(UI.CreateImportResultsDataBlock(data.failedInsert, 'Failed Inserts'));
        }
        UI.infoDialogMessage.innerHTML = '';
        UI.infoDialogMessage.appendChild(summary);
        return new Promise((resolve) => {
            UI.infoDialogOKButton.addEventListener('click', () => {
                UI.HideDialog(UI.infoDialog);
                resolve(true);
            });
            UI.infoDialog.showModal();
        });
    }

    static Init() {
        UI.GetMainElements();
        UI.InitToolbar();
        UI.InitNewElementsDialog();
        UI.InitProgressDialog();
        UI.InitAlertDialog();
        UI.InitDiskContainerDialog();
        UI.InitAddStarTagDialog();
        UI.InitConfirmDialog();
        UI.InitInfoDialog();
        UI.InitSearchDialog();
    }
}