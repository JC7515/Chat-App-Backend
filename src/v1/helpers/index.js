export const ConvertDateToHourFormat = (creationDateOfMessage) => {
    const dateOfCreation = new Date(creationDateOfMessage) 
    const hour = dateOfCreation.getHours()
    const minutes = dateOfCreation.getMinutes()
    const CreationHourOfMessage = `at ${hour}:${minutes}${hour > 12 ? 'PM' : 'AM'}`

    return CreationHourOfMessage
}

export const ConvertDateToDayFormat = (creationDateOfMessage) => {
    const dateOfCreation = new Date(creationDateOfMessage) 
    const actualDate = new Date()
    const creationdayOfMessage = dateOfCreation.getDay()
    
    const today = actualDate.getDay()
    const CreationDayOfMessage = `${creationdayOfMessage === today ? 'today' : creationdayOfMessage === today - 1 ? 'yesterday' : creationdayOfMessage}`

    return CreationDayOfMessage
}


export const GetTwoGroupInicials = (groupName) => {
    const lettersFromGroupName = groupName.split('')
    const firstTwoInitials = lettersFromGroupName.splice(0, 2)
    const InitialsToUpperCase = firstTwoInitials.map((initial) => initial.toUpperCase())
    const InitialsString = InitialsToUpperCase.join('')


    return InitialsString
}



export const GetCurrentDateString = () => {
    const date = new Date();

    // Obtenemos los componentes de la fecha
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Meses van de 0 a 11
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    // Creamos la cadena con el formato deseado
    const dateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

    return dateString
}


export const TransformDateToCorrectFormatString = (dateToTransform) => {
    const date = new Date(dateToTransform);

    // Obtenemos los componentes de la fecha
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Meses van de 0 a 11
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    // Creamos la cadena con el formato deseado
    const dateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

    return dateString
}
