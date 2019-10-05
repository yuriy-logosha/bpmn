'use strict';
const chars_en = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    chars_ru = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯЪЬ";

function _charIndex(lng) {
    let possible = (!lng || lng === 'en')?chars_en:chars_ru;
    return Math.floor(Math.random() * possible.length);
}

function _makeChar(lng, idx) {
    let possible = (!lng || lng === 'en')?chars_en:chars_ru;
    return possible.charAt(idx);
}


module.exports = {
    isValidFileName: function(fileName) {
        let regex = /[\w-\w]/g;
        if(fileName.length === fileName.match(regex).length) {
            return true;
        }
        return false;
    },
    charIndex: function(lng) {
        return _charIndex(lng);
    },
    makeChar: function(lng, idx) {
        return _makeChar(lng, idx);
    }
};