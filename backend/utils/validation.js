// autogest-app/backend/utils/validation.js

// Función para validar DNI/NIE español
const isValidDniNie = (value) => {
    const dniRegex = /^([0-9]{8}[A-Z])$/i;
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;
    value = value.toUpperCase();

    if (!dniRegex.test(value) && !nieRegex.test(value)) {
        return false;
    }

    const controlChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
    let number;

    if (nieRegex.test(value)) {
        const firstChar = value.charAt(0);
        let numPrefix;
        if (firstChar === 'X') numPrefix = '0';
        else if (firstChar === 'Y') numPrefix = '1';
        else if (firstChar === 'Z') numPrefix = '2';
        number = parseInt(numPrefix + value.substring(1, 8), 10);
    } else {
        number = parseInt(value.substring(0, 8), 10);
    }

    const calculatedChar = controlChars.charAt(number % 23);
    const providedChar = value.charAt(value.length - 1);

    return calculatedChar === providedChar;
};

// Función para validar CIF español
const isValidCif = (value) => {
    value = value.toUpperCase();
    if (!/^[A-Z][0-9]{8}$/.test(value)) {
        return false;
    }

    const controlDigit = value.charAt(value.length - 1);
    const numberPart = value.substring(1, 8);
    let sum = 0;

    for (let i = 0; i < numberPart.length; i++) {
        let num = parseInt(numberPart[i], 10);
        if (i % 2 === 0) { // Posiciones impares (índice par)
            num *= 2;
            sum += num < 10 ? num : Math.floor(num / 10) + (num % 10);
        } else { // Posiciones pares (índice impar)
            sum += num;
        }
    }

    const lastDigitOfSum = sum % 10;
    const calculatedControl = lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;
    
    if (/[A-Z]/.test(controlDigit)) { // Letra
        return String.fromCharCode(64 + calculatedControl) === controlDigit;
    } else { // Número
        return calculatedControl === parseInt(controlDigit, 10);
    }
};

module.exports = {
    isValidDniNie,
    isValidCif,
};