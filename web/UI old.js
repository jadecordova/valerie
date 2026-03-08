class UI {


    static ShowSearchDialog() {
        UI.searchDialog.showModal();
    }

    static ShowDiskContainerDialog() {
        UI.diskContainerDialog.showModal();
    }


    // Alert dialog
    //----------------------------------------------------------------------------------------------------------



    // New elements dialog
    //----------------------------------------------------------------------------------------------------------









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