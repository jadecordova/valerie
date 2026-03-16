class Tag {

    constructor({
        id = null,
        tag = null,
        score = 0
    } = {}) {
        this.id = id;
        this.tag = tag;
        this.score = score;
    }

    CreateBadge(movie) {
        return UI.CreateBadge(this, movie);
    }

    // Static
    static async GetTags() {
        const data = await eel.Get_Tags()();
        Tag.tags = data.map(t => new Tag(t));
    }

    static CreateScoreMap() {
        Tag.scoreMap = new Map();
        Tag.tags.forEach(tag => {
            Tag.scoreMap.set(tag.tag, tag.score);
        });
    }

    static GetTagIdByName(name) {
        const tag = Tag.tags.find(t => t.tag === name);
        return tag ? tag.id : null;
    }

    static GetTagNameById(id) {
        const tag = Tag.tags.find(t => t.id === id);
        return tag ? tag.tag : null;
    }

    static GetTagByName(name) {
        return Tag.tags.find(t => t.tag === name) || null;
    }

    static GetTagById(id) {
        return Tag.tags.find(t => t.id === id) || null;
    }
    q
    static async Init() {
        await Tag.GetTags();
        Tag.CreateScoreMap();
    }

}