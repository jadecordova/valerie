class Star {

    constructor({
        id = null,
        name = null,
        score = 0,
        special = false,
        movies = 0
    } = {}) {
        this.id = id;
        this.name = name;
        this.score = score;
        this.special = special;
        this.movies = movies;
        this.card = null;

        this.CreateStarCard();
    }

    Export() {
        return {
            id: this.id,
            name: this.name,
            score: this.score,
            special: this.special,
            movies: this.movies
        };
    }

    CreateStarCard() {
        const starCard = UI.GetElementFromTemplate('star-card-template');

        starCard.starId = this.id; // Store the star ID on the card element for easy access
        starCard.querySelector('.star-card-name').textContent = this.name;
        starCard.querySelector('.star-card-id').textContent = this.id;
        starCard.querySelector('.star-card-score').textContent = this.score;
        starCard.querySelector('.star-card-movies').textContent = this.movies;
        starCard.querySelector('.star-card-image').src = `${UI.StarThumbsPath}${this.id}`;
        if (this.special) starCard.querySelector('.star-card-special').classList.add('special-star');

        this.card = starCard;
    }

    // Update `special` state on the existing card (safe to call after construction)
    setSpecial(isSpecial) {
        this.special = !!isSpecial;
        if (!this.card) return;
        const el = this.card.querySelector('.star-card-special');
        if (el) el.classList.toggle('special-star', this.special);
    }

    // Static
    //-------------------------------------------------------------------------------------------------------
    static stars = null;

    static async GetStars() {
        const data = await eel.Get_Stars()();
        Star.stars = data.map(s => new Star(s));
    }


    static ShowStarCards() {
        UI.starsContainer.innerHTML = ''; // Clear existing content
        const fragment = document.createDocumentFragment();
        Star.stars.forEach(star => {
            fragment.appendChild(star.card);
        });
        UI.starsContainer.appendChild(fragment);
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

    static GetStarIdByName(name) {
        const star = Star.stars.find(s => s.name === name);
        return star ? star.id : null;
    }

    static GetScore(starName) {
        return Star.scoreMap.get(starName) || 0;
    }

    static async Init() {
        await Star.GetStars();
        Star.CreateScoreMap();
        Star.ShowStarCards();
    }

    static SortStars(by = 'name', ascending = true) {
        const compare = (a, b) => {
            if (a[by] < b[by]) return ascending ? -1 : 1;
            if (a[by] > b[by]) return ascending ? 1 : -1;
            return 0;
        };
        Star.stars.sort(compare);
    }
}