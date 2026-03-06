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

    static async GetTags() {
        const data = await eel.Get_Tags()();
        Tag.tags = data.map(t => new Tag(t));
    }

    static GetScore(tagName) {
        return Tag.scoreMap.get(tagName) || 0;
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

    static async Init() {
        await Tag.GetTags();
        Tag.CreateScoreMap();
    }

}