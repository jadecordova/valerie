class Star {

    constructor({
        id = null,
        name = null,
        score = 0,
        special = false,
        movies = 0,
        edited = false,
    } = {}) {
        this.id = id;
        this.name = name;
        this.score = score;
        this.special = special;
        this.movies = movies;
        this.edited = edited;
        this.card = null;

        this.GetStarCardElements();
        this.CreateStarCard();
    }

    Export() {
        return {
            id: this.id,
            name: this.name,
            score: this.score,
            special: this.special,
            movies: this.movies,
            edited: this.edited
        }
    }

    GetStarCardElements() {

        this.card = UI.GetElementFromTemplate('star-card-template');
        this.idContainer = this.card.querySelector('.star-card-id');
        this.nameContainer = this.card.querySelector('.star-card-name');
        this.scoreContainer = this.card.querySelector('.star-card-score');
        this.moviesContainer = this.card.querySelector('.star-card-movies');
        this.imageContainer = this.card.querySelector('.star-card-image');
        this.specialIcon = this.card.querySelector('.star-card-special-icon');
        this.editIcon = this.card.querySelector('.star-card-edit-icon');
        this.deleteIcon = this.card.querySelector('.star-card-delete-icon');
        this.cleanEditedStatusButton = this.card.querySelector('.star-card-top');
    }

    CreateStarCard() {
        this.card.starId = this.id; // Store the star ID on the card element for easy access
        this.nameContainer.textContent = this.name;
        this.idContainer.textContent = this.id;
        this.scoreContainer.textContent = this.score;
        this.moviesContainer.textContent = this.movies;
        this.imageContainer.src = `${UI.StarThumbsPath}${this.id}`;
        if (this.special) this.specialIcon.classList.add('special-star');
        if (this.edited) this.card.classList.add('edited');

        this.InitStarCardSpecialIcon();
        this.InitStarCardEditIcon();
        this.InitStarCardDeleteIcon();
        this.InitStarCardCleanEditedStatus();
    }

    InitStarCardCleanEditedStatus() {
        this.cleanEditedStatusButton.addEventListener('click', async () => {
            if (!this.edited) return;
            const confirmed = await UI.ShowConfirmDialog('Clean Edited Status', `Are you sure you want to clean the edited status for star "${this.name}"?`);
            if (!confirmed) return;
            const result = await eel.Clean_Edited_Status(this.id)();
            if (result) {
                this.edited = false;
                this.card.classList.remove('edited');
            } else {
                console.error('Failed to clean edited status for star:', this.name);
            }
        });
    }

    InitStarCardDeleteIcon() {
        this.deleteIcon.addEventListener('click', async () => {
            const confirmed = await UI.ShowConfirmDialog('Delete Star', `Are you sure you want to delete star "${this.name}"?`);
            if (!confirmed) return;
            const result = await eel.Delete_Star(this.id)();
            if (result) {
                this.card.remove();
                Star.stars = Star.stars.filter(s => s.id !== this.id);
                Star.CreateScoreMap();
            } else {
                console.error('Failed to delete star:', this.name);
            }
        });
    }

    InitStarCardEditIcon() {
        this.editIcon.addEventListener('click', () => {
            UI.ShowEditStarDialog(this);
        });
    }

    InitStarCardSpecialIcon() {
        this.specialIcon.addEventListener('click', async () => {
            this.special = !this.special;
            this.specialIcon.classList.toggle('special-star');
            const result = await eel.Set_Special_Status(this.id, this.special)();
            if (!result) {
                console.error('Failed to update special status:');
                this.special = !this.special;
                this.specialIcon.classList.toggle('special-star');
            }
        });
    }

    Update(data) {
        this.name = data.name;
        this.score = data.score;
        this.movies = data.movies;
        this.special = data.special;
        this.edited = data.edited;
        this.card.classList.add('edited');
        this.UpdateCard();
        Star.CreateScoreMap();
        console.log(this);
    }

    UpdateCard() {
        this.nameContainer.textContent = this.name;
        this.scoreContainer.textContent = this.score;
        this.moviesContainer.textContent = this.movies;
        if (this.special) {
            this.specialIcon.classList.add('special-star');
        } else {
            this.specialIcon.classList.remove('special-star');
        }
    }


    CreateBadge(movie) {
        return UI.CreateBadge(this, movie);
    }

    //-------------------------------------------------------------------------------------------------------
    static stars = null;

    static async GetStars() {
        const data = await eel.Get_Stars()();
        Star.stars = data.map(s => new Star(s));
    }

    static ShowStarCards() {
        UI.starsSection.innerHTML = ''; // Clear existing content
        const fragment = document.createDocumentFragment();
        Star.stars.forEach(star => {
            fragment.appendChild(star.card);
        });
        UI.starsSection.appendChild(fragment);
    }

    static async RefreshStars() {
        await Star.GetStars();
        Star.ShowStarCards();
        Star.CreateScoreMap();
    }

    static CreateScoreMap() {
        Star.scoreMap = new Map();
        Star.stars.forEach(star => {
            Star.scoreMap.set(star.name, star.score);
        });
    }

    static SortStars(by = 'name', ascending = true) {
        const compare = (a, b) => {
            if (a[by] < b[by]) return ascending ? -1 : 1;
            if (a[by] > b[by]) return ascending ? 1 : -1;
            return 0;
        };
        Star.stars.sort(compare);
    }

    static GetStarIdByName(name) {
        const star = Star.stars.find(s => s.name === name);
        return star ? star.id : null;
    }

    static GetStarNameById(id) {
        const star = Star.stars.find(s => s.id === id);
        return star ? star.name : null;
    }

    static GetStarById(id) {
        return Star.stars.find(s => s.id === id);
    }

    static GetStarByName(name) {
        return Star.stars.find(s => s.name === name);
    }

    static async Init() {
        await Star.GetStars();
        Star.CreateScoreMap();
        Star.ShowStarCards();
    }
}