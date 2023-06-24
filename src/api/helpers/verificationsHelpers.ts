

export function verifyIdCardNumber(number){
    const numberStr = number.toString();

    if(numberStr.length != 8) return false;

    const coeficents = [2, 9, 8, 7, 6, 3, 4];
    const verifiedDigit = number % 10;

    let firstDigits = Math.floor(number / 10);
    let sum = 0;
    let index = coeficents.length - 1;

    while(firstDigits > 0){
        let actualNumber = firstDigits % 10;
        sum += coeficents[index--] * actualNumber;
        firstDigits = Math.floor(firstDigits / 10);
    }
    
    const newVerifiedDigit = 10 - (sum % 10);
    return verifiedDigit == newVerifiedDigit;
}