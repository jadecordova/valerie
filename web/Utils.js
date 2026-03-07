class Utils {

    static RemoveById(array, id) {
        return array.filter(item => item.id !== id);
    }

}