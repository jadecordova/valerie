class Movie {



    CreateMovieCard() {






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

