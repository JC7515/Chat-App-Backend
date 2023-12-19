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


