export const validateIsEmpty = (rule, value, callback) => {
    if (value === "") {
        callback(new Error(i18n.t('validation.emptyValidation')));
    } else if (value === null) {
        callback(new Error(i18n.t('validation.numberValidation')));
    } else {
        callback();
    }
};

export const validateImageUrl = (rule, value, callback) => {
    if (typeof value !== "string") {
        callback(new Error(i18n.t("validation.urlValidation")));
    } else if (/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim.test(value)) {
        callback();
    } else {
        callback(new Error(i18n.t("validation.urlValidation")));
    }
};

export const validateEmail = (rule, value, callback) => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        callback();
    } else {
        // callback(new Error(i18n.t('validation.emailValidation')));
        callback(new Error(i18n.t("validation.emailValidation")));
    }
};

export const validatePassword = (rule, value, callback) => {
    if (value === "") {
        callback(new Error(i18n.t("validation.emptyPasswordValidation")));
    } else {
        callback();
    }
};
export const validateInt = (rule, value, callback) => {
    if (isNaN(parseInt(value))) {
        callback(new Error(i18n.t('validation.numberValidation')));
    } else {
        callback();
    }
};
export const validatePositiveInt = (rule, value, callback) => {
    if (isNaN(parseInt(value))) {
        callback(new Error(i18n.t('validation.numberValidation')));
    } else if (value === 0) {
        callback(new Error(i18n.t('validation.nonZeroNumberValidation')));
    } else {
        callback();
    }
};
export const validateFloat = (rule, value, callback) => {
    if (value === undefined) {
        callback();
    } else if (isNaN(parseFloat(value))) {
        callback(new Error(i18n.t('validation.numberValidation')));
    } else {
        callback();
    }
};
export const validatePositiveFloat = (rule, value, callback) => {
    if (value === undefined) {
        callback();
    } else if (isNaN(parseFloat(value))) {
        callback(new Error(i18n.t('validation.numberValidation')));
    } else if (value === 0) {
        callback(new Error(i18n.t('validation.nonZeroNumberValidation')));
    } else {
        callback();
    }
};