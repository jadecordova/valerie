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
        thumbnails = [],
        stars = [],
        tags = [],
        edited = false,
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
        this.thumbnails = thumbnails;
        this.stars = stars;
        this.tags = tags;
        this.edited = edited;
        this.success = success;

        this.GetCardElements();
        this.CreateMovieCard();
        this.UpdateInfo();
    }

    Export() {
        return {
            id: this.id,
            name: this.newNameContainer.value.trim(),
            originalFilename: this.originalFilename,
            extension: this.extension,
            score: Number(this.scoreContainer.value),
            disk: this.disk,
            container: this.container,
            special: this.special,
            size: this.size,
            width: this.width,
            height: this.height,
            duration: this.duration,
            codec: this.codec,
            fps: this.fps,
            stars: [...this.stars].map(star => star.id),
            tags: [...this.tags].map(tag => tag.id),
            success: this.success,
            edited: this.edited
        }
    }

    SetId(newId) {
        this.id = newId;
        this.idContainer.textContent = this.id;
        this.CreateNewName(); // Update new name to reflect new ID
    }

    deleteByNameOrTag(array, nameOrTag) {
        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            if (item.name === nameOrTag || item.tag === nameOrTag || item === nameOrTag) {
                array.splice(i, 1);
                return true; // Successfully found and deleted
            }
        }
        return false; // ID not found
    }

    CalculateScore() {
        this.score = 0;
        this.stars.forEach(star => {
            this.score += star.score;
        });
        this.tags.forEach(tag => {
            this.score += tag.score;
        });
        this.scoreContainer.value = this.score;
    }

    CreateNewName() {
        const stars = this.stars.length > 0 ? [...this.stars.map(star => star.name)].join(', ') : 'Unknown';
        const tags = this.tags.length > 0 ? [...this.tags.map(tag => tag.tag)].join(', ') + ' - ' : '';
        this.newName = `${stars} - ${tags}${this.score} - [${this.id}].${this.extension}`;
        this.newNameContainer.value = this.newName;
    }

    GetCardElements() {
        this.card = UI.GetElementFromTemplate('movie-card-template');
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
        this.editIcon = this.card.querySelector('.movie-card-edit-icon');
        this.deleteIcon = this.card.querySelector('.movie-card-delete-icon');
        this.validateIcon = this.card.querySelector('.movie-card-validate-icon');
        this.addStarButton = this.card.querySelector('.add-star-button');
        this.addTagButton = this.card.querySelector('.add-tag-button');
        this.thumbnailsContainer = this.card.querySelector('.movie-card-thumbnails');
    }

    CreateMovieCard(editable = true) {
        this.card.movie = this;
        this.idContainer.textContent = this.id;
        this.newNameContainer.value = this.newName || '';
        this.nameContainer.textContent = this.originalFilename;
        this.diskContainer.textContent = this.disk;
        this.containerContainer.textContent = this.container;
        this.scoreContainer.value = this.score;
        this.sizeContainer.textContent = this.size;
        this.dimensionsContainer.textContent = `${this.width}x${this.height}`;
        this.durationContainer.textContent = this.duration;
        this.codecContainer.textContent = this.codec;
        this.fpsContainer.textContent = this.fps;
        this.imageContainer.src = `${UI.MovieThumbsPath}${this.id}/poster.jpg`;
        if (this.special) this.specialIcon.classList.add('special-movie');

        this.PopulateMovieCardElements(Star);
        this.PopulateMovieCardElements(Tag);

        this.addStarButton.addEventListener('click', () => {
            UI.PopulateAddStarTagDialogSelect('stars');
            UI.ShowAddStarTagDialog(this, this.starsContainer, this.stars);
        });

        this.addTagButton.addEventListener('click', () => {
            UI.PopulateAddStarTagDialogSelect('tags');
            UI.ShowAddStarTagDialog(this, this.tagsContainer, this.tags);
        });

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

        this.editIcon.addEventListener('click', () => {
            //TODO: Implement edit functionality if needed
        });

        if (Movie.container == this.container) {
            this.card.classList.add('active-container');
        }
    }

    PopulateMovieCardElements(classRef) {
        const elements = classRef == Star ? this.stars : this.tags; // Ensure we're working with Sets
        const fragment = document.createDocumentFragment();
        const container = classRef == Star ? this.starsContainer : this.tagsContainer; // Determine the correct container
        container.innerHTML = '';
        elements.forEach(el => fragment.appendChild(el.CreateBadge(this)));
        container.appendChild(fragment);
    }

    UpdateInfo() {
        this.CalculateScore();
        this.CreateNewName();
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
        this.InitThumbnailDeleteIcon(thumbnail, imageName);
        this.InitThumbnailPosterIcon(thumbnail, imageName);
        this.thumbnailsContainer.appendChild(thumbnail);
    }

    InitThumbnailPosterIcon(thumbnail, filename) {
        const posterIcon = thumbnail.querySelector('.thumbnail-poster-icon');
        posterIcon.addEventListener('click', async (event) => {
            const result = await eel.Set_Poster(this.id, filename)();
            if (!result) {
                UI.ShowAlertDialog('Error', 'Failed to set thumbnail as poster.');
                return;
            }
            this.imageContainer.src = `${UI.MovieThumbsPath}${this.id}/poster.jpg`;
            this.CreateThumbnails(result.filter(name => name !== 'poster.jpg')); // Refresh thumbnails, excluding the new poster
        });
    }

    InitThumbnailDeleteIcon(thumbnail, filename) {
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
            const result = await eel.Delete_Thumbnail(this.id, filename)();
            if (!result) {
                UI.ShowAlertDialog('Error', 'Failed to delete thumbnail.');
                return;
            }
            thumbnail.remove();
        });
    }

    //---------------------------------------------------------------------------------------------------------- Static
    static movies = null;
    static maxId = 0;
    static disk = null;
    static container = null;
    static folder = null;

    static ShowMovies() {
        UI.moviesSection.innerHTML = '';
        const fragment = document.createDocumentFragment();
        Movie.movies.forEach(movie => {
            if (movie.thumbnails.length) {
                if (movie.thumbnails.includes('poster.jpg')) {
                    movie.imageContainer.src = `${UI.MovieThumbsPath}${movie.id}/poster.jpg`;
                }
                movie.CreateThumbnails(movie.thumbnails); // Ensure thumbnails are created for each movie
            }
            fragment.appendChild(movie.card);
        });
        UI.moviesSection.appendChild(fragment);
    }

    static async ShowFolderMoviesToImport() {
        Movie.maxId = await eel.Get_Max_Id('movies')(); // Get the max movie ID from the database for future additions
        UI.moviesSection.innerHTML = '';
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
        UI.moviesSection.appendChild(successfull);
        UI.moviesSection.appendChild(failed);
    }
}