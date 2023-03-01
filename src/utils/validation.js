export const validateIsEmpty = (rule, value, callback) => {
    if (value === "") {
        callback(new Error(i18n.t("validation.emptyValidation")));
    } else if (value === null) {
        callback(new Error(i18n.t("validation.numberValidation")));
    } else {
        callback();
    }
};

export const validateNonEmptyImageUrl = (rule, value, callback) => {
    if (value === "") {
        callback();
    } else {
        validateImageUrl(rule, value, callback);
    }
};

// check if image exists in the url
export const checkIfImageExists = (url, callback) => {
    const img = new Image();
    img.src = url;
    if (img.complete) {
        callback(true);
    } else {
        img.onload = () => {
            callback(true);
        };
        img.onerror = () => {
            console.log("cannot get image");
            callback(false);
        };
    }
};

export const validateImageUrl = (rule, value, callback) => {
    if (typeof value !== "string") {
        callback(new Error(i18n.t("validation.urlValidation")));
    } else if (/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim.test(value)) {
        callback();
    } else {
        // check if the url is a proper image
        checkIfImageExists(value, (exists) => {
            if (exists) {
                callback();
            } else {
                callback(new Error(i18n.t("validation.urlValidation")));
            }
        });
    }
};

export const validateNonEmptyWebUrl = (rule, value, callback) => {
    if (value === "") {
        callback();
    } else {
        validateWebUrl(rule, value, callback);
    }
};

const isValidUrl = (urlString) => {
    try {
        return Boolean(new URL(urlString));
    } catch (e) {
        return false;
    }
};

export const validateWebUrl = (rule, value, callback) => {
    if (typeof value !== "string") {
        callback(new Error(i18n.t("validation.urlValidation")));
    } else if (isValidUrl(value)) {
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
        callback(new Error(i18n.t("validation.numberValidation")));
    } else {
        callback();
    }
};
export const validatePositiveInt = (rule, value, callback) => {
    if (isNaN(parseInt(value))) {
        callback(new Error(i18n.t("validation.numberValidation")));
    } else if (value === 0) {
        callback(new Error(i18n.t("validation.nonZeroNumberValidation")));
    } else {
        callback();
    }
};
export const validateFloat = (rule, value, callback) => {
    if (value === undefined) {
        callback();
    } else if (isNaN(parseFloat(value))) {
        callback(new Error(i18n.t("validation.numberValidation")));
    } else {
        callback();
    }
};
export const validatePositiveFloat = (rule, value, callback) => {
    if (value === undefined) {
        callback();
    } else if (isNaN(parseFloat(value))) {
        callback(new Error(i18n.t("validation.numberValidation")));
    } else if (value === 0) {
        callback(new Error(i18n.t("validation.nonZeroNumberValidation")));
    } else {
        callback();
    }
};
