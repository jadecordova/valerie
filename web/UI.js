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
        UI.setDiskContainerMenu = document.getElementById('set-disk-container-menu');
        UI.addStarMenu = document.getElementById('add-star-menu');

        // Disk and container dialog
        UI.diskContainerDialog = document.getElementById('disk-container-dialog');
        UI.diskContainerDialogHeader = document.getElementById('disk-container-dialog-header');
        UI.diskInput = document.getElementById('disk-input');
        UI.containerInput = document.getElementById('container-input');
        UI.diskContainerDialogCancelButton = document.getElementById('disk-container-dialog-cancel-button');
        UI.diskContainerDialogImportButton = document.getElementById('disk-container-dialog-ok-button');
        UI.diskContainerDialogSetButton = document.getElementById('disk-container-dialog-set-button');

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

        // Edit star dialog
        UI.editStarDialog = document.getElementById('edit-star-dialog');
        UI.editStarDialogName = document.getElementById('edit-star-dialog-name');
        UI.editStarDialogImage = document.getElementById('edit-star-dialog-image');
        UI.editStarDialogScore = document.getElementById('edit-star-dialog-score');
        UI.editStarDialogMovies = document.getElementById('edit-star-dialog-movies');
        UI.editStarDialogSpecial = document.getElementById('edit-star-dialog-special');
        UI.editStarDialogCancelButton = document.getElementById('edit-star-dialog-cancel-button');
        UI.editStarDialogOKButton = document.getElementById('edit-star-dialog-ok-button');
    }

    // Menu items
    static InitMenu() {
        UI.InitImportMoviesMenu();
        UI.InitSearchMoviesMenu();
        UI.InitSetDiskContainerMenu();
        UI.InitAddStarMenu();
        UI.InitKeyboardShortcuts();
    }

    static InitAddStarMenu() {
        UI.addStarMenu.addEventListener('click', () => {
            UI.ShowEditStarDialog(new Star({}));
        });
    }

    static InitSetDiskContainerMenu() {
        UI.setDiskContainerMenu.addEventListener('click', () => {
            UI.ShowDialog(UI.diskContainerDialog);
        });
    }

    static InitImportMoviesMenu() {
        UI.importMoviesMenu.addEventListener('click', () => {
            UI.ShowDialog(UI.diskContainerDialog);
        });
    }

    static InitSearchMoviesMenu() {
        UI.searchMoviesMenu.addEventListener('click', () => {
            UI.ShowDialog(UI.searchDialog);
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
            else if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                UI.ShowDialog(UI.diskContainerDialog);
            }
            else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                UI.ShowEditStarDialog(new Star({}));
            }
        });
    }

    // Disk and container dialog
    static InitDiskContainerDialog() {
        UI.InitDiskContainerDialogCancelButton();
        UI.InitDiskContainerDialogImportButton();
        UI.InitDiskContainerDialogSetButton();
    }

    static InitDiskContainerDialogCancelButton() {
        UI.diskContainerDialogCancelButton.addEventListener('click', () => {
            UI.HideDialog(UI.diskContainerDialog);
        });
    }

    static InitDiskContainerDialogSetButton() {
        UI.diskContainerDialogSetButton.addEventListener('click', () => {
            Movie.disk = UI.diskInput.value.trim();
            Movie.container = UI.containerInput.value.trim();
            UI.HideDialog(UI.diskContainerDialog);
        });
    }

    static InitDiskContainerDialogImportButton() {
        UI.diskContainerDialogImportButton.addEventListener('click', async () => {
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
                newTags.push(new Tag({ tag: tagName, score: score }));
            }
        });
        return newTags;
    }

    static CreateBadge(objectRef, movie) {
        const badge = UI.GetElementFromTemplate('badge-template');
        if (objectRef.edited) {
            badge.classList.add('edited');
        }
        badge.objectRef = objectRef;
        badge.textContent = objectRef.name || objectRef.tag;
        badge.addEventListener('click', event => {
            if (event.ctrlKey) {
                badge.remove();
                const type = objectRef instanceof Star ? 'stars' : 'tags';
                if (movie) {
                    movie[type] = movie[type].filter(el => el !== objectRef);
                    movie?.UpdateInfo();
                }
            }
        });
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
                        payload = Utils.RemoveById(payload, movie.id);
                    }
                });
                console.log('payload', payload);
            }

            const renamed = await eel.Rename_Movies(payload, Movie.folder)();
            const result = await eel.Insert_Movies(renamed)();

            Star.RefreshStars();

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
            console.log('selected', selected);
            if (selected.length) {
                selected.forEach(el => {
                    UI.addStarTagDialog.items?.push(el);
                    const badge = el.CreateBadge(UI.addStarTagDialog.movie);
                    UI.addStarTagDialog.container.appendChild(badge);
                });
                UI.addStarTagDialog.movie?.UpdateInfo();
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

    // Import results dialog
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
            console.log('Search values:', searchValues);
            const result = await eel.Get_Movies(
                searchValues.stars,
                searchValues.tags,
                searchValues.score,
                searchValues.disk,
                searchValues.container)();
            console.log('Search results:', result);
            if (result && result.length) {
                Movie.movies = result.map(m => {
                    m.stars = m.star_ids.map(s => Star.GetStarById(s));
                    m.tags = m.tag_ids.map(s => Tag.GetTagById(s));
                    return new Movie(m)
                });
                UI.HideDialog(UI.searchDialog);
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
        const stars = [...UI.searchDialogStars.querySelectorAll('.movie-card-badge')].map(badge => Number(badge.objectRef.id));
        const tags = [...UI.searchDialogTags.querySelectorAll('.movie-card-badge')].map(badge => Number(badge.objectRef.id));
        return { disk, container, score, stars, tags };
    }

    // Edit star dialog
    static InitEditStarDialog() {
        UI.InitEditStarDialogCancelButton();
        UI.InitEditStarDialogOKButton();
        UI.InitEditStarDialogSpecialButton();
    }

    static InitEditStarDialogCancelButton() {
        UI.editStarDialogCancelButton.addEventListener('click', () => {
            UI.HideDialog(UI.editStarDialog);
        });
    }

    static InitEditStarDialogSpecialButton() {
        UI.editStarDialogSpecial.addEventListener('click', () => {
            UI.editStarDialogSpecial.classList.toggle('special-star');
        });
    }

    static InitEditStarDialogOKButton() {
        UI.editStarDialogOKButton.addEventListener('click', async () => {
            if (!UI.editStarDialogName.value.trim()) {
                UI.ShowAlertDialog("Error", "Star name cannot be empty.");
                return;
            }
            const newStar = !UI.editStarDialog.star.id;
            const payload = {
                id: UI.editStarDialog.star.id,
                name: UI.editStarDialogName.value.trim(),
                score: parseInt(UI.editStarDialogScore.value) || 0,
                movies: parseInt(UI.editStarDialogMovies.value) || 0,
                special: UI.editStarDialogSpecial.classList.contains('special-star'),
                edited: true
            };
            const result = await eel.Add_Edit_Star(payload)();
            if (result && !result.error) {
                if (newStar) {
                    Star.stars.push(new Star(result));
                    Star.ShowStarCards();
                }
                else {
                    UI.editStarDialog.star.Update(result);
                }
                Star.CreateScoreMap();
            }
            UI.HideDialog(UI.editStarDialog);
        });
    }

    static ShowEditStarDialog(star) {
        UI.editStarDialog.star = star;
        UI.editStarDialogName.value = star.name;
        UI.editStarDialogScore.value = star.score;
        UI.editStarDialogImage.src = `${UI.StarThumbsPath}${star.id}`;
        UI.editStarDialogMovies.value = star.movies;
        if (star.special) {
            UI.editStarDialogSpecial.classList.add('special-star');
        }
        else {
            UI.editStarDialogSpecial.classList.remove('special-star');
        }
        UI.editStarDialog.showModal();
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
        UI.InitSearchDialog();
        UI.InitEditStarDialog();
    }

}