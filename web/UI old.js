class UI {



    static GetElements() {

        // Menu
        UI.menu = document.getElementById('menu');


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


    }

    static InitSearchMoviesMenu() {
        UI.searchMoviesMenu.addEventListener('click', () => {
            UI.ShowDialog(UI.searchDialog);
        });
    }


    static InitMenu() {
        UI.InitKeyboardShortcuts();
        UI.InitSearchMoviesMenu();
        UI.InitConfirmImportButton();
        UI.InitAddStarMenu();
    }


    // Import movies menu item

    static InitAddStarMenu() {
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
        UI.GetElements();
        UI.InitMenu();
        UI.InitSearchDialog();
        UI.InitAddStarTagDialog();
        UI.InitDiskContainerDialog();
        UI.InitAlertDialog();
        UI.InitProgressDialog();
    }
}