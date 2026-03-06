class Movie {

    constructor({
        id = null,
        originalFilename = null,
        extension = null,
        score = 0,
        container = null,
        disk = null,
        special = false,
        size = null,
        width = null,
        height = null,
        duration = null,
        codec = null,
        fps = null,
        hasThumbnails = false,
        stars = [],
        tags = [],
        success = true
    } = {}) {
        this.id = id;
        this.originalFilename = originalFilename;
        this.extension = extension;
        this.score = score;
        this.container = container;
        this.disk = disk;
        this.special = special;
        this.size = size;
        this.width = width;
        this.height = height;
        this.duration = duration;
        this.codec = codec;
        this.fps = fps;
        this.card = null;
        this.hasThumbnails = hasThumbnails;
        this.stars = new Set(stars);
        this.tags = new Set(tags);
        this.success = success;

        this.CreateMovieCard();
        this.CalculateScore();
        this.CreateNewName();
    }

    GetCardElements() {
        this.idContainer = this.card.querySelector('.movie-card-id');
        this.newNameContainer = this.card.querySelector('.movie-card-new-name');
        this.nameContainer = this.card.querySelector('.movie-card-name');
        this.diskContainer = this.card.querySelector('.movie-card-disk');
        this.containerContainer = this.card.querySelector('.movie-card-container');
        this.scoreContainer = this.card.querySelector('.movie-card-score');
        this.starsContainer = this.card.querySelector('.stars-container');
        this.tagsContainer = this.card.querySelector('.tags-container');
        this.sizeContainer = this.card.querySelector('.movie-card-size');
        this.dimensionsContainer = this.card.querySelector('.movie-card-dimensions');
        this.durationContainer = this.card.querySelector('.movie-card-duration');
        this.codecContainer = this.card.querySelector('.movie-card-codec');
        this.fpsContainer = this.card.querySelector('.movie-card-fps');
        this.imageContainer = this.card.querySelector('.movie-card-image');
        this.specialIcon = this.card.querySelector('.movie-card-special-icon');
        this.deleteIcon = this.card.querySelector('.movie-card-delete-icon');
        this.validateIcon = this.card.querySelector('.movie-card-validate-icon');
        this.addStarButton = this.card.querySelector('.add-star-button');
        this.addTagButton = this.card.querySelector('.add-tag-button');
        this.thumbnailsContainer = this.card.querySelector('.movie-card-thumbnails');
    }

    CreateMovieCard() {
        this.card = UI.GetElementFromTemplate('movie-card-template');
        this.GetCardElements();
        this.PopulateMovieCardElements(this.stars, this.starsContainer, Star.GetStarIdByName);
        this.PopulateMovieCardElements(this.tags, this.tagsContainer, Tag.GetTagIdByName);

        this.addStarButton.addEventListener('click', () => {
            UI.PopulateAddStarTagDialogSelect('stars');
            UI.ShowAddStarTagDialog(this, this.starsContainer, this.stars);
        });

        this.addTagButton.addEventListener('click', () => {
            UI.PopulateAddStarTagDialogSelect('tags');
            UI.ShowAddStarTagDialog(this, this.tagsContainer, this.tags);
        });
        this.card.movie = this;
        this.idContainer.textContent = this.id;
        this.newNameContainer.value = this.newName || '';
        this.nameContainer.textContent = this.originalFilename;
        this.containerContainer.textContent = this.container;
        this.diskContainer.textContent = this.disk;
        this.scoreContainer.value = this.score;
        this.sizeContainer.textContent = this.size;
        this.dimensionsContainer.textContent = `${this.width}x${this.height}`;
        this.durationContainer.textContent = this.duration;
        this.codecContainer.textContent = this.codec;
        this.fpsContainer.textContent = this.fps;
        this.imageContainer.src = `${UI.MovieThumbsPath}${this.id}/poster.jpg`;
        if (this.special) this.specialIcon.classList.add('special-movie');

        this.specialIcon.addEventListener('click', () => {
            this.special = !this.special;
            this.specialIcon.classList.toggle('special-movie');
        });

        this.deleteIcon.addEventListener('click', async () => {
            const confirmed = await UI.ShowConfirmDialog('Delete Movie', `Are you sure you want to delete ${this.originalFilename}?`);
            if (!confirmed) return;
            this.card.remove();
            Movie.movies = UI.RemoveById(Movie.movies, this.id);
        });

        this.validateIcon.addEventListener('click', () => {
            this.success = !this.success;
            this.card.classList.toggle('failed-movie');
        });
    }

    CreateThumbnails(imageNames) {
        this.thumbnailsContainer.innerHTML = '';
        imageNames.forEach(imageName => {
            this.CreateThumbnail(imageName);
        });
    }

    CreateThumbnail(imageName) {
        const thumbnail = UI.GetElementFromTemplate('thumbnail-template');
        const img = thumbnail.querySelector('img');
        img.src = `${UI.MovieThumbsPath}${this.id}/${imageName}`;
        this.InitThumbnailDeleteIcon(thumbnail, this.id, imageName);
        this.InitThumbnailPosterIcon(thumbnail, this.id, imageName);
        this.thumbnailsContainer.appendChild(thumbnail);
    }

    InitThumbnailPosterIcon(thumbnail, movieID, filename) {
        const posterIcon = thumbnail.querySelector('.thumbnail-poster-icon');
        posterIcon.addEventListener('click', async (event) => {
            const result = await eel.Set_Poster(movieID, filename)();
            if (!result) {
                UI.ShowAlertDialog('Error', 'Failed to set thumbnail as poster.');
                return;
            }
            this.imageContainer.src = `${UI.MovieThumbsPath}${this.id}/poster.jpg`;
            this.CreateThumbnails(result.filter(name => name !== 'poster.jpg')); // Refresh thumbnails, excluding the new poster
            console.log('Result: ', result);
        });
    }

    InitThumbnailDeleteIcon(thumbnail, movieID, filename) {
        const deleteIcon = thumbnail.querySelector('.thumbnail-delete-icon');
        deleteIcon.addEventListener('click', async (event) => {
            // Bypass confirmation if Ctrl is held during click
            const bypassConfirmation = event.ctrlKey;   // true if Ctrl was pressed
            let confirmed = true;
            // Only show confirmation dialog if Ctrl is NOT pressed
            if (!bypassConfirmation) {
                confirmed = await UI.ShowConfirmDialog(
                    'Delete Thumbnail',
                    'Are you sure you want to delete this thumbnail?'
                );
            }
            if (!confirmed) return;
            // Proceed with deletion
            const img = thumbnail.querySelector('img');
            const result = await eel.Delete_Thumbnail(movieID, filename)();
            if (!result) {
                UI.ShowAlertDialog('Error', 'Failed to delete thumbnail.');
                return;
            }
            thumbnail.remove();
        });
    }

    Export() {
        return {
            id: this.id,
            name: this.newNameContainer.value.trim(),
            originalFilename: this.originalFilename,
            extension: this.extension,
            score: Number(this.scoreContainer.value),
            container: this.container,
            disk: this.disk,
            special: this.special,
            size: this.size,
            width: this.width,
            height: this.height,
            duration: this.duration,
            codec: this.codec,
            fps: this.fps,
            stars: [...this.stars].map(star => Star.GetStarIdByName(star)),
            tags: [...this.tags].map(tag => Tag.GetTagIdByName(tag)),
            success: this.success
        }
    }

    CalculateScore() {
        this.score = 0;
        this.stars.forEach(star => {
            this.score += Star.GetScore(star);
        });
        this.tags.forEach(tag => {
            this.score += Tag.GetScore(tag);
        });
        this.scoreContainer.value = this.score;
    }

    CreateNewName() {
        const stars = this.stars.size > 0 ? [...this.stars].join(', ') : 'Unknown';
        const tags = this.tags.size > 0 ? [...this.tags].join(', ') + ' - ' : '';

        this.newName = `${stars} - ${tags}${this.score} - [${this.id}].${this.extension}`;
        this.newNameContainer.value = this.newName;
    }

    SetId(newId) {
        this.id = newId;
        this.idContainer.textContent = this.id;
        this.CreateNewName(); // Update new name to reflect new ID
    }

    deleteByNameOrTag(set, nameOrTag) {
        for (const item of set) {
            if (item.name === nameOrTag || item.tag === nameOrTag || item === nameOrTag) {
                set.delete(item);
                return true; // Successfully found and deleted
            }
        }
        return false; // ID not found
    }

    PopulateMovieCardElements(elements, container, idFinder) {
        container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        elements.forEach(el => {
            const text = el.name || el.tag || el; // Support both star/tag objects and simple strings
            const id = idFinder ? idFinder(el) : el.id;
            const badge = Movie.CreateBadge(text, id, this, elements);
            fragment.appendChild(badge);
        });
        container.appendChild(fragment);
    }

    //---------------------------------------------------------------------------------------------------------- Static
    static movies = null;
    static maxId = 0;
    static disk = null;
    static container = null;
    static folder = null;

    static CreateBadge(text, id, movie, elements) {
        const badge = document.createElement('span');
        badge.textContent = text;
        badge.id = id;
        badge.classList.add('movie-card-badge', 'clickable');
        movie?.CalculateScore();
        movie?.CreateNewName();
        badge.addEventListener('click', (event) => {
            if (event.altKey) {
                movie?.deleteByNameOrTag(elements, text);
                movie?.CalculateScore();
                movie?.CreateNewName();
                event.target.remove();
            }
        });
        return badge;
    }

    static async ShowMovies() {
        Movie.maxId = await eel.Get_Max_Id('movies')(); // Get the max movie ID from the database for future additions
        UI.moviesContainer.innerHTML = '';
        const successfull = document.createDocumentFragment();
        const failed = document.createDocumentFragment();
        Movie.movies.forEach(movie => {
            movie.SetId(++Movie.maxId); // Assign a new unique ID to the movie
            if (movie.success) {
                successfull.appendChild(movie.card);
            } else {
                movie.card.classList.add('failed-movie');
                failed.appendChild(movie.card);
            }
        });
        UI.moviesContainer.appendChild(successfull);
        UI.moviesContainer.appendChild(failed);
    }

    static async Init() {
        await Movie.ShowMovies();
    }
}

